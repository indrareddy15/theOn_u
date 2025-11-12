import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ProductCard from "@/components/store/ProductCard";

export default function Wishlist() {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (user) {
            loadWishlist();
        }
    }, [user]);

    const loadUser = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
        } catch (error) {
            base44.auth.redirectToLogin(window.location.pathname);
        }
    };

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const items = await base44.entities.Wishlist.filter({ user_email: user.email });
            setWishlistItems(items);

            // Load product details
            const productIds = [...new Set(items.map(item => item.product_id))];
            const productData = {};
            for (const id of productIds) {
                const [product] = await base44.entities.Product.filter({ id });
                if (product) productData[id] = product;
            }
            setProducts(productData);
        } catch (error) {
            console.error('Error loading wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (itemId) => {
        try {
            await base44.entities.Wishlist.delete(itemId);
            setWishlistItems(prev => prev.filter(i => i.id !== itemId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const addToCart = async (product) => {
        try {
            await base44.entities.CartItem.create({
                user_email: user.email,
                product_id: product.id,
                quantity: 1,
                price: product.sale_price || product.price
            });
            toast.success('Added to cart');
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-80 rounded-2xl" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-600 mb-8">Save items you love to buy them later</p>
                    <Button onClick={() => navigate(createPageUrl('Shop'))}>
                        Continue Shopping
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                        <p className="text-gray-600 mt-1">{wishlistItems.length} items</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlistItems.map(item => {
                        const product = products[item.product_id];
                        if (!product) return null;

                        return (
                            <div key={item.id} className="group relative">
                                <ProductCard product={product} />

                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-full shadow-lg"
                                        onClick={() => removeFromWishlist(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                    {product.total_stock > 0 && (
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="rounded-full shadow-lg"
                                            onClick={() => addToCart(product)}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}