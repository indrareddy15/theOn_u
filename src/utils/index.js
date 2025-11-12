// Utility functions for the application

export const createPageUrl = (page, params = '') => {
    const baseRoutes = {
        'Home': '/',
        'Shop': '/shop',
        'ProductDetail': '/product',
        'Cart': '/cart',
        'Checkout': '/checkout',
        'OrderConfirmation': '/order-confirmation',
        'Orders': '/orders',
        'Profile': '/profile',
        'Wishlist': '/wishlist',
        'AdminDashboard': '/admin/dashboard',
        'AdminProducts': '/admin/products',
        'AdminProductForm': '/admin/products/form',
        'AdminOrders': '/admin/orders',
        'AdminInventory': '/admin/inventory',
        'AdminCustomers': '/admin/customers',
        'AdminSupport': '/admin/support',
        'AdminContentManagement': '/admin/content',
        'AdminMarketing': '/admin/marketing',
        'AdminSettings': '/admin/settings'
    };

    // Handle direct routes that already include the base path
    if (page.startsWith('/') || page.includes('/')) {
        return page;
    }

    const route = baseRoutes[page] || '/';
    return params ? `${route}${params.startsWith('?') ? '' : '/'}${params}` : route;
};

export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
};

export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const triggerLoginModal = (returnUrl = null) => {
    window.dispatchEvent(new CustomEvent('openLoginModal', {
        detail: { returnUrl: returnUrl || window.location.pathname }
    }));
};