import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl, triggerLoginModal } from "@/utils";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadCart = useCallback(async () => {
        try {
            const cartItems = await base44.entities.CartItem.filter({ user_email: user.email });
            const itemsWithProducts = await Promise.all(
                cartItems.map(async (item) => {
                    const product = await base44.entities.Product.get(item.product_id);
                    return { ...item, product };
                })
            );
            setCartItems(itemsWithProducts);
        } catch {
            console.error('Error loading cart');
        }
    }, [user?.email]);

    useEffect(() => {
        if (user) {
            loadCart();
        }
    }, [user, loadCart]);

    const loadUser = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
        } catch {
            triggerLoginModal();
        }
    };

    const updateQuantity = async (item, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await base44.entities.CartItem.update(item.id, { quantity: newQuantity });
            setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQuantity } : i));
        } catch {
            toast.error('Failed to update quantity');
        }
    };

    const removeItem = async (itemId) => {
        try {
            await base44.entities.CartItem.delete(itemId);
            setCartItems(prev => prev.filter(i => i.id !== itemId));
            toast.success('Item removed from cart');
        } catch {
            toast.error('Failed to remove item');
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            if (!item.product) return total;
            const price = item.product.sale_price || item.product.price;
            return total + (price * item.quantity);
        }, 0);
    };

    const subtotal = calculateSubtotal();
    const shipping = subtotal > 0 ? (subtotal > 5000 ? 0 : 299) : 0;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>
                    <div>
                        <Skeleton className="h-96 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-8">Add some items to get started</p>
                <Button onClick={() => navigate(createPageUrl('Shop'))}>
                    Continue Shopping
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map(item => {
                            if (!item.product) return null;

                            const price = item.product.sale_price || item.product.price;
                            const mainImage = item.product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200';

                            return (
                                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                                    <div className="flex gap-4">
                                        <img
                                            src={mainImage}
                                            alt={item.product.title}
                                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer"
                                            onClick={() => navigate(`/product/${item.product.id}`)}
                                        />

                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className="font-semibold text-gray-900 mb-1 truncate cursor-pointer hover:text-gray-600"
                                                onClick={() => navigate(`/product/${item.product.id}`)}
                                            >
                                                {item.product.title}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                                                {item.selected_size && (
                                                    <span className="bg-gray-100 px-2 py-1 rounded">Size: {item.selected_size}</span>
                                                )}
                                                {item.selected_color && (
                                                    <span className="bg-gray-100 px-2 py-1 rounded">Color: {item.selected_color}</span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center border-2 rounded-lg">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => updateQuantity(item, item.quantity - 1)}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                    <span className="px-4 font-medium">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => updateQuantity(item, item.quantity + 1)}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <span className="font-semibold text-gray-900">
                                                        ₹{(price * item.quantity).toLocaleString()}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(item.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (GST 18%)</span>
                                    <span>₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            {subtotal < 5000 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                                    Add ₹{(5000 - subtotal).toLocaleString()} more to get FREE shipping!
                                </div>
                            )}

                            <Button
                                className="w-full bg-gray-900 hover:bg-gray-800 mb-3"
                                size="lg"
                                onClick={() => navigate(createPageUrl('Checkout'))}
                            >
                                Proceed to Checkout
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate(createPageUrl('Shop'))}
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}