import fs from "fs/promises";
import path from "path";
import { base64ToBytes, bytesToBase64 } from "./base64";
import { checkExpectedFiles, EditConflict } from "./revision";
import { getGithubConfig } from "./env";

export type RepositoryChangeSet = {
  message: string;
  expectedFiles?: Record<string, string | null>;
  upserts: { path: string; contentBase64: string }[];
  deletes: string[];
};

export interface AdminRepository {
  assertWritable?(): void;
  listFiles(prefix: string): Promise<string[]>;
  readFile(filePath: string): Promise<string | null>;
  commitChanges(changeSet: RepositoryChangeSet): Promise<{ commitSha?: string } | void>;
}

async function listLocalFiles(directory: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          return listLocalFiles(fullPath);
        }
        return [fullPath];
      }),
    );

    return files.flat();
  } catch {
    return [];
  }
}

const localWrites = new Map<string, Promise<unknown>>();

class LocalRepository implements AdminRepository {
  constructor(private readonly rootDir: string, private readonly writable: boolean) {}

  assertWritable() {
    if (!this.writable) {
      throw new Error("GitHub 저장소 설정이 준비되지 않아 저장할 수 없습니다. 운영 담당자에게 설정 확인을 요청해 주세요.");
    }
  }

  async listFiles(prefix: string) {
    const fullPath = path.join(this.rootDir, prefix);
    const files = await listLocalFiles(fullPath);
    return files.map((filePath) => path.relative(this.rootDir, filePath).replace(/\\/g, "/"));
  }

  async readFile(filePath: string) {
    try {
      const bytes = await fs.readFile(path.join(this.rootDir, filePath));
      return bytesToBase64(bytes);
    } catch {
      return null;
    }
  }

  async commitChanges(changeSet: RepositoryChangeSet) {
    this.assertWritable();
    const previous = localWrites.get(this.rootDir) || Promise.resolve();
    const write = previous.catch(() => {}).then(async () => {
      await checkExpectedFiles(changeSet.expectedFiles, file => this.readFile(file));
      for (const file of changeSet.upserts) {
        const absolutePath = path.join(this.rootDir, file.path);
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, base64ToBytes(file.contentBase64));
      }

      for (const filePath of changeSet.deletes) {
        try {
          await fs.unlink(path.join(this.rootDir, filePath));
        } catch {
          // ignore missing files in local mode
        }
      }
    });
    localWrites.set(this.rootDir, write);
    try { await write; } finally { if (localWrites.get(this.rootDir) === write) localWrites.delete(this.rootDir); }
  }
}

class GithubRequestError extends Error {
  constructor(public readonly status: number) { super(`GitHub request failed: ${status}`); }
}

type GithubBlobResponse = {
  sha: string;
};

class GithubRepository implements AdminRepository {
  constructor(
    private readonly token: string,
    private readonly owner: string,
    private readonly repo: string,
    private readonly branch: string,
  ) {}

  private async request<T>(pathname: string, init?: RequestInit) {
    const response = await fetch(`https://api.github.com${pathname}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new GithubRequestError(response.status);
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  }

  private async getBranchState() {
    const ref = await this.request<{ object: { sha: string } }>(
      `/repos/${this.owner}/${this.repo}/git/ref/heads/${this.branch}`,
    );
    const commit = await this.request<{ tree: { sha: string } }>(
      `/repos/${this.owner}/${this.repo}/git/commits/${ref.object.sha}`,
    );

    return {
      commitSha: ref.object.sha,
      treeSha: commit.tree.sha,
    };
  }

  async listFiles(prefix: string) {
    const branchState = await this.getBranchState();
    const tree = await this.request<{ tree: { path: string; type: string }[] }>(
      `/repos/${this.owner}/${this.repo}/git/trees/${branchState.treeSha}?recursive=1`,
    );

    return tree.tree
      .filter((entry) => entry.type === "blob" && entry.path.startsWith(prefix))
      .map((entry) => entry.path);
  }

  async readFile(filePath: string, ref = this.branch) {
    const safePath = filePath.split("/").map(encodeURIComponent).join("/");

    try {
      const file = await this.request<{ content: string; encoding: string }>(
        `/repos/${this.owner}/${this.repo}/contents/${safePath}?ref=${encodeURIComponent(ref)}`,
      );

      if (file.encoding === "base64") {
        return file.content.replace(/\n/g, "");
      }

      return null;
    } catch (error) {
      if (error instanceof GithubRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async commitChanges(changeSet: RepositoryChangeSet) {
    if (changeSet.upserts.length === 0 && changeSet.deletes.length === 0) {
      return;
    }

    const branchState = await this.getBranchState();
    // Read at the exact parent commit; force:false below closes the check/write race.
    await checkExpectedFiles(changeSet.expectedFiles, file => this.readFile(file, branchState.commitSha));
    const blobs = await Promise.all(
      changeSet.upserts.map((file) =>
        this.request<GithubBlobResponse>(`/repos/${this.owner}/${this.repo}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({
            content: file.contentBase64,
            encoding: "base64",
          }),
        }),
      ),
    );

    const tree = await this.request<{ sha: string }>(`/repos/${this.owner}/${this.repo}/git/trees`, {
      method: "POST",
      body: JSON.stringify({
        base_tree: branchState.treeSha,
        tree: [
          ...changeSet.upserts.map((file, index) => ({
            path: file.path,
            mode: "100644",
            type: "blob",
            sha: blobs[index].sha,
          })),
          ...changeSet.deletes.map((filePath) => ({
            path: filePath,
            mode: "100644",
            type: "blob",
            sha: null,
          })),
        ],
      }),
    });

    const commit = await this.request<{ sha: string }>(`/repos/${this.owner}/${this.repo}/git/commits`, {
      method: "POST",
      body: JSON.stringify({
        message: changeSet.message,
        tree: tree.sha,
        parents: [branchState.commitSha],
      }),
    });

    try {
      await this.request(`/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`, {
        method: "PATCH",
        body: JSON.stringify({
          sha: commit.sha,
          force: false,
        }),
      });
    } catch (error) {
      if (error instanceof GithubRequestError && [409, 422].includes(error.status)) throw new EditConflict();
      throw error;
    }
    return { commitSha: commit.sha };
  }
}

export function getAdminRepository(): AdminRepository {
  const github = getGithubConfig();
  if (github) {
    return new GithubRepository(github.token, github.owner, github.repo, github.branch);
  }

  return new LocalRepository(process.cwd(), process.env.NODE_ENV === "development");
}
