import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function DebugUserPanel() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    const switchUser = async (userType) => {
        const newUser = base44.auth.loginAs(userType);
        setUser(newUser);
        // Dispatch event to update other components
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
    };

    return (
        <div className="bg-blue-50 border border-blue-200 p-3 mb-4 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-800">
                        Debug Panel - Current User:
                    </span>
                    {user ? (
                        <span className="text-sm text-blue-600">
                            {user.email} ({user.role})
                        </span>
                    ) : (
                        <span className="text-sm text-red-600">No user logged in</span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => switchUser('customer')}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Switch to Customer
                    </button>
                    <button
                        onClick={() => switchUser('admin')}
                        className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                        Switch to Admin
                    </button>
                    <button
                        onClick={loadUser}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    );
}