// ==============================
// Product Database - Enhanced with all products
// ==============================
const productDatabase = {
  "p1": {
    id: "p1",
    name: "Warrior Armor",
    basePrice: 299.00,
    originalPrice: 349.00,
    description: "Premium handcrafted leather armor for protection and agility.",
    image: "/images/product1/front.avif",
    images: [
      "/images/product1/front.avif",
      "/images/product1/chest.avif",
      "/images/product1/back.avif"
    ],
    features: [
      "Premium full-grain leather construction",
      "Reinforced stress points",
      "Adjustable straps for perfect fit"
    ],
    specs: {
      "Material": "Full-grain leather",
      "Weight": "2.4 kg",
      "Protection Level": "CE Level 2"
    },
    variants: {
      colors: ["Black", "Brown"],
      sizes: ["S", "M", "L", "XL"]
    }
  },
  "p2": {
    id: "p2",
    name: "Ranger Armor",
    basePrice: 279.00,
    originalPrice: 329.00,
    description: "Lightweight armor for agility and style.",
    image: "/images/product2/front.webp",
    images: [
      "/images/product2/front.webp",
      "/images/product2/chest.webp",
      "/images/product2/back.webp"
    ],
    features: [
      "Lightweight design",
      "High mobility",
      "Weather resistant"
    ],
    specs: {
      "Material": "Premium leather",
      "Weight": "1.8 kg",
      "Protection Level": "CE Level 1"
    },
    variants: {
      colors: ["Black", "Brown"],
      sizes: ["S", "M", "L", "XL"]
    }
  },
  "p3": {
    id: "p3",
    name: "Assassin Armor",
    basePrice: 349.00,
    originalPrice: 399.00,
    description: "Sleek design for stealth and protection.",
    image: "/images/product3/front.avif",
    images: [
      "/images/product3/front.avif",
      "/images/product3/chest.avif",
      "/images/product3/back.avif"
    ],
    features: [
      "Stealth design",
      "Flexible material",
      "Concealed pockets"
    ],
    specs: {
      "Material": "Flexible leather",
      "Weight": "1.5 kg",
      "Protection Level": "CE Level 1"
    },
    variants: {
      colors: ["Black", "Brown"],
      sizes: ["S", "M", "L", "XL"]
    }
  },
  "p4": {
    id: "p4",
    name: "Knight Armor",
    basePrice: 399.00,
    originalPrice: 449.00,
    description: "Heavy-duty leather armor for true warriors.",
    image: "https://images.unsplash.com/photo-1630713814061-4d5e114d88d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1630713814061-4d5e114d88d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ],
    features: [
      "Heavy duty construction",
      "Maximum protection",
      "Reinforced joints"
    ],
    specs: {
      "Material": "Heavy-duty leather",
      "Weight": "3.2 kg",
      "Protection Level": "CE Level 3"
    },
    variants: {
      colors: ["Black", "Brown"],
      sizes: ["S", "M", "L", "XL"]
    }
  },
  "p5": {
    id: "p5",
    name: "Paladin Armor",
    basePrice: 369.00,
    originalPrice: 419.00,
    description: "Divine design with high durability and style.",
    image: "https://images.unsplash.com/photo-1617118684470-8d871c853b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1617118684470-8d871c853b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ],
    features: [
      "Elegant design",
      "High durability",
      "Divine aesthetics"
    ],
    specs: {
      "Material": "Premium leather",
      "Weight": "2.8 kg",
      "Protection Level": "CE Level 2"
    },
    variants: {
      colors: ["Black", "Brown"],
      sizes: ["S", "M", "L", "XL"]
    }
  }
};

// ==============================
// Cart Management System
// ==============================
let cart = JSON.parse(localStorage.getItem('grimhide_cart')) || [];

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('grimhide_cart', JSON.stringify(cart));
}

// Generate unique cart item ID
function generateCartItemID(productId, color, size) {
  return `${productId}-${color}-${size}`;
}

