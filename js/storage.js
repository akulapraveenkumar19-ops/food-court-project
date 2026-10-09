/**
 * Food Court Queue Management System
 * storage.js - LocalStorage management & initial seed data
 */

// LocalStorage Keys required by prompt
const STORAGE_KEYS = {
    CART: 'foodCart',
    ORDERS: 'orders',
    QUEUE: 'queue',
    TOKEN: 'tokenNumber',
    HISTORY: 'orderHistory'
};

// Initial Catalog of Food Items
const FOOD_CATALOG = [
    // Gourmet Toasts (As featured in reference design)
    {
        id: 't1',
        name: 'Avocado Sourdough Toast',
        category: 'Snacks',
        price: 525,
        description: 'Fresh avocado slices, olives and cherry tomatoes confit, feta cheese, walnut served on sourdough toast, drizzle of spicy and basil oil.',
        isVeg: true,
        isAvailable: true,
        prepTime: 8,
        rating: 4.9,
        ratingCount: 8,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 't2',
        name: 'Truffle Scrambled Egg Toast',
        category: 'Snacks',
        price: 445,
        description: 'Creamy scrambled egg on sourdough toast, drizzle of truffle oil and jalapenos and fresh organic red chili, arugula and parmesan shavings.',
        isVeg: false,
        isAvailable: true,
        prepTime: 10,
        rating: 4.8,
        ratingCount: 14,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 't3',
        name: 'Grilled Chicken Toast',
        category: 'Snacks',
        price: 495,
        description: 'Bell pepper coulis, paprika grilled chicken, fresh jalapenos and cherry tomatoes on sourdough toast, drizzle of lavender honey.',
        isVeg: false,
        isAvailable: true,
        prepTime: 10,
        rating: 4.7,
        ratingCount: 4,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80'
    },

    // Burgers
    {
        id: 'b1',
        name: 'Chicken Burger',
        category: 'Burgers',
        price: 120,
        description: 'Crispy fried chicken patty, lettuce, cheese slice & special mayo in toasted sesame bun.',
        isVeg: false,
        isAvailable: true,
        prepTime: 10,
        rating: 4.8,
        ratingCount: 42,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'b2',
        name: 'Veg Burger',
        category: 'Burgers',
        price: 90,
        description: 'Golden spiced potato & veggie patty topped with fresh tomatoes, onions & tangy sauce.',
        isVeg: true,
        isAvailable: true,
        prepTime: 8,
        rating: 4.6,
        ratingCount: 28,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'b3',
        name: 'Paneer Tikka Burger',
        category: 'Burgers',
        price: 130,
        description: 'Grilled tandoori paneer slice layered with mint chutney, onion rings and melted cheese.',
        isVeg: true,
        isAvailable: true,
        prepTime: 12,
        rating: 4.9,
        ratingCount: 31,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80'
    },

    // Pizza
    {
        id: 'p1',
        name: 'Chicken Pizza',
        category: 'Pizza',
        price: 250,
        description: 'Hand-tossed crust loaded with BBQ chicken chunks, capsicum, olives & gooey mozzarella.',
        isVeg: false,
        isAvailable: true,
        prepTime: 15,
        rating: 4.9,
        ratingCount: 56,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'p2',
        name: 'Veg Margherita Pizza',
        category: 'Pizza',
        price: 200,
        description: 'Classic Italian pizza with rich San Marzano tomato sauce, fresh mozzarella & basil.',
        isVeg: true,
        isAvailable: true,
        prepTime: 12,
        rating: 4.8,
        ratingCount: 39,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'p3',
        name: 'Farmhouse Veggie Pizza',
        category: 'Pizza',
        price: 230,
        description: 'Topped with mushrooms, sweet corn, crisp bell peppers, red onions and extra cheese.',
        isVeg: true,
        isAvailable: true,
        prepTime: 14,
        rating: 4.7,
        ratingCount: 22,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80'
    },

    // South Indian
    {
        id: 's1',
        name: 'Masala Dosa',
        category: 'South Indian',
        price: 80,
        description: 'Crispy fermented crepe filled with spiced potato masala, served with 3 chutneys & piping hot sambar.',
        isVeg: true,
        isAvailable: true,
        prepTime: 8,
        rating: 4.9,
        ratingCount: 64,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 's2',
        name: 'Steamed Idli (2 Pcs)',
        category: 'South Indian',
        price: 50,
        description: 'Steamed fluffy rice & lentil cakes served with traditional drumstick sambar and fresh coconut chutney.',
        isVeg: true,
        isAvailable: true,
        prepTime: 5,
        rating: 4.8,
        ratingCount: 45,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 's3',
        name: 'Medu Vada (2 Pcs)',
        category: 'South Indian',
        price: 60,
        description: 'Crispy golden fried black lentil fritters spiced with peppercorns, curry leaves and ginger.',
        isVeg: true,
        isAvailable: true,
        prepTime: 6,
        rating: 4.7,
        ratingCount: 33,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80'
    },

    // North Indian
    {
        id: 'n1',
        name: 'Chicken Biryani',
        category: 'North Indian',
        price: 180,
        description: 'Fragrant basmati rice layered with tender marinated chicken, saffron, brown onions & served with raita.',
        isVeg: false,
        isAvailable: true,
        prepTime: 10,
        rating: 4.9,
        ratingCount: 88,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'n2',
        name: 'Paneer Butter Masala with 2 Naan',
        category: 'North Indian',
        price: 190,
        description: 'Succulent paneer cubes simmered in a creamy, velvety tomato-butter gravy with butter naan.',
        isVeg: true,
        isAvailable: true,
        prepTime: 12,
        rating: 4.8,
        ratingCount: 52,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'n3',
        name: 'Chole Bhature',
        category: 'North Indian',
        price: 120,
        description: 'Spicy Punjabi chickpea curry served with two puffy golden bhaturas, pickled onions and fried chili.',
        isVeg: true,
        isAvailable: true,
        prepTime: 8,
        rating: 4.7,
        ratingCount: 40,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80'
    },

    // Chinese
    {
        id: 'c1',
        name: 'Veg Fried Rice',
        category: 'Chinese',
        price: 120,
        description: 'Wok-tossed long-grain rice with diced carrots, beans, spring onion and light soya seasoning.',
        isVeg: true,
        isAvailable: true,
        prepTime: 9,
        rating: 4.6,
        ratingCount: 30,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'c2',
        name: 'Hakka Noodles',
        category: 'Chinese',
        price: 110,
        description: 'Street-style stir fried wheat noodles with shredded cabbage, capsicum, carrots and chili oil.',
        isVeg: true,
        isAvailable: true,
        prepTime: 8,
        rating: 4.8,
        ratingCount: 41,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'c3',
        name: 'Veg Manchurian Dry',
        category: 'Chinese',
        price: 130,
        description: 'Crispy mixed vegetable dumplings tossed in garlic, ginger, soya sauce and fiery green chilies.',
        isVeg: true,
        isAvailable: true,
        prepTime: 10,
        rating: 4.7,
        ratingCount: 29,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80'
    },

    // Snacks
    {
        id: 'sn1',
        name: 'French Fries',
        category: 'Snacks',
        price: 80,
        description: 'Golden salted crisp potato fries served with creamy cheese dip and sweet tomato ketchup.',
        isVeg: true,
        isAvailable: true,
        prepTime: 6,
        rating: 4.6,
        ratingCount: 50,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'sn2',
        name: 'Peri Peri Fries',
        category: 'Snacks',
        price: 95,
        description: 'Crunchy fries dusted generously with zesty African bird’s eye chili spice mix.',
        isVeg: true,
        isAvailable: true,
        prepTime: 6,
        rating: 4.8,
        ratingCount: 37,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'sn3',
        name: 'Samosa Platter (2 Pcs)',
        category: 'Snacks',
        price: 50,
        description: 'Crisp pastry triangles stuffed with spiced potatoes and peas, served with sweet tamarind & mint chutney.',
        isVeg: true,
        isAvailable: true,
        prepTime: 4,
        rating: 4.9,
        ratingCount: 48,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
    },

    // Beverages
    {
        id: 'bv1',
        name: 'Coke (330ml)',
        category: 'Beverages',
        price: 40,
        description: 'Chilled refreshing Coca-Cola can served with ice and lemon wedge.',
        isVeg: true,
        isAvailable: true,
        prepTime: 2,
        rating: 4.5,
        ratingCount: 20,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'bv2',
        name: 'Cold Coffee with Ice Cream',
        category: 'Beverages',
        price: 90,
        description: 'Rich blended creamy espresso shake crowned with a scoop of vanilla ice cream and chocolate drizzle.',
        isVeg: true,
        isAvailable: true,
        prepTime: 5,
        rating: 4.8,
        ratingCount: 34,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'bv3',
        name: 'Fresh Mango Lassi',
        category: 'Beverages',
        price: 75,
        description: 'Thick traditional chilled sweet yogurt smoothie infused with Alphonso mango pulp and cardamom.',
        isVeg: true,
        isAvailable: true,
        prepTime: 4,
        rating: 4.9,
        ratingCount: 26,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80'
    },

    // Desserts
    {
        id: 'd1',
        name: 'Vanilla Ice Cream Sundae',
        category: 'Desserts',
        price: 70,
        description: 'Double scoop rich vanilla bean ice cream drenched in warm fudge sauce and roasted almonds.',
        isVeg: true,
        isAvailable: true,
        prepTime: 3,
        rating: 4.7,
        ratingCount: 19,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'd2',
        name: 'Hot Gulab Jamun (2 Pcs)',
        category: 'Desserts',
        price: 60,
        description: 'Soft melt-in-the-mouth khoya balls soaked in warm rose and cardamom scented sugar syrup.',
        isVeg: true,
        isAvailable: true,
        prepTime: 3,
        rating: 4.9,
        ratingCount: 42,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'd3',
        name: 'Chocolate Brownie with Ice Cream',
        category: 'Desserts',
        price: 110,
        description: 'Fudgy walnut dark chocolate brownie served warm with a scoop of vanilla ice cream.',
        isVeg: true,
        isAvailable: true,
        prepTime: 4,
        rating: 4.8,
        ratingCount: 38,
        isBestseller: true,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80'
    }
];

