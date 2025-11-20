export function getApiOrigin() {
  const rawEnv = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  let raw = rawEnv;

  if (import.meta.env.DEV && rawEnv.includes('azurewebsites.net')) {
    raw = '';
  }

  return raw.replace(/\/api\/?$/, '');
}

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const origin = getApiOrigin();
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${rel}`;
}

export default resolveAssetUrl;
