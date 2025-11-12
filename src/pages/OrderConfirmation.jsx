import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(location.search);
    const orderId = urlParams.get('orderId');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            loadOrder();
        }
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const [orderData] = await base44.entities.Order.filter({ id: orderId });
            setOrder(orderData);
        } catch (error) {
            console.error('Error loading order:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
                <Button onClick={() => navigate(createPageUrl('Home'))}>Go to Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600 mb-8">
                        Thank you for your order. We've received it and will process it soon.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                        <div className="grid md:grid-cols-2 gap-6 text-left">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                                <p className="font-semibold text-gray-900">{order.order_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                                <p className="font-semibold text-gray-900 capitalize">
                                    {order.payment_mode === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                <p className="font-semibold text-gray-900">₹{order.total_amount.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Order Status</p>
                                <p className="font-semibold text-gray-900 capitalize">{order.order_status}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-6 mb-8">
                        <div className="flex items-start gap-3 text-left mb-4">
                            <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 mb-1">Delivery Address</p>
                                <p className="text-sm text-gray-600">
                                    {order.shipping_address?.full_name}<br />
                                    {order.shipping_address?.address_line1}, {order.shipping_address?.address_line2 && `${order.shipping_address.address_line2}, `}
                                    {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.postal_code}<br />
                                    Phone: {order.shipping_address?.phone}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-left">
                            <Package className="w-5 h-5 text-gray-600 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 mb-2">Order Items</p>
                                <div className="space-y-2">
                                    {order.order_items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.product_title} × {item.quantity}</span>
                                            <span className="font-medium text-gray-900">₹{item.subtotal.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(createPageUrl('Shop'))}
                        >
                            Continue Shopping
                        </Button>
                        <Button
                            className="flex-1 bg-gray-900 hover:bg-gray-800"
                            onClick={() => navigate(createPageUrl('Orders'))}
                        >
                            View My Orders
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}