// Initial Demo Seed Orders to immediately show queue status & admin functionality
const DEMO_ORDERS = [
    {
        token: 'FC101',
        customerName: 'Rahul Sharma',
        customerPhone: '9876543210',
        items: [
            { id: 'b1', name: 'Chicken Burger', price: 120, quantity: 1 }
        ],
        totalAmount: 126,
        paymentMethod: 'UPI',
        status: 'Preparing',
        createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        estimatedTime: 10,
        notes: 'Less spicy'
    },
    {
        token: 'FC102',
        customerName: 'Priya Patel',
        customerPhone: '9812345678',
        items: [
            { id: 'p1', name: 'Chicken Pizza', price: 250, quantity: 1 }
        ],
        totalAmount: 262,
        paymentMethod: 'Card',
        status: 'Preparing',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        estimatedTime: 15,
        notes: 'Extra cheese'
    },
    {
        token: 'FC103',
        customerName: 'Arjun Verma',
        customerPhone: '9945678123',
        items: [
            { id: 's1', name: 'Masala Dosa', price: 80, quantity: 1 },
            { id: 'bv1', name: 'Coke (330ml)', price: 40, quantity: 1 }
        ],
        totalAmount: 126,
        paymentMethod: 'Cash',
        status: 'Waiting',
        createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        estimatedTime: 12,
        notes: ''
    },
    {
        token: 'FC104',
        customerName: 'Neha Reddy',
        customerPhone: '9789012345',
        items: [
            { id: 'n1', name: 'Chicken Biryani', price: 180, quantity: 1 },
            { id: 'd1', name: 'Vanilla Ice Cream Sundae', price: 70, quantity: 1 }
        ],
        totalAmount: 262,
        paymentMethod: 'UPI',
        status: 'Waiting',
        createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        estimatedTime: 18,
        notes: 'Double raita'
    }
];

