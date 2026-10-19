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
   * @param {number} duration - Auto dismiss in ms (default 4500)
   */
  show(message, type = 'info', title = null, duration = 4500) {
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
      success: '<i data-lucide="check-circle-2"></i>',
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

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${titles[type]}</div>
        <p class="toast-message">${message}</p>
      </div>
      <button type="button" class="toast-close-btn" aria-label="Dismiss Notification">
        <i data-lucide="x" style="width: 16px; height: 16px;"></i>
      </button>
    `;

    // Append to container
    this.container.appendChild(toast);

    // Refresh icons if lucide is available
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: toast });
    }

    // Dismiss button click
    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    // Auto dismiss
    if (duration > 0 && type !== 'loading') {
      setTimeout(() => {
        this.dismiss(toast);
      }, duration);
    }

    return toast;
  }

  dismiss(toastElement) {
    if (!toastElement || !toastElement.parentElement) return;
    toastElement.style.opacity = '0';
    toastElement.style.transform = 'translateY(15px) scale(0.95)';
    setTimeout(() => {
      if (toastElement.parentElement) {
        toastElement.parentElement.removeChild(toastElement);
      }
    }, 300);
  }

  success(msg, title) { return this.show(msg, 'success', title); }
  error(msg, title) { return this.show(msg, 'error', title); }
  warning(msg, title) { return this.show(msg, 'warning', title); }
  info(msg, title) { return this.show(msg, 'info', title); }
}

// Global instance
window.kfToast = new KoreFlameToast();
window.showToast = (msg, type, title, duration) => window.kfToast.show(msg, type, title, duration);
