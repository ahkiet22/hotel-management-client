function normalizeApiUrl(value: string, fallback: string): string {
  try {
    const url = new URL(value);
    return url.toString().replace(/\/?$/, '/');
  } catch {
    return fallback;
  }
}

export const environment = {
  production: false,
  apiUrl: normalizeApiUrl('http://localhost:8000/', 'http://localhost:8000/'),
};
