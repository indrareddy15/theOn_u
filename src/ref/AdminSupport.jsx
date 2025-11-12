import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminSupport() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadChats, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      loadChats();
    } catch (error) {
      base44.auth.redirectToLogin(window.location.pathname);
    }
  };

  const loadChats = async () => {
    try {
      setLoading(true);
      const chatsData = await base44.entities.SupportChat.list('-updated_date');
      setChats(chatsData);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const newMessage = {
        sender: 'Support Team',
        message: message.trim(),
        timestamp: new Date().toISOString(),
        is_admin: true
      };

      const updatedMessages = [...(selectedChat.messages || []), newMessage];
      
      await base44.entities.SupportChat.update(selectedChat.id, {
        messages: updatedMessages,
        last_message: message.trim(),
        status: 'in_progress',
        unread_count: 0
      });

      setSelectedChat({
        ...selectedChat,
        messages: updatedMessages,
        last_message: message.trim(),
        status: 'in_progress'
      });
      setMessage('');
      loadChats();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleResolveChat = async (chatId) => {
    try {
      await base44.entities.SupportChat.update(chatId, { status: 'resolved' });
      toast.success('Chat marked as resolved');
      loadChats();
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      toast.error('Failed to resolve chat');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && chats.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-8 h-8 text-gray-900" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
          <p className="text-gray-600 mt-1">Manage customer conversations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 mb-4">
            Active Chats ({chats.filter(c => c.status !== 'resolved').length})
          </h2>
          {chats.filter(c => c.status !== 'resolved').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No active chats</p>
              </CardContent>
            </Card>
          ) : (
            chats.filter(c => c.status !== 'resolved').map(chat => (
              <Card
                key={chat.id}
                className={`cursor-pointer transition-colors ${
                  selectedChat?.id === chat.id ? 'border-gray-900' : 'hover:border-gray-400'
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{chat.user_name}</p>
                      <p className="text-xs text-gray-500">{chat.user_email}</p>
                    </div>
                    <Badge className={getStatusColor(chat.status)}>
                      {chat.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.last_message || 'No messages yet'}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {format(new Date(chat.updated_date), 'MMM dd, HH:mm')}
                    </span>
                    {chat.unread_count > 0 && (
                      <Badge className="bg-red-500 text-white">
                        {chat.unread_count}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          {!selectedChat ? (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Select a chat to start responding</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="border-b p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedChat.user_name}</h3>
                  <p className="text-sm text-gray-600">{selectedChat.user_email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResolveChat(selectedChat.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolve
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selectedChat.messages?.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Waiting for customer message...</p>
                  </div>
                ) : (
                  selectedChat.messages?.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          msg.is_admin
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-900 border'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{msg.sender}</p>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.is_admin ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {format(new Date(msg.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4 bg-white">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your response..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}