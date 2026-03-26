type GithubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
};

export function getAdminCredentials() {
  return {
    id: process.env.ADMIN_ID || "admin",
    password: process.env.ADMIN_PASSWORD || "admin1234",
  };
}

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "mighty-blessing-admin-session-secret";
}

export function getGithubConfig(): GithubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !owner || !repo) {
    return null;
  }

  return { token, owner, repo, branch };
}

export function isGithubConfigured() {
  return getGithubConfig() !== null;
}

