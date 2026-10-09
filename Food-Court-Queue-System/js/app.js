/**
 * Food Court Queue Management System
 * app.js - Universal Application Framework (Toasts, Sound FX, Navbar, Modals, Shared Utilities)
 */

const App = {
    audioCtx: null,

    init() {
        this.setupNavbar();
        this.updateCartBadge();
        this.setupGlobalEventListeners();
        this.highlightActiveNavLink();

        // Listen for storage changes across tabs
        window.addEventListener('storage', () => {
            this.updateCartBadge();
        });

        // Custom event listeners
        window.addEventListener('cartUpdated', (e) => {
            this.updateCartBadge(e.detail ? e.detail.count : null);
        });
    },

    /**
     * Active Nav Link Highlighter
     */
    highlightActiveNavLink() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    /**
     * Responsive Mobile Navigation
     */
    setupNavbar() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const navLinks = document.getElementById('navLinks');

        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => {
                navLinks.classList.toggle('open');
                const isOpen = navLinks.classList.contains('open');
                mobileToggle.innerHTML = isOpen 
                    ? '<i class="fa-solid fa-xmark"></i>' 
                    : '<i class="fa-solid fa-bars"></i>';
                mobileToggle.setAttribute('aria-expanded', isOpen);
            });

            // Close when clicking outside or clicking a link
            document.addEventListener('click', (e) => {
                if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target) && navLinks.classList.contains('open')) {
                    navLinks.classList.remove('open');
                    mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
                }
            });
        }
    },

    /**
     * Update Floating Cart Badge on Header
     */
    updateCartBadge(forcedCount = null) {
        const count = forcedCount !== null ? forcedCount : StorageManager.getCartItemCount();
        const badgeElements = document.querySelectorAll('.cart-badge');
        badgeElements.forEach(badge => {
            badge.textContent = count;
            if (count > 0) {
                badge.classList.remove('hidden');
                badge.classList.add('badge-pop');
                setTimeout(() => badge.classList.remove('badge-pop'), 300);
            } else {
                badge.classList.add('hidden');
            }
        });
    },

    /**
     * Modern Toast Notification System
     * @param {string} message - Message text
     * @param {string} type - 'success' | 'info' | 'warning' | 'error'
     * @param {number} duration - Milliseconds before auto dismissal
     */
    showToast(message, type = 'info', duration = 3500) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: 'fa-solid fa-circle-check',
            info: 'fa-solid fa-circle-info',
            warning: 'fa-solid fa-triangle-exclamation',
            error: 'fa-solid fa-circle-exclamation'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} toast-enter`;
        toast.innerHTML = `
            <div class="toast-icon"><i class="${icons[type] || icons.info}"></i></div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" aria-label="Close notification">&times;</button>
            <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
        `;

        container.appendChild(toast);

        // Play subtle sound effect
        if (type === 'success') {
            this.playSound('success');
        } else if (type === 'error' || type === 'warning') {
            this.playSound('alert');
        } else {
            this.playSound('chime');
        }

        // Close on button click
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        // Auto remove after timeout
        const timer = setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        toast.addEventListener('mouseenter', () => clearTimeout(timer));
    },

    removeToast(toast) {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        toast.addEventListener('animationend', () => {
            if (toast.parentElement) toast.parentElement.removeChild(toast);
        });
    },

    /**
     * Pure Web Audio API Sound Generator (Zero External Audio File Requirement)
     * Plays crisp, pleasant interface tones
     */
    playSound(type = 'chime') {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!this.audioCtx) this.audioCtx = new AudioContext();

            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }

            const ctx = this.audioCtx;
            const now = ctx.currentTime;

            if (type === 'success') {
                // Two pleasant ascending notes (C5 -> G5)
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(523.25, now);
                osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
                gain1.gain.setValueAtTime(0.12, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.35);
            } else if (type === 'alert') {
                // Warning double beep
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(350, now);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.25);
            } else {
                // Soft chime click
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.15);
            }
        } catch (e) {
            // Audio policy / mute fallback gracefully
        }
    },

    /**
     * Modal Controller
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Close on escape
            const onEsc = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal(modalId);
                    document.removeEventListener('keydown', onEsc);
                }
            };
            document.addEventListener('keydown', onEsc);
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    setupGlobalEventListeners() {
        // Universal modal backdrop click dismissal
        document.addEventListener('click', (e) => {
            if (e.target.classList && e.target.classList.contains('modal-overlay')) {
                const modalId = e.target.id;
                this.closeModal(modalId);
            }
            if (e.target.closest && e.target.closest('[data-modal-close]')) {
                const targetModal = e.target.closest('.modal-overlay');
                if (targetModal) this.closeModal(targetModal.id);
            }
        });
    },

    /**
     * Helpers
     */
    formatCurrency(amount) {
        return `₹${Number(amount).toLocaleString('en-IN')}`;
    },

    formatDateTime(isoString) {
        if (!isoString) return 'N/A';
        const d = new Date(isoString);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    getStatusBadge(status) {
        const safe = (status || 'Waiting').toLowerCase();
        const icons = {
            waiting: 'fa-solid fa-hourglass-half',
            preparing: 'fa-solid fa-fire-burner',
            ready: 'fa-solid fa-bell-concierge',
            completed: 'fa-solid fa-circle-check',
            cancelled: 'fa-solid fa-circle-xmark'
        };
        return `<span class="status-badge status-${safe}"><i class="${icons[safe] || 'fa-solid fa-circle'}"></i> ${status}</span>`;
    }
};

/**
 * Controller for history.html (Order History & Receipts)
 */
const HistoryController = {
    searchQuery: '',
    statusFilter: 'all',

    init() {
        this.renderHistory();
        this.bindEvents();
    },

    bindEvents() {
        const searchInput = document.getElementById('historySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderHistory();
            });
        }

        const filterTabs = document.querySelectorAll('.history-filter-btn');
        filterTabs.forEach(btn => {
            btn.addEventListener('click', () => {
                filterTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.statusFilter = btn.getAttribute('data-status');
                this.renderHistory();
            });
        });

        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                if (confirm('Clear your entire local order history?')) {
                    StorageManager.saveOrderHistory([]);
                    this.renderHistory();
                    App.showToast('Order history cleared', 'info');
                }
            });
        }
    },

    renderHistory() {
        const container = document.getElementById('historyListContainer');
        const emptyState = document.getElementById('emptyHistoryState');
        const countDisplay = document.getElementById('historyCountDisplay');
        if (!container) return;

        let history = StorageManager.getOrderHistory();

        // Filter by search & status
        let filtered = history.filter(order => {
            const matchesStatus = (this.statusFilter === 'all') || 
                (order.status.toLowerCase() === this.statusFilter.toLowerCase());

            const matchesSearch = !this.searchQuery || 
                order.token.toLowerCase().includes(this.searchQuery) ||
                order.customerName.toLowerCase().includes(this.searchQuery) ||
                (order.customerPhone && order.customerPhone.includes(this.searchQuery)) ||
                order.items.some(i => i.name.toLowerCase().includes(this.searchQuery));

            return matchesStatus && matchesSearch;
        });

        if (countDisplay) {
            countDisplay.textContent = `${filtered.length} Orders Recorded`;
        }

        if (filtered.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            container.innerHTML = '';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = filtered.map(order => {
            const itemsSummary = order.items.map(i => `${i.name} &times; ${i.quantity}`).join(', ');
            const dateStr = App.formatDateTime(order.createdAt);

            return `
                <div class="history-card">
                    <div class="history-card-header">
                        <div>
                            <span class="history-token-chip">${order.token}</span>
                            <span class="history-date"><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
                        </div>
                        <div>
                            ${App.getStatusBadge(order.status)}
                        </div>
                    </div>

                    <div class="history-card-body">
                        <div class="history-customer-row">
                            <span><i class="fa-solid fa-user text-muted"></i> <strong>${order.customerName}</strong></span>
                            <span><i class="fa-solid fa-wallet text-muted"></i> ${order.paymentMethod}</span>
                        </div>
                        <div class="history-items-row">
                            <span class="text-muted">Items:</span>
                            <p class="history-items-text">${itemsSummary}</p>
                        </div>
                    </div>

                    <div class="history-card-footer">
                        <div class="history-total">
                            <span>Total Amount:</span>
                            <strong>₹${order.totalAmount}</strong>
                        </div>
                        <div class="history-actions">
                            <button class="btn btn-sm btn-outline" onclick="HistoryController.showReceiptModal('${order.token}')">
                                <i class="fa-solid fa-receipt"></i> View Receipt
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="HistoryController.reorderItems('${order.token}')">
                                <i class="fa-solid fa-rotate-right"></i> Re-order
                            </button>
                            ${order.status !== 'Completed' && order.status !== 'Cancelled' ? `
                                <a href="queue.html?token=${order.token}" class="btn btn-sm btn-warning">
                                    <i class="fa-solid fa-bullhorn"></i> Track
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    showReceiptModal(token) {
        const history = StorageManager.getOrderHistory();
        const order = history.find(o => o.token === token);
        if (!order) return;

        const modalBody = document.getElementById('receiptModalContent');
        if (!modalBody) return;

        const subtotal = order.subtotal || order.items.reduce((s, i) => s + (i.price * i.quantity), 0);
        const gst = order.gst || Math.round(subtotal * 0.05);

        modalBody.innerHTML = `
            <div class="receipt-paper" id="printableReceipt">
                <div class="receipt-header">
                    <h2>FOOD COURT EXPRESS</h2>
                    <p>Modern Smart Queue Management</p>
                    <div class="receipt-divider"></div>
                    <div class="receipt-meta">
                        <div><strong>Token: ${order.token}</strong></div>
                        <div>Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                        <div>Customer: ${order.customerName}</div>
                        <div>Phone: ${order.customerPhone}</div>
                        <div>Payment: ${order.paymentMethod}${order.upiUtr ? ` (Ref: ${order.upiUtr})` : ''}</div>
                    </div>
                    <div class="receipt-divider"></div>
                </div>

                <div class="receipt-items-table">
                    <div class="receipt-row receipt-head">
                        <span>Item</span>
                        <span>Qty</span>
                        <span>Price</span>
                    </div>
                    ${order.items.map(item => `
                        <div class="receipt-row">
                            <span>${item.name}</span>
                            <span>${item.quantity}</span>
                            <span>₹${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="receipt-divider"></div>

                <div class="receipt-calc">
                    <div class="receipt-row">
                        <span>Subtotal:</span>
                        <span>₹${subtotal}</span>
                    </div>
                    <div class="receipt-row">
                        <span>GST (5%):</span>
                        <span>₹${gst}</span>
                    </div>
                    <div class="receipt-row receipt-grand-total">
                        <strong>Grand Total:</strong>
                        <strong>₹${order.totalAmount}</strong>
                    </div>
                </div>

                <div class="receipt-footer">
                    <div class="receipt-divider"></div>
                    <p>Status: <strong>${order.status.toUpperCase()}</strong></p>
                    <p>Thank you for ordering with us!</p>
                    <p>Have a delicious meal! 🍽️</p>
                </div>
            </div>
        `;

        App.openModal('receiptModal');
    },

    reorderItems(token) {
        const history = StorageManager.getOrderHistory();
        const order = history.find(o => o.token === token);
        if (!order) return;

        order.items.forEach(item => {
            const catalogItem = StorageManager.getItemById(item.id) || {
                id: item.id,
                name: item.name,
                price: item.price,
                category: 'Ordered'
            };
            StorageManager.addToCart(catalogItem, item.quantity);
        });

        App.showToast(`✓ Items from #${token} added to your cart!`, 'success');
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 800);
    }
};

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    if (document.getElementById('historyPageSection')) {
        HistoryController.init();
    }
});

