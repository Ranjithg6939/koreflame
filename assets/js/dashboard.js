/**
 * KoreFlame - Guest Dashboard Controller
 * Sidebar tab switching, live loyalty redemption, booking cancel/modify, favorites sync, profile edits.
 */

document.addEventListener('DOMContentLoaded', () => {
  initGuestDashboard();
});

function initGuestDashboard() {
  const user = window.KF_STATE.getUser();

  // If not logged in, auto-login demo guest for immediate preview so users see a populated dashboard
  if (!user.isLoggedIn) {
    window.KF_STATE.loginDemoGuest();
  }

  initTabSwitching();
  renderDashboardOverview();
  renderReservationsTab();
  renderLoyaltyTab();
  renderFavoritesTab();
  renderProfileTab();
  initDashboardMobileSidebar();
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

      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      views.forEach(v => {
        v.style.display = v.id === `view-${tabId}` ? 'block' : 'none';
      });

      // Close mobile sidebar if open
      const sidebar = document.querySelector('.dashboard-sidebar');
      if (sidebar) sidebar.classList.remove('active');

      if (window.lucide) window.lucide.createIcons();
    });
  });
}

// 1. Overview Tab
function renderDashboardOverview() {
  const user = window.KF_STATE.getUser();
  const reservations = window.KF_STATE.getReservations();
  const favorites = window.KF_STATE.getFavorites();

  const nameEl = document.getElementById('dash-user-name');
  const tierEl = document.getElementById('dash-user-tier');
  const pointsEl = document.getElementById('dash-user-points');
  const favCountEl = document.getElementById('dash-fav-count');
  const upcomingResEl = document.getElementById('dash-upcoming-preview');

  if (nameEl) nameEl.textContent = user.name;
  if (tierEl) tierEl.textContent = user.tier;
  if (pointsEl) pointsEl.textContent = user.points.toLocaleString();
  if (favCountEl) favCountEl.textContent = favorites.length;

  // Upcoming reservation
  const upcoming = reservations.find(r => r.status === 'Confirmed');
  if (upcomingResEl) {
    if (upcoming) {
      upcomingResEl.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="text-flame mb-1">${upcoming.date} at ${upcoming.time}</h5>
            <p class="mb-0 text-muted small">${upcoming.partySize} Guests · ${upcoming.tableType}</p>
          </div>
          <span class="status-badge status-confirmed">Confirmed (${upcoming.id})</span>
        </div>
      `;
    } else {
      upcomingResEl.innerHTML = `
        <p class="text-muted mb-0">No upcoming grill reservations booked.</p>
        <a href="reservations.html" class="btn-flame btn-sm-custom mt-2">Book a Table Now</a>
      `;
    }
  }

  // Sidebar profile tags
  const sideName = document.getElementById('sidebar-user-name');
  const sideTier = document.getElementById('sidebar-user-tier');
  if (sideName) sideName.textContent = user.name;
  if (sideTier) sideTier.textContent = user.tier;
}

// 2. Reservations Tab
function renderReservationsTab() {
  const tableBody = document.getElementById('dash-reservations-tbody');
  if (!tableBody) return;

  const reservations = window.KF_STATE.getReservations();

  if (reservations.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-muted">
          No reservations recorded yet.
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

    return `
      <tr>
        <td><strong class="font-monospace text-gold">${res.id}</strong></td>
        <td>
          <div class="font-weight-bold">${res.date}</div>
          <div class="text-muted small">${res.time}</div>
        </td>
        <td>${res.partySize} Guests</td>
        <td>${res.tableType}</td>
        <td><span class="status-badge ${badgeClass}">${res.status}</span></td>
        <td class="text-end">
          ${canCancel ? `
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="confirmCancelBooking('${res.id}')">
              Cancel
            </button>
          ` : `<span class="text-muted small">Closed</span>`}
        </td>
      </tr>
    `;
  }).join('');
}

window.confirmCancelBooking = function(bookingId) {
  if (confirm(`Are you sure you want to cancel reservation #${bookingId}? Your held table grill will be released.`)) {
    const success = window.KF_STATE.cancelReservation(bookingId);
    if (success) {
      window.kfToast.info(`Reservation #${bookingId} has been cancelled.`, 'Booking Cancelled');
      renderDashboardOverview();
      renderReservationsTab();
    }
  }
};

// 3. Loyalty Tab
function renderLoyaltyTab() {
  const user = window.KF_STATE.getUser();
  const currentPointsEl = document.getElementById('loyalty-balance-display');
  const progressFillEl = document.getElementById('loyalty-progress-bar');
  const rewardsContainer = document.getElementById('loyalty-rewards-grid');

  if (currentPointsEl) currentPointsEl.textContent = user.points.toLocaleString();

  // Next tier threshold: 2500 points for Imperial Tier
  const maxTier = 2500;
  const pct = Math.min(100, Math.round((user.points / maxTier) * 100));
  if (progressFillEl) {
    progressFillEl.style.width = `${pct}%`;
  }

  if (rewardsContainer && window.KF_DATA.loyaltyRewards) {
    rewardsContainer.innerHTML = window.KF_DATA.loyaltyRewards.map(rew => {
      const canAfford = user.points >= rew.points;
      return `
        <div class="col-md-6 col-lg-4">
          <div class="kf-card h-100 d-flex flex-direction-column justify-content-between p-3">
            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge-tag ${canAfford ? 'badge-prime' : 'badge-spice'}">${rew.points} Points</span>
                <i data-lucide="${rew.icon}" class="text-gold"></i>
              </div>
              <h6 class="mb-2">${rew.name}</h6>
            </div>
            <button type="button" class="btn-flame btn-sm-custom w-100 mt-3" 
                    ${!canAfford ? 'disabled style="opacity: 0.5;"' : ''} 
                    onclick="handleRedeemReward('${rew.id}', ${rew.points}, '${rew.name}')">
              ${canAfford ? 'Redeem Voucher' : 'Need More Points'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons({ root: rewardsContainer });
  }
}

window.handleRedeemReward = function(rewId, pointsCost, rewName) {
  const user = window.KF_STATE.getUser();
  if (user.points < pointsCost) {
    window.kfToast.error('Insufficient points balance for this reward.', 'Points Error');
    return;
  }

  if (confirm(`Redeem "${rewName}" for ${pointsCost} points?`)) {
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

  const favIds = window.KF_STATE.getFavorites();
  const allItems = window.KF_DATA.menuItems || [];
  const favItems = allItems.filter(item => favIds.includes(item.id));

  if (favItems.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i data-lucide="heart" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i>
        <h5>No Saved Favorites Yet</h5>
        <p class="text-muted">Browse our menu and click the heart icon on any prime cut or side dish.</p>
        <a href="menu.html" class="btn-flame-outline btn-sm-custom mt-2">Explore Menu</a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: container });
    return;
  }

  container.innerHTML = favItems.map(item => `
    <div class="col-md-6 col-lg-4">
      <div class="menu-card h-100">
        <div class="menu-card-img-wrapper">
          <img src="${item.image}" alt="${item.nameEn}">
          <button type="button" class="menu-fav-btn active" onclick="handleRemoveDashFav('${item.id}')" title="Remove from favorites">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
        <div class="menu-card-body">
          <h6>${item.nameEn}</h6>
          <div class="korean-tag text-gold mb-2">${item.nameKr}</div>
          <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top border-subtle">
            <span class="menu-card-price">$${item.price.toFixed(2)}</span>
            <button type="button" class="btn-flame btn-sm-custom" onclick="handleAddMenuItem('${item.id}')">
              Order Again
            </button>
          </div>
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

// 5. Profile Tab
function renderProfileTab() {
  const user = window.KF_STATE.getUser();
  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  const phoneInput = document.getElementById('profile-phone');
  const form = document.getElementById('profile-update-form');

  if (nameInput) nameInput.value = user.name;
  if (emailInput) emailInput.value = user.email;
  if (phoneInput) phoneInput.value = user.phone;

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedUser = {
        ...user,
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim()
      };
      window.KF_STATE.setUser(updatedUser);
      window.kfToast.success('Your profile details and contact preferences have been saved.', 'Profile Updated');
      renderDashboardOverview();
    });
  }
}
