# Smart Food Court Queue Management System

A modern, responsive, and robust **Food Court Queue Management System** developed strictly using client-side **HTML5, CSS3, and modern JavaScript (ES6+)**. The system utilizes browser **LocalStorage** for data persistence and implements a **Queue (FIFO - First In, First Out)** data structure to organize and process customer food orders.

---

## 🌟 Key Features

1. **Digital Food Menu (`menu.html`)**
   - 8 Food categories: Burgers, Pizza, South Indian, North Indian, Chinese, Snacks, Beverages, Desserts.
   - Live real-time search by food name or description.
   - Category filtering & Veg / Non-Veg diet filters.
   - Price sorting (Low-to-High, High-to-Low, A-Z).
   - High-resolution dish photos, prices (₹), estimated prep times, and stock indicators.

2. **Cart & Customer Checkout (`cart.html`)**
   - Dynamic cart calculation: increase/decrease quantities, item subtotal, 5% GST, and grand total.
   - Form validation for Customer Name, 10-digit Indian Mobile Number, and Payment Methods (UPI, Card, Cash).
   - Instant Token Generation (`FC101`, `FC102`, `FC103`...).
   - Order confirmation modal with Token Number, Queue Position, and Estimated Waiting Time.

3. **Live Queue Status Board (`queue.html`)**
   - **NOW SERVING (Ready for Pickup):** Spotlight token display with pulsing animation.
   - **PREPARING ORDERS:** Kitchen chef display.
   - **UPCOMING ORDERS:** Waiting queue ordered by arrival.
   - **COMPLETED ORDERS:** History of recently collected orders.
   - **Personal Token Tracker:** Customers can enter their token (or pass `?token=FC101` in the URL) to view live progress through a 4-step stepper (`Order Received` &rarr; `Kitchen Preparing` &rarr; `Ready for Pickup` &rarr; `Completed`).
   - Auto-syncs across browser tabs without manual page refreshes.

4. **Staff Admin Dashboard (`admin.html`)**
   - Live metrics: Total Orders, Pending (Waiting), Preparing, Ready, Completed, and Total Revenue (₹).
   - Order status transitions: `Waiting` &rarr; `Preparing` &rarr; `Ready` &rarr; `Completed` or `Cancelled`.
   - **Queue Data Structure Visualizer:** Interactive educational UI showing FIFO memory nodes (`Front (Peek)` to `Rear`), along with operations buttons (`enqueue`, `dequeue`, `peek`, `isEmpty`, `size`).
   - Search & filter orders by status.
   - Reset Demo Orders & Clear All options for presentations.

5. **Customer Order History (`history.html`)**
   - Displays all historical orders with Token, Date, Items, Amount, and Payment Method.
   - Digital thermal receipt generator with a print button.
   - One-click "Re-order" to reload prior items into the cart.

6. **Web Audio Sound Effects**
   - Zero external audio files required! Synthesizes pleasant interface chimes and alerts using the native HTML5 Web Audio API.

---

## 📂 Project Structure

```text
Food-Court-Queue-System/
│
├── index.html          # Landing page with hero, process flow, and popular items
├── menu.html           # Full food menu with search, category & diet filters
├── cart.html           # Shopping cart, checkout form, and order confirmation modal
├── queue.html          # Live queue status display and personal token tracker
├── history.html        # Customer order history and printable receipts
├── admin.html          # Staff dashboard, order status controls & Queue visualizer
├── about.html          # Project documentation, CS concepts, and contact form
├── README.md           # Instructions, documentation, and architecture
│
├── css/
│   └── style.css       # Complete responsive styling, custom animations & theme
│
├── js/
│   ├── storage.js      # LocalStorage persistence, seed catalog & token generator
│   ├── queue.js        # Queue Class (FIFO) and queue display board controller
│   ├── app.js          # Shared framework: Toasts, audio chimes, navbar & history
│   ├── menu.js         # Menu filtering, search, sorting & cart actions
│   ├── cart.js         # Cart operations, form validation & token creation
│   └── admin.js        # Kitchen operations, status updates & queue visualizer
│
└── assets/
    └── images/         # Project image assets
```

---

## 💻 Computer Science Concept: Queue Data Structure (FIFO)

Implemented in `js/queue.js`:

```javascript
class Queue {
    constructor(items = []) {
        this.items = [...items];
    }

    // Enqueue: Add order to the rear of the queue
    enqueue(item) {
        this.items.push(item);
    }

    // Dequeue: Remove front order when completed
    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift();
    }

    // Peek: Inspect current order being served without removing
    peek() {
        if (this.isEmpty()) return null;
        return this.items[0];
    }

    // IsEmpty: Check if queue has no pending orders
    isEmpty() {
        return this.items.length === 0;
    }

    // Size: Return number of waiting orders
    size() {
        return this.items.length;
    }

    // Display: Return shallow copy of all elements
    display() {
        return [...this.items];
    }
}
```

---

## 🗄️ LocalStorage Schema

| Key | Type | Description |
| --- | --- | --- |
| `foodCart` | Array | Current items in customer's cart |
| `orders` | Array | All active orders with statuses (`Waiting`, `Preparing`, `Ready`, `Completed`) |
| `queue` | Array | Orders currently in the active FIFO queue |
| `tokenNumber` | String | Auto-incrementing counter (`101`, `102`...) |
| `orderHistory` | Array | Complete historical archive of all orders |

---

## 🚀 How to Run the Project

1. **Direct Browser Execution:**
   - Double-click `index.html` in Windows Explorer or right-click `index.html` and choose **Open with &rarr; Google Chrome / Microsoft Edge / Firefox**.
   - No installation, Node.js, Python, or web server is required.

2. **Using VS Code Live Server (Optional):**
   - Open this project folder in Visual Studio Code.
   - Right-click `index.html` and select **"Open with Live Server"**.
   - The application will open at `http://127.0.0.1:5500/index.html`.

3. **Testing Real-Time Multi-Screen Workflow:**
   - Open `queue.html` in one tab/browser window.
   - Open `admin.html` in a second tab/browser window.
   - Open `cart.html` in a third tab and place an order.
   - Observe how the new token immediately appears on the Admin Kitchen table and the Live Queue board in real time!
