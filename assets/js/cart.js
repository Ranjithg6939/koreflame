/**
 * KoreFlame - Cart Page Controller
 * Handles table cart item rendering, live price calculations, quantity adjustments, and empty-state messaging.
 */

(function(window) {
  'use strict';

  function renderCartPage() {
    const container = document.getElementById('cart-page-content');
    if (!container) return;

    const cart = window.KF_STATE ? window.KF_STATE.getCart() : [];
    const esc = window.escapeHtml || (s => s);

    // 1. Empty Cart View
    if (!cart || cart.length === 0) {
      container.innerHTML = `
        <div class="kf-card p-5 text-center my-4">
          <div class="dash-stat-icon icon-orange mx-auto mb-3" style="width: 64px; height: 64px;">
            <i data-lucide="shopping-bag" style="width: 32px; height: 32px;"></i>
          </div>
          <h3 class="fw-extrabold mb-2">Your Table Cart is Empty</h3>
          <p class="text-secondary mb-4" style="max-width: 480px; margin-inline: auto;">
            Your cart is empty. Add dishes before placing an order. Explore our USDA Prime cuts, signature banchan, and master feast packages.
          </p>
          <a href="menu.html" class="btn-flame px-4 py-2.5 d-inline-flex align-items-center gap-2">
            <i data-lucide="utensils" style="width: 18px; height: 18px;"></i>
            <span>Explore Artisanal Menu</span>
          </a>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // 2. Active Cart Items & Summary Calculation
    let subtotal = 0;
    let totalItems = 0;

    const itemsHtml = cart.map(item => {
      const price = Number(item.price) || 0;
      const qty = parseInt(item.qty, 10) || 1;
      const lineTotal = price * qty;
      subtotal += lineTotal;
      totalItems += qty;

      return `
        <div class="cart-page-row" data-item-id="${esc(item.id)}">
          <img src="${esc(item.image)}" alt="${esc(item.nameEn)}" class="cart-page-img">
          
          <div class="flex-grow-1 min-w-0">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-1">
              <div>
                <h5 class="mb-0 fw-bold text-primary-app">${esc(item.nameEn)}</h5>
                ${item.nameKr ? `<span class="korean-tag text-gold small d-block mb-1">${esc(item.nameKr)}</span>` : ''}
              </div>
              <strong class="text-flame fs-5 d-none d-sm-block">$${lineTotal.toFixed(2)}</strong>
            </div>
            
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
              <div class="d-flex align-items-center gap-2">
                <span class="text-muted small">Unit Price: <strong>$${price.toFixed(2)}</strong></span>
              </div>
              
              <div class="d-flex align-items-center gap-3">
                <div class="cart-qty-wrapper">
                  <button type="button" class="qty-control-btn" onclick="window.adjustCartQty('${esc(item.id)}', ${qty - 1})" aria-label="Decrease quantity" title="Decrease quantity">-</button>
                  <span class="px-2 fw-bold text-primary-app">${qty}</span>
                  <button type="button" class="qty-control-btn" onclick="window.adjustCartQty('${esc(item.id)}', ${qty + 1})" aria-label="Increase quantity" title="Increase quantity">+</button>
                </div>
                
                <strong class="text-flame d-block d-sm-none">$${lineTotal.toFixed(2)}</strong>

                <button type="button" class="btn btn-sm btn-outline-danger p-1 px-2 border-0" onclick="window.removeCartItem('${esc(item.id)}')" title="Remove item from cart" aria-label="Remove ${esc(item.nameEn)}">
                  <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const taxRate = 0.0825;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const pointsEarned = Math.round(total);

    container.innerHTML = `
      <div class="row g-4 align-items-stretch kf-paired-row">
        <!-- Left: Selected Dishes (6 cols, 50% width) -->
        <div class="col-lg-6 d-flex flex-column">
          <div class="kf-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-3 mb-3 border-bottom border-subtle">
                <div class="d-flex align-items-center gap-2">
                  <i data-lucide="shopping-bag" class="text-flame" style="width: 20px; height: 20px;"></i>
                  <h4 class="mb-0 fw-bold">Selected Cuts &amp; Grill Items</h4>
                </div>
                <span class="badge-tag badge-prime">${totalItems} ${totalItems === 1 ? 'Dish' : 'Dishes'} in Cart</span>
              </div>

              <div class="cart-items-wrapper mb-3" style="max-height: 420px; overflow-y: auto; padding-right: 4px;">
                ${itemsHtml}
              </div>

              <!-- Binchotan Downdraft Table Guarantee Badge -->
              <div class="p-3 bg-secondary-app rounded-3 border border-subtle d-flex align-items-center gap-3 mt-3">
                <div class="dash-stat-icon icon-gold flex-shrink-0" style="width: 42px; height: 42px;">
                  <i data-lucide="flame" style="width: 20px; height: 20px;"></i>
                </div>
                <div>
                  <h6 class="mb-0 fw-bold text-primary-app">100% Kishu White Oak Binchotan</h6>
                  <p class="text-secondary small mb-0">Embers are brought to 1,000°C for smokeless table grilling upon checkout.</p>
                </div>
              </div>
            </div>

            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-4 mt-3 border-top border-subtle">
              <a href="menu.html" class="btn-flame-outline btn-sm-custom d-inline-flex align-items-center gap-1.5">
                <i data-lucide="plus" style="width: 15px; height: 15px;"></i>
                <span>Add More Dishes</span>
              </a>
              <button type="button" class="btn btn-sm btn-outline-secondary text-muted" onclick="window.clearEntireCart()">
                <i data-lucide="trash" style="width: 14px; height: 14px;"></i>
                <span>Clear Entire Cart</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary Card (6 cols, 50% width, Sticky) -->
        <div class="col-lg-6">
          <div class="kf-card p-4 kf-sticky-summary position-sticky" style="top: 90px; z-index: 10;">
            <div>
              <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-subtle">
                <i data-lucide="receipt" class="text-gold" style="width: 20px; height: 20px;"></i>
                <h4 class="mb-0 fw-bold">Order Summary</h4>
              </div>

              <!-- Price Breakdown -->
              <div class="d-flex flex-column gap-2 mb-3 p-3 bg-secondary-app rounded-3 border border-subtle">
                <div class="d-flex justify-content-between text-secondary">
                  <span>Items Subtotal:</span>
                  <strong class="text-primary-app">$${subtotal.toFixed(2)}</strong>
                </div>
                <div class="d-flex justify-content-between text-secondary">
                  <span>Smokeless Table Downdraft Service:</span>
                  <span class="text-success fw-semibold">Free (Included)</span>
                </div>
                <div class="d-flex justify-content-between text-secondary">
                  <span>Estimated Sales Tax (8.25%):</span>
                  <strong class="text-primary-app">$${tax.toFixed(2)}</strong>
                </div>
                <div class="border-top border-subtle pt-2 mt-1 d-flex justify-content-between align-items-center">
                  <span class="fs-5 fw-bold text-primary-app">Total Amount:</span>
                  <span class="display-6 fw-extrabold text-gold" style="font-size: 1.65rem;">$${total.toFixed(2)}</span>
                </div>
              </div>

              <!-- Loyalty Points Preview -->
              <div class="alert alert-dark bg-secondary-app border-0 p-2.5 px-3 rounded-3 mb-3 d-flex align-items-center gap-2 small">
                <i data-lucide="sparkles" class="text-gold flex-shrink-0" style="width: 16px; height: 16px;"></i>
                <span class="text-secondary">Earn <strong class="text-gold">+${pointsEarned}</strong> loyalty points with this order.</span>
              </div>

              <!-- Seating / Dining Mode -->
              <div class="mb-3">
                <label class="form-label-custom" for="cart-table-select">Select Seating / Dining Mode</label>
                <select id="cart-table-select" class="form-select-custom">
                  <option value="Table 01 - Main Floor Downdraft" selected>Table 01 — Main Floor Downdraft</option>
                  <option value="Table 02 - Window Binchotan Booth">Table 02 — Window Binchotan Booth</option>
                  <option value="Table 03 - Standard Grill Table">Table 03 — Standard Grill Table</option>
                  <option value="Table 04 - Corner Grill Table">Table 04 — Corner Grill Table</option>
                  <option value="VIP Suite 01 - Imperial Dining">VIP Suite 01 — Imperial Dining</option>
                  <option value="Express Curbside Feast">Express Curbside Feast (Takeout)</option>
                </select>
              </div>

              <!-- Special Kitchen Instructions -->
              <div class="mb-3">
                <label class="form-label-custom" for="cart-notes">Kitchen &amp; Grill Notes (Optional)</label>
                <textarea id="cart-notes" class="form-control-custom" rows="2" placeholder="e.g. Medium-rare Galbi sear, extra perilla leaves and garlic..."></textarea>
              </div>
            </div>

            <div class="pt-2">
              <!-- Send to Order to Grill Button -->
              <button type="button" class="btn-flame w-100 py-3 justify-content-center shadow-lg" id="btn-cart-send-to-grill" onclick="window.proceedToCheckout()">
                <i data-lucide="send" style="width: 18px; height: 18px;"></i>
                <span>Send to Order to Grill</span>
              </button>

              <p class="text-muted small text-center mt-3 mb-0" style="font-size: 0.76rem;">
                <i data-lucide="shield-check" style="width: 14px; height: 14px;" class="text-success inline-block"></i>
                Direct POS kitchen integration · Instant ember prep
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  // Clear entire cart with confirmation
  window.clearEntireCart = async function() {
    let confirmed = false;
    if (window.kfConfirm) {
      confirmed = await window.kfConfirm({
        title: 'Clear Entire Cart?',
        message: 'Are you sure you want to clear all dishes from your table cart? This action cannot be undone.',
        confirmText: 'Clear Cart',
        cancelText: 'Keep Dishes',
        type: 'danger'
      });
    } else {
      confirmed = confirm('Are you sure you want to clear all dishes from your cart?');
    }

    if (confirmed) {
      if (window.KF_STATE) {
        window.KF_STATE.clearCart();
        if (window.kfToast) {
          window.kfToast.info('Your cart has been cleared.', 'Cart Emptied');
        }
      }
    }
  };

  // Listeners
  document.addEventListener('DOMContentLoaded', renderCartPage);
  window.addEventListener('kf:cart-changed', renderCartPage);

  window.renderCartPage = renderCartPage;
})(window);
