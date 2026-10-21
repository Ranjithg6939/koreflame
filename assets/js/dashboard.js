function renderOrdersTab() {
  const tbody = document.getElementById('dash-orders-tbody');
  if (!tbody || !window.KF_STATE) return;

  const orders = window.KF_STATE.getOrders ? window.KF_STATE.getOrders() : [];
  const esc = window.escapeHtml || (s => s);

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-muted">
          No table orders recorded yet. <a href="menu.html" class="text-flame fw-bold ms-1">Browse Menu</a>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(ord => {
    const dishesList = (ord.items || []).map(i => `${i.qty}x ${esc(i.nameEn)}`).join(', ');
    const isCompleted = ord.status === 'Completed';
    let dateFormatted = 'Today';
    try {
      if (ord.createdAt) {
        dateFormatted = new Date(ord.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    } catch (e) {}

    return `
      <tr>
        <td><strong class="text-flame">${esc(ord.id)}</strong></td>
        <td><span class="small text-secondary">${dateFormatted}</span></td>
        <td><span class="fw-semibold text-primary-app">${esc(ord.tableNumber || 'Table Grill')}</span></td>
        <td><span class="small text-secondary">${dishesList || 'Artisanal cuts'}</span></td>
        <td><strong class="text-gold">$${Number(ord.total || 0).toFixed(2)}</strong></td>
        <td>
          <span class="status-badge ${isCompleted ? 'status-completed' : 'status-confirmed'}">
            ${esc(ord.status || 'Sent to Grill')}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function renderOrdersPreview() {
  const container = document.getElementById('dash-orders-preview');
  if (!container || !window.KF_STATE) return;

  const orders = window.KF_STATE.getOrders ? window.KF_STATE.getOrders() : [];
  const esc = window.escapeHtml || (s => s);

  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div class="p-3 bg-secondary-app rounded-3 border border-subtle d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h6 class="mb-1 text-primary-app fw-bold">No table orders dispatched yet.</h6>
          <p class="text-muted small mb-0">Select dishes from our menu to transmit an order to your table grill.</p>
        </div>
        <a href="menu.html" class="btn-flame btn-sm-custom">Browse Menu</a>
      </div>
    `;
    return;
  }

  const latest = orders.slice(0, 3);
  container.innerHTML = `
    <div class="d-flex flex-column gap-2.5">
      ${latest.map(ord => `
        <div class="p-3 bg-secondary-app rounded-3 border border-subtle d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2.5 dash-order-item-card">
          <div class="d-flex align-items-start gap-2.5 min-w-0">
            <div class="dash-stat-icon icon-orange mt-0.5" style="width: 40px; height: 40px; flex-shrink: 0;">
              <i data-lucide="flame" style="width: 18px; height: 18px;"></i>
            </div>
            <div class="min-w-0 flex-grow-1">
              <h6 class="text-flame mb-1 fw-bold text-break" style="font-size: 0.92rem;">${esc(ord.id)} · ${esc(ord.tableNumber || 'Table Grill')}</h6>
              <p class="mb-0 text-secondary small text-truncate" style="font-size: 0.82rem;">${(ord.items || []).map(i => `${i.qty}x ${esc(i.nameEn)}`).join(', ')}</p>
            </div>
          </div>
          <div class="d-flex flex-row flex-sm-column justify-content-between align-items-center align-items-sm-end pt-2 pt-sm-0 border-top border-sm-0 border-subtle gap-1.5 flex-shrink-0">
            <span class="status-badge ${ord.status === 'Completed' ? 'status-completed' : 'status-confirmed'} text-nowrap">${esc(ord.status || 'Sent to Grill')}</span>
            <div class="fw-bold text-gold" style="font-size: 0.95rem;">$${Number(ord.total || 0).toFixed(2)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * KoreFlame - Guest Dashboard Controller
 * Sidebar tab switching, live loyalty redemption, booking cancel/modify, favorites sync, profile edits.
 */

document.addEventListener('DOMContentLoaded', () => {
  initGuestDashboard();
});

function initGuestDashboard() {
  const user = window.KF_STATE ? window.KF_STATE.getUser() : null;

  // Login Required for Dashboard (Requirement 2)
  if (!user || !user.isLoggedIn) {
    const returnUrl = window.location.pathname.split('/').pop() + window.location.search + window.location.hash;
    window.location.replace(`login.html?redirect=${encodeURIComponent(returnUrl || 'dashboard.html')}`);
    return;
  }

  initTabSwitching();
  renderDashboardOverview();
  renderOrdersTab();
  renderReservationsTab();
  renderLoyaltyTab();
  renderFavoritesTab();
  renderProfileTab();
  initDashboardMobileSidebar();

  // Sync with URL hash if present (#reservations, #loyalty, etc.)
  syncTabFromHash();
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return 'MK';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function initDashboardMobileSidebar() {
  const toggleBtn = document.getElementById('dash-sidebar-toggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth < 992 && sidebar.classList.contains('active')) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
          sidebar.classList.remove('active');
        }
      }
    });
  }
}

function initTabSwitching() {
  const links = document.querySelectorAll('.dashboard-sidebar .sidebar-nav-link[data-tab]');
  const views = document.querySelectorAll('.dash-view-content');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      activateTab(tabId);
    });
  });
}

