/**
 * Food Court Queue Management System
 * queue.js - Queue Data Structure (FIFO) Implementation & Queue Status Page Controller
 */

/**
 * Standard Queue Data Structure Class (FIFO - First In First Out)
 * Meets all computer science queue specifications outlined in project requirements.
 */
class Queue {
    constructor(items = []) {
        this.items = [...items];
    }

    /**
     * Enqueue: Adds an order to the rear/tail of the queue
     * @param {Object} item 
     */
    enqueue(item) {
        this.items.push(item);
    }

    /**
     * Dequeue: Removes and returns the order from the front/head of the queue
     * @returns {Object|null}
     */
    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.shift();
    }

    /**
     * Peek: Inspects the first order at the front without removing it
     * @returns {Object|null}
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[0];
    }

    /**
     * IsEmpty: Returns true if the queue has no elements
     * @returns {boolean}
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Size: Returns the current number of orders in the queue
     * @returns {number}
     */
    size() {
        return this.items.length;
    }

    /**
     * Display: Returns a shallow copy array of all orders in queue
     * @returns {Array}
     */
    display() {
        return [...this.items];
    }

    /**
     * Clear all elements from queue
     */
    clear() {
        this.items = [];
    }

    /**
     * Find item by Token
     */
    findByToken(token) {
        return this.items.find(item => item.token.toUpperCase() === token.toUpperCase());
    }

    /**
     * Get position of token in queue (1-based index)
     */
    getPosition(token) {
        const index = this.items.findIndex(item => item.token.toUpperCase() === token.toUpperCase());
        return index >= 0 ? index + 1 : -1;
    }

    /**
     * Remove item by token
     */
    removeByToken(token) {
        const index = this.items.findIndex(item => item.token.toUpperCase() === token.toUpperCase());
        if (index > -1) {
            return this.items.splice(index, 1)[0];
        }
        return null;
    }

    /**
     * Update order status inside queue
     */
    updateStatus(token, newStatus) {
        const item = this.findByToken(token);
        if (item) {
            item.status = newStatus;
            return true;
        }
        return false;
    }
}

/**
 * Controller for queue.html (Real-time Queue Status Display)
 */
