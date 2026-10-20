/**
 * KoreFlame - Authentication Controller
 * Login, Register, Password Visibility Toggles, Universal Validator Integration & Redirection.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
});

// Fallback Validator Reference
const V = window.KF_VALIDATOR;

// 1. Password Visibility Toggle
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetInput = btn.closest('.input-group').querySelector('input');
      if (!targetInput) return;

      const isPassword = targetInput.getAttribute('type') === 'password';
      targetInput.setAttribute('type', isPassword ? 'text' : 'password');

      const icon = btn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  });
}

// 2. Login Form Handler with Live & Submit Validation
function initLoginForm() {
  const form = document.getElementById('kf-login-form');
  if (!form) return;

  // If already logged in, display the authenticated session stage on login page
  const currentUser = window.KF_STATE ? window.KF_STATE.getUser() : null;
  if (currentUser && currentUser.isLoggedIn) {
    renderLoggedInState(currentUser);
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect');
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
      if (redirectParam.includes('dashboard')) {
        message = 'Please sign in to access your guest dashboard.';
      } else if (redirectParam.includes('menu')) {
        message = 'Please sign in to add dishes to your cart and continue ordering.';
      } else if (redirectParam.includes('order')) {
        message = 'Please sign in to send your table order to the grill.';
      }

      notice.innerHTML = `<i data-lucide="info" class="text-gold flex-shrink-0" style="width: 16px; height: 16px;"></i><span>${message}</span>`;
      formHeader.parentNode.insertBefore(notice, formHeader.nextSibling);
      if (window.lucide) window.lucide.createIcons();
    }
  }

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const emailError = document.getElementById('login-email-error');
  const passwordError = document.getElementById('login-password-error');

  const validator = window.KF_VALIDATOR;

  // Real-time clearance and blur validation
  if (emailInput && validator) {
    emailInput.addEventListener('input', () => validator.clearFieldError(emailInput, emailError));
    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      if (val) {
        if (val.includes('@')) {
          const res = validator.validateEmail(val);
          if (!res.valid) validator.setFieldError(emailInput, emailError, res.message);
          else validator.clearFieldError(emailInput, emailError);
        } else {
          const res = validator.validateName(val, true, 'Name');
          if (!res.valid) validator.setFieldError(emailInput, emailError, res.message);
          else validator.clearFieldError(emailInput, emailError);
        }
      }
    });
  }

  if (passwordInput && validator) {
    passwordInput.addEventListener('input', () => validator.clearFieldError(passwordInput, passwordError));
    passwordInput.addEventListener('blur', () => {
      if (passwordInput.value) {
        const res = validator.validatePassword(passwordInput.value, 6);
        if (!res.valid) validator.setFieldError(passwordInput, passwordError, res.message);
        else validator.clearFieldError(passwordInput, passwordError);
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validator) validator.clearFormErrors(form);

    const emailVal = emailInput ? emailInput.value.trim() : '';
    const passVal = passwordInput ? passwordInput.value : '';

    let isValid = true;
    let firstInvalidField = null;

    if (validator) {
      // Validate Email or Name
      if (!emailVal) {
        validator.setFieldError(emailInput, emailError, 'Email address or name is required.');
        isValid = false;
        if (!firstInvalidField) firstInvalidField = emailInput;
      } else if (emailVal.includes('@')) {
        const emailCheck = validator.validateEmail(emailVal, true);
        if (!emailCheck.valid) {
          validator.setFieldError(emailInput, emailError, emailCheck.message);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = emailInput;
        }
      } else {
        const nameCheck = validator.validateName(emailVal, true, 'Name');
        if (!nameCheck.valid) {
          validator.setFieldError(emailInput, emailError, nameCheck.message);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = emailInput;
        }
      }

      // Validate Password
      const passCheck = validator.validatePassword(passVal, 6, true);
      if (!passCheck.valid) {
        validator.setFieldError(passwordInput, passwordError, passCheck.message);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = passwordInput;
      }
    }

    if (!isValid) {
      if (firstInvalidField) firstInvalidField.focus();
      if (window.kfToast) window.kfToast.error('Please resolve the highlighted errors.', 'Sign In Required');
      return;
    }

    // Authenticate with Single Source of Truth
    let loggedUser = null;
    if (window.KF_STATE) {
      loggedUser = window.KF_STATE.login(emailVal, passVal);
    }
    const displayName = (loggedUser && loggedUser.name) ? loggedUser.name : emailVal;

    if (window.kfToast) {
      window.kfToast.success(`Welcome back, ${displayName}! You are successfully signed in.`, 'Sign In Successful');
    }

    // Do NOT redirect - stay on the login page stage only
    renderLoggedInState(loggedUser || { name: displayName, email: emailVal, points: 250, role: 'Grill VIP Member', isLoggedIn: true });
  });
}

// Render Authenticated State on the Login Page (Stay on Login Page)
function renderLoggedInState(user) {
  const card = document.querySelector('#main-content .kf-card');
  if (!card) return;

  const esc = window.escapeHtml || (s => (s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''));
  const name = user && user.name ? user.name : 'Guest User';
  const email = user && user.email ? user.email : 'guest@koreflame.com';
  const points = user && user.points !== undefined ? user.points : 250;
  const role = user && user.role ? user.role : 'Grill VIP Member';

  card.innerHTML = `
    <div class="text-center py-2">
      <!-- Success Icon -->
      <div class="dash-stat-icon icon-gold mx-auto mb-3" style="width: 64px; height: 64px; font-size: 1.8rem;">
        <i data-lucide="check-circle-2" class="text-success" style="width: 38px; height: 38px;"></i>
      </div>

      <span class="badge-tag badge-prime mb-2">Authenticated Session</span>
      <h3 class="mb-1 fw-extrabold text-primary-app">Sign In Successful</h3>
      <p class="text-secondary small mb-4">You are now actively signed in to your KoreFlame account.</p>

      <!-- Authenticated Profile Card -->
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
          <span>Membership Tier:</span>
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

      <!-- Quick Navigation Options -->
      <div class="d-flex flex-column gap-2 mb-3">
        <a href="dashboard.html" class="btn-flame py-2.5 justify-content-center">
          <i data-lucide="layout-dashboard" style="width: 18px; height: 18px;"></i>
          <span>Open Guest Dashboard</span>
        </a>
        <a href="menu.html" class="btn-flame-outline py-2.5 justify-content-center">
          <i data-lucide="utensils" style="width: 18px; height: 18px;"></i>
          <span>Browse Table Menu</span>
        </a>
      </div>

      <!-- Sign Out / Switch Account Option -->
      <div class="pt-3 border-top border-subtle">
        <button type="button" class="btn btn-sm btn-outline-secondary text-muted" id="btn-login-signout" onclick="handleAuthSignOut()">
          <i data-lucide="log-out" style="width: 14px; height: 14px;"></i>
          <span>Sign Out / Switch Account</span>
        </button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

// Global Sign Out handler from Login page
window.handleAuthSignOut = function() {
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

// 3. Register Form Handler with Live Filtering, Blur & Submit Validation
function initRegisterForm() {
  const form = document.getElementById('kf-register-form');
  const btnGoogle = document.getElementById('btn-signup-google');
  const btnApple = document.getElementById('btn-signup-apple');

  const validator = window.KF_VALIDATOR;

  // Social Sign-Up Quick Simulation
  if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
      if (window.KF_STATE) window.KF_STATE.loginDemoGuest();
      if (window.kfToast) window.kfToast.success('Google authentication verified. Account created with 200 bonus points!', 'Welcome to KoreFlame');
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || 'dashboard.html';
      setTimeout(() => {
        window.location.href = redirect;
      }, 800);
    });
  }

  if (btnApple) {
    btnApple.addEventListener('click', () => {
      if (window.KF_STATE) window.KF_STATE.loginDemoGuest();
      if (window.kfToast) window.kfToast.success('Apple ID verified. Account created with 200 bonus points!', 'Welcome to KoreFlame');
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || 'dashboard.html';
      setTimeout(() => {
        window.location.href = redirect;
      }, 800);
    });
  }

  if (!form) return;

  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const phoneInput = document.getElementById('reg-phone');
  const passwordInput = document.getElementById('reg-password');
  const confirmPassInput = document.getElementById('reg-confirm-password');
  const termsCheckbox = document.getElementById('agreeTerms');

  const nameError = document.getElementById('reg-name-error');
  const emailError = document.getElementById('reg-email-error');
  const phoneError = document.getElementById('reg-phone-error');
  const passwordError = document.getElementById('reg-password-error');
  const confirmPassError = document.getElementById('reg-confirm-password-error');
  const termsError = document.getElementById('agreeTerms-error');

  // Input filtering: prevent invalid characters during keystroke/paste
  if (validator) {
    validator.setupFieldFilter(nameInput, 'name');
    validator.setupFieldFilter(phoneInput, 'phone');
  }

  // Real-time clearance and blur validation
  if (nameInput && validator) {
    nameInput.addEventListener('input', () => validator.clearFieldError(nameInput, nameError));
    nameInput.addEventListener('blur', () => {
      if (nameInput.value.trim()) {
        const res = validator.validateName(nameInput.value, true, 'Full Name');
        if (!res.valid) validator.setFieldError(nameInput, nameError, res.message);
        else validator.clearFieldError(nameInput, nameError);
      }
    });
  }

  if (emailInput && validator) {
    emailInput.addEventListener('input', () => validator.clearFieldError(emailInput, emailError));
    emailInput.addEventListener('blur', () => {
      if (emailInput.value.trim()) {
        const res = validator.validateEmail(emailInput.value, true);
        if (!res.valid) validator.setFieldError(emailInput, emailError, res.message);
        else validator.clearFieldError(emailInput, emailError);
      }
    });
  }

  if (phoneInput && validator) {
    phoneInput.addEventListener('input', () => validator.clearFieldError(phoneInput, phoneError));
    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value.trim()) {
        const res = validator.validatePhone(phoneInput.value, false, 'Mobile phone');
        if (!res.valid) validator.setFieldError(phoneInput, phoneError, res.message);
        else validator.clearFieldError(phoneInput, phoneError);
      }
    });
  }

  if (passwordInput && validator) {
    passwordInput.addEventListener('input', () => {
      validator.clearFieldError(passwordInput, passwordError);
      if (confirmPassInput && confirmPassInput.value && confirmPassInput.value === passwordInput.value) {
        validator.clearFieldError(confirmPassInput, confirmPassError);
      }
    });
    passwordInput.addEventListener('blur', () => {
      if (passwordInput.value) {
        const res = validator.validatePassword(passwordInput.value, 6, true);
        if (!res.valid) validator.setFieldError(passwordInput, passwordError, res.message);
        else validator.clearFieldError(passwordInput, passwordError);
      }
    });
  }

  if (confirmPassInput && validator) {
    confirmPassInput.addEventListener('input', () => {
      validator.clearFieldError(confirmPassInput, confirmPassError);
      if (passwordInput && confirmPassInput.value === passwordInput.value) {
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validator) validator.clearFormErrors(form);

    const nameVal = nameInput ? nameInput.value : '';
    const emailVal = emailInput ? emailInput.value : '';
    const phoneVal = phoneInput ? phoneInput.value : '';
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

      // 3. Mobile Phone (Optional, but if entered must be valid)
      if (phoneVal.trim()) {
        const phoneCheck = validator.validatePhone(phoneVal, false, 'Mobile phone');
        if (!phoneCheck.valid) {
          validator.setFieldError(phoneInput, phoneError, phoneCheck.message);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = phoneInput;
        }
      }

      // 4. Password
      const passCheck = validator.validatePassword(passVal, 6, true);
      if (!passCheck.valid) {
        validator.setFieldError(passwordInput, passwordError, passCheck.message);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = passwordInput;
      }

      // 5. Confirm Password
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

    // Create session
    const newUser = {
      isLoggedIn: true,
      name: nameVal.trim(),
      email: emailVal.trim(),
      phone: phoneVal.trim() || '+1 (555) 000-0000',
      tier: 'Bronze Member',
      points: 200, // Welcome bonus
      role: 'guest',
      joinedDate: 'Today'
    };
    if (window.KF_STATE) {
      window.KF_STATE.saveUserAccount(newUser);
      window.KF_STATE.setUser(newUser);
    }
    if (window.kfToast) window.kfToast.success(`Welcome to KoreFlame, ${nameVal.trim()}! You earned 200 welcome points.`, 'Account Created');

    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect') || 'dashboard.html';
    setTimeout(() => {
      window.location.href = redirect;
    }, 850);
  });
}
