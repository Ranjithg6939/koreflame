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
      
      // Spice flame icons
      let spiceBadges = '';
      if (item.spice > 0) {
        const chilies = '🌶️'.repeat(item.spice);
        spiceBadges = `<span class="badge-tag badge-spice" title="Spice Level: ${item.spice}/3">${chilies} Mild/Spicy</span>`;
      }

      // Dietary tags
      const dietaryTags = item.dietary.map(d => `<span class="badge-tag badge-prime me-1">${d}</span>`).join('');

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
              ${item.popular ? `<span class="position-absolute bottom-0 start-0 m-3 badge-tag badge-popular">Popular</span>` : ''}
            </div>

            <div class="menu-card-body">
              <div class="d-flex justify-content-between align-items-start mb-1">
                <h5 class="mb-0">${item.nameEn}</h5>
              </div>
              <div class="korean-tag text-gold mb-2">${item.nameKr}</div>

              <p class="text-secondary small flex-grow-1 mb-3">${item.description}</p>

              <div class="mb-3 d-flex flex-wrap gap-1">
                ${spiceBadges}
                ${dietaryTags}
              </div>

              <div class="d-flex align-items-center justify-content-between pt-3 border-top border-subtle mt-auto">
                <div>
                  <div class="menu-card-price">$${item.price.toFixed(2)}</div>
                  <div class="text-muted small">${item.portion}</div>
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
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    window.KF_STATE.addToCart({
      id: item.id,
      nameEn: item.nameEn,
      nameKr: item.nameKr,
      price: item.price,
      image: item.image
    }, 1);

    window.kfToast.success(`${item.nameEn} added to your table order!`, 'Added to Cart');
  };
}
