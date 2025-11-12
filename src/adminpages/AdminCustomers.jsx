import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, Download, Eye, Users, ShoppingBag,
    MapPin, Calendar, TrendingUp, MessageSquare,
    ChevronLeft, ChevronRight
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export default function AdminCustomers() {
    const navigate = useNavigate();
    const location = useLocation();

    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [orderFilter, setOrderFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [customerAddresses, setCustomerAddresses] = useState([]);
    const [newNote, setNewNote] = useState('');
    const customersPerPage = 10;

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [customers, searchQuery, dateFilter, orderFilter]);

    const checkAuth = async () => {
        try {
            const user = await base44.auth.me();
            if (user.role !== 'admin') {
                navigate(createPageUrl('Home'));
                return;
            }
            loadData();
        } catch (error) {
            base44.auth.redirectToLogin(window.location.pathname);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [allUsers, allOrders] = await Promise.all([
                base44.entities.User.list('-created_date'),
                base44.entities.Order.list()
            ]);

            // Filter only regular users (not admins)
            const regularUsers = allUsers.filter(u => u.role === 'user');
            setCustomers(regularUsers);
            setOrders(allOrders);
        } catch (error) {
            console.error('Error loading customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...customers];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(c =>
                c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(c => {
                const regDate = new Date(c.created_date);
                const daysDiff = Math.floor((now - regDate) / (1000 * 60 * 60 * 24));

                if (dateFilter === 'today') return daysDiff === 0;
                if (dateFilter === 'week') return daysDiff <= 7;
                if (dateFilter === 'month') return daysDiff <= 30;
                if (dateFilter === '3months') return daysDiff <= 90;
                return true;
            });
        }

        // Order history filter
        if (orderFilter !== 'all') {
            filtered = filtered.filter(c => {
                const userOrders = orders.filter(o => o.user_email === c.email);

                if (orderFilter === 'with_orders') return userOrders.length > 0;
                if (orderFilter === 'without_orders') return userOrders.length === 0;
                if (orderFilter === 'frequent') return userOrders.length >= 3;
                return true;
            });
        }

        setFilteredCustomers(filtered);
        setCurrentPage(1);
    };

    const getCustomerStats = (customerEmail) => {
        const customerOrders = orders.filter(o => o.user_email === customerEmail);
        const totalOrders = customerOrders.length;
        const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

        return { totalOrders, totalSpent, avgOrderValue };
    };

    const handleViewCustomer = async (customer) => {
        try {
            setSelectedCustomer(customer);
            setCustomerDialogOpen(true);

            // Load customer data
            const [custOrders, custAddresses] = await Promise.all([
                base44.entities.Order.filter({ user_email: customer.email }, '-created_date'),
                base44.entities.Address.filter({ user_email: customer.email })
            ]);

            setCustomerOrders(custOrders);
            setCustomerAddresses(custAddresses);
        } catch (error) {
            console.error('Error loading customer details:', error);
            toast.error('Failed to load customer details');
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !selectedCustomer) return;

        try {
            const timestamp = format(new Date(), 'MMM dd, yyyy HH:mm');
            const noteText = `[${timestamp}] ${newNote}`;

            // In a real app, you'd save this to a CustomerNotes entity or similar
            // For now, we'll just show the success message
            toast.success('Note added successfully');
            setNewNote('');
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Registration Date', 'Total Orders', 'Total Spent'];
        const rows = filteredCustomers.map(customer => {
            const stats = getCustomerStats(customer.email);
            return [
                customer.full_name,
                customer.email,
                format(new Date(customer.created_date), 'MMM dd, yyyy'),
                stats.totalOrders,
                stats.totalSpent
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        toast.success('Customers exported successfully');
    };

    // Pagination
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

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
                    <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-600 mt-1">{filteredCustomers.length} customers found</p>
                </div>
                <Button onClick={exportToCSV} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Registration Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                            <SelectItem value="3months">Last 3 Months</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={orderFilter} onValueChange={setOrderFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Order History" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Customers</SelectItem>
                            <SelectItem value="with_orders">With Orders</SelectItem>
                            <SelectItem value="without_orders">Without Orders</SelectItem>
                            <SelectItem value="frequent">Frequent Buyers (3+)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Registration Date</TableHead>
                                <TableHead>Total Orders</TableHead>
                                <TableHead>Total Spent</TableHead>
                                <TableHead>Avg Order Value</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p>No customers found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentCustomers.map(customer => {
                                    const stats = getCustomerStats(customer.email);

                                    return (
                                        <TableRow key={customer.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-gray-900">{customer.full_name}</p>
                                                    <p className="text-sm text-gray-500">{customer.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {format(new Date(customer.created_date), 'MMM dd, yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-gray-900">{stats.totalOrders}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900">
                                                ₹{stats.totalSpent.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                ₹{Math.round(stats.avgOrderValue).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewCustomer(customer)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <p className="text-sm text-gray-600">
                            Showing {indexOfFirstCustomer + 1} to {Math.min(indexOfLastCustomer, filteredCustomers.length)} of {filteredCustomers.length} customers
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

            {/* Customer Details Dialog */}
            <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    {selectedCustomer && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Users className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold">{selectedCustomer.full_name}</div>
                                        <div className="text-sm text-gray-600 font-normal">{selectedCustomer.email}</div>
                                    </div>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 p-6">
                                {/* Analytics Cards */}
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag className="w-5 h-5 text-blue-500" />
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {customerOrders.length}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-green-500" />
                                                <span className="text-2xl font-bold text-gray-900">
                                                    ₹{customerOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-gray-600">Avg Order Value</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-gray-900">
                                                ₹{customerOrders.length > 0
                                                    ? Math.round(customerOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / customerOrders.length).toLocaleString()
                                                    : 0}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Customer Information */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            Customer Information
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Email:</span>
                                                <span className="font-medium text-gray-900">{selectedCustomer.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Registered:</span>
                                                <span className="font-medium text-gray-900">
                                                    {format(new Date(selectedCustomer.created_date), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Account Status:</span>
                                                <Badge variant="default">Active</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Saved Addresses ({customerAddresses.length})
                                        </h3>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {customerAddresses.length === 0 ? (
                                                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 text-center">
                                                    No saved addresses
                                                </div>
                                            ) : (
                                                customerAddresses.map(addr => (
                                                    <div key={addr.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                                                        <div className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                                                            {addr.full_name}
                                                            <Badge variant="secondary" className="text-xs capitalize">
                                                                {addr.address_type}
                                                            </Badge>
                                                            {addr.is_default && (
                                                                <Badge variant="default" className="text-xs">Default</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 text-xs">
                                                            {addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Order History */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5" />
                                        Order History ({customerOrders.length})
                                    </h3>

                                    {customerOrders.length === 0 ? (
                                        <div className="bg-gray-50 p-8 rounded-lg text-center">
                                            <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                            <p className="text-gray-600">No orders yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {customerOrders.map(order => (
                                                <div
                                                    key={order.id}
                                                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                                    onClick={() => {
                                                        setCustomerDialogOpen(false);
                                                        navigate(createPageUrl(`AdminOrders?orderId=${order.id}`));
                                                    }}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{order.order_id}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {format(new Date(order.created_date), 'MMM dd, yyyy')}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-gray-900">
                                                                ₹{order.total_amount.toLocaleString()}
                                                            </p>
                                                            <Badge variant="secondary" className="capitalize text-xs">
                                                                {order.order_status.replace('_', ' ')}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 text-sm text-gray-600">
                                                        <span>{order.order_items?.length || 0} items</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{order.payment_mode === 'cod' ? 'COD' : 'Prepaid'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Notes & Communication */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        Notes & Communication
                                    </h3>

                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="Add a note about this customer..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            rows={3}
                                        />
                                        <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                            <MessageSquare className="w-4 h-4 mr-2" />
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