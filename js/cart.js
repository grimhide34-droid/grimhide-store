document.addEventListener('DOMContentLoaded', function() {
  // Use the same key as in your main.js/product-detail.js for consistency
  const CART_KEY = 'grimhide_cart'; // Updated key for consistency
  let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  
  // DOM Elements
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartCountEl = document.getElementById('cartCount');
  const itemCountEl = document.getElementById('itemCount');
  const uniqueItemsEl = document.getElementById('uniqueItems');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTax = document.getElementById('cartTax');
  const cartShipping = document.getElementById('cartShipping');
  const cartTotal = document.getElementById('cartTotal');
  const proceedToCheckoutBtn = document.getElementById('proceedToCheckout');
  const continueShoppingBtn = document.getElementById('continueShoppingBtn');
  const checkoutCircularBtn = document.getElementById('checkoutCircularBtn');
  
  // Money formatter
  const money = (n) => `$${parseFloat(n).toFixed(2)}`;
  
  // ✅ Real-time cart update function
  function updateCartDisplay() {
    // Clear existing event listeners to prevent duplicates
    if (cartItemsContainer) {
        cartItemsContainer.replaceChildren(); // More efficient than innerHTML = ''
    }

    if (cart.length === 0) {
      if (cartItemsContainer) {
          cartItemsContainer.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-shopping-cart"></i>
              <h3>Your Cart is Empty</h3>
              <p>Looks like you haven't added any items to your cart yet.<br>Browse our collection and find something amazing!</p>
              <!-- Circular button layout for empty cart -->
              <div class="button-layout">
                <a href="products.html" class="circular-button primary">
                  <i class="fas fa-shopping-bag"></i>
                  <span>Browse Products</span>
                </a>
                <a href="index.html" class="circular-button">
                  <i class="fas fa-home"></i>
                  <span>Home</span>
                </a>
              </div>
            </div>
          `;
      }
      updateCartTotals();
      updateCartCount();
      return;
    }
    
    let cartHTML = '';
    cart.forEach(item => {
      // Ensure qty is an integer and price is a float
      const itemQty = parseInt(item.qty, 10) || 1;
      const itemPrice = parseFloat(item.price) || 0;
      const itemTotal = itemPrice * itemQty;

      cartHTML += `
        <div class="cart-item-card" data-cart-item-id="${item.id}">
          <div class="item-image">
            <img src="${item.img}" alt="${item.name}" loading="lazy">
          </div>
          <div class="item-details">
            <h3 class="item-name">${item.name}</h3>
            <div class="item-attributes">
              <span class="attribute-tag">Quantity: ${itemQty}</span>
              ${item.color ? `<span class="attribute-tag">Color: ${item.color}</span>` : ''}
              ${item.size ? `<span class="attribute-tag">Size: ${item.size}</span>` : ''}
            </div>
          </div>
          <div class="item-price">${money(itemTotal)}</div>
          <div class="item-controls">
            <div class="quantity-control">
              <button class="qty-btn minus-btn" data-cart-item-id="${item.id}">
                <i class="fas fa-minus"></i>
              </button>
              <span class="qty-display">${itemQty}</span>
              <button class="qty-btn plus-btn" data-cart-item-id="${item.id}">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <button class="remove-btn remove-item" data-cart-item-id="${item.id}">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = cartHTML;
    }
    updateCartTotals();
    updateCartCount();
    
    // Add event listeners
    addCartEventListeners();
  }
  
  // ✅ Add event listeners for cart controls
  function addCartEventListeners() {
    // Plus buttons
    document.querySelectorAll('.plus-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const cartItemID = this.dataset.cartItemId;
        updateItemQuantity(cartItemID, 1);
      });
    });
    
    // Minus buttons
    document.querySelectorAll('.minus-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const cartItemID = this.dataset.cartItemId;
        updateItemQuantity(cartItemID, -1);
      });
    });
    
    // Remove buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', function() {
        const cartItemID = this.dataset.cartItemId;
        removeItemFromCart(cartItemID);
      });
    });
  }
  
  // ✅ Update item quantity in real-time
  function updateItemQuantity(cartItemID, change) {
    const itemIndex = cart.findIndex(item => item.id === cartItemID);
    if (itemIndex > -1) {
      // Ensure we are working with numbers
      let currentQty = parseInt(cart[itemIndex].qty, 10) || 1;
      const newQuantity = currentQty + change;
      
      if (newQuantity <= 0) {
        removeItemFromCart(cartItemID);
      } else {
        cart[itemIndex].qty = newQuantity;
        saveCart();
        updateCartDisplay(); // ✅ Real-time update
        showNotification('Quantity updated');
      }
    }
  }
  
  // ✅ Remove item from cart in real-time
  function removeItemFromCart(cartItemID) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      cart = cart.filter(item => item.id !== cartItemID);
      saveCart();
      updateCartDisplay(); // ✅ Real-time update
      showNotification('Item removed from cart');
    }
  }
  
  // ✅ Update cart totals in real-time
  function updateCartTotals() {
    if (cart.length === 0) {
      if (cartSubtotal) cartSubtotal.textContent = '$0.00';
      if (cartTax) cartTax.textContent = '$0.00';
      if (cartShipping) cartShipping.textContent = 'Free';
      if (cartTotal) cartTotal.textContent = '$0.00';
      if (itemCountEl) itemCountEl.textContent = '0';
      if (uniqueItemsEl) uniqueItemsEl.textContent = '0';
      return;
    }
    
    let subtotal = 0;
    let totalItems = 0;
    cart.forEach(item => {
      // Ensure price and qty are numbers
      const itemPrice = parseFloat(item.price) || 0;
      const itemQty = parseInt(item.qty, 10) || 1;
      subtotal += itemPrice * itemQty;
      totalItems += itemQty;
    });
    
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal >= 200 ? 0 : 15.00; // Free shipping over $200
    const total = subtotal + tax + shipping;
    
    if (cartSubtotal) cartSubtotal.textContent = money(subtotal);
    if (cartTax) cartTax.textContent = money(tax);
    if (cartShipping) cartShipping.textContent = shipping === 0 ? 'Free' : money(shipping);
    if (cartTotal) cartTotal.textContent = money(total);
    
    // Update stats
    if (itemCountEl) itemCountEl.textContent = totalItems;
    if (uniqueItemsEl) uniqueItemsEl.textContent = cart.length;
  }
  
  // ✅ Update cart count in header in real-time
  function updateCartCount() {
    const count = cart.reduce((sum, item) => {
        const itemQty = parseInt(item.qty, 10) || 1;
        return sum + itemQty;
    }, 0);
    if (cartCountEl) {
        cartCountEl.textContent = count;
        cartCountEl.style.display = count > 0 ? 'inline' : 'none';
    }
  }
  
  // ✅ Save cart to localStorage
  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  
  // ✅ Show notification
  function showNotification(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'toast';
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Auto remove
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 400);
    }, 3000);
  }
  
  // ✅ Real-time storage event listener (For sync between tabs)
  window.addEventListener('storage', function(e) {
    if (e.key === CART_KEY) {
      try {
        cart = JSON.parse(e.newValue || '[]');
        updateCartDisplay(); // ✅ Update when storage changes
      } catch (error) {
        console.error("Error parsing cart data from storage:", error);
        cart = [];
        updateCartDisplay();
      }
    }
  });
  
  // Event Listeners
  if (proceedToCheckoutBtn) {
    proceedToCheckoutBtn.addEventListener('click', function(e) {
      e.preventDefault(); // Good practice
      if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }
  
  if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'products.html';
    });
  }
  
  // Circular button event listener
  if (checkoutCircularBtn) {
    checkoutCircularBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }
  
  // Mobile menu toggle (if present on cart page)
  const hamburger = document.getElementById('hamburger');
  const mnav = document.getElementById('mnav');
  
  if (hamburger && mnav) {
    hamburger.addEventListener('click', () => {
      const open = mnav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
    });
  }
  
  // Initialize cart display
  updateCartDisplay();
});