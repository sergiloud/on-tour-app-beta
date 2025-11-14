/**
 * src/utils/index.ts
 *
 * Centralized export of all utility functions
 */

// Formatting
export {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  formatTime,
  formatFileSize,
  truncateString,
  capitalize,
  formatPhoneNumber
} from './formatting';

// Parsing
export {
  parseDate,
  parseDateToISO,
  getTodayISO,
  getDateISO,
  parseCurrency,
  parseJSON,
  parseQueryString,
  parseCSV,
  parseTimeToMinutes,
  parseDuration
} from './parsing';

// Validation
export {
  isValidEmail,
  isValidPhone,
  isValidURL,
  isValidDate,
  isValidJSON,
  isEmpty,
  isRequired,
  isMinLength,
  isMaxLength,
  isInRange,
  isPattern,
  isOneOf,
  isValidCreditCard,
  validateAll
} from './validation';
