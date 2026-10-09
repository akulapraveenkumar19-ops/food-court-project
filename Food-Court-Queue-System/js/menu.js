/**
 * Food Court Queue Management System
 * menu.js - Swiggy / Zomato Restaurant Menu Layout & Real-Time Cart Floating Bar
 */

const MenuController = {
    currentCategory: 'All',
    currentDiet: 'all',
    searchQuery: '',
    sortBy: 'default',
    viewMode: 'list', // 'list' matches user reference image, 'grid' optional
    items: [],

    init() {
        this.items = StorageManager.getCatalog();
        this.renderCategoryFilters();
        this.bindEvents();
        this.renderMenuItems();
        this.updateFloatingCartBar();

        // Listen for cart changes
        window.addEventListener('cartUpdated', () => {
            this.updateFloatingCartBar();
            this.renderMenuItems();
        });
        window.addEventListener('storage', () => {
            this.updateFloatingCartBar();
            this.renderMenuItems();
        });
    },

    bindEvents() {
        // Search Input
        const searchInput = document.getElementById('menuSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderMenuItems();
            });
        }

        // Sort By Select
        const sortSelect = document.getElementById('menuSortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.renderMenuItems();
            });
        }

        // Diet Filter Buttons
        const dietPills = document.querySelectorAll('.diet-filter-btn');
        dietPills.forEach(pill => {
            pill.addEventListener('click', () => {
                dietPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.currentDiet = pill.getAttribute('data-diet');
                this.renderMenuItems();
            });
        });

        // View Mode Switcher
        const viewToggleBtn = document.getElementById('viewModeToggleBtn');
        if (viewToggleBtn) {
            viewToggleBtn.addEventListener('click', () => {
                this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
                viewToggleBtn.innerHTML = this.viewMode === 'list'
                    ? '<i class="fa-solid fa-table-cells-large"></i> Grid View'
                    : '<i class="fa-solid fa-list-ul"></i> List View';
                this.renderMenuItems();
            });
        }

        // Floating MENU FAB button
        const menuFab = document.getElementById('floatingMenuFab');
        const jumpModal = document.getElementById('categoryJumpModal');
        const jumpClose = document.getElementById('closeCategoryJumpBtn');

        if (menuFab && jumpModal) {
            menuFab.addEventListener('click', () => {
                jumpModal.classList.add('active');
            });
        }
        if (jumpClose && jumpModal) {
            jumpClose.addEventListener('click', () => {
                jumpModal.classList.remove('active');
            });
        }
        if (jumpModal) {
            jumpModal.addEventListener('click', (e) => {
                if (e.target === jumpModal) {
                    jumpModal.classList.remove('active');
                }
            });
        }

        // Quick Category from URL parameter if any
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            this.currentCategory = categoryParam;
        }
    },

    renderCategoryFilters() {
        const categoriesContainer = document.getElementById('categoryFilters');
        const jumpListContainer = document.getElementById('categoryJumpList');

        const categories = [
            { name: 'All', icon: 'fa-solid fa-utensils' },
            { name: 'Snacks', icon: 'fa-solid fa-cookie-bite' },
            { name: 'Burgers', icon: 'fa-solid fa-burger' },
            { name: 'Pizza', icon: 'fa-solid fa-pizza-slice' },
            { name: 'South Indian', icon: 'fa-solid fa-bowl-rice' },
            { name: 'North Indian', icon: 'fa-solid fa-plate-wheat' },
            { name: 'Chinese', icon: 'fa-solid fa-bowl-food' },
            { name: 'Beverages', icon: 'fa-solid fa-mug-hot' },
            { name: 'Desserts', icon: 'fa-solid fa-ice-cream' }
        ];

        if (categoriesContainer) {
            categoriesContainer.innerHTML = categories.map(cat => `
                <button class="category-pill ${cat.name.toLowerCase() === this.currentCategory.toLowerCase() ? 'active' : ''}" 
                        data-category="${cat.name}">
                    <i class="${cat.icon}"></i>
                    <span>${cat.name}</span>
                </button>
            `).join('');

            // Category click events
            categoriesContainer.querySelectorAll('.category-pill').forEach(btn => {
                btn.addEventListener('click', () => {
                    categoriesContainer.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentCategory = btn.getAttribute('data-category');
                    this.renderMenuItems();
                });
            });
        }

        // Render inside Floating MENU quick sheet
        if (jumpListContainer) {
            const allItems = StorageManager.getCatalog();
            jumpListContainer.innerHTML = categories.map(cat => {
                const count = cat.name === 'All' 
                    ? allItems.length 
                    : allItems.filter(i => i.category.toLowerCase() === cat.name.toLowerCase()).length;
                return `
                    <div class="category-jump-item" onclick="MenuController.selectCategoryFromJump('${cat.name}')">
                        <span><i class="${cat.icon}" style="margin-right: 8px;"></i> ${cat.name}</span>
                        <span class="text-muted small">${count} items</span>
                    </div>
                `;
            }).join('');
        }
    },

    selectCategoryFromJump(catName) {
        this.currentCategory = catName;
        const pills = document.querySelectorAll('.category-pill');
        pills.forEach(p => {
            if (p.getAttribute('data-category').toLowerCase() === catName.toLowerCase()) {
                p.classList.add('active');
                p.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                p.classList.remove('active');
            }
        });

        const jumpModal = document.getElementById('categoryJumpModal');
        if (jumpModal) jumpModal.classList.remove('active');

        this.renderMenuItems();
    },

    getFilteredItems() {
        return this.items.filter(item => {
            // Category filter
            const matchCategory = (this.currentCategory === 'All') || 
                (item.category.toLowerCase() === this.currentCategory.toLowerCase());

            // Diet filter
            let matchDiet = true;
            if (this.currentDiet === 'veg') matchDiet = item.isVeg === true;
            if (this.currentDiet === 'nonveg') matchDiet = item.isVeg === false;

            // Search filter
            const matchSearch = !this.searchQuery || 
                item.name.toLowerCase().includes(this.searchQuery) || 
                item.description.toLowerCase().includes(this.searchQuery) ||
                item.category.toLowerCase().includes(this.searchQuery);

            return matchCategory && matchDiet && matchSearch;
        }).sort((a, b) => {
            if (this.sortBy === 'price-low') return a.price - b.price;
            if (this.sortBy === 'price-high') return b.price - a.price;
            if (this.sortBy === 'name-asc') return a.name.localeCompare(b.name);
            return 0; // Default
        });
    },

    renderMenuItems() {
        const container = document.getElementById('foodCardsGrid');
        const countDisplay = document.getElementById('itemCountDisplay');
        if (!container) return;

        const filtered = this.getFilteredItems();
        const cart = StorageManager.getCart();

        if (countDisplay) {
            countDisplay.textContent = `Showing ${filtered.length} item${filtered.length === 1 ? '' : 's'}`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <h3>No Food Items Found</h3>
                    <p>We couldn't find any dish matching your filter or search criteria.</p>
                    <button class="btn btn-outline" onclick="MenuController.resetFilters()">
                        <i class="fa-solid fa-rotate-left"></i> Reset Filters
                    </button>
                </div>
            `;
            return;
        }

        // 1. DEFAULT LIST VIEW: Matching the user's reference image exactly!
        if (this.viewMode === 'list') {
            container.className = 'swiggy-menu-wrapper';
            container.innerHTML = `
                <div class="swiggy-category-title">
                    <span>${this.currentCategory} Specials</span>
                    <span class="swiggy-category-count">${filtered.length} items</span>
                </div>
                ${filtered.map(item => {
                    const cartItem = cart.find(c => c.id === item.id);
                    const qty = cartItem ? cartItem.quantity : 0;

                    return `
                        <div class="swiggy-item-row" data-id="${item.id}">
                            <!-- Left: Details Column -->
                            <div class="swiggy-item-details">
                                <div class="swiggy-badges-line">
                                    <span class="badge-diet-icon ${item.isVeg ? 'veg' : 'nonveg'}" title="${item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}">
                                        <span class="dot"></span>
                                    </span>
                                    ${item.isBestseller ? `
                                        <span class="badge-bestseller">
                                            <i class="fa-solid fa-star"></i> Bestseller
                                        </span>
                                    ` : ''}
                                </div>

                                <h3 class="swiggy-item-name">${item.name}</h3>
                                <span class="swiggy-item-price">₹${item.price}</span>

                                <div class="swiggy-rating-line">
                                    <span class="rating-star-text">
                                        <i class="fa-solid fa-star"></i> ${item.rating || '4.8'}
                                    </span>
                                    <span class="rating-count-text">(${item.ratingCount || '12'})</span>
                                </div>

                                <p class="swiggy-item-desc">${item.description}</p>
                            </div>

                            <!-- Right: Media & ADD Button Column (Overlapping bottom) -->
                            <div class="swiggy-item-media">
                                <div class="swiggy-img-box">
                                    <img src="${item.image}" alt="${item.name}" loading="lazy" 
                                         onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'">
                                </div>
                                <div class="swiggy-add-btn-wrap">
                                    ${qty === 0 ? `
                                        <button class="swiggy-add-btn" onclick="MenuController.handleAddToCart('${item.id}')" ${!item.isAvailable ? 'disabled' : ''}>
                                            ADD
                                        </button>
                                    ` : `
                                        <div class="swiggy-qty-stepper">
                                            <button onclick="MenuController.changeItemQty('${item.id}', -1)" aria-label="Decrease">&minus;</button>
                                            <span class="swiggy-qty-val">${qty}</span>
                                            <button onclick="MenuController.changeItemQty('${item.id}', 1)" aria-label="Increase">&plus;</button>
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        } else {
            // 2. GRID CARD VIEW (Alternative View)
            container.className = 'food-cards-grid';
            container.innerHTML = filtered.map(item => `
                <div class="food-card" data-id="${item.id}">
                    <div class="food-card-img-wrapper">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                        <span class="diet-tag ${item.isVeg ? 'veg' : 'non-veg'}">
                            <span class="diet-dot"></span>
                        </span>
                        <span class="category-tag">${item.category}</span>
                    </div>
                    <div class="food-card-content">
                        <div class="food-header">
                            <h3 class="food-title">${item.name}</h3>
                            <span class="food-price">₹${item.price}</span>
                        </div>
                        <p class="food-desc">${item.description}</p>
                        <div class="food-meta">
                            <span class="prep-pill"><i class="fa-regular fa-clock"></i> ~${item.prepTime} mins</span>
                            <span class="stock-pill ${item.isAvailable ? 'in-stock' : 'out-of-stock'}">
                                ${item.isAvailable ? '<i class="fa-solid fa-check"></i> Available' : '<i class="fa-solid fa-ban"></i> Out of Stock'}
                            </span>
                        </div>
                        <div class="food-card-actions">
                            <button class="btn btn-primary add-to-cart-btn" onclick="MenuController.handleAddToCart('${item.id}')" ${!item.isAvailable ? 'disabled' : ''}>
                                <i class="fa-solid fa-plus"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    },

    handleAddToCart(itemId) {
        const item = StorageManager.getItemById(itemId);
        if (!item) return;

        StorageManager.addToCart(item, 1);
        App.showToast(`✓ Added "${item.name}" to cart!`, 'success');
        this.renderMenuItems();
        this.updateFloatingCartBar();
    },

    changeItemQty(itemId, delta) {
        StorageManager.updateCartItemQuantity(itemId, delta);
        this.renderMenuItems();
        this.updateFloatingCartBar();
    },

    /**
     * Floating Solid Green Bottom Cart Bar
     * Matching the exact reference banner at the bottom of the user's screenshot
     */
    updateFloatingCartBar() {
        const bar = document.getElementById('floatingBottomCartBar');
        const itemCountText = document.getElementById('floatingCartItemCount');
        if (!bar) return;

        const count = StorageManager.getCartItemCount();

        if (count > 0) {
            bar.classList.remove('hidden');
            if (itemCountText) {
                itemCountText.textContent = `${count} item${count > 1 ? 's' : ''} added`;
            }
        } else {
            bar.classList.add('hidden');
        }
    },

    resetFilters() {
        this.currentCategory = 'All';
        this.currentDiet = 'all';
        this.searchQuery = '';
        this.sortBy = 'default';

        const searchInput = document.getElementById('menuSearchInput');
        if (searchInput) searchInput.value = '';

        const sortSelect = document.getElementById('menuSortSelect');
        if (sortSelect) sortSelect.value = 'default';

        const dietPills = document.querySelectorAll('.diet-filter-btn');
        dietPills.forEach(p => p.classList.remove('active'));
        const allDietPill = document.querySelector('.diet-filter-btn[data-diet="all"]');
        if (allDietPill) allDietPill.classList.add('active');

        this.renderCategoryFilters();
        this.renderMenuItems();
    }
};

// Initialize on DOM load if on menu page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('menuPageSection')) {
        MenuController.init();
    }
});
