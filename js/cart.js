/**
 * Food Court Queue Management System
 * cart.js - Cart Management, Customer Form Validation & Order Placement
 */

const CartController = {
    init() {
        this.renderCart();
        this.bindEvents();
    },

    bindEvents() {
        // Customer Checkout Form Submission
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePlaceOrder();
            });
        }

        // Clear Entire Cart
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear your cart?')) {
                    StorageManager.clearCart();
                    this.renderCart();
                    App.showToast('Cart cleared', 'info');
                }
            });
        }

        // Payment Method Radio Change Listeners
        const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handlePaymentMethodChange(e.target.value);
            });
        });
    },

    handlePaymentMethodChange(method) {
        const upiBox = document.getElementById('upiScannerBox');
        const cardBox = document.getElementById('cardPaymentBox');
        const cashBox = document.getElementById('cashPaymentBox');

        if (method === 'UPI') {
            if (upiBox) upiBox.style.display = 'block';
            if (cardBox) cardBox.style.display = 'none';
            if (cashBox) cashBox.style.display = 'none';
        } else if (method === 'Card') {
            if (upiBox) upiBox.style.display = 'none';
            if (cardBox) cardBox.style.display = 'flex';
            if (cashBox) cashBox.style.display = 'none';
        } else if (method === 'Cash') {
            if (upiBox) upiBox.style.display = 'none';
            if (cardBox) cardBox.style.display = 'none';
            if (cashBox) cashBox.style.display = 'flex';
        }
    },

    renderCart() {
        const cart = StorageManager.getCart();
        const cartItemsContainer = document.getElementById('cartItemsList');
        const emptyState = document.getElementById('emptyCartState');
        const checkoutSection = document.getElementById('checkoutSection');
        const summaryCard = document.getElementById('cartSummaryCard');

        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            if (checkoutSection) checkoutSection.style.display = 'none';
            if (summaryCard) summaryCard.style.display = 'none';
            cartItemsContainer.innerHTML = '';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (checkoutSection) checkoutSection.style.display = 'block';
        if (summaryCard) summaryCard.style.display = 'block';

        // Render Cart Items
        cartItemsContainer.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity;
            return `
                <div class="cart-item-row" data-id="${item.id}">
                    <div class="cart-item-info">
                        <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}" alt="${item.name}" class="cart-thumb">
                        <div>
                            <h4 class="cart-item-title">${item.name}</h4>
                            <span class="cart-item-price">₹${item.price} each</span>
                        </div>
                    </div>

                    <div class="cart-qty-controls">
                        <button type="button" class="qty-btn" onclick="CartController.changeQuantity('${item.id}', -1)" aria-label="Decrease quantity">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <span class="qty-display">${item.quantity}</span>
                        <button type="button" class="qty-btn" onclick="CartController.changeQuantity('${item.id}', 1)" aria-label="Increase quantity">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>

                    <div class="cart-item-total">
                        <strong>₹${itemTotal}</strong>
                    </div>

                    <button type="button" class="cart-remove-btn" onclick="CartController.removeItem('${item.id}')" title="Remove item">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        }).join('');

        this.updateSummary(cart);
    },

    changeQuantity(id, delta) {
        StorageManager.updateCartItemQuantity(id, delta);
        this.renderCart();
    },

    removeItem(id) {
        StorageManager.removeFromCart(id);
        this.renderCart();
        App.showToast('Item removed from cart', 'info');
    },

    updateSummary(cart) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const gst = Math.round(subtotal * 0.05); // 5% GST
        const total = subtotal + gst;

        const subtotalEl = document.getElementById('summarySubtotal');
        const gstEl = document.getElementById('summaryGst');
        const totalEl = document.getElementById('summaryTotal');
        const itemCountEl = document.getElementById('summaryItemCount');

        if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
        if (gstEl) gstEl.textContent = `₹${gst}`;
        if (totalEl) totalEl.textContent = `₹${total}`;
        if (itemCountEl) itemCountEl.textContent = `${StorageManager.getCartItemCount()} items`;

        // Update PhonePe UPI Scanner amount display
        const upiAmountEl = document.getElementById('upiPayAmountDisplay');
        if (upiAmountEl) upiAmountEl.textContent = `₹${total}`;
    },

    /**
     * Form Validation & Order Processing
     */
    handlePlaceOrder() {
        const cart = StorageManager.getCart();
        if (cart.length === 0) {
            App.showToast('Your cart is empty!', 'error');
            return;
        }

        const nameInput = document.getElementById('customerName');
        const phoneInput = document.getElementById('customerPhone');
        const notesInput = document.getElementById('customerNotes');
        const paymentInput = document.querySelector('input[name="paymentMethod"]:checked');
        const upiUtrInput = document.getElementById('upiUtrNumber');

        const nameVal = nameInput ? nameInput.value.trim() : '';
        const phoneVal = phoneInput ? phoneInput.value.trim() : '';
        const notesVal = notesInput ? notesInput.value.trim() : '';
        const paymentVal = paymentInput ? paymentInput.value : '';
        const upiUtrVal = (upiUtrInput && paymentVal === 'UPI') ? upiUtrInput.value.trim() : '';

        // Form Validation
        let hasError = false;

        // Name Validation: Minimum 2 chars, letters and spaces only
        if (!nameVal || nameVal.length < 2) {
            this.showFieldError('customerName', 'Please enter a valid customer name (at least 2 letters)');
            hasError = true;
        } else {
            this.clearFieldError('customerName');
        }

        // Phone Validation: Exactly 10 digits
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneVal || !phoneRegex.test(phoneVal)) {
            this.showFieldError('customerPhone', 'Please enter a valid 10-digit Indian mobile number');
            hasError = true;
        } else {
            this.clearFieldError('customerPhone');
        }

        // Payment Method Validation
        if (!paymentVal) {
            App.showToast('Please select a payment method', 'warning');
            hasError = true;
        }

        if (hasError) {
            App.playSound('alert');
            return;
        }

        // Compute Estimated Waiting Time & Queue Position
        const activeQueue = StorageManager.getQueueItems();
        const waitingOrders = activeQueue.filter(o => o.status === 'Waiting');
        const prepOrders = activeQueue.filter(o => o.status === 'Preparing');
        
        // Position in queue is current waiting count + 1
        const queuePosition = waitingOrders.length + 1;
        // Estimated waiting time: 4 mins per waiting customer + 5 mins base + 2 mins per preparing item
        const estimatedMinutes = queuePosition * 4 + 8;

        // Generate Unique Token
        const tokenNumber = StorageManager.generateNextToken();

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const gst = Math.round(subtotal * 0.05);
        const totalAmount = subtotal + gst;

        const paymentLabel = paymentVal === 'UPI' ? 'PhonePe UPI (Akula Praveen)' : paymentVal;

        // Construct New Order Object
        const newOrder = {
            token: tokenNumber,
            customerName: nameVal,
            customerPhone: phoneVal,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal: subtotal,
            gst: gst,
            totalAmount: totalAmount,
            paymentMethod: paymentLabel,
            upiUtr: upiUtrVal,
            status: 'Waiting', // Initial Status
            createdAt: new Date().toISOString(),
            estimatedTime: estimatedMinutes,
            queuePosition: queuePosition,
            notes: notesVal
        };

        // 1. Enqueue using Queue Class
        const currentQueueList = StorageManager.getQueueItems();
        const orderQueue = new Queue(currentQueueList);
        orderQueue.enqueue(newOrder);
        StorageManager.saveQueueItems(orderQueue.display());

        // 2. Add to active orders list
        const allOrders = StorageManager.getOrders();
        allOrders.push(newOrder);
        StorageManager.saveOrders(allOrders);

        // 3. Add to persistent order history
        StorageManager.addToHistory(newOrder);

        // 4. Empty Cart
        StorageManager.clearCart();

        // 5. Trigger Sound and Toast
        App.playSound('success');
        App.showToast(`✓ Order placed successfully! Token #${tokenNumber} generated`, 'success', 5000);

        // 6. Show Confirmation Modal
        this.showOrderConfirmationModal(newOrder);
    },

    showFieldError(fieldId, errorMsg) {
        const input = document.getElementById(fieldId);
        if (!input) return;
        input.classList.add('input-error');
        
        let errEl = document.getElementById(`${fieldId}Error`);
        if (!errEl) {
            errEl = document.createElement('span');
            errEl.id = `${fieldId}Error`;
            errEl.className = 'field-error-text';
            input.parentElement.appendChild(errEl);
        }
        errEl.textContent = errorMsg;
    },

    clearFieldError(fieldId) {
        const input = document.getElementById(fieldId);
        if (input) input.classList.remove('input-error');
        const errEl = document.getElementById(`${fieldId}Error`);
        if (errEl) errEl.textContent = '';
    },

    showOrderConfirmationModal(order) {
        const modalContainer = document.getElementById('orderConfirmedModal');
        if (!modalContainer) {
            // If modal element isn't in markup, fallback to redirect
            window.location.href = `queue.html?token=${order.token}`;
            return;
        }

        // Populate Modal Fields
        const tokenBadge = document.getElementById('confirmedTokenNumber');
        const customerNameEl = document.getElementById('confirmedCustomerName');
        const queuePosEl = document.getElementById('confirmedQueuePosition');
        const estTimeEl = document.getElementById('confirmedEstTime');
        const statusEl = document.getElementById('confirmedStatus');
        const itemsListEl = document.getElementById('confirmedItemsList');
        const totalAmountEl = document.getElementById('confirmedTotalAmount');
        const paymentEl = document.getElementById('confirmedPayment');

        if (tokenBadge) tokenBadge.textContent = order.token;
        if (customerNameEl) customerNameEl.textContent = order.customerName;
        if (queuePosEl) queuePosEl.textContent = `#${order.queuePosition}`;
        if (estTimeEl) estTimeEl.textContent = `${order.estimatedTime} Minutes`;
        if (statusEl) statusEl.textContent = order.status;
        if (totalAmountEl) totalAmountEl.textContent = `₹${order.totalAmount}`;
        if (paymentEl) {
            paymentEl.textContent = order.upiUtr 
                ? `${order.paymentMethod} (UTR: ${order.upiUtr})` 
                : order.paymentMethod;
        }

        if (itemsListEl) {
            itemsListEl.innerHTML = order.items.map(item => `
                <li class="confirm-item-row">
                    <span>${item.name} &times; ${item.quantity}</span>
                    <span>₹${item.price * item.quantity}</span>
                </li>
            `).join('');
        }

        // Setup Action Buttons
        const viewQueueBtn = document.getElementById('modalViewQueueBtn');
        if (viewQueueBtn) {
            viewQueueBtn.onclick = () => {
                window.location.href = `queue.html?token=${order.token}`;
            };
        }

        App.openModal('orderConfirmedModal');
    }
};

// Initialize if on cart.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cartPageSection')) {
        CartController.init();
    }
});
