/**
 * src/utils/validation.ts
 *
 * Centralized validation utilities for consistent data validation
 *
 * Exports:
 * - isValidEmail: Validate email addresses
 * - isValidPhone: Validate phone numbers
 * - isValidURL: Validate URLs
 * - isValidDate: Validate dates
 * - isValidJSON: Validate JSON strings
 * - isEmpty: Check if value is empty
 */

/**
 * Validate email address
 *
 * @example
 * isValidEmail('john@example.com') // true
 * isValidEmail('invalid.email') // false
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 *
 * Accepts: +1234567890, 123-456-7890, (123) 456-7890, 1234567890
 *
 * @example
 * isValidPhone('+11234567890') // true
 * isValidPhone('123') // false
 */
export function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;

  const phoneRegex = /^\+?[\d\s\-()]{9,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate URL
 *
 * @example
 * isValidURL('https://example.com') // true
 * isValidURL('not a url') // false
 */
export function isValidURL(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date
 *
 * @example
 * isValidDate(new Date()) // true
 * isValidDate('2024-11-03') // true
 * isValidDate('invalid') // false
 */
export function isValidDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(d.getTime());
  } catch {
    return false;
  }
}

/**
 * Validate JSON string
 *
 * @example
 * isValidJSON('{"key": "value"}') // true
 * isValidJSON('invalid') // false
 */
export function isValidJSON(jsonString: string | null | undefined): boolean {
  if (!jsonString) return false;

  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is empty
 *
 * Considers empty: null, undefined, "", [], {}, 0, false, NaN
 *
 * @example
 * isEmpty(null) // true
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty('hello') // false
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (value === '' || value === 0 || value === false) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  if (Number.isNaN(value)) return true;
  return false;
}

/**
 * Validate required field
 *
 * @example
 * isRequired('value') // true
 * isRequired('') // false
 * isRequired(null) // false
 */
export function isRequired(value: any, message = 'This field is required'): { valid: boolean; error?: string } {
  if (isEmpty(value)) {
    return { valid: false, error: message };
  }
  return { valid: true };
}

/**
 * Validate minimum length
 *
 * @example
 * isMinLength('hello', 3) // true
 * isMinLength('hi', 3) // false
 */
export function isMinLength(value: string | any[], minLength: number, message?: string): { valid: boolean; error?: string } {
  if (!value || (typeof value === 'string' ? value.length : value.length) < minLength) {
    return {
      valid: false,
      error: message || `Minimum length is ${minLength} characters`
    };
  }
  return { valid: true };
}

/**
 * Validate maximum length
 *
 * @example
 * isMaxLength('hello', 10) // true
 * isMaxLength('hello world', 5) // false
 */
export function isMaxLength(value: string | any[], maxLength: number, message?: string): { valid: boolean; error?: string } {
  if (value && (typeof value === 'string' ? value.length : value.length) > maxLength) {
    return {
      valid: false,
      error: message || `Maximum length is ${maxLength} characters`
    };
  }
  return { valid: true };
}

/**
 * Validate number range
 *
 * @example
 * isInRange(5, 1, 10) // true
 * isInRange(15, 1, 10) // false
 */
export function isInRange(value: number, min: number, max: number, message?: string): { valid: boolean; error?: string } {
  if (value < min || value > max) {
    return {
      valid: false,
      error: message || `Value must be between ${min} and ${max}`
    };
  }
  return { valid: true };
}

/**
 * Validate pattern match (regex)
 *
 * @example
 * isPattern('ABC123', /^[A-Z0-9]+$/) // true
 * isPattern('abc123', /^[A-Z0-9]+$/) // false
 */
export function isPattern(value: string, pattern: RegExp, message?: string): { valid: boolean; error?: string } {
  if (!pattern.test(value)) {
    return {
      valid: false,
      error: message || 'Invalid format'
    };
  }
  return { valid: true };
}

/**
 * Validate that value matches one of allowed values
 *
 * @example
 * isOneOf('small', ['small', 'medium', 'large']) // true
 * isOneOf('xlarge', ['small', 'medium', 'large']) // false
 */
export function isOneOf<T>(value: T, allowedValues: T[], message?: string): { valid: boolean; error?: string } {
  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      error: message || `Value must be one of: ${allowedValues.join(', ')}`
    };
  }
  return { valid: true };
}

/**
 * Validate credit card number (basic Luhn check)
 *
 * @example
 * isValidCreditCard('4532015112830366') // true
 */
export function isValidCreditCard(cardNumber: string | null | undefined): boolean {
  if (!cardNumber) return false;

  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    const digitChar = digits[i];
    if (!digitChar) continue;

    let digit = parseInt(digitChar, 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Run multiple validations and collect errors
 *
 * @example
 * const result = validateAll([
 *   isRequired(name),
 *   isMinLength(name, 3)
 * ]);
 * if (!result.valid) console.log(result.errors);
 */
export function validateAll(
  validations: Array<{ valid: boolean; error?: string }>
): { valid: boolean; errors: string[] } {
  const errors = validations
    .filter(v => !v.valid && v.error)
    .map(v => v.error!);

  return {
    valid: errors.length === 0,
    errors
  };
}
