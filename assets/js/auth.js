/**
 * KoreFlame - Enterprise Authentication Controller
 * Connects frontend forms with backend API, handles client-side & server-side validation,
 * live password strength meter, requirement checklist, Google/Apple OAuth, and session management.
 */

document.addEventListener('DOMContentLoaded', () => {
  checkExistingAuthOnAuthPages();
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
  initForgotPasswordModal();
  initResetPasswordForm();
  initSocialAuthButtons();
});

// ----------------------------------------------------------------------------
// 0. Active Session Detection on Auth Pages
// ----------------------------------------------------------------------------
function checkExistingAuthOnAuthPages() {
  const user = window.KF_STATE ? window.KF_STATE.getUser() : null;
  if (!user || !user.isLoggedIn || !user.name) return;

  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect');

  if (redirectParam && !redirectParam.includes('login.html') && !redirectParam.includes('register.html')) {
    window.location.replace(redirectParam);
    return;
  }

  // Display already authenticated state on login/register pages
  const formCard = document.querySelector('.auth-card, #kf-login-form, #kf-register-form');
  if (formCard) {
    const existingNotice = document.getElementById('kf-already-authenticated-banner');
    if (!existingNotice) {
      const banner = document.createElement('div');
      banner.id = 'kf-already-authenticated-banner';
      banner.className = 'alert alert-info border-subtle bg-surface-app p-3 rounded-3 mb-4 text-center';
      banner.innerHTML = `
        <div class="d-flex align-items-center justify-content-center gap-2 mb-2">
          <i data-lucide="check-circle" class="text-success" style="width: 20px; height: 20px;"></i>
          <span class="fw-bold text-primary-app">Active Session Found</span>
        </div>
        <p class="small text-secondary mb-3">You are already signed in as <strong>${window.escapeHtml ? window.escapeHtml(user.name) : user.name}</strong>.</p>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <a href="${user.role === 'admin' ? 'admin/index.html' : 'dashboard.html'}" class="btn-flame btn-sm-custom">Open Guest Dashboard</a>
          <button type="button" class="btn-flame-outline btn-sm-custom" onclick="window.handleLogout()">Switch Account (Logout)</button>
        </div>
      `;
      formCard.parentElement.insertBefore(banner, formCard);
      if (window.lucide) window.lucide.createIcons({ root: banner });
    }
  }
}

// ----------------------------------------------------------------------------
// 1. Password Visibility Toggles
// ----------------------------------------------------------------------------
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.setAttribute('type', 'button'); // Prevent accidental form submission
    btn.setAttribute('aria-label', 'Toggle password visibility');

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const inputGroup = btn.closest('.input-group');
      if (!inputGroup) return;
      const targetInput = inputGroup.querySelector('input');
      if (!targetInput) return;

      const isPassword = targetInput.getAttribute('type') === 'password';
      targetInput.setAttribute('type', isPassword ? 'text' : 'password');
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');

      const icon = btn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        if (window.lucide) window.lucide.createIcons();
      }
      targetInput.focus();
    });
  });
}

