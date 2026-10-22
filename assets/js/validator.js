/**
 * KoreFlame - Universal Form Validator & Sanitizer
 * Enforces rigorous enterprise-grade validation across all customer & admin forms.
 */

(function(window) {
  'use strict';

  // 1. Strict Regular Expressions
  // Name: letters (including Korean Hangul & Latin accented), spaces, hyphens, apostrophes, and periods. No digits.
  const NAME_REGEX = /^[A-Za-z\u00C0-\u024F\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+(?:[.'\-\s]+[A-Za-z\u00C0-\u024F\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+)*[.']?$/;

  // Email: Standard web format with valid domain and 2+ char TLD
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  // Phone: Valid international or local format: optional leading +, digits, spaces, dashes, dots, parentheses
  const PHONE_ALLOWED_CHARS = /^[+0-9\s\-().]+$/;

  // Common and easily guessable weak passwords
  const COMMON_PASSWORDS = new Set([
    '123456', '12345678', '123456789', 'password', 'qwerty',
    'admin', 'welcome', 'abcdef', 'abc123', 'koreflame',
    'password123', 'letmein', 'monkey', 'football', 'iloveyou',
    'admin123', 'guest123'
  ]);

  const KF_VALIDATOR = {
    COMMON_PASSWORDS,

    // ------------------------------------------------------------------------
    // Validation Rules
    // ------------------------------------------------------------------------

    validateName(name, required = true, fieldName = 'Full Name') {
      const trimmed = (name || '').trim();
      if (!trimmed) {
        return required ? { valid: false, message: `${fieldName} is required.` } : { valid: true, value: '' };
      }
      if (trimmed.length < 2) {
        return { valid: false, message: `${fieldName} must be at least 2 characters.` };
      }
      if (trimmed.length > 60) {
        return { valid: false, message: `${fieldName} cannot exceed 60 characters.` };
      }
      if (/\d/.test(trimmed)) {
        return { valid: false, message: `${fieldName} cannot contain numbers.` };
      }
      if (!NAME_REGEX.test(trimmed)) {
        return { valid: false, message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes (e.g. Ranjith Kumar, Anne-Marie, O'Connor).` };
      }
      return { valid: true, value: trimmed };
    },

    validateEmail(email, required = true) {
      const trimmed = (email || '').trim();
      if (!trimmed) {
        return required ? { valid: false, message: 'Email address is required.' } : { valid: true, value: '' };
      }
      if (/\s/.test(trimmed)) {
        return { valid: false, message: 'Email address cannot contain spaces.' };
      }
      if (!EMAIL_REGEX.test(trimmed)) {
        return { valid: false, message: 'Please enter a valid email address (e.g. user@example.com).' };
      }
      return { valid: true, value: trimmed.toLowerCase() };
    },

    validatePhone(phone, required = true, fieldName = 'Phone number') {
      const trimmed = (phone || '').trim();
      if (!trimmed) {
        return required ? { valid: false, message: `${fieldName} is required.` } : { valid: true, value: '' };
      }
      if (!PHONE_ALLOWED_CHARS.test(trimmed)) {
        return { valid: false, message: `${fieldName} can only contain digits, +, hyphens, spaces, and parentheses.` };
      }
      const digitsOnly = trimmed.replace(/\D/g, '');
      if (digitsOnly.length < 7) {
        return { valid: false, message: `${fieldName} is too short (minimum 7 digits required).` };
      }
      if (digitsOnly.length > 15) {
        return { valid: false, message: `${fieldName} is too long (maximum 15 digits allowed).` };
      }
      return { valid: true, value: trimmed };
    },

    calculatePasswordStrength(password) {
      const val = password || '';
      const checks = {
        length: val.length >= 8,
        uppercase: /[A-Z]/.test(val),
        lowercase: /[a-z]/.test(val),
        number: /[0-9]/.test(val),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(val),
        notCommon: !COMMON_PASSWORDS.has(val.toLowerCase().trim())
      };

      let score = 0;
      if (checks.length) score++;
      if (checks.uppercase) score++;
      if (checks.lowercase) score++;
      if (checks.number) score++;
      if (checks.special) score++;

      let state = 'weak';
      let percent = 33;
      if (score >= 5 && checks.notCommon) {
        state = 'strong';
        percent = 100;
      } else if (score >= 3 && checks.notCommon) {
        state = 'medium';
        percent = 66;
      } else {
        state = 'weak';
        percent = val.length > 0 ? 33 : 0;
      }

      return {
        score,
        state,
        percent,
        checks,
        isValid: score === 5 && checks.notCommon
      };
    },

    validatePassword(password, minLength = 8, required = true, isRegistration = false) {
      const val = password || '';
      if (!val) {
        return required ? { valid: false, message: 'Password is required.' } : { valid: true, value: '' };
      }

      // Basic login validation
      if (!isRegistration) {
        if (val.length < 6) {
          return { valid: false, message: 'Password must be at least 6 characters.' };
        }
        return { valid: true, value: val };
      }

      // Rigorous registration validation
      if (val.length < minLength) {
        return { valid: false, message: `Password must contain at least ${minLength} characters.` };
      }
      if (val.length > 128) {
        return { valid: false, message: 'Password cannot exceed 128 characters.' };
      }
      if (COMMON_PASSWORDS.has(val.toLowerCase().trim())) {
        return { valid: false, message: 'This password is too common or easily guessed. Please choose a stronger password.' };
      }

      const hasUpper = /[A-Z]/.test(val);
      const hasLower = /[a-z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(val);

      const missing = [];
      if (!hasUpper) missing.push('one uppercase letter (A-Z)');
      if (!hasLower) missing.push('one lowercase letter (a-z)');
      if (!hasNumber) missing.push('one number (0-9)');
      if (!hasSpecial) missing.push('one special symbol (!@#$%^&*)');

      if (missing.length > 0) {
        return {
          valid: false,
          message: `Password must include at least ${missing.join(', ')}.`
        };
      }

      return { valid: true, value: val };
    },

    validateConfirmPassword(password, confirmPassword) {
      if (!confirmPassword) {
        return { valid: false, message: 'Please confirm your password.' };
      }
      if (password !== confirmPassword) {
        return { valid: false, message: 'Passwords do not match.' };
      }
      return { valid: true, value: confirmPassword };
    },

    validateDate(dateStr, minDateStr, maxDateStr, required = true) {
      const val = (dateStr || '').trim();
      if (!val) {
        return required ? { valid: false, message: 'Dining date is required.' } : { valid: true, value: '' };
      }
      const chosen = new Date(val + 'T00:00:00');
      if (isNaN(chosen.getTime())) {
        return { valid: false, message: 'Please select a valid date.' };
      }
      if (minDateStr) {
        const min = new Date(minDateStr + 'T00:00:00');
        if (chosen < min) {
          return { valid: false, message: 'Past dates are not available for table reservations.' };
        }
      }
      if (maxDateStr) {
        const max = new Date(maxDateStr + 'T00:00:00');
        if (chosen > max) {
          return { valid: false, message: 'Reservations can only be booked up to 30 days in advance.' };
        }
      }
      return { valid: true, value: val };
    },

    validateTime(timeStr, allowedTimes = null, required = true) {
      const val = (timeStr || '').trim();
      if (!val) {
        return required ? { valid: false, message: 'Seating time slot is required.' } : { valid: true, value: '' };
      }
      if (Array.isArray(allowedTimes) && allowedTimes.length > 0) {
        if (!allowedTimes.includes(val)) {
          return { valid: false, message: 'Please select an available restaurant seating time slot.' };
        }
      }
      return { valid: true, value: val };
    },

    validateText(text, minLen = 5, maxLen = 1000, required = true, fieldName = 'Message') {
      const trimmed = (text || '').trim();
      if (!trimmed) {
        return required ? { valid: false, message: `${fieldName} is required.` } : { valid: true, value: '' };
      }
      if (trimmed.length < minLen) {
        return { valid: false, message: `${fieldName} must be at least ${minLen} characters.` };
      }
      if (trimmed.length > maxLen) {
        return { valid: false, message: `${fieldName} cannot exceed ${maxLen} characters.` };
      }
      return { valid: true, value: trimmed };
    },

    validateSelect(val, required = true, fieldName = 'Option') {
      const trimmed = (val || '').trim();
      if (!trimmed) {
        return required ? { valid: false, message: `Please select an inquiry ${fieldName.toLowerCase()}.` } : { valid: true, value: '' };
      }
      return { valid: true, value: trimmed };
    },

    validateNumber(numVal, min = 1, max = 100, required = true, fieldName = 'Guest count') {
      const str = String(numVal || '').trim();
      if (!str) {
        return required ? { valid: false, message: `${fieldName} is required.` } : { valid: true, value: '' };
      }
      if (!/^\d+$/.test(str)) {
        return { valid: false, message: `${fieldName} must contain numbers only.` };
      }
      const parsed = parseInt(str, 10);
      if (parsed < min) {
        return { valid: false, message: `${fieldName} must be at least ${min}.` };
      }
      if (parsed > max) {
        return { valid: false, message: `${fieldName} cannot exceed ${max}.` };
      }
      return { valid: true, value: parsed };
    },

    validateCheckbox(checked, required = true, message = 'You must agree to the policies and terms to continue.') {
      if (required && !checked) {
        return { valid: false, message };
      }
      return { valid: true, value: Boolean(checked) };
    },

    // ------------------------------------------------------------------------
    // UI Helpers (Field Error Display & Realtime Clearance)
    // ------------------------------------------------------------------------

    setFieldError(inputEl, errorEl, message) {
      if (inputEl) {
        inputEl.classList.add('is-invalid');
        inputEl.setAttribute('aria-invalid', 'true');
        const group = inputEl.closest('.input-group');
        if (group) group.classList.add('has-error');
        if (errorEl && errorEl.id) {
          inputEl.setAttribute('aria-describedby', errorEl.id);
        }
      }
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('d-block');
        errorEl.setAttribute('role', 'alert');
        errorEl.setAttribute('aria-live', 'polite');
      }
    },

    clearFieldError(inputEl, errorEl) {
      if (inputEl) {
        inputEl.classList.remove('is-invalid');
        inputEl.removeAttribute('aria-invalid');
        const group = inputEl.closest('.input-group');
        if (group) group.classList.remove('has-error');
      }
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('d-block');
      }
    },

    clearFormErrors(form) {
      if (!form) return;
      form.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
        el.removeAttribute('aria-invalid');
      });
      form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
      form.querySelectorAll('.form-feedback-error').forEach(el => {
        el.textContent = '';
        el.classList.remove('d-block');
      });
    },

    // Attach real-time input filtering that prevents or strips invalid characters during input/paste
    setupFieldFilter(inputEl, type) {
      if (!inputEl) return;
      if (inputEl.dataset && inputEl.dataset.kfFilterAttached === type) return;
      if (inputEl.dataset) inputEl.dataset.kfFilterAttached = type;

      const isModifierKey = (e) => e.ctrlKey || e.metaKey || e.altKey;
      const isNavOrFunctionalKey = (e) => {
        const allowed = [
          'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
          'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
          'Home', 'End', 'PageUp', 'PageDown'
        ];
        return allowed.includes(e.key) || isModifierKey(e);
      };

      if (type === 'name') {
        // 1. Block digit and symbol keys on keydown immediately
        inputEl.addEventListener('keydown', (e) => {
          if (isNavOrFunctionalKey(e)) return;
          // Disallow numbers (0-9)
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            return;
          }
          // Disallow symbols not allowed in names
          if (/[\d~`!@#$%^&*()_+=\[\]{}|\\;:"<>\/?]/.test(e.key)) {
            e.preventDefault();
            return;
          }
        });

        // 2. Intercept beforeinput (for virtual/mobile keyboards & IME composition)
        inputEl.addEventListener('beforeinput', (e) => {
          if (e.data && /\d/.test(e.data)) {
            e.preventDefault();
            return;
          }
        });

        // 3. Clean on input (for paste, drag-and-drop, autofill)
        inputEl.addEventListener('input', () => {
          const original = inputEl.value;
          // Strip digits and all non-name characters
          const cleaned = original
            .replace(/[0-9]/g, '')
            .replace(/[^A-Za-z\u00C0-\u024F\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F '\-\.]/g, '');
          if (original !== cleaned) {
            const start = inputEl.selectionStart;
            const diff = original.length - cleaned.length;
            inputEl.value = cleaned;
            if (start !== null) {
              const newPos = Math.max(0, start - diff);
              try { inputEl.setSelectionRange(newPos, newPos); } catch (err) {}
            }
          }
        });

        // 4. Intercept paste to sanitize pasted text
        inputEl.addEventListener('paste', (e) => {
          const pastedText = (e.clipboardData || window.clipboardData)?.getData('text');
          if (pastedText && /\d/.test(pastedText)) {
            e.preventDefault();
            const cleanedPaste = pastedText
              .replace(/[0-9]/g, '')
              .replace(/[^A-Za-z\u00C0-\u024F\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F '\-\.]/g, '');
            const start = inputEl.selectionStart || 0;
            const end = inputEl.selectionEnd || 0;
            const current = inputEl.value;
            inputEl.value = current.slice(0, start) + cleanedPaste + current.slice(end);
            const newPos = start + cleanedPaste.length;
            try { inputEl.setSelectionRange(newPos, newPos); } catch (err) {}
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      } else if (type === 'phone') {
        // 1. Block letters and illegal characters on keydown
        inputEl.addEventListener('keydown', (e) => {
          if (isNavOrFunctionalKey(e)) return;
          // Block alphabetic letters (a-z, A-Z)
          if (/^[a-zA-Z]$/.test(e.key)) {
            e.preventDefault();
            return;
          }
          // Only allow phone symbols: 0-9, +, -, (, ), space, dot
          if (!/^[0-9+\s\-().]$/.test(e.key)) {
            e.preventDefault();
            return;
          }
        });

        // 2. Intercept beforeinput
        inputEl.addEventListener('beforeinput', (e) => {
          if (e.data && /[a-zA-Z]/.test(e.data)) {
            e.preventDefault();
            return;
          }
        });

        // 3. Clean on input
        inputEl.addEventListener('input', () => {
          const original = inputEl.value;
          const cleaned = original.replace(/[^0-9+\s\-().]/g, '');
          if (original !== cleaned) {
            const start = inputEl.selectionStart;
            const diff = original.length - cleaned.length;
            inputEl.value = cleaned;
            if (start !== null) {
              const newPos = Math.max(0, start - diff);
              try { inputEl.setSelectionRange(newPos, newPos); } catch (err) {}
            }
          }
        });

        // 4. Clean on paste
        inputEl.addEventListener('paste', (e) => {
          const pastedText = (e.clipboardData || window.clipboardData)?.getData('text');
          if (pastedText && /[a-zA-Z]/.test(pastedText)) {
            e.preventDefault();
            const cleanedPaste = pastedText.replace(/[^0-9+\s\-().]/g, '');
            const start = inputEl.selectionStart || 0;
            const end = inputEl.selectionEnd || 0;
            const current = inputEl.value;
            inputEl.value = current.slice(0, start) + cleanedPaste + current.slice(end);
            const newPos = start + cleanedPaste.length;
            try { inputEl.setSelectionRange(newPos, newPos); } catch (err) {}
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      } else if (type === 'email') {
        // Block spacebar on keydown
        inputEl.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            return;
          }
        });

        // Block whitespace on beforeinput
        inputEl.addEventListener('beforeinput', (e) => {
          if (e.data && /\s/.test(e.data)) {
            e.preventDefault();
            return;
          }
        });

        // Clean on input
        inputEl.addEventListener('input', () => {
          const original = inputEl.value;
          const cleaned = original.replace(/\s+/g, '');
          if (original !== cleaned) {
            const start = inputEl.selectionStart;
            const diff = original.length - cleaned.length;
            inputEl.value = cleaned;
            if (start !== null) {
              const newPos = Math.max(0, start - diff);
              try { inputEl.setSelectionRange(newPos, newPos); } catch (err) {}
            }
          }
        });
      } else if (type === 'number') {
        // Block non-digits
        inputEl.addEventListener('keydown', (e) => {
          if (isNavOrFunctionalKey(e)) return;
          if (!/^\d$/.test(e.key)) {
            e.preventDefault();
            return;
          }
        });

        inputEl.addEventListener('beforeinput', (e) => {
          if (e.data && /\D/.test(e.data)) {
            e.preventDefault();
            return;
          }
        });

        inputEl.addEventListener('input', () => {
          const original = inputEl.value;
          const cleaned = original.replace(/\D/g, '');
          if (original !== cleaned) {
            inputEl.value = cleaned;
          }
        });
      }
    },

    // Automatically inspect and bind filters across all relevant form inputs
    autoInit(root = (typeof document !== 'undefined' ? document : null)) {
      if (!root || typeof root.querySelectorAll !== 'function') return;

      // 1. Name fields
      root.querySelectorAll('input[type="text"]').forEach(input => {
        const idOrName = `${input.id || ''} ${input.name || ''} ${input.placeholder || ''}`.toLowerCase();
        if ((idOrName.includes('name') && !idOrName.includes('username') && !idOrName.includes('company')) ||
            input.id === 'contact-name' || input.id === 'reg-name' || input.id === 'profile-name' ||
            input.id === 'guest-name' || input.id === 'comment-name') {
          this.setupFieldFilter(input, 'name');
        }
      });

      // 2. Phone fields
      root.querySelectorAll('input[type="tel"], input[id*="phone"], input[name*="phone"]').forEach(input => {
        this.setupFieldFilter(input, 'phone');
      });

      // 3. Email fields
      root.querySelectorAll('input[type="email"], input[id*="email"], input[name*="email"]').forEach(input => {
        this.setupFieldFilter(input, 'email');
      });

      // 4. Number fields
      root.querySelectorAll('input[type="number"], input[id*="qty"], input[name*="quantity"], input[id*="party"]').forEach(input => {
        this.setupFieldFilter(input, 'number');
      });
    }
  };

  window.KF_VALIDATOR = KF_VALIDATOR;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => KF_VALIDATOR.autoInit());
    } else {
      KF_VALIDATOR.autoInit();
    }
  }
})(window);
