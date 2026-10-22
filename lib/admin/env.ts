type GithubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
};

/** Local development signs in as this address without Google. It is never allowed outside development. */
export const DEVELOPMENT_ADMIN_EMAIL = "local-admin@localhost";
const developmentSessionSecret = "mighty-blessing-admin-session-secret";
const unsafeSessionSecrets = new Set([developmentSessionSecret, "change-this-secret"]);

function configuredValue(name: string) {
  const value = process.env[name];
  return value?.trim() ? value : null;
}

export function isDevelopmentLoginEnabled() {
  return process.env.NODE_ENV === "development";
}

/** Google accounts allowed into the admin, from comma- or space-separated `ADMIN_EMAILS`. */
export function getAdminEmails() {
  const emails = (configuredValue("ADMIN_EMAILS") || "").split(/[\s,]+/).map(email => email.trim().toLowerCase()).filter(Boolean);
  if (isDevelopmentLoginEnabled()) emails.push(DEVELOPMENT_ADMIN_EMAIL);
  return emails.length ? emails : null;
}

export function getAdminSessionSecret() {
  const development = process.env.NODE_ENV === "development";
  const secret = configuredValue("ADMIN_SESSION_SECRET") || (development ? developmentSessionSecret : null);
  if (!secret || (!development && unsafeSessionSecrets.has(secret))) return null;
  return secret;
}

export function getAdminAuthConfig() {
  const emails = getAdminEmails();
  const secret = getAdminSessionSecret();
  return emails && secret ? { emails, secret } : null;
}

export function getGoogleOAuthConfig() {
  const clientId = configuredValue("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = configuredValue("GOOGLE_OAUTH_CLIENT_SECRET");
  return clientId && clientSecret ? { clientId: clientId.trim(), clientSecret: clientSecret.trim() } : null;
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