const QueuePageController = {
    queue: new Queue(),
    selectedToken: null,

    init() {
        this.loadQueueFromStorage();
        this.renderQueueBoard();
        this.bindEvents();
        this.checkUrlForToken();

        // Listen for storage changes across browser tabs for live sync
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEYS.QUEUE || e.key === STORAGE_KEYS.ORDERS) {
                this.loadQueueFromStorage();
                this.renderQueueBoard();
                if (this.selectedToken) {
                    this.trackToken(this.selectedToken, false);
                }
            }
        });

        // Periodic live refresh every 2.5 seconds
        setInterval(() => {
            this.loadQueueFromStorage();
            this.renderQueueBoard();
            if (this.selectedToken) {
                this.trackToken(this.selectedToken, false);
            }
        }, 2500);
    },

    loadQueueFromStorage() {
        const rawQueue = StorageManager.getQueueItems();
        this.queue = new Queue(rawQueue);
    },

    bindEvents() {
        const trackForm = document.getElementById('tokenTrackForm');
        if (trackForm) {
            trackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('tokenInput');
                if (input && input.value.trim()) {
                    this.trackToken(input.value.trim().toUpperCase(), true);
                }
            });
        }

        const refreshBtn = document.getElementById('refreshQueueBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadQueueFromStorage();
                this.renderQueueBoard();
                if (window.App) App.showToast('Queue status refreshed', 'info');
            });
        }
    },

    checkUrlForToken() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            const input = document.getElementById('tokenInput');
            if (input) input.value = token;
            this.trackToken(token.toUpperCase(), false);
        }
    },

    renderQueueBoard() {
        const allOrders = StorageManager.getOrders();
        
        // Categorize orders
        const nowServing = allOrders.filter(o => o.status === 'Ready');
        const preparing = allOrders.filter(o => o.status === 'Preparing');
        const waiting = allOrders.filter(o => o.status === 'Waiting');
        const completed = allOrders.filter(o => o.status === 'Completed').slice(-5).reverse();

        // 1. Update Metrics
        const totalWaitingEl = document.getElementById('totalWaitingCount');
        const totalPrepEl = document.getElementById('totalPreparingCount');
        const totalReadyEl = document.getElementById('totalReadyCount');
        const avgWaitEl = document.getElementById('avgWaitTimeDisplay');

        if (totalWaitingEl) totalWaitingEl.textContent = waiting.length;
        if (totalPrepEl) totalPrepEl.textContent = preparing.length;
        if (totalReadyEl) totalReadyEl.textContent = nowServing.length;
        if (avgWaitEl) {
            const avgMins = waiting.length * 4 + preparing.length * 2 + 5;
            avgWaitEl.textContent = `${avgMins} Mins`;
        }

        // 2. NOW SERVING / READY FOR PICKUP
        const nowServingContainer = document.getElementById('nowServingList');
        if (nowServingContainer) {
            if (nowServing.length === 0) {
                nowServingContainer.innerHTML = `
                    <div class="empty-state-mini">
                        <i class="fa-solid fa-bell-concierge"></i>
                        <p>No orders currently ready for pickup.<br><span class="text-muted">Orders ready will appear here.</span></p>
                    </div>
                `;
            } else {
                nowServingContainer.innerHTML = nowServing.map(order => `
                    <div class="now-serving-card pulse-ready" onclick="QueuePageController.trackToken('${order.token}', true)">
                        <div class="now-serving-badge">READY FOR PICKUP</div>
                        <div class="now-serving-token">${order.token}</div>
                        <div class="now-serving-name"><i class="fa-solid fa-user"></i> ${order.customerName}</div>
                        <div class="now-serving-meta">
                            <span><i class="fa-solid fa-clock"></i> Just Now</span>
                            <span>${order.items.length} item(s)</span>
                        </div>
                    </div>
                `).join('');
            }
        }

        // 3. PREPARING ORDERS
        const prepContainer = document.getElementById('preparingList');
        if (prepContainer) {
            if (preparing.length === 0) {
                prepContainer.innerHTML = `
                    <div class="empty-state-mini">
                        <i class="fa-solid fa-kitchen-set"></i>
                        <p>No orders currently in preparation.</p>
                    </div>
                `;
            } else {
                prepContainer.innerHTML = preparing.map(order => `
                    <div class="queue-item-card prep-border" onclick="QueuePageController.trackToken('${order.token}', true)">
                        <div class="queue-card-header">
                            <span class="queue-token-chip">${order.token}</span>
                            <span class="status-badge status-preparing"><i class="fa-solid fa-fire-burner"></i> Preparing</span>
                        </div>
                        <div class="queue-card-body">
                            <div class="customer-info"><i class="fa-regular fa-user"></i> ${order.customerName}</div>
                            <div class="items-summary">${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                        </div>
                        <div class="queue-card-footer">
                            <span><i class="fa-regular fa-clock"></i> Est. ~${order.estimatedTime || 10} mins</span>
                        </div>
                    </div>
                `).join('');
            }
        }

        // 4. UPCOMING ORDERS / WAITING QUEUE
        const waitingContainer = document.getElementById('waitingList');
        if (waitingContainer) {
            if (waiting.length === 0) {
                waitingContainer.innerHTML = `
                    <div class="empty-state-mini">
                        <i class="fa-regular fa-clock"></i>
                        <p>No orders in waiting queue. Queue is clear!</p>
                    </div>
                `;
            } else {
                waitingContainer.innerHTML = waiting.map((order, idx) => `
                    <div class="queue-item-card waiting-border" onclick="QueuePageController.trackToken('${order.token}', true)">
                        <div class="queue-card-header">
                            <span class="queue-token-chip">${order.token}</span>
                            <span class="status-badge status-waiting"><i class="fa-solid fa-hourglass-half"></i> Waiting (#${idx + 1})</span>
                        </div>
                        <div class="queue-card-body">
                            <div class="customer-info"><i class="fa-regular fa-user"></i> ${order.customerName}</div>
                            <div class="items-summary">${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                        </div>
                        <div class="queue-card-footer">
                            <span><i class="fa-regular fa-clock"></i> Est. ~${(idx + 1) * 4 + 8} mins</span>
                            <span class="text-primary-sm">Queue Position: #${idx + 1}</span>
                        </div>
                    </div>
                `).join('');
            }
        }

        // 5. RECENTLY COMPLETED ORDERS
        const completedContainer = document.getElementById('completedList');
        if (completedContainer) {
            if (completed.length === 0) {
                completedContainer.innerHTML = `
                    <div class="empty-state-mini">
                        <i class="fa-regular fa-circle-check"></i>
                        <p>No recently completed orders today.</p>
                    </div>
                `;
            } else {
                completedContainer.innerHTML = completed.map(order => `
                    <div class="completed-chip" onclick="QueuePageController.trackToken('${order.token}', true)">
                        <i class="fa-solid fa-circle-check text-success"></i>
                        <span class="token-val">${order.token}</span>
                        <span class="name-val">${order.customerName}</span>
                    </div>
                `).join('');
            }
        }
    },

    /**
     * Real-time Token Tracker for customers
     */
    trackToken(token, showToast = true) {
        this.selectedToken = token;
        const allOrders = StorageManager.getOrders();
        const history = StorageManager.getOrderHistory();
        const order = allOrders.find(o => o.token === token) || history.find(o => o.token === token);

        const trackerResult = document.getElementById('tokenTrackerResult');
        if (!trackerResult) return;

        if (!order) {
            trackerResult.innerHTML = `
                <div class="tracker-alert error">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <div>
                        <strong>Token #${token} Not Found</strong>
                        <p>Please double-check your token number (e.g., FC101) or check the order history.</p>
                    </div>
                </div>
            `;
            if (showToast && window.App) App.showToast(`Token #${token} not found`, 'error');
            return;
        }

        // Calculate queue position if order is Waiting or Preparing
        const waitingOrders = allOrders.filter(o => o.status === 'Waiting');
        const prepOrders = allOrders.filter(o => o.status === 'Preparing');
        
        let positionText = 'Completed';
        let estimatedWait = '0 Minutes';
        let stepIndex = 0; // 0=Placed, 1=Preparing, 2=Ready, 3=Completed

        if (order.status === 'Waiting') {
            const pos = waitingOrders.findIndex(o => o.token === order.token);
            const waitPos = (pos >= 0 ? pos + 1 : 1);
            positionText = `#${waitPos} in line (${prepOrders.length} currently preparing ahead)`;
            estimatedWait = `${waitPos * 4 + 8} Minutes`;
            stepIndex = 0;
        } else if (order.status === 'Preparing') {
            const ppos = prepOrders.findIndex(o => o.token === order.token);
            positionText = `Being prepared now (Chef station #${ppos + 1})`;
            estimatedWait = `~5 Minutes`;
            stepIndex = 1;
        } else if (order.status === 'Ready') {
            positionText = `Ready for Pickup!`;
            estimatedWait = `Pick up immediately at Counter 1`;
            stepIndex = 2;
        } else if (order.status === 'Completed') {
            positionText = `Order Fulfilled`;
            estimatedWait = `Enjoy your meal!`;
            stepIndex = 3;
        } else if (order.status === 'Cancelled') {
            positionText = `Order Cancelled`;
            estimatedWait = `N/A`;
            stepIndex = -1;
        }

        // Render Tracking Detail Card
        trackerResult.innerHTML = `
            <div class="tracker-card">
                <div class="tracker-header">
                    <div>
                        <span class="tracker-token-badge">${order.token}</span>
                        <h3>Order for ${order.customerName}</h3>
                        <p class="tracker-meta"><i class="fa-solid fa-phone"></i> ${order.customerPhone} &bull; <i class="fa-regular fa-clock"></i> Placed at ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div class="tracker-status-pill">
                        <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                </div>

                ${order.status !== 'Cancelled' ? `
                <!-- Step Progress -->
                <div class="tracker-stepper">
                    <div class="step-item ${stepIndex >= 0 ? 'active' : ''} ${stepIndex > 0 ? 'completed' : ''}">
                        <div class="step-circle"><i class="fa-solid fa-receipt"></i></div>
                        <div class="step-label">Order Received</div>
                    </div>
                    <div class="step-line ${stepIndex >= 1 ? 'completed' : ''}"></div>
                    <div class="step-item ${stepIndex >= 1 ? 'active' : ''} ${stepIndex > 1 ? 'completed' : ''}">
                        <div class="step-circle"><i class="fa-solid fa-fire-burner"></i></div>
                        <div class="step-label">Kitchen Preparing</div>
                    </div>
                    <div class="step-line ${stepIndex >= 2 ? 'completed' : ''}"></div>
                    <div class="step-item ${stepIndex >= 2 ? 'active' : ''} ${stepIndex > 2 ? 'completed' : ''}">
                        <div class="step-circle"><i class="fa-solid fa-bell-concierge"></i></div>
                        <div class="step-label">Ready for Pickup</div>
                    </div>
                    <div class="step-line ${stepIndex >= 3 ? 'completed' : ''}"></div>
                    <div class="step-item ${stepIndex >= 3 ? 'active completed' : ''}">
                        <div class="step-circle"><i class="fa-solid fa-circle-check"></i></div>
                        <div class="step-label">Completed</div>
                    </div>
                </div>
                ` : `
                <div class="tracker-alert error">This order was cancelled.</div>
                `}

                <div class="tracker-metrics-grid">
                    <div class="tracker-metric-box">
                        <span class="label">Queue Position</span>
                        <span class="val highlight">${positionText}</span>
                    </div>
                    <div class="tracker-metric-box">
                        <span class="label">Est. Waiting Time</span>
                        <span class="val">${estimatedWait}</span>
                    </div>
                    <div class="tracker-metric-box">
                        <span class="label">Total Amount</span>
                        <span class="val">₹${order.totalAmount} (${order.paymentMethod})</span>
                    </div>
                </div>

                <div class="tracker-items-list">
                    <h4>Ordered Items</h4>
                    <ul>
                        ${order.items.map(item => `
                            <li>
                                <span>${item.name} &times; ${item.quantity}</span>
                                <strong>₹${item.price * item.quantity}</strong>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                ${order.status === 'Ready' ? `
                    <div class="ready-banner">
                        <i class="fa-solid fa-bullhorn fa-beat"></i>
                        <div>
                            <strong>TOKEN #${order.token} IS READY!</strong>
                            <p>Please present this screen or your token number at Counter #1 to collect your tray.</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        if (showToast && window.App) {
            App.showToast(`Found Order #${token}: ${order.status}`, 'info');
        }
    }
};

// Initialize if on queue.html
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('queueBoardSection')) {
            QueuePageController.init();
        }
    });
}
