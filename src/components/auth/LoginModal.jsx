import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { User, Shield, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginModal({ isOpen, onClose, returnUrl = '/' }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (userType) => {
        setLoading(true);
        try {
            let mockUser;

            if (userType === 'admin') {
                mockUser = {
                    id: 1,
                    email: email || 'admin@theon.com',
                    name: 'Admin User',
                    full_name: 'Administrator',
                    phone: '+1234567890',
                    role: 'admin',
                    created_date: new Date('2024-01-01').toISOString()
                };
            } else {
                mockUser = {
                    id: 2,
                    email: email || 'customer@example.com',
                    name: 'Customer User',
                    full_name: 'John Doe',
                    phone: '+1234567890',
                    role: 'customer',
                    created_date: new Date('2024-01-15').toISOString()
                };
            }

            base44.auth.setUser(mockUser);
            toast.success(`Logged in as ${userType}`);

            // Trigger event to update Layout
            window.dispatchEvent(new CustomEvent('userLoggedIn'));

            onClose();

            // Navigate to the return URL or appropriate dashboard
            if (userType === 'admin' && returnUrl === '/') {
                navigate(createPageUrl('AdminDashboard'));
            } else if (returnUrl !== '/') {
                navigate(returnUrl);
            }
            // Note: Removed window.location.reload() as it's no longer needed
        } catch {
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (userType) => {
        if (userType === 'admin') {
            setEmail('admin@theon.com');
        } else {
            setEmail('customer@example.com');
        }
        handleLogin(userType);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Sign In to TheOn
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Quick Login Options */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Quick Login Options:</Label>

                        {/* Admin Login */}
                        <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => quickLogin('admin')}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Admin Access</span>
                                        <Badge variant="destructive" className="text-xs">ADMIN</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">Access admin dashboard and management tools</p>
                                    <p className="text-xs text-gray-500">admin@theon.com</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Login */}
                        <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => quickLogin('customer')}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Customer Access</span>
                                        <Badge variant="secondary" className="text-xs">CUSTOMER</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">Shop products and manage your orders</p>
                                    <p className="text-xs text-gray-500">customer@example.com</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Manual Login Form */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleLogin('customer')}
                                    disabled={loading}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    Sign In as Customer
                                </Button>
                                <Button
                                    onClick={() => handleLogin('admin')}
                                    disabled={loading}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    Sign In as Admin
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            This is a demo application. Click any option above to sign in.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}