export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) && value.trim().length <= 254;
}

export function isValidPhone(value: string): boolean {
  return /^[0-9+\-\s()]{7,20}$/.test(value.trim());
}

export function isValidUrl(value?: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeOptionalUrl(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

export function cleanTrackingQuery(url?: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

export function validateHexColor(value?: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value ?? '');
}
