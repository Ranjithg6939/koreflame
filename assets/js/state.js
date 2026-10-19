/**
 * KoreFlame - State & LocalStorage Manager
 * Handles mock session auth, cart, favorites, reservations, and theme persistence.
 */

const KF_STORAGE_KEYS = {
  AUTH: 'kf_auth_session',
  CART: 'kf_cart_items',
  FAVORITES: 'kf_favorites',
  RESERVATIONS: 'kf_reservations',
  THEME: 'kf_theme_mode',
  RTL: 'kf_direction_mode'
};

const KF_STATE = {
  // 1. Initial Default Demo Auth
  defaultUser: {
    isLoggedIn: false,
    name: "Min-Ji Kim",
    email: "guest@koreflame.com",
    phone: "+1 (555) 382-7492",
    tier: "Gold Grillmaster",
    points: 1240,
    role: "guest",
    joinedDate: "January 2026"
  },

  // Initial Demo Reservations
  defaultReservations: [
    {
      id: "KF-84291",
      partySize: 4,
      tableType: "Smokeless Downdraft Table",
      date: "2026-10-24",
      time: "19:00",
      status: "Confirmed",
      guestName: "Min-Ji Kim",
      email: "guest@koreflame.com",
      phone: "+1 (555) 382-7492",
      dietary: "No shellfish allergies in party",
      specialRequests: "Anniversary celebration table"
    },
    {
      id: "KF-79102",
      partySize: 2,
      tableType: "Standard Grill Booth",
      date: "2026-09-15",
      time: "18:30",
      status: "Completed",
      guestName: "Min-Ji Kim",
      email: "guest@koreflame.com",
      phone: "+1 (555) 382-7492",
      dietary: "None",
      specialRequests: "Window seat preferred"
    }
  ],

  // ------------------------------------------------------------------------
  // Auth Management
  // ------------------------------------------------------------------------
  getUser() {
    try {
      const stored = localStorage.getItem(KF_STORAGE_KEYS.AUTH);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Storage access failed, using default user", e);
    }
    return { ...this.defaultUser };
  },

  setUser(userData) {
    try {
      localStorage.setItem(KF_STORAGE_KEYS.AUTH, JSON.stringify(userData));
      window.dispatchEvent(new CustomEvent('kf:auth-changed', { detail: userData }));
    } catch (e) {
      console.error("Failed to save auth state", e);
    }
  },

  loginDemoGuest() {
    const user = {
      ...this.defaultUser,
      isLoggedIn: true
    };
    this.setUser(user);
    return user;
  },

  loginAdminDemo() {
    const admin = {
      isLoggedIn: true,
      name: "Executive Chef Kang",
      email: "admin@koreflame.com",
      phone: "+1 (555) 890-1122",
      tier: "Executive Staff",
      points: 9999,
      role: "admin",
      joinedDate: "Founding 2024"
    };
    this.setUser(admin);
    return admin;
  },

  logout() {
    const loggedOut = { ...this.defaultUser, isLoggedIn: false };
    this.setUser(loggedOut);
    return loggedOut;
  },

  // ------------------------------------------------------------------------
  // Cart Management
  // ------------------------------------------------------------------------
  getCart() {
    try {
      const stored = localStorage.getItem(KF_STORAGE_KEYS.CART);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  saveCart(items) {
    localStorage.setItem(KF_STORAGE_KEYS.CART, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('kf:cart-changed', { detail: items }));
  },

  addToCart(item, qty = 1) {
    const cart = this.getCart();
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: item.id,
        nameEn: item.nameEn,
        nameKr: item.nameKr || '',
        price: item.price,
        image: item.image,
        qty: qty
      });
    }
    this.saveCart(cart);
  },

  updateCartQty(itemId, newQty) {
    let cart = this.getCart();
    if (newQty <= 0) {
      cart = cart.filter(i => i.id !== itemId);
    } else {
      const target = cart.find(i => i.id === itemId);
      if (target) target.qty = newQty;
    }
    this.saveCart(cart);
  },

  clearCart() {
    this.saveCart([]);
  },

  // ------------------------------------------------------------------------
  // Favorites Management
  // ------------------------------------------------------------------------
  getFavorites() {
    try {
      const stored = localStorage.getItem(KF_STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : ["item-101", "item-201"];
    } catch (e) {
      return ["item-101", "item-201"];
    }
  },

  toggleFavorite(itemId) {
    let favs = this.getFavorites();
    const isFav = favs.includes(itemId);
    if (isFav) {
      favs = favs.filter(id => id !== itemId);
    } else {
      favs.push(itemId);
    }
    localStorage.setItem(KF_STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    window.dispatchEvent(new CustomEvent('kf:favorites-changed', { detail: favs }));
    return !isFav;
  },

  // ------------------------------------------------------------------------
  // Reservations Management
  // ------------------------------------------------------------------------
  getReservations() {
    try {
      const stored = localStorage.getItem(KF_STORAGE_KEYS.RESERVATIONS);
      return stored ? JSON.parse(stored) : [...this.defaultReservations];
    } catch (e) {
      return [...this.defaultReservations];
    }
  },

  saveReservations(list) {
    localStorage.setItem(KF_STORAGE_KEYS.RESERVATIONS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('kf:reservations-changed', { detail: list }));
  },

  addReservation(resData) {
    const list = this.getReservations();
    const newRes = {
      id: "KF-" + Math.floor(10000 + Math.random() * 90000),
      status: "Confirmed",
      createdAt: new Date().toISOString(),
      ...resData
    };
    list.unshift(newRes);
    this.saveReservations(list);

    // Reward points for booking (150 bonus points)
    const user = this.getUser();
    if (user.isLoggedIn) {
      user.points = (user.points || 0) + 150;
      this.setUser(user);
    }
    return newRes;
  },

  cancelReservation(id) {
    const list = this.getReservations();
    const item = list.find(r => r.id === id);
    if (item) {
      item.status = "Cancelled";
      this.saveReservations(list);
      return true;
    }
    return false;
  },

  // ------------------------------------------------------------------------
  // Theme & RTL
  // ------------------------------------------------------------------------
  getTheme() {
    return localStorage.getItem(KF_STORAGE_KEYS.THEME) || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(KF_STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
    window.dispatchEvent(new CustomEvent('kf:theme-changed', { detail: theme }));
  },

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  },

  getRTL() {
    return localStorage.getItem(KF_STORAGE_KEYS.RTL) || 'ltr';
  },

  setRTL(dir) {
    localStorage.setItem(KF_STORAGE_KEYS.RTL, dir);
    document.documentElement.setAttribute('dir', dir);
  },

  toggleRTL() {
    const current = this.getRTL();
    const next = current === 'ltr' ? 'rtl' : 'ltr';
    this.setRTL(next);
    return next;
  }
};

// Initialize Theme & Dir immediately
(function initKoreFlamePreferences() {
  const theme = KF_STATE.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  const rtl = KF_STATE.getRTL();
  document.documentElement.setAttribute('dir', rtl);
})();

window.KF_STATE = KF_STATE;
