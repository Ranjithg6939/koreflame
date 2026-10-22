/**
 * KoreFlame - Menu Page Controller
 * Category filtering, search, dietary badges, spice levels, favorites persistence, cart actions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMenuController();
});

function initMenuController() {
  const container = document.getElementById('kf-menu-grid');
  if (!container || !window.KF_DATA || !window.KF_DATA.menuItems) return;

  const items = window.KF_DATA.menuItems;
  let currentCategory = 'all';
  let searchQuery = '';
  let onlyFavorites = false;

  const searchInput = document.getElementById('kf-menu-search');
  const filterBtns = document.querySelectorAll('.menu-filter-btn');
  const favFilterToggle = document.getElementById('kf-menu-favs-only');

  // Search Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderMenu();
    });
  }

  // Category filter listeners
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderMenu();
    });
  });

  // Favorites only toggle
  if (favFilterToggle) {
    favFilterToggle.addEventListener('change', (e) => {
      onlyFavorites = e.target.checked;
      renderMenu();
    });
  }

  // Initial render
  renderMenu();

  function renderMenu() {
    const favorites = window.KF_STATE.getFavorites();

    const filtered = items.filter(item => {
      // Category check
      if (currentCategory !== 'all' && item.category !== currentCategory) {
        return false;
      }
      // Search check
      if (searchQuery) {
        const matchesEn = item.nameEn.toLowerCase().includes(searchQuery);
        const matchesKr = item.nameKr.toLowerCase().includes(searchQuery);
        const matchesDesc = item.description.toLowerCase().includes(searchQuery);
        if (!matchesEn && !matchesKr && !matchesDesc) return false;
      }
      // Favs only check
      if (onlyFavorites && !favorites.includes(item.id)) {
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i data-lucide="utensils-crossed" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h4>No Menu Items Found</h4>
          <p class="text-muted">Try adjusting your category filter, clearing your search query, or checking back later.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons({ root: container });
      return;
    }

    container.innerHTML = filtered.map(item => {
      const isFav = favorites.includes(item.id);
      
      // Limit to at most two animation badge words total
      let badgesHtml = '';
      const maxBadges = 2;
      let count = 0;

      if (item.spice > 0 && count < maxBadges) {
        const chilies = '🌶️'.repeat(item.spice);
        badgesHtml += `<span class="badge-tag badge-spice" title="Spice Level: ${item.spice}/3">${chilies} Mild/Spicy</span>`;
        count++;
      }

      if (Array.isArray(item.dietary)) {
        for (const tag of item.dietary) {
          if (count >= maxBadges) break;
          badgesHtml += `<span class="badge-tag badge-prime">${tag}</span>`;
          count++;
        }
      }

      return `
        <div class="col-xl-4 col-md-6">
          <div class="menu-card h-100">
            <div class="menu-card-img-wrapper">
              <img src="${item.image}" alt="${item.nameEn}" loading="lazy">
              <button type="button" class="menu-fav-btn ${isFav ? 'active' : ''}" 
                      onclick="handleFavToggle('${item.id}', this)" 
                      aria-label="Save ${item.nameEn} to favorites">
                <i data-lucide="heart" style="width: 18px; height: 18px;" fill="${isFav ? 'currentColor' : 'none'}"></i>
              </button>
              ${item.popular ? `<span class="position-absolute bottom-0 start-0 m-3 badge-tag badge-popular d-inline-flex align-items-center gap-1"><i data-lucide="flame" style="width: 12px; height: 12px;"></i><span>Popular</span></span>` : ''}
            </div>

            <div class="menu-card-body">
              <div class="menu-card-title-wrap">
                <h5 class="menu-card-title">${item.nameEn}</h5>
              </div>
              <div class="korean-tag text-gold menu-card-subtitle">${item.nameKr}</div>

              <p class="menu-card-desc">${item.description}</p>

              <div class="menu-card-badges">
                ${badgesHtml}
              </div>

              <div class="menu-card-footer">
                <div>
                  <div class="menu-card-price">$${item.price.toFixed(2)}</div>
                  <div class="menu-card-portion">${item.portion}</div>
                </div>
                <button type="button" class="btn-flame btn-sm-custom" onclick="handleAddMenuItem('${item.id}')">
                  <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                  <span>Add to Table</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: container });
    }
  }

  // Global toggle handler
  window.handleFavToggle = function(itemId, btnEl) {
    const isNowFav = window.KF_STATE.toggleFavorite(itemId);
    const item = items.find(i => i.id === itemId);
    const itemName = item ? item.nameEn : 'Item';

    if (isNowFav) {
      btnEl.classList.add('active');
      const icon = btnEl.querySelector('i');
      if (icon) icon.setAttribute('fill', 'currentColor');
      window.kfToast.success(`${itemName} added to your Saved Favorites!`, 'Favorite Saved');
    } else {
      btnEl.classList.remove('active');
      const icon = btnEl.querySelector('i');
      if (icon) icon.setAttribute('fill', 'none');
      window.kfToast.info(`${itemName} removed from your favorites.`, 'Favorite Removed');
    }
  };

  // Add Item to Cart
  window.handleAddMenuItem = function(itemId) {
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

    let item = items.find(i => i.id === itemId);
    if (!item && window.KF_DATA && window.KF_DATA.menuItems) {
      item = window.KF_DATA.menuItems.find(i => i.id === itemId);
    }
    if (!item) return;

    window.KF_STATE.addToCart({
      id: item.id,
      nameEn: item.nameEn,
      nameKr: item.nameKr || '',
      price: item.price,
      image: item.image
    }, 1);

    window.kfToast.success(`${item.nameEn} added to your table order!`, 'Added to Cart');

    if (window.triggerCartBounce) {
      window.triggerCartBounce();
    }

    // Immediately open the Cart Drawer
    if (typeof window.openCartDrawer === 'function') {
      window.openCartDrawer();
    }
  };
}
