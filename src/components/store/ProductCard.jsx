import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if product is in wishlist when component loads
    useEffect(() => {
        const checkWishlistStatus = async () => {
            try {
                const user = await base44.auth.me();
                const items = await base44.entities.Wishlist.filter({
                    user_email: user.email,
                    product_id: product.id
                });
                setIsWishlisted(items.length > 0);
            } catch (error) {
                console.error('Error checking wishlist status:', error);
            }
        };

        checkWishlistStatus();
    }, [product.id]);

    const discount = product.sale_price
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;

    const displayPrice = product.sale_price || product.price;
    const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500';

    const handleWishlistToggle = async (e) => {
        e.stopPropagation();

        try {
            setIsLoading(true);
            const user = await base44.auth.me(); // This will auto-login as customer
            console.log('User:', user);

            if (!isWishlisted) {
                await base44.entities.Wishlist.create({
                    user_email: user.email,
                    product_id: product.id
                });
                toast.success('Added to wishlist');
                setIsWishlisted(true);
                // Dispatch event to update wishlist count in Layout
                window.dispatchEvent(new CustomEvent('wishlistUpdated'));
            } else {
                const items = await base44.entities.Wishlist.filter({
                    user_email: user.email,
                    product_id: product.id
                });
                if (items[0]) {
                    await base44.entities.Wishlist.delete(items[0].id);
                    toast.success('Removed from wishlist');
                    setIsWishlisted(false);
                    // Dispatch event to update wishlist count in Layout
                    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
                }
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAdd = async (e) => {
        e.stopPropagation();

        console.log('Navigating to product:', product.id);
        navigate(`/product/${product.id}`);
    };

    return (
        <div
            className="group cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
        >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
                <img
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {discount > 0 && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                        {discount}% OFF
                    </Badge>
                )}

                {product.total_stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary" className="text-white bg-gray-900">
                            Out of Stock
                        </Badge>
                    </div>
                )}

                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full shadow-lg"
                        onClick={handleWishlistToggle}
                        disabled={isLoading}
                    >
                        <Heart
                            className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                        />
                    </Button>
                </div>

                {product.total_stock > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            className="w-full bg-white text-gray-900 hover:bg-gray-100"
                            size="sm"
                            onClick={handleQuickAdd}
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Quick Add
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="font-medium text-gray-900 truncate group-hover:text-gray-600 transition-colors">
                    {product.title}
                </h3>

                {product.average_rating > 0 && (
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                            {product.average_rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-400">
                            ({product.review_count})
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                        ₹{displayPrice.toLocaleString()}
                    </span>
                    {product.sale_price && (
                        <span className="text-sm text-gray-400 line-through">
                            ₹{product.price.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}