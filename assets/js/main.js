/**
 * KoreFlame - Core Global Logic
 * Handles Sticky Header, Navigation, Cart Drawer, Theme & Auth UI Synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initStickyHeader();
  initActiveNavLink();
  initNavDropdowns();
  initMobileNavigation();
  initThemeToggles();
  initCartDrawer();
  syncNavAuthState();
  if (window.KF_STATE && typeof window.KF_STATE.syncServerSession === 'function') {
    window.KF_STATE.syncServerSession().then(() => syncNavAuthState());
  }
  initScrollAnimations();
  initEmberBackground();
  initTactileButtons();

  // Listen to State Events
  window.addEventListener('kf:auth-changed', () => syncNavAuthState());
  window.addEventListener('kf:cart-changed', (e) => renderCartDrawer(e.detail));
});

// 1. Lucide Icons Helper
function initIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// 2. Sticky Header Behavior
function initStickyHeader() {
  const header = document.querySelector('.kf-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// 3. Mark Current Page Active in Navbar
function initActiveNavLink() {
  const path = window.location.pathname;
  const page = path.split("/").pop() || 'index.html';
  const isHome = (page === 'index.html' || page === 'index-2.html' || page === '');
  
  const navLinks = document.querySelectorAll('.nav-link-custom, .dropdown-link-custom, .sidebar-nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split("/").pop();
    if (linkPage === page || (page === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Ensure Home dropdown toggle active state
  const homeToggle = document.getElementById('homeDropdownToggle');
  if (homeToggle) {
    if (isHome) {
      homeToggle.classList.add('active');
    } else {
      homeToggle.classList.remove('active');
    }
  }
}

// 3b. Interactive Nav Dropdowns (Click-to-Toggle, Touch, Outside Click, Keyboard Accessibility)
function initNavDropdowns() {
  const dropdownItems = document.querySelectorAll('.nav-dropdown-item');
  
  dropdownItems.forEach(item => {
    const toggle = item.querySelector('.nav-dropdown-toggle') || item.querySelector('.nav-link-custom');
    const menu = item.querySelector('.dropdown-menu-custom');
    if (!toggle || !menu) return;

    toggle.setAttribute('aria-haspopup', 'true');
    if (!toggle.hasAttribute('aria-expanded')) {
      toggle.setAttribute('aria-expanded', 'false');
    }

    function openDropdown() {
      // Close other open dropdowns
      dropdownItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherToggle = other.querySelector('.nav-dropdown-toggle') || other.querySelector('.nav-link-custom');
          if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function closeDropdown() {
      item.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function toggleDropdown(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (item.classList.contains('open')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    }

    // Click & Touch Event on Toggle
    toggle.addEventListener('click', toggleDropdown);

    // Keyboard Accessibility on Toggle
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openDropdown();
        const firstLink = menu.querySelector('a.dropdown-link-custom');
        if (firstLink) firstLink.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
      }
    });

    // Keyboard Navigation inside the Dropdown Menu
    const menuLinks = menu.querySelectorAll('a.dropdown-link-custom');
    menuLinks.forEach((link, idx) => {
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeDropdown();
          toggle.focus();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = menuLinks[idx + 1] || menuLinks[0];
          next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = menuLinks[idx - 1] || menuLinks[menuLinks.length - 1];
          prev.focus();
        }
      });

      // Close dropdown when selecting an option (navigation follows naturally)
      link.addEventListener('click', () => {
        closeDropdown();
      });
    });
  });

  // Global Click Outside to Close
  document.addEventListener('click', (e) => {
    dropdownItems.forEach(item => {
      if (!item.contains(e.target)) {
        item.classList.remove('open');
        const toggle = item.querySelector('.nav-dropdown-toggle') || item.querySelector('.nav-link-custom');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Global Escape Key to Close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownItems.forEach(item => {
        if (item.classList.contains('open')) {
          item.classList.remove('open');
          const toggle = item.querySelector('.nav-dropdown-toggle') || item.querySelector('.nav-link-custom');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.focus();
          }
        }
      });
    }
  });

  // Mobile Drawer Dropdown Accordion
  const mobileDropdowns = document.querySelectorAll('.mobile-dropdown-item');
  mobileDropdowns.forEach(mItem => {
    const mToggle = mItem.querySelector('.mobile-dropdown-toggle');
    const mMenu = mItem.querySelector('.mobile-dropdown-menu');
    if (!mToggle || !mMenu) return;

    mToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = mItem.classList.contains('open');
      if (isOpen) {
        mItem.classList.remove('open');
        mToggle.setAttribute('aria-expanded', 'false');
      } else {
        mItem.classList.add('open');
        mToggle.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// 4. Mobile Drawer
function initMobileNavigation() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-nav-backdrop');
  const closeBtn = document.querySelector('.mobile-drawer-close');

  if (!toggleBtn || !drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    initIcons();
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  // Close drawer and smooth-scroll on link clicks
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // If user clicked the chevron icon or dropdown toggle button inside/beside the link, toggle submenu instead
      if (e.target.closest('.mobile-dropdown-toggle-btn') || e.target.closest('.mobile-dropdown-chevron') || e.target.closest('[data-lucide="chevron-down"]')) {
        return;
      }

      const href = link.getAttribute('href');
      if (!href || href === '#' || href.startsWith('javascript:')) return;

      const linkPage = (href.split('/').pop().split('#')[0] || 'index.html').toLowerCase();
      const isCurrentPage = (linkPage === currentPage) || (linkPage === '' && (currentPage === 'index.html' || currentPage === ''));

      closeDrawer();

      if (isCurrentPage && !href.includes('#')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Mobile Subnav Dropdown Accordion Toggle
  function toggleMobileSubnav(subnav, toggleBtn) {
    if (!subnav) return;
    const isCurrentlyHidden = subnav.classList.contains('collapsed') || window.getComputedStyle(subnav).display === 'none';

    if (isCurrentlyHidden) {
      subnav.style.display = 'flex';
      subnav.classList.remove('collapsed');
      if (toggleBtn) {
        toggleBtn.classList.remove('collapsed');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    } else {
      subnav.style.display = 'none';
      subnav.classList.add('collapsed');
      if (toggleBtn) {
        toggleBtn.classList.add('collapsed');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
    initIcons();
  }

  const dropdownToggles = drawer.querySelectorAll('.mobile-dropdown-toggle-btn');
  dropdownToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parentDropdown = btn.closest('.mobile-nav-dropdown') || btn.closest('.mobile-nav-item');
      if (!parentDropdown) return;
      const subnav = parentDropdown.querySelector('.mobile-subnav');
      toggleMobileSubnav(subnav, btn);
    });
  });

  // Also support clicking directly on any chevron icon within mobile-nav-item
  const navDropdowns = drawer.querySelectorAll('.mobile-nav-item, .mobile-nav-dropdown');
  navDropdowns.forEach(dropdown => {
    const chevronIcon = dropdown.querySelector('.mobile-dropdown-chevron, [data-lucide="chevron-down"]');
    if (chevronIcon) {
      chevronIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const subnav = dropdown.querySelector('.mobile-subnav');
        const btn = dropdown.querySelector('.mobile-dropdown-toggle-btn');
        toggleMobileSubnav(subnav, btn);
      });
    }
  });
}

// 5. Theme & RTL Toggles
function syncThemeLogos(theme) {
  const currentTheme = theme || (window.KF_STATE ? window.KF_STATE.getTheme() : 'dark');
  const isLight = currentTheme === 'light';
  const isInsideAdmin = window.location.pathname.includes('/admin/');
  const basePath = isInsideAdmin ? '../assets/images/' : 'assets/images/';
  const targetLogo = basePath + (isLight ? 'logo-light.png' : 'logo-dark.png');
  document.querySelectorAll('.brand-logo-img').forEach(img => {
    img.src = targetLogo;
  });
}

function initThemeToggles() {
  syncThemeLogos();
  window.addEventListener('kf:theme-changed', (e) => syncThemeLogos(e.detail));

  const themeBtns = document.querySelectorAll('.kf-theme-toggle');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const newTheme = window.KF_STATE.toggleTheme();
      syncThemeLogos(newTheme);
      window.kfToast.info(`Switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} theme`, 'Theme Updated');
      initIcons();
    });
  });

  const rtlBtns = document.querySelectorAll('.kf-rtl-toggle');
  rtlBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const newDir = window.KF_STATE.toggleRTL();
      window.kfToast.info(`Direction set to ${newDir.toUpperCase()}`, 'Layout Updated');
    });
  });
}

// 6. Nav Auth State Sync & User Account Dropdown
function getInitials(name) {
  if (!name || typeof name !== 'string') return 'MK';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function syncNavAuthState() {
  const user = window.KF_STATE ? window.KF_STATE.getUser() : { isLoggedIn: false };
  const esc = window.escapeHtml || (s => s);
  const initials = getInitials(user ? user.name : '');
  const avatarMarkup = (user && user.avatar)
    ? `<img src="${esc(user.avatar)}" alt="${esc(user.name)}" class="avatar-img" onerror="this.remove(); this.parentElement.textContent='${esc(initials)}';">`
    : esc(initials);

  // A. Desktop Navbar Synchronization (.nav-actions)
  const navActionsList = document.querySelectorAll('.nav-actions');
  navActionsList.forEach(navActions => {
    // Check if user wrap or login link already exists
    let existingWrap = navActions.querySelector('.nav-user-dropdown-wrap');
    let existingLoginLink = navActions.querySelector('.btn-nav-account, a[href="login.html"], a[title="Guest Account"], a[title="Sign In / Register"]');

    if (user && user.isLoggedIn && user.name) {
      if (!existingWrap) {
        const wrap = document.createElement('div');
        wrap.className = 'nav-user-dropdown-wrap position-relative d-inline-block';
        wrap.id = 'kf-nav-user-wrap';
        wrap.innerHTML = `
          <button type="button" class="btn-icon-nav nav-user-toggle d-flex align-items-center justify-content-center" id="kf-user-dropdown-toggle" aria-haspopup="true" aria-expanded="false" aria-label="User Account Menu" title="${esc(user.name)} (${esc(user.tier || 'Member')})">
            <span class="nav-user-avatar">${avatarMarkup}</span>
          </button>
          <div class="nav-user-dropdown-menu shadow-lg" id="kf-user-dropdown-menu" role="menu" aria-labelledby="kf-user-dropdown-toggle">
            <a href="dashboard.html#profile" class="nav-user-dropdown-header d-block text-decoration-none">
              <div class="fw-bold text-primary-app text-truncate nav-user-display-name" style="font-size: 0.95rem;">${esc(user.name)}</div>
              <div class="small text-gold text-truncate nav-user-display-tier" style="font-size: 0.78rem;">${esc(user.tier || 'Member')} · ${user.points || 0} pts · <span class="text-decoration-underline">View Profile</span></div>
            </a>
            <div class="nav-user-dropdown-divider"></div>
            <a href="dashboard.html#profile" class="nav-user-dropdown-item" role="menuitem">
              <i data-lucide="user" style="width: 16px; height: 16px;"></i>
              <span>My Profile</span>
            </a>
            <a href="dashboard.html#orders" class="nav-user-dropdown-item" role="menuitem">
              <i data-lucide="flame" style="width: 16px; height: 16px;"></i>
              <span>My Orders</span>
            </a>
            <a href="dashboard.html#reservations" class="nav-user-dropdown-item" role="menuitem">
              <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
              <span>My Reservations</span>
            </a>
            <a href="dashboard.html" class="nav-user-dropdown-item" role="menuitem">
              <i data-lucide="layout-dashboard" style="width: 16px; height: 16px;"></i>
              <span>My Dashboard</span>
            </a>
            <a href="cart.html" class="nav-user-dropdown-item" role="menuitem">
              <i data-lucide="shopping-cart" style="width: 16px; height: 16px;"></i>
              <span>My Cart</span>
            </a>
            <div class="nav-user-dropdown-divider"></div>
            <button type="button" class="nav-user-dropdown-item text-danger w-100 text-start border-0 bg-transparent" role="menuitem" onclick="window.handleLogout()">
              <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
              <span>Logout</span>
            </button>
          </div>
        `;

        if (existingLoginLink) {
          existingLoginLink.replaceWith(wrap);
        } else {
          const mobileToggle = navActions.querySelector('.mobile-nav-toggle');
          if (mobileToggle) {
            navActions.insertBefore(wrap, mobileToggle);
          } else {
            navActions.appendChild(wrap);
          }
        }
        setupUserDropdownInteractions(wrap);
      } else {
        // ALWAYS synchronize actual authenticated user's name, tier and avatar
        const avatar = existingWrap.querySelector('.nav-user-avatar');
        const nameEl = existingWrap.querySelector('.nav-user-display-name, .nav-user-dropdown-header .fw-bold');
        const tierEl = existingWrap.querySelector('.nav-user-display-tier, .nav-user-dropdown-header .small.text-gold');
        const toggleBtn = existingWrap.querySelector('#kf-user-dropdown-toggle');

        if (avatar) avatar.innerHTML = avatarMarkup;
        if (nameEl) nameEl.textContent = user.name;
        if (tierEl) tierEl.textContent = `${user.tier || 'Member'} · ${user.points || 0} pts · View Profile`;
        if (toggleBtn) toggleBtn.setAttribute('title', `${user.name} (${user.tier || 'Member'})`);
      }
    } else {
      // User is logged out
      if (existingWrap) {
        const loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.className = 'btn-icon-nav btn-nav-account d-inline-flex';
        loginLink.setAttribute('aria-label', 'Account Login');
        loginLink.setAttribute('title', 'Sign In / Register');
        loginLink.innerHTML = '<i data-lucide="user" style="width: 18px; height: 18px;"></i>';
        existingWrap.replaceWith(loginLink);
      }
    }
  });

  // B. Mobile Drawer Synchronization
  const mobileDrawers = document.querySelectorAll('.mobile-nav-drawer');
  mobileDrawers.forEach(drawer => {
    let authSection = drawer.querySelector('.mobile-drawer-auth');
    if (authSection) {
      if (user && user.isLoggedIn) {
        authSection.innerHTML = `
          <div class="p-3 bg-secondary-app rounded-3 border border-subtle mb-2">
            <div class="d-flex align-items-center gap-2 mb-2">
              <div class="nav-user-avatar" style="width: 34px; height: 34px; font-size: 0.82rem;">${avatarMarkup}</div>
              <div class="min-w-0">
                <div class="fw-bold text-primary-app text-truncate small">${esc(user.name)}</div>
                <div class="text-gold small" style="font-size: 0.72rem;">${esc(user.tier || 'Member')} · ${user.points || 0} pts</div>
              </div>
            </div>
            <div class="d-flex flex-column gap-1 pt-2 border-top border-subtle small">
              <a href="dashboard.html#profile" class="nav-link-custom py-1 d-flex align-items-center gap-2"><i data-lucide="user" style="width: 15px; height: 15px;"></i><span>My Profile</span></a>
              <a href="dashboard.html#orders" class="nav-link-custom py-1 d-flex align-items-center gap-2"><i data-lucide="flame" style="width: 15px; height: 15px;"></i><span>My Orders</span></a>
              <a href="dashboard.html#reservations" class="nav-link-custom py-1 d-flex align-items-center gap-2"><i data-lucide="calendar" style="width: 15px; height: 15px;"></i><span>My Reservations</span></a>
              <a href="dashboard.html" class="nav-link-custom py-1 d-flex align-items-center gap-2"><i data-lucide="layout-dashboard" style="width: 15px; height: 15px;"></i><span>My Dashboard</span></a>
              <a href="cart.html" class="nav-link-custom py-1 d-flex align-items-center gap-2"><i data-lucide="shopping-cart" style="width: 15px; height: 15px;"></i><span>My Cart</span></a>
            </div>
          </div>
          <button type="button" class="btn-flame-outline w-100 text-danger border-danger d-flex align-items-center justify-content-center gap-2" onclick="window.handleLogout()">
            <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
            <span>Logout</span>
          </button>
        `;
      } else {
        authSection.innerHTML = `
          <a href="login.html" class="btn-flame-outline w-100 d-flex align-items-center justify-content-center gap-2">
            <i data-lucide="user" style="width: 16px; height: 16px;"></i>
            <span>Sign In / Register</span>
          </a>
        `;
      }
    } else {
      let legacyAuth = drawer.querySelector('.pt-3.border-top');
      if (legacyAuth) {
        if (user && user.isLoggedIn) {
          legacyAuth.innerHTML = `
            <div class="p-3 bg-secondary-app rounded-3 border border-subtle mb-3">
              <div class="d-flex align-items-center gap-2 mb-2">
                <div class="nav-user-avatar" style="width: 34px; height: 34px; font-size: 0.82rem;">${avatarMarkup}</div>
                <div class="min-w-0">
                  <div class="fw-bold text-primary-app text-truncate small">${esc(user.name)}</div>
                  <div class="text-gold small" style="font-size: 0.72rem;">${esc(user.tier || 'Member')} · ${user.points || 0} pts</div>
                </div>
              </div>
              <div class="d-flex flex-column gap-1 pt-2 border-top border-subtle small">
                <a href="dashboard.html#profile" class="nav-link-custom py-1 d-flex align-items-center gap-2"><i data-lucide="user" style="width: 15px; height: 15px;"></i><span>My Profile</span></a>
                <a href="dashboard.html#orders" class="nav-link-custom py-1 d-flex align-items-center gap-2"><i data-lucide="flame" style="width: 15px; height: 15px;"></i><span>My Orders</span></a>
                <a href="dashboard.html#reservations" class="nav-link-custom py-1 d-flex align-items-center gap-2"><i data-lucide="calendar" style="width: 15px; height: 15px;"></i><span>My Reservations</span></a>
                <a href="dashboard.html" class="nav-link-custom py-1 d-flex align-items-center gap-2"><i data-lucide="layout-dashboard" style="width: 15px; height: 15px;"></i><span>My Dashboard</span></a>
                <a href="cart.html" class="nav-link-custom py-1 d-flex align-items-center gap-2"><i data-lucide="shopping-cart" style="width: 15px; height: 15px;"></i><span>My Cart</span></a>
              </div>
            </div>
            <a href="pricing.html#reservations" class="btn-flame w-100 mb-2">Book Table Now</a>
            <button type="button" class="btn-flame-outline w-100 text-danger border-danger d-flex align-items-center justify-content-center gap-2" onclick="window.handleLogout()">
              <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
              <span>Logout</span>
            </button>
          `;
        } else {
          legacyAuth.innerHTML = `
            <a href="pricing.html#reservations" class="btn-flame w-100 mb-2">Book Table Now</a>
            <a href="login.html" class="btn-flame-outline w-100">Sign In / Register</a>
          `;
        }
      }
    }
  });

  initIcons();
}

function setupUserDropdownInteractions(wrap) {
  if (!wrap || wrap.dataset.kfDropdownBound) return;
  wrap.dataset.kfDropdownBound = 'true';

  const toggle = wrap.querySelector('#kf-user-dropdown-toggle');
  const menu = wrap.querySelector('#kf-user-dropdown-menu');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menu.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('show');
    if (isOpen) closeMenu();
    else openMenu();
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('show')) {
      closeMenu();
      toggle.focus();
    }
  });
}

window.handleLogout = async function() {
  let confirmed = false;
  if (window.kfConfirm) {
    confirmed = await window.kfConfirm({
      title: 'Sign Out of KoreFlame?',
      message: 'Are you sure you want to sign out of your KoreFlame account? You will need to sign in again to access your account dashboard.',
      confirmText: 'Sign Out',
      cancelText: 'Stay Signed In',
      type: 'logout'
    });
  } else {
    confirmed = confirm('Are you sure you want to sign out of your KoreFlame account?');
  }

  if (!confirmed) {
    return;
  }
  if (window.KF_STATE) {
    await window.KF_STATE.logout();
  }
  if (window.kfToast) {
    window.kfToast.info('You have safely signed out of your KoreFlame session.', 'Signed Out');
  }
  syncNavAuthState();
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 400);
};

// 7. Cart Drawer Management
window.openCartDrawer = function() {
  const drawer = document.getElementById('kf-cart-drawer');
  const backdrop = document.getElementById('kf-cart-backdrop');
  if (drawer) drawer.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Automatically close mobile nav drawer if open
  const navDrawer = document.querySelector('.mobile-nav-drawer');
  const navBackdrop = document.querySelector('.mobile-nav-backdrop');
  if (navDrawer) navDrawer.classList.remove('active');
  if (navBackdrop) navBackdrop.classList.remove('active');

  if (window.KF_STATE && typeof renderCartDrawer === 'function') {
    renderCartDrawer(window.KF_STATE.getCart());
  }
};

window.closeCartDrawer = function() {
  const drawer = document.getElementById('kf-cart-drawer');
  const backdrop = document.getElementById('kf-cart-backdrop');
  if (drawer) drawer.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
};

function initCartDrawer() {
  const openBtns = document.querySelectorAll('.cart-open-btn');
  const backdrop = document.getElementById('kf-cart-backdrop');
  const closeBtn = document.getElementById('kf-cart-close');

  openBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.openCartDrawer();
  }));
  if (closeBtn) closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.closeCartDrawer();
  });
  if (backdrop) backdrop.addEventListener('click', () => window.closeCartDrawer());

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeCartDrawer();
    }
  });

  // Initial render of cart badge count
  if (window.KF_STATE) {
    updateCartBadge(window.KF_STATE.getCart());
  }
}

function updateCartBadge(cart) {
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  const badges = document.querySelectorAll('.cart-counter-badge');
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

function renderCartDrawer(cart) {
  updateCartBadge(cart);
  const container = document.getElementById('kf-cart-items-list');
  const totalEl = document.getElementById('kf-cart-subtotal');
  if (!container || !totalEl) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i data-lucide="shopping-bag" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i>
        <h5 class="text-subtle">Your Table Cart is Empty</h5>
        <p class="text-muted small">Explore our prime cuts, banchan, and signature platters.</p>
        <a href="menu.html" class="btn-flame-outline btn-sm-custom mt-2">Browse Menu</a>
      </div>
    `;
    totalEl.textContent = "$0.00";
    initIcons();
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    return `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.nameEn}" class="cart-item-img">
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-start">
            <h6 class="mb-1">${item.nameEn}</h6>
            <button class="btn p-0 text-muted" onclick="removeCartItem('${item.id}')" title="Remove Item">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
          <div class="text-gold font-weight-bold mb-2">$${item.price.toFixed(2)}</div>
          <div class="d-flex align-items-center gap-2">
            <button class="qty-control-btn" onclick="adjustCartQty('${item.id}', ${item.qty - 1})">-</button>
            <span class="px-2 font-weight-bold">${item.qty}</span>
            <button class="qty-control-btn" onclick="adjustCartQty('${item.id}', ${item.qty + 1})">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  totalEl.textContent = `$${subtotal.toFixed(2)}`;
  initIcons();
}

window.adjustCartQty = function(itemId, newQty) {
  window.KF_STATE.updateCartQty(itemId, newQty);
};

window.removeCartItem = function(itemId) {
  window.KF_STATE.updateCartQty(itemId, 0);
  window.kfToast.info('Item removed from your cart.', 'Cart Updated');
};

// Global Add to Cart handler covering menu items, combos, packages, and cuts
window.handleAddMenuItem = function(itemId) {
  // 1. Login Required check (Requirement 1)
  const user = window.KF_STATE ? window.KF_STATE.getUser() : null;
  if (!user || !user.isLoggedIn) {
    const currentPath = window.location.pathname.split('/').pop() || 'menu.html';
    const redirectUrl = currentPath + window.location.search;
    if (window.kfToast) {
      window.kfToast.show(
        'Please sign in to add items to your cart.',
        'info',
        'Sign In Required',
        6500,
        { text: 'Sign In', href: `login.html?redirect=${encodeURIComponent(redirectUrl)}` }
      );
    }
    return; // Do not add items to the cart before authentication
  }

  let item = null;
  if (window.KF_DATA) {
    if (window.KF_DATA.menuItems) item = window.KF_DATA.menuItems.find(i => i.id === itemId);
    if (!item && window.KF_DATA.combos) {
      const combo = window.KF_DATA.combos.find(c => c.id === itemId);
      if (combo) {
        item = {
          id: combo.id,
          nameEn: combo.title,
          nameKr: combo.titleKr || '',
          price: combo.price,
          image: combo.image
        };
      }
    }
    if (!item && window.KF_DATA.packages) {
      const pkg = window.KF_DATA.packages.find(p => p.id === itemId);
      if (pkg) {
        item = {
          id: pkg.id,
          nameEn: pkg.title || pkg.nameEn,
          nameKr: pkg.titleKr || pkg.nameKr || '',
          price: pkg.price,
          image: pkg.image
        };
      }
    }
    if (!item && window.KF_DATA.grillCuts) {
      const cut = window.KF_DATA.grillCuts.find(c => c.id === itemId);
      if (cut) {
        item = {
          id: cut.id,
          nameEn: cut.nameEn,
          nameKr: cut.nameKr || '',
          price: cut.price,
          image: cut.image
        };
      }
    }
  }

  if (!item) {
    console.warn("Item not found for ID:", itemId);
    return;
  }

  window.KF_STATE.addToCart({
    id: item.id,
    nameEn: item.nameEn,
    nameKr: item.nameKr || '',
    price: item.price,
    image: item.image
  }, 1);

  if (window.kfToast) {
    window.kfToast.success(`${item.nameEn} added to your table order!`, 'Grill Cart Updated');
  }

  // Animate cart button
  triggerCartBounce();

  // Immediately open the Cart Drawer
  if (typeof window.openCartDrawer === 'function') {
    window.openCartDrawer();
  }
};

function triggerCartBounce() {
  const cartBtns = document.querySelectorAll('.cart-open-btn');
  cartBtns.forEach(btn => {
    btn.classList.remove('kf-cart-bounce');
    // Force reflow
    void btn.offsetWidth;
    btn.classList.add('kf-cart-bounce');
    setTimeout(() => btn.classList.remove('kf-cart-bounce'), 650);
  });
}
window.triggerCartBounce = triggerCartBounce;

window.proceedToCheckout = function() {
  const user = window.KF_STATE ? window.KF_STATE.getUser() : null;
  const cart = window.KF_STATE ? window.KF_STATE.getCart() : [];

  // 1. If cart is empty, prevent navigation and display clear warning
  if (!cart || cart.length === 0) {
    if (window.kfToast) {
      window.kfToast.warning('Your cart is empty. Add dishes before placing an order.', 'Empty Cart');
    }
    return;
  }

  // Close drawer if open
  if (typeof window.closeCartDrawer === 'function') {
    window.closeCartDrawer();
  } else {
    const drawer = document.getElementById('kf-cart-drawer');
    const backdrop = document.getElementById('kf-cart-backdrop');
    if (drawer) drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 2. If user is logged out, redirect to login page with return URL to order.html
  if (!user || !user.isLoggedIn) {
    if (window.kfToast) {
      window.kfToast.info('Please sign in before sending your order to the grill.', 'Sign In Required');
    }
    setTimeout(() => {
      window.location.href = 'login.html?redirect=order.html';
    }, 700);
    return;
  }

  // 3. Navigate directly to Order page preserving cart state in localStorage
  window.location.href = 'order.html';
};

// ==========================================================================
// Restaurant Content-Matched Animation Handlers
// ==========================================================================

// 1. Scroll-triggered Reveal Observer
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.kf-reveal, .kf-reveal-left, .kf-reveal-right, .kf-reveal-scale');
  if (!revealElements.length) return;

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// 2. Charcoal Grill Floating Ember Particle Emitter
function initEmberBackground() {
  // Respect prefers-reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const containers = document.querySelectorAll('.kf-has-embers');
  if (!containers.length) return;

  containers.forEach(container => {
    // Prevent duplicate canvases
    if (container.querySelector('.kf-ember-canvas-container')) return;

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'kf-ember-canvas-container';
    const canvas = document.createElement('canvas');
    canvas.className = 'kf-ember-canvas';
    canvasWrap.appendChild(canvas);
    container.insertBefore(canvasWrap, container.firstChild);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let isVisible = false;
    let animFrameId = null;

    function resize() {
      width = canvas.width = container.offsetWidth;
      height = canvas.height = container.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Ember Particle Configuration
    const count = Math.min(24, Math.max(12, Math.floor(width / 60)));
    const colors = [
      'rgba(255, 118, 40, ',   // Ember orange
      'rgba(230, 57, 36, ',    // Flame red
      'rgba(245, 211, 108, ',  // Golden spark
      'rgba(255, 160, 60, '    // Bright amber
    ];

    class EmberParticle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 2.2 + 0.8;
        this.speedY = Math.random() * 0.8 + 0.4;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.baseAlpha = Math.random() * 0.7 + 0.3;
        this.alpha = this.baseAlpha;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.03 + 0.015;
      }

      update() {
        this.y -= this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.wobble) * 0.45;

        // Fade out as it nears top
        const progress = this.y / height;
        this.alpha = this.baseAlpha * Math.min(1, progress * 1.5);

        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset(false);
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.shadowColor = '#FF7628';
        ctx.shadowBlur = this.size * 3;
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new EmberParticle());
    }

    function render() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);
      ctx.shadowBlur = 0;

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      animFrameId = requestAnimationFrame(render);
    }

    // Pause rendering when outside viewport to conserve GPU & battery
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (!animFrameId) render();
        } else {
          if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
          }
        }
      }, { threshold: 0.05 });
      io.observe(container);
    } else {
      isVisible = true;
      render();
    }
  });
}

// 3. Tactile Feedback on Buttons
function initTactileButtons() {
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.btn-flame, .btn-flame-outline, .meat-selector-btn');
    if (!btn) return;
    btn.style.transition = 'transform 0.08s ease';
    btn.style.transform = 'scale(0.96) translateY(1px)';
  });

  document.addEventListener('pointerup', (e) => {
    const btn = e.target.closest('.btn-flame, .btn-flame-outline, .meat-selector-btn');
    if (!btn) return;
    btn.style.transform = '';
    setTimeout(() => { btn.style.transition = ''; }, 150);
  });
}

