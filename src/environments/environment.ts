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
  apiUrl: normalizeApiUrl(process.env['API_URL'], 'http://localhost:3000/'),
};
