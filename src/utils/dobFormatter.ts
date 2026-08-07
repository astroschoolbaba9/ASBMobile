// mobile-app/src/utils/dobFormatter.ts
// Shared DOB Auto-Formatting Mask, Validation & Numerology Mappers

/**
 * Formats raw numeric/text input into DD-MM-YYYY format automatically.
 */
export function formatDobInput(text: string): string {
  // Strip non-numeric characters
  const digits = text.replace(/\D/g, '').slice(0, 8);
  
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
}

/**
 * Validates whether string is a real valid DD-MM-YYYY or DD/MM/YYYY date.
 */
export function isValidDob(dob: string): boolean {
  if (!dob || dob.trim().length < 8) return false;
  const clean = dob.replace(/[-\/]/g, '-').trim();
  const parts = clean.split('-');

  if (parts.length !== 3) return false;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return false;

  // Month specific day limits
  const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month]) return false;

  return true;
}

/**
 * Dynamic Lucky Color mapping per Moolank Number (1-9)
 */
export function getLuckyColor(moolank: number): string {
  const colors: Record<number, string> = {
    1: 'Golden Yellow & Ruby Red',
    2: 'Pearl White & Moon Silver',
    3: 'Sacred Gold & Royal Yellow',
    4: 'Electric Blue & Smoked Grey',
    5: 'Emerald Green & Light Green',
    6: 'Royal Purple & Pastel Pink',
    7: 'Sea Green & Cream White',
    8: 'Dark Violet & Royal Navy',
    9: 'Bright Crimson & Coral Red',
  };
  return colors[moolank] || 'Royal Purple';
}