// Add item to cart
function addToCart(productId, quantity = 1) {
  const product = productDatabase[productId];
  if (!product) return;
  
  // Get selected variants
  const color = document.querySelector('input[name="color"]:checked')?.value || 'Black';
  const size = document.querySelector('input[name="size"]:checked')?.value || 'M';
  
  // Create unique ID for this variant
  const cartItemID = generateCartItemID(productId, color, size);
  
  // Check if this exact variant already exists in cart
  const existingItemIndex = cart.findIndex(item => item.cartItemID === cartItemID);
  
  if (existingItemIndex > -1) {
    // Update quantity for existing variant
    cart[existingItemIndex].quantity += quantity;
  } else {
    // Add new variant as separate item
    cart.push({
      cartItemID: cartItemID,
      productId: productId,
      name: product.name,
      price: product.basePrice,
      image: product.image,
      color: color,
      size: size,
      quantity: quantity
    });
  }
  
  // Save and update UI
  saveCart();
  updateCartUI();
  showNotification(`Added ${quantity} × ${product.name} (${color}, ${size}) to cart!`);
}

// Remove item from cart
function removeFromCart(cartItemID) {
  cart = cart.filter(item => item.cartItemID !== cartItemID);
  saveCart();
  updateCartUI();
}

// Update item quantity
function updateCartItemQuantity(cartItemID, change) {
  const itemIndex = cart.findIndex(item => item.cartItemID === cartItemID);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    saveCart();
    updateCartUI();
  }
}

// ==============================
// Buy Now Function - Direct to Checkout
// ==============================
function buyNow(productId, quantity = 1) {
  const product = productDatabase[productId];
  if (!product) return;
  
  // Get selected variants
  const color = document.querySelector('input[name="color"]:checked')?.value || 'Black';
  const size = document.querySelector('input[name="size"]:checked')?.value || 'M';
  
  // Create unique ID for this variant
  const cartItemID = generateCartItemID(productId, color, size);
  
  // Clear existing cart (for buy now functionality)
  cart = [];
  
  // Add this item to cart
  cart.push({
    cartItemID: cartItemID,
    productId: productId,
    name: product.name,
    price: product.basePrice,
    image: product.image,
    color: color,
    size: size,
    quantity: quantity
  });
  
  // Save cart
  saveCart();
  
  // Show notification
  showNotification(`Added ${quantity} × ${product.name} to cart! Redirecting to checkout...`);
  
  // Redirect to checkout after a short delay
  setTimeout(() => {
    window.location.href = 'checkout.html';
  }, 1500);
}

// ==============================
// UI Updates
// ==============================
function updateCartUI() {
  // Update cart count in header
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
    cartCountElement.style.display = cartCount > 0 ? 'block' : 'none';
  }
  
  // Update cart drawer if it's open
  updateCartDrawer();
}

function updateCartDrawer() {
  const drawerItems = document.getElementById('drawer-items');
  const cartTotalElement = document.getElementById('cart-total');
  
  if (!drawerItems || !cartTotalElement) return;
  
  if (cart.length === 0) {
    drawerItems.innerHTML = `
      <div class="empty-cart-message" id="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
      </div>
    `;
    cartTotalElement.textContent = '$0.00';
  } else {
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      html += `
        <div class="drawer-item" data-cart-item-id="${item.cartItemID}">
          <img src="${item.image}" alt="${item.name}" width="60" height="60">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-variant">${item.color} | Size ${item.size.toUpperCase()}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity} = $${itemTotal.toFixed(2)}</div>
          </div>
          <div class="cart-item-controls">
            <button class="quantity-btn minus" onclick="updateCartItemQuantity('${item.cartItemID}', -1)">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn plus" onclick="updateCartItemQuantity('${item.cartItemID}', 1)">+</button>
            <button class="remove-item" onclick="removeFromCart('${item.cartItemID}')">×</button>
          </div>
        </div>
      `;
    });
    
    drawerItems.innerHTML = html;
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
  }
}

