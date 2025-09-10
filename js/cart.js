  // Cart functionality
    document.addEventListener('DOMContentLoaded', function() {
      // Cart storage key
      const CART_KEY = 'grimhide_cart_v1';
      
      // Load cart from localStorage
      function loadCart() {
        try {
          const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
          return Array.isArray(cart) ? cart : [];
        } catch (e) {
          console.error('Error loading cart:', e);
          return [];
        }
      }
      
      // Save cart to localStorage
      function saveCart(cart) {
        try {
          localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) {
          console.error('Error saving cart:', e);
        }
      }
      
      // Format currency
      function formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
      }
      
      // Render cart items
      function renderCartItems() {
        const cart = loadCart();
        const cartItemsContainer = document.getElementById('cartItems');
        const cartCountEl = document.getElementById('cartCount');
        const subtotalEl = document.getElementById('subtotal');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');
        
        // Update cart count
        const itemCount = cart.reduce((total, item) => total + item.qty, 0);
        cartCountEl.textContent = itemCount;
        
        if (cart.length === 0) {
          cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
              <i class="fas fa-shopping-cart"></i>
              <h3>Your cart is empty</h3>
              <p>Add some premium leather goods to your cart</p>
              <a href="products.html" class="btn primary">Continue Shopping</a>
            </div>
          `;
          subtotalEl.textContent = formatCurrency(0);
          taxEl.textContent = formatCurrency(0);
          totalEl.textContent = formatCurrency(0);
          return;
        }
        
        // Clear container
        cartItemsContainer.innerHTML = '';
        
        // Calculate totals
        let subtotal = 0;
        
        // Render each item
        cart.forEach(item => {
          const itemTotal = item.price * item.qty;
          subtotal += itemTotal;
          
          const cartItem = document.createElement('div');
          cartItem.className = 'cart-item';
          cartItem.innerHTML = `
            <div class="cart-item-img">
              <img src="${item.img}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
              <div class="cart-item-header">
                <div>
                  <h3 class="cart-item-name">${item.name}</h3>
                  <div class="cart-item-price">${formatCurrency(item.price)}</div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="cart-item-controls">
                <div class="quantity-control">
                  <button class="quantity-btn dec" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                  <span class="quantity-value">${item.qty}</span>
                  <button class="quantity-btn inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
                <div class="cart-item-total">${formatCurrency(itemTotal)}</div>
              </div>
            </div>
          `;
          
          cartItemsContainer.appendChild(cartItem);
        });
        
        // Calculate tax and total
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + tax;
        
        // Update summary
        subtotalEl.textContent = formatCurrency(subtotal);
        taxEl.textContent = formatCurrency(tax);
        totalEl.textContent = formatCurrency(total);
        
        // Add event listeners
        document.querySelectorAll('.cart-item-remove').forEach(button => {
          button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removeFromCart(id);
          });
        });
        
        document.querySelectorAll('.quantity-btn.dec').forEach(button => {
          button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            updateQuantity(id, -1);
          });
        });
        
        document.querySelectorAll('.quantity-btn.inc').forEach(button => {
          button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            updateQuantity(id, 1);
          });
        });
      }
      
      // Remove item from cart
      function removeFromCart(id) {
        let cart = loadCart();
        cart = cart.filter(item => item.id !== id);
        saveCart(cart);
        renderCartItems();
      }
      
      // Update item quantity
      function updateQuantity(id, change) {
        const cart = loadCart();
        const item = cart.find(item => item.id === id);
        
        if (item) {
          item.qty += change;
          
          // Remove item if quantity is 0 or less
          if (item.qty <= 0) {
            removeFromCart(id);
            return;
          }
          
          saveCart(cart);
          renderCartItems();
        }
      }
      
      // Apply promo code
      document.getElementById('applyPromo').addEventListener('click', function() {
        const promoCode = document.getElementById('promoCode').value.trim();
        if (promoCode) {
          alert(`Promo code "${promoCode}" applied successfully!`);
          document.getElementById('promoCode').value = '';
        } else {
          alert('Please enter a promo code');
        }
      });
      
      // Checkout button handler
      document.getElementById('checkoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        const cart = loadCart();
        if (cart.length > 0) {
          window.location.href = 'checkout.html';
        } else {
          alert('Your cart is empty!');
        }
      });
      
      // Mobile menu toggle
      const hamburger = document.getElementById('hamburger');
      const mnav = document.getElementById('mnav');
      
      if (hamburger && mnav) {
        hamburger.addEventListener('click', () => {
          const open = mnav.classList.toggle('open');
          hamburger.setAttribute('aria-expanded', String(open));
        });
      }
      
      // Initialize cart
      renderCartItems();
    });