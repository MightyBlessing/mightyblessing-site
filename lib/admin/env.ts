type GithubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
};

const developmentCredentials = { id: "admin", password: "admin1234" };
const developmentSessionSecret = "mighty-blessing-admin-session-secret";
const unsafeSessionSecrets = new Set([developmentSessionSecret, "change-this-secret"]);

function configuredValue(name: string) {
  const value = process.env[name];
  return value?.trim() ? value : null;
}

export function getAdminCredentials() {
  const development = process.env.NODE_ENV === "development";
  const id = configuredValue("ADMIN_ID") || (development ? developmentCredentials.id : null);
  const password = configuredValue("ADMIN_PASSWORD") || (development ? developmentCredentials.password : null);
  if (!id || !password || (!development && password === developmentCredentials.password)) return null;
  return { id, password };
}

export function getAdminSessionSecret() {
  const development = process.env.NODE_ENV === "development";
  const secret = configuredValue("ADMIN_SESSION_SECRET") || (development ? developmentSessionSecret : null);
  if (!secret || (!development && unsafeSessionSecrets.has(secret))) return null;
  return secret;
}

export function getAdminAuthConfig() {
  const credentials = getAdminCredentials();
  const secret = getAdminSessionSecret();
  return credentials && secret ? { ...credentials, secret } : null;
}

export function getGithubConfig(): GithubConfig | null {
  const token = configuredValue("GITHUB_TOKEN");
  const owner = configuredValue("GITHUB_OWNER");
  const repo = configuredValue("GITHUB_REPO");
  const branch = configuredValue("GITHUB_BRANCH") || "main";

  if (!token || !owner || !repo) {
    return null;
  }

  return { token, owner, repo, branch };
}

export function isGithubConfigured() {
  return getGithubConfig() !== null;
}
