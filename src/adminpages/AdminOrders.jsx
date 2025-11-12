import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, Filter, Download, Eye, Package,
    Truck, Clock, CheckCircle2, XCircle, Calendar,
    MessageSquare, MapPin, CreditCard, ChevronLeft,
    ChevronRight
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export default function AdminOrders() {
    const navigate = useNavigate();
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const orderIdParam = urlParams.get('orderId');

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [newNote, setNewNote] = useState('');
    const ordersPerPage = 10;

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [orders, searchQuery, statusFilter, paymentFilter, dateFilter]);

    useEffect(() => {
        if (orderIdParam && orders.length > 0) {
            const order = orders.find(o => o.id === orderIdParam);
            if (order) {
                setSelectedOrder(order);
                setOrderDialogOpen(true);
            }
        }
    }, [orderIdParam, orders]);

    const checkAuth = async () => {
        try {
            const user = await base44.auth.me();
            if (user.role !== 'admin') {
                navigate(createPageUrl('Home'));
                return;
            }
            loadOrders();
        } catch (error) {
            base44.auth.redirectToLogin(window.location.pathname);
        }
    };

    const loadOrders = async () => {
        try {
            setLoading(true);
            const ordersData = await base44.entities.Order.list('-created_date');
            setOrders(ordersData);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...orders];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(o =>
                o.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.shipping_address?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(o => o.order_status === statusFilter);
        }

        // Payment filter
        if (paymentFilter !== 'all') {
            filtered = filtered.filter(o => o.payment_mode === paymentFilter);
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(o => {
                const orderDate = new Date(o.created_date);
                const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

                if (dateFilter === 'today') return daysDiff === 0;
                if (dateFilter === 'week') return daysDiff <= 7;
                if (dateFilter === 'month') return daysDiff <= 30;
                return true;
            });
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await base44.entities.Order.update(orderId, { order_status: newStatus });
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, order_status: newStatus } : o
            ));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
            }
            toast.success('Order status updated');
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !selectedOrder) return;

        try {
            const currentNotes = selectedOrder.notes || '';
            const timestamp = format(new Date(), 'MMM dd, yyyy HH:mm');
            const updatedNotes = currentNotes
                ? `${currentNotes}\n\n[${timestamp}] ${newNote}`
                : `[${timestamp}] ${newNote}`;

            await base44.entities.Order.update(selectedOrder.id, { notes: updatedNotes });
            setSelectedOrder(prev => ({ ...prev, notes: updatedNotes }));
            setOrders(prev => prev.map(o =>
                o.id === selectedOrder.id ? { ...o, notes: updatedNotes } : o
            ));
            setNewNote('');
            toast.success('Note added successfully');
        } catch (error) {
            toast.error('Failed to add note');
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

    const exportToCSV = () => {
        const headers = ['Order ID', 'Customer', 'Amount', 'Status', 'Payment', 'Date'];
        const rows = filteredOrders.map(order => [
            order.order_id,
            order.user_email,
            order.total_amount,
            order.order_status,
            order.payment_mode,
            format(new Date(order.created_date), 'MMM dd, yyyy')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        toast.success('Orders exported successfully');
    };

    // Pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-64 mb-8" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600 mt-1">{filteredOrders.length} orders found</p>
                </div>
                <Button onClick={exportToCSV} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by order ID, customer email or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="packed">Packed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Payment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Payments</SelectItem>
                            <SelectItem value="prepaid">Prepaid</SelectItem>
                            <SelectItem value="cod">Cash on Delivery</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                        <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p>No orders found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentOrders.map(order => (
                                    <TableRow key={order.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium text-gray-900">
                                            {order.order_id}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {order.shipping_address?.full_name || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-500">{order.user_email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {format(new Date(order.created_date), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {order.order_items?.length || 0} items
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900">
                                            ₹{order.total_amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {order.payment_mode === 'cod' ? 'COD' : 'Prepaid'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`capitalize ${getStatusColor(order.order_status)}`}>
                                                <span className="flex items-center gap-1">
                                                    {getStatusIcon(order.order_status)}
                                                    {order.order_status.replace('_', ' ')}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setOrderDialogOpen(true);
                                                }}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <p className="text-sm text-gray-600">
                            Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Dialog */}
            <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

                            <div className="space-y-6 p-6">
                                {/* Order Status Update */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <Label className="mb-2 block">Update Order Status</Label>
                                    <Select
                                        value={selectedOrder.order_status}
                                        onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="packed">Packed</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="returned">Returned</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Order Timeline */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Order Timeline
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Order Placed</p>
                                                <p className="text-sm text-gray-600">
                                                    {format(new Date(selectedOrder.created_date), 'MMM dd, yyyy HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedOrder.delivered_at && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Delivered</p>
                                                    <p className="text-sm text-gray-600">
                                                        {format(new Date(selectedOrder.delivered_at), 'MMM dd, yyyy HH:mm')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Customer Information */}
                                <div className="grid md:grid-cols-2 gap-6">
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

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" />
                                            Payment Information
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Payment Method:</span>
                                                <span className="font-medium text-gray-900 capitalize">
                                                    {selectedOrder.payment_mode === 'cod' ? 'Cash on Delivery' : 'Prepaid'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Payment Status:</span>
                                                <Badge variant={selectedOrder.payment_status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                                                    {selectedOrder.payment_status}
                                                </Badge>
                                            </div>
                                            {selectedOrder.payment_id && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Transaction ID:</span>
                                                    <span className="font-mono text-xs text-gray-900">{selectedOrder.payment_id}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Order Items
                                    </h3>
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
                                                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-1">
                                                        {item.size && <span>Size: {item.size}</span>}
                                                        {item.color && <span>• Color: {item.color}</span>}
                                                        <span>• Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">₹{item.subtotal.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-600">₹{item.price.toLocaleString()} each</p>
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
                                            <span className="text-gray-900">₹{selectedOrder.subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping:</span>
                                            <span className="text-gray-900">
                                                {selectedOrder.shipping_fee === 0 ? 'FREE' : `₹${selectedOrder.shipping_fee}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax:</span>
                                            <span className="text-gray-900">₹{selectedOrder.tax.toLocaleString()}</span>
                                        </div>
                                        {selectedOrder.discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount:</span>
                                                <span>-₹{selectedOrder.discount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between font-semibold text-base">
                                            <span className="text-gray-900">Total:</span>
                                            <span className="text-gray-900">₹{selectedOrder.total_amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Info */}
                                {selectedOrder.tracking_number && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Truck className="w-5 h-5" />
                                            Shipping Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Courier:</span>
                                                <span className="font-medium text-gray-900">{selectedOrder.courier_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tracking Number:</span>
                                                <span className="font-mono text-gray-900">{selectedOrder.tracking_number}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notes & Communication */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        Notes & Communication
                                    </h3>

                                    {selectedOrder.notes && (
                                        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-700 whitespace-pre-wrap">
                                            {selectedOrder.notes}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="Add a note about this order..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            rows={3}
                                        />
                                        <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                            Add Note
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}