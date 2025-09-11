// products.js - Handle product cards, filtering, sorting, search, and add to cart

// ==================== DOM Ready ====================
document.addEventListener('DOMContentLoaded', function() {
  
  // ======== Elements ========
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mnav');
  const chips = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('.card'); // These are the product cards
  const sortSelect = document.getElementById('sort');
  const grid = document.getElementById('grid');
  const reveals = document.querySelectorAll('.reveal');
  const qInput = document.getElementById('q');
  
  // ======== Product Detail Navigation ========
  // Use event delegation for better performance and to handle dynamically added elements
  document.addEventListener('click', function(e) {
    // View Details button
    if (e.target.classList.contains('view') && e.target.dataset.id) {
      const id = e.target.dataset.id;
      window.location.href = `product-detail.html?id=${id}`;
    }
  });
  
  // ======== Mobile Menu Toggle ========
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!isExpanded));
      mobileNav.setAttribute('aria-hidden', String(isExpanded));
      mobileNav.classList.toggle('open');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      // Check if mobile nav is open and click is outside
      if (mobileNav.classList.contains('open') && 
          !mobileNav.contains(e.target) && 
          !hamburger.contains(e.target)) {
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        mobileNav.classList.remove('open');
      }
    });
  }
  
  // ======== Category Filtering ========
  if (chips.length > 0 && cards.length > 0) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        // Remove active class from all chips
        chips.forEach(c => c.classList.remove('active'));
        // Add active class to clicked chip
        chip.classList.add('active');
        
        const category = chip.dataset.cat;
        
        cards.forEach(card => {
          // If 'all' is selected or card's category matches the selected one
          if (category === 'all' || card.dataset.cat === category) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });

        // Re-sort the visible items if a sort option is selected
        if (sortSelect && sortSelect.value !== 'pop') { // Assuming 'pop' is default/no sort
             // Trigger sorting logic manually or re-sort
             handleSort();
        }
      });
    });
  }
  
  // ======== Sorting Functionality ========
  const handleSort = () => {
    if (!sortSelect || !grid) return;

    const sortBy = sortSelect.value;
    // Get only the currently visible cards for sorting
    const visibleCards = Array.from(cards).filter(card => card.style.display !== 'none');
    
    visibleCards.sort((a, b) => {
      const priceA = parseFloat(a.dataset.price) || 0;
      const priceB = parseFloat(b.dataset.price) || 0;
      const nameA = (a.dataset.name || '').toLowerCase();
      const nameB = (b.dataset.name || '').toLowerCase();
      
      switch(sortBy) {
        case 'lh':
          return priceA - priceB;
        case 'hl':
          return priceB - priceA;
        case 'az':
          return nameA.localeCompare(nameB);
        case 'za':
          return nameB.localeCompare(nameA);
        default:
          // Default sorting (e.g., by popularity/index) - keep original order
          return 0; 
      }
    });
    
    // Append sorted cards to the grid to reorder them
    // Note: This works because appendChild moves the element if it's already in the DOM
    visibleCards.forEach(card => grid.appendChild(card));
  };

  if (sortSelect && grid) {
    sortSelect.addEventListener('change', handleSort);
  }
  
  // ======== Search Functionality ========
  if (qInput) {
    // Use debounce for better performance on input
    let searchTimeout;
    qInput.addEventListener('input', function() {
        // Clear the previous timeout
        clearTimeout(searchTimeout);

        // Set a new timeout
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value.toLowerCase().trim();
            
            cards.forEach(card => {
                const name = (card.dataset.name || '').toLowerCase();
                // Show card if search term is empty or name includes the term
                if (searchTerm === '' || name.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });

            // Re-sort the visible items if a sort option is selected
            if (sortSelect && sortSelect.value !== 'pop') { 
                 handleSort();
            }
        }, 300); // 300ms delay
    });
  }
  
  // ======== Reveal Animations ========
  const revealOnScroll = () => {
    reveals.forEach(reveal => {
      const elementTop = reveal.getBoundingClientRect().top;
      const elementVisible = 150; // Adjust this value to control when the animation triggers
      
      if (elementTop < window.innerHeight - elementVisible) {
        reveal.classList.add('active');
      }
      // Optional: Remove 'active' class if element scrolls out of view (if you want reverse animation)
      // else {
      //   reveal.classList.remove('active');
      // }
    });
  };
  
  if (reveals.length > 0) {
    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('resize', revealOnScroll); // Recheck on resize
    revealOnScroll(); // Initial check
  }

  // ======== Enhanced Cart Functionality ========
  // Use the same CART_KEY as in main.js and cart.js for consistency
  const CART_KEY = 'grimhide_cart'; // Updated for consistency
  let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const cartCountEl = document.getElementById('cartCount');
  const openCartBtn = document.getElementById('openCart');
  // Assuming backdrop and drawer IDs are consistent, or get them if they exist on this page
  const backdrop = document.getElementById('backdrop') || document.getElementById('drawer-backdrop'); 
  const drawer = document.getElementById('drawer') || document.getElementById('cart-drawer');
  const closeCartBtn = document.getElementById('closeCart');
  const cartItemsEl = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('subtotal');
  const checkoutBtn = document.getElementById('checkout') || document.getElementById('checkoutBtn'); // Check both possible IDs

  // Update cart count in the header
  function updateCartCount() {
    const count = cart.reduce((total, item) => {
        // Ensure qty is a number
        const itemQty = parseInt(item.qty, 10) || 0;
        return total + itemQty;
    }, 0);
    if (cartCountEl) {
        cartCountEl.textContent = count;
        // Optional: Hide count if zero
        // cartCountEl.style.display = count > 0 ? 'inline' : 'none';
    }
  }

  // Money formatter
  const money = n => `$${parseFloat(n).toFixed(2)}`;

  // Update the cart drawer UI
  function updateCartUI() {
    // Only update if cart items container exists on this page (e.g., if drawer is present)
    if (!cartItemsEl) return;
    
    if (cart.length === 0) {
      cartItemsEl.innerHTML = `
        <div class="empty-cart-message">
          <i class="fas fa-shopping-cart"></i>
          <p>Your cart is empty</p>
          <button class="btn primary" onclick="closeDrawer(); window.location.href='products.html'">Continue Shopping</button>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '$0.00';
      return;
    }

    let cartHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
      // Ensure price and qty are numbers
      const itemPrice = parseFloat(item.price) || 0;
      const itemQty = parseInt(item.qty, 10) || 1;
      const itemTotal = itemPrice * itemQty;
      subtotal += itemTotal;
      
      cartHTML += `
        <div class="drawer-item">
          <img src="${item.img}" alt="${item.name}" width="64" height="64" style="border-radius:8px;object-fit:cover"/>
          <div style="flex:1; padding: 0 15px;">
            <strong>${item.name}</strong>
            <div class="muted">${money(itemPrice)}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
            <div class="qty" style="display:flex;align-items:center;gap:8px">
              <button class="dec" data-id="${item.id}" style="width:28px;height:28px;background:var(--panel-3);border:1px solid rgba(255,255,255,.12);color:var(--brand);border-radius:6px;font-weight:600">−</button>
              <span>${itemQty}</span>
              <button class="inc" data-id="${item.id}" style="width:28px;height:28px;background:var(--panel-3);border:1px solid rgba(255,255,255,.12);color:var(--brand);border-radius:6px;font-weight:600">+</button>
            </div>
            <div style="font-weight:600;color:var(--brand)">${money(itemTotal)}</div>
          </div>
          <button class="pill remove" data-id="${item.id}" style="background:#ef4444;color:white;padding:6px 12px;font-size:0.8rem;margin-left:10px">Remove</button>
        </div>
      `;
    });

    cartItemsEl.innerHTML = cartHTML;
    if (subtotalEl) subtotalEl.textContent = money(subtotal);
    
    // Add event listeners to the newly created buttons inside the drawer
    // Use querySelector on cartItemsEl for better scoping
    cartItemsEl.querySelectorAll('.remove').forEach(button => {
      button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        cart = cart.filter(item => item.id !== id);
        saveCart();
        // Show notification if you have one
        // showToast('Item removed from cart');
      });
    });
    
    cartItemsEl.querySelectorAll('.inc').forEach(button => {
      button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const item = cart.find(item => item.id === id);
        if (item) {
          item.qty = (parseInt(item.qty, 10) || 1) + 1;
          saveCart();
        }
      });
    });
    
    cartItemsEl.querySelectorAll('.dec').forEach(button => {
      button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const item = cart.find(item => item.id === id);
        if (item) {
          item.qty = Math.max(1, (parseInt(item.qty, 10) || 1) - 1);
          saveCart();
        }
      });
    });
  }

  // Save cart to localStorage and update UI
  function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCount();
        updateCartUI(); // Update drawer if it's open
        // Also update cart count on other potential elements if needed
        // updateCartCountInDrawers(); // If you have multiple count elements
    } catch (e) {
        console.error("Failed to save cart to localStorage", e);
        // Optionally show an error message to the user
    }
  }

  // Enhanced Add to Cart with Visual Feedback
  document.addEventListener('click', function(e) {
    // Add to cart button
    if (e.target.classList.contains('add') && e.target.dataset.id) {
      const btn = e.target;
      // Find the closest card container
      const card = btn.closest('.card');
      
      if (card) {
        // Get product details from data attributes
        const id = btn.dataset.id;
        const name = card.dataset.name || 'Unknown Product';
        const price = card.dataset.price || '0';
        // Get the image source, fallback if not found
        const imgEl = card.querySelector('img');
        const img = imgEl ? imgEl.src : ''; // Or a default image path
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => item.id === id);
        
        if (existingItemIndex > -1) {
          // If exists, increment quantity
          cart[existingItemIndex].qty = (parseInt(cart[existingItemIndex].qty, 10) || 1) + 1;
        } else {
          // If new, add to cart
          // Ensure price is a float and qty is an int
          cart.push({ 
            id, 
            name, 
            price: parseFloat(price) || 0, 
            img, 
            qty: 1 
          });
        }
        
        // Save cart and update UI
        saveCart();
        
        // ✅ Enhanced Visual Feedback (No Alert)
        // Button animation
        btn.classList.add('pulse');
        setTimeout(() => btn.classList.remove('pulse'), 600);
        
        // Cart count animation
        if (cartCountEl) {
          cartCountEl.classList.add('bounce');
          setTimeout(() => cartCountEl.classList.remove('bounce'), 600);
        }
        
        // Optional: Auto open cart drawer
        // openDrawer(); // Uncomment if you want cart to auto-open
        
        // Optional: Show a toast notification
        // showToast(`Added ${name} to cart!`);
      }
    }
  });

  // Cart drawer functionality
  function openDrawer() {
    if (drawer) {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    }
    if (backdrop) {
      backdrop.classList.add('show');
    }
    // Update the drawer content when opening
    updateCartUI();
  }

  function closeDrawer() {
    if (drawer) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (backdrop) {
      backdrop.classList.remove('show');
    }
  }

  // Event listeners for cart buttons
  if (openCartBtn) {
    openCartBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Good practice
        openDrawer();
    });
  }
  
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        closeDrawer();
    });
  }
  
  // Close drawer if backdrop is clicked
  if (backdrop) {
    backdrop.addEventListener('click', function(e) {
        // Ensure the click is directly on the backdrop, not a child element
        if (e.target === backdrop) { 
             closeDrawer();
        }
    });
  }
  
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior if it's an <a> tag
        closeDrawer();
        window.location.href = 'cart.html';
    });
  }

  // Initialize cart display on page load
  updateCartCount();
  // updateCartUI(); // Only call this if the drawer is initially open or you want to pre-populate it
  
});