function activateTab(tabId) {
  const links = document.querySelectorAll('.dashboard-sidebar .sidebar-nav-link[data-tab]');
  const views = document.querySelectorAll('.dash-view-content');

  links.forEach(l => {
    if (l.getAttribute('data-tab') === tabId) {
      l.classList.add('active');
    } else {
      l.classList.remove('active');
    }
  });

  views.forEach(v => {
    v.style.display = v.id === `view-${tabId}` ? 'block' : 'none';
  });

  // Close mobile sidebar if open
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (sidebar) sidebar.classList.remove('active');

  if (window.lucide) window.lucide.createIcons();
}

function syncTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  const validTabs = ['overview', 'orders', 'reservations', 'loyalty', 'favorites', 'profile'];
  if (validTabs.includes(hash)) {
    activateTab(hash);
  }
}

// 1. Overview Tab & Guaranteed Welcome User Name
function renderDashboardOverview() {
  const user = window.KF_STATE ? window.KF_STATE.getUser() : {};
  const reservations = window.KF_STATE ? window.KF_STATE.getReservations() : [];
  const favorites = window.KF_STATE ? window.KF_STATE.getFavorites() : [];

  const rawName = (user && user.name && user.name.trim()) ? user.name.trim() : 'Guest';
  const rawTier = (user && user.tier) ? user.tier : 'Member';
  const rawPoints = (user && typeof user.points === 'number') ? user.points : 0;
  const initials = getInitials(rawName);

  // Welcome user name across overview, topbar, sidebar, and profile
  const dashNameEl = document.getElementById('dash-user-name');
  const topbarNameEl = document.getElementById('topbar-user-name');
  const sidebarNameEl = document.getElementById('sidebar-user-name');
  const profileDisplayNameEl = document.getElementById('profile-display-name');

  if (dashNameEl) dashNameEl.textContent = rawName;
  if (topbarNameEl) topbarNameEl.textContent = rawName;
  if (sidebarNameEl) sidebarNameEl.textContent = rawName;
  if (profileDisplayNameEl) profileDisplayNameEl.textContent = rawName;

  // Avatars (image or initials fallback)
  const sidebarAvatar = document.getElementById('sidebar-avatar');
  const topbarAvatar = document.getElementById('topbar-avatar');
  const profileAvatar = document.getElementById('profile-avatar-preview');
  const userAvatarUrl = user && user.avatar ? user.avatar : null;

  const setAvatarElement = (el) => {
    if (!el) return;
    if (userAvatarUrl) {
      el.innerHTML = `<img src="${userAvatarUrl}" alt="${rawName}" class="avatar-img" onerror="this.remove(); this.parentElement.textContent='${initials}';">`;
    } else {
      el.textContent = initials;
    }
  };

  setAvatarElement(sidebarAvatar);
  setAvatarElement(topbarAvatar);
  setAvatarElement(profileAvatar);

  // User Tier labels
  const dashTierEl = document.getElementById('dash-user-tier');
  const topbarTierEl = document.getElementById('topbar-user-tier');
  const sidebarTierEl = document.getElementById('sidebar-user-tier');
  const welcomeTierEl = document.getElementById('dash-welcome-tier');
  const profileTierEl = document.getElementById('profile-display-tier');

  if (dashTierEl) dashTierEl.textContent = rawTier;
  if (topbarTierEl) topbarTierEl.textContent = rawTier;
  if (sidebarTierEl) sidebarTierEl.textContent = rawTier;
  if (welcomeTierEl) welcomeTierEl.textContent = rawTier;
  if (profileTierEl) profileTierEl.textContent = rawTier;

  // Points & Counts
  const pointsEl = document.getElementById('dash-user-points');
  const favCountEl = document.getElementById('dash-fav-count');
  const upcomingResEl = document.getElementById('dash-upcoming-preview');

  if (pointsEl) pointsEl.textContent = rawPoints.toLocaleString();
  if (favCountEl) favCountEl.textContent = favorites.length;

  const esc = window.escapeHtml || (s => s);

  // Upcoming reservation
  const upcoming = reservations.find(r => r.status === 'Confirmed');
  renderOrdersPreview();

  if (upcomingResEl) {
    if (upcoming) {
      upcomingResEl.innerHTML = `
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 bg-secondary-app rounded-3 border border-subtle">
          <div class="d-flex align-items-center gap-3">
            <div class="dash-stat-icon icon-orange" style="width: 44px; height: 44px; flex-shrink: 0;">
              <i data-lucide="calendar" style="width: 20px; height: 20px;"></i>
            </div>
            <div>
              <h5 class="text-flame mb-1 fw-bold">${esc(upcoming.date)} at ${esc(upcoming.time)}</h5>
              <p class="mb-0 text-secondary small">${esc(upcoming.partySize)} Guests · ${esc(upcoming.tableType)}</p>
            </div>
          </div>
          <span class="status-badge status-confirmed">Confirmed (${esc(upcoming.id)})</span>
        </div>
      `;
    } else {
      upcomingResEl.innerHTML = `
        <div class="p-3 bg-secondary-app rounded-3 border border-subtle d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h6 class="mb-1 text-primary-app fw-bold">No upcoming grill reservations booked.</h6>
            <p class="text-muted small mb-0">Reserve a table with authentic Kishu Binchotan downdraft grill.</p>
          </div>
          <a href="pricing.html#reservations" class="btn-flame btn-sm-custom">Book a Table Now</a>
        </div>
      `;
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

// 2. Reservations Tab
function renderReservationsTab() {
  const tableBody = document.getElementById('dash-reservations-tbody');
  if (!tableBody) return;

  const reservations = window.KF_STATE ? window.KF_STATE.getReservations() : [];
  const esc = window.escapeHtml || (s => s);

  if (reservations.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-muted">
          No table reservations recorded yet.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = reservations.map(res => {
    let badgeClass = 'status-pending';
    if (res.status === 'Confirmed') badgeClass = 'status-confirmed';
    if (res.status === 'Cancelled') badgeClass = 'status-cancelled';
    if (res.status === 'Completed') badgeClass = 'status-completed';

    const canCancel = res.status === 'Confirmed' || res.status === 'Pending';
    const safeId = esc(res.id);

    return `
      <tr>
        <td><strong class="font-monospace text-gold">${safeId}</strong></td>
        <td>
          <div class="fw-bold text-primary-app">${esc(res.date)}</div>
          <div class="text-muted small">${esc(res.time)}</div>
        </td>
        <td>${esc(res.partySize)} Guests</td>
        <td>${esc(res.tableType)}</td>
        <td><span class="status-badge ${badgeClass}">${esc(res.status)}</span></td>
        <td class="text-end">
          ${canCancel ? `
            <button type="button" class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" onclick="confirmCancelBooking('${safeId}')">
              <i data-lucide="x" style="width: 13px; height: 13px;"></i>
              <span>Cancel</span>
            </button>
          ` : `<span class="text-muted small">Closed</span>`}
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons({ root: tableBody });
}

window.confirmCancelBooking = async function(bookingId) {
  let confirmed = false;
  if (window.kfConfirm) {
    confirmed = await window.kfConfirm({
      title: 'Cancel Table Reservation?',
      message: `Are you sure you want to cancel reservation #${bookingId}? Your held table grill will be released immediately.`,
      confirmText: 'Yes, Cancel Reservation',
      cancelText: 'Keep Table',
      type: 'danger'
    });
  } else {
    confirmed = confirm(`Are you sure you want to cancel reservation #${bookingId}? Your held table grill will be released.`);
  }

  if (confirmed) {
    const success = window.KF_STATE.cancelReservation(bookingId);
    if (success) {
      window.kfToast.info(`Reservation #${bookingId} has been cancelled.`, 'Booking Cancelled');
      renderReservationsTab();
      renderDashboardOverview();
    } else {
      window.kfToast.error('Could not cancel this reservation.', 'Error');
    }
  }
};

// 3. Loyalty Tab
function renderLoyaltyTab() {
  const user = window.KF_STATE ? window.KF_STATE.getUser() : { points: 1240 };
  const currentPointsEl = document.getElementById('loyalty-balance-display');
  const progressFillEl = document.getElementById('loyalty-progress-bar');
  const rewardsContainer = document.getElementById('loyalty-rewards-grid');

  const points = (user && typeof user.points === 'number') ? user.points : 1240;
  if (currentPointsEl) currentPointsEl.textContent = points.toLocaleString();

  // Next tier threshold: 2,500 points for Imperial Tier
  const maxTier = 2500;
  const pct = Math.min(100, Math.round((points / maxTier) * 100));
  if (progressFillEl) {
    progressFillEl.style.width = `${pct}%`;
  }

  if (rewardsContainer && window.KF_DATA && window.KF_DATA.loyaltyRewards) {
    rewardsContainer.innerHTML = window.KF_DATA.loyaltyRewards.map(rew => {
      const canAfford = points >= rew.points;
      return `
        <div class="col-md-6 col-lg-4">
          <div class="kf-card h-100 d-flex flex-column justify-content-between p-3.5 shadow-sm">
            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge-tag ${canAfford ? 'badge-prime' : 'badge-spice'}">${rew.points} Points</span>
                <i data-lucide="${rew.icon}" class="text-gold" style="width: 18px; height: 18px;"></i>
              </div>
              <h6 class="mb-2 fw-bold text-primary-app">${rew.name}</h6>
            </div>
            <button type="button" class="btn-flame btn-sm-custom w-100 mt-3 d-inline-flex align-items-center justify-content-center gap-1.5" 
                    ${!canAfford ? 'disabled style="opacity: 0.5;"' : ''} 
                    onclick="handleRedeemReward('${rew.id}', ${rew.points}, '${rew.name}')">
              <i data-lucide="${canAfford ? 'gift' : 'lock'}" style="width: 14px; height: 14px;"></i>
              <span>${canAfford ? 'Redeem Voucher' : 'Need More Points'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons({ root: rewardsContainer });
  }
}

window.handleRedeemReward = async function(rewId, pointsCost, rewName) {
  const user = window.KF_STATE.getUser();
  if (user.points < pointsCost) {
    window.kfToast.error('Insufficient points balance for this reward.', 'Points Error');
    return;
  }

  let confirmed = false;
  if (window.kfConfirm) {
    confirmed = await window.kfConfirm({
      title: 'Redeem Reward Voucher?',
      message: `Redeem "${rewName}" for ${pointsCost.toLocaleString()} KoreFlame loyalty points?`,
      confirmText: 'Confirm Redemption',
      cancelText: 'Cancel',
      type: 'warning'
    });
  } else {
    confirmed = confirm(`Redeem "${rewName}" for ${pointsCost} points?`);
  }

  if (confirmed) {
    user.points -= pointsCost;
    window.KF_STATE.setUser(user);
    window.kfToast.success(`Redeemed ${rewName}! Voucher added to your account.`, 'Reward Claimed');
    renderDashboardOverview();
    renderLoyaltyTab();
  }
};

// 4. Favorites Tab
function renderFavoritesTab() {
  const container = document.getElementById('dash-favorites-grid');
  if (!container || !window.KF_DATA) return;

  const favIds = window.KF_STATE ? window.KF_STATE.getFavorites() : [];
  const allItems = window.KF_DATA.menuItems || [];
  const favItems = allItems.filter(item => favIds.includes(item.id));

  if (favItems.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i data-lucide="heart" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i>
        <h5 class="fw-bold">No Saved Favorites Yet</h5>
        <p class="text-muted">Browse our full menu and click the heart icon on any prime cut or side dish to save it here.</p>
        <a href="menu.html" class="btn-flame-outline btn-sm-custom mt-2">Explore Menu</a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: container });
    return;
  }

  container.innerHTML = favItems.map(item => `
    <div class="col-md-6 col-lg-4">
      <div class="menu-card h-100 shadow-sm d-flex flex-column justify-content-between">
        <div>
          <div class="menu-card-img-wrapper position-relative">
            <img src="${item.image}" alt="${item.nameEn}" loading="lazy">
            <button type="button" class="menu-fav-btn active" onclick="handleRemoveDashFav('${item.id}')" title="Remove from favorites">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
          <div class="menu-card-body p-3">
            <h6 class="fw-bold mb-1">${item.nameEn}</h6>
            <div class="korean-tag text-gold mb-2 small">${item.nameKr}</div>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center p-3 pt-2 border-top border-subtle mt-auto">
          <span class="menu-card-price fw-bold text-gold">$${item.price.toFixed(2)}</span>
          <button type="button" class="btn-flame btn-sm-custom d-inline-flex align-items-center gap-1" onclick="handleAddMenuItem('${item.id}')">
            <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
            <span>Order Again</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons({ root: container });
}

window.handleRemoveDashFav = function(itemId) {
  window.KF_STATE.toggleFavorite(itemId);
  window.kfToast.info('Item removed from your favorites list.', 'Favorites Updated');
  renderFavoritesTab();
  renderDashboardOverview();
};

window.handleAddMenuItem = function(itemId) {
  const item = (window.KF_DATA.menuItems || []).find(i => i.id === itemId);
  if (item && window.KF_STATE) {
    window.KF_STATE.addToCart(item);
    window.kfToast.success(`Added ${item.nameEn} to table order.`, 'Item Added');
  }
};

// 5. Profile Tab
function renderProfileTab() {
  const user = window.KF_STATE ? window.KF_STATE.getUser() : {};
  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  const phoneInput = document.getElementById('profile-phone');
  const form = document.getElementById('profile-update-form');

  const nameError = document.getElementById('profile-name-error');
  const emailError = document.getElementById('profile-email-error');
  const phoneError = document.getElementById('profile-phone-error');

  const defaultName = (user && user.name) ? user.name : '';
  const defaultEmail = (user && user.email) ? user.email : '';
  const defaultPhone = (user && user.phone) ? user.phone : '';

  if (nameInput) nameInput.value = defaultName;
  if (emailInput) emailInput.value = defaultEmail;
  if (phoneInput) phoneInput.value = defaultPhone;

  const v = window.KF_VALIDATOR;
  if (v) {
    v.setupFieldFilter(nameInput, 'name');
    v.setupFieldFilter(phoneInput, 'phone');

    if (nameInput) {
      nameInput.addEventListener('input', () => v.clearFieldError(nameInput, nameError));
      nameInput.addEventListener('blur', () => {
        if (nameInput.value.trim()) {
          const res = v.validateName(nameInput.value, true, 'Full Name');
          if (!res.valid) v.setFieldError(nameInput, nameError, res.message);
          else v.clearFieldError(nameInput, nameError);
        }
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => v.clearFieldError(emailInput, emailError));
      emailInput.addEventListener('blur', () => {
        if (emailInput.value.trim()) {
          const res = v.validateEmail(emailInput.value, true);
          if (!res.valid) v.setFieldError(emailInput, emailError, res.message);
          else v.clearFieldError(emailInput, emailError);
        }
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener('input', () => v.clearFieldError(phoneInput, phoneError));
      phoneInput.addEventListener('blur', () => {
        if (phoneInput.value.trim()) {
          const res = v.validatePhone(phoneInput.value, true, 'Phone number');
          if (!res.valid) v.setFieldError(phoneInput, phoneError, res.message);
          else v.clearFieldError(phoneInput, phoneError);
        }
      });
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (v) v.clearFormErrors(form);

      let isValid = true;
      let firstInvalid = null;

      if (v) {
        const nameRes = v.validateName(nameInput ? nameInput.value : '', true, 'Full Name');
        if (!nameRes.valid) {
          v.setFieldError(nameInput, nameError, nameRes.message);
          isValid = false;
          if (!firstInvalid) firstInvalid = nameInput;
        }

        const emailRes = v.validateEmail(emailInput ? emailInput.value : '', true);
        if (!emailRes.valid) {
          v.setFieldError(emailInput, emailError, emailRes.message);
          isValid = false;
          if (!firstInvalid) firstInvalid = emailInput;
        }

        const phoneRes = v.validatePhone(phoneInput ? phoneInput.value : '', true, 'Phone number');
        if (!phoneRes.valid) {
          v.setFieldError(phoneInput, phoneError, phoneRes.message);
          isValid = false;
          if (!firstInvalid) firstInvalid = phoneInput;
        }
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        if (window.kfToast) window.kfToast.error('Please correct the highlighted profile fields.', 'Validation Error');
        return;
      }

      const updatedUser = {
        ...user,
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim()
      };
      if (window.KF_STATE) {
        window.KF_STATE.saveUserAccount(updatedUser);
        window.KF_STATE.setUser(updatedUser);
      }
      if (window.kfToast) window.kfToast.success('Your profile details and contact preferences have been saved.', 'Profile Updated');
      renderDashboardOverview();
    });
  }

  // Profile Picture Upload Handler
  const photoUploadInput = document.getElementById('profile-picture-upload');
  if (photoUploadInput) {
    photoUploadInput.addEventListener('change', function(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        if (window.kfToast) window.kfToast.error('Please select an image file (JPEG, PNG, WebP).', 'Invalid Image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        if (window.kfToast) window.kfToast.error('Profile photo must be under 5MB.', 'File Too Large');
        return;
      }
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        const currentUser = window.KF_STATE ? window.KF_STATE.getUser() : {};
        const updatedUser = {
          ...currentUser,
          avatar: dataUrl
        };
        if (window.KF_STATE) {
          window.KF_STATE.saveUserAccount(updatedUser);
          window.KF_STATE.setUser(updatedUser);
        }
        if (window.kfToast) window.kfToast.success('Profile picture updated successfully!', 'Photo Updated');
        renderDashboardOverview();
      };
      reader.readAsDataURL(file);
    });
  }
}

// 6. Sign Out Handler
window.handleDashLogout = async function() {
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

  if (!confirmed) return;

  if (window.KF_STATE) {
    window.KF_STATE.logout();
  }
  if (window.kfToast) {
    window.kfToast.info('You have safely signed out of your KoreFlame session.', 'Signed Out');
  }
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 400);
};

// Listen for global auth state changes
window.addEventListener('kf:auth-changed', () => {
  const u = window.KF_STATE ? window.KF_STATE.getUser() : null;
  if (!u || !u.isLoggedIn) {
    window.location.href = 'login.html';
  } else {
    renderDashboardOverview();
  }
});
