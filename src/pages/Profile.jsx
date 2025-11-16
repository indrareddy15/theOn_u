import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    User, ShoppingBag, MapPin, Plus, Trash2, Edit,
    Save, X, Calendar
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({ full_name: '' });
    const [addressDialogOpen, setAddressDialogOpen] = useState(false);
    const [newAddress, setNewAddress] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        address_type: 'home',
        is_default: false
    });

    useEffect(() => {
        loadUser();
    }, []);

    const loadUserData = useCallback(async () => {
        try {
            setLoading(true);
            // Load orders
            const orders = await base44.entities.Order.filter({ user_email: user.email }, '-created_date');
            setOrders(orders);

            // Load addresses
            const addresses = await base44.entities.Address.filter({ user_email: user.email });
            setAddresses(addresses);
        } catch {
            console.error('Error loading user data');
        } finally {
            setLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        if (user) {
            loadUserData();
        }
    }, [user, loadUserData]);

    const loadUser = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setProfileData({ full_name: currentUser.full_name || '' });
        } catch {
            base44.auth.redirectToLogin(window.location.pathname);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await base44.auth.updateMe({ full_name: profileData.full_name });
            setUser({ ...user, full_name: profileData.full_name });
            setEditingProfile(false);
            toast.success('Profile updated successfully');
        } catch {
            toast.error('Failed to update profile');
        }
    };

    const handleAddAddress = async () => {
        if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 ||
            !newAddress.city || !newAddress.state || !newAddress.postal_code) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            const created = await base44.entities.Address.create({
                ...newAddress,
                user_email: user.email
            });
            setAddresses([...addresses, created]);
            setAddressDialogOpen(false);
            setNewAddress({
                full_name: '',
                phone: '',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                postal_code: '',
                address_type: 'home',
                is_default: false
            });
            toast.success('Address added successfully');
        } catch {
            toast.error('Failed to add address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            await base44.entities.Address.delete(addressId);
            setAddresses(prev => prev.filter(a => a.id !== addressId));
            toast.success('Address deleted');
        } catch {
            toast.error('Failed to delete address');
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            // Remove default from all addresses
            for (const addr of addresses) {
                if (addr.is_default && addr.id !== addressId) {
                    await base44.entities.Address.update(addr.id, { is_default: false });
                }
            }
            // Set new default
            await base44.entities.Address.update(addressId, { is_default: true });
            setAddresses(prev => prev.map(a => ({
                ...a,
                is_default: a.id === addressId
            })));
            toast.success('Default address updated');
        } catch {
            toast.error('Failed to update default address');
        }
    };

    const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

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

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid lg:grid-cols-3 gap-6">
                    <Skeleton className="h-96" />
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Profile Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {editingProfile ? (
                                    <>
                                        <div>
                                            <Label>Full Name</Label>
                                            <Input
                                                value={profileData.full_name}
                                                onChange={(e) => setProfileData({ full_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handleUpdateProfile}>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingProfile(false);
                                                    setProfileData({ full_name: user.full_name || '' });
                                                }}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-600">Name</p>
                                            <p className="font-medium text-gray-900">{user?.full_name || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium text-gray-900">{user?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Member Since</p>
                                            <p className="font-medium text-gray-900">
                                                {user?.created_date && isValid(new Date(user.created_date)) ?
                                                    format(new Date(user.created_date), 'MMM yyyy') :
                                                    'January 2024'
                                                }
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => setEditingProfile(true)}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Orders</span>
                                    <span className="text-2xl font-bold text-gray-900">{orders.length}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Spent</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{totalSpent.toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Addresses */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Saved Addresses
                                </CardTitle>
                                <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Address
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
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-700">Full Name *</Label>
                                                        <Input
                                                            value={newAddress.full_name}
                                                            onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                                            placeholder="John Doe"
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-700">Phone Number *</Label>
                                                            <Input
                                                                value={newAddress.phone}
                                                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                                placeholder="1234567890"
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-700 block mb-3">Address Type</Label>
                                                            <RadioGroup
                                                                value={newAddress.address_type}
                                                                onValueChange={(val) => setNewAddress({ ...newAddress, address_type: val })}
                                                                className="flex gap-6"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="home" id="home" />
                                                                    <Label htmlFor="home" className="text-sm font-normal">Home</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="office" id="office" />
                                                                    <Label htmlFor="office" className="text-sm font-normal">Office</Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Address Information Section */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-700">Address Line 1 *</Label>
                                                        <Input
                                                            value={newAddress.address_line1}
                                                            onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                                                            placeholder="House/Flat No., Building Name"
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-700">Address Line 2</Label>
                                                        <Input
                                                            value={newAddress.address_line2}
                                                            onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                                                            placeholder="Street, Area, Landmark"
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
                            </CardHeader>
                            <CardContent>
                                {addresses.length === 0 ? (
                                    <div className="text-center py-8 text-gray-600">
                                        <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p>No saved addresses</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map(addr => (
                                            <div key={addr.id} className="p-4 border rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">{addr.full_name}</span>
                                                        <Badge variant="secondary" className="text-xs capitalize">
                                                            {addr.address_type}
                                                        </Badge>
                                                        {addr.is_default && (
                                                            <Badge className="text-xs">Default</Badge>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                                                    {addr.city}, {addr.state} - {addr.postal_code}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">Phone: {addr.phone}</p>
                                                {!addr.is_default && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleSetDefaultAddress(addr.id)}
                                                    >
                                                        Set as Default
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Orders */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    Recent Orders
                                </CardTitle>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => navigate(createPageUrl('Orders'))}
                                >
                                    View All
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {orders.length === 0 ? (
                                    <div className="text-center py-8 text-gray-600">
                                        <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p>No orders yet</p>
                                        <Button
                                            className="mt-4"
                                            onClick={() => navigate(createPageUrl('Shop'))}
                                        >
                                            Start Shopping
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.slice(0, 5).map(order => (
                                            <div
                                                key={order.id}
                                                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => navigate(createPageUrl(`Orders?orderId=${order.id}`))}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{order.order_id}</p>
                                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {order.created_date && isValid(new Date(order.created_date)) ?
                                                                format(new Date(order.created_date), 'MMM dd, yyyy') :
                                                                'N/A'
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">
                                                            ₹{order.total_amount ? order.total_amount.toLocaleString() : '0'}
                                                        </p>
                                                        <Badge className={`capitalize text-xs ${getStatusColor(order.order_status)}`}>
                                                            {order.order_status ? order.order_status.replace('_', ' ') : 'N/A'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {order.order_items?.length || 0} items
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}