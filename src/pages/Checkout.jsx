import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, CreditCard, Plus, Check, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Checkout() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState({});
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMode, setPaymentMode] = useState('cod');
    const [loading, setLoading] = useState(true);
    const [addressDialogOpen, setAddressDialogOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [verifyingCoupon, setVerifyingCoupon] = useState(false);
    const [newAddress, setNewAddress] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        address_type: 'home',
        is_default: false
    });

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (user) {
            loadCheckoutData();
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

    const loadCheckoutData = async () => {
        try {
            setLoading(true);
            const [items, userAddresses] = await Promise.all([
                base44.entities.CartItem.filter({ user_email: user.email }),
                base44.entities.Address.filter({ user_email: user.email })
            ]);

            if (items.length === 0) {
                navigate(createPageUrl('Cart'));
                return;
            }

            setCartItems(items);

            // Load product details
            const productIds = [...new Set(items.map(item => item.product_id))];
            const productData = {};
            for (const id of productIds) {
                const [product] = await base44.entities.Product.filter({ id });
                if (product) productData[id] = product;
            }
            setProducts(productData);

            setAddresses(userAddresses);
            const defaultAddress = userAddresses.find(a => a.is_default);
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
            } else if (userAddresses.length > 0) {
                setSelectedAddressId(userAddresses[0].id);
            }
        } catch (error) {
            console.error('Error loading checkout data:', error);
            toast.error('Failed to load checkout data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async () => {
        if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const address = await base44.entities.Address.create({
                ...newAddress,
                user_email: user.email
            });
            setAddresses([...addresses, address]);
            setSelectedAddressId(address.id);
            setAddressDialogOpen(false);
            setNewAddress({
                full_name: '',
                phone: '',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                postal_code: '',
                country: 'India',
                address_type: 'home',
                is_default: false
            });
            toast.success('Address added successfully');
        } catch (error) {
            toast.error('Failed to add address');
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        try {
            setVerifyingCoupon(true);
            const coupons = await base44.entities.Coupon.filter({
                code: couponCode.toUpperCase(),
                is_active: true
            });

            if (coupons.length === 0) {
                toast.error('Invalid coupon code');
                return;
            }

            const coupon = coupons[0];

            // Validate coupon
            const now = new Date();
            if (coupon.valid_from && new Date(coupon.valid_from) > now) {
                toast.error('This coupon is not yet valid');
                return;
            }
            if (coupon.valid_until && new Date(coupon.valid_until) < now) {
                toast.error('This coupon has expired');
                return;
            }
            if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
                toast.error('This coupon has reached its usage limit');
                return;
            }

            const subtotal = calculateSubtotal();
            if (coupon.min_order_value && subtotal < coupon.min_order_value) {
                toast.error(`Minimum order value of ₹${coupon.min_order_value} required`);
                return;
            }

            setAppliedCoupon(coupon);
            toast.success('Coupon applied successfully!');
        } catch (error) {
            toast.error('Failed to apply coupon');
        } finally {
            setVerifyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        toast.success('Coupon removed');
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            const product = products[item.product_id];
            if (!product) return total;
            const price = product.sale_price || product.price;
            return total + (price * item.quantity);
        }, 0);
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;

        const subtotal = calculateSubtotal();
        let discount = 0;

        if (appliedCoupon.discount_type === 'percentage') {
            discount = (subtotal * appliedCoupon.discount_value) / 100;
            if (appliedCoupon.max_discount) {
                discount = Math.min(discount, appliedCoupon.max_discount);
            }
        } else {
            discount = appliedCoupon.discount_value;
        }

        return Math.min(discount, subtotal);
    };

    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = subtotal > 0 ? (subtotal > 2000 ? 0 : 99) : 0;
    const tax = Math.round((subtotal - discount) * 0.18);
    const total = subtotal - discount + shipping + tax;

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error('Please select a delivery address');
            return;
        }

        try {
            const selectedAddress = addresses.find(a => a.id === selectedAddressId);
            const orderItems = cartItems.map(item => {
                const product = products[item.product_id];
                return {
                    product_id: item.product_id,
                    product_title: product.title,
                    product_image: product.images?.[0],
                    quantity: item.quantity,
                    size: item.selected_size,
                    color: item.selected_color,
                    price: product.sale_price || product.price,
                    subtotal: (product.sale_price || product.price) * item.quantity
                };
            });

            const order = await base44.entities.Order.create({
                order_id: `ORD${Date.now()}`,
                user_email: user.email,
                order_items: orderItems,
                shipping_address: selectedAddress,
                subtotal,
                shipping_fee: shipping,
                tax,
                discount,
                total_amount: total,
                payment_mode: paymentMode,
                payment_status: paymentMode === 'cod' ? 'pending' : 'completed',
                order_status: 'pending',
                coupon_code: appliedCoupon?.code
            });

            // Update coupon usage if applied
            if (appliedCoupon) {
                await base44.entities.Coupon.update(appliedCoupon.id, {
                    usage_count: (appliedCoupon.usage_count || 0) + 1
                });
            }

            // Clear cart
            for (const item of cartItems) {
                await base44.entities.CartItem.delete(item.id);
            }

            toast.success('Order placed successfully!');
            navigate(createPageUrl(`OrderConfirmation?orderId=${order.id}`));
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                    </div>
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Delivery Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {addresses.length === 0 ? (
                                    <p className="text-gray-600 text-sm">No saved addresses. Please add one.</p>
                                ) : (
                                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                                        {addresses.map(address => (
                                            <div key={address.id} className="flex items-start gap-3 p-4 border rounded-lg">
                                                <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                                                <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-gray-900">{address.full_name}</span>
                                                        {address.is_default && (
                                                            <Badge variant="secondary" className="text-xs">Default</Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-xs capitalize">{address.address_type}</Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
                                                        {address.city}, {address.state} - {address.postal_code}
                                                    </p>
                                                    <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}

                                <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add New Address
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Address</DialogTitle>
                                        </DialogHeader>

                                        <div className="flex-1 overflow-y-auto px-6 py-6">
                                            <div className="space-y-6">
                                                {/* Personal Information Section */}
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-700">Full Name *</Label>
                                                            <Input
                                                                value={newAddress.full_name}
                                                                onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                                                placeholder="John Doe"
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-700">Phone Number *</Label>
                                                            <Input
                                                                value={newAddress.phone}
                                                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                                placeholder="+91 1234567890"
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-700 block mb-3">Address Type</Label>
                                                        <select
                                                            value={newAddress.address_type}
                                                            onChange={(e) => setNewAddress({ ...newAddress, address_type: e.target.value })}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                                        >
                                                            <option value="home">Home</option>
                                                            <option value="office">Office</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Address Information Section */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-700">Address Line 1 *</Label>
                                                        <Input
                                                            value={newAddress.address_line1}
                                                            onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                                                            placeholder="House/Flat No, Street"
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-700">Address Line 2</Label>
                                                        <Input
                                                            value={newAddress.address_line2}
                                                            onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                                                            placeholder="Landmark, Area"
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-700">City *</Label>
                                                            <Input
                                                                value={newAddress.city}
                                                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                                placeholder="Mumbai"
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-700">State *</Label>
                                                            <Input
                                                                value={newAddress.state}
                                                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                                placeholder="Maharashtra"
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-700">Postal Code *</Label>
                                                            <Input
                                                                value={newAddress.postal_code}
                                                                onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                                                                placeholder="400001"
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                                            <Button
                                                variant="outline"
                                                onClick={() => setAddressDialogOpen(false)}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleAddAddress}
                                                className="flex-1 bg-gray-900 hover:bg-gray-800"
                                            >
                                                Save Address
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>

                        {/* Payment Mode */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Method
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={paymentMode} onValueChange={setPaymentMode}>
                                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                                        <RadioGroupItem value="cod" id="cod" />
                                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                                            <span className="font-medium">Cash on Delivery</span>
                                            <p className="text-sm text-gray-600">Pay when you receive the product</p>
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 border rounded-lg opacity-50">
                                        <RadioGroupItem value="prepaid" id="prepaid" disabled />
                                        <Label htmlFor="prepaid" className="flex-1">
                                            <span className="font-medium">Online Payment</span>
                                            <p className="text-sm text-gray-600">Pay now (Coming Soon)</p>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Items Preview */}
                                <div className="space-y-3 max-h-48 overflow-y-auto">
                                    {cartItems.map(item => {
                                        const product = products[item.product_id];
                                        if (!product) return null;
                                        return (
                                            <div key={item.id} className="flex gap-3">
                                                <img
                                                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'}
                                                    alt={product.title}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Qty: {item.quantity} {item.selected_size && `• Size: ${item.selected_size}`}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Separator />

                                {/* Coupon Section */}
                                <div>
                                    <Label className="flex items-center gap-2 mb-2">
                                        <Tag className="w-4 h-4" />
                                        Have a Coupon?
                                    </Label>
                                    {!appliedCoupon ? (
                                        <div className="flex gap-2">
                                            <Input
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter coupon code"
                                                className="uppercase"
                                            />
                                            <Button onClick={handleApplyCoupon} disabled={verifyingCoupon}>
                                                {verifyingCoupon ? 'Applying...' : 'Apply'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-green-900">{appliedCoupon.code}</p>
                                                    <p className="text-xs text-green-600">
                                                        {appliedCoupon.discount_type === 'percentage'
                                                            ? `${appliedCoupon.discount_value}% off`
                                                            : `₹${appliedCoupon.discount_value} off`}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Price Breakdown */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cartItems.length} items)</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>Coupon Discount</span>
                                            <span>-₹{discount.toLocaleString()}</span>
                                        </div>
                                    )}
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
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>₹{total.toLocaleString()}</span>
                                    </div>
                                </div>

                                {subtotal < 2000 && !appliedCoupon && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                                        Add ₹{(2000 - subtotal).toLocaleString()} more to get FREE shipping!
                                    </div>
                                )}

                                <Button
                                    className="w-full bg-gray-900 hover:bg-gray-800"
                                    size="lg"
                                    onClick={handlePlaceOrder}
                                    disabled={!selectedAddressId}
                                >
                                    Place Order
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}