const DEMO_HISTORY = [
    {
        token: 'FC099',
        customerName: 'Vikram Joshi',
        customerPhone: '9822334455',
        items: [
            { id: 'b2', name: 'Veg Burger', price: 90, quantity: 2 },
            { id: 'sn1', name: 'French Fries', price: 80, quantity: 1 },
            { id: 'bv1', name: 'Coke (330ml)', price: 40, quantity: 2 }
        ],
        totalAmount: 357,
        paymentMethod: 'Card',
        status: 'Completed',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        estimatedTime: 15,
        completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
        token: 'FC100',
        customerName: 'Ananya Roy',
        customerPhone: '9711223344',
        items: [
            { id: 'c1', name: 'Veg Fried Rice', price: 120, quantity: 1 },
            { id: 'c3', name: 'Veg Manchurian Dry', price: 130, quantity: 1 }
        ],
        totalAmount: 262,
        paymentMethod: 'UPI',
        status: 'Completed',
        createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        estimatedTime: 15,
        completedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
    }
];

/**
 * Storage Manager Helper
 */
const StorageManager = {
    // Initialize LocalStorage with starter data if absent
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.TOKEN)) {
            localStorage.setItem(STORAGE_KEYS.TOKEN, '104');
        }

        if (!localStorage.getItem(STORAGE_KEYS.CART)) {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        }

        if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEMO_ORDERS));
        }

        if (!localStorage.getItem(STORAGE_KEYS.QUEUE)) {
            // Queue holds active tokens/order objects that are not yet Completed/Cancelled
            const activeQueue = DEMO_ORDERS.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
            localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(activeQueue));
        }

        if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
            // History holds all completed + demo history
            const history = [...DEMO_ORDERS, ...DEMO_HISTORY];
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
        }
    },

    // Food Catalog
    getCatalog() {
        return FOOD_CATALOG;
    },

    getItemById(id) {
        return FOOD_CATALOG.find(item => item.id === id);
    },

    // Cart Methods
    getCart() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
        } catch (e) {
            return [];
        }
    },

    saveCart(cart) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: this.getCartItemCount() } }));
    },

    addToCart(item, quantity = 1) {
        const cart = this.getCart();
        const existingIndex = cart.findIndex(c => c.id === item.id);
        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.category,
                image: item.image,
                isVeg: item.isVeg,
                quantity: quantity
            });
        }
        this.saveCart(cart);
        return cart;
    },

    updateCartItemQuantity(id, delta) {
        let cart = this.getCart();
        const index = cart.findIndex(item => item.id === id);
        if (index > -1) {
            cart[index].quantity += delta;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            this.saveCart(cart);
        }
        return cart;
    },

    removeFromCart(id) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== id);
        this.saveCart(cart);
        return cart;
    },

    clearCart() {
        this.saveCart([]);
    },

    getCartItemCount() {
        const cart = this.getCart();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    getCartSubtotal() {
        const cart = this.getCart();
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    // Orders Methods
    getOrders() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
        } catch (e) {
            return [];
        }
    },

    saveOrders(orders) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: { orders } }));
    },

    getOrder(token) {
        const orders = this.getOrders();
        return orders.find(o => o.token.toUpperCase() === token.toUpperCase());
    },

    // Queue Methods
    getQueueItems() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUEUE)) || [];
        } catch (e) {
            return [];
        }
    },

    saveQueueItems(items) {
        localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('queueUpdated', { detail: { items } }));
    },

    // Token Number Generator: FC101, FC102, FC103...
    generateNextToken() {
        let current = parseInt(localStorage.getItem(STORAGE_KEYS.TOKEN) || '100', 10);
        if (isNaN(current) || current < 100) current = 100;
        const next = current + 1;
        localStorage.setItem(STORAGE_KEYS.TOKEN, next.toString());
        return `FC${next}`;
    },

    // Order History Methods
    getOrderHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
        } catch (e) {
            return [];
        }
    },

    saveOrderHistory(history) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    },

    addToHistory(order) {
        const history = this.getOrderHistory();
        const existingIdx = history.findIndex(h => h.token === order.token);
        if (existingIdx > -1) {
            history[existingIdx] = order;
        } else {
            history.unshift(order);
        }
        this.saveOrderHistory(history);
    },

    // Reset everything to default demo data
    resetDemoData() {
        localStorage.setItem(STORAGE_KEYS.TOKEN, '104');
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEMO_ORDERS));
        const activeQueue = DEMO_ORDERS.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
        localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(activeQueue));
        const history = [...DEMO_ORDERS, ...DEMO_HISTORY];
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
        window.dispatchEvent(new CustomEvent('dataReset'));
    },

    // Clear all active orders and queue
    clearAllData() {
        localStorage.setItem(STORAGE_KEYS.TOKEN, '100');
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
        window.dispatchEvent(new CustomEvent('dataReset'));
    }
};

// Initialize on file load
StorageManager.init();
