 
    // ==================== DOM Ready ====================
    document.addEventListener('DOMContentLoaded', function() {
      
      // ======== Elements ========
      const hamburger = document.getElementById('hamburger');
      const mobileNav = document.getElementById('mnav');
      const chips = document.querySelectorAll('.chip');
      const cards = document.querySelectorAll('.card');
      const sortSelect = document.getElementById('sort');
      const grid = document.getElementById('grid');
      const reveals = document.querySelectorAll('.reveal');
      const qInput = document.getElementById('q');
      
      // ======== Product Detail Navigation ========
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view') && e.target.dataset.id) {
          const id = e.target.dataset.id;
          window.location.href = `product-detail.html?id=${id}`;
        }
      });
      
      // ======== Mobile Menu Toggle ========
      if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
          const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
          hamburger.setAttribute('aria-expanded', !isExpanded);
          mobileNav.setAttribute('aria-hidden', !isExpanded);
          mobileNav.classList.toggle('open');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
          if (!mobileNav.contains(e.target) && 
              !hamburger.contains(e.target) && 
              mobileNav.classList.contains('open')) {
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
              if (category === 'all' || card.dataset.cat === category) {
                card.style.display = 'block';
              } else {
                card.style.display = 'none';
              }
            });
          });
        });
      }
      
      // ======== Sorting Functionality ========
      if (sortSelect && grid) {
        sortSelect.addEventListener('change', () => {
          const sortBy = sortSelect.value;
          const cardsArray = Array.from(cards);
          
          cardsArray.sort((a, b) => {
            const priceA = parseInt(a.dataset.price) || 0;
            const priceB = parseInt(b.dataset.price) || 0;
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
                return 0; // Default: no sorting
            }
          });
          
          // Clear grid and append sorted cards
          grid.innerHTML = '';
          cardsArray.forEach(card => {
            grid.appendChild(card);
          });
        });
      }
      
      // ======== Search Functionality ========
      if (qInput) {
        qInput.addEventListener('input', function() {
          const searchTerm = this.value.toLowerCase();
          
          cards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            if (name.includes(searchTerm)) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        });
      }
      
      // ======== Reveal Animations ========
      const revealOnScroll = () => {
        reveals.forEach(reveal => {
          const elementTop = reveal.getBoundingClientRect().top;
          const elementVisible = 150;
          
          if (elementTop < window.innerHeight - elementVisible) {
            reveal.classList.add('active');
          }
        });
      };
      
      if (reveals.length > 0) {
        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll(); // Initial check
      }
      
      // ======== Enhanced Cart Functionality ========
      const CART_KEY = 'grimhide_cart_v1';
      let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      const cartCountEl = document.getElementById('cartCount');
      const openCartBtn = document.getElementById('openCart');
      const backdrop = document.getElementById('backdrop');
      const drawer = document.getElementById('drawer');
      const closeCartBtn = document.getElementById('closeCart');
      const cartItemsEl = document.getElementById('cartItems');
      const subtotalEl = document.getElementById('subtotal');
      const checkoutBtn = document.getElementById('checkoutBtn');

      // Update cart count
      function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.qty, 0);
        if (cartCountEl) cartCountEl.textContent = count;
      }

      // Money formatter
      const money = n => `$${parseFloat(n).toFixed(2)}`;

      // Update cart UI
      function updateCartUI() {
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
          const itemTotal = parseFloat(item.price) * item.qty;
          subtotal += itemTotal;
          
          cartHTML += `
            <div class="drawer-item">
              <img src="${item.img}" alt="${item.name}" width="64" height="64" style="border-radius:8px;object-fit:cover"/>
              <div style="flex:1; padding: 0 15px;">
                <strong>${item.name}</strong>
                <div class="muted">${money(item.price)}</div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
                <div class="qty" style="display:flex;align-items:center;gap:8px">
                  <button class="dec" data-id="${item.id}" style="width:28px;height:28px;background:var(--panel-3);border:1px solid rgba(255,255,255,.12);color:var(--brand);border-radius:6px;font-weight:600">−</button>
                  <span>${item.qty}</span>
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
        
        // Add event listeners to newly created buttons
        document.querySelectorAll('.remove').forEach(button => {
          button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            cart = cart.filter(item => item.id !== id);
            saveCart();
          });
        });
        
        document.querySelectorAll('.inc').forEach(button => {
          button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            if (item) {
              item.qty += 1;
              saveCart();
            }
          });
        });
        
        document.querySelectorAll('.dec').forEach(button => {
          button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            if (item) {
              item.qty = Math.max(1, item.qty - 1);
              saveCart();
            }
          });
        });
      }

      // Save cart
      function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCount();
        updateCartUI();
      }

      // Enhanced Add to Cart with Visual Feedback
      document.addEventListener('click', function(e) {
        // Add to cart button
        if (e.target.classList.contains('add') && e.target.dataset.id) {
          const btn = e.target;
          const card = btn.closest('.card');
          
          if (card) {
            const id = btn.dataset.id;
            const name = card.dataset.name;
            const price = card.dataset.price;
            const img = card.querySelector('img')?.src || '';
            
            const existing = cart.find(item => item.id === id);
            if (existing) {
              existing.qty += 1;
            } else {
              cart.push({ 
                id, 
                name, 
                price: parseFloat(price), 
                img, 
                qty: 1 
              });
            }
            
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
        openCartBtn.addEventListener('click', openDrawer);
      }
      
      if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeDrawer);
      }
      
      if (backdrop) {
        backdrop.addEventListener('click', closeDrawer);
      }
      
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
          closeDrawer();
          window.location.href = 'cart.html';
        });
      }

      // Initialize cart
      updateCartCount();
      updateCartUI();
    });
