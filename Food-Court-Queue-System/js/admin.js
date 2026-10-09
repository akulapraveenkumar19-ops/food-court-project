/**
 * Food Court Queue Management System
 * admin.js - Staff Kitchen Display, Queue Operations & Live Order Management
 */

const AdminController = {
    currentStatusFilter: 'All',
    searchQuery: '',
    queueInstance: new Queue(),

    init() {
        this.syncQueueInstance();
        this.renderStats();
        this.renderOrdersTable();
        this.renderQueueVisualizer();
        this.bindEvents();

        // Cross-tab real-time sync
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEYS.ORDERS || e.key === STORAGE_KEYS.QUEUE) {
                this.syncQueueInstance();
                this.renderStats();
                this.renderOrdersTable();
                this.renderQueueVisualizer();
            }
        });

        // Periodic sync every 2.5 seconds
        setInterval(() => {
            this.syncQueueInstance();
            this.renderStats();
            this.renderOrdersTable();
            this.renderQueueVisualizer();
        }, 2500);
    },

    syncQueueInstance() {
        const queueItems = StorageManager.getQueueItems();
        this.queueInstance = new Queue(queueItems);
    },

    bindEvents() {
        // Search Orders Input
        const searchInput = document.getElementById('adminOrderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderOrdersTable();
            });
        }

        // Status Filter Tabs
        const filterBtns = document.querySelectorAll('.admin-filter-tab');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentStatusFilter = btn.getAttribute('data-status');
                this.renderOrdersTable();
            });
        });

        // Demo Data Reset
        const resetBtn = document.getElementById('resetDemoBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset orders and queue to initial sample demo data?')) {
                    StorageManager.resetDemoData();
                    this.syncQueueInstance();
                    this.renderStats();
                    this.renderOrdersTable();
                    this.renderQueueVisualizer();
                    App.showToast('Demo data restored successfully', 'success');
                }
            });
        }

        // Clear All Orders
        const clearBtn = document.getElementById('clearAllOrdersBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Warning: This will clear all orders and queue. Continue?')) {
                    StorageManager.clearAllData();
                    this.syncQueueInstance();
                    this.renderStats();
                    this.renderOrdersTable();
                    this.renderQueueVisualizer();
                    App.showToast('All orders cleared', 'warning');
                }
            });
        }

        // Interactive Queue Visualizer Control Buttons
        this.bindQueueOperationButtons();
    },

    bindQueueOperationButtons() {
        // Enqueue Demo Customer
        const btnEnqueue = document.getElementById('btnQueueEnqueue');
        if (btnEnqueue) {
            btnEnqueue.addEventListener('click', () => {
                const sampleNames = ['Kavita', 'Sanjay', 'Deepak', 'Meera', 'Rohan', 'Sneha'];
                const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
                const token = StorageManager.generateNextToken();
                
                const demoOrder = {
                    token: token,
                    customerName: randomName,
                    customerPhone: '98' + Math.floor(10000000 + Math.random() * 90000000),
                    items: [{ id: 'b1', name: 'Chicken Burger', price: 120, quantity: 1 }],
                    subtotal: 120,
                    gst: 6,
                    totalAmount: 126,
                    paymentMethod: 'UPI',
                    status: 'Waiting',
                    createdAt: new Date().toISOString(),
                    estimatedTime: 12,
                    queuePosition: this.queueInstance.size() + 1
                };

                // Enqueue operation
                this.queueInstance.enqueue(demoOrder);
                StorageManager.saveQueueItems(this.queueInstance.display());

                const orders = StorageManager.getOrders();
                orders.push(demoOrder);
                StorageManager.saveOrders(orders);
                StorageManager.addToHistory(demoOrder);

                App.showToast(`[Queue.enqueue] Enqueued token ${token} (${randomName})`, 'success');
                this.renderStats();
                this.renderOrdersTable();
                this.renderQueueVisualizer();
            });
        }

        // Dequeue Front Customer
        const btnDequeue = document.getElementById('btnQueueDequeue');
        if (btnDequeue) {
            btnDequeue.addEventListener('click', () => {
                if (this.queueInstance.isEmpty()) {
                    App.showToast('[Queue.dequeue] Underflow: Queue is currently empty!', 'error');
                    return;
                }

                // Dequeue operation (removes head)
                const dequeuedOrder = this.queueInstance.dequeue();
                StorageManager.saveQueueItems(this.queueInstance.display());

                // Mark order completed in orders list
                this.updateOrderStatus(dequeuedOrder.token, 'Completed', false);

                App.showToast(`[Queue.dequeue] Dequeued and completed token ${dequeuedOrder.token}`, 'info');
                this.renderStats();
                this.renderOrdersTable();
                this.renderQueueVisualizer();
            });
        }

        // Peek Front Customer
        const btnPeek = document.getElementById('btnQueuePeek');
        if (btnPeek) {
            btnPeek.addEventListener('click', () => {
                if (this.queueInstance.isEmpty()) {
                    App.showToast('[Queue.peek] Queue is empty, nothing to peek!', 'warning');
                    return;
                }
                const front = this.queueInstance.peek();
                App.showToast(`[Queue.peek] Front of Queue: Token ${front.token} (${front.customerName})`, 'info', 4000);
            });
        }

        // IsEmpty Check
        const btnIsEmpty = document.getElementById('btnQueueIsEmpty');
        if (btnIsEmpty) {
            btnIsEmpty.addEventListener('click', () => {
                const empty = this.queueInstance.isEmpty();
                App.showToast(`[Queue.isEmpty] Returns: ${empty} (Size: ${this.queueInstance.size()})`, 'info');
            });
        }

        // Size Check
        const btnSize = document.getElementById('btnQueueSize');
        if (btnSize) {
            btnSize.addEventListener('click', () => {
                App.showToast(`[Queue.size] Current Queue Size: ${this.queueInstance.size()} orders`, 'info');
            });
        }
    },

    renderStats() {
        const orders = StorageManager.getOrders();
        const history = StorageManager.getOrderHistory();

        // Combine unique orders across history and active
        const allMap = new Map();
        orders.forEach(o => allMap.set(o.token, o));
        history.forEach(h => {
            if (!allMap.has(h.token)) allMap.set(h.token, h);
        });
        const combined = Array.from(allMap.values());

        const totalOrders = combined.length;
        const waitingOrders = orders.filter(o => o.status === 'Waiting').length;
        const preparingOrders = orders.filter(o => o.status === 'Preparing').length;
        const readyOrders = orders.filter(o => o.status === 'Ready').length;
        const completedOrders = combined.filter(o => o.status === 'Completed').length;
        
        const totalRevenue = combined
            .filter(o => o.status !== 'Cancelled')
            .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

        // Update DOM elements
        const statTotal = document.getElementById('statTotalOrders');
        const statWaiting = document.getElementById('statPendingOrders');
        const statPreparing = document.getElementById('statPreparingOrders');
        const statReady = document.getElementById('statReadyOrders');
        const statCompleted = document.getElementById('statCompletedOrders');
        const statRevenue = document.getElementById('statTotalRevenue');

        if (statTotal) statTotal.textContent = totalOrders;
        if (statWaiting) statWaiting.textContent = waitingOrders;
        if (statPreparing) statPreparing.textContent = preparingOrders;
        if (statReady) statReady.textContent = readyOrders;
        if (statCompleted) statCompleted.textContent = completedOrders;
        if (statRevenue) statRevenue.textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
    },

    renderOrdersTable() {
        const tbody = document.getElementById('adminOrdersTableBody');
        if (!tbody) return;

        const allOrders = StorageManager.getOrders();

        // Filter by status tab & search query
        let filtered = allOrders.filter(order => {
            const matchesStatus = (this.currentStatusFilter === 'All') || 
                (order.status.toLowerCase() === this.currentStatusFilter.toLowerCase());

            const matchesSearch = !this.searchQuery || 
                order.token.toLowerCase().includes(this.searchQuery) ||
                order.customerName.toLowerCase().includes(this.searchQuery) ||
                (order.customerPhone && order.customerPhone.includes(this.searchQuery)) ||
                order.items.some(i => i.name.toLowerCase().includes(this.searchQuery));

            return matchesStatus && matchesSearch;
        });

        // Sort: Waiting & Preparing first, then Ready, then others
        const statusWeight = {
            'Waiting': 1,
            'Preparing': 2,
            'Ready': 3,
            'Completed': 4,
            'Cancelled': 5
        };
        filtered.sort((a, b) => (statusWeight[a.status] || 99) - (statusWeight[b.status] || 99));

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="empty-table-state">
                            <i class="fa-solid fa-inbox text-muted"></i>
                            <p>No orders found matching the filter criteria.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(order => {
            const itemsFormatted = order.items.map(i => `${i.name} &times; ${i.quantity}`).join('<br>');
            const timeAgo = this.getTimeAgo(order.createdAt);

            return `
                <tr class="order-row row-status-${order.status.toLowerCase()}">
                    <td>
                        <strong class="token-cell">${order.token}</strong>
                        <div class="small text-muted">${timeAgo}</div>
                    </td>
                    <td>
                        <strong>${order.customerName}</strong>
                        <div class="small text-muted"><i class="fa-solid fa-phone"></i> ${order.customerPhone || 'N/A'}</div>
                    </td>
                    <td class="items-cell">
                        <div class="items-pill-summary">${itemsFormatted}</div>
                        ${order.notes ? `<div class="order-note-text"><i class="fa-regular fa-comment-dots"></i> ${order.notes}</div>` : ''}
                    </td>
                    <td>
                        <strong>₹${order.totalAmount}</strong>
                        <div class="small text-muted">${order.paymentMethod}</div>
                    </td>
                    <td>
                        <div class="status-dropdown-wrapper">
                            <select class="status-select select-${order.status.toLowerCase()}" 
                                    onchange="AdminController.handleStatusDropdownChange('${order.token}', this.value)">
                                <option value="Waiting" ${order.status === 'Waiting' ? 'selected' : ''}>⏳ Waiting</option>
                                <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>🔥 Preparing</option>
                                <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>🔔 Ready</option>
                                <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>✓ Completed</option>
                                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>✕ Cancelled</option>
                            </select>
                        </div>
                    </td>
                    <td class="actions-cell">
                        ${this.renderQuickActionButtons(order)}
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderQuickActionButtons(order) {
        if (order.status === 'Waiting') {
            return `
                <button class="btn btn-sm btn-info" onclick="AdminController.updateOrderStatus('${order.token}', 'Preparing')">
                    <i class="fa-solid fa-fire"></i> Start Prep
                </button>
            `;
        } else if (order.status === 'Preparing') {
            return `
                <button class="btn btn-sm btn-success" onclick="AdminController.updateOrderStatus('${order.token}', 'Ready')">
                    <i class="fa-solid fa-bell"></i> Mark Ready
                </button>
            `;
        } else if (order.status === 'Ready') {
            return `
                <button class="btn btn-sm btn-primary" onclick="AdminController.updateOrderStatus('${order.token}', 'Completed')">
                    <i class="fa-solid fa-check"></i> Complete
                </button>
            `;
        } else {
            return `
                <span class="text-muted small"><i class="fa-solid fa-check-double"></i> Done</span>
            `;
        }
    },

    handleStatusDropdownChange(token, newStatus) {
        this.updateOrderStatus(token, newStatus);
    },

    updateOrderStatus(token, newStatus, notify = true) {
        const orders = StorageManager.getOrders();
        const order = orders.find(o => o.token === token);
        if (!order) return;

        order.status = newStatus;
        if (newStatus === 'Completed') {
            order.completedAt = new Date().toISOString();
        }

        StorageManager.saveOrders(orders);
        StorageManager.addToHistory(order);

        // Update active Queue data structure
        let queueItems = StorageManager.getQueueItems();
        if (newStatus === 'Completed' || newStatus === 'Cancelled') {
            // Remove from active queue
            queueItems = queueItems.filter(q => q.token !== token);
        } else {
            // Update status inside queue
            const qItem = queueItems.find(q => q.token === token);
            if (qItem) {
                qItem.status = newStatus;
            } else {
                queueItems.push(order);
            }
        }
        StorageManager.saveQueueItems(queueItems);
        this.syncQueueInstance();

        // Render updates
        this.renderStats();
        this.renderOrdersTable();
        this.renderQueueVisualizer();

        if (notify) {
            App.playSound(newStatus === 'Completed' ? 'success' : 'chime');
            App.showToast(`Order #${token} status changed to ${newStatus}`, 'info');
        }
    },

    /**
     * Interactive FIFO Queue Visualizer
     * Shows an educational visual representation of the Queue data structure
     */
    renderQueueVisualizer() {
        const container = document.getElementById('queueVisualizerTrack');
        const sizeBadge = document.getElementById('visualizerSizeBadge');
        const frontTokenBadge = document.getElementById('visualizerFrontToken');
        if (!container) return;

        const items = this.queueInstance.display();

        if (sizeBadge) sizeBadge.textContent = `Size: ${this.queueInstance.size()}`;
        if (frontTokenBadge) {
            const front = this.queueInstance.peek();
            frontTokenBadge.textContent = front ? `Front (Head): ${front.token}` : 'Front (Head): Empty';
        }

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-visualizer">
                    <i class="fa-solid fa-arrow-right-arrow-left"></i>
                    <span>Queue is currently empty (isEmpty() = true)</span>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map((item, index) => {
            const isFront = index === 0;
            const isRear = index === items.length - 1;

            return `
                <div class="visual-queue-node ${isFront ? 'node-front' : ''} ${isRear ? 'node-rear' : ''}">
                    ${isFront ? '<span class="node-tag head-tag">FRONT (Peek)</span>' : ''}
                    ${isRear && !isFront ? '<span class="node-tag rear-tag">REAR</span>' : ''}
                    <div class="node-token">${item.token}</div>
                    <div class="node-name">${item.customerName}</div>
                    <span class="status-badge-mini status-${item.status.toLowerCase()}">${item.status}</span>
                    <span class="node-idx">Index [${index}]</span>
                </div>
            `;
        }).join('<div class="visual-queue-arrow"><i class="fa-solid fa-arrow-left"></i></div>');
    },

    getTimeAgo(isoString) {
        if (!isoString) return '';
        const diffMs = Date.now() - new Date(isoString).getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        const diffHours = Math.floor(diffMins / 60);
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
};

// Initialize if on admin.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('adminDashboardSection')) {
        AdminController.init();
    }
});
