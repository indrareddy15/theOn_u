import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [user, setUser] = useState(null);
    const [chat, setChat] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (user && isOpen) {
            loadOrCreateChat();
            const interval = setInterval(loadChat, 3000); // Poll for new messages
            return () => clearInterval(interval);
        }
    }, [user, isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [chat?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadUser = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
        }
    };

    const loadOrCreateChat = async () => {
        try {
            const chats = await base44.entities.SupportChat.filter({
                user_email: user.email,
                status: { $in: ['open', 'in_progress'] }
            });

            if (chats.length > 0) {
                setChat(chats[0]);
            } else {
                const newChat = await base44.entities.SupportChat.create({
                    user_email: user.email,
                    user_name: user.full_name || user.email,
                    status: 'open',
                    messages: [],
                    unread_count: 0
                });
                setChat(newChat);
            }
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    };

    const loadChat = async () => {
        if (!chat) return;
        try {
            const [updatedChat] = await base44.entities.SupportChat.filter({ id: chat.id });
            if (updatedChat) {
                setChat(updatedChat);
            }
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !chat) return;

        try {
            setLoading(true);
            const newMessage = {
                sender: user.full_name || user.email,
                message: message.trim(),
                timestamp: new Date().toISOString(),
                is_admin: false
            };

            const updatedMessages = [...(chat.messages || []), newMessage];

            await base44.entities.SupportChat.update(chat.id, {
                messages: updatedMessages,
                last_message: message.trim(),
                unread_count: (chat.unread_count || 0) + 1
            });

            setChat({
                ...chat,
                messages: updatedMessages,
                last_message: message.trim()
            });
            setMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all ${isMinimized ? 'h-16' : 'h-[600px]'
                        }`}
                >
                    {/* Header */}
                    <div className="bg-gray-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Customer Support</h3>
                                <p className="text-xs text-white/70">We're here to help!</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="hover:bg-white/20 p-1.5 rounded transition-colors"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1.5 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {!chat ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p>Loading chat...</p>
                                    </div>
                                ) : chat.messages?.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p className="font-medium mb-1">Start a conversation</p>
                                        <p className="text-sm">Ask us anything, we're here to help!</p>
                                    </div>
                                ) : (
                                    <>
                                        {chat.messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.is_admin
                                                            ? 'bg-white text-gray-900'
                                                            : 'bg-gray-900 text-white'
                                                        }`}
                                                >
                                                    <p className="text-sm">{msg.message}</p>
                                                    <p className={`text-xs mt-1 ${msg.is_admin ? 'text-gray-500' : 'text-white/70'
                                                        }`}>
                                                        {format(new Date(msg.timestamp), 'HH:mm')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t bg-white rounded-b-2xl">
                                <div className="flex gap-2">
                                    <Input
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        disabled={loading}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={loading || !message.trim()}
                                        className="bg-gray-900 hover:bg-gray-800"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}