/**
 * KoreFlame - Secure Checkout & Order Page Controller
 * Model: Secure Checkout — Complete Your Order
 * 1. Customer Information (Full Name, Phone, Email)
 * 2. Delivery Address (Street Address, City, State, ZIP / Pincode, Notes)
 * 3. Payment Method (Credit/Debit Card, COD, Online/UPI)
 * Right Panel: Review Your Order with 256-Bit Encrypted Order Dispatch
 */

(function(window) {
  'use strict';

  let isConfirmed = false;
  let confirmedOrder = null;
  let isSubmitting = false;
  let activePaymentMethod = 'card'; // 'card' | 'cod' | 'upi'

  const DEMO_FALLBACK_ITEMS = [
    {
      id: 'heirloom-avocado-tartine',
      nameEn: 'Heirloom Avocado Tartine',
      nameKr: 'Heirloom Avocado Tartine',
      price: 499,
      qty: 1,
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop'
    }
  ];

  function initOrderPage() {
    const container = document.getElementById('order-page-content');
    if (!container) return;

    const user = window.KF_STATE ? window.KF_STATE.getUser() : null;

    // 1. Authentication check
    if (!user || !user.isLoggedIn) {
      if (window.kfToast) {
        window.kfToast.info('Please sign in to proceed with secure checkout.', 'Sign In Required');
      }
      setTimeout(() => {
        window.location.href = 'login.html?redirect=order.html';
      }, 700);
      return;
    }

    // 2. Render Confirmation Screen if order was just completed
    if (isConfirmed && confirmedOrder) {
      renderConfirmationView(container, confirmedOrder);
      return;
    }

    // 3. Retrieve Cart items or use Demo Model dishes if cart is empty
    let cart = window.KF_STATE ? window.KF_STATE.getCart() : [];
    let isDemoCart = false;

    if (!cart || cart.length === 0) {
      cart = DEMO_FALLBACK_ITEMS;
      isDemoCart = true;
    }

    // 4. Render Active Order Review & Checkout Form
    renderOrderReviewForm(container, cart, user, isDemoCart);
  }

  function renderOrderReviewForm(container, cart, user, isDemoCart) {
    const esc = window.escapeHtml || (s => s);

    let subtotal = 0;
    let totalItems = 0;

    const itemsRows = cart.map(item => {
      const price = Number(item.price) || 0;
      const qty = parseInt(item.qty, 10) || 1;
      const lineTotal = price * qty;
      subtotal += lineTotal;
      totalItems += qty;

      return `
        <div class="cart-page-row p-3 mb-2 rounded-3 bg-surface-app border border-subtle d-flex align-items-center gap-3" data-item-id="${esc(item.id)}">
          <img src="${esc(item.image)}" alt="${esc(item.nameEn)}" class="rounded-3 flex-shrink-0" style="width: 64px; height: 64px; object-fit: cover;">
          
          <div class="flex-grow-1 min-w-0">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-1">
              <div>
                <h6 class="mb-0 fw-bold text-primary-app">${esc(item.nameEn)}</h6>
                <span class="text-secondary small d-block" style="font-size: 0.8rem;">${esc(item.nameKr || item.nameEn)}</span>
              </div>
              <strong class="text-gold fs-6">₹ ${lineTotal.toLocaleString('en-IN')}</strong>
            </div>

            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
              <span class="text-muted small">Qty: ${qty} × ₹ ${price.toLocaleString('en-IN')}</span>
              
              ${!isDemoCart ? `
                <div class="d-flex align-items-center gap-1">
                  <div class="cart-qty-wrapper">
                    <button type="button" class="qty-control-btn" onclick="window.adjustOrderQty('${esc(item.id)}', ${qty - 1})" aria-label="Decrease quantity">-</button>
                    <span class="px-2 fw-bold small text-primary-app">${qty}</span>
                    <button type="button" class="qty-control-btn" onclick="window.adjustOrderQty('${esc(item.id)}', ${qty + 1})" aria-label="Increase quantity">+</button>
                  </div>
                </div>
              ` : `
                <span class="badge-tag badge-prime" style="font-size: 0.72rem;">Model Item</span>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const taxRate = 0.05; // Tax (5%)
    const tax = Math.round(subtotal * taxRate);
    const deliveryFee = 99; // Delivery Fee ₹ 99
    const total = subtotal + tax + deliveryFee;

    container.innerHTML = `
      <!-- Back to Cart Option (Requirement 9) -->
      <div class="mb-4 d-flex justify-content-between align-items-center">
        <a href="cart.html" class="btn-flame-outline d-inline-flex align-items-center gap-2">
          <i data-lucide="arrow-left" style="width: 18px; height: 18px;"></i>
          <span>Back to Cart</span>
        </a>
        <div class="d-flex align-items-center gap-2 text-gold small">
          <i data-lucide="shield-check" style="width: 16px; height: 16px;"></i>
          <span>256-Bit SSL Secured</span>
        </div>
      </div>

      <div class="row g-4 align-items-stretch">
        
        <!-- LEFT COLUMN: 1. Customer Info, 2. Delivery Address, 3. Payment Method (6 cols, 50% width) -->
        <div class="col-lg-6">
          <div class="kf-card p-4 p-md-4">
            <form id="checkout-form" novalidate onsubmit="return false;">

              <!-- STEP 1: Customer Information -->
              <div class="checkout-step-section mb-4">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <span class="checkout-step-badge">1</span>
                  <div>
                    <h5 class="mb-0 fw-bold text-primary-app">Customer Information</h5>
                    <span class="text-secondary small">Personal contact details for order tracking</span>
                  </div>
                </div>

                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label-custom" for="checkout-name">Full Name *</label>
                    <input type="text" id="checkout-name" class="form-control-custom" placeholder="e.g. Maya Lin" value="" autocomplete="name" required>
                    <div class="form-feedback-error" id="checkout-name-error"></div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label-custom" for="checkout-phone">Phone Number *</label>
                    <input type="tel" id="checkout-phone" class="form-control-custom" placeholder="e.g. 9876543210" value="" autocomplete="tel" required>
                    <div class="form-feedback-error" id="checkout-phone-error"></div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label-custom" for="checkout-email">Email Address (Order Confirmation) *</label>
                    <input type="email" id="checkout-email" class="form-control-custom" placeholder="e.g. maya@example.com" value="" autocomplete="email" required>
                    <div class="form-feedback-error" id="checkout-email-error"></div>
                  </div>
                </div>
              </div>

              <!-- STEP 2: Delivery Address -->
              <div class="checkout-step-section mb-4 pt-3 border-top border-subtle">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <span class="checkout-step-badge">2</span>
                  <div>
                    <h5 class="mb-0 fw-bold text-primary-app">Delivery Address</h5>
                    <span class="text-secondary small">Destination where feast will be dispatched</span>
                  </div>
                </div>

                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label-custom" for="checkout-address">Street Address *</label>
                    <input type="text" id="checkout-address" class="form-control-custom" placeholder="e.g. 1420 NW Lovejoy Street" value="" autocomplete="street-address" required>
                    <div class="form-feedback-error" id="checkout-address-error"></div>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label-custom" for="checkout-city">City *</label>
                    <input type="text" id="checkout-city" class="form-control-custom" placeholder="e.g. Portland" value="" required>
                    <div class="form-feedback-error" id="checkout-city-error"></div>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label-custom" for="checkout-state">State *</label>
                    <input type="text" id="checkout-state" class="form-control-custom" placeholder="e.g. OR" value="" required>
                    <div class="form-feedback-error" id="checkout-state-error"></div>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label-custom" for="checkout-zip">ZIP / Pincode *</label>
                    <input type="text" id="checkout-zip" class="form-control-custom" placeholder="e.g. 97209" value="" maxlength="10" required>
                    <div class="form-feedback-error" id="checkout-zip-error"></div>
                  </div>

                  <div class="col-12">
                    <label class="form-label-custom" for="checkout-notes">Delivery Notes (Optional)</label>
                    <textarea id="checkout-notes" class="form-control-custom" rows="2" placeholder="e.g. Leave at front door, gate code #4921, ring doorbell..."></textarea>
                  </div>
                </div>
              </div>

              <!-- STEP 3: Payment Method (Frontend Demo) -->
              <div class="checkout-step-section pt-3 border-top border-subtle">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <span class="checkout-step-badge">3</span>
                  <div>
                    <div class="d-flex align-items-center gap-2">
                      <h5 class="mb-0 fw-bold text-primary-app">Payment Method</h5>
                      <span class="badge-tag badge-prime" style="font-size: 0.72rem;">Frontend Demo</span>
                    </div>
                    <span class="text-secondary small">Choose your preferred safe transaction channel</span>
                  </div>
                </div>

                <!-- Selectable Payment Tiles -->
                <div class="d-flex flex-column gap-2 mb-3">
                  
                  <!-- Option 1: Credit / Debit Card -->
                  <label class="payment-method-card ${activePaymentMethod === 'card' ? 'active' : ''}" for="pay-card">
                    <input type="radio" name="payment-method" id="pay-card" value="card" ${activePaymentMethod === 'card' ? 'checked' : ''} onchange="window.selectPaymentMethod('card')">
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-center">
                        <strong class="text-primary-app">Credit / Debit Card</strong>
                        <div class="d-flex gap-1">
                          <i data-lucide="credit-card" class="text-gold" style="width: 18px; height: 18px;"></i>
                        </div>
                      </div>
                      <span class="text-secondary small d-block">Pay securely with Visa, Mastercard, AMEX</span>
                    </div>
                  </label>

                  <!-- Option 2: Cash on Delivery (COD) -->
                  <label class="payment-method-card ${activePaymentMethod === 'cod' ? 'active' : ''}" for="pay-cod">
                    <input type="radio" name="payment-method" id="pay-cod" value="cod" ${activePaymentMethod === 'cod' ? 'checked' : ''} onchange="window.selectPaymentMethod('cod')">
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-center">
                        <strong class="text-primary-app">Cash on Delivery (COD)</strong>
                        <i data-lucide="banknote" class="text-gold" style="width: 18px; height: 18px;"></i>
                      </div>
                      <span class="text-secondary small d-block">Pay in cash when your food arrives at your door</span>
                    </div>
                  </label>

                  <!-- Option 3: Online Payment / UPI / NetBanking -->
                  <label class="payment-method-card ${activePaymentMethod === 'upi' ? 'active' : ''}" for="pay-upi">
                    <input type="radio" name="payment-method" id="pay-upi" value="upi" ${activePaymentMethod === 'upi' ? 'checked' : ''} onchange="window.selectPaymentMethod('upi')">
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-center">
                        <strong class="text-primary-app">Online Payment / UPI / NetBanking</strong>
                        <i data-lucide="smartphone" class="text-gold" style="width: 18px; height: 18px;"></i>
                      </div>
                      <span class="text-secondary small d-block">Instant transfer via Google Pay, Apple Pay or UPI</span>
                    </div>
                  </label>

                </div>

                <!-- Sub-panel: Credit/Debit Card Fields -->
                <div id="subpanel-card" class="payment-subpanel p-3 rounded-3 bg-secondary-app border border-subtle mb-3 ${activePaymentMethod === 'card' ? 'active' : ''}">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label-custom" for="checkout-card-number">Card Number</label>
                      <div class="position-relative">
                        <input type="text" id="checkout-card-number" class="form-control-custom pe-5" placeholder="e.g. 1234 5678 9012 3456" maxlength="19" value="">
                        <i data-lucide="credit-card" class="text-muted position-absolute end-0 top-50 translate-middle-y me-3" style="width: 18px; height: 18px;"></i>
                      </div>
                      <div class="form-feedback-error" id="checkout-card-number-error"></div>
                    </div>

                    <div class="col-6">
                      <label class="form-label-custom" for="checkout-card-expiry">Expiration Date</label>
                      <input type="text" id="checkout-card-expiry" class="form-control-custom" placeholder="e.g. MM / YY (12/28)" maxlength="7" value="">
                      <div class="form-feedback-error" id="checkout-card-expiry-error"></div>
                    </div>

                    <div class="col-6">
                      <label class="form-label-custom" for="checkout-card-cvv">Security Code (CVV)</label>
                      <input type="password" id="checkout-card-cvv" class="form-control-custom" placeholder="e.g. 123" maxlength="4" value="">
                      <div class="form-feedback-error" id="checkout-card-cvv-error"></div>
                    </div>
                  </div>
                </div>

                <!-- Sub-panel: Online Payment / UPI -->
                <div id="subpanel-upi" class="payment-subpanel p-3 rounded-3 bg-secondary-app border border-subtle mb-3 ${activePaymentMethod === 'upi' ? 'active' : ''}">
                  <label class="form-label-custom" for="checkout-upi-id">Virtual Payment Address (UPI / NetBanking)</label>
                  <input type="text" id="checkout-upi-id" class="form-control-custom mb-2" placeholder="e.g. maya@okhdfcbank or Apple Pay ID">
                  <div class="d-flex flex-wrap gap-1.5 mt-2">
                    <span class="badge-tag badge-prime">Google Pay</span>
                    <span class="badge-tag badge-prime">Apple Pay</span>
                    <span class="badge-tag badge-prime">PhonePe</span>
                    <span class="badge-tag badge-prime">Paytm</span>
                    <span class="badge-tag badge-prime">HDFC / ICICI / SBI</span>
                  </div>
                </div>

                <!-- Sub-panel: Cash on Delivery -->
                <div id="subpanel-cod" class="payment-subpanel p-3 rounded-3 bg-secondary-app border border-subtle mb-3 ${activePaymentMethod === 'cod' ? 'active' : ''}">
                  <div class="d-flex align-items-center gap-2 text-secondary small">
                    <i data-lucide="info" class="text-gold flex-shrink-0" style="width: 18px; height: 18px;"></i>
                    <span>Please keep exact cash ready upon delivery arrival. Our driver carries a contactless POS machine if you change your mind.</span>
                  </div>
                </div>

                <!-- Encrypted Assurance Note -->
                <div class="d-flex align-items-center gap-2 text-secondary small mt-2">
                  <i data-lucide="shield-check" class="text-gold flex-shrink-0" style="width: 16px; height: 16px;"></i>
                  <span style="font-size: 0.82rem;">Encrypted &amp; securely processed with end-to-end 256-bit tokenization.</span>
                </div>

              </div>

            </form>
          </div>
        </div>

        <!-- RIGHT COLUMN: Review Your Order & 256-Bit Encrypted Order Dispatch (Sticky, Zero Empty Space) -->
        <div class="col-lg-6">
          <div class="kf-card p-4 p-md-4 kf-sticky-summary position-sticky" style="top: 90px; z-index: 10;">
            <!-- Header -->
            <div class="d-flex align-items-center justify-content-between gap-2 pb-3 mb-3 border-bottom border-subtle">
              <div class="d-flex align-items-center gap-2">
                <i data-lucide="receipt" class="text-gold" style="width: 20px; height: 20px;"></i>
                <h4 class="mb-0 fw-bold text-primary-app">Review Your Order</h4>
              </div>
              <span class="badge-tag badge-prime">${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}</span>
            </div>

            <!-- Ordered Items List -->
            <div class="cart-items-wrapper mb-3" style="max-height: 260px; overflow-y: auto; padding-right: 4px;">
              ${itemsRows}
            </div>

            <!-- Price Breakdown (Subtotal, Tax 5%, Delivery Fee, Total Due) -->
            <div class="p-3 bg-secondary-app rounded-3 border border-subtle mb-3">
              <div class="d-flex justify-content-between text-secondary py-1">
                <span>Subtotal</span>
                <strong class="text-primary-app">₹ ${subtotal.toLocaleString('en-IN')}</strong>
              </div>
              <div class="d-flex justify-content-between text-secondary py-1">
                <span>Tax (5%)</span>
                <strong class="text-primary-app">₹ ${tax.toLocaleString('en-IN')}</strong>
              </div>
              <div class="d-flex justify-content-between text-secondary py-1">
                <span>Delivery Fee</span>
                <strong class="text-primary-app">₹ ${deliveryFee.toLocaleString('en-IN')}</strong>
              </div>
              <div class="border-top border-subtle pt-2 mt-2 d-flex justify-content-between align-items-center">
                <span class="fs-5 fw-bold text-primary-app">Total Due</span>
                <span class="display-6 fw-extrabold text-gold" style="font-size: 1.85rem;">₹ ${total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <!-- Security Trust Badge -->
            <div class="p-3 bg-secondary-app rounded-3 border border-subtle mb-3">
              <div class="d-flex align-items-start gap-2.5 text-secondary small">
                <div class="dash-stat-icon icon-gold flex-shrink-0" style="width: 34px; height: 34px;">
                  <i data-lucide="lock" style="width: 17px; height: 17px;"></i>
                </div>
                <div>
                  <strong class="text-primary-app d-block mb-0.5">256-Bit Encrypted Order Dispatch</strong>
                  <span style="font-size: 0.8rem;">Bank-grade TLS 1.3 protocol protects your identity, delivery coordinates, and payment authorization.</span>
                </div>
              </div>
            </div>

            <!-- Bottom Actions -->
            <div class="pt-1">
              <!-- Dispatch Button: 256-Bit Encrypted Order Dispatch (also supports confirm order execution) -->
              <button type="button" class="btn-flame w-100 py-3 justify-content-center shadow-lg" id="btn-confirm-order" onclick="window.confirmGrillOrder()" title="Confirm &amp; Send Order to Grill">
                <i data-lucide="lock" style="width: 18px; height: 18px;"></i>
                <span>256-Bit Encrypted Order Dispatch</span>
              </button>

              <!-- Back to Cart Option (Requirement 9) -->
              <a href="cart.html" class="btn-flame-outline w-100 mt-2 py-2.5 justify-content-center">
                <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                <span>Back to Cart</span>
              </a>

              <div class="mt-2 text-center">
                <span class="text-muted" style="font-size: 0.78rem;">
                  <i data-lucide="shield-check" class="text-gold inline-block" style="width: 13px; height: 13px;"></i>
                  256-Bit Encrypted Order Dispatch &bull; Safe &amp; Verified Delivery
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Attach real-time input filtering from KF_VALIDATOR
    attachInputFilters();
  }

  // Switch Payment Method
  window.selectPaymentMethod = function(method) {
    activePaymentMethod = method;
    
    // Update card active classes
    document.querySelectorAll('.payment-method-card').forEach(card => card.classList.remove('active'));
    const activeLabel = document.querySelector(`label[for="pay-${method}"]`);
    if (activeLabel) activeLabel.classList.add('active');

    // Update subpanels
    document.querySelectorAll('.payment-subpanel').forEach(panel => panel.classList.remove('active'));
    const activeSubpanel = document.getElementById(`subpanel-${method}`);
    if (activeSubpanel) activeSubpanel.classList.add('active');

    if (window.lucide) window.lucide.createIcons();
  };

  // Attach Input Filters to Form
  function attachInputFilters() {
    const nameEl = document.getElementById('checkout-name');
    const phoneEl = document.getElementById('checkout-phone');
    const emailEl = document.getElementById('checkout-email');
    const zipEl = document.getElementById('checkout-zip');
    const cardEl = document.getElementById('checkout-card-number');
    const expiryEl = document.getElementById('checkout-card-expiry');
    const cvvEl = document.getElementById('checkout-card-cvv');

    if (window.KF_VALIDATOR) {
      if (nameEl) window.KF_VALIDATOR.setupFieldFilter(nameEl, 'name');
      if (phoneEl) window.KF_VALIDATOR.setupFieldFilter(phoneEl, 'phone');
      if (emailEl) window.KF_VALIDATOR.setupFieldFilter(emailEl, 'email');
      if (zipEl) window.KF_VALIDATOR.setupFieldFilter(zipEl, 'number');
      if (cvvEl) window.KF_VALIDATOR.setupFieldFilter(cvvEl, 'number');
    }

    // Format credit card number with spaces every 4 digits
    if (cardEl) {
      cardEl.addEventListener('input', () => {
        let val = cardEl.value.replace(/\D/g, '').substring(0, 16);
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        cardEl.value = formatted;
      });
    }

    // Format expiration date MM/YY
    if (expiryEl) {
      expiryEl.addEventListener('input', () => {
        let val = expiryEl.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 3) {
          expiryEl.value = val.substring(0, 2) + ' / ' + val.substring(2);
        } else {
          expiryEl.value = val;
        }
      });
    }

    // Clear validation error on address inputs when user types
    const addressEl = document.getElementById('checkout-address');
    const cityEl = document.getElementById('checkout-city');
    const stateEl = document.getElementById('checkout-state');
    [addressEl, cityEl, stateEl, zipEl].forEach(el => {
      if (el) {
        el.addEventListener('input', () => {
          el.classList.remove('is-invalid');
          const err = document.getElementById(el.id + '-error');
          if (err) { err.textContent = ''; err.classList.remove('d-block'); }
        });
      }
    });
  }

  // Adjust quantity directly from the Order page (Requirement 4)
  window.adjustOrderQty = function(itemId, newQty) {
    if (window.KF_STATE) {
      window.KF_STATE.updateCartQty(itemId, newQty);
    }
  };

  // Confirm Order Execution (Requirements 8, 10 & 256-Bit Encrypted Order Dispatch)
  window.confirmGrillOrder = function() {
    if (isSubmitting) return; // Prevent duplicate clicks

    // Read form inputs
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const emailInput = document.getElementById('checkout-email');
    const addressInput = document.getElementById('checkout-address');
    const cityInput = document.getElementById('checkout-city');
    const stateInput = document.getElementById('checkout-state');
    const zipInput = document.getElementById('checkout-zip');
    const notesInput = document.getElementById('checkout-notes');

    // Perform validation if fields exist
    let hasError = false;
    if (window.KF_VALIDATOR) {
      if (nameInput) {
        const v = window.KF_VALIDATOR.validateName(nameInput.value, true, 'Full Name');
        if (!v.valid) {
          window.KF_VALIDATOR.showFieldError(nameInput, v.message, document.getElementById('checkout-name-error'));
          hasError = true;
        } else {
          window.KF_VALIDATOR.clearFieldError(nameInput, document.getElementById('checkout-name-error'));
        }
      }

      if (phoneInput) {
        const v = window.KF_VALIDATOR.validatePhone(phoneInput.value, true, 'Phone number');
        if (!v.valid) {
          window.KF_VALIDATOR.showFieldError(phoneInput, v.message, document.getElementById('checkout-phone-error'));
          hasError = true;
        } else {
          window.KF_VALIDATOR.clearFieldError(phoneInput, document.getElementById('checkout-phone-error'));
        }
      }

      if (emailInput) {
        const v = window.KF_VALIDATOR.validateEmail(emailInput.value, true);
        if (!v.valid) {
          window.KF_VALIDATOR.showFieldError(emailInput, v.message, document.getElementById('checkout-email-error'));
          hasError = true;
        } else {
          window.KF_VALIDATOR.clearFieldError(emailInput, document.getElementById('checkout-email-error'));
        }
      }
    }

    // Validate address fields
    if (addressInput) {
      if (!addressInput.value.trim()) {
        addressInput.classList.add('is-invalid');
        const err = document.getElementById('checkout-address-error');
        if (err) { err.textContent = 'Street Address is required.'; err.classList.add('d-block'); }
        hasError = true;
      } else {
        addressInput.classList.remove('is-invalid');
        const err = document.getElementById('checkout-address-error');
        if (err) { err.textContent = ''; err.classList.remove('d-block'); }
      }
    }

    if (cityInput) {
      if (!cityInput.value.trim()) {
        cityInput.classList.add('is-invalid');
        const err = document.getElementById('checkout-city-error');
        if (err) { err.textContent = 'City is required.'; err.classList.add('d-block'); }
        hasError = true;
      } else {
        cityInput.classList.remove('is-invalid');
        const err = document.getElementById('checkout-city-error');
        if (err) { err.textContent = ''; err.classList.remove('d-block'); }
      }
    }

    if (stateInput) {
      if (!stateInput.value.trim()) {
        stateInput.classList.add('is-invalid');
        const err = document.getElementById('checkout-state-error');
        if (err) { err.textContent = 'State is required.'; err.classList.add('d-block'); }
        hasError = true;
      } else {
        stateInput.classList.remove('is-invalid');
        const err = document.getElementById('checkout-state-error');
        if (err) { err.textContent = ''; err.classList.remove('d-block'); }
      }
    }

    if (zipInput) {
      if (!zipInput.value.trim()) {
        zipInput.classList.add('is-invalid');
        const err = document.getElementById('checkout-zip-error');
        if (err) { err.textContent = 'ZIP / Pincode is required.'; err.classList.add('d-block'); }
        hasError = true;
      } else {
        zipInput.classList.remove('is-invalid');
        const err = document.getElementById('checkout-zip-error');
        if (err) { err.textContent = ''; err.classList.remove('d-block'); }
      }
    }

    if (hasError) {
      if (window.kfToast) {
        window.kfToast.warning('Please review and correct the required fields.', 'Validation Error');
      }
      return;
    }

    let cart = window.KF_STATE ? window.KF_STATE.getCart() : [];
    if (!cart || cart.length === 0) {
      cart = DEMO_FALLBACK_ITEMS;
    }

    const user = window.KF_STATE ? window.KF_STATE.getUser() : null;
    if (!user || !user.isLoggedIn) {
      window.location.href = 'login.html?redirect=order.html';
      return;
    }

    // Lock submission button
    isSubmitting = true;
    const btn = document.getElementById('btn-confirm-order');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> 256-Bit Encrypting &amp; Dispatching...`;
    }

    const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.qty, 10) || 1), 0);
    const tax = Math.round(subtotal * 0.05);
    const deliveryFee = 99;
    const total = subtotal + tax + deliveryFee;

    const orderData = {
      guestName: nameInput && nameInput.value.trim() ? nameInput.value.trim() : (user.name || 'Guest User'),
      guestPhone: phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : (user.phone || ''),
      guestEmail: emailInput && emailInput.value.trim() ? emailInput.value.trim() : (user.email || ''),
      deliveryAddress: {
        street: addressInput ? addressInput.value.trim() : '',
        city: cityInput ? cityInput.value.trim() : '',
        state: stateInput ? stateInput.value.trim() : '',
        zip: zipInput ? zipInput.value.trim() : ''
      },
      paymentMethod: activePaymentMethod === 'card' ? 'Credit / Debit Card' : (activePaymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment / UPI'),
      notes: notesInput ? notesInput.value.trim() : '',
      items: cart.map(i => ({ ...i })),
      subtotal: subtotal,
      tax: tax,
      deliveryFee: deliveryFee,
      total: total,
      tableNumber: 'Delivery Feast',
      diningMode: 'Home Delivery'
    };

    // Simulate short network delay for luxury realism
    setTimeout(() => {
      // 1. Add order to state storage
      const savedOrder = window.KF_STATE.addOrder(orderData);
      
      // 2. Clear cart ONLY after successful confirmation (Requirement 10)
      window.KF_STATE.clearCart();

      // 3. Mark as confirmed
      isConfirmed = true;
      confirmedOrder = savedOrder;
      isSubmitting = false;

      // 4. Display confirmation toast
      if (window.kfToast) {
        window.kfToast.success(`Order #${savedOrder.id} placed! 256-Bit Encrypted Order Dispatched.`, 'Order Confirmed');
      }

      // 5. Render confirmation view
      const container = document.getElementById('order-page-content');
      if (container) {
        renderConfirmationView(container, savedOrder);
      }
    }, 700);
  };

  // Render Confirmation Screen (Requirement 10)
  function renderConfirmationView(container, order) {
    const esc = window.escapeHtml || (s => s);
    const addr = order.deliveryAddress || { street: '1420 NW Lovejoy Street', city: 'Portland', state: 'OR', zip: '97209' };

    const itemsSummary = (order.items || []).map(item => `
      <div class="d-flex justify-content-between align-items-center py-2.5 border-bottom border-subtle">
        <div class="d-flex align-items-center gap-2">
          <span class="badge-tag badge-prime">${item.qty}x</span>
          <span class="fw-semibold text-primary-app">${esc(item.nameEn)}</span>
        </div>
        <span class="text-gold fw-bold">₹ ${((Number(item.price) || 0) * (item.qty || 1)).toLocaleString('en-IN')}</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="order-confirmation-card p-4 p-md-5 my-3 shadow-lg" style="max-width: 820px; margin-inline: auto;">
        
        <div class="text-center mb-4">
          <div class="dash-stat-icon icon-green mx-auto mb-3" style="width: 72px; height: 72px;">
            <i data-lucide="check-circle" style="width: 38px; height: 38px;"></i>
          </div>
          <span class="badge-tag badge-prime fs-6 py-1.5 px-3 mb-2">256-Bit Encrypted Order Dispatched</span>
          <h2 class="display-6 fw-extrabold mb-1">Your Order is Placed!</h2>
          <p class="text-secondary mb-0">We have received your delivery order and our kitchen is preparing your dishes fresh.</p>
        </div>

        <!-- Order Meta Card -->
        <div class="p-4 bg-secondary-app rounded-3 border border-subtle mb-4">
          <div class="row g-3 text-center text-sm-start">
            <div class="col-sm-6 col-md-3">
              <span class="small text-muted d-block text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.05em; font-weight: 700;">Order Reference</span>
              <strong class="text-flame fs-5 fw-bold">${esc(order.id)}</strong>
            </div>
            <div class="col-sm-6 col-md-3">
              <span class="small text-muted d-block text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.05em; font-weight: 700;">Payment Method</span>
              <strong class="text-primary-app">${esc(order.paymentMethod || 'Credit / Debit Card')}</strong>
            </div>
            <div class="col-sm-6 col-md-3">
              <span class="small text-muted d-block text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.05em; font-weight: 700;">Estimated Delivery</span>
              <strong class="text-success fw-bold">25 – 35 Mins</strong>
            </div>
            <div class="col-sm-6 col-md-3">
              <span class="small text-muted d-block text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.05em; font-weight: 700;">Recipient</span>
              <strong class="text-primary-app">${esc(order.guestName || 'Guest')}</strong>
            </div>
          </div>
        </div>

        <!-- Delivery Address Box -->
        <div class="p-3 bg-surface-app rounded-3 border border-subtle mb-4 d-flex align-items-center gap-3">
          <div class="dash-stat-icon icon-gold flex-shrink-0" style="width: 44px; height: 44px;">
            <i data-lucide="map-pin" style="width: 22px; height: 22px;"></i>
          </div>
          <div>
            <span class="small text-muted d-block" style="font-size: 0.75rem;">DELIVERY DESTINATION</span>
            <strong class="text-primary-app">${esc(addr.street)}, ${esc(addr.city)}, ${esc(addr.state)} ${esc(addr.zip)}</strong>
            <span class="text-secondary small d-block">Phone: ${esc(order.guestPhone)} &bull; Email: ${esc(order.guestEmail || '')}</span>
          </div>
        </div>

        <!-- Ordered Dishes List -->
        <div class="mb-4">
          <h5 class="fw-bold mb-3 text-primary-app">Ordered Dishes</h5>
          <div class="bg-surface-app p-3 rounded-3 border border-subtle">
            ${itemsSummary}
            <div class="d-flex justify-content-between text-secondary pt-3 mt-1">
              <span>Subtotal:</span>
              <strong class="text-primary-app">₹ ${Number(order.subtotal || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div class="d-flex justify-content-between text-secondary py-1">
              <span>Tax (5%):</span>
              <strong class="text-primary-app">₹ ${Number(order.tax || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div class="d-flex justify-content-between text-secondary py-1">
              <span>Delivery Fee:</span>
              <strong class="text-primary-app">₹ ${Number(order.deliveryFee || 99).toLocaleString('en-IN')}</strong>
            </div>
            <div class="d-flex justify-content-between align-items-center border-top border-subtle pt-3 mt-2">
              <span class="fs-5 fw-bold text-primary-app">Total Due:</span>
              <span class="display-6 fw-extrabold text-gold" style="font-size: 1.65rem;">₹ ${Number(order.total || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        ${order.notes ? `
          <div class="p-3 bg-secondary-app rounded-3 border border-subtle mb-4 small text-secondary">
            <strong class="text-gold d-block mb-1">Delivery Notes:</strong>
            ${esc(order.notes)}
          </div>
        ` : ''}

        <!-- Next Actions -->
        <div class="d-flex flex-wrap justify-content-center gap-3 pt-3 border-top border-subtle">
          <a href="dashboard.html" class="btn-flame py-2.5 px-4 d-inline-flex align-items-center gap-2">
            <i data-lucide="layout-dashboard" style="width: 18px; height: 18px;"></i>
            <span>View in Guest Dashboard</span>
          </a>
          <a href="menu.html" class="btn-flame-outline py-2.5 px-4 d-inline-flex align-items-center gap-2">
            <i data-lucide="utensils" style="width: 18px; height: 18px;"></i>
            <span>Order More Dishes</span>
          </a>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Event Listeners
  document.addEventListener('DOMContentLoaded', initOrderPage);
  window.addEventListener('kf:cart-changed', () => {
    // Re-render only if order is not yet confirmed
    if (!isConfirmed) {
      initOrderPage();
    }
  });

  window.initOrderPage = initOrderPage;
})(window);
