export function calculateEAN13Checksum(code12: string): string {
  const digits = code12.split("").map(Number);
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const checksum = (10 - (sum % 10)) % 10;
  return code12 + checksum;
}

export function calculateEAN8Checksum(code7: string): string {
  const digits = code7.split("").map(Number);
  let sum = 0;

  for (let i = 0; i < 7; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }

  const checksum = (10 - (sum % 10)) % 10;
  return code7 + checksum;
}

export function isValidEAN13(value: string): boolean {
  if (!/^\d{12,13}$/.test(value)) {
    return false;
  }

  if (value.length === 12) {
    return true;
  }

  // Validate checksum if 13 digits
  const code12 = value.slice(0, 12);
  const expectedChecksum = calculateEAN13Checksum(code12);
  return value === expectedChecksum;
}

export function isValidEAN8(value: string): boolean {
  if (!/^\d{7,8}$/.test(value)) {
    return false;
  }

  if (value.length === 7) {
    return true;
  }

  // Validate checksum if 8 digits
  const code7 = value.slice(0, 7);
  const expectedChecksum = calculateEAN8Checksum(code7);
  return value === expectedChecksum;
}

export function isValidCODE128(value: string): boolean {
  // CODE 128 accepts alphanumeric and special characters
  // No formal checksum validation (scanner-enforced)
  return value.length > 0 && value.length <= 48;
}

export function normalizeEAN13(value: string): string | null {
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 12) {
    return calculateEAN13Checksum(cleaned);
  }

  if (cleaned.length === 13 && isValidEAN13(cleaned)) {
    return cleaned;
  }

  return null;
}

export function normalizeEAN8(value: string): string | null {
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 7) {
    return calculateEAN8Checksum(cleaned);
  }

  if (cleaned.length === 8 && isValidEAN8(cleaned)) {
    return cleaned;
  }

  return null;
}

export function normalizeCODE128(value: string): string | null {
  const trimmed = value.trim();
  return isValidCODE128(trimmed) ? trimmed : null;
}
