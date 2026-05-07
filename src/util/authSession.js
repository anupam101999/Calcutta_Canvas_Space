const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const SESSION_EXPIRES_AT_KEY = "sessionExpiresAt";
const TOKEN_KEY = "token";
const LEGACY_TOKEN_KEY = "auth_token";
const USER_KEY = "user";
const USER_ID_KEY = "userId";

export function startAuthSession({ token, user }) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  localStorage.setItem(SESSION_EXPIRES_AT_KEY, String(expiresAt));

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (user.id) localStorage.setItem(USER_ID_KEY, user.id);
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(SESSION_EXPIRES_AT_KEY);
  localStorage.removeItem("notifications");
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function hasValidAuthSession() {
  const expiresAt = Number(localStorage.getItem(SESSION_EXPIRES_AT_KEY));
  const hasUser = Boolean(localStorage.getItem(USER_KEY));

  if (!hasUser || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    clearAuthSession();
    return false;
  }

  return true;
}
