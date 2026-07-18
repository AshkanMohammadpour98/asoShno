/**
 * Formats a number or string as a currency with thousands separator.
 * Keeps digits in Latin.
 */
export function formatPrice(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '';

  // Remove existing commas and non-numeric characters (except dot)
  const cleanValue = String(value).replace(/,/g, '');
  const number = parseFloat(cleanValue);

  if (isNaN(number)) return '';

  return new Intl.NumberFormat('en-US').format(number);
}

/**
 * Parses a formatted price string back to a clean numeric string.
 */
export function parsePrice(value: string): string {
  return value.replace(/,/g, '');
}

/**
 * Helper to convert Persian/Arabic digits to English digits
 */
export function toEnglishDigits(str: string): string {
  if (!str) return "";
  return str.replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString())
            .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString());
}
