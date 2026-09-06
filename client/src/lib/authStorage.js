const STORAGE_KEY = 'token';

function readLegacyToken() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getToken() {
  try {
    const sessionToken = sessionStorage.getItem(STORAGE_KEY);
    if (sessionToken) return sessionToken;

    const legacyToken = readLegacyToken();
    if (!legacyToken) return null;

    sessionStorage.setItem(STORAGE_KEY, legacyToken);
    localStorage.removeItem(STORAGE_KEY);
    return legacyToken;
  } catch {
    return null;
  }
}

export function setToken(token) {
  sessionStorage.setItem(STORAGE_KEY, token);
  localStorage.removeItem(STORAGE_KEY);
}

export function clearToken() {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
}
