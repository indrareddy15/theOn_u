import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from "@/api/base44Client";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Package, Clock, CheckCircle2, XCircle, Truck,
    MapPin, CreditCard, Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format, isValid } from "date-fns";

export default function Orders() {
    const navigate = useNavigate();
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const orderIdParam = urlParams.get('orderId');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadOrders = useCallback(async () => {
        try {
            const ordersData = await base44.entities.Order.filter({ user_email: user.email }, '-created_date');
            setOrders(ordersData);
            setLoading(false);
        } catch {
            console.error('Error loading orders');
            setLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user, loadOrders]);

    useEffect(() => {
        if (orderIdParam && orders.length > 0) {
            const order = orders.find(o => o.id === orderIdParam);
            if (order) {
                setSelectedOrder(order);
                setOrderDialogOpen(true);
            }
        }
    }, [orderIdParam, orders]);

    const loadUser = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
        } catch {
            base44.auth.redirectToLogin(window.location.pathname);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            packed: 'bg-purple-100 text-purple-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            out_for_delivery: 'bg-cyan-100 text-cyan-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            returned: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: Clock,
            processing: Package,
            packed: Package,
            shipped: Truck,
            out_for_delivery: Truck,
            delivered: CheckCircle2,
            cancelled: XCircle,
            returned: XCircle
        };
        const Icon = icons[status] || Clock;
        return <Icon className="w-4 h-4" />;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                    <p className="text-gray-600 mb-8">Start shopping to see your orders here</p>
                    <Button onClick={() => navigate(createPageUrl('Shop'))}>
                        Start Shopping
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

                <div className="space-y-4">
                    {orders.map(order => (
                        <Card
                            key={order.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                                setSelectedOrder(order);
                                setOrderDialogOpen(true);
                            }}
                        >
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">{order.order_id}</h3>
                                            <Badge className={`capitalize ${getStatusColor(order.order_status)}`}>
                                                <span className="flex items-center gap-1">
                                                    {getStatusIcon(order.order_status)}
                                                    {order.order_status ? order.order_status.replace('_', ' ') : 'N/A'}
                                                </span>
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {order.created_date && isValid(new Date(order.created_date)) ?
                                                    format(new Date(order.created_date), 'MMM dd, yyyy') :
                                                    'N/A'
                                                }
                                            </span>
                                            <span>{order.order_items?.length || 0} items</span>
                                            <span className="capitalize">
                                                {order.payment_mode === 'cod' ? 'Cash on Delivery' : 'Prepaid'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₹{order.total_amount ? order.total_amount.toLocaleString() : '0'}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="mt-4 flex gap-3 overflow-x-auto">
                                    {order.order_items?.slice(0, 4).map((item, idx) => (
                                        <div key={idx} className="flex-shrink-0">
                                            {item.product_image && (
                                                <img
                                                    src={item.product_image}
                                                    alt={item.product_title}
                                                    className="w-16 h-16 object-cover rounded-lg border"
                                                />
                                            )}
                                        </div>
                                    ))}
                                    {order.order_items?.length > 4 && (
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600">
                                            +{order.order_items.length - 4}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Order Details Dialog */}
            <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
                                    <span>Order Details - {selectedOrder.order_id}</span>
                                    <Badge className={`capitalize ${getStatusColor(selectedOrder.order_status)}`}>
                                        {selectedOrder.order_status.replace('_', ' ')}
                                    </Badge>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                {/* Order Timeline */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Order Timeline</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Order Placed</p>
                                                <p className="text-sm text-gray-600">
                                                    {selectedOrder.created_date && isValid(new Date(selectedOrder.created_date)) ?
                                                        format(new Date(selectedOrder.created_date), 'MMM dd, yyyy HH:mm') :
                                                        'N/A'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        {selectedOrder.delivered_at && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Delivered</p>
                                                    <p className="text-sm text-gray-600">
                                                        {selectedOrder.delivered_at && isValid(new Date(selectedOrder.delivered_at)) ?
                                                            format(new Date(selectedOrder.delivered_at), 'MMM dd, yyyy HH:mm') :
                                                            'N/A'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Shipping Address */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        Shipping Address
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                        <p className="font-medium text-gray-900">{selectedOrder.shipping_address?.full_name}</p>
                                        <p className="text-gray-600 mt-1">
                                            {selectedOrder.shipping_address?.address_line1}
                                            {selectedOrder.shipping_address?.address_line2 && `, ${selectedOrder.shipping_address.address_line2}`}
                                        </p>
                                        <p className="text-gray-600">
                                            {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.postal_code}
                                        </p>
                                        <p className="text-gray-600 mt-2">
                                            Phone: {selectedOrder.shipping_address?.phone}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.order_items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                                {item.product_image && (
                                                    <img
                                                        src={item.product_image}
                                                        alt={item.product_title}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{item.product_title}</p>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {item.size && <span>Size: {item.size} </span>}
                                                        {item.color && <span>• Color: {item.color} </span>}
                                                        <span>• Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">₹{item.subtotal ? item.subtotal.toLocaleString() : '0'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span>₹{selectedOrder.subtotal ? selectedOrder.subtotal.toLocaleString() : '0'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping:</span>
                                            <span>{selectedOrder.shipping_fee === 0 ? 'FREE' : `₹${selectedOrder.shipping_fee || 0}`}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax:</span>
                                            <span>₹{selectedOrder.tax ? selectedOrder.tax.toLocaleString() : '0'}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-semibold text-base">
                                            <span>Total:</span>
                                            <span>₹{selectedOrder.total_amount ? selectedOrder.total_amount.toLocaleString() : '0'}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedOrder.tracking_number && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <Truck className="w-5 h-5" />
                                            Tracking Information
                                        </h3>
                                        <div className="text-sm space-y-1">
                                            <p><span className="text-gray-600">Courier:</span> {selectedOrder.courier_name || 'N/A'}</p>
                                            <p><span className="text-gray-600">Tracking Number:</span> {selectedOrder.tracking_number}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}