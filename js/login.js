// Password toggle function
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Main Login Form Submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Simulate login process
    showLoading(true);
    
    setTimeout(() => {
        showLoading(false);
        
        // Simple validation (in real app, this would be server-side)
        if (email && password) {
            // Check if it's admin login
            if (email === 'admin@store.com' && password === 'admin123') {
                // Store admin login status
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                
                showToast('Admin login successful! Welcome back.', 'success');
                
                // Redirect to admin dashboard after delay
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1500);
            } else {
                // Regular user login
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('isAdmin', 'false');
                
                if (remember) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                showToast('Login successful! Welcome back.', 'success');
                
                // Redirect to home page after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } else {
            showToast('Please fill in all fields', 'error');
        }
    }, 1000);
});

// Social Login Function
function socialLogin(provider) {
    showToast(`Logging in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`, 'info');
    
    // Simulate social login delay
    setTimeout(() => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', `user@${provider}.com`);
        localStorage.setItem('loginMethod', provider);
        
        showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login successful!`, 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }, 1500);
}

// Mobile Navigation Functions
function toggleMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    mobileNav.classList.toggle('open');
}

function closeMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    mobileNav.classList.remove('open');
}

// Cart Functions
function openCart() {
    document.getElementById('drawerBackdrop').classList.add('show');
    document.getElementById('cartDrawer').classList.add('open');
}

function closeCart() {
    document.getElementById('drawerBackdrop').classList.remove('show');
    document.getElementById('cartDrawer').classList.remove('open');
}

// Checkout Function
function proceedToCheckout() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'checkout.html';
    } else {
        showToast('Please login to proceed to checkout', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// Check Login Status for User Menu
function checkLoginStatus() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        // Show user dropdown menu
        showUserMenu();
    } else {
        // Go to login page
        window.location.href = 'login.html';
    }
}

// Show User Dropdown Menu
function showUserMenu() {
    // This would show a dropdown with user options
    showToast('User menu would appear here', 'info');
}

// Loading State for Login Button
function showLoading(show) {
    const loginBtn = document.querySelector('.login-submit');
    if (show) {
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        loginBtn.disabled = true;
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        loginBtn.disabled = false;
    }
}

// Toast notification function
function showToast(message, type) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.gh-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'gh-toast';
    
    // Set icon based on type
    let icon = '';
    switch(type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'exclamation-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
        case 'info':
            icon = 'info-circle';
            break;
        default:
            icon = 'info-circle';
    }
    
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    
    // Add to toast container
    let toastContainer = document.querySelector('.gh-toasts');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'gh-toasts';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// Auto-fill email if remembered
document.addEventListener('DOMContentLoaded', function() {
    // Update user status in header
    const userStatus = document.getElementById('userStatus');
    if (localStorage.getItem('isLoggedIn') === 'true') {
        const email = localStorage.getItem('userEmail');
        userStatus.textContent = email ? email.split('@')[0] : 'Account';
    } else {
        userStatus.textContent = 'Login';
    }
    
    // Auto-fill remembered email
    if (localStorage.getItem('rememberMe') === 'true') {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            document.getElementById('email').value = savedEmail;
            document.getElementById('remember').checked = true;
        }
    }
});

// Close mobile nav when clicking outside
document.addEventListener('click', function(e) {
    const mobileNav = document.getElementById('mobileNav');
    const hamburger = document.querySelector('.hamburger');
    
    if (mobileNav.classList.contains('open') && 
        !mobileNav.contains(e.target) && 
        !hamburger.contains(e.target)) {
        closeMobileNav();
    }
});