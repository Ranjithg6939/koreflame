/**
 * KoreFlame - State & LocalStorage Manager
 * Handles mock session auth, cart, favorites, reservations, and theme persistence.
 */

const KF_STORAGE_KEYS = {
  AUTH: 'kf_auth_session',
  USERS: 'kf_registered_users',
  CART: 'kf_cart_items',
  ORDERS: 'kf_orders',
  FAVORITES: 'kf_favorites',
  RESERVATIONS: 'kf_reservations',
  THEME: 'kf_theme_mode',
  RTL: 'kf_direction_mode'
};

const KF_STATE = {
  // 1. Initial Default Demo Auth (Single Source of Truth Base)
  defaultUser: {
    isLoggedIn: false,
    name: "",
    email: "",
    phone: "",
    tier: "Member",
    points: 0,
    role: "guest",
    joinedDate: ""
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
  // Auth Management - Single Source of Truth
  // ------------------------------------------------------------------------
  getUser() {
    try {
      const stored = localStorage.getItem(KF_STORAGE_KEYS.AUTH);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            ...this.defaultUser,
            ...parsed
          };
        }
      }
    } catch (e) {
      console.warn("Storage access failed, using default user", e);
    }
    return { ...this.defaultUser };
  },

  setUser(userData) {
    try {
      localStorage.setItem(KF_STORAGE_KEYS.AUTH, JSON.stringify(userData));
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('kf:auth-changed', { detail: userData }));
      }
    } catch (e) {
      console.error("Failed to save auth state", e);
    }
  },

  async syncServerSession() {
    try {
      const current = this.getUser();
      const headers = {};
      if (current && current.token) {
        headers['Authorization'] = `Bearer ${current.token}`;
      }
      const res = await fetch('/api/auth/me', { credentials: 'include', headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.authenticated && data.user) {
          const userObj = {
            ...current,
            ...data.user,
            token: current?.token || data.user.token || data.token || '',
            isLoggedIn: true
          };
          this.setUser(userObj);
          return userObj;
        }
      } else if (res.status === 401) {
        // Genuinely expired session on server
        if (current && current.isLoggedIn && !current._offlineMode) {
          console.info('[Auth] Server confirmed session expired or invalid.');
          this.setUser({ ...this.defaultUser });
        }
      }
      // If 404 (endpoint not mounted on dev port) or network failure, preserve existing state
    } catch (e) {
      console.warn('[Auth Sync] Network check failed, preserving local session state.');
    }
    return this.getUser();
  },

  // Registered Accounts Directory (Prevents Name Mismatches & Cross-Contamination)
  getRegisteredUsers() {
    try {
      const stored = localStorage.getItem(KF_STORAGE_KEYS.USERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Storage access failed for users", e);
    }
    return [
      {
        name: "Min-Ji Kim",
        email: "guest@koreflame.com",
        phone: "+1 (555) 382-7492",
        password: "Guest@KoreFlame2026!",
        tier: "Gold Grillmaster",
        points: 1240,
        role: "guest",
        joinedDate: "January 2026",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
      },
      {
        name: "Executive Chef Kang",
        email: "admin@koreflame.com",
        phone: "+1 (555) 890-1122",
        password: "Admin@KoreFlame2026!",
        tier: "Executive Staff",
        points: 9999,
        role: "admin",
        joinedDate: "Founding 2024",
        avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=400&auto=format&fit=crop"
      }
    ];
  },

  saveUserAccount(userRecord) {
    if (!userRecord || !userRecord.name) return;
    try {
      const users = this.getRegisteredUsers();
      const emailKey = (userRecord.email || '').toLowerCase().trim();
      const nameKey = (userRecord.name || '').toLowerCase().trim();

      const idx = users.findIndex(u => 
        (emailKey && (u.email || '').toLowerCase().trim() === emailKey) ||
        (nameKey && (u.name || '').toLowerCase().trim() === nameKey)
      );

      if (idx >= 0) {
        users[idx] = { ...users[idx], ...userRecord };
      } else {
        users.push({ ...userRecord });
      }
      localStorage.setItem(KF_STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save user account", e);
    }
  },

  findUser(identifier) {
    if (!identifier) return null;
    const clean = identifier.toLowerCase().trim();
    const users = this.getRegisteredUsers();
    return users.find(u => 
      (u.email && u.email.toLowerCase().trim() === clean) ||
      (u.name && u.name.toLowerCase().trim() === clean)
    );
  },

  // Authenticate user: strictly enforces account existence AND password verification.
  // NEVER creates an account on login and NEVER accepts unchecked passwords.
  verifyCredentials(identifier, password) {
    const trimmed = (identifier || '').trim();
    if (!trimmed) {
      return { success: false, error: 'MISSING_EMAIL', message: 'Email address is required.' };
    }
    if (!password) {
      return { success: false, error: 'MISSING_PASSWORD', message: 'Password is required.' };
    }

    const clean = trimmed.toLowerCase();
    const userRecord = this.findUser(clean);

    // 1. REJECT if account does not exist. Never auto-create on login!
    if (!userRecord) {
      return {
        success: false,
        error: 'ACCOUNT_NOT_FOUND',
        message: 'No account found with this email. Please create an account first.'
      };
    }

    // 2. REJECT if password does not match registered account password
    const expectedPassword = userRecord.password || userRecord.passwordHash;
    if (!expectedPassword || password !== expectedPassword) {
      return {
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email address or password. Please try again.'
      };
    }

    // 3. Establish session with verified credentials
    const activeSession = {
      name: userRecord.name,
      email: userRecord.email,
      phone: userRecord.phone || '+1 (555) 000-0000',
      tier: userRecord.tier || 'Bronze Member',
      points: userRecord.points !== undefined ? userRecord.points : 200,
      role: userRecord.role || 'guest',
      joinedDate: userRecord.joinedDate || 'Today',
      avatar: userRecord.avatar || null,
      isLoggedIn: true
    };

    this.setUser(activeSession);
    return {
      success: true,
      user: activeSession
    };
  },

  async logout() {
    try {
      const current = this.getUser();
      const headers = {};
      if (current && current.token) {
        headers['Authorization'] = `Bearer ${current.token}`;
      }
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', headers });
    } catch (e) {}
    localStorage.removeItem(KF_STORAGE_KEYS.AUTH);
    const loggedOut = {
      ...this.defaultUser
    };
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
    const user = this.getUser();
    if (!user || !user.isLoggedIn) {
      return false;
    }
    const safeQty = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
    const cart = this.getCart();
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.qty = Math.min(99, existing.qty + safeQty);
    } else {
      cart.push({
        id: item.id,
        nameEn: item.nameEn,
        nameKr: item.nameKr || '',
        price: Number(item.price) || 0,
        image: item.image,
        qty: safeQty
      });
    }
    this.saveCart(cart);
    return true;
  },

  updateCartQty(itemId, newQty) {
    let cart = this.getCart();
    const safeQty = Math.max(0, Math.min(99, parseInt(newQty, 10) || 0));
    if (safeQty <= 0) {
      cart = cart.filter(i => i.id !== itemId);
    } else {
      const target = cart.find(i => i.id === itemId);
      if (target) target.qty = safeQty;
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
  // Orders Management (Cart-to-Order Pipeline)
  // ------------------------------------------------------------------------
  defaultOrders: [
    {
      id: "ORD-942815",
      status: "Completed",
      createdAt: "2026-10-18T19:30:00.000Z",
      tableNumber: "Table 04",
      diningOption: "Table Grill Dine-In",
      items: [
        { id: "item-101", nameEn: "USDA Prime Marinated Galbi", nameKr: "양념 소갈비", price: 42.00, qty: 2, image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop" },
        { id: "item-201", nameEn: "Aged Kimchi Jjigae", nameKr: "숙성 묵은지 김치찌개", price: 18.00, qty: 1, image: "https://images.unsplash.com/photo-1583032015879-679c23f2f81a?q=80&w=600&auto=format&fit=crop" }
      ],
      subtotal: 102.00,
      tax: 8.42,
      total: 110.42,
      notes: "Medium-rare Wagyu cuts preferred"
    }
  ],

  getOrders() {
    try {
      const stored = localStorage.getItem(KF_STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : [...this.defaultOrders];
    } catch (e) {
      return [...this.defaultOrders];
    }
  },

  saveOrders(list) {
    localStorage.setItem(KF_STORAGE_KEYS.ORDERS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('kf:orders-changed', { detail: list }));
  },

  addOrder(orderData) {
    const list = this.getOrders();
    const newOrder = {
      id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      status: "Sent to Grill",
      createdAt: new Date().toISOString(),
      ...orderData
    };
    list.unshift(newOrder);
    this.saveOrders(list);

    // Reward points for ordering (1 point per dollar)
    const user = this.getUser();
    if (user.isLoggedIn) {
      const ptsEarned = Math.round(Number(newOrder.total) || 0);
      user.points = (user.points || 0) + ptsEarned;
      this.setUser(user);
    }
    return newOrder;
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
  },

  // ------------------------------------------------------------------------
  // Security & Sanitization
  // ------------------------------------------------------------------------
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
window.escapeHtml = KF_STATE.escapeHtml;
