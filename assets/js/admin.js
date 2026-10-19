/**
 * KoreFlame - Admin Dashboard Controller
 * Reservation status workflow, user accounts overview, menu CRUD mock, analytics.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

function initAdminDashboard() {
  initAdminTabSwitching();
  renderAdminReservations();
  renderAdminMenuTable();
  initAdminMobileSidebar();
}

function initAdminMobileSidebar() {
  const toggleBtn = document.getElementById('admin-sidebar-toggle');
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

function initAdminTabSwitching() {
  const links = document.querySelectorAll('.dashboard-sidebar .sidebar-nav-link[data-admin-tab]');
  const views = document.querySelectorAll('.admin-view-content');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-admin-tab');

      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      views.forEach(v => {
        v.style.display = v.id === `admin-view-${tabId}` ? 'block' : 'none';
      });

      const sidebar = document.querySelector('.dashboard-sidebar');
      if (sidebar) sidebar.classList.remove('active');

      if (window.lucide) window.lucide.createIcons();
    });
  });
}

function renderAdminReservations() {
  const tbody = document.getElementById('admin-reservations-tbody');
  if (!tbody) return;

  const reservations = window.KF_STATE.getReservations();

  tbody.innerHTML = reservations.map(r => {
    let badgeClass = 'status-pending';
    if (r.status === 'Confirmed') badgeClass = 'status-confirmed';
    if (r.status === 'Cancelled') badgeClass = 'status-cancelled';
    if (r.status === 'Seated' || r.status === 'Completed') badgeClass = 'status-completed';

    return `
      <tr>
        <td><strong class="font-monospace text-gold">${r.id}</strong></td>
        <td>
          <div class="font-weight-bold">${r.guestName}</div>
          <div class="text-muted small">${r.phone || r.email}</div>
        </td>
        <td>${r.partySize} Guests</td>
        <td>
          <div>${r.date}</div>
          <div class="text-muted small">${r.time}</div>
        </td>
        <td>${r.tableType}</td>
        <td><span class="status-badge ${badgeClass}">${r.status}</span></td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-outline-success" onclick="updateAdminResStatus('${r.id}', 'Confirmed')" title="Confirm">
              <i data-lucide="check" style="width: 14px; height: 14px;"></i>
            </button>
            <button type="button" class="btn btn-outline-primary" onclick="updateAdminResStatus('${r.id}', 'Seated')" title="Seat Party">
              <i data-lucide="user-check" style="width: 14px; height: 14px;"></i>
            </button>
            <button type="button" class="btn btn-outline-danger" onclick="updateAdminResStatus('${r.id}', 'Cancelled')" title="Cancel">
              <i data-lucide="x" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons({ root: tbody });
}

window.updateAdminResStatus = function(id, newStatus) {
  const list = window.KF_STATE.getReservations();
  const target = list.find(r => r.id === id);
  if (target) {
    target.status = newStatus;
    window.KF_STATE.saveReservations(list);
    window.kfToast.success(`Reservation #${id} status changed to "${newStatus}"`, 'Status Updated');
    renderAdminReservations();
  }
};

function renderAdminMenuTable() {
  const tbody = document.getElementById('admin-menu-tbody');
  if (!tbody || !window.KF_DATA.menuItems) return;

  tbody.innerHTML = window.KF_DATA.menuItems.slice(0, 8).map(item => `
    <tr>
      <td>
        <img src="${item.image}" alt="${item.nameEn}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;">
      </td>
      <td>
        <div class="font-weight-bold">${item.nameEn}</div>
        <div class="korean-tag text-gold small">${item.nameKr}</div>
      </td>
      <td><span class="badge-tag badge-prime text-capitalize">${item.category}</span></td>
      <td><strong class="text-flame">$${item.price.toFixed(2)}</strong></td>
      <td>${item.portion}</td>
      <td class="text-end">
        <button type="button" class="btn btn-sm btn-outline-light" onclick="window.kfToast.info('Editing mock menu item: ${item.nameEn}', 'Admin Action')">
          Edit
        </button>
      </td>
    </tr>
  `).join('');
}
