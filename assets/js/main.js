/**
 * KoreFlame - Core Global Logic
 * Handles Sticky Header, Navigation, Cart Drawer, Theme & Auth UI Synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initStickyHeader();
  initActiveNavLink();
  initMobileNavigation();
  initThemeToggles();
  initCartDrawer();
  syncNavAuthState();
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
  
  const navLinks = document.querySelectorAll('.nav-link-custom, .dropdown-link-custom, .sidebar-nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split("/").pop();
    if (linkPage === page || (page === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
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
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
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

// 6. Nav Auth State Sync
function syncNavAuthState() {
  const user = window.KF_STATE.getUser();
  const authContainer = document.querySelectorAll('.nav-auth-container');

  authContainer.forEach(container => {
    if (user.isLoggedIn) {
      container.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <a href="dashboard.html" class="btn-flame-outline btn-sm-custom">
            <i data-lucide="user" style="width: 16px; height: 16px;"></i>
            <span>Dashboard</span>
          </a>
          <button type="button" class="btn-icon-nav text-danger" title="Logout" onclick="handleLogout()">
            <i data-lucide="log-out" style="width: 18px; height: 18px;"></i>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <a href="login.html" class="btn-flame btn-sm-custom">
          <i data-lucide="log-in" style="width: 16px; height: 16px;"></i>
          <span>Guest Login</span>
        </a>
      `;
    }
  });

  initIcons();
}

window.handleLogout = function() {
  window.KF_STATE.logout();
  window.kfToast.info('You have safely logged out of your KoreFlame session.', 'Logged Out');
  setTimeout(() => {
    window.location.reload();
  }, 700);
};

// 7. Cart Drawer Management
function initCartDrawer() {
  const openBtns = document.querySelectorAll('.cart-open-btn');
  const drawer = document.getElementById('kf-cart-drawer');
  const backdrop = document.getElementById('kf-cart-backdrop');
  const closeBtn = document.getElementById('kf-cart-close');

  if (!drawer) return;

  function openCart() {
    drawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCartDrawer(window.KF_STATE.getCart());
  }

  function closeCart() {
    drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => btn.addEventListener('click', openCart));
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (backdrop) backdrop.addEventListener('click', closeCart);

  // Initial render of cart badge count
  updateCartBadge(window.KF_STATE.getCart());
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
  const user = window.KF_STATE.getUser();
  const cart = window.KF_STATE.getCart();

  if (cart.length === 0) {
    window.kfToast.warning('Your cart is empty. Add cuts or feast platters first!', 'Empty Cart');
    return;
  }

  if (!user.isLoggedIn) {
    window.kfToast.info('Demo Mode: You can sign in for rewards or test guest demo checkout directly.', 'Guest Notice');
  }

  // Demo order placement with honest prototype messaging
  const orderRef = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  window.KF_STATE.clearCart();
  window.kfToast.success(`Table order #${orderRef} simulated! (Demo System: in production this routes to POS / kitchen ticket display).`, 'Demo Order Placed');
  
  // Close drawer
  const drawer = document.getElementById('kf-cart-drawer');
  const backdrop = document.getElementById('kf-cart-backdrop');
  if (drawer) drawer.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
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

