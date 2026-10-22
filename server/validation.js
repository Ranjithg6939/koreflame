/**
 * KoreFlame - Server-side Validation Module
 * Mirroring and enforcing strict validation across all authentication endpoints.
 */

const COMMON_PASSWORDS = new Set([
  '123456',
  '12345678',
  '123456789',
  'password',
  'qwerty',
  'admin',
  'welcome',
  'abcdef',
  'abc123',
  'koreflame',
  'password123',
  'letmein',
  'monkey',
  'football',
  'iloveyou',
  'admin123',
  'guest123'
]);

// Email RFC 5322 compatible regex requiring valid domain and 2+ char TLD
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

// Name: letters, Korean characters, spaces, hyphens, apostrophes
const NAME_REGEX = /^[A-Za-z\u00C0-\u024F\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+(?:[.'\-\s]+[A-Za-z\u00C0-\u024F\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+)*[.']?$/;

function validateEmail(email) {
  if (typeof email !== 'string') {
    return { valid: false, message: 'Email address is required.' };
  }
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, message: 'Email address is required.' };
  }
  if (/\s/.test(trimmed)) {
    return { valid: false, message: 'Email address cannot contain spaces.' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email address with a valid domain (e.g. user@example.com).' };
  }
  return { valid: true, value: trimmed.toLowerCase() };
}

function validatePassword(password) {
  if (typeof password !== 'string' || !password) {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password cannot exceed 128 characters.' };
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase().trim())) {
    return { valid: false, message: 'This password is too common or easily guessed. Please choose a stronger password.' };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

  const missing = [];
  if (!hasUpper) missing.push('one uppercase letter (A-Z)');
  if (!hasLower) missing.push('one lowercase letter (a-z)');
  if (!hasNumber) missing.push('one number (0-9)');
  if (!hasSpecial) missing.push('one special character (!@#$%^&*)');

  if (missing.length > 0) {
    return {
      valid: false,
      message: `Password must include at least: ${missing.join(', ')}.`
    };
  }

  return { valid: true, value: password };
}

function validateName(name) {
  if (typeof name !== 'string') {
    return { valid: false, message: 'Full name is required.' };
  }
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, message: 'Full name is required.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: 'Full name must be at least 2 characters.' };
  }
  if (trimmed.length > 60) {
    return { valid: false, message: 'Full name cannot exceed 60 characters.' };
  }
  if (/\d/.test(trimmed)) {
    return { valid: false, message: 'Full name cannot contain numbers.' };
  }
  if (!NAME_REGEX.test(trimmed)) {
    return { valid: false, message: 'Full name can only contain letters, Korean characters, spaces, hyphens, and apostrophes.' };
  }
  return { valid: true, value: trimmed };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  COMMON_PASSWORDS
};
