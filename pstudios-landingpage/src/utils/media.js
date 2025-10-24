import API_BASE_URL from '../config/api';

export function resolveMediaUrl(src) {
  if (!src) return '';
  const trimmed = String(src).trim();
  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `${API_BASE_URL}${trimmed}`;
  }
  return trimmed;
}


