/* main.js — Clean & Optimized GrimHide interactions */

// --- Utility Functions ---
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const throttle = (fn, ms = 100) => {
  let last = 0, t;
  return (...args) => {
    const now = Date.now();
    if (now - last > ms) {
      last = now;
      fn(...args);
    } else {
      clearTimeout(t);
      t = setTimeout(() => {
        last = Date.now();
        fn(...args);
      }, ms - (now - last));
    }
  };
};

const debounce = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

// --- Main Application ---
document.addEventListener('DOMContentLoaded', () => {

  // --- Elements ---
  const header = $('header');
  const heroBg = $('.hero-bg');
  const reveals = $$('.reveal');
  const imagesBg = $$('.hero-bg, .hero-overlay');
  const hamburger = $('#hamburger');
  const mnav = $('#mnav');
  const openCartBtn = $('#openCart');
  const closeCartBtn = $('#closeCart');
  const drawer = $('#drawer');
  const backdrop = $('#backdrop');
  const cartCountEl = $('#cartCount');
  const cartItemsEl = $('#cartItems');
  const subtotalEl = $('#subtotal');
  const addBtns = $$('.add');
  const qInput = $('#q');
  const sortSelect = $('#sort');
  const chips = $$('.chip');
  const grid = $('#grid');
  const checkoutBtn = $('#checkout'); // ID corrected from 'checkoutBtn'

  // --- State ---
  const CART_KEY = 'grimhide_cart_v1';
  let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

  // --- Accessibility helpers ---
  const trapFocus = (container) => {
    const focusable = container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0], last = focusable[focusable.length - 1];
    const handler = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      if (e.key === 'Escape') closeAllModals();
    };
    container.addEventListener('keydown', handler);
    return () => container.removeEventListener('keydown', handler);
  };

  // --- Header & hero parallax ---
  const onScroll = throttle(() => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 60);

    if (heroBg) {
      heroBg.style.transform = `translateY(${clamp(y * 0.15, 0, 120)}px) scale(${1 + Math.min(y / 6000, 0.02)})`;
    }

    // --- Back-to-top button logic ---
    // Button dikhaye jab 400px se zyada scroll ho jaye.
    // Button sirf tab chhupaaye jab wapas top ke qareeb aaye (y <= 100).
    // Is se ye hoga ke button page ke end me bhi dikhata rahega.
    const backToTopBtn = $('#backToTop');
    if (backToTopBtn) {
        if (y > 400) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.transform = 'translateY(0)';
        } else if (y <= 100) { // Only hide near the very top
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.transform = 'translateY(8px)';
        }
        // Agar 100 < y <= 400, to opacity/style change nahi hoga, jo ke pehle se set hai.
    }

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docH > 0 ? (y / docH) : 0;
    backToTopBtn?.style?.setProperty('--progress', progress || 0);
  }, 16);

  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Reveal on scroll ---
  const staggerObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const group = el.closest('.grid') || el.parentElement;
      const nodes = Array.from(group.querySelectorAll('.reveal'));
      const idx = nodes.indexOf(el);
      el.style.transition = `opacity .6s ease ${idx * 80}ms, transform .6s ease ${idx * 80}ms`;
      el.classList.add('active');
      obs.unobserve(el);
    });
  }, { threshold: 0.12 });
  reveals.forEach(r => staggerObserver.observe(r));

  // --- Lazy load hero images ---
  imagesBg.forEach(el => {
    const ds = el.dataset?.src;
    if (ds) {
      const img = new Image();
      img.src = ds;
      img.onload = () => el.style.backgroundImage = `url('${ds}')`;
    }
  });

  // --- Mobile nav toggle ---
  hamburger?.addEventListener('click', () => {
    const open = mnav?.classList.toggle('open');
    hamburger?.setAttribute('aria-expanded', String(open));
  });

  // --- Lightbox / Quick View ---
  let lightboxEl = null;
  const openLightbox = (images, startIndex = 0) => {
    closeAllModals();
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'gh-lightbox';
    lightboxEl.innerHTML = `
      <div class="gh-lb-wrap" role="dialog" aria-modal="true">
        <button class="gh-lb-close" aria-label="Close">✕</button>
        <div class="gh-lb-imgs">
          <button class="gh-lb-prev" aria-label="Previous">‹</button>
          <div class="gh-lb-stage"><img src="${images[startIndex]}" alt="" /></div>
          <button class="gh-lb-next" aria-label="Next">›</button>
        </div>
        <div class="gh-lb-counter"><span class="current">${startIndex + 1}</span> / <span class="total">${images.length}</span></div>
      </div>`;
    document.body.appendChild(lightboxEl);
    document.body.classList.add('gh-modal-open');

    let idx = startIndex;
    const stageImg = $('.gh-lb-stage img', lightboxEl);
    const update = () => {
      stageImg.animate([{ opacity: 0, transform: 'scale(.98)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
      stageImg.src = images[idx];
      $('.current', lightboxEl).textContent = idx + 1;
    };

    const prev = () => { idx = (idx - 1 + images.length) % images.length; update(); };
    const next = () => { idx = (idx + 1) % images.length; update(); };

    $('.gh-lb-prev', lightboxEl).onclick = prev;
    $('.gh-lb-next', lightboxEl).onclick = next;
    $('.gh-lb-close', lightboxEl).onclick = closeAllModals;

    const keyHandler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') closeAllModals();
    };
    document.addEventListener('keydown', keyHandler);
    const releaseTrap = trapFocus(lightboxEl);

    lightboxEl.cleanup = () => { releaseTrap(); document.removeEventListener('keydown', keyHandler); };
  };

  const closeAllModals = () => {
    lightboxEl?.cleanup?.();
    lightboxEl?.remove();
    lightboxEl = null;
    document.body.classList.remove('gh-modal-open');
    closeDrawer(); // Ensure drawer closes too if needed
  };

  $$('.card .img img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      const imgs = $$('img', img.closest('.card').parentElement).map(i => i.src);
      const startIndex = imgs.indexOf(img.src);
      openLightbox(imgs, startIndex);
    });
  });

  // --- Cart Functions ---
  const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const money = n => `$${n.toFixed(2)}`;

  const updateCartUI = () => {
    cartCountEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
    cartItemsEl.innerHTML = '';
    let sub = 0;

      if (cart.length === 0) {
      cartItemsEl.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-shopping-cart cart-empty-icon"></i>
          <p class="cart-empty-text">Your cart is empty</p>
          <button class="continue-shopping-btn" onclick="closeDrawer(); window.location.href='products.html'">Continue Shopping</button>
        </div>
      `;
      subtotalEl.textContent = '$0.00';
      return;
    }

    cart.forEach(item => {
      sub += item.price * item.qty;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item-img">
          <img src="${item.img}" alt="${item.name}" width="80" height="80" style="border-radius: 8px; object-fit: cover;">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <div class="cart-item-price">${money(item.price)}</div>
          <div class="cart-item-controls">
            <button class="cart-item-btn dec" aria-label="Decrease">−</button>
            <span class="cart-item-qty">${item.qty}</span>
            <button class="cart-item-btn inc" aria-label="Increase">+</button>
          </div>
          <div class="cart-item-total">${money(item.price * item.qty)}</div>
          <button class="cart-item-remove">Remove</button>
        </div>
      `;
      $('.inc', row).addEventListener('click', () => { item.qty++; refreshCart(); });
      $('.dec', row).addEventListener('click', () => { item.qty = Math.max(1, item.qty - 1); refreshCart(); });
      $('.cart-item-remove', row).addEventListener('click', () => { cart = cart.filter(c => c.id !== item.id); refreshCart(); });
      cartItemsEl.appendChild(row);
    });

    subtotalEl.textContent = money(sub);
  };

  const refreshCart = () => { saveCart(); updateCartUI(); };

  const openDrawer = () => {
    drawer?.classList.add('open');
    backdrop?.classList.add('show');
    drawer?.setAttribute('aria-hidden', 'false');
    drawer.releaseTrap = trapFocus(drawer);
  };

  const closeDrawer = () => {
    drawer?.classList.remove('open');
    backdrop?.classList.remove('show');
    drawer?.setAttribute('aria-hidden', 'true');
    drawer.releaseTrap?.();
  };

  // --- Cart Event Listeners ---
  // ✅ Open mini cart drawer when cart button is clicked
  openCartBtn?.addEventListener('click', function(e) {
    e.preventDefault();
    openDrawer();
  });
  
  closeCartBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  // --- Checkout Button - Redirect to cart.html ---
  // ✅ Proceed to Checkout button now goes to full cart page
  checkoutBtn?.addEventListener('click', function (e) {
    e.preventDefault();
    closeDrawer();
    window.location.href = 'cart.html';
  });

  // --- Fly-to-cart & toast ---
  const toastContainer = document.createElement('div');
  toastContainer.className = 'gh-toasts';
  document.body.appendChild(toastContainer);

  const showToast = text => {
    const t = document.createElement('div');
    t.className = 'gh-toast'; t.textContent = text;
    toastContainer.appendChild(t);
    t.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 250 });
    setTimeout(() => t.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 300 }).onfinish = () => t.remove(), 1800);
  };

  const flyToCart = imgEl => {
    if (!imgEl) return;
    const rect = imgEl.getBoundingClientRect();
    const cartRect = openCartBtn?.getBoundingClientRect();
    if (!cartRect) return; // Handle case where cart button isn't found
    const clone = imgEl.cloneNode(true);
    Object.assign(clone.style, {
      position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
      zIndex: 9999, borderRadius: '8px', pointerEvents: 'none'
    });
    document.body.appendChild(clone);
    const dx = cartRect.left + cartRect.width / 2 - (rect.left + rect.width / 2);
    const dy = cartRect.top + cartRect.height / 2 - (rect.top + rect.height / 2);
    clone.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.6}px,${dy * 0.6}px) scale(.6)`, opacity: .9 },
      { transform: `translate(${dx}px,${dy}px) scale(.2)`, opacity: 0.6 }
    ], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => clone.remove();
  };

  // --- Enhanced Add to Cart with Animations ---
  addBtns.forEach(btn => btn.addEventListener('click', () => {
    // Button pulse animation
    btn.classList.add('pulse');
    setTimeout(() => btn.classList.remove('pulse'), 600);

    const card = btn.closest('.card');
    const id = btn.dataset.id || card?.dataset.name;
    const name = card?.dataset.name;
    const price = parseFloat(card?.dataset.price) || 0;
    const img = card?.querySelector('img')?.src || '';
    const existing = cart.find(x => x.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, price, img, qty: 1 });
    }
    refreshCart();

    // Fly to cart animation
    flyToCart(card?.querySelector('img'));

    // Toast notification
    showToast('Added to cart');

    // Cart count bounce animation
    if (cartCountEl) {
      cartCountEl.classList.add('bounce');
      setTimeout(() => cartCountEl.classList.remove('bounce'), 600);
    }

    // ✅ Open cart drawer after adding item
    openDrawer();
  }));

  // --- Search, filter & sort ---
  const normalize = s => s?.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const buildIndex = () => $$('.card', grid).map(card => ({
    el: card,
    name: normalize(card.dataset.name || card.querySelector('h3')?.textContent),
    price: parseFloat(card.dataset.price) || 0,
    cat: card.dataset.cat || 'all'
  }));
  let index = buildIndex();

  const performSearch = () => {
    index = buildIndex();
    const term = normalize(qInput?.value || '');
    const active = $('.chip.active')?.dataset.cat || 'all';

    index.forEach(item => {
      const matchesCat = active === 'all' || item.cat === active;
      const score = item.name.includes(term) ? 100 - item.name.indexOf(term) : (term === '' ? 50 : 0);
      item.el.style.display = matchesCat && score > 0 ? '' : 'none';
      item.score = score;
    });
    applySort();
  };

  const applySort = () => {
    const val = sortSelect?.value;
    const visible = index.filter(i => i.el.style.display !== 'none');
    const sorters = {
      pop: (a, b) => b.score - a.score,
      lh: (a, b) => a.price - b.price,
      hl: (a, b) => b.price - a.price,
      az: (a, b) => a.name.localeCompare(b.name),
      za: (a, b) => b.name.localeCompare(a.name)
    };
    visible.sort(sorters[val] || sorters.pop).forEach(i => grid?.appendChild(i.el));
  };

  if (qInput) {
    qInput.addEventListener('input', debounce(performSearch, 180));
    qInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });

    const searchContainer = qInput.closest('.search');
    if (searchContainer) {
      const searchButton = searchContainer.querySelector('svg'); // Assuming the SVG is the clickable search icon
      if (searchButton) {
        searchButton.style.cursor = 'pointer';
        searchButton.addEventListener('click', performSearch);
      }
    }
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => { index = buildIndex(); applySort(); });
  }

  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    ch.classList.add('active');
    index = buildIndex();
    performSearch();
  }));

  // --- Keyboard shortcuts ---
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      qInput?.focus();
    }
    if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) {
      openDrawer();
    }
  });

  // --- Back-to-top button (Creation & Event) ---
  // Note: Button styling is in CSS. This JS handles creation, scroll logic, and click.
  const createBackToTopButton = () => {
    if ($('#backToTop')) return; // Don't create if already exists
    const back = document.createElement('button');
    back.id = 'backToTop';
    back.title = 'Back to top';
    back.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5l-7 7h4v7h6v-7h4z" fill="currentColor"/></svg>`;
    Object.assign(back.style, {
      position: 'fixed', right: '18px', bottom: '18px', width: '48px', height: '48px',
      borderRadius: '999px', display: 'grid', placeItems: 'center', background: 'linear-gradient(45deg,var(--brand),var(--brand-2))',
      color: '#111', boxShadow: '0 8px 26px rgba(0,0,0,.45)', cursor: 'pointer', opacity: '0', transition: 'opacity .26s, transform .26s', zIndex: '1200',
      transform: 'translateY(8px)' // Start hidden and slightly below
    });
    document.body.appendChild(back);
    back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };
  createBackToTopButton(); // Create the button on page load

  // --- View Details Button Navigation ---
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('view') && e.target.dataset.id) {
      const id = e.target.dataset.id;
      window.location.href = `product-detail.html?id=${id}`;
    }
  });

  // --- Init ---
  refreshCart();
  index = buildIndex();
  performSearch();
  document.body.classList.add('loaded');

  // --- Ensure search works on page load (if needed) ---
  // This might not be strictly necessary if performSearch runs correctly on init
  // const event = new Event('input', { bubbles: true });
  // qInput?.dispatchEvent(event);

});

// ✅ Remove the conflicting event listener that was opening cart.html directly
// The correct functionality is now handled in the main DOMContentLoaded event listener above
