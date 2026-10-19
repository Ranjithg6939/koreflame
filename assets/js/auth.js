/**
 * KoreFlame - Authentication Controller
 * Login, Register, Password Visibility Toggles, Validation, Demo Quick Access & Redirection.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
});

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

// 2. Login Form Handler
function initLoginForm() {
  const form = document.getElementById('kf-login-form');
  const demoGuestBtn = document.getElementById('btn-demo-guest-login');
  const demoAdminBtn = document.getElementById('btn-demo-admin-login');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();

      // Basic client validation
      if (!email || !email.includes('@')) {
        window.kfToast.error('Please enter a valid email address.', 'Invalid Email');
        return;
      }
      if (!password || password.length < 6) {
        window.kfToast.error('Password must contain at least 6 characters.', 'Invalid Password');
        return;
      }

      // Successful simulated login
      window.KF_STATE.loginDemoGuest();
      window.kfToast.success(`Welcome back, Min-Ji Kim! Redirecting to your Guest Dashboard...`, 'Login Successful');

      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || 'dashboard.html';

      setTimeout(() => {
        window.location.href = redirect;
      }, 900);
    });
  }

  // Quick Demo Guest Login Button
  if (demoGuestBtn) {
    demoGuestBtn.addEventListener('click', () => {
      window.KF_STATE.loginDemoGuest();
      window.kfToast.success('Logged in as Demo Guest (Min-Ji Kim).', 'Demo Session Active');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    });
  }

  // Quick Demo Admin Login Button
  if (demoAdminBtn) {
    demoAdminBtn.addEventListener('click', () => {
      window.KF_STATE.loginAdminDemo();
      window.kfToast.success('Logged in as Executive Admin.', 'Admin Session Active');
      setTimeout(() => {
        window.location.href = 'admin/index.html';
      }, 700);
    });
  }
}

// 3. Register Form Handler
function initRegisterForm() {
  const form = document.getElementById('kf-register-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const confirmPass = document.getElementById('reg-confirm-password').value.trim();

    if (!name || name.length < 2) {
      window.kfToast.error('Please enter your full name.', 'Name Required');
      return;
    }
    if (!email || !email.includes('@')) {
      window.kfToast.error('Please provide a valid email.', 'Invalid Email');
      return;
    }
    if (!password || password.length < 6) {
      window.kfToast.error('Password must be at least 6 characters.', 'Password Policy');
      return;
    }
    if (password !== confirmPass) {
      window.kfToast.error('Passwords do not match. Please re-enter carefully.', 'Mismatch Error');
      return;
    }

    // Create session
    const newUser = {
      isLoggedIn: true,
      name: name,
      email: email,
      phone: phone || '+1 (555) 000-0000',
      tier: 'Bronze Member',
      points: 200, // Welcome bonus
      role: 'guest',
      joinedDate: 'Today'
    };
    window.KF_STATE.setUser(newUser);
    window.kfToast.success(`Welcome to KoreFlame, ${name}! You earned 200 welcome points.`, 'Account Created');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  });
}
