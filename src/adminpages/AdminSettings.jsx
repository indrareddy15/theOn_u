import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Settings, Tag, Percent, Plus, Edit, Trash2, Save,
    Store, CreditCard, Truck, X
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function AdminSettings() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [couponDialogOpen, setCouponDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, item: null });

    const [categoryForm, setCategoryForm] = useState({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        is_active: true,
        display_order: 0
    });

    const [couponForm, setCouponForm] = useState({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_value: 0,
        max_discount: '',
        valid_from: '',
        valid_until: '',
        usage_limit: '',
        is_active: true
    });

    useEffect(() => {
        checkAuth();
    }, []);

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
            const [categoriesData, couponsData] = await Promise.all([
                base44.entities.Category.list('display_order'),
                base44.entities.Coupon.list('-created_date')
            ]);
            setCategories(categoriesData);
            setCoupons(couponsData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    // Category Management
    const handleSaveCategory = async () => {
        if (!categoryForm.name || !categoryForm.slug) {
            toast.error('Please fill required fields');
            return;
        }

        try {
            if (editingCategory) {
                await base44.entities.Category.update(editingCategory.id, categoryForm);
                setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...categoryForm } : c));
                toast.success('Category updated');
            } else {
                const created = await base44.entities.Category.create(categoryForm);
                setCategories([...categories, created]);
                toast.success('Category created');
            }
            setCategoryDialogOpen(false);
            resetCategoryForm();
        } catch (error) {
            toast.error('Failed to save category');
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            image_url: category.image_url || '',
            is_active: category.is_active,
            display_order: category.display_order || 0
        });
        setCategoryDialogOpen(true);
    };

    const handleDeleteCategory = async () => {
        if (!deleteDialog.item) return;

        try {
            await base44.entities.Category.delete(deleteDialog.item.id);
            setCategories(prev => prev.filter(c => c.id !== deleteDialog.item.id));
            toast.success('Category deleted');
            setDeleteDialog({ open: false, type: null, item: null });
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const resetCategoryForm = () => {
        setEditingCategory(null);
        setCategoryForm({
            name: '',
            slug: '',
            description: '',
            image_url: '',
            is_active: true,
            display_order: 0
        });
    };

    // Coupon Management
    const handleSaveCoupon = async () => {
        if (!couponForm.code || !couponForm.discount_value) {
            toast.error('Please fill required fields');
            return;
        }

        try {
            const couponData = {
                ...couponForm,
                discount_value: parseFloat(couponForm.discount_value),
                min_order_value: parseFloat(couponForm.min_order_value) || 0,
                max_discount: couponForm.max_discount ? parseFloat(couponForm.max_discount) : null,
                usage_limit: couponForm.usage_limit ? parseInt(couponForm.usage_limit) : null,
                usage_count: 0
            };

            if (editingCoupon) {
                await base44.entities.Coupon.update(editingCoupon.id, couponData);
                setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? { ...c, ...couponData } : c));
                toast.success('Coupon updated');
            } else {
                const created = await base44.entities.Coupon.create(couponData);
                setCoupons([created, ...coupons]);
                toast.success('Coupon created');
            }
            setCouponDialogOpen(false);
            resetCouponForm();
        } catch (error) {
            toast.error('Failed to save coupon');
        }
    };

    const handleEditCoupon = (coupon) => {
        setEditingCoupon(coupon);
        setCouponForm({
            code: coupon.code,
            description: coupon.description || '',
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value.toString(),
            min_order_value: coupon.min_order_value || 0,
            max_discount: coupon.max_discount?.toString() || '',
            valid_from: coupon.valid_from || '',
            valid_until: coupon.valid_until || '',
            usage_limit: coupon.usage_limit?.toString() || '',
            is_active: coupon.is_active
        });
        setCouponDialogOpen(true);
    };

    const handleDeleteCoupon = async () => {
        if (!deleteDialog.item) return;

        try {
            await base44.entities.Coupon.delete(deleteDialog.item.id);
            setCoupons(prev => prev.filter(c => c.id !== deleteDialog.item.id));
            toast.success('Coupon deleted');
            setDeleteDialog({ open: false, type: null, item: null });
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const toggleCouponStatus = async (coupon) => {
        try {
            await base44.entities.Coupon.update(coupon.id, { is_active: !coupon.is_active });
            setCoupons(prev => prev.map(c =>
                c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
            ));
            toast.success(`Coupon ${!coupon.is_active ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to update coupon status');
        }
    };

    const resetCouponForm = () => {
        setEditingCoupon(null);
        setCouponForm({
            code: '',
            description: '',
            discount_type: 'percentage',
            discount_value: '',
            min_order_value: 0,
            max_discount: '',
            valid_from: '',
            valid_until: '',
            usage_limit: '',
            is_active: true
        });
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-64 mb-8" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="w-8 h-8 text-gray-900" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your store settings and configurations</p>
                </div>
            </div>

            <Tabs defaultValue="categories" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="categories">
                        <Tag className="w-4 h-4 mr-2" />
                        Categories
                    </TabsTrigger>
                    <TabsTrigger value="coupons">
                        <Percent className="w-4 h-4 mr-2" />
                        Coupons
                    </TabsTrigger>
                    <TabsTrigger value="store">
                        <Store className="w-4 h-4 mr-2" />
                        Store Info
                    </TabsTrigger>
                </TabsList>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Product Categories</CardTitle>
                            <div>
                                <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
                                    setCategoryDialogOpen(open);
                                    if (!open) {
                                        resetCategoryForm();
                                        setEditingCategory(null);
                                    }
                                }}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Category
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 p-6">
                                            <div>
                                                <Label>Name *</Label>
                                                <Input
                                                    value={categoryForm.name}
                                                    onChange={(e) => {
                                                        const name = e.target.value;
                                                        setCategoryForm({
                                                            ...categoryForm,
                                                            name,
                                                            slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                                        });
                                                    }}
                                                    placeholder="e.g. T-Shirts"
                                                />
                                            </div>
                                            <div>
                                                <Label>Slug *</Label>
                                                <Input
                                                    value={categoryForm.slug}
                                                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                                                    placeholder="e.g. t-shirts"
                                                />
                                            </div>
                                            <div>
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={categoryForm.description}
                                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                                    placeholder="Category description"
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <Label>Image URL</Label>
                                                <Input
                                                    value={categoryForm.image_url}
                                                    onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div>
                                                <Label>Display Order</Label>
                                                <Input
                                                    type="number"
                                                    value={categoryForm.display_order}
                                                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <Label>Active Status</Label>
                                                <Switch
                                                    checked={categoryForm.is_active}
                                                    onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_active: checked })}
                                                />
                                            </div>
                                            <Button onClick={handleSaveCategory} className="w-full">
                                                <Save className="w-4 h-4 mr-2" />
                                                {editingCategory ? 'Update' : 'Create'} Category
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map(category => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell className="text-gray-600">{category.slug}</TableCell>
                                            <TableCell>{category.display_order}</TableCell>
                                            <TableCell>
                                                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditCategory(category)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeleteDialog({ open: true, type: 'category', item: category })}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Coupons Tab */}
                <TabsContent value="coupons" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Discount Coupons</CardTitle>
                            <div>
                                <Dialog open={couponDialogOpen} onOpenChange={(open) => {
                                    setCouponDialogOpen(open);
                                    if (!open) {
                                        resetCouponForm();
                                        setEditingCoupon(null);
                                    }
                                }}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Coupon
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="grid grid-cols-2 gap-4 p-6">
                                            <div className="col-span-2">
                                                <Label>Coupon Code *</Label>
                                                <Input
                                                    value={couponForm.code}
                                                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                                    placeholder="e.g. SAVE20"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={couponForm.description}
                                                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                                                    placeholder="Coupon description"
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <Label>Discount Type *</Label>
                                                <Select
                                                    value={couponForm.discount_type}
                                                    onValueChange={(value) => setCouponForm({ ...couponForm, discount_type: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="percentage">Percentage</SelectItem>
                                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Discount Value *</Label>
                                                <Input
                                                    type="number"
                                                    value={couponForm.discount_value}
                                                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                                                    placeholder={couponForm.discount_type === 'percentage' ? '20' : '100'}
                                                />
                                            </div>
                                            <div>
                                                <Label>Min Order Value (₹)</Label>
                                                <Input
                                                    type="number"
                                                    value={couponForm.min_order_value}
                                                    onChange={(e) => setCouponForm({ ...couponForm, min_order_value: e.target.value })}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <Label>Max Discount (₹)</Label>
                                                <Input
                                                    type="number"
                                                    value={couponForm.max_discount}
                                                    onChange={(e) => setCouponForm({ ...couponForm, max_discount: e.target.value })}
                                                    placeholder="Optional"
                                                />
                                            </div>
                                            <div>
                                                <Label>Valid From</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={couponForm.valid_from}
                                                    onChange={(e) => setCouponForm({ ...couponForm, valid_from: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label>Valid Until</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={couponForm.valid_until}
                                                    onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Label>Usage Limit</Label>
                                                <Input
                                                    type="number"
                                                    value={couponForm.usage_limit}
                                                    onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                                                    placeholder="Unlimited"
                                                />
                                            </div>
                                            <div className="col-span-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <Label>Active Status</Label>
                                                <Switch
                                                    checked={couponForm.is_active}
                                                    onCheckedChange={(checked) => setCouponForm({ ...couponForm, is_active: checked })}
                                                />
                                            </div>
                                            <Button onClick={handleSaveCoupon} className="col-span-2">
                                                <Save className="w-4 h-4 mr-2" />
                                                {editingCoupon ? 'Update' : 'Create'} Coupon
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {coupons.map(coupon => (
                                    <div key={coupon.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900">{coupon.code}</h3>
                                                    <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                {coupon.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                                                )}
                                                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                                    <span className="font-medium">
                                                        {coupon.discount_type === 'percentage'
                                                            ? `${coupon.discount_value}% OFF`
                                                            : `₹${coupon.discount_value} OFF`}
                                                    </span>
                                                    {coupon.min_order_value > 0 && (
                                                        <span>• Min: ₹{coupon.min_order_value}</span>
                                                    )}
                                                    {coupon.max_discount && (
                                                        <span>• Max: ₹{coupon.max_discount}</span>
                                                    )}
                                                    {coupon.usage_limit && (
                                                        <span>• Used: {coupon.usage_count || 0}/{coupon.usage_limit}</span>
                                                    )}
                                                </div>
                                                {coupon.valid_until && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Valid until: {format(new Date(coupon.valid_until), 'MMM dd, yyyy')}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => toggleCouponStatus(coupon)}
                                                >
                                                    {coupon.is_active ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEditCoupon(coupon)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setDeleteDialog({ open: true, type: 'coupon', item: coupon })}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Store Info Tab */}
                <TabsContent value="store" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Store Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Store Name</Label>
                                <Input defaultValue="TheOn E-commerce" placeholder="Your store name" />
                            </div>
                            <div>
                                <Label>Store Email</Label>
                                <Input type="email" placeholder="store@example.com" />
                            </div>
                            <div>
                                <Label>Store Phone</Label>
                                <Input type="tel" placeholder="+91 1234567890" />
                            </div>
                            <div>
                                <Label>Store Address</Label>
                                <Textarea placeholder="Your store address" rows={3} />
                            </div>
                            <Button>
                                <Save className="w-4 h-4 mr-2" />
                                Save Store Info
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                Shipping Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Free Shipping Threshold (₹)</Label>
                                <Input type="number" defaultValue="2000" placeholder="2000" />
                                <p className="text-xs text-gray-600 mt-1">Orders above this amount get free shipping</p>
                            </div>
                            <div>
                                <Label>Standard Shipping Fee (₹)</Label>
                                <Input type="number" defaultValue="99" placeholder="99" />
                            </div>
                            <div>
                                <Label>GST Rate (%)</Label>
                                <Input type="number" defaultValue="18" placeholder="18" />
                            </div>
                            <Button>
                                <Save className="w-4 h-4 mr-2" />
                                Save Shipping Settings
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, type: null, item: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this {deleteDialog.type}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteDialog.type === 'category' ? handleDeleteCategory : handleDeleteCoupon}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}