// ----------------------------------------------------------------------------
// 2. Live Password Strength Indicator & Checklist
// ----------------------------------------------------------------------------
function setupLivePasswordStrength(input, config) {
  if (!input) return;
  const wrap = document.getElementById(config.wrapId);
  const fill = document.getElementById(config.fillId);
  const label = document.getElementById(config.labelId);
  const announcer = document.getElementById(config.announcerId);
  const validator = window.KF_VALIDATOR;

  const reqElements = {
    length: document.getElementById('req-length'),
    upper: document.getElementById('req-upper'),
    lower: document.getElementById('req-lower'),
    number: document.getElementById('req-number'),
    special: document.getElementById('req-special')
  };

  input.addEventListener('input', () => {
    const val = input.value;
    if (!val) {
      if (wrap) wrap.style.display = 'none';
      return;
    }

    if (wrap) wrap.style.display = 'block';

    if (!validator) return;
    const strength = validator.calculatePasswordStrength(val);

    // Update Strength Fill
    if (fill) {
      fill.className = `kf-strength-fill strength-${strength.state}`;
    }

    // Update Strength Label
    if (label) {
      label.className = `kf-strength-label text-${strength.state}`;
      label.textContent = strength.state.charAt(0).toUpperCase() + strength.state.slice(1);
    }

    // Update Accessibility Announcer
    if (announcer) {
      announcer.textContent = `Password strength is ${strength.state}.`;
    }

    // Update Visual Checklist Items
    const updateCheckItem = (el, isMet) => {
      if (!el) return;
      if (isMet) {
        el.classList.add('met');
        const icon = el.querySelector('i');
        if (icon && icon.getAttribute('data-lucide') !== 'check-circle-2') {
          icon.setAttribute('data-lucide', 'check-circle-2');
        }
      } else {
        el.classList.remove('met');
        const icon = el.querySelector('i');
        if (icon && icon.getAttribute('data-lucide') !== 'circle') {
          icon.setAttribute('data-lucide', 'circle');
        }
      }
    };

    updateCheckItem(reqElements.length, strength.checks.length);
    updateCheckItem(reqElements.upper, strength.checks.uppercase);
    updateCheckItem(reqElements.lower, strength.checks.lowercase);
    updateCheckItem(reqElements.number, strength.checks.number);
    updateCheckItem(reqElements.special, strength.checks.special);

    if (window.lucide) window.lucide.createIcons();
  });
}

// ----------------------------------------------------------------------------
// 3. Login Form Handler
// ----------------------------------------------------------------------------
function initLoginForm() {
  const form = document.getElementById('kf-login-form');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect');

  // Check if session already active on backend
  fetch('/api/auth/me', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data && data.authenticated && data.user) {
        if (window.KF_STATE) window.KF_STATE.setUser(data.user);
        if (redirectParam) {
          window.location.replace(redirectParam);
        } else {
          renderLoggedInState(data.user);
        }
      }
    })
    .catch(() => {});

  if (redirectParam) {
    const regLink = document.querySelector('a[href="register.html"]');
    if (regLink) {
      regLink.href = `register.html?redirect=${encodeURIComponent(redirectParam)}`;
    }
    const formHeader = document.querySelector('.auth-header');
    if (formHeader && !document.getElementById('auth-redirect-notice')) {
      const notice = document.createElement('div');
      notice.id = 'auth-redirect-notice';
      notice.className = 'alert alert-warning bg-secondary-app border border-warning-subtle text-start py-2.5 px-3 mb-3 small d-flex align-items-center gap-2 rounded-3';
      let message = 'Please sign in to continue to your requested page.';
      if (redirectParam.includes('dashboard')) message = 'Please sign in to access your guest dining dashboard.';
      else if (redirectParam.includes('menu')) message = 'Please sign in to add signature cuts to your table order.';
      else if (redirectParam.includes('order')) message = 'Please sign in to dispatch your order to the grill.';
      else if (redirectParam.includes('admin')) message = 'Administrative authentication required to access this portal.';

      notice.innerHTML = `<i data-lucide="info" class="text-gold flex-shrink-0" style="width: 16px; height: 16px;"></i><span>${message}</span>`;
      formHeader.parentNode.insertBefore(notice, formHeader.nextSibling);
      if (window.lucide) window.lucide.createIcons();
    }
  }

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const rememberCheckbox = document.getElementById('rememberMe');
  const emailError = document.getElementById('login-email-error');
  const passwordError = document.getElementById('login-password-error');
  const submitBtn = document.getElementById('btn-login-submit');
  const validator = window.KF_VALIDATOR;

  // Real-time error clearance on input
  if (emailInput && validator) {
    emailInput.addEventListener('input', () => validator.clearFieldError(emailInput, emailError));
    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      if (val) {
        if (val.includes('@')) {
          const res = validator.validateEmail(val);
          if (!res.valid) validator.setFieldError(emailInput, emailError, res.message);
          else validator.clearFieldError(emailInput, emailError);
        }
      }
    });
  }

  if (passwordInput && validator) {
    passwordInput.addEventListener('input', () => validator.clearFieldError(passwordInput, passwordError));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (validator) validator.clearFormErrors(form);

    const emailVal = emailInput ? emailInput.value.trim() : '';
    const passVal = passwordInput ? passwordInput.value : '';
    const rememberVal = rememberCheckbox ? rememberCheckbox.checked : false;

    let isValid = true;
    let firstInvalidField = null;

    if (!emailVal) {
      if (validator) validator.setFieldError(emailInput, emailError, 'Email address is required.');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = emailInput;
    } else if (emailVal.includes('@')) {
      const emailCheck = validator ? validator.validateEmail(emailVal) : { valid: true };
      if (!emailCheck.valid) {
        if (validator) validator.setFieldError(emailInput, emailError, emailCheck.message);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = emailInput;
      }
    }

    if (!passVal) {
      if (validator) validator.setFieldError(passwordInput, passwordError, 'Password is required.');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = passwordInput;
    }

    if (!isValid) {
      if (firstInvalidField) firstInvalidField.focus();
      if (window.kfToast) window.kfToast.error('Please resolve the highlighted errors.', 'Sign In Required');
      return;
    }

    // Set loading state
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '<span>Sign In</span>';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>Authenticating...</span>`;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: emailVal,
          password: passVal,
          rememberMe: rememberVal
        })
      });

      // If response is valid JSON from backend
      if (res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();

        if (!res.ok || !data.success) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }

          const msg = data.message || 'Invalid email address or password.';
          if (validator) {
            validator.setFieldError(passwordInput, passwordError, msg);
          }
          if (passwordInput) passwordInput.focus();
          if (window.kfToast) window.kfToast.error(msg, 'Authentication Failed');
          return;
        }

        // Success from server
        const userObj = {
          ...data.user,
          token: data.token || '',
          isLoggedIn: true
        };
        if (window.KF_STATE) {
          window.KF_STATE.setUser(userObj);
        }

        if (window.kfToast) {
          window.kfToast.success(`Welcome back, ${data.user.name}!`, 'Sign In Successful');
        }

        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || redirectParam || (data.user.role === 'admin' ? 'admin/index.html' : 'dashboard.html');
        setTimeout(() => {
          window.location.href = redirect;
        }, 600);
        return;
      }
      throw new Error('API server returned non-JSON response');
    } catch (err) {
      // Offline fallback: verify against local registered database
      // CRITICAL: NEVER auto-create account on login and ALWAYS verify password
      console.warn('[Login] API unreachable, verifying credentials against local database...', err);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }

      if (window.KF_STATE && typeof window.KF_STATE.verifyCredentials === 'function') {
        const verifyRes = window.KF_STATE.verifyCredentials(emailVal, passVal);
        if (!verifyRes.success) {
          const errMsg = verifyRes.message || 'Invalid email address or password. Please try again.';
          if (validator) {
            if (verifyRes.error === 'ACCOUNT_NOT_FOUND' && emailInput && emailError) {
              validator.setFieldError(emailInput, emailError, errMsg);
              emailInput.focus();
            } else {
              validator.setFieldError(passwordInput, passwordError, errMsg);
              if (passwordInput) passwordInput.focus();
            }
          }
          if (window.kfToast) {
            window.kfToast.error(errMsg, 'Authentication Failed');
          }
          return;
        }

        // Valid credentials matched registered account
        const fallbackUser = {
          ...verifyRes.user,
          isLoggedIn: true,
          _offlineMode: true
        };
        if (window.KF_STATE) {
          window.KF_STATE.setUser(fallbackUser);
        }

        if (window.kfToast) {
          window.kfToast.success(`Welcome back, ${verifyRes.user.name}!`, 'Sign In Successful');
        }
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || redirectParam || (verifyRes.user.role === 'admin' ? 'admin/index.html' : 'dashboard.html');
        setTimeout(() => {
          window.location.href = redirect;
        }, 600);
        return;
      }

      if (window.kfToast) {
        window.kfToast.error('Invalid email address or password. Please try again.', 'Authentication Failed');
      }
    }
  });
}

// ----------------------------------------------------------------------------
// 4. Registration Form Handler
// ----------------------------------------------------------------------------
function initRegisterForm() {
  const form = document.getElementById('kf-register-form');
  if (!form) return;

  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const phoneInput = document.getElementById('reg-phone');
  const passwordInput = document.getElementById('reg-password');
  const confirmPassInput = document.getElementById('reg-confirm-password');
  const termsCheckbox = document.getElementById('agreeTerms');
  const submitBtn = document.getElementById('btn-register-submit');

  const nameError = document.getElementById('reg-name-error');
  const emailError = document.getElementById('reg-email-error');
  const phoneError = document.getElementById('reg-phone-error');
  const passwordError = document.getElementById('reg-password-error');
  const confirmPassError = document.getElementById('reg-confirm-password-error');
  const termsError = document.getElementById('agreeTerms-error');

  const validator = window.KF_VALIDATOR;

  // Initialize live password strength indicator and checklist
  setupLivePasswordStrength(passwordInput, {
    wrapId: 'kf-password-strength-wrap',
    fillId: 'kf-strength-fill',
    labelId: 'kf-strength-label',
    announcerId: 'kf-strength-announcer'
  });

  // Attach input filters
  if (validator) {
    validator.setupFieldFilter(nameInput, 'name');
    validator.setupFieldFilter(phoneInput, 'phone');
  }

  // Real-time clearance and blur validation
  if (nameInput && validator) {
    nameInput.addEventListener('input', () => validator.clearFieldError(nameInput, nameError));
    nameInput.addEventListener('blur', () => {
      const val = nameInput.value.trim();
      if (val) {
        const res = validator.validateName(val, true, 'Full Name');
        if (!res.valid) validator.setFieldError(nameInput, nameError, res.message);
        else validator.clearFieldError(nameInput, nameError);
      }
    });
  }

  if (emailInput && validator) {
    emailInput.addEventListener('input', () => validator.clearFieldError(emailInput, emailError));
    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      if (val) {
        const res = validator.validateEmail(val, true);
        if (!res.valid) validator.setFieldError(emailInput, emailError, res.message);
        else validator.clearFieldError(emailInput, emailError);
      }
    });
  }

  if (phoneInput && validator) {
    phoneInput.addEventListener('input', () => validator.clearFieldError(phoneInput, phoneError));
    phoneInput.addEventListener('blur', () => {
      const val = phoneInput.value.trim();
      if (val) {
        const res = validator.validatePhone(val, false, 'Mobile phone');
        if (!res.valid) validator.setFieldError(phoneInput, phoneError, res.message);
        else validator.clearFieldError(phoneInput, phoneError);
      }
    });
  }

  if (passwordInput && validator) {
    passwordInput.addEventListener('input', () => {
      validator.clearFieldError(passwordInput, passwordError);
      // Re-evaluate confirmation on password change
      if (confirmPassInput && confirmPassInput.value) {
        if (confirmPassInput.value !== passwordInput.value) {
          validator.setFieldError(confirmPassInput, confirmPassError, 'Passwords do not match.');
        } else {
          validator.clearFieldError(confirmPassInput, confirmPassError);
        }
      }
    });

    passwordInput.addEventListener('blur', () => {
      if (passwordInput.value) {
        const res = validator.validatePassword(passwordInput.value, 8, true, true);
        if (!res.valid) validator.setFieldError(passwordInput, passwordError, res.message);
        else validator.clearFieldError(passwordInput, passwordError);
      }
    });
  }

  if (confirmPassInput && validator) {
    confirmPassInput.addEventListener('input', () => {
      if (passwordInput && confirmPassInput.value !== passwordInput.value) {
        validator.setFieldError(confirmPassInput, confirmPassError, 'Passwords do not match.');
      } else {
        validator.clearFieldError(confirmPassInput, confirmPassError);
      }
    });

    confirmPassInput.addEventListener('blur', () => {
      if (confirmPassInput.value) {
        const res = validator.validateConfirmPassword(passwordInput ? passwordInput.value : '', confirmPassInput.value);
        if (!res.valid) validator.setFieldError(confirmPassInput, confirmPassError, res.message);
        else validator.clearFieldError(confirmPassInput, confirmPassError);
      }
    });
  }

  if (termsCheckbox && validator) {
    termsCheckbox.addEventListener('change', () => validator.clearFieldError(termsCheckbox, termsError));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (validator) validator.clearFormErrors(form);

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    const passVal = passwordInput ? passwordInput.value : '';
    const confirmVal = confirmPassInput ? confirmPassInput.value : '';
    const isTermsAgreed = termsCheckbox ? termsCheckbox.checked : false;

    let isValid = true;
    let firstInvalidField = null;

    if (validator) {
      // 1. Full Name
      const nameCheck = validator.validateName(nameVal, true, 'Full Name');
      if (!nameCheck.valid) {
        validator.setFieldError(nameInput, nameError, nameCheck.message);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = nameInput;
      }

      // 2. Email Address
      const emailCheck = validator.validateEmail(emailVal, true);
      if (!emailCheck.valid) {
        validator.setFieldError(emailInput, emailError, emailCheck.message);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = emailInput;
      }

      // 3. Mobile Phone
      if (phoneVal) {
        const phoneCheck = validator.validatePhone(phoneVal, false, 'Mobile phone');
        if (!phoneCheck.valid) {
          validator.setFieldError(phoneInput, phoneError, phoneCheck.message);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = phoneInput;
        }
      }

      // 4. Strong Password (8+ chars, upper, lower, number, symbol, not common)
      const passCheck = validator.validatePassword(passVal, 8, true, true);
      if (!passCheck.valid) {
        validator.setFieldError(passwordInput, passwordError, passCheck.message);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = passwordInput;
      }

      // 5. Confirm Password Exact Match
      const confirmCheck = validator.validateConfirmPassword(passVal, confirmVal);
      if (!confirmCheck.valid) {
        validator.setFieldError(confirmPassInput, confirmPassError, confirmCheck.message);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = confirmPassInput;
      }

      // 6. Terms Checkbox
      const termsCheck = validator.validateCheckbox(isTermsAgreed, true, 'You must agree to the reservation policies and loyalty terms.');
      if (!termsCheck.valid) {
        validator.setFieldError(termsCheckbox, termsError, termsCheck.message);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = termsCheckbox;
      }
    }

    if (!isValid) {
      if (firstInvalidField) firstInvalidField.focus();
      if (window.kfToast) window.kfToast.error('Please correct the highlighted fields.', 'Validation Error');
      return;
    }

    // Set loading state
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '<span>Create Account</span>';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span><span>Creating Account...</span>`;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          password: passVal,
          confirmPassword: confirmVal,
          agreeTerms: isTermsAgreed
        })
      });

      if (res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();

        if (!res.ok || !data.success) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }

          // Highlight field if returned by server
          if (data.field === 'email' && emailInput && emailError) {
            validator.setFieldError(emailInput, emailError, data.message || 'An account with this email already exists. Please log in.');
            emailInput.focus();
          } else if (data.field === 'password' && passwordInput && passwordError) {
            validator.setFieldError(passwordInput, passwordError, data.message);
            passwordInput.focus();
          } else if (data.field === 'confirmPassword' && confirmPassInput && confirmPassError) {
            validator.setFieldError(confirmPassInput, confirmPassError, data.message);
            confirmPassInput.focus();
          }

          if (window.kfToast) window.kfToast.error(data.message || 'Registration failed.', 'Account Error');
          return;
        }

        // Successful Registration on Server
        const regUser = {
          ...data.user,
          token: data.token || '',
          isLoggedIn: true
        };
        if (window.KF_STATE) {
          window.KF_STATE.setUser(regUser);
        }

        if (window.kfToast) {
          window.kfToast.success(`Welcome to KoreFlame, ${data.user.name}! 200 welcome loyalty points awarded.`, 'Account Created');
        }

        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'dashboard.html';
        setTimeout(() => {
          window.location.href = redirect;
        }, 800);
        return;
      }
      throw new Error('API server returned non-JSON response');
    } catch (err) {
      console.warn('[Registration] API unreachable, persisting account locally...', err);
      if (window.KF_STATE) {
        const cleanEmail = emailVal.toLowerCase().trim();
        const existing = window.KF_STATE.findUser(cleanEmail);
        if (existing) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
          if (validator) {
            validator.setFieldError(emailInput, emailError, 'An account with this email already exists. Please log in.');
          }
          if (emailInput) emailInput.focus();
          if (window.kfToast) {
            window.kfToast.error('An account with this email already exists. Please log in.', 'Account Error');
          }
          return;
        }

        const newUser = {
          name: nameVal,
          email: cleanEmail,
          phone: phoneVal || '+1 (555) 000-0000',
          password: passVal, // Saved so verifyCredentials strictly checks it on login
          tier: 'Bronze Member',
          points: 200,
          role: 'guest',
          joinedDate: 'Today',
          isLoggedIn: true
        };
        window.KF_STATE.saveUserAccount(newUser);
        window.KF_STATE.setUser(newUser);

        if (window.kfToast) {
          window.kfToast.success(`Welcome to KoreFlame, ${nameVal}! 200 welcome loyalty points awarded.`, 'Account Created');
        }

        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'dashboard.html';
        setTimeout(() => {
          window.location.href = redirect;
        }, 800);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
      if (window.kfToast) {
        window.kfToast.error('Registration failed. Please check your connection.', 'Connection Error');
      }
    }
  });
}

// ----------------------------------------------------------------------------
// 5. Social Auth (Google & Apple) Real Integration & Honest Unconfigured Handling
// ----------------------------------------------------------------------------
function initSocialAuthButtons() {
  const googleBtns = document.querySelectorAll('#btn-signup-google, #btn-login-google');
  const appleBtns = document.querySelectorAll('#btn-signup-apple, #btn-login-apple');

  googleBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/auth/config');
        const config = await res.json();

        if (!config.googleConfigured) {
          if (window.kfToast) {
            window.kfToast.info('Google sign-in is not configured yet. Please use email registration.', 'Provider Setup Required');
          }
          return;
        }

        // When configured with real Client ID, GIS popup is invoked
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: config.googleClientId,
            callback: handleGoogleCredentialResponse
          });
          window.google.accounts.id.prompt();
        }
      } catch (err) {
        if (window.kfToast) {
          window.kfToast.info('Google sign-in is not configured yet. Please use email registration.', 'Provider Setup Required');
        }
      }
    });
  });

  appleBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/auth/config');
        const config = await res.json();

        if (!config.appleConfigured) {
          if (window.kfToast) {
            window.kfToast.info('Apple sign-in is not configured yet. Please use email registration.', 'Provider Setup Required');
          }
          return;
        }

        // When configured with Apple Services ID
        if (window.AppleID && window.AppleID.auth) {
          window.AppleID.auth.signIn();
        }
      } catch (err) {
        if (window.kfToast) {
          window.kfToast.info('Apple sign-in is not configured yet. Please use email registration.', 'Provider Setup Required');
        }
      }
    });
  });
}

