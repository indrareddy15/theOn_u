import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Package, AlertTriangle, TrendingDown, Search,
    Edit, History, Download, BarChart3, Box
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function AdminInventory() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, low_stock, out_of_stock
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockDialogOpen, setStockDialogOpen] = useState(false);
    const [stockAdjustment, setStockAdjustment] = useState({
        size: '',
        quantity: 0,
        reason: ''
    });

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, searchQuery, filterType]);

    const checkAuth = async () => {
        try {
            const user = await base44.auth.me();
            if (user.role !== 'admin') {
                navigate(createPageUrl('Home'));
                return;
            }
            loadProducts();
        } catch (error) {
            base44.auth.redirectToLogin(window.location.pathname);
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            const productsData = await base44.entities.Product.list('-updated_date');
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Stock filter
        if (filterType === 'low_stock') {
            filtered = filtered.filter(p => (p.total_stock || 0) > 0 && (p.total_stock || 0) <= 10);
        } else if (filterType === 'out_of_stock') {
            filtered = filtered.filter(p => (p.total_stock || 0) === 0);
        }

        // Sort by stock level (lowest first)
        filtered.sort((a, b) => (a.total_stock || 0) - (b.total_stock || 0));

        setFilteredProducts(filtered);
    };

    const handleStockAdjustment = async () => {
        if (!selectedProduct || !stockAdjustment.size) {
            toast.error('Please select a size');
            return;
        }

        try {
            const sizeIndex = selectedProduct.sizes.findIndex(s => s.size === stockAdjustment.size);
            if (sizeIndex === -1) return;

            const updatedSizes = [...selectedProduct.sizes];
            const currentStock = updatedSizes[sizeIndex].stock;
            const newStock = Math.max(0, currentStock + stockAdjustment.quantity);
            updatedSizes[sizeIndex].stock = newStock;

            const totalStock = updatedSizes.reduce((sum, s) => sum + s.stock, 0);

            await base44.entities.Product.update(selectedProduct.id, {
                sizes: updatedSizes,
                total_stock: totalStock
            });

            toast.success('Stock updated successfully');
            setStockDialogOpen(false);
            setStockAdjustment({ size: '', quantity: 0, reason: '' });
            loadProducts();
        } catch (error) {
            toast.error('Failed to update stock');
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
        if (stock <= 5) return { label: 'Critical', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
        if (stock <= 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: TrendingDown };
        return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: Package };
    };

    const exportToCSV = () => {
        const headers = ['Product', 'SKU', 'Total Stock', 'Status', 'Sizes'];
        const rows = filteredProducts.map(product => {
            const status = getStockStatus(product.total_stock || 0);
            const sizesInfo = product.sizes?.map(s => `${s.size}: ${s.stock}`).join('; ') || 'N/A';
            return [
                product.title,
                product.sku || '',
                product.total_stock || 0,
                status.label,
                sizesInfo
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        toast.success('Inventory report exported');
    };

    // Calculate inventory metrics
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => (p.total_stock || 0) > 0 && (p.total_stock || 0) <= 10).length;
    const outOfStockCount = products.filter(p => (p.total_stock || 0) === 0).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + ((p.sale_price || p.price) * (p.total_stock || 0)), 0);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-64 mb-8" />
                <div className="grid grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Box className="w-8 h-8 text-gray-900" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                        <p className="text-gray-600 mt-1">Track and manage product stock levels</p>
                    </div>
                </div>
                <Button onClick={exportToCSV} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-500" />
                            <span className="text-3xl font-bold text-gray-900">{totalProducts}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-yellow-500" />
                            <span className="text-3xl font-bold text-gray-900">{lowStockCount}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Out of Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <span className="text-3xl font-bold text-gray-900">{outOfStockCount}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Inventory Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-green-500" />
                            <span className="text-3xl font-bold text-gray-900">
                                ₹{Math.round(totalInventoryValue / 1000)}K
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterType === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilterType('all')}
                            >
                                All Products
                            </Button>
                            <Button
                                variant={filterType === 'low_stock' ? 'default' : 'outline'}
                                onClick={() => setFilterType('low_stock')}
                            >
                                Low Stock
                            </Button>
                            <Button
                                variant={filterType === 'out_of_stock' ? 'default' : 'outline'}
                                onClick={() => setFilterType('out_of_stock')}
                            >
                                Out of Stock
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Total Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Sizes</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map(product => {
                                const status = getStockStatus(product.total_stock || 0);
                                const StatusIcon = status.icon;

                                return (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'}
                                                    alt={product.title}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.title}</p>
                                                    <p className="text-sm text-gray-500">{product.category}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{product.sku || 'N/A'}</TableCell>
                                        <TableCell>
                                            <span className="text-lg font-semibold text-gray-900">
                                                {product.total_stock || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={status.color}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {product.sizes?.map((size, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {size.size}: {size.stock}
                                                    </Badge>
                                                )) || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setStockDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Adjust
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Stock Adjustment Dialog */}
            <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Adjust Stock - {selectedProduct?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 p-6">
                        <div>
                            <Label>Select Size</Label>
                            <select
                                value={stockAdjustment.size}
                                onChange={(e) => setStockAdjustment({ ...stockAdjustment, size: e.target.value })}
                                className="w-full border rounded-md px-3 py-2"
                            >
                                <option value="">Select a size</option>
                                {selectedProduct?.sizes?.map((size, idx) => (
                                    <option key={idx} value={size.size}>
                                        {size.size} (Current: {size.stock})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Quantity Adjustment</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setStockAdjustment({ ...stockAdjustment, quantity: stockAdjustment.quantity - 1 })}
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    value={stockAdjustment.quantity}
                                    onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: parseInt(e.target.value) || 0 })}
                                    className="text-center"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => setStockAdjustment({ ...stockAdjustment, quantity: stockAdjustment.quantity + 1 })}
                                >
                                    +
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Use positive numbers to add stock, negative to remove
                            </p>
                        </div>
                        <div>
                            <Label>Reason (Optional)</Label>
                            <Input
                                value={stockAdjustment.reason}
                                onChange={(e) => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })}
                                placeholder="e.g. Received shipment, Damaged goods, etc."
                            />
                        </div>
                        <Button onClick={handleStockAdjustment} className="w-full">
                            Update Stock
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}