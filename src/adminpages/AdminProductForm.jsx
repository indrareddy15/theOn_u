import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Plus, Trash2, Upload, X, Save, ArrowLeft, Image as ImageIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: productId } = useParams();
    const isEditing = !!productId;

    // Debug logging
    console.log('ProductForm - Product ID:', productId, 'Is Editing:', isEditing);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        specification: '',
        material: '',
        care_instructions: '',
        gender: 'unisex',
        category: '',
        sub_category: '',
        price: '',
        sale_price: '',
        images: [],
        colors: [],
        sizes: [],
        tags: [],
        sku: '',
        hsn: '',
        gst: 18,
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        is_featured: false,
        is_active: true
    });

    const [newImageUrl, setNewImageUrl] = useState('');
    const [newColor, setNewColor] = useState({ name: '', code: '#000000' });
    const [newSize, setNewSize] = useState({ size: '', stock: '' });
    const [newTag, setNewTag] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

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
            await loadCategories();
            if (isEditing) {
                await loadProduct();
            }
        } catch (error) {
            base44.auth.redirectToLogin(window.location.pathname);
        }
    };

    const loadCategories = async () => {
        try {
            const cats = await base44.entities.Category.list();
            setCategories(cats);
            console.log('Loaded categories:', cats);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadProduct = async () => {
        try {
            setLoading(true);
            // Use the get method instead of filter for a specific ID
            const product = await base44.entities.Product.get(parseInt(productId));
            if (product) {
                setFormData({
                    title: product.title || product.name || '',
                    description: product.description || '',
                    specification: product.specification || '',
                    material: product.material || '',
                    care_instructions: product.care_instructions || '',
                    gender: product.gender || 'unisex',
                    category: product.category || '',
                    sub_category: product.sub_category || '',
                    price: product.price?.toString() || '',
                    sale_price: product.sale_price?.toString() || '',
                    images: product.images || [],
                    colors: product.colors || [],
                    sizes: product.sizes || [],
                    tags: product.tags || [],
                    sku: product.sku || product.product_id || '',
                    hsn: product.hsn || '',
                    gst: product.gst || 18,
                    weight: product.weight?.toString() || '',
                    dimensions: product.dimensions || { length: '', width: '', height: '' },
                    is_featured: product.is_featured || false,
                    is_active: product.is_active !== false
                });
                console.log('Loaded product data:', product);
            } else {
                toast.error('Product not found');
                navigate('/admin/products');
            }
        } catch (error) {
            console.error('Error loading product:', error);
            toast.error('Failed to load product');
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, file_url]
            }));
            toast.success('Image uploaded');
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleAddImageUrl = () => {
        if (!newImageUrl.trim()) return;
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImageUrl]
        }));
        setNewImageUrl('');
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleAddColor = () => {
        console.log('handleAddColor called with:', newColor);
        if (!newColor.name.trim()) {
            console.log('Color name is empty, not adding');
            return;
        }
        console.log('Adding color:', newColor);
        const updatedColors = [...formData.colors, { ...newColor }];
        console.log('Updated colors array:', updatedColors);
        setFormData(prev => ({
            ...prev,
            colors: updatedColors
        }));
        setNewColor({ name: '', code: '#000000' });
    };

    const handleRemoveColor = (index) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.filter((_, i) => i !== index)
        }));
    };

    const handleAddSize = () => {
        if (!newSize.size.trim() || !newSize.stock) return;
        setFormData(prev => ({
            ...prev,
            sizes: [...prev.sizes, { size: newSize.size, stock: parseInt(newSize.stock) }]
        }));
        setNewSize({ size: '', stock: '' });
    };

    const handleRemoveSize = (index) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index)
        }));
    };

    const handleAddTag = () => {
        if (!newTag.trim()) return;
        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, newTag.trim()]
        }));
        setNewTag('');
    };

    const handleRemoveTag = (index) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.price || !formData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);

            const totalStock = formData.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);

            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
                gst: parseFloat(formData.gst),
                weight: formData.weight ? parseFloat(formData.weight) : null,
                total_stock: totalStock,
                product_id: formData.sku || `PRD${Date.now()}`
            };

            if (isEditing) {
                await base44.entities.Product.update(parseInt(productId), productData);
                toast.success('Product updated successfully');
            } else {
                await base44.entities.Product.create(productData);
                toast.success('Product created successfully');
            }

            navigate(createPageUrl('AdminProducts'));
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-64 mb-8" />
                <div className="space-y-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(createPageUrl('AdminProducts'))}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditing ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isEditing ? 'Update product information' : 'Create a new product listing'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Product Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Classic Cotton T-Shirt"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed product description"
                                rows={4}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.slug} className="capitalize">
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="gender">Gender</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="men">Men</SelectItem>
                                        <SelectItem value="women">Women</SelectItem>
                                        <SelectItem value="unisex">Unisex</SelectItem>
                                        <SelectItem value="kids">Kids</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="material">Material</Label>
                                <Input
                                    id="material"
                                    value={formData.material}
                                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                    placeholder="e.g. 100% Cotton"
                                />
                            </div>

                            <div>
                                <Label htmlFor="care">Care Instructions</Label>
                                <Input
                                    id="care"
                                    value={formData.care_instructions}
                                    onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                                    placeholder="e.g. Machine wash cold"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">Regular Price (₹) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="1999"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="sale_price">Sale Price (₹)</Label>
                                <Input
                                    id="sale_price"
                                    type="number"
                                    value={formData.sale_price}
                                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                                    placeholder="1499"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border group">
                                    <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleRemoveImage(idx)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploadingImage}
                                />
                                {uploadingImage ? (
                                    <div className="text-center">
                                        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-2" />
                                        <span className="text-sm text-gray-600">Uploading...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">Upload Image</span>
                                    </>
                                )}
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Or paste image URL"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                            />
                            <Button type="button" onClick={handleAddImageUrl}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Colors */}
                <Card>
                    <CardHeader>
                        <CardTitle>Colors</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {console.log('Rendering colors:', formData.colors)}
                            {formData.colors.map((color, idx) => (
                                <Badge key={idx} variant="secondary" className="px-3 py-2" style={{ backgroundColor: '#e5e7eb', color: 'black' }}>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: color.code }}
                                        />
                                        <span>{color.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveColor(idx)}
                                            className="ml-1 hover:text-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </Badge>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Color name"
                                value={newColor.name}
                                onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                            />
                            <Input
                                type="color"
                                value={newColor.code}
                                onChange={(e) => setNewColor({ ...newColor, code: e.target.value })}
                                className="w-20"
                            />
                            <Button type="button" onClick={(e) => { e.preventDefault(); handleAddColor(); }}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Sizes & Stock */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sizes & Stock</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {formData.sizes.map((size, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <span className="font-medium">Size: {size.size}</span>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-gray-600">Stock: {size.stock}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveSize(idx)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Size (e.g. S, M, L, XL)"
                                value={newSize.size}
                                onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                            />
                            <Input
                                type="number"
                                placeholder="Stock"
                                value={newSize.stock}
                                onChange={(e) => setNewSize({ ...newSize, stock: e.target.value })}
                            />
                            <Button type="button" onClick={handleAddSize}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="PROD-001"
                                />
                            </div>

                            <div>
                                <Label htmlFor="hsn">HSN Code</Label>
                                <Input
                                    id="hsn"
                                    value={formData.hsn}
                                    onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                                    placeholder="6109"
                                />
                            </div>

                            <div>
                                <Label htmlFor="gst">GST (%)</Label>
                                <Input
                                    id="gst"
                                    type="number"
                                    value={formData.gst}
                                    onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                                    placeholder="18"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" style={{ backgroundColor: '#e5e7eb', color: 'black' }}>
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(idx)}
                                            className="ml-2 hover:text-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add tag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                />
                                <Button type="button" onClick={handleAddTag}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <Label htmlFor="featured">Featured Product</Label>
                                <p className="text-sm text-gray-600">Show this product on homepage</p>
                            </div>
                            <Switch
                                id="featured"
                                checked={formData.is_featured}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <Label htmlFor="active">Active Status</Label>
                                <p className="text-sm text-gray-600">Make product visible in store</p>
                            </div>
                            <Switch
                                id="active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(createPageUrl('AdminProducts'))}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {isEditing ? 'Update Product' : 'Create Product'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}