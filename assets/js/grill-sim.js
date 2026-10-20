/**
 * KoreFlame - Interactive Grill-Your-Own Experience Engine
 * Controls the interactive meat selector, doneness advice, pairings, and food-safety notices on Home 1.
 */

document.addEventListener('DOMContentLoaded', () => {
  initGrillSimulator();
});

function initGrillSimulator() {
  const container = document.getElementById('kf-grill-sim-container');
  if (!container || !window.KF_DATA || !window.KF_DATA.grillCuts) return;

  const cuts = window.KF_DATA.grillCuts;
  let activeIndex = 0;

  // Render selector buttons & display frame
  renderSimulator();

  function renderSimulator() {
    const cut = cuts[activeIndex];

    container.innerHTML = `
      <!-- Full-Width Symmetrical 5-Cut Selector Bar -->
      <div class="meat-cut-selector mb-3">
        ${cuts.map((c, idx) => `
          <button type="button" class="meat-selector-btn ${idx === activeIndex ? 'active' : ''}" data-cut-index="${idx}">
            <span class="cut-name-en">${c.nameEn}</span>
            <span class="cut-name-kr">${c.cutType}</span>
          </button>
        `).join('')}
      </div>

      <div class="row align-items-stretch g-3">
        <!-- Left: Meat Cooking Specs -->
        <div class="col-lg-7">
          <div class="kf-card p-3 p-lg-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <div>
                  <span class="badge-tag badge-prime mb-1" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">${cut.cutType}</span>
                  <h4 class="mb-0 fw-bold">${cut.nameEn}</h4>
                </div>
                <div class="text-end">
                  <span class="fs-4 fw-bold text-flame">$${cut.price.toFixed(2)}</span>
                  <span class="d-block small text-muted" style="font-size: 0.75rem;">${cut.servingSize}</span>
                </div>
              </div>

              <p class="text-secondary small mb-3 lh-sm">${cut.description}</p>

              <!-- Cooking Guidance Grid: Compact 2x2 with clear readings -->
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <div class="p-2 px-3 bg-secondary-app rounded border border-subtle h-100">
                    <div class="d-flex align-items-center gap-1 text-flame mb-1">
                      <i data-lucide="flame" style="width: 15px; height: 15px;"></i>
                      <strong class="text-uppercase" style="font-size: 0.7rem;">Grill Heat</strong>
                    </div>
                    <div class="fw-bold text-primary" style="font-size: 0.84rem;">${cut.grillSurfaceTemp || cut.temperature}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2 px-3 bg-secondary-app rounded border border-subtle h-100">
                    <div class="d-flex align-items-center gap-1 text-danger mb-1">
                      <i data-lucide="thermometer" style="width: 15px; height: 15px;"></i>
                      <strong class="text-uppercase" style="font-size: 0.7rem;">Core Temp</strong>
                    </div>
                    <div class="fw-bold text-primary" style="font-size: 0.84rem;">${cut.internalTargetTemp || '145°F (63°C)'}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2 px-3 bg-secondary-app rounded border border-subtle h-100">
                    <div class="d-flex align-items-center gap-1 text-gold mb-1">
                      <i data-lucide="timer" style="width: 15px; height: 15px;"></i>
                      <strong class="text-uppercase" style="font-size: 0.7rem;">Duration</strong>
                    </div>
                    <div class="fw-bold text-primary" style="font-size: 0.84rem;">${cut.cookingTime}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2 px-3 bg-secondary-app rounded border border-subtle h-100">
                    <div class="d-flex align-items-center gap-1 text-sizzle mb-1">
                      <i data-lucide="award" style="width: 15px; height: 15px;"></i>
                      <strong class="text-uppercase" style="font-size: 0.7rem;">Doneness</strong>
                    </div>
                    <div class="fw-bold text-primary" style="font-size: 0.84rem;">${cut.doneness}</div>
                  </div>
                </div>
              </div>

              <!-- Recommended Pairings: Sleek 2-column strip -->
              <div class="row g-2 mb-3">
                <div class="col-sm-6">
                  <div class="p-2 px-3 bg-surface-app border border-subtle rounded d-flex align-items-center gap-2">
                    <i data-lucide="soup" class="text-flame flex-shrink-0" style="width: 16px; height: 16px;"></i>
                    <div class="small lh-sm text-truncate">
                      <strong class="text-flame text-uppercase d-block" style="font-size: 0.68rem;">Sauce:</strong>
                      <span class="text-secondary text-truncate d-block" style="font-size: 0.78rem;">${cut.saucePairing}</span>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="p-2 px-3 bg-surface-app border border-subtle rounded d-flex align-items-center gap-2">
                    <i data-lucide="sparkles" class="text-gold flex-shrink-0" style="width: 16px; height: 16px;"></i>
                    <div class="small lh-sm text-truncate">
                      <strong class="text-gold text-uppercase d-block" style="font-size: 0.68rem;">Banchan:</strong>
                      <span class="text-secondary text-truncate d-block" style="font-size: 0.78rem;">${cut.suggestedBanchan}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="d-flex flex-wrap gap-2 pt-2 border-top border-subtle mt-auto">
              <button type="button" class="btn-flame btn-sm-custom" id="btn-add-sim-cut">
                <i data-lucide="shopping-bag" style="width: 15px; height: 15px;"></i>
                <span>Add to Cart ($${cut.price.toFixed(2)})</span>
              </button>
              <a href="pricing.html#reservations" class="btn-flame-outline btn-sm-custom">
                <i data-lucide="calendar" style="width: 15px; height: 15px;"></i>
                <span>Reserve Table</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Right: Visual Grill Platter & Hot Charcoal Glow -->
        <div class="col-lg-5">
          <div class="grill-display-card p-3 p-lg-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge-tag badge-prime" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">
                  <i data-lucide="flame" style="width: 13px; height: 13px;"></i> Live Sizzle Simulation
                </span>
                <span class="badge-tag badge-spice" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">Binchotan Heat</span>
              </div>
              <div class="grill-rack-visual rounded mb-2 position-relative overflow-hidden" style="height: 190px;">
                <div class="grill-mesh-grid"></div>
                <div class="grill-charcoal-glow"></div>
                <img src="${cut.image}" alt="${cut.nameEn}" class="active-cut-img kf-sizzle-float" id="sim-active-image">
                <div class="cooking-timer-badge" style="font-size: 0.72rem; padding: 0.22rem 0.5rem;">
                  <i data-lucide="clock" style="width: 13px; height: 13px;"></i>
                  <span>Est. ${cut.estTotalMinutes} mins</span>
                </div>
              </div>

              <!-- Live Grilling Stage Stepper -->
              <div class="p-2 rounded bg-secondary-app border border-subtle mb-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="small text-uppercase fw-bold text-flame" style="font-size: 0.68rem; letter-spacing: 0.04em;">Tabletop Sizzle Stages</span>
                  <span class="badge bg-primary-app text-gold border border-subtle" style="font-size: 0.65rem;">Live Masterclass</span>
                </div>
                <div class="d-flex align-items-center justify-content-between text-center small text-secondary gap-1" style="font-size: 0.72rem;">
                  <div class="flex-fill p-1 rounded bg-surface-app border border-subtle">
                    <span class="d-block text-gold fw-bold">1. Sear</span>
                    <span class="text-muted" style="font-size: 0.65rem;">Infrared Crust</span>
                  </div>
                  <i data-lucide="chevron-right" style="width: 11px; height: 11px; color: var(--text-muted);"></i>
                  <div class="flex-fill p-1 rounded bg-surface-app border border-subtle">
                    <span class="d-block text-flame fw-bold">2. Flip</span>
                    <span class="text-muted" style="font-size: 0.65rem;">Single Turn</span>
                  </div>
                  <i data-lucide="chevron-right" style="width: 11px; height: 11px; color: var(--text-muted);"></i>
                  <div class="flex-fill p-1 rounded bg-surface-app border border-subtle">
                    <span class="d-block text-sizzle fw-bold">3. Cut & Wrap</span>
                    <span class="text-muted" style="font-size: 0.65rem;">Table Shears</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <div class="p-1 px-2 rounded bg-surface-app border border-subtle text-center">
                    <span class="small text-muted d-block" style="font-size: 0.68rem;">Table Tool</span>
                    <strong class="text-gold small" style="font-size: 0.75rem;">${cut.id === 'samgyeopsal' || cut.id === 'galbi' ? 'Kitchen Shears' : 'Precision Tongs'}</strong>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-1 px-2 rounded bg-surface-app border border-subtle text-center">
                    <span class="small text-muted d-block" style="font-size: 0.68rem;">Flip Frequency</span>
                    <strong class="text-flame small" style="font-size: 0.75rem;">${cut.id === 'bulgogi' ? 'Continuous toss' : 'Flip once at half-time'}</strong>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center p-1 px-2 rounded bg-surface-app border border-subtle small text-muted" style="font-size: 0.72rem;">
                <span>Downdraft Suction</span>
                <span class="text-success fw-semibold"><i data-lucide="shield-check" class="me-1" style="width: 13px; height: 13px;"></i> Smokeless Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Reinitialize icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: container });
    }

    // Attach button events
    const selectorBtns = container.querySelectorAll('.meat-selector-btn');
    selectorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeIndex = parseInt(btn.getAttribute('data-cut-index'), 10);
        renderSimulator();
      });
    });

    // Add Cut to Cart
    const addBtn = container.querySelector('#btn-add-sim-cut');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        window.KF_STATE.addToCart({
          id: cut.id,
          nameEn: cut.nameEn,
          nameKr: cut.nameKr,
          price: cut.price,
          image: cut.image
        }, 1);
        if (window.triggerCartBounce) window.triggerCartBounce();
        window.kfToast.success(`Added ${cut.nameEn} to your table cart.`, 'Grill Cart Updated');
        if (typeof window.openCartDrawer === 'function') {
          window.openCartDrawer();
        }
      });
    }
  }
}
