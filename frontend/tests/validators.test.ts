import { describe, expect, it } from 'vitest';
import { isValidEmail, isValidPhone, isValidUrl, validateHexColor } from '../src/admin/utils/validators';

describe('admin validators', () => {
  it('validates email and phone inputs', () => {
    expect(isValidEmail('owner@example.com')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidPhone('+1 (555) 123-4567')).toBe(true);
    expect(isValidPhone('phone-number')).toBe(false);
  });

  it('requires HTTPS URLs and six-digit hex colors', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(false);
    expect(validateHexColor('#2f7bff')).toBe(true);
    expect(validateHexColor('#abc')).toBe(false);
  });
});