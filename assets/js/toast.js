/**
 * KoreFlame - Professional Accessible Toast Notification System
 * WCAG-compliant toast engine with role='status' / role='alert', queue protection, and dismiss actions.
 */

class KoreFlameToast {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    let container = document.getElementById('kf-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'kf-toast-container';
      container.className = 'toast-container-custom';
      document.body.appendChild(container);
    }
    this.container = container;
  }

  /**
   * Show Toast Notification
   * @param {string} message - Message text
   * @param {string} type - 'success' | 'error' | 'warning' | 'info' | 'loading'
   * @param {string} title - Optional title
   * @param {number} duration - Auto dismiss in ms (default 3200)
   * @param {object|null} action - Optional action button { text: string, href?: string, onClick?: function }
   */
  show(message, type = 'info', title = null, duration = 3200, action = null) {
    if (!this.container) this.initContainer();

    // Prevent duplicate spam
    const existing = Array.from(this.container.querySelectorAll('.toast-message'));
    const isDup = existing.some(el => el.textContent.trim() === message.trim());
    if (isDup) return;

    // Default Titles
    const titles = {
      success: title || 'Success',
      error: title || 'Attention Required',
      warning: title || 'Notice',
      info: title || 'Information',
      loading: title || 'Processing...'
    };

    // Lucide Icon mapping
    const icons = {
      success: '<i data-lucide="check-circle"></i>',
      error: '<i data-lucide="alert-octagon"></i>',
      warning: '<i data-lucide="alert-triangle"></i>',
      info: '<i data-lucide="info"></i>',
      loading: '<i data-lucide="loader-2" class="animate-spin"></i>'
    };

    const isUrgent = type === 'error';
    const toast = document.createElement('div');
    toast.className = `kf-toast toast-${type}`;
    toast.setAttribute('role', isUrgent ? 'alert' : 'status');
    toast.setAttribute('aria-live', isUrgent ? 'assertive' : 'polite');

    let actionMarkup = '';
    if (action && action.text) {
      if (action.href) {
        actionMarkup = `<div class="mt-2"><a href="${action.href}" class="btn-flame btn-sm-custom d-inline-flex align-items-center gap-1.5 py-1 px-3 text-decoration-none" style="font-size: 0.8rem;"><span>${action.text}</span> <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i></a></div>`;
      } else {
        actionMarkup = `<div class="mt-2"><button type="button" class="btn-flame btn-sm-custom toast-action-btn py-1 px-3" style="font-size: 0.8rem;"><span>${action.text}</span></button></div>`;
      }
    }

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${titles[type]}</div>
        <p class="toast-message mb-0">${message}</p>
        ${actionMarkup}
      </div>
      <button type="button" class="toast-close-btn" aria-label="Dismiss Notification">
        <i data-lucide="x" style="width: 16px; height: 16px;"></i>
      </button>
    `;

    // Append to container
    this.container.appendChild(toast);

    if (action && action.onClick) {
      const actBtn = toast.querySelector('.toast-action-btn');
      if (actBtn) actBtn.addEventListener('click', action.onClick);
    }

    // Refresh icons if lucide is available
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: toast });
    }

    // Dismiss button click
    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    // Auto dismiss (if action is present, allow more time for user to click)
    const effectiveDuration = action ? Math.max(duration, 7000) : duration;
    if (effectiveDuration > 0 && type !== 'loading') {
      setTimeout(() => {
        this.dismiss(toast);
      }, effectiveDuration);
    }

    return toast;
  }

  dismiss(toastElement) {
    if (!toastElement || !toastElement.parentElement) return;
    toastElement.style.opacity = '0';
    toastElement.style.transform = 'translateY(-15px) scale(0.95)';
    setTimeout(() => {
      if (toastElement.parentElement) {
        toastElement.parentElement.removeChild(toastElement);
      }
    }, 280);
  }

  success(msg, title) { return this.show(msg, 'success', title); }
  error(msg, title) { return this.show(msg, 'error', title); }
  warning(msg, title) { return this.show(msg, 'warning', title); }
  info(msg, title) { return this.show(msg, 'info', title); }

  /**
   * Custom Luxury KoreFlame Confirmation Dialog
   * Replaces ugly default browser confirm() popups with a themed modal dialog
   * @param {object|string} options - message string or configuration object
   * @returns {Promise<boolean>}
   */
  confirm(options) {
    return new Promise((resolve) => {
      let config = {
        title: 'Please Confirm',
        message: 'Are you sure you want to proceed?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'warning', // 'logout' | 'danger' | 'warning' | 'info'
        icon: null
      };

      if (typeof options === 'string') {
        config.message = options;
        const lower = options.toLowerCase();
        if (lower.includes('sign out') || lower.includes('log out')) {
          config.title = 'Sign Out of KoreFlame?';
          config.type = 'logout';
          config.confirmText = 'Sign Out';
          config.cancelText = 'Cancel';
        } else if (lower.includes('clear') || lower.includes('cancel reservation')) {
          config.title = 'Confirm Action';
          config.type = 'danger';
          config.confirmText = 'Yes, Proceed';
        }
      } else if (typeof options === 'object' && options !== null) {
        config = Object.assign(config, options);
      }

      // Backdrop element
      const backdrop = document.createElement('div');
      backdrop.className = 'kf-confirm-backdrop';
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      backdrop.setAttribute('aria-labelledby', 'kf-confirm-title');

      const icons = {
        logout: '<i data-lucide="log-out" style="width: 32px; height: 32px;"></i>',
        danger: '<i data-lucide="alert-triangle" style="width: 32px; height: 32px;"></i>',
        warning: '<i data-lucide="help-circle" style="width: 32px; height: 32px;"></i>',
        info: '<i data-lucide="info" style="width: 32px; height: 32px;"></i>'
      };

      const selectedIcon = config.icon ? `<i data-lucide="${config.icon}" style="width: 32px; height: 32px;"></i>` : (icons[config.type] || icons.warning);

      backdrop.innerHTML = `
        <div class="kf-confirm-card">
          <div class="kf-confirm-icon-wrap type-${config.type}">
            ${selectedIcon}
          </div>
          <h4 class="fw-extrabold mb-2 text-primary-app" id="kf-confirm-title">${config.title}</h4>
          <p class="text-secondary mb-4" style="font-size: 0.95rem; line-height: 1.55;">${config.message}</p>
          <div class="d-flex gap-2.5 justify-content-center">
            <button type="button" class="btn-flame-outline flex-fill py-2.5 justify-content-center" id="kf-confirm-btn-cancel">
              <span>${config.cancelText}</span>
            </button>
            <button type="button" class="btn-flame flex-fill py-2.5 justify-content-center shadow-md" id="kf-confirm-btn-ok">
              <span>${config.confirmText}</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: backdrop });
      }

      // Fade in smoothly
      requestAnimationFrame(() => {
        backdrop.classList.add('active');
      });

      const cancelBtn = backdrop.querySelector('#kf-confirm-btn-cancel');
      const okBtn = backdrop.querySelector('#kf-confirm-btn-ok');
      const previousActive = document.activeElement;

      if (okBtn) okBtn.focus();

      let isClosed = false;
      function closeDialog(result) {
        if (isClosed) return;
        isClosed = true;
        backdrop.classList.remove('active');
        document.removeEventListener('keydown', handleKeyDown);
        setTimeout(() => {
          if (backdrop.parentElement) {
            backdrop.parentElement.removeChild(backdrop);
          }
          if (previousActive && typeof previousActive.focus === 'function') {
            try { previousActive.focus(); } catch (err) {}
          }
          resolve(result);
        }, 220);
      }

      cancelBtn.addEventListener('click', () => closeDialog(false));
      okBtn.addEventListener('click', () => closeDialog(true));

      // Click outside card closes
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          closeDialog(false);
        }
      });

      function handleKeyDown(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeDialog(false);
        } else if (e.key === 'Enter' && document.activeElement !== cancelBtn) {
          e.preventDefault();
          closeDialog(true);
        }
      }

      document.addEventListener('keydown', handleKeyDown);
    });
  }
}

// Global instances
window.kfToast = new KoreFlameToast();
window.showToast = (msg, type, title, duration) => window.kfToast.show(msg, type, title, duration);
window.kfConfirm = (options) => window.kfToast.confirm(options);
