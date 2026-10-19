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
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h5 class="mb-0">Standard Grill Booth</h5>
                  <i data-lucide="armchair" class="text-flame"></i>
                </div>
                <p class="text-secondary small mb-2">Cozy leather-backed circular booths with overhead industrial ventilation hoods. Classic Seoul nightlife feel.</p>
                <span class="badge-tag badge-popular">High Energy</span>
              </div>
            </div>

            <div class="col-md-4">
              <div class="table-type-card ${state.tableType === 'Smokeless Downdraft Table' ? 'active' : ''}" data-type="Smokeless Downdraft Table">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h5 class="mb-0">Smokeless Downdraft</h5>
                  <i data-lucide="wind" class="text-gold"></i>
                </div>
                <p class="text-secondary small mb-2">Advanced subterranean suction traps 99% of smoke at grill level. Keeps your attire pristine.</p>
                <span class="badge-tag badge-prime">Recommended</span>
              </div>
            </div>

            <div class="col-md-4">
              <div class="table-type-card ${state.tableType === 'Private Dining Room (VIP)' ? 'active' : ''}" data-type="Private Dining Room (VIP)">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h5 class="mb-0">Private VIP Room</h5>
                  <i data-lucide="crown" class="text-gold"></i>
                </div>
                <p class="text-secondary small mb-2">Exclusive sliding acoustic doors, dedicated sommelier & grillmaster, customized soundscapes.</p>
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
              <input type="date" class="form-control-custom" id="wizard-date" min="${getTodayDateString()}" value="${state.date}">
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
      case 4:
        return `
          <div class="text-center mb-4">
            <h4>Primary Guest Contact & Special Notes</h4>
            <p class="text-muted">We use these details to secure your grill table and confirm seating.</p>
          </div>

          <form id="wizard-guest-form" class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label-custom">Full Name *</label>
              <input type="text" class="form-control-custom" id="guest-name" value="${state.guestName}" placeholder="e.g. Min-Ji Kim" required>
            </div>
            <div class="col-md-6">
              <label class="form-label-custom">Email Address *</label>
              <input type="email" class="form-control-custom" id="guest-email" value="${state.email}" placeholder="guest@koreflame.com" required>
            </div>
            <div class="col-md-6">
              <label class="form-label-custom">Mobile Phone Number *</label>
              <input type="tel" class="form-control-custom" id="guest-phone" value="${state.phone}" placeholder="+1 (555) 382-7492" required>
            </div>
            <div class="col-md-6">
              <label class="form-label-custom">Dietary Restrictions or Allergies</label>
              <input type="text" class="form-control-custom" id="guest-dietary" value="${state.dietary}" placeholder="e.g. Shellfish allergy, Halal beef only">
            </div>
            <div class="col-12">
              <label class="form-label-custom">Celebration & Special Requests</label>
              <textarea class="form-control-custom" id="guest-requests" rows="2" placeholder="e.g. Anniversary dinner, quiet corner booth">${state.specialRequests}</textarea>
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

      // Step 5: Confirmation & Add to Calendar (Honest Demo Prototype)
      case 5:
        return `
          <div class="text-center py-4">
            <div class="d-inline-flex p-3 rounded-circle bg-success bg-opacity-20 text-success mb-3">
              <i data-lucide="check-circle-2" style="width: 48px; height: 48px;"></i>
            </div>
            <h3 class="text-flame mb-1">Reservation Request Recorded!</h3>
            <p class="text-muted">Simulated booking reference: <strong class="text-gold font-monospace fs-5">${state.bookingRef}</strong></p>

            <div class="p-2 px-3 bg-secondary-app border border-subtle rounded max-w-lg mx-auto small text-muted mb-4" style="max-width: 580px;">
              <i data-lucide="info" class="text-flame me-1" style="width: 14px; height: 14px;"></i>
              <strong>Frontend Prototype Notice:</strong> KoreFlame is demonstrating table reservation UX. In a live production deployment, this submits to a table management API (e.g., OpenTable, SevenRooms, or Resy) for live table lock and automated SMS confirmation.
            </div>

            <div class="kf-card text-start max-w-lg mx-auto p-4 mb-4" style="max-width: 580px; margin-inline: auto;">
              <h5 class="border-bottom border-subtle pb-2 mb-3 text-gold">Reservation Details</h5>
              <div class="row g-2 mb-2">
                <div class="col-6 text-muted">Guest Name:</div>
                <div class="col-6 text-end font-weight-bold">${state.guestName}</div>
                <div class="col-6 text-muted">Party Size:</div>
                <div class="col-6 text-end font-weight-bold">${state.partySize} Guests</div>
                <div class="col-6 text-muted">Table Ambience:</div>
                <div class="col-6 text-end font-weight-bold">${state.tableType}</div>
                <div class="col-6 text-muted">Date & Time:</div>
                <div class="col-6 text-end font-weight-bold text-flame">${state.date} at ${state.time}</div>
                ${state.dietary ? `
                  <div class="col-6 text-muted">Dietary Notes:</div>
                  <div class="col-6 text-end">${state.dietary}</div>
                ` : ''}
              </div>
              <div class="alert alert-dark bg-secondary-app border-0 small text-muted mb-0 mt-3">
                <i data-lucide="bell" style="width: 14px; height: 14px;"></i>
                Tables are held for 15 minutes past the scheduled seating time.
              </div>
            </div>

            <div class="d-flex flex-wrap justify-content-center gap-3">
              <button type="button" class="btn-flame" onclick="downloadCalendarFile('${state.bookingRef}', '${state.date}', '${state.time}')">
                <i data-lucide="calendar-plus" style="width: 18px; height: 18px;"></i>
                <span>Download .ics Calendar File</span>
              </button>
              <a href="dashboard.html" class="btn-flame-outline">
                <i data-lucide="layout-dashboard" style="width: 18px; height: 18px;"></i>
                <span>View in Guest Dashboard</span>
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

    // Submit booking button
    const submitBtn = wizardContainer.querySelector('#btn-submit-booking');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const name = wizardContainer.querySelector('#guest-name').value.trim();
        const email = wizardContainer.querySelector('#guest-email').value.trim();
        const phone = wizardContainer.querySelector('#guest-phone').value.trim();
        const dietary = wizardContainer.querySelector('#guest-dietary').value.trim();
        const requests = wizardContainer.querySelector('#guest-requests').value.trim();

        // Validation
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