async function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) return;
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ idToken: response.credential })
    });
    const data = await res.json();
    if (data.success && data.user) {
      if (window.KF_STATE) window.KF_STATE.setUser(data.user);
      if (window.kfToast) window.kfToast.success(`Signed in with Google as ${data.user.name}!`, 'Welcome');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
    } else {
      if (window.kfToast) window.kfToast.error(data.message || 'Google authentication failed.', 'Sign In Error');
    }
  } catch (err) {
    if (window.kfToast) window.kfToast.error('Network error during Google sign-in.', 'Error');
  }
}

// ----------------------------------------------------------------------------
// 6. Forgot Password Modal Controller
// ----------------------------------------------------------------------------
function initForgotPasswordModal() {
  const triggerBtn = document.getElementById('btn-forgot-password-trigger');
  const modal = document.getElementById('kf-forgot-modal');
  const closeBtn = document.getElementById('btn-close-forgot-modal');
  const form = document.getElementById('kf-forgot-form');
  const emailInput = document.getElementById('forgot-email');
  const emailError = document.getElementById('forgot-email-error');
  const submitBtn = document.getElementById('btn-forgot-submit');
  const validator = window.KF_VALIDATOR;

  if (!modal || !triggerBtn) return;

  const openModal = () => {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    if (emailInput) {
      emailInput.value = '';
      if (validator) validator.clearFieldError(emailInput, emailError);
      setTimeout(() => emailInput.focus(), 100);
    }
  };

  const closeModal = () => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    triggerBtn.focus();
  };

  triggerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email) {
        if (validator) validator.setFieldError(emailInput, emailError, 'Email address is required.');
        if (emailInput) emailInput.focus();
        return;
      }

      if (validator) {
        const check = validator.validateEmail(email);
        if (!check.valid) {
          validator.setFieldError(emailInput, emailError, check.message);
          if (emailInput) emailInput.focus();
          return;
        }
        validator.clearFieldError(emailInput, emailError);
      }

      const origText = submitBtn ? submitBtn.innerHTML : '<span>Send Instructions</span>';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span><span>Sending...</span>`;
      }

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
        }

        closeModal();
        if (window.kfToast) {
          window.kfToast.success(data.message || 'If that email exists, reset instructions have been sent.', 'Password Reset Link');
        }
      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
        }
        if (window.kfToast) {
          window.kfToast.error('Failed to dispatch reset request. Please check your connection.', 'Request Failed');
        }
      }
    });
  }
}

// ----------------------------------------------------------------------------
// 7. Reset Password Page Controller (reset-password.html)
// ----------------------------------------------------------------------------
function initResetPasswordForm() {
  const form = document.getElementById('kf-reset-password-form');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const tokenInput = document.getElementById('reset-token');
  const passInput = document.getElementById('reset-new-password');
  const confirmInput = document.getElementById('reset-confirm-password');
  const passError = document.getElementById('reset-new-password-error');
  const confirmError = document.getElementById('reset-confirm-password-error');
  const submitBtn = document.getElementById('btn-reset-submit');
  const validator = window.KF_VALIDATOR;

  if (tokenInput && token) tokenInput.value = token;

  if (!token) {
    if (window.kfToast) {
      window.kfToast.error('Password reset token is missing from URL. Please request a new link.', 'Invalid Link');
    }
  }

  // Setup live password strength
  setupLivePasswordStrength(passInput, {
    wrapId: 'kf-password-strength-wrap',
    fillId: 'kf-strength-fill',
    labelId: 'kf-strength-label',
    announcerId: 'kf-strength-announcer'
  });

  if (passInput && validator) {
    passInput.addEventListener('input', () => validator.clearFieldError(passInput, passError));
  }

  if (confirmInput && validator) {
    confirmInput.addEventListener('input', () => {
      if (passInput && confirmInput.value !== passInput.value) {
        validator.setFieldError(confirmInput, confirmError, 'Passwords do not match.');
      } else {
        validator.clearFieldError(confirmInput, confirmError);
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (validator) validator.clearFormErrors(form);

    const tokenVal = tokenInput ? tokenInput.value : '';
    const passVal = passInput ? passInput.value : '';
    const confirmVal = confirmInput ? confirmInput.value : '';

    if (!tokenVal) {
      if (window.kfToast) window.kfToast.error('Reset token is missing or expired.', 'Invalid Token');
      return;
    }

    let isValid = true;
    if (validator) {
      const passCheck = validator.validatePassword(passVal, 8, true, true);
      if (!passCheck.valid) {
        validator.setFieldError(passInput, passError, passCheck.message);
        isValid = false;
      }
      const confirmCheck = validator.validateConfirmPassword(passVal, confirmVal);
      if (!confirmCheck.valid) {
        validator.setFieldError(confirmInput, confirmError, confirmCheck.message);
        isValid = false;
      }
    }

    if (!isValid) return;

    const origText = submitBtn ? submitBtn.innerHTML : '<span>Update Password</span>';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span><span>Updating Password...</span>`;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenVal,
          password: passVal,
          confirmPassword: confirmVal
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
        }
        if (window.kfToast) window.kfToast.error(data.message || 'Reset failed.', 'Error');
        return;
      }

      if (window.kfToast) {
        window.kfToast.success(data.message || 'Password reset successfully! Please sign in.', 'Success');
      }

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }
      if (window.kfToast) window.kfToast.error('Network connection error.', 'Error');
    }
  });
}

