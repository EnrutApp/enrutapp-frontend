export function getApiOrigin() {
  const raw = import.meta?.env?.VITE_API_URL || 'http://localhost:3000';
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
