function normalizeApiUrl(value: string | undefined, fallback: string): string {
  const candidate = value?.trim() || fallback;

  try {
    const url = new URL(candidate);
    return url.toString().replace(/\/?$/, '/');
  } catch {
    return fallback;
  }
}

export const environment = {
  production: true,
  apiUrl: normalizeApiUrl("https://hotel-management-server-lpzp.onrender.com/", 'https://hotel-management-server-lpzp.onrender.com/'),
};