// ----------------------------------------------------------------------------
// 8. Render Authenticated State on the Login Page (Stay on Login Page)
// ----------------------------------------------------------------------------
function renderLoggedInState(user) {
  const card = document.querySelector('#main-content .kf-card');
  if (!card) return;

  const esc = (s) => (s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '');
  const name = user && user.name ? user.name : 'Guest User';
  const email = user && user.email ? user.email : 'guest@koreflame.com';
  const points = user && user.points !== undefined ? user.points : 200;
  const role = user && user.role ? (user.role === 'admin' ? 'Executive Staff (Admin)' : (user.tier || 'Grill Member')) : 'Grill Member';

  card.innerHTML = `
    <div class="text-center py-2">
      <div class="dash-stat-icon icon-gold mx-auto mb-3" style="width: 64px; height: 64px; font-size: 1.8rem;">
        <i data-lucide="check-circle-2" class="text-success" style="width: 38px; height: 38px;"></i>
      </div>

      <span class="badge-tag badge-prime mb-2">Authenticated Session</span>
      <h3 class="mb-1 fw-extrabold text-primary-app">Sign In Successful</h3>
      <p class="text-secondary small mb-4">You are now actively signed in to your KoreFlame dining account.</p>

      <div class="p-3 bg-secondary-app rounded-3 border border-subtle mb-4 text-start">
        <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom border-subtle">
          <div class="nav-profile-avatar" style="width: 44px; height: 44px; font-size: 1.1rem;">
            ${esc(name.substring(0, 1).toUpperCase())}
          </div>
          <div class="min-w-0">
            <h5 class="mb-0 fw-bold text-primary-app text-truncate">${esc(name)}</h5>
            <span class="text-muted small text-truncate d-block">${esc(email)}</span>
          </div>
        </div>

        <div class="d-flex justify-content-between py-1 small text-secondary">
          <span>Account Role:</span>
          <strong class="text-gold">${esc(role)}</strong>
        </div>
        <div class="d-flex justify-content-between py-1 small text-secondary">
          <span>Loyalty Rewards:</span>
          <strong class="text-gold">+${points} Flame Points</strong>
        </div>
        <div class="d-flex justify-content-between py-1 small text-secondary">
          <span>Session Status:</span>
          <span class="text-success fw-semibold d-inline-flex align-items-center gap-1">
            <span class="d-inline-block rounded-circle bg-success" style="width: 7px; height: 7px;"></span>
            Active
          </span>
        </div>
      </div>

      <div class="d-flex flex-column gap-2 mb-3">
        ${user.role === 'admin' ? `
          <a href="admin/index.html" class="btn-flame py-2.5 justify-content-center">
            <i data-lucide="shield" style="width: 18px; height: 18px;"></i>
            <span>Open Executive Admin Portal</span>
          </a>
        ` : ''}
        <a href="dashboard.html" class="btn-flame py-2.5 justify-content-center">
          <i data-lucide="layout-dashboard" style="width: 18px; height: 18px;"></i>
          <span>Open Guest Dashboard</span>
        </a>
        <a href="menu.html" class="btn-flame-outline py-2.5 justify-content-center">
          <i data-lucide="utensils" style="width: 18px; height: 18px;"></i>
          <span>Browse Table Menu</span>
        </a>
      </div>

      <div class="pt-3 border-top border-subtle">
        <button type="button" class="btn btn-sm btn-outline-secondary text-muted" id="btn-login-signout" onclick="window.handleAuthSignOut()">
          <i data-lucide="log-out" style="width: 14px; height: 14px;"></i>
          <span>Sign Out / Switch Account</span>
        </button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

// Global Sign Out handler
window.handleAuthSignOut = async function() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (e) {}

  if (window.KF_STATE) {
    window.KF_STATE.logout();
  }
  if (window.kfToast) {
    window.kfToast.info('You have signed out of your account.', 'Signed Out');
  }
  setTimeout(() => {
    window.location.reload();
  }, 400);
};
