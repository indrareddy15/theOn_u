import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp, TrendingDown, ShoppingCart, Users, Package,
    DollarSign, ArrowRight, Calendar, Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        customersGrowth: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = await base44.auth.me();
            if (currentUser.role !== 'admin') {
                navigate(createPageUrl('Home'));
                return;
            }
            setUser(currentUser);
            loadDashboardData();
        } catch (error) {
            base44.auth.redirectToLogin(window.location.pathname);
        }
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            const [orders, products, users] = await Promise.all([
                base44.entities.Order.list(),
                base44.entities.Product.list(),
                base44.entities.User.list()
            ]);

            // Calculate stats
            const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
            const totalOrders = orders.length;
            const totalCustomers = users.filter(u => u.role === 'user').length;
            const totalProducts = products.length;

            // Calculate growth (mock data for now - in real app, compare with previous period)
            const revenueGrowth = 12.5;
            const ordersGrowth = 8.3;
            const customersGrowth = 15.2;

            setStats({
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProducts,
                revenueGrowth,
                ordersGrowth,
                customersGrowth
            });

            // Recent orders
            setRecentOrders(orders.slice(0, 5));

            // Revenue chart data (last 7 days)
            const last7Days = [...Array(7)].map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayOrders = orders.filter(o => {
                    const orderDate = new Date(o.created_date);
                    return orderDate.toDateString() === date.toDateString();
                });
                const revenue = dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
                return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: revenue,
                    orders: dayOrders.length
                };
            });
            setRevenueData(last7Days);

            // Order status distribution
            const statusCounts = orders.reduce((acc, order) => {
                acc[order.order_status] = (acc[order.order_status] || 0) + 1;
                return acc;
            }, {});

            const statusData = Object.entries(statusCounts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }));
            setOrderStatusData(statusData);

            // Top products (mock - in real app calculate from orders)
            setTopProducts(products.slice(0, 5));

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#111827', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'];

    const StatCard = ({ title, value, icon: Icon, growth, prefix = '', suffix = '' }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                    {prefix}{value.toLocaleString()}{suffix}
                </div>
                {growth !== undefined && (
                    <div className="flex items-center gap-1 text-sm">
                        {growth >= 0 ? (
                            <>
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-green-600 font-medium">+{growth}%</span>
                            </>
                        ) : (
                            <>
                                <TrendingDown className="w-4 h-4 text-red-600" />
                                <span className="text-red-600 font-medium">{growth}%</span>
                            </>
                        )}
                        <span className="text-gray-500">vs last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-64 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                    <Skeleton className="h-96 rounded-xl" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, {user?.full_name || 'Admin'}</p>
                </div>
                <Button onClick={() => navigate(createPageUrl('Shop'))}>
                    View Store
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={stats.totalRevenue}
                    icon={DollarSign}
                    growth={stats.revenueGrowth}
                    prefix="₹"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingCart}
                    growth={stats.ordersGrowth}
                />
                <StatCard
                    title="Total Customers"
                    value={stats.totalCustomers}
                    icon={Users}
                    growth={stats.customersGrowth}
                />
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Revenue Overview (Last 7 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#111827"
                                    strokeWidth={2}
                                    dot={{ fill: '#111827' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Order Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order Status Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders & Top Products */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Orders</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(createPageUrl('AdminOrders'))}
                        >
                            View All
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No orders yet</p>
                            ) : (
                                recentOrders.map(order => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(createPageUrl(`AdminOrders?orderId=${order.id}`))}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{order.order_id}</p>
                                            <p className="text-sm text-gray-600">{order.user_email}</p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-semibold text-gray-900">₹{order.total_amount.toLocaleString()}</p>
                                            <Badge
                                                variant={order.order_status === 'delivered' ? 'default' : 'secondary'}
                                                className="capitalize"
                                            >
                                                {order.order_status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Top Products</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(createPageUrl('AdminProducts'))}
                        >
                            View All
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProducts.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No products yet</p>
                            ) : (
                                topProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(createPageUrl(`AdminProducts?productId=${product.id}`))}
                                    >
                                        <img
                                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'}
                                            alt={product.title}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{product.title}</p>
                                            <p className="text-sm text-gray-600">
                                                Stock: {product.total_stock || 0} • ₹{(product.sale_price || product.price).toLocaleString()}
                                            </p>
                                        </div>
                                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}