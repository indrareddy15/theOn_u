// Mock API client for base44
// This is a mock implementation to make the application work without a real backend

class MockBase44Client {
    constructor () {
        this.entities = {
            Product: new MockEntity('Product'),
            Category: new MockEntity('Category'),
            CartItem: new MockEntity('CartItem'),
            Wishlist: new MockEntity('Wishlist'),
            Order: new MockEntity('Order'),
            CustomerReview: new MockEntity('CustomerReview'),
            Disclaimer: new MockEntity('Disclaimer'),
            SupportChat: new MockEntity('SupportChat'),
            Address: new MockEntity('Address'),
            Banner: new MockEntity('Banner'),
            Coupon: new MockEntity('Coupon'),
            ContentPage: new MockEntity('ContentPage'),
            Review: new MockEntity('Review'),
            SizeChart: new MockEntity('SizeChart'),
            User: new MockEntity('User')
        };

        // Mock users for testing
        this.mockUsers = {
            admin: {
                id: 1,
                email: 'admin@test.com',
                name: 'Admin User',
                role: 'admin',
                created_at: new Date().toISOString()
            },
            customer: {
                id: 2,
                email: 'customer@test.com',
                name: 'Test Customer',
                role: 'customer',
                created_at: new Date().toISOString()
            }
        };

        this.auth = {
            me: async () => {
                // Return current mock user or auto-login as customer for testing
                const user = localStorage.getItem('mockUser');
                if (user) {
                    return JSON.parse(user);
                }
                // Auto-login as customer for testing
                const customerUser = this.mockUsers.customer;
                localStorage.setItem('mockUser', JSON.stringify(customerUser));
                console.log('🔐 Auto-logged in as customer:', customerUser);
                return customerUser;
            },
            isAuthenticated: async () => {
                // Always return true for testing - auto-login as customer
                const user = localStorage.getItem('mockUser');
                if (!user) {
                    const customerUser = this.mockUsers.customer;
                    localStorage.setItem('mockUser', JSON.stringify(customerUser));
                }
                return true;
            },
            logout: async () => {
                localStorage.removeItem('mockUser');
                return true;
            },
            redirectToLogin: () => {
                // Auto-login as customer for testing
                const customerUser = this.mockUsers.customer;
                localStorage.setItem('mockUser', JSON.stringify(customerUser));
                return true;
            },

            // Method to switch between users for testing
            loginAs: (userType) => {
                const user = this.mockUsers[userType];
                if (user) {
                    localStorage.setItem('mockUser', JSON.stringify(user));
                    console.log(`🔄 Switched to ${userType} user:`, user);
                    return user;
                }
                console.error(`❌ Unknown user type: ${userType}`);
                return null;
            },

            // Add a method to manually set user (for the login modal)
            setUser: (userData) => {
                localStorage.setItem('mockUser', JSON.stringify(userData));
                return userData;
            }
        };

        this.initMockData();
    }

    // Method to clear all mock data and reinitialize (useful for testing)
    clearAndReinitialize() {
        const mockDataKeys = [
            'mockCategories', 'mockProducts', 'mockCustomerReviews', 'mockDisclaimers',
            'mockOrders', 'mockBanners', 'mockCoupons', 'mockAddresses', 'mockSizeCharts',
            'mockContentPages', 'mockReviews', 'mockSupportChats', 'mockUsers',
            'mockCartItems', 'mockWishlists'
        ];

        mockDataKeys.forEach(key => localStorage.removeItem(key));
        this.initMockData();
        console.log('🔄 Mock data cleared and reinitialized');
    }

    initMockData() {
        // Initialize mock data if not present
        if (!localStorage.getItem('mockCategories')) {
            const categories = [
                {
                    id: 1,
                    name: 'Men\'s Fashion',
                    slug: 'mens-fashion',
                    is_active: true,
                    display_order: 1,
                    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
                    description: 'Discover the latest trends in men\'s clothing and accessories with our premium collection'
                },
                {
                    id: 2,
                    name: 'Women\'s Fashion',
                    slug: 'womens-fashion',
                    is_active: true,
                    display_order: 2,
                    image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500',
                    description: 'Elegant and stylish women\'s clothing collection for every occasion'
                },
                {
                    id: 3,
                    name: 'Electronics',
                    slug: 'electronics',
                    is_active: true,
                    display_order: 3,
                    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                    description: 'Latest gadgets, smartphones, audio devices and electronic accessories'
                },
                {
                    id: 4,
                    name: 'Home & Garden',
                    slug: 'home-garden',
                    is_active: true,
                    display_order: 4,
                    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
                    description: 'Beautiful home decor, furniture and garden essentials for your living space'
                },
                {
                    id: 5,
                    name: 'Sports & Fitness',
                    slug: 'sports',
                    is_active: true,
                    display_order: 5,
                    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
                    description: 'Sports equipment, fitness gear and athletic wear for an active lifestyle'
                },
                {
                    id: 6,
                    name: 'Accessories',
                    slug: 'accessories',
                    is_active: true,
                    display_order: 6,
                    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
                    description: 'Complete your look with stylish bags, watches, jewelry and more'
                },
                {
                    id: 7,
                    name: 'Beauty & Personal Care',
                    slug: 'beauty',
                    is_active: true,
                    display_order: 7,
                    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500',
                    description: 'Premium beauty products, skincare, makeup and personal care essentials'
                },
                {
                    id: 8,
                    name: 'Books & Media',
                    slug: 'books-media',
                    is_active: true,
                    display_order: 8,
                    image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500',
                    description: 'Books, magazines, movies, music and educational materials'
                }
            ];
            localStorage.setItem('mockCategories', JSON.stringify(categories));
        }

        if (!localStorage.getItem('mockProducts')) {
            const products = [
                {
                    id: 1,
                    name: 'Classic T-Shirt',
                    title: 'Classic T-Shirt',
                    price: 1299,
                    sale_price: null,
                    is_featured: true,
                    is_active: true,
                    category_id: 1,
                    category: 'fashion',
                    sub_category: 'tops',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
                    total_stock: 50,
                    average_rating: 4.5,
                    review_count: 23,
                    description: 'A comfortable classic t-shirt made from premium cotton.',
                    sizes: [
                        { size: 'S', stock: 10 },
                        { size: 'M', stock: 15 },
                        { size: 'L', stock: 20 },
                        { size: 'XL', stock: 5 }
                    ],
                    colors: [
                        { name: 'white' },
                        { name: 'black' },
                        { name: 'gray' },
                        { name: 'navy' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Elegant Dress',
                    title: 'Elegant Dress',
                    price: 2899,
                    sale_price: 2199,
                    is_featured: true,
                    is_active: true,
                    category_id: 1,
                    category: 'fashion',
                    sub_category: 'dresses',
                    gender: 'women',
                    image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
                    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500'],
                    total_stock: 25,
                    average_rating: 4.8,
                    review_count: 41,
                    description: 'An elegant dress perfect for special occasions.',
                    sizes: [
                        { size: 'XS', stock: 3 },
                        { size: 'S', stock: 8 },
                        { size: 'M', stock: 10 },
                        { size: 'L', stock: 4 }
                    ],
                    colors: [
                        { name: 'black' },
                        { name: 'red' },
                        { name: 'blue' },
                        { name: 'green' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Wireless Headphones',
                    title: 'Wireless Headphones',
                    price: 3999,
                    sale_price: null,
                    is_featured: false,
                    is_active: true,
                    category_id: 3,
                    category: 'electronics',
                    sub_category: 'audio',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
                    total_stock: 15,
                    average_rating: 4.3,
                    review_count: 67,
                    description: 'High-quality wireless headphones with noise cancellation.',
                    sizes: [],
                    colors: [
                        { name: 'black' },
                        { name: 'white' },
                        { name: 'silver' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 4,
                    name: 'Modern Lamp',
                    title: 'Modern Lamp',
                    price: 2499,
                    sale_price: null,
                    is_featured: true,
                    is_active: true,
                    category_id: 4,
                    category: 'home-garden',
                    sub_category: 'lighting',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'],
                    total_stock: 8,
                    average_rating: 4.6,
                    review_count: 19,
                    description: 'A modern minimalist lamp to brighten up any space.',
                    sizes: [],
                    colors: [
                        { name: 'white' },
                        { name: 'black' },
                        { name: 'brass' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 5,
                    name: 'Denim Jacket',
                    title: 'Denim Jacket',
                    price: 1899,
                    sale_price: 1499,
                    is_featured: true,
                    is_active: true,
                    category_id: 1,
                    category: 'fashion',
                    sub_category: 'outerwear',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400',
                    images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=500'],
                    total_stock: 30,
                    average_rating: 4.4,
                    review_count: 35,
                    description: 'Classic denim jacket with a modern fit.',
                    sizes: [
                        { size: 'S', stock: 8 },
                        { size: 'M', stock: 12 },
                        { size: 'L', stock: 7 },
                        { size: 'XL', stock: 3 }
                    ],
                    colors: [
                        { name: 'blue' },
                        { name: 'black' },
                        { name: 'light-blue' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 6,
                    name: 'Summer Blouse',
                    title: 'Summer Blouse',
                    price: 1599,
                    sale_price: null,
                    is_featured: false,
                    is_active: true,
                    category_id: 2,
                    category: 'fashion',
                    sub_category: 'tops',
                    gender: 'women',
                    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
                    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500'],
                    total_stock: 20,
                    average_rating: 4.2,
                    review_count: 28,
                    description: 'Light and comfortable summer blouse.',
                    sizes: [
                        { size: 'XS', stock: 4 },
                        { size: 'S', stock: 6 },
                        { size: 'M', stock: 8 },
                        { size: 'L', stock: 2 }
                    ],
                    colors: [
                        { name: 'white' },
                        { name: 'pink' },
                        { name: 'yellow' },
                        { name: 'blue' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 7,
                    name: 'Men\'s Sneakers',
                    title: 'Men\'s Sneakers',
                    price: 2299,
                    sale_price: 1899,
                    is_featured: true,
                    is_active: true,
                    category_id: 1,
                    category: 'fashion',
                    sub_category: 'shoes',
                    gender: 'men',
                    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
                    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'],
                    total_stock: 40,
                    average_rating: 4.7,
                    review_count: 52,
                    description: 'Comfortable sneakers for everyday wear.',
                    sizes: [
                        { size: '8', stock: 5 },
                        { size: '9', stock: 10 },
                        { size: '10', stock: 15 },
                        { size: '11', stock: 8 },
                        { size: '12', stock: 2 }
                    ],
                    colors: [
                        { name: 'white' },
                        { name: 'black' },
                        { name: 'gray' },
                        { name: 'navy' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 8,
                    name: 'Lipstick Set',
                    title: 'Lipstick Set',
                    price: 999,
                    sale_price: null,
                    is_featured: false,
                    is_active: true,
                    category_id: 2,
                    category: 'beauty',
                    sub_category: 'makeup',
                    gender: 'women',
                    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
                    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500'],
                    total_stock: 50,
                    average_rating: 4.4,
                    review_count: 84,
                    description: 'Long-lasting lipstick set in various shades.',
                    sizes: [],
                    colors: [
                        { name: 'red' },
                        { name: 'pink' },
                        { name: 'coral' },
                        { name: 'berry' },
                        { name: 'nude' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 9,
                    name: 'Fitness Tracker',
                    title: 'Fitness Tracker',
                    price: 3499,
                    sale_price: null,
                    is_featured: true,
                    is_active: true,
                    category_id: 5,
                    category: 'sports',
                    sub_category: 'fitness',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400',
                    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500'],
                    total_stock: 25,
                    average_rating: 4.5,
                    review_count: 93,
                    description: 'Advanced fitness tracker with heart rate monitoring.',
                    sizes: [
                        { size: 'S', stock: 8 },
                        { size: 'M', stock: 12 },
                        { size: 'L', stock: 5 }
                    ],
                    colors: [
                        { name: 'black' },
                        { name: 'gray' },
                        { name: 'blue' },
                        { name: 'pink' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 10,
                    name: 'Designer Handbag',
                    title: 'Designer Handbag',
                    price: 4999,
                    sale_price: null,
                    is_featured: true,
                    is_active: true,
                    category_id: 6,
                    category: 'accessories',
                    sub_category: 'bags',
                    gender: 'women',
                    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
                    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
                    total_stock: 15,
                    average_rating: 4.8,
                    review_count: 67,
                    description: 'Elegant designer handbag made from genuine leather.',
                    sizes: [],
                    colors: [
                        { name: 'black' },
                        { name: 'brown' },
                        { name: 'tan' },
                        { name: 'red' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 11,
                    name: 'Casual Shorts',
                    title: 'Casual Shorts',
                    price: 1199,
                    sale_price: null,
                    is_featured: false,
                    is_active: true,
                    category_id: 1,
                    category: 'fashion',
                    sub_category: 'bottoms',
                    gender: 'men',
                    image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
                    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500'],
                    total_stock: 35,
                    average_rating: 4.1,
                    review_count: 29,
                    description: 'Comfortable casual shorts for summer.',
                    sizes: [
                        { size: 'S', stock: 8 },
                        { size: 'M', stock: 15 },
                        { size: 'L', stock: 10 },
                        { size: 'XL', stock: 2 }
                    ],
                    colors: [
                        { name: 'khaki' },
                        { name: 'navy' },
                        { name: 'olive' },
                        { name: 'gray' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 12,
                    name: 'Winter Scarf',
                    title: 'Winter Scarf',
                    price: 1399,
                    sale_price: 1099,
                    is_featured: false,
                    is_active: true,
                    category_id: 6,
                    category: 'accessories',
                    sub_category: 'scarves',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400',
                    images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500'],
                    total_stock: 60,
                    average_rating: 4.3,
                    review_count: 18,
                    description: 'Warm and cozy winter scarf.',
                    sizes: [],
                    colors: [
                        { name: 'gray' },
                        { name: 'black' },
                        { name: 'red' },
                        { name: 'blue' },
                        { name: 'white' }
                    ],
                    created_date: new Date().toISOString()
                },
                {
                    id: 13,
                    name: 'Premium Jeans',
                    title: 'Premium Denim Jeans',
                    price: 2499,
                    sale_price: 1999,
                    is_featured: true,
                    is_active: true,
                    category_id: 1,
                    category: 'fashion',
                    sub_category: 'bottoms',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
                    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
                    total_stock: 35,
                    average_rating: 4.7,
                    review_count: 42,
                    description: 'High-quality premium denim jeans with perfect fit and comfort.',
                    sizes: [
                        { size: '28', stock: 8 },
                        { size: '30', stock: 12 },
                        { size: '32', stock: 10 },
                        { size: '34', stock: 5 }
                    ],
                    colors: [
                        { name: 'dark-blue' },
                        { name: 'light-blue' },
                        { name: 'black' }
                    ],
                    created_date: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 14,
                    name: 'Wireless Earbuds',
                    title: 'Pro Wireless Earbuds',
                    price: 2799,
                    sale_price: null,
                    is_featured: true,
                    is_active: true,
                    category_id: 3,
                    category: 'electronics',
                    sub_category: 'audio',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
                    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'],
                    total_stock: 28,
                    average_rating: 4.6,
                    review_count: 89,
                    description: 'Professional wireless earbuds with active noise cancellation and premium sound quality.',
                    sizes: [],
                    colors: [
                        { name: 'white' },
                        { name: 'black' },
                        { name: 'space-gray' }
                    ],
                    created_date: new Date(Date.now() - 172800000).toISOString()
                },
                {
                    id: 15,
                    name: 'Silk Dress',
                    title: 'Elegant Silk Evening Dress',
                    price: 3799,
                    sale_price: 2999,
                    is_featured: true,
                    is_active: true,
                    category_id: 2,
                    category: 'fashion',
                    sub_category: 'dresses',
                    gender: 'women',
                    image_url: 'https://images.unsplash.com/photo-1566479179817-c0a5c4df3e07?w=400',
                    images: ['https://images.unsplash.com/photo-1566479179817-c0a5c4df3e07?w=500'],
                    total_stock: 18,
                    average_rating: 4.9,
                    review_count: 67,
                    description: 'Luxurious silk evening dress perfect for special occasions and formal events.',
                    sizes: [
                        { size: 'XS', stock: 2 },
                        { size: 'S', stock: 6 },
                        { size: 'M', stock: 8 },
                        { size: 'L', stock: 2 }
                    ],
                    colors: [
                        { name: 'navy' },
                        { name: 'emerald' },
                        { name: 'burgundy' },
                        { name: 'black' }
                    ],
                    created_date: new Date(Date.now() - 259200000).toISOString()
                },
                {
                    id: 16,
                    name: 'Gaming Mouse',
                    title: 'RGB Gaming Mouse',
                    price: 1799,
                    sale_price: 1399,
                    is_featured: false,
                    is_active: true,
                    category_id: 3,
                    category: 'electronics',
                    sub_category: 'gaming',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
                    images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500'],
                    total_stock: 42,
                    average_rating: 4.4,
                    review_count: 156,
                    description: 'Professional gaming mouse with customizable RGB lighting and precise tracking.',
                    sizes: [],
                    colors: [
                        { name: 'black' },
                        { name: 'white' },
                        { name: 'rgb' }
                    ],
                    created_date: new Date(Date.now() - 345600000).toISOString()
                },
                {
                    id: 17,
                    name: 'Leather Boots',
                    title: 'Premium Leather Ankle Boots',
                    price: 2999,
                    sale_price: null,
                    is_featured: true,
                    is_active: true,
                    category_id: 1,
                    category: 'fashion',
                    sub_category: 'shoes',
                    gender: 'women',
                    image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400',
                    images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=500'],
                    total_stock: 25,
                    average_rating: 4.8,
                    review_count: 73,
                    description: 'Handcrafted leather ankle boots with superior comfort and style.',
                    sizes: [
                        { size: '6', stock: 4 },
                        { size: '7', stock: 8 },
                        { size: '8', stock: 9 },
                        { size: '9', stock: 4 }
                    ],
                    colors: [
                        { name: 'brown' },
                        { name: 'black' },
                        { name: 'tan' }
                    ],
                    created_date: new Date(Date.now() - 432000000).toISOString()
                },
                {
                    id: 18,
                    name: 'Coffee Maker',
                    title: 'Smart Coffee Maker Pro',
                    price: 4499,
                    sale_price: null,
                    is_featured: false,
                    is_active: true,
                    category_id: 4,
                    category: 'home-garden',
                    sub_category: 'kitchen',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
                    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500'],
                    total_stock: 15,
                    average_rating: 4.5,
                    review_count: 34,
                    description: 'Smart coffee maker with app control and multiple brewing options.',
                    sizes: [],
                    colors: [
                        { name: 'stainless-steel' },
                        { name: 'black' },
                        { name: 'white' }
                    ],
                    created_date: new Date(Date.now() - 518400000).toISOString()
                },
                {
                    id: 19,
                    name: 'Yoga Mat',
                    title: 'Premium Eco-Friendly Yoga Mat',
                    price: 1799,
                    sale_price: 1399,
                    is_featured: false,
                    is_active: true,
                    category_id: 5,
                    category: 'sports',
                    sub_category: 'fitness',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
                    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'],
                    total_stock: 55,
                    average_rating: 4.7,
                    review_count: 128,
                    description: 'Eco-friendly yoga mat with superior grip and comfort for all yoga practices.',
                    sizes: [],
                    colors: [
                        { name: 'purple' },
                        { name: 'pink' },
                        { name: 'blue' },
                        { name: 'green' },
                        { name: 'black' }
                    ],
                    created_date: new Date(Date.now() - 604800000).toISOString()
                },
                {
                    id: 20,
                    name: 'Watch Collection',
                    title: 'Luxury Stainless Steel Watch',
                    price: 4899,
                    sale_price: 3999,
                    is_featured: true,
                    is_active: true,
                    category_id: 6,
                    category: 'accessories',
                    sub_category: 'watches',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
                    total_stock: 12,
                    average_rating: 4.9,
                    review_count: 95,
                    description: 'Luxury timepiece with Swiss movement and premium stainless steel construction.',
                    sizes: [],
                    colors: [
                        { name: 'silver' },
                        { name: 'gold' },
                        { name: 'black' },
                        { name: 'rose-gold' }
                    ],
                    created_date: new Date(Date.now() - 691200000).toISOString()
                },
                {
                    id: 21,
                    name: 'Hoodie',
                    title: 'Premium Cotton Hoodie',
                    price: 1999,
                    sale_price: null,
                    is_featured: false,
                    is_active: true,
                    category_id: 1,
                    category: 'fashion',
                    sub_category: 'tops',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
                    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
                    total_stock: 38,
                    average_rating: 4.6,
                    review_count: 87,
                    description: 'Comfortable premium cotton hoodie with modern fit and cozy interior.',
                    sizes: [
                        { size: 'S', stock: 8 },
                        { size: 'M', stock: 15 },
                        { size: 'L', stock: 12 },
                        { size: 'XL', stock: 3 }
                    ],
                    colors: [
                        { name: 'gray' },
                        { name: 'black' },
                        { name: 'navy' },
                        { name: 'white' },
                        { name: 'burgundy' }
                    ],
                    created_date: new Date(Date.now() - 777600000).toISOString()
                },
                {
                    id: 22,
                    name: 'Smartphone',
                    title: 'Latest Generation Smartphone',
                    price: 4999,
                    sale_price: 4499,
                    is_featured: true,
                    is_active: true,
                    category_id: 3,
                    category: 'electronics',
                    sub_category: 'mobile',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
                    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
                    total_stock: 20,
                    average_rating: 4.8,
                    review_count: 234,
                    description: 'Latest generation smartphone with advanced camera system and powerful performance.',
                    sizes: [],
                    colors: [
                        { name: 'midnight' },
                        { name: 'starlight' },
                        { name: 'product-red' },
                        { name: 'blue' }
                    ],
                    created_date: new Date(Date.now() - 864000000).toISOString()
                },
                {
                    id: 23,
                    name: 'Running Shoes',
                    title: 'Professional Running Shoes',
                    price: 2199,
                    sale_price: 1799,
                    is_featured: true,
                    is_active: true,
                    category_id: 5,
                    category: 'sports',
                    sub_category: 'footwear',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
                    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
                    total_stock: 45,
                    average_rating: 4.7,
                    review_count: 167,
                    description: 'Professional running shoes with advanced cushioning and breathable design.',
                    sizes: [
                        { size: '8', stock: 12 },
                        { size: '9', stock: 15 },
                        { size: '10', stock: 13 },
                        { size: '11', stock: 5 }
                    ],
                    colors: [
                        { name: 'white' },
                        { name: 'black' },
                        { name: 'blue' },
                        { name: 'red' }
                    ],
                    created_date: new Date(Date.now() - 950400000).toISOString()
                },
                {
                    id: 24,
                    name: 'Desk Lamp',
                    title: 'LED Desk Lamp with USB Charging',
                    price: 1699,
                    sale_price: null,
                    is_featured: false,
                    is_active: true,
                    category_id: 4,
                    category: 'home-garden',
                    sub_category: 'lighting',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'],
                    total_stock: 30,
                    average_rating: 4.4,
                    review_count: 56,
                    description: 'Modern LED desk lamp with adjustable brightness and built-in USB charging port.',
                    sizes: [],
                    colors: [
                        { name: 'white' },
                        { name: 'black' },
                        { name: 'silver' }
                    ],
                    created_date: new Date(Date.now() - 1036800000).toISOString()
                },
                {
                    id: 25,
                    name: 'Sunglasses',
                    title: 'Designer Polarized Sunglasses',
                    price: 2299,
                    sale_price: 1899,
                    is_featured: false,
                    is_active: true,
                    category_id: 6,
                    category: 'accessories',
                    sub_category: 'eyewear',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400',
                    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=500'],
                    total_stock: 35,
                    average_rating: 4.5,
                    review_count: 78,
                    description: 'Designer polarized sunglasses with UV protection and premium frames.',
                    sizes: [],
                    colors: [
                        { name: 'black' },
                        { name: 'brown' },
                        { name: 'gold' },
                        { name: 'silver' }
                    ],
                    created_date: new Date(Date.now() - 1123200000).toISOString()
                },
                {
                    id: 26,
                    name: 'Backpack',
                    title: 'Travel Laptop Backpack',
                    price: 1899,
                    sale_price: null,
                    is_featured: false,
                    is_active: true,
                    category_id: 6,
                    category: 'accessories',
                    sub_category: 'bags',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
                    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
                    total_stock: 28,
                    average_rating: 4.6,
                    review_count: 92,
                    description: 'Durable travel backpack with laptop compartment and multiple pockets.',
                    sizes: [],
                    colors: [
                        { name: 'black' },
                        { name: 'gray' },
                        { name: 'navy' },
                        { name: 'brown' }
                    ],
                    created_date: new Date(Date.now() - 1209600000).toISOString()
                },
                {
                    id: 27,
                    name: 'Bedding Set',
                    title: 'Luxury Cotton Bedding Set',
                    price: 2699,
                    sale_price: 2199,
                    is_featured: false,
                    is_active: true,
                    category_id: 4,
                    category: 'home-garden',
                    sub_category: 'bedroom',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'],
                    total_stock: 22,
                    average_rating: 4.7,
                    review_count: 45,
                    description: 'Luxury 100% cotton bedding set with pillowcases and duvet cover.',
                    sizes: [
                        { size: 'Queen', stock: 12 },
                        { size: 'King', stock: 8 },
                        { size: 'Twin', stock: 2 }
                    ],
                    colors: [
                        { name: 'white' },
                        { name: 'cream' },
                        { name: 'gray' },
                        { name: 'navy' }
                    ],
                    created_date: new Date(Date.now() - 1296000000).toISOString()
                },
                {
                    id: 28,
                    name: 'Sports Bottle',
                    title: 'Insulated Stainless Steel Water Bottle',
                    price: 1299,
                    sale_price: 999,
                    is_featured: false,
                    is_active: true,
                    category_id: 5,
                    category: 'sports',
                    sub_category: 'accessories',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
                    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'],
                    total_stock: 75,
                    average_rating: 4.3,
                    review_count: 189,
                    description: 'Insulated stainless steel water bottle that keeps drinks cold for 24h or hot for 12h.',
                    sizes: [
                        { size: '16oz', stock: 25 },
                        { size: '20oz', stock: 30 },
                        { size: '32oz', stock: 20 }
                    ],
                    colors: [
                        { name: 'black' },
                        { name: 'white' },
                        { name: 'blue' },
                        { name: 'pink' },
                        { name: 'green' }
                    ],
                    created_date: new Date(Date.now() - 1382400000).toISOString()
                },
                {
                    id: 29,
                    name: 'Perfume',
                    title: 'Signature Fragrance Collection',
                    price: 2399,
                    sale_price: null,
                    is_featured: true,
                    is_active: true,
                    category_id: 2,
                    category: 'beauty',
                    sub_category: 'fragrance',
                    gender: 'women',
                    image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
                    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'],
                    total_stock: 40,
                    average_rating: 4.8,
                    review_count: 156,
                    description: 'Elegant signature fragrance with floral and woody notes that last all day.',
                    sizes: [
                        { size: '30ml', stock: 15 },
                        { size: '50ml', stock: 20 },
                        { size: '100ml', stock: 5 }
                    ],
                    colors: [
                        { name: 'original' },
                        { name: 'intense' },
                        { name: 'light' }
                    ],
                    created_date: new Date(Date.now() - 1468800000).toISOString()
                },
                {
                    id: 30,
                    name: 'Tablet Stand',
                    title: 'Adjustable Aluminum Tablet Stand',
                    price: 1399,
                    sale_price: 1099,
                    is_featured: false,
                    is_active: true,
                    category_id: 3,
                    category: 'electronics',
                    sub_category: 'accessories',
                    gender: 'unisex',
                    image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
                    images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500'],
                    total_stock: 65,
                    average_rating: 4.4,
                    review_count: 123,
                    description: 'Adjustable aluminum stand compatible with tablets and smartphones up to 12.9 inches.',
                    sizes: [],
                    colors: [
                        { name: 'silver' },
                        { name: 'space-gray' },
                        { name: 'white' },
                        { name: 'black' }
                    ],
                    created_date: new Date(Date.now() - 1555200000).toISOString()
                }
            ];
            localStorage.setItem('mockProducts', JSON.stringify(products));
        }

        if (!localStorage.getItem('mockCustomerReviews')) {
            const reviews = [
                {
                    id: 1,
                    customer_name: 'Sarah Johnson',
                    rating: 5,
                    review_text: 'Absolutely love the quality and style! Will definitely shop here again.',
                    location: 'New York, NY',
                    is_active: true,
                    display_order: 1
                },
                {
                    id: 2,
                    customer_name: 'Mike Chen',
                    rating: 5,
                    review_text: 'Great products and fast shipping. Highly recommended!',
                    location: 'Los Angeles, CA',
                    is_active: true,
                    display_order: 2
                },
                {
                    id: 3,
                    customer_name: 'Emily Davis',
                    rating: 4,
                    review_text: 'Beautiful items and excellent customer service.',
                    location: 'Chicago, IL',
                    is_active: true,
                    display_order: 3
                },
                {
                    id: 4,
                    customer_name: 'David Rodriguez',
                    rating: 5,
                    review_text: 'Amazing shopping experience! The product quality exceeded my expectations.',
                    location: 'Houston, TX',
                    is_active: true,
                    display_order: 4
                },
                {
                    id: 5,
                    customer_name: 'Jennifer Liu',
                    rating: 5,
                    review_text: 'Love the variety and trendy designs. My go-to online store now!',
                    location: 'Seattle, WA',
                    is_active: true,
                    display_order: 5
                },
                {
                    id: 6,
                    customer_name: 'Robert Thompson',
                    rating: 4,
                    review_text: 'Good quality products at reasonable prices. Quick delivery too.',
                    location: 'Phoenix, AZ',
                    is_active: true,
                    display_order: 6
                },
                {
                    id: 7,
                    customer_name: 'Amanda Wilson',
                    rating: 5,
                    review_text: 'Fantastic customer support and premium quality items. Highly satisfied!',
                    location: 'Miami, FL',
                    is_active: true,
                    display_order: 7
                },
                {
                    id: 8,
                    customer_name: 'Carlos Martinez',
                    rating: 4,
                    review_text: 'Great selection of electronics and accessories. Will shop again.',
                    location: 'Denver, CO',
                    is_active: true,
                    display_order: 8
                },
                {
                    id: 9,
                    customer_name: 'Lisa Anderson',
                    rating: 5,
                    review_text: 'The silk dress I ordered was absolutely gorgeous! Perfect fit and quality.',
                    location: 'Boston, MA',
                    is_active: true,
                    display_order: 9
                },
                {
                    id: 10,
                    customer_name: 'Kevin Park',
                    rating: 5,
                    review_text: 'Best online shopping experience! Fast shipping and great packaging.',
                    location: 'Portland, OR',
                    is_active: true,
                    display_order: 10
                }
            ];
            localStorage.setItem('mockCustomerReviews', JSON.stringify(reviews));
        }

        if (!localStorage.getItem('mockDisclaimers')) {
            const disclaimers = [
                {
                    id: 1,
                    title: 'Free Shipping',
                    content: 'Free shipping on orders over $50',
                    icon: 'Truck',
                    position: 'footer',
                    is_active: true,
                    display_order: 1
                },
                {
                    id: 2,
                    title: 'Secure Payment',
                    content: 'Your payment information is safe with us',
                    icon: 'Shield',
                    position: 'footer',
                    is_active: true,
                    display_order: 2
                },
                {
                    id: 3,
                    title: 'Easy Returns',
                    content: '30-day return policy for all items',
                    icon: 'RefreshCw',
                    position: 'footer',
                    is_active: true,
                    display_order: 3
                }
            ];
            localStorage.setItem('mockDisclaimers', JSON.stringify(disclaimers));
        }

        if (!localStorage.getItem('mockOrders')) {
            const orders = [
                {
                    id: 1,
                    order_id: 'ORD-001-2024',
                    user_email: 'customer@test.com',
                    order_status: 'delivered',
                    status: 'delivered',
                    total: 4598,
                    total_amount: 4598,
                    subtotal: 4298,
                    tax: 300.00,
                    shipping: 0.00,
                    created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    delivered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    shipping_address: '123 Main St, New York, NY 10001',
                    items: [
                        { product_id: 1, quantity: 2, price: 1299, subtotal: 2598 },
                        { product_id: 2, quantity: 1, price: 2199, subtotal: 2199 }
                    ],
                    order_items: [
                        { product_id: 1, product_name: 'Classic T-Shirt', quantity: 2, price: 1299, subtotal: 2598 },
                        { product_id: 2, product_name: 'Elegant Dress', quantity: 1, price: 2199, subtotal: 2199 }
                    ]
                },
                {
                    id: 2,
                    order_id: 'ORD-002-2024',
                    user_email: 'customer@test.com',
                    order_status: 'shipped',
                    status: 'shipped',
                    total: 3999,
                    total_amount: 3999,
                    subtotal: 3699,
                    tax: 300.00,
                    shipping: 0.00,
                    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    shipping_address: '123 Main St, New York, NY 10001',
                    items: [
                        { product_id: 3, quantity: 1, price: 3999, subtotal: 3999 }
                    ],
                    order_items: [
                        { product_id: 3, product_name: 'Wireless Headphones', quantity: 1, price: 3999, subtotal: 3999 }
                    ]
                },
                {
                    id: 3,
                    order_id: 'ORD-003-2024',
                    user_email: 'customer@test.com',
                    order_status: 'pending',
                    status: 'pending',
                    total: 2499,
                    total_amount: 2499,
                    subtotal: 2199,
                    tax: 300.00,
                    shipping: 0.00,
                    created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    shipping_address: '123 Main St, New York, NY 10001',
                    items: [
                        { product_id: 4, quantity: 1, price: 2499, subtotal: 2499 }
                    ],
                    order_items: [
                        { product_id: 4, product_name: 'Modern Lamp', quantity: 1, price: 2499, subtotal: 2499 }
                    ]
                },
                {
                    id: 4,
                    order_id: 'ORD-004-2024',
                    user_email: 'john.doe@example.com',
                    order_status: 'processing',
                    status: 'processing',
                    total: 349.97,
                    total_amount: 349.97,
                    subtotal: 329.97,
                    tax: 20.00,
                    shipping: 0.00,
                    created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    shipping_address: '456 Oak Avenue, Los Angeles, CA 90210',
                    items: [
                        { product_id: 13, quantity: 1, price: 69.99, subtotal: 69.99 },
                        { product_id: 22, quantity: 1, price: 799.99, subtotal: 279.98 }
                    ],
                    order_items: [
                        { product_id: 13, product_name: 'Premium Denim Jeans', quantity: 1, price: 69.99, subtotal: 69.99 },
                        { product_id: 22, product_name: 'Latest Generation Smartphone', quantity: 1, price: 799.99, subtotal: 279.98 }
                    ]
                },
                {
                    id: 5,
                    order_id: 'ORD-005-2024',
                    user_email: 'jane.smith@example.com',
                    order_status: 'delivered',
                    status: 'delivered',
                    total: 269.97,
                    total_amount: 269.97,
                    subtotal: 249.97,
                    tax: 20.00,
                    shipping: 0.00,
                    created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    delivered_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    shipping_address: '789 Pine Street, Chicago, IL 60601',
                    items: [
                        { product_id: 15, quantity: 1, price: 149.99, subtotal: 149.99 },
                        { product_id: 20, quantity: 1, price: 299.99, subtotal: 99.98 }
                    ],
                    order_items: [
                        { product_id: 15, product_name: 'Elegant Silk Evening Dress', quantity: 1, price: 149.99, subtotal: 149.99 },
                        { product_id: 20, product_name: 'Luxury Stainless Steel Watch', quantity: 1, price: 299.99, subtotal: 99.98 }
                    ]
                },
                {
                    id: 6,
                    order_id: 'ORD-006-2024',
                    user_email: 'customer@test.com',
                    order_status: 'shipped',
                    status: 'shipped',
                    total: 179.97,
                    total_amount: 179.97,
                    subtotal: 159.97,
                    tax: 20.00,
                    shipping: 0.00,
                    created_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    shipping_address: '123 Main St, New York, NY 10001',
                    items: [
                        { product_id: 17, quantity: 1, price: 149.99, subtotal: 149.99 },
                        { product_id: 28, quantity: 1, price: 19.99, subtotal: 9.98 }
                    ],
                    order_items: [
                        { product_id: 17, product_name: 'Premium Leather Ankle Boots', quantity: 1, price: 149.99, subtotal: 149.99 },
                        { product_id: 28, product_name: 'Insulated Stainless Steel Water Bottle', quantity: 1, price: 19.99, subtotal: 9.98 }
                    ]
                },
                {
                    id: 7,
                    order_id: 'ORD-007-2024',
                    user_email: 'john.doe@example.com',
                    order_status: 'cancelled',
                    status: 'cancelled',
                    total: 59.99,
                    total_amount: 59.99,
                    subtotal: 49.99,
                    tax: 10.00,
                    shipping: 0.00,
                    created_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                    cancelled_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    shipping_address: '456 Oak Avenue, Los Angeles, CA 90210',
                    items: [
                        { product_id: 16, quantity: 1, price: 59.99, subtotal: 49.99 }
                    ],
                    order_items: [
                        { product_id: 16, product_name: 'RGB Gaming Mouse', quantity: 1, price: 59.99, subtotal: 49.99 }
                    ]
                },
                {
                    id: 8,
                    order_id: 'ORD-008-2024',
                    user_email: 'jane.smith@example.com',
                    order_status: 'pending',
                    status: 'pending',
                    total: 159.98,
                    total_amount: 159.98,
                    subtotal: 139.98,
                    tax: 20.00,
                    shipping: 0.00,
                    created_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                    shipping_address: '789 Pine Street, Chicago, IL 60601',
                    items: [
                        { product_id: 21, quantity: 1, price: 69.99, subtotal: 69.99 },
                        { product_id: 19, quantity: 1, price: 39.99, subtotal: 69.99 }
                    ],
                    order_items: [
                        { product_id: 21, product_name: 'Premium Cotton Hoodie', quantity: 1, price: 69.99, subtotal: 69.99 },
                        { product_id: 19, product_name: 'Premium Eco-Friendly Yoga Mat', quantity: 1, price: 39.99, subtotal: 69.99 }
                    ]
                }
            ];
            localStorage.setItem('mockOrders', JSON.stringify(orders));
        }

        if (!localStorage.getItem('mockBanners')) {
            const banners = [
                {
                    id: 1,
                    title: 'Summer Sale',
                    subtitle: 'Up to 50% off on selected items',
                    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
                    link: '/shop',
                    is_active: true,
                    display_order: 1
                },
                {
                    id: 2,
                    title: 'New Collection',
                    subtitle: 'Discover our latest fashion trends',
                    image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
                    link: '/shop?category=womens-fashion',
                    is_active: true,
                    display_order: 2
                },
                {
                    id: 3,
                    title: 'Electronics Deal',
                    subtitle: 'Latest gadgets at unbeatable prices',
                    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                    link: '/shop?category=electronics',
                    is_active: true,
                    display_order: 3
                },
                {
                    id: 4,
                    title: 'Free Shipping',
                    subtitle: 'On orders over $75 - Limited time offer',
                    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
                    link: '/shop',
                    is_active: true,
                    display_order: 4
                }
            ];
            localStorage.setItem('mockBanners', JSON.stringify(banners));
        }

        if (!localStorage.getItem('mockCoupons')) {
            const coupons = [
                {
                    id: 1,
                    code: 'WELCOME10',
                    discount_type: 'percentage',
                    discount_value: 10,
                    min_order_value: 50,
                    is_active: true,
                    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    code: 'SAVE20',
                    discount_type: 'percentage',
                    discount_value: 20,
                    min_order_value: 100,
                    is_active: true,
                    expiry_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 3,
                    code: 'FREESHIP',
                    discount_type: 'shipping',
                    discount_value: 0,
                    min_order_value: 75,
                    is_active: true,
                    expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 4,
                    code: 'SUMMER25',
                    discount_type: 'percentage',
                    discount_value: 25,
                    min_order_value: 150,
                    is_active: true,
                    expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 5,
                    code: 'FLAT50',
                    discount_type: 'fixed',
                    discount_value: 50,
                    min_order_value: 200,
                    is_active: true,
                    expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 6,
                    code: 'NEWUSER15',
                    discount_type: 'percentage',
                    discount_value: 15,
                    min_order_value: 75,
                    is_active: true,
                    expiry_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];
            localStorage.setItem('mockCoupons', JSON.stringify(coupons));
        }

        if (!localStorage.getItem('mockAddresses')) {
            const addresses = [
                {
                    id: 1,
                    user_email: 'user@example.com',
                    type: 'home',
                    full_name: 'John Doe',
                    address_line_1: '123 Main Street',
                    city: 'New York',
                    state: 'NY',
                    postal_code: '10001',
                    country: 'USA',
                    phone: '+1234567890',
                    is_default: true
                }
            ];
            localStorage.setItem('mockAddresses', JSON.stringify(addresses));
        }

        if (!localStorage.getItem('mockSizeCharts')) {
            const sizeCharts = [
                {
                    id: 1,
                    category_id: 1,
                    size: 'M',
                    chest: '40',
                    waist: '32',
                    length: '28'
                }
            ];
            localStorage.setItem('mockSizeCharts', JSON.stringify(sizeCharts));
        }

        if (!localStorage.getItem('mockContentPages')) {
            const contentPages = [
                {
                    id: 1,
                    slug: 'about',
                    title: 'About Us',
                    content: 'Welcome to TheOn - your destination for premium fashion.',
                    is_active: true
                }
            ];
            localStorage.setItem('mockContentPages', JSON.stringify(contentPages));
        }

        if (!localStorage.getItem('mockReviews')) {
            const reviews = [
                {
                    id: 1,
                    product_id: 1,
                    user_email: 'customer@test.com',
                    rating: 5,
                    review_text: 'Great product! Highly recommended. Very comfortable and good quality.',
                    is_verified: true,
                    created_date: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 2,
                    product_id: 1,
                    user_email: 'john.doe@example.com',
                    rating: 4,
                    review_text: 'Good quality t-shirt, fits well. The material is soft and comfortable.',
                    is_verified: true,
                    created_date: new Date(Date.now() - 172800000).toISOString()
                },
                {
                    id: 3,
                    product_id: 2,
                    user_email: 'jane.smith@example.com',
                    rating: 5,
                    review_text: 'Beautiful dress! Perfect for special occasions. The fabric is luxurious.',
                    is_verified: true,
                    created_date: new Date(Date.now() - 259200000).toISOString()
                },
                {
                    id: 4,
                    product_id: 13,
                    user_email: 'customer@test.com',
                    rating: 5,
                    review_text: 'Best jeans I\'ve ever owned! Perfect fit and excellent quality denim.',
                    is_verified: true,
                    created_date: new Date(Date.now() - 345600000).toISOString()
                },
                {
                    id: 5,
                    product_id: 14,
                    user_email: 'john.doe@example.com',
                    rating: 4,
                    review_text: 'Great sound quality and the noise cancellation works perfectly.',
                    is_verified: true,
                    created_date: new Date(Date.now() - 432000000).toISOString()
                },
                {
                    id: 6,
                    product_id: 15,
                    user_email: 'jane.smith@example.com',
                    rating: 5,
                    review_text: 'Absolutely stunning dress! The silk feels amazing and the cut is perfect.',
                    is_verified: true,
                    created_date: new Date(Date.now() - 518400000).toISOString()
                },
                {
                    id: 7,
                    product_id: 22,
                    user_email: 'alice.wilson@example.com',
                    rating: 5,
                    review_text: 'Amazing phone! Camera quality is outstanding and performance is smooth.',
                    is_verified: true,
                    created_date: new Date(Date.now() - 604800000).toISOString()
                },
                {
                    id: 8,
                    product_id: 20,
                    user_email: 'customer@test.com',
                    rating: 5,
                    review_text: 'Luxury watch that looks and feels premium. Worth every penny!',
                    is_verified: true,
                    created_date: new Date(Date.now() - 691200000).toISOString()
                },
                {
                    id: 9,
                    product_id: 23,
                    user_email: 'john.doe@example.com',
                    rating: 4,
                    review_text: 'Comfortable running shoes with great support. Perfect for my daily runs.',
                    is_verified: true,
                    created_date: new Date(Date.now() - 777600000).toISOString()
                },
                {
                    id: 10,
                    product_id: 17,
                    user_email: 'jane.smith@example.com',
                    rating: 5,
                    review_text: 'Beautiful leather boots! High quality craftsmanship and very comfortable.',
                    is_verified: true,
                    created_date: new Date(Date.now() - 864000000).toISOString()
                }
            ];
            localStorage.setItem('mockReviews', JSON.stringify(reviews));
        }

        if (!localStorage.getItem('mockSupportChats')) {
            const supportChats = [
                {
                    id: 1,
                    user_email: 'customer@test.com',
                    user_name: 'Test Customer',
                    message: 'Hello, I need help with my order.',
                    last_message: 'Thank you for your help!',
                    status: 'resolved',
                    is_from_customer: false,
                    unread_count: 0,
                    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_date: new Date(Date.now() - 3600000).toISOString(),
                    messages: [
                        {
                            sender: 'Test Customer',
                            message: 'Hello, I need help with my order.',
                            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                            is_admin: false
                        },
                        {
                            sender: 'Support Team',
                            message: 'Hi! I\'d be happy to help you with your order. Could you please provide your order number?',
                            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000).toISOString(),
                            is_admin: true
                        },
                        {
                            sender: 'Test Customer',
                            message: 'My order number is ORD-002-2024',
                            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 600000).toISOString(),
                            is_admin: false
                        },
                        {
                            sender: 'Support Team',
                            message: 'I can see your order has been shipped and should arrive within 2-3 business days. You can track it using the tracking number sent to your email.',
                            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 900000).toISOString(),
                            is_admin: true
                        },
                        {
                            sender: 'Test Customer',
                            message: 'Thank you for your help!',
                            timestamp: new Date(Date.now() - 3600000).toISOString(),
                            is_admin: false
                        }
                    ]
                },
                {
                    id: 2,
                    user_email: 'john.doe@example.com',
                    user_name: 'John Doe',
                    message: 'I have a question about sizing.',
                    last_message: 'I have a question about sizing.',
                    status: 'in_progress',
                    is_from_customer: true,
                    unread_count: 1,
                    created_date: new Date(Date.now() - 86400000).toISOString(),
                    updated_date: new Date(Date.now() - 86400000).toISOString(),
                    messages: [
                        {
                            sender: 'John Doe',
                            message: 'I have a question about sizing.',
                            timestamp: new Date(Date.now() - 86400000).toISOString(),
                            is_admin: false
                        },
                        {
                            sender: 'Support Team',
                            message: 'Sure, I can help you with that. What product are you looking at?',
                            timestamp: new Date(Date.now() - 82800000).toISOString(),
                            is_admin: true
                        },
                        {
                            sender: 'John Doe',
                            message: 'I\'m interested in the Premium Denim Jeans. I usually wear size 32, but I\'m not sure if they run true to size.',
                            timestamp: new Date(Date.now() - 82500000).toISOString(),
                            is_admin: false
                        }
                    ]
                },
                {
                    id: 3,
                    user_email: 'jane.smith@example.com',
                    user_name: 'Jane Smith',
                    message: 'Can I return an item if it doesn\'t fit?',
                    last_message: 'Perfect, thank you for the quick response!',
                    status: 'resolved',
                    is_from_customer: false,
                    unread_count: 0,
                    created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    messages: [
                        {
                            sender: 'Jane Smith',
                            message: 'Can I return an item if it doesn\'t fit?',
                            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                            is_admin: false
                        },
                        {
                            sender: 'Support Team',
                            message: 'Absolutely! We have a 30-day return policy for all items. Just make sure the item is in its original condition with tags attached.',
                            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 600000).toISOString(),
                            is_admin: true
                        },
                        {
                            sender: 'Jane Smith',
                            message: 'Perfect, thank you for the quick response!',
                            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                            is_admin: false
                        }
                    ]
                },
                {
                    id: 4,
                    user_email: 'customer@test.com',
                    user_name: 'Test Customer',
                    message: 'When will my order ship?',
                    last_message: 'When will my order ship?',
                    status: 'new',
                    is_from_customer: true,
                    unread_count: 1,
                    created_date: new Date(Date.now() - 3600000).toISOString(),
                    updated_date: new Date(Date.now() - 3600000).toISOString(),
                    messages: [
                        {
                            sender: 'Test Customer',
                            message: 'When will my order ship?',
                            timestamp: new Date(Date.now() - 3600000).toISOString(),
                            is_admin: false
                        }
                    ]
                },
                {
                    id: 5,
                    user_email: 'alice.wilson@example.com',
                    user_name: 'Alice Wilson',
                    message: 'I received the wrong item in my order.',
                    last_message: 'We\'ll send you a return label right away.',
                    status: 'in_progress',
                    is_from_customer: false,
                    unread_count: 0,
                    created_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                    messages: [
                        {
                            sender: 'Alice Wilson',
                            message: 'I received the wrong item in my order.',
                            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                            is_admin: false
                        },
                        {
                            sender: 'Support Team',
                            message: 'I\'m sorry to hear that! Could you please tell me what you ordered and what you received?',
                            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
                            is_admin: true
                        },
                        {
                            sender: 'Alice Wilson',
                            message: 'I ordered a black hoodie in size M, but received a gray one in size L.',
                            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
                            is_admin: false
                        },
                        {
                            sender: 'Support Team',
                            message: 'We\'ll send you a return label right away and ship the correct item to you today.',
                            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                            is_admin: true
                        }
                    ]
                }
            ];
            localStorage.setItem('mockSupportChats', JSON.stringify(supportChats));
        }

        // Initialize users if not exists
        if (!localStorage.getItem('mockUsers')) {
            const users = [
                {
                    id: 1,
                    email: 'admin@test.com',
                    name: 'Admin User',
                    role: 'admin',
                    is_active: true,
                    created_date: new Date().toISOString()
                },
                {
                    id: 2,
                    email: 'customer@test.com',
                    name: 'Test Customer',
                    role: 'user',
                    is_active: true,
                    created_date: new Date().toISOString()
                },
                {
                    id: 3,
                    email: 'john.doe@example.com',
                    name: 'John Doe',
                    role: 'user',
                    is_active: true,
                    created_date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
                },
                {
                    id: 4,
                    email: 'jane.smith@example.com',
                    name: 'Jane Smith',
                    role: 'user',
                    is_active: true,
                    created_date: new Date(Date.now() - 2 * 86400000).toISOString() // 2 days ago
                }
            ];
            localStorage.setItem('mockUsers', JSON.stringify(users));
        }

        // Initialize cart items if not exists
        if (!localStorage.getItem('mockCartItems')) {
            const cartItems = [
                {
                    id: 1,
                    user_email: 'customer@test.com',
                    product_id: 1,
                    quantity: 2,
                    selected_size: 'M',
                    selected_color: 'white',
                    added_date: new Date().toISOString()
                },
                {
                    id: 2,
                    user_email: 'customer@test.com',
                    product_id: 14,
                    quantity: 1,
                    selected_size: null,
                    selected_color: 'black',
                    added_date: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
                },
                {
                    id: 3,
                    user_email: 'customer@test.com',
                    product_id: 23,
                    quantity: 1,
                    selected_size: '10',
                    selected_color: 'white',
                    added_date: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
                },
                {
                    id: 4,
                    user_email: 'john.doe@example.com',
                    product_id: 13,
                    quantity: 1,
                    selected_size: '32',
                    selected_color: 'dark-blue',
                    added_date: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
                },
                {
                    id: 5,
                    user_email: 'jane.smith@example.com',
                    product_id: 15,
                    quantity: 1,
                    selected_size: 'S',
                    selected_color: 'navy',
                    added_date: new Date(Date.now() - 14400000).toISOString() // 4 hours ago
                }
            ];
            localStorage.setItem('mockCartItems', JSON.stringify(cartItems));
        }

        // Initialize wishlist if not exists
        if (!localStorage.getItem('mockWishlists')) {
            const wishlistItems = [
                {
                    id: 1,
                    user_email: 'customer@test.com',
                    product_id: 2,
                    added_date: new Date().toISOString()
                },
                {
                    id: 2,
                    user_email: 'customer@test.com',
                    product_id: 15,
                    added_date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
                },
                {
                    id: 3,
                    user_email: 'customer@test.com',
                    product_id: 20,
                    added_date: new Date(Date.now() - 2 * 86400000).toISOString() // 2 days ago
                },
                {
                    id: 4,
                    user_email: 'customer@test.com',
                    product_id: 22,
                    added_date: new Date(Date.now() - 3 * 86400000).toISOString() // 3 days ago
                },
                {
                    id: 5,
                    user_email: 'john.doe@example.com',
                    product_id: 17,
                    added_date: new Date(Date.now() - 4 * 86400000).toISOString() // 4 days ago
                },
                {
                    id: 6,
                    user_email: 'jane.smith@example.com',
                    product_id: 29,
                    added_date: new Date(Date.now() - 5 * 86400000).toISOString() // 5 days ago
                },
                {
                    id: 7,
                    user_email: 'customer@test.com',
                    product_id: 26,
                    added_date: new Date(Date.now() - 6 * 86400000).toISOString() // 6 days ago
                }
            ];
            localStorage.setItem('mockWishlists', JSON.stringify(wishlistItems));
        }
    }
}

class MockEntity {
    constructor (entityName) {
        this.entityName = entityName;
        this.storageKey = `mock${entityName}s`;
    }

    async filter(filters = {}, orderBy = 'id', limit = null) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        let filtered = data.filter(item => {
            for (const [key, value] of Object.entries(filters)) {
                if (item[key] !== value) return false;
            }
            return true;
        });

        // Simple sorting
        if (orderBy.startsWith('-')) {
            const field = orderBy.substring(1);
            filtered.sort((a, b) => new Date(b[field]) - new Date(a[field]));
        } else {
            filtered.sort((a, b) => {
                if (typeof a[orderBy] === 'string') {
                    return a[orderBy].localeCompare(b[orderBy]);
                }
                return a[orderBy] - b[orderBy];
            });
        }

        return limit ? filtered.slice(0, limit) : filtered;
    }

    async get(id) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        return data.find(item => item.id === id);
    }

    async create(item) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const newId = Math.max(0, ...data.map(i => i.id)) + 1;
        const newItem = { ...item, id: newId, created_date: new Date().toISOString() };
        data.push(newItem);
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return newItem;
    }

    async update(id, updates) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates, updated_date: new Date().toISOString() };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return data[index];
        }
        throw new Error(`${this.entityName} not found`);
    }

    async delete(id) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const filtered = data.filter(item => item.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        return true;
    }

    async list(orderBy = 'id', limit = null) {
        // list() is essentially filter() with no filters
        return this.filter({}, orderBy, limit);
    }
}

export const base44 = new MockBase44Client();