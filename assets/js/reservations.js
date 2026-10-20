/**
 * KoreFlame - 5-Step Reservation Wizard Engine
 * Handles Party Size, Table Type, Slot Picker, Guest Info Validation, Dashboard Sync & Calendar Export.
 */

document.addEventListener('DOMContentLoaded', () => {
  initReservationWizard();
});

function initReservationWizard() {
  const wizardContainer = document.getElementById('kf-reservation-wizard');
  if (!wizardContainer) return;

  // Wizard State
  const state = {
    step: 1,
    partySize: 4,
    tableType: "Smokeless Downdraft Table",
    date: getTomorrowDateString(),
    time: "19:00",
    guestName: "",
    email: "",
    phone: "",
    dietary: "",
    specialRequests: "",
    bookingRef: null
  };

  // Pre-fill if logged in
  const currentUser = window.KF_STATE.getUser();
  if (currentUser.isLoggedIn) {
    state.guestName = currentUser.name;
    state.email = currentUser.email;
    state.phone = currentUser.phone;
  }

  // Time Slots definition (lunch & dinner)
  const timeSlots = [
    { time: "12:00 PM", raw: "12:00", status: "available" },
    { time: "12:30 PM", raw: "12:30", status: "available" },
    { time: "01:00 PM", raw: "13:00", status: "limited" },
    { time: "01:30 PM", raw: "13:30", status: "unavailable" },
    { time: "05:30 PM", raw: "17:30", status: "available" },
    { time: "06:00 PM", raw: "18:00", status: "available" },
    { time: "06:30 PM", raw: "18:30", status: "limited" },
    { time: "07:00 PM", raw: "19:00", status: "available" },
    { time: "07:30 PM", raw: "19:30", status: "limited" },
    { time: "08:00 PM", raw: "20:00", status: "available" },
    { time: "08:30 PM", raw: "20:30", status: "available" },
    { time: "09:00 PM", raw: "21:00", status: "unavailable" }
  ];

  renderWizard();

  function renderWizard() {
    wizardContainer.innerHTML = `
      <div class="reservation-wizard-card">
        <!-- Progress Steps Header -->
        <div class="wizard-steps-header mb-4">
          <div class="wizard-step-node ${state.step >= 1 ? 'active' : ''} ${state.step > 1 ? 'completed' : ''}">
            <div class="wizard-node-circle">${state.step > 1 ? '<i data-lucide="check" style="width: 18px; height: 18px;"></i>' : '1'}</div>
            <span class="wizard-node-title">Party Size</span>
          </div>
          <div class="wizard-step-node ${state.step >= 2 ? 'active' : ''} ${state.step > 2 ? 'completed' : ''}">
            <div class="wizard-node-circle">${state.step > 2 ? '<i data-lucide="check" style="width: 18px; height: 18px;"></i>' : '2'}</div>
            <span class="wizard-node-title">Table Type</span>
          </div>
          <div class="wizard-step-node ${state.step >= 3 ? 'active' : ''} ${state.step > 3 ? 'completed' : ''}">
            <div class="wizard-node-circle">${state.step > 3 ? '<i data-lucide="check" style="width: 18px; height: 18px;"></i>' : '3'}</div>
            <span class="wizard-node-title">Date & Time</span>
          </div>
          <div class="wizard-step-node ${state.step >= 4 ? 'active' : ''} ${state.step > 4 ? 'completed' : ''}">
            <div class="wizard-node-circle">${state.step > 4 ? '<i data-lucide="check" style="width: 18px; height: 18px;"></i>' : '4'}</div>
            <span class="wizard-node-title">Guest Info</span>
          </div>
          <div class="wizard-step-node ${state.step >= 5 ? 'active' : ''}">
            <div class="wizard-node-circle">5</div>
            <span class="wizard-node-title">Confirm</span>
          </div>
        </div>

        <!-- Step Views -->
        <div class="wizard-step-body">
          ${renderCurrentStep()}
        </div>
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: wizardContainer });
    }

    attachStepEvents();
  }

  function renderCurrentStep() {
    switch (state.step) {
      // Step 1: Party Size
      case 1:
        return `
          <div class="text-center mb-4">
            <h4>Select Your Party Size</h4>
            <p class="text-muted">How many grill companions will be joining your table?</p>
          </div>

          <div class="party-size-selector mb-4">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => `
              <button type="button" class="party-size-btn ${state.partySize === num ? 'active' : ''}" data-size="${num}">
                ${num}
              </button>
            `).join('')}
            <button type="button" class="party-size-btn ${state.partySize > 10 ? 'active' : ''}" data-size="12">
              10+ VIP
            </button>
          </div>

          ${state.partySize > 10 ? `
            <div class="alert alert-warning bg-secondary-app border-0 d-flex align-items-center gap-2 mb-4">
              <i data-lucide="users" class="text-gold" style="width: 20px; height: 20px;"></i>
              <span class="small">Parties of 10 or more are automatically assigned to our Private Banquet Room or multi-grill adjoining alcove with dedicated service.</span>
            </div>
          ` : ''}

          <div class="d-flex justify-content-end pt-3 border-top border-subtle">
            <button type="button" class="btn-flame" id="btn-next-step">
              <span>Continue to Table Preference</span>
              <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>
            </button>
          </div>
        `;

      // Step 2: Table Preference
      case 2:
        return `
          <div class="text-center mb-4">
            <h4>Choose Table Ambience & Grill Preference</h4>
            <p class="text-muted">Select how you want to experience the Binchotan flame tonight.</p>
          </div>

          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <div class="table-type-card ${state.tableType === 'Standard Grill Booth' ? 'active' : ''}" data-type="Standard Grill Booth">
                <div class="table-type-header">
                  <h5>Standard Grill Booth</h5>
                  <i data-lucide="armchair" class="text-flame"></i>
                </div>
                <p class="text-secondary small table-type-desc">Cozy leather-backed circular booths with overhead industrial ventilation hoods. Classic Seoul nightlife feel.</p>
                <span class="badge-tag badge-popular">High Energy</span>
              </div>
            </div>

            <div class="col-md-4">
              <div class="table-type-card ${state.tableType === 'Smokeless Downdraft Table' ? 'active' : ''}" data-type="Smokeless Downdraft Table">
                <div class="table-type-header">
                  <h5>Smokeless Downdraft</h5>
                  <i data-lucide="wind" class="text-gold"></i>
                </div>
                <p class="text-secondary small table-type-desc">Advanced subterranean suction traps 99% of smoke at grill level. Keeps your attire pristine.</p>
                <span class="badge-tag badge-prime">Recommended</span>
              </div>
            </div>

            <div class="col-md-4">
              <div class="table-type-card ${state.tableType === 'Private Dining Room (VIP)' ? 'active' : ''}" data-type="Private Dining Room (VIP)">
                <div class="table-type-header">
                  <h5>Private VIP Room</h5>
                  <i data-lucide="crown" class="text-gold"></i>
                </div>
                <p class="text-secondary small table-type-desc">Exclusive sliding acoustic doors, dedicated sommelier & grillmaster, customized soundscapes.</p>
                <span class="badge-tag badge-spice">VIP Luxury</span>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between pt-3 border-top border-subtle">
            <button type="button" class="btn-flame-outline" id="btn-prev-step">
              <i data-lucide="arrow-left" style="width: 18px; height: 18px;"></i>
              <span>Back</span>
            </button>
            <button type="button" class="btn-flame" id="btn-next-step">
              <span>Select Date & Time</span>
              <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>
            </button>
          </div>
        `;

      // Step 3: Date and Time
      case 3:
        return `
          <div class="text-center mb-4">
            <h4>Select Reservation Date & Slot</h4>
            <p class="text-muted">Past dates are disabled. Times show real-time demo seat availability.</p>
          </div>

          <div class="row g-4 mb-4">
            <div class="col-md-5">
              <label class="form-label-custom">Dining Date</label>
              <input type="date" class="form-control-custom" id="wizard-date" min="${getTodayDateString()}" max="${getMaxDateString()}" value="${state.date}">
              <div class="small text-muted mt-2">
                <i data-lucide="info" style="width: 14px; height: 14px;"></i> Reservations open 30 days in advance.
              </div>
            </div>

            <div class="col-md-7">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label-custom mb-0">Available Seating Times</label>
                <div class="d-flex gap-2 small">
                  <span class="text-success">● Available</span>
                  <span class="text-gold">● Limited</span>
                  <span class="text-muted text-decoration-line-through">● Sold Out</span>
                </div>
              </div>

              <div class="d-grid" style="grid-template-columns: repeat(auto-fill, minmax(105px, 1fr)); gap: 0.5rem;">
                ${timeSlots.map(slot => `
                  <button type="button" 
                          class="time-slot-btn ${slot.status === 'limited' ? 'limited' : ''} ${state.time === slot.raw ? 'active' : ''}" 
                          data-time="${slot.raw}" 
                          ${slot.status === 'unavailable' ? 'disabled' : ''}>
                    ${slot.time}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between pt-3 border-top border-subtle">
            <button type="button" class="btn-flame-outline" id="btn-prev-step">
              <i data-lucide="arrow-left" style="width: 18px; height: 18px;"></i>
              <span>Back</span>
            </button>
            <button type="button" class="btn-flame" id="btn-next-step">
              <span>Guest Details</span>
              <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>
            </button>
          </div>
        `;

      // Step 4: Guest Details
      case 4: {
        const esc = window.escapeHtml || (s => s);
        return `
          <div class="text-center mb-4">
            <h4>Primary Guest Contact & Special Notes</h4>
            <p class="text-muted">We use these details to secure your grill table and confirm seating.</p>
          </div>

          <form id="wizard-guest-form" novalidate class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label-custom" for="guest-name">Full Name *</label>
              <input type="text" class="form-control-custom" id="guest-name" value="${esc(state.guestName)}" placeholder="e.g. Min-Ji Kim" required>
              <div class="form-feedback-error" id="guest-name-error"></div>
            </div>
            <div class="col-md-6">
              <label class="form-label-custom" for="guest-email">Email Address *</label>
              <input type="email" class="form-control-custom" id="guest-email" value="${esc(state.email)}" placeholder="e.g. guest@koreflame.com" required>
              <div class="form-feedback-error" id="guest-email-error"></div>
            </div>
            <div class="col-md-6">
              <label class="form-label-custom" for="guest-phone">Mobile Phone Number *</label>
              <input type="tel" class="form-control-custom" id="guest-phone" value="${esc(state.phone)}" placeholder="e.g. +1 (555) 382-7492" required>
              <div class="form-feedback-error" id="guest-phone-error"></div>
            </div>
            <div class="col-md-6">
              <label class="form-label-custom" for="guest-dietary">Dietary Restrictions or Allergies</label>
              <input type="text" class="form-control-custom" id="guest-dietary" value="${esc(state.dietary)}" placeholder="e.g. Shellfish allergy, Halal beef only">
            </div>
            <div class="col-12">
              <label class="form-label-custom" for="guest-requests">Celebration & Special Requests</label>
              <textarea class="form-control-custom" id="guest-requests" rows="2" placeholder="e.g. Anniversary dinner, quiet corner booth">${esc(state.specialRequests)}</textarea>
            </div>
          </form>

          <div class="d-flex justify-content-between pt-3 border-top border-subtle">
            <button type="button" class="btn-flame-outline" id="btn-prev-step">
              <i data-lucide="arrow-left" style="width: 18px; height: 18px;"></i>
              <span>Back</span>
            </button>
            <button type="button" class="btn-flame" id="btn-submit-booking">
              <i data-lucide="check" style="width: 18px; height: 18px;"></i>
              <span>Submit Reservation Request</span>
            </button>
          </div>
        `;
      }

      // Step 5: Confirmation & Add to Calendar (Honest Demo Prototype)
      case 5: {
        const esc = window.escapeHtml || (s => s);
        const safeRef = esc(state.bookingRef);
        return `
          <div class="text-center py-4">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style="width: 72px; height: 72px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h3 class="text-flame mb-1">Reservation Request Recorded!</h3>
            <p class="text-muted">Simulated booking reference: <strong class="text-gold font-monospace fs-5">${safeRef}</strong></p>

            <div class="p-2 px-3 bg-secondary-app border border-subtle rounded max-w-lg mx-auto small text-muted mb-4" style="max-width: 580px;">
              <i data-lucide="info" class="text-flame me-1" style="width: 14px; height: 14px;"></i>
              <strong>Frontend Prototype Notice:</strong> KoreFlame is demonstrating table reservation UX. In a live production deployment, this submits to a table management API (e.g., OpenTable, SevenRooms, or Resy) for live table lock and automated SMS confirmation.
            </div>

            <div class="kf-card text-start max-w-lg mx-auto p-4 mb-4" style="max-width: 580px; margin-inline: auto;">
              <div class="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom border-subtle">
                <div class="kf-brand-logo-wrap" style="width: 48px; height: 48px; flex-shrink: 0;">
                  <div class="kf-logo-aura"></div>
                  <img src="assets/images/logo.png" alt="KoreFlame" class="brand-logo-img">
                </div>
                <div>
                  <h4 class="mb-0 fw-bold">Kore<span class="text-flame">Flame</span> <span class="text-gold fs-6">Korean BBQ</span></h4>
                  <div class="small text-muted" style="font-size: 0.75rem; letter-spacing: 0.05em;">PREMIUM SEOUL STREET-GRILL & BINCHOTAN HEARTH</div>
                </div>
              </div>
              <h5 class="border-bottom border-subtle pb-2 mb-3 text-gold">Reservation Details</h5>
              <div class="row g-2 mb-2">
                <div class="col-6 text-muted">Guest Name:</div>
                <div class="col-6 text-end font-weight-bold">${esc(state.guestName)}</div>
                <div class="col-6 text-muted">Party Size:</div>
                <div class="col-6 text-end font-weight-bold">${esc(state.partySize)} Guests</div>
                <div class="col-6 text-muted">Table Ambience:</div>
                <div class="col-6 text-end font-weight-bold">${esc(state.tableType)}</div>
                <div class="col-6 text-muted">Date & Time:</div>
                <div class="col-6 text-end font-weight-bold text-flame">${esc(state.date)} at ${esc(state.time)}</div>
                ${state.dietary ? `
                  <div class="col-6 text-muted">Dietary Notes:</div>
                  <div class="col-6 text-end">${esc(state.dietary)}</div>
                ` : ''}
              </div>
              <div class="alert alert-dark bg-secondary-app border-0 small text-muted mb-0 mt-3">
                <i data-lucide="bell" style="width: 14px; height: 14px;"></i>
                Tables are held for 15 minutes past the scheduled seating time.
              </div>
            </div>

            <div class="d-flex flex-wrap justify-content-center gap-3">
              <button type="button" class="btn-flame" onclick="downloadReservationPdf('${safeRef}', '${esc(state.date)}', '${esc(state.time)}')">
                <i data-lucide="file-down" style="width: 18px; height: 18px;"></i>
                <span>Download Reservation PDF</span>
              </button>
              <button type="button" class="btn-flame-outline" onclick="downloadCalendarFile('${safeRef}', '${esc(state.date)}', '${esc(state.time)}')">
                <i data-lucide="calendar-plus" style="width: 18px; height: 18px;"></i>
                <span>Add to Calendar (.ics)</span>
              </button>
              <a href="dashboard.html" class="btn-flame-outline">
                <i data-lucide="layout-dashboard" style="width: 18px; height: 18px;"></i>
                <span>Guest Dashboard</span>
              </a>
              <button type="button" class="btn-flame-outline" onclick="window.location.reload()">
                <i data-lucide="rotate-ccw" style="width: 18px; height: 18px;"></i>
                <span>Book Another Table</span>
              </button>
            </div>
          </div>
        `;
      }
    }
  }

  function attachStepEvents() {
    // Step 1: Party size buttons
    const partyBtns = wizardContainer.querySelectorAll('.party-size-btn');
    partyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.partySize = parseInt(btn.getAttribute('data-size'), 10);
        renderWizard();
      });
    });

    // Step 2: Table preference cards
    const tableCards = wizardContainer.querySelectorAll('.table-type-card');
    tableCards.forEach(card => {
      card.addEventListener('click', () => {
        state.tableType = card.getAttribute('data-type');
        renderWizard();
      });
    });

    // Step 3: Date & Time
    const dateInput = wizardContainer.querySelector('#wizard-date');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        state.date = e.target.value;
      });
    }

    const timeBtns = wizardContainer.querySelectorAll('.time-slot-btn:not(:disabled)');
    timeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.time = btn.getAttribute('data-time');
        renderWizard();
      });
    });

    // Navigation buttons
    const nextBtn = wizardContainer.querySelector('#btn-next-step');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        state.step += 1;
        renderWizard();
      });
    }

    const prevBtn = wizardContainer.querySelector('#btn-prev-step');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        state.step -= 1;
        renderWizard();
      });
    }

    // Attach field validation filters to step 4 guest fields
    const gName = wizardContainer.querySelector('#guest-name');
    const gEmail = wizardContainer.querySelector('#guest-email');
    const gPhone = wizardContainer.querySelector('#guest-phone');
    const gNameErr = wizardContainer.querySelector('#guest-name-error');
    const gEmailErr = wizardContainer.querySelector('#guest-email-error');
    const gPhoneErr = wizardContainer.querySelector('#guest-phone-error');
    const v = window.KF_VALIDATOR;
    if (v) {
      if (gName) {
        v.setupFieldFilter(gName, 'name');
        gName.addEventListener('input', () => v.clearFieldError(gName, gNameErr));
      }
      if (gEmail) {
        v.setupFieldFilter(gEmail, 'email');
        gEmail.addEventListener('input', () => v.clearFieldError(gEmail, gEmailErr));
      }
      if (gPhone) {
        v.setupFieldFilter(gPhone, 'phone');
        gPhone.addEventListener('input', () => v.clearFieldError(gPhone, gPhoneErr));
      }
    }

    // Submit booking button
    const submitBtn = wizardContainer.querySelector('#btn-submit-booking');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const nameEl = wizardContainer.querySelector('#guest-name');
        const emailEl = wizardContainer.querySelector('#guest-email');
        const phoneEl = wizardContainer.querySelector('#guest-phone');
        const dietaryEl = wizardContainer.querySelector('#guest-dietary');
        const requestsEl = wizardContainer.querySelector('#guest-requests');

        const name = nameEl ? nameEl.value.trim() : '';
        const email = emailEl ? emailEl.value.trim() : '';
        const phone = phoneEl ? phoneEl.value.trim() : '';
        const dietary = dietaryEl ? dietaryEl.value.trim() : '';
        const requests = requestsEl ? requestsEl.value.trim() : '';

        // Comprehensive validation with KF_VALIDATOR
        if (v) {
          v.clearFieldError(nameEl, gNameErr);
          v.clearFieldError(emailEl, gEmailErr);
          v.clearFieldError(phoneEl, gPhoneErr);

          let firstInvalid = null;
          const nameRes = v.validateName(name, true, 'Guest Name');
          if (!nameRes.valid) {
            v.setFieldError(nameEl, gNameErr, nameRes.message);
            if (!firstInvalid) firstInvalid = nameEl;
          }

          const emailRes = v.validateEmail(email, true);
          if (!emailRes.valid) {
            v.setFieldError(emailEl, gEmailErr, emailRes.message);
            if (!firstInvalid) firstInvalid = emailEl;
          }

          const phoneRes = v.validatePhone(phone, true, 'Contact phone number');
          if (!phoneRes.valid) {
            v.setFieldError(phoneEl, gPhoneErr, phoneRes.message);
            if (!firstInvalid) firstInvalid = phoneEl;
          }

          if (firstInvalid) {
            firstInvalid.focus();
            if (window.kfToast) {
              window.kfToast.error('Please resolve the errors highlighted before submitting.', 'Validation Error');
            }
            return;
          }
        } else {
          if (!name || name.length < 2) {
            window.kfToast.error('Please enter a valid guest name.', 'Name Required');
            return;
          }
          if (!email || !email.includes('@') || !email.includes('.')) {
            window.kfToast.error('Please enter a valid email address.', 'Invalid Email');
            return;
          }
          if (!phone || phone.length < 7) {
            window.kfToast.error('Please provide a valid contact phone number.', 'Phone Required');
            return;
          }
        }

        state.guestName = name;
        state.email = email;
        state.phone = phone;
        state.dietary = dietary;
        state.specialRequests = requests;

        // Save into storage
        const saved = window.KF_STATE.addReservation({
          partySize: state.partySize,
          tableType: state.tableType,
          date: state.date,
          time: state.time,
          guestName: state.guestName,
          email: state.email,
          phone: state.phone,
          dietary: state.dietary,
          specialRequests: state.specialRequests
        });

        state.bookingRef = saved.id;
        state.step = 5;
        window.kfToast.success(`Reservation #${saved.id} confirmed! Synced to guest dashboard.`, 'Reservation Secured');
        renderWizard();
      });
    }
  }

  // Helpers
  function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  function getTomorrowDateString() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  function getMaxDateString() {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  }

  // PDF Reservation Receipt Download Handler
  window.downloadReservationPdf = function(ref, dateStr, timeStr) {
    const guestName = state.guestName || "Valued Guest";
    const guestPhone = state.phone || "+1 (555) 382-7492";
    const guestEmail = state.email || "concierge@koreflame.com";
    const party = `${state.partySize || 2} Guests`;
    const table = state.tableType || "Standard Grill Booth";
    const dietary = state.dietary || "None specified";
    const requests = state.specialRequests || "None";
    const filename = `KoreFlame-Reservation-${ref}.pdf`;

    // 1. Primary: Rich Visual PDF via jsPDF library
    if (window.jspdf && window.jspdf.jsPDF) {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });

        // Extract Logo from DOM for PDF Embedding
        let logoDataUrl = null;
        try {
          const logoImg = document.querySelector('.brand-logo-img') || document.querySelector('img[src*="logo.png"]');
          if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
            const canvas = document.createElement("canvas");
            canvas.width = 160;
            canvas.height = 160;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(logoImg, 0, 0, 160, 160);
            logoDataUrl = canvas.toDataURL("image/png");
          }
        } catch (e) {
          console.warn("Logo extraction error:", e);
        }

        // Top Dark Amber Hearth Banner
        doc.setFillColor(18, 14, 10);
        doc.rect(0, 0, 210, 44, "F");

        // Gold decorative bar
        doc.setFillColor(245, 211, 108);
        doc.rect(0, 43, 210, 1.2, "F");

        // Logo Container Box / Emblem Badge
        doc.setFillColor(32, 24, 18);
        doc.roundedRect(16, 9, 24, 24, 4, 4, "F");
        doc.setDrawColor(245, 211, 108);
        doc.setLineWidth(0.5);
        doc.roundedRect(16, 9, 24, 24, 4, 4, "S");

        if (logoDataUrl) {
          doc.addImage(logoDataUrl, "PNG", 17, 10, 22, 22);
        } else {
          // Vector Flame Fallback
          doc.setFillColor(230, 57, 36);
          doc.circle(28, 21, 6, "F");
          doc.setFillColor(245, 211, 108);
          doc.circle(28, 22, 3, "F");
        }

        // Brand Title: "Kore" (white) + "Flame" (flame red) + " Korean BBQ" (gold)
        const textStartX = 46;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);

        // "Kore" in bright white
        doc.setTextColor(255, 255, 255);
        doc.text("Kore", textStartX, 19);
        const koreW = doc.getTextWidth ? doc.getTextWidth("Kore") : 14;

        // "Flame" in vibrant flame red
        doc.setTextColor(255, 90, 54);
        doc.text("Flame", textStartX + koreW, 19);
        const flameW = doc.getTextWidth ? doc.getTextWidth("Flame") : 17;

        // " Korean BBQ" in warm champagne gold
        doc.setFontSize(14);
        doc.setTextColor(245, 211, 108);
        doc.text(" Korean BBQ", textStartX + koreW + flameW, 19);

        // Subtitle: "PREMIUM SEOUL STREET-GRILL & BINCHOTAN HEARTH"
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(229, 191, 119); // Warm Gold
        doc.text("PREMIUM SEOUL STREET-GRILL & BINCHOTAN HEARTH", textStartX, 26);

        // Address & Contact
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(215, 200, 185);
        doc.text("128 Seoul Way, Suite 100 | Direct: +1 (555) 382-7492 | koreflame.com", textStartX, 33);

        // Confirmation Card Header
        doc.setFillColor(254, 249, 237); // Champagne Gold Tint
        doc.roundedRect(15, 50, 180, 22, 3, 3, "F");
        doc.setDrawColor(245, 211, 108);
        doc.setLineWidth(0.4);
        doc.roundedRect(15, 50, 180, 22, 3, 3, "S");

        doc.setTextColor(230, 57, 36); // Flame Red
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("OFFICIAL TABLE RESERVATION CONFIRMATION", 22, 60);

        doc.setTextColor(60, 45, 30);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Booking Reference: ", 22, 67);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(197, 155, 39);
        doc.text(String(ref), 62, 67);

        // Reservation Details Table Card
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(15, 78, 180, 112, 3, 3, "F");
        doc.setDrawColor(230, 220, 205);
        doc.setLineWidth(0.3);
        doc.roundedRect(15, 78, 180, 112, 3, 3, "S");

        const rows = [
          ["Guest Name", guestName],
          ["Party Size", party],
          ["Table Ambience", table],
          ["Dining Date", dateStr],
          ["Seating Time", timeStr],
          ["Contact Phone", guestPhone],
          ["Contact Email", guestEmail],
          ["Dietary Notes", dietary],
          ["Special Requests", requests]
        ];

        let y = 90;
        rows.forEach(([label, value], idx) => {
          if (idx % 2 === 0) {
            doc.setFillColor(250, 246, 238);
            doc.rect(16, y - 6, 178, 9.5, "F");
          }
          doc.setTextColor(110, 95, 80);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.text(label, 22, y);

          doc.setTextColor(25, 20, 15);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          const safeVal = String(value).length > 52 ? String(value).substring(0, 50) + "..." : String(value);
          doc.text(safeVal, 75, y);
          y += 11;
        });

        // Arrival Notice Box
        doc.setFillColor(255, 245, 235);
        doc.roundedRect(15, 197, 180, 26, 3, 3, "F");
        doc.setDrawColor(255, 118, 40);
        doc.setLineWidth(0.4);
        doc.roundedRect(15, 197, 180, 26, 3, 3, "S");

        doc.setTextColor(230, 57, 36);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text("RESTAURANT SEATING & ARRIVAL POLICY", 22, 206);

        doc.setTextColor(80, 60, 45);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text("Tables are held for 15 minutes past your scheduled reservation time.", 22, 213);
        doc.text("Please show this PDF confirmation or booking reference number upon arrival.", 22, 218);

        // Security / Footer Notice
        doc.setTextColor(150, 140, 130);
        doc.setFontSize(8);
        doc.text(`Official Reservation Document | KoreFlame BBQ Restaurant | Generated ${new Date().toLocaleDateString()}`, 20, 275);
        doc.text("For amendments or cancellations, please contact our concierge at (555) 382-7492 at least 24 hours in advance.", 20, 280);

        doc.save(filename);
        if (window.kfToast && typeof window.kfToast.success === "function") {
          window.kfToast.success(`Reservation PDF (${filename}) downloaded successfully!`, "PDF Downloaded");
        }
        return;
      } catch (err) {
        console.warn("jsPDF error, falling back to direct PDF stream:", err);
      }
    }

    // 2. Guaranteed Zero-Dependency Fallback: Raw PDF 1.4 binary stream
    try {
      const clean = str => String(str).replace(/[()\\]/g, "");
      const content = [
        "BT",
        "/F1 18 Tf",
        "40 765 Td",
        "(KoreFlame Korean BBQ) Tj",
        "/F1 9 Tf",
        "0 -16 Td",
        "(PREMIUM SEOUL STREET-GRILL & BINCHOTAN HEARTH) Tj",
        "0 -14 Td",
        "(128 Seoul Way, Suite 100 | Direct: +1 555-382-7492 | koreflame.com) Tj",
        "/F1 13 Tf",
        "0 -30 Td",
        "(OFFICIAL TABLE RESERVATION CONFIRMATION) Tj",
        "/F1 10 Tf",
        "0 -18 Td",
        "-------------------------------------------------------------------------------------------------- Tj",
        "0 -22 Td",
        `(/Booking Reference: ${clean(ref)}) Tj`,
        "0 -18 Td",
        `(/Guest Name: ${clean(guestName)}) Tj`,
        "0 -18 Td",
        `(/Party Size: ${clean(party)}) Tj`,
        "0 -18 Td",
        `(/Table Ambience: ${clean(table)}) Tj`,
        "0 -18 Td",
        `(/Dining Date: ${clean(dateStr)}) Tj`,
        "0 -18 Td",
        `(/Seating Time: ${clean(timeStr)}) Tj`,
        "0 -18 Td",
        `(/Contact Phone: ${clean(guestPhone)}) Tj`,
        "0 -18 Td",
        `(/Contact Email: ${clean(guestEmail)}) Tj`,
        "0 -18 Td",
        `(/Dietary Notes: ${clean(dietary)}) Tj`,
        "0 -25 Td",
        "-------------------------------------------------------------------------------------------------- Tj",
        "0 -20 Td",
        "(LOCATION: 128 Seoul Way, Suite 100, Koreatown | HOTLINE: +1 555-382-7492) Tj",
        "0 -16 Td",
        "(HOURS: Mon-Thu 5:00PM - 10:30PM | Fri-Sun 4:30PM - 11:30PM) Tj",
        "0 -22 Td",
        "(Tables are held for 15 minutes. Please present this PDF confirmation upon arrival.) Tj",
        "ET"
      ].join("\n");

      const streamLength = new TextEncoder().encode(content).length;
      const pdfSource = [
        "%PDF-1.4",
        "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
        "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
        "3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >> endobj",
        "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj",
        `5 0 obj << /Length ${streamLength} >> stream\n${content}\nendstream endobj`,
        "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000224 00000 n \n0000000305 00000 n \ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n500\n%%EOF"
      ].join("\n");

      const blob = new Blob([pdfSource], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      if (window.kfToast && typeof window.kfToast.success === "function") {
        window.kfToast.success(`Reservation PDF (${filename}) downloaded successfully!`, "PDF Downloaded");
      }
    } catch (e) {
      console.error("PDF generation error:", e);
      window.print();
    }
  };

  // Add-to-calendar handler
  window.downloadCalendarFile = function(ref, dateStr, timeStr) {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//KoreFlame BBQ//EN",
      "BEGIN:VEVENT",
      `SUMMARY:KoreFlame Korean BBQ Dinner (${ref})`,
      `DESCRIPTION:Reservation for ${state.partySize} at KoreFlame. Table: ${state.tableType}`,
      `LOCATION:KoreFlame Grill, 128 Seoul Way, Suite 100`,
      `DTSTART:${dateStr.replace(/-/g, '')}T${timeStr.replace(/:/g, '')}00`,
      `DTEND:${dateStr.replace(/-/g, '')}T${parseInt(timeStr.slice(0, 2)) + 2}${timeStr.slice(3, 5)}00`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `KoreFlame-${ref}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.kfToast.info("Calendar (.ics) invite downloaded.", "Calendar Synced");
  };
}
