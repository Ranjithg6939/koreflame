# KoreFlame — Korean BBQ Restaurant & Guest Dashboard Template

**KoreFlame** is a premium, modern, fully functional Korean BBQ restaurant and guest dining dashboard template built with semantic **HTML5**, **CSS3**, and **vanilla JavaScript** (no React, Next.js, or JSX). It is designed to meet ThemeForest, TemplateMonster, and high-end restaurant client deployment standards.

---

## 🌟 Key Features

1. **Brand Identity & Design System**
   - **Korean BBQ Antique Gold & Warm Parchment Aesthetic:** Inspired by traditional Korean charcoal restaurant menus. Warm antique gold (`#C59B51`, `#D4A253`), Korean seal red (`#A82216`), champagne gold (`#E5BF77`), warm roasted charcoal hearth (`#141311`), and warm ivory parchment (`#FAF6EF`, `#F2E6D2`).
   - **Light & Dark Theme Switcher:** Fully reactive CSS custom property variables with `localStorage` persistence. Light theme perfectly recreates the authentic warm parchment menu flyer, while Dark theme provides a luxury roasted charcoal dining ambiance.
   - **Right-to-Left (RTL) Support:** Native RTL toggle with CSS logical properties and `dir="rtl"` support.
   - **Typography:** Modern Plus Jakarta Sans and Noto Sans KR.

2. **Dual Homepages**
   - **Home Page 1 (`index.html`):** The Art of the Korean Table Grill with an **Interactive Grill-Your-Own Simulator** (Galbi, Samgyeopsal, Wagyu Ribeye, Bulgogi, Chicken Bulgogi) featuring real-time cook times, heat guidance, sauce pairings, banchan tips, and food-safety advisories.
   - **Home Page 2 (`index-2.html`):** Korean BBQ Celebration Experience emphasizing group dining, birthdays, milestone celebrations, and soundproof VIP private dining suites.

3. **Master Interactive Menu (`menu.html`)**
   - Filterable categories: Prime Beef, Pork, Chicken, Banchan & Sides, Stews & Noodles, Vegetarian, Drinks.
   - Real-time text search, spice indicators (🌶️), verified dietary tags, session-persisted favorites (❤️), and slideover table cart drawer.

4. **5-Step Reservation Engine (`reservations.html`)**
   - **Step 1:** Party Size (1 to 10+ with VIP alcove handling).
   - **Step 2:** Table Preference (Standard Booth, Smokeless Downdraft Table, VIP Suite).
   - **Step 3:** Date Picker (past dates disabled) and real-time lunch & dinner slot availability.
   - **Step 4:** Guest Details & Allergy validation.
   - **Step 5:** Unique reference generator (`KF-XXXXX`), instant dashboard sync, and Apple/Google Calendar (`.ics`) download.

5. **Guest Dining Dashboard (`dashboard.html`)**
   - Dedicated dashboard layout with an independent sidebar (no marketing navbar).
   - **Overview:** Welcome banner, loyalty tier, points balance, and upcoming reservation card.
   - **Reservations:** Active holds, booking history, modify/cancel actions with confirmation modals.
   - **Loyalty Rewards:** Live points balance, tier progress bar, redeemable dish vouchers with points deduction.
   - **Saved Favorites:** Directly reorder or remove bookmarked cuts.
   - **Profile:** Form validation and persistent contact preferences.

6. **Executive Kitchen & Admin Console (`admin/index.html`)**
   - Floor utilization heatmap, shift revenue metrics, reservation status controls (Confirm, Seat, Cancel), and active mobile orders expediter.

7. **Accessible Toast Notification System (`assets/js/toast.js`)**
   - WCAG compliant with `role="status"`, `role="alert"`, and `aria-live`. Contextual alerts for bookings, cart updates, loyalty claims, and theme switches.

---

## 📁 File Structure

```text
d:\KoreFlame\
  ├── assets/
  │   ├── css/
  │   │   ├── style.css           # Design tokens, variables, component styling, RTL rules
  │   │   ├── responsive.css      # Viewport media queries (320px - 1440px+)
  │   │   └── dashboard.css       # Guest & Admin dashboard layouts
  │   ├── js/
  │   │   ├── data.js             # Menu items, cuts, dining sets, blog posts, loyalty vouchers
  │   │   ├── state.js            # Storage abstraction (Auth, Cart, Favorites, Bookings, Theme)
  │   │   ├── toast.js            # Accessible toast notification engine
  │   │   ├── main.js             # Header scroll, mobile drawer, cart drawer, auth sync
  │   │   ├── grill-sim.js        # Interactive Home 1 grill simulator
  │   │   ├── menu.js             # Menu filters, search, favorites, cart actions
  │   │   ├── reservations.js     # 5-step booking wizard & calendar exporter
  │   │   ├── dashboard.js        # Guest dashboard tab navigation & actions
  │   │   ├── admin.js            # Admin dashboard metrics and table workflows
  │   │   └── auth.js             # Login/Register validation & demo logins
  │   └── images/                 # Image assets
  ├── index.html                  # Home 1 — The Grill Experience
  ├── index-2.html                # Home 2 — Celebration & Group Dining
  ├── about.html                  # Restaurant heritage, chef bio, and pillars
  ├── menu.html                   # Filterable interactive menu
  ├── reservations.html           # 5-step reservation engine
  ├── dashboard.html              # Dedicated guest dining dashboard
  ├── services.html               # Hospitality services overview
  ├── service-details.html        # VIP private dining deep dive with FAQs
  ├── pricing.html                # Dining packages & comparison matrix
  ├── blog.html                   # Korean BBQ culture journal
  ├── blog-details.html           # Single blog article & community comments
  ├── contact.html                # Contact info, map card, and validated form
  ├── login.html                  # Guest login with 1-click demo access
  ├── register.html               # Guest registration with welcome points
  ├── 404.html                    # Standalone 404 error page (no nav/footer)
  ├── coming-soon.html            # Dedicated layout with live countdown timer
  ├── maintenance.html            # Dedicated layout with maintenance advisory
  ├── admin/
  │   └── index.html              # Admin management portal
  └── README.md                   # Documentation & setup instructions
```

---

## 🚀 Local Installation & Running Instructions

KoreFlame is built with vanilla web technologies and runs in any modern browser without build steps, compilers, or server dependencies.

### Option 1: Double-Click
Simply double-click `index.html` to open it directly in Chrome, Edge, Safari, or Firefox.

### Option 2: Local Static Server (Recommended)
Running through a local static server ensures all browser storage, module paths, and assets load smoothly.

**Using Python (Pre-installed on most systems):**
```bash
# In the project directory:
python -m http.server 8000
# Then visit: http://localhost:8000
```

**Using Node / npx:**
```bash
npx serve .
```

**Using VS Code Live Server:**
Right-click `index.html` and click **"Open with Live Server"**.

---

## ⚡ Demo Credentials & Architecture Disclosure

- **Demo Guest Account:**
  - Email: `guest@koreflame.com`
  - Password: `demo1234`
  - Or click the **"Demo Guest"** button on `login.html`.
- **Demo Admin Portal:**
  - Available at `admin/index.html` or via the **"Demo Admin"** shortcut on `login.html`.
- **Backend Disclosure:**
  - This frontend template demonstrates complete user flows using browser `localStorage`. Real payment processing, persistent production authentication, and live POS integration require connection to a server-side backend (e.g. Node.js, Python, or PHP).