// ==============================
// Notifications
// ==============================
function showNotification(message) {
  // Remove existing toast
  const existingToast = document.getElementById('toast-notification');
  if (existingToast) existingToast.remove();
  
  // Create new toast
  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    </div>
  `;
  
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 3000);
  }, 3000);
}

// ==============================
// Product Page Functions
// ==============================
function loadProduct(productId) {
  const product = productDatabase[productId] || productDatabase['p1'];
  if (!product) return;
  
  // Update basic product info
  document.title = `${product.name} - GrimHide`;
  document.getElementById('product-title').textContent = product.name;
  document.getElementById('breadcrumb-product-name').textContent = product.name;
  document.getElementById('product-description').textContent = product.description;
  document.getElementById('price-current').textContent = `$${product.basePrice.toFixed(2)}`;
  
  // Update original price if exists
  const originalPriceEl = document.getElementById('price-original');
  if (originalPriceEl) {
    if (product.originalPrice && product.originalPrice > product.basePrice) {
      originalPriceEl.textContent = `$${product.originalPrice.toFixed(2)}`;
      originalPriceEl.style.display = 'inline';
    } else {
      originalPriceEl.style.display = 'none';
    }
  }
  
  // Update discount badge if exists
  const discountEl = document.getElementById('price-discount');
  if (discountEl && product.originalPrice && product.originalPrice > product.basePrice) {
    const discount = Math.round(((product.originalPrice - product.basePrice) / product.originalPrice) * 100);
    discountEl.textContent = `-${discount}%`;
    discountEl.style.display = 'inline';
  }
  
  // Update images
  if (product.images && product.images.length > 0) {
    document.getElementById('main-image').src = product.images[0];
    document.getElementById('main-image').alt = product.name;
    
    // Update thumbnails
    const thumbsContainer = document.getElementById('gallery-thumbs');
    if (thumbsContainer) {
      thumbsContainer.innerHTML = '';
      product.images.forEach((img, index) => {
        const thumbDiv = document.createElement('div');
        thumbDiv.className = `thumb-item ${index === 0 ? 'active' : ''}`;
        thumbDiv.innerHTML = `<img src="${img}" alt="${product.name} ${index + 1}">`;
        thumbDiv.addEventListener('click', () => {
          document.getElementById('main-image').src = img;
          document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
          thumbDiv.classList.add('active');
        });
        thumbsContainer.appendChild(thumbDiv);
      });
    }
  }
  
  // Update features
  const featuresList = document.getElementById('features-list');
  if (featuresList) {
    featuresList.innerHTML = '';
    product.features.forEach(feature => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="feature-icon"><i class="fas fa-check"></i></span> ${feature}`;
      featuresList.appendChild(li);
    });
  }
  
  // Update specifications
  const specsTable = document.getElementById('specs-table');
  if (specsTable) {
    specsTable.innerHTML = '';
    Object.entries(product.specs).forEach(([key, value]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${key}</strong></td><td>${value}</td>`;
      specsTable.appendChild(tr);
    });
  }
}

// ==============================
// Related Products Functions
// ==============================
function setupRelatedProducts() {
  // Add click event listeners to all related product buttons
  document.querySelectorAll('.card-action').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = this.getAttribute('data-id');
      if (productId) {
        // Redirect to product detail page
        window.location.href = `product-detail.html?id=${productId}`;
      }
    });
  });
  
  // Add "Add to Cart" functionality to related products (if needed)
  document.querySelectorAll('.related-add-to-cart').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const productId = this.getAttribute('data-id');
      if (productId) {
        // Add default variant (Black, M) with quantity 1
        addToCart(productId, 1);
      }
    });
  });
}

// ==============================
// Event Listeners
// ==============================
document.addEventListener('DOMContentLoaded', function() {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'p1';
  
  // Load product
  loadProduct(productId);
  
  // Setup related products
  setupRelatedProducts();
  
  // Add to Cart button
  const addToCartBtn = document.getElementById('add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function() {
      const qtyInput = document.getElementById('qty-input');
      const quantity = parseInt(qtyInput?.value) || 1;
      addToCart(productId, quantity);
    });
  }
  
  // ✅ Buy Now button - Direct to Checkout
  const buyNowBtn = document.getElementById('buy-now');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', function() {
      const qtyInput = document.getElementById('qty-input');
      const quantity = parseInt(qtyInput?.value) || 1;
      buyNow(productId, quantity);
    });
  }
  
  // Cart drawer controls
  const cartBtn = document.getElementById('cart-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerClose = document.getElementById('drawer-close');
  const checkoutBtn = document.getElementById('checkout-btn'); // Checkout button
  
  if (cartBtn && drawerBackdrop && drawerClose) {
    cartBtn.addEventListener('click', function() {
      drawerBackdrop.classList.add('show');
      document.getElementById('cart-drawer')?.classList.add('open');
      updateCartDrawer();
    });
    
    drawerClose.addEventListener('click', function() {
      drawerBackdrop.classList.remove('show');
      document.getElementById('cart-drawer')?.classList.remove('open');
    });
    
    drawerBackdrop.addEventListener('click', function(e) {
      if (e.target === drawerBackdrop) {
        drawerBackdrop.classList.remove('show');
        document.getElementById('cart-drawer')?.classList.remove('open');
      }
    });
  }
  
  // ✅ Proceed to Checkout button functionality
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default form submission
      proceedToCheckout(); // Call checkout function
    });
  }
  
  // Quantity selector
  const qtyInput = document.getElementById('qty-input');
  const qtyDecrease = document.getElementById('qty-decrease');
  const qtyIncrease = document.getElementById('qty-increase');
  
  if (qtyDecrease && qtyInput) {
    qtyDecrease.addEventListener('click', function() {
      const current = parseInt(qtyInput.value) || 1;
      if (current > 1) {
        qtyInput.value = current - 1;
      }
    });
  }
  
  if (qtyIncrease && qtyInput) {
    qtyIncrease.addEventListener('click', function() {
      const current = parseInt(qtyInput.value) || 1;
      if (current < 10) {
        qtyInput.value = current + 1;
      }
    });
  }
  
  // Initialize cart UI
  updateCartUI();
  
  // Tab switching
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Update active buttons
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Update active content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      const targetContent = document.getElementById(tabId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
});

// ==============================
// Gallery Navigation
// ==============================
document.addEventListener('click', function(e) {
  // Gallery navigation
  if (e.target.id === 'gallery-prev' || e.target.id === 'gallery-next') {
    const thumbs = document.querySelectorAll('.thumb-item');
    if (thumbs.length > 0) {
      const currentIndex = Array.from(thumbs).findIndex(thumb => thumb.classList.contains('active'));
      let newIndex;
      
      if (e.target.id === 'gallery-prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : thumbs.length - 1;
      } else {
        newIndex = currentIndex < thumbs.length - 1 ? currentIndex + 1 : 0;
      }
      
      // Click the new thumbnail to update main image
      thumbs[newIndex].click();
    }
  }
});

// ==============================
// Proceed to Checkout Function
// ==============================
function proceedToCheckout() {
  // Check if cart is empty
  if (cart.length === 0) {
    showNotification("Your cart is empty! Add some items first.");
    return;
  }
  
  // Close cart drawer
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const cartDrawer = document.getElementById('cart-drawer');
  if (drawerBackdrop && cartDrawer) {
    drawerBackdrop.classList.remove('show');
    cartDrawer.classList.remove('open');
  }
  
  // Redirect to checkout page
  window.location.href = 'checkout.html';
}