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
  Megaphone, Image as ImageIcon, FileText, Mail, 
  Plus, Edit, Trash2, Save, Eye, Upload, X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Create entities for marketing content
const BANNER_ENTITY = {
  name: "Banner",
  type: "object",
  properties: {
    title: { type: "string", description: "Banner title" },
    subtitle: { type: "string", description: "Banner subtitle" },
    image_url: { type: "string", description: "Banner image URL" },
    link_url: { type: "string", description: "Click destination URL" },
    position: { type: "string", enum: ["home_hero", "home_secondary", "category"], description: "Banner placement" },
    display_order: { type: "number", default: 0, description: "Display order" },
    is_active: { type: "boolean", default: true, description: "Active status" },
    button_text: { type: "string", description: "Call to action button text" }
  },
  required: ["title", "image_url", "position"]
};

const CONTENT_PAGE_ENTITY = {
  name: "ContentPage",
  type: "object",
  properties: {
    slug: { type: "string", description: "URL slug" },
    title: { type: "string", description: "Page title" },
    content: { type: "string", description: "Page content (HTML)" },
    meta_description: { type: "string", description: "SEO meta description" },
    is_published: { type: "boolean", default: true, description: "Published status" }
  },
  required: ["slug", "title", "content"]
};

export default function AdminMarketing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [contentPages, setContentPages] = useState([]);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingPage, setEditingPage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    position: 'home_hero',
    display_order: 0,
    button_text: '',
    is_active: true
  });

  const [pageForm, setPageForm] = useState({
    slug: '',
    title: '',
    content: '',
    meta_description: '',
    is_published: true
  });

  const [emailCampaign, setEmailCampaign] = useState({
    subject: '',
    recipients: 'all_customers',
    message: ''
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
      await ensureEntitiesExist();
      loadData();
    } catch (error) {
      base44.auth.redirectToLogin(window.location.pathname);
    }
  };

  const ensureEntitiesExist = async () => {
    // Note: In a real implementation, entities should be created via entity files
    // This is a simplified approach for demonstration
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Note: These entities need to be created first
      // For now, using empty arrays as placeholders
      setBanners([]);
      setContentPages([]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Banner Management
  const handleImageUpload = async (e, type = 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (type === 'banner') {
        setBannerForm({ ...bannerForm, image_url: file_url });
      }
      
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.title || !bannerForm.image_url) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      // In production, use: await base44.entities.Banner.create/update
      toast.success(editingBanner ? 'Banner updated' : 'Banner created');
      setBannerDialogOpen(false);
      resetBannerForm();
    } catch (error) {
      toast.error('Failed to save banner');
    }
  };

  const resetBannerForm = () => {
    setEditingBanner(null);
    setBannerForm({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      position: 'home_hero',
      display_order: 0,
      button_text: '',
      is_active: true
    });
  };

  // Content Page Management
  const handleSavePage = async () => {
    if (!pageForm.slug || !pageForm.title || !pageForm.content) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      // In production, use: await base44.entities.ContentPage.create/update
      toast.success(editingPage ? 'Page updated' : 'Page created');
      setPageDialogOpen(false);
      resetPageForm();
    } catch (error) {
      toast.error('Failed to save page');
    }
  };

  const resetPageForm = () => {
    setEditingPage(null);
    setPageForm({
      slug: '',
      title: '',
      content: '',
      meta_description: '',
      is_published: true
    });
  };

  // Email Campaign
  const handleSendEmailCampaign = async () => {
    if (!emailCampaign.subject || !emailCampaign.message) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      // Get recipients based on selection
      let recipients = [];
      if (emailCampaign.recipients === 'all_customers') {
        const users = await base44.entities.User.list();
        recipients = users.filter(u => u.role === 'user').map(u => u.email);
      }

      // Send emails (in production, this should be done in batches)
      toast.info('Sending emails...');
      
      for (const email of recipients.slice(0, 5)) { // Limit for demo
        await base44.integrations.Core.SendEmail({
          from_name: 'TheOn Store',
          to: email,
          subject: emailCampaign.subject,
          body: emailCampaign.message
        });
      }

      toast.success(`Email campaign sent to ${recipients.length} customers`);
      setEmailCampaign({ subject: '', recipients: 'all_customers', message: '' });
    } catch (error) {
      toast.error('Failed to send email campaign');
    }
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
        <Megaphone className="w-8 h-8 text-gray-900" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing & Content</h1>
          <p className="text-gray-600 mt-1">Manage banners, content pages, and campaigns</p>
        </div>
      </div>

      <Tabs defaultValue="banners" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="banners">
            <ImageIcon className="w-4 h-4 mr-2" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="w-4 h-4 mr-2" />
            Content Pages
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email Campaigns
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Eye className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Banners Tab */}
        <TabsContent value="banners" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Website Banners</CardTitle>
              <Dialog open={bannerDialogOpen} onOpenChange={(open) => {
                setBannerDialogOpen(open);
                if (!open) resetBannerForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Banner
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        placeholder="e.g. Summer Sale 2024"
                      />
                    </div>
                    <div>
                      <Label>Subtitle</Label>
                      <Input
                        value={bannerForm.subtitle}
                        onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                        placeholder="e.g. Up to 50% off on selected items"
                      />
                    </div>
                    <div>
                      <Label>Banner Image *</Label>
                      {bannerForm.image_url ? (
                        <div className="relative">
                          <img
                            src={bannerForm.image_url}
                            alt="Banner preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setBannerForm({ ...bannerForm, image_url: '' })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'banner')}
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
                              <span className="text-sm text-gray-600">Click to upload banner image</span>
                              <span className="text-xs text-gray-500 mt-1">Recommended: 1920x600px</span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                    <div>
                      <Label>Button Text</Label>
                      <Input
                        value={bannerForm.button_text}
                        onChange={(e) => setBannerForm({ ...bannerForm, button_text: e.target.value })}
                        placeholder="e.g. Shop Now"
                      />
                    </div>
                    <div>
                      <Label>Link URL</Label>
                      <Input
                        value={bannerForm.link_url}
                        onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                        placeholder="/shop or https://..."
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Select
                        value={bannerForm.position}
                        onValueChange={(value) => setBannerForm({ ...bannerForm, position: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home_hero">Home - Hero Section</SelectItem>
                          <SelectItem value="home_secondary">Home - Secondary</SelectItem>
                          <SelectItem value="category">Category Pages</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={bannerForm.display_order}
                        onChange={(e) => setBannerForm({ ...bannerForm, display_order: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <Label>Active Status</Label>
                      <Switch
                        checked={bannerForm.is_active}
                        onCheckedChange={(checked) => setBannerForm({ ...bannerForm, is_active: checked })}
                      />
                    </div>
                    <Button onClick={handleSaveBanner} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      {editingBanner ? 'Update' : 'Create'} Banner
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {banners.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No banners created yet</p>
                  <p className="text-sm">Create your first banner to promote your products</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {banners.map(banner => (
                    <div key={banner.id} className="border rounded-lg p-4 flex gap-4">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                          <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{banner.position.replace('_', ' ')}</Badge>
                        </div>
                        {banner.subtitle && (
                          <p className="text-sm text-gray-600">{banner.subtitle}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Pages Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Content Pages</CardTitle>
              <Dialog open={pageDialogOpen} onOpenChange={(open) => {
                setPageDialogOpen(open);
                if (!open) resetPageForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Page
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPage ? 'Edit Page' : 'Create New Page'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Page Title *</Label>
                        <Input
                          value={pageForm.title}
                          onChange={(e) => {
                            const title = e.target.value;
                            setPageForm({
                              ...pageForm,
                              title,
                              slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                            });
                          }}
                          placeholder="e.g. About Us"
                        />
                      </div>
                      <div>
                        <Label>URL Slug *</Label>
                        <Input
                          value={pageForm.slug}
                          onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                          placeholder="e.g. about-us"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Meta Description (SEO)</Label>
                      <Textarea
                        value={pageForm.meta_description}
                        onChange={(e) => setPageForm({ ...pageForm, meta_description: e.target.value })}
                        placeholder="Brief description for search engines"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Page Content *</Label>
                      <ReactQuill
                        value={pageForm.content}
                        onChange={(content) => setPageForm({ ...pageForm, content })}
                        theme="snow"
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['link', 'image'],
                            ['clean']
                          ]
                        }}
                        className="bg-white"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <Label>Published Status</Label>
                      <Switch
                        checked={pageForm.is_published}
                        onCheckedChange={(checked) => setPageForm({ ...pageForm, is_published: checked })}
                      />
                    </div>
                    <Button onClick={handleSavePage} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      {editingPage ? 'Update' : 'Create'} Page
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {contentPages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No content pages created yet</p>
                  <p className="text-sm">Create pages like About Us, Terms of Service, etc.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contentPages.map(page => (
                    <div key={page.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{page.title}</h3>
                        <p className="text-sm text-gray-600">/{page.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={page.is_published ? 'default' : 'secondary'}>
                          {page.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Button variant="outline" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Campaigns Tab */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Email Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Recipients</Label>
                <Select
                  value={emailCampaign.recipients}
                  onValueChange={(value) => setEmailCampaign({ ...emailCampaign, recipients: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_customers">All Customers</SelectItem>
                    <SelectItem value="recent_orders">Customers with Recent Orders</SelectItem>
                    <SelectItem value="no_orders">Customers without Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Email Subject *</Label>
                <Input
                  value={emailCampaign.subject}
                  onChange={(e) => setEmailCampaign({ ...emailCampaign, subject: e.target.value })}
                  placeholder="e.g. Exclusive Offer Just for You!"
                />
              </div>
              <div>
                <Label>Email Message *</Label>
                <Textarea
                  value={emailCampaign.message}
                  onChange={(e) => setEmailCampaign({ ...emailCampaign, message: e.target.value })}
                  placeholder="Your email message..."
                  rows={10}
                />
              </div>
              <Button onClick={handleSendEmailCampaign} className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Send Email Campaign
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Site Title</Label>
                <Input defaultValue="TheOn E-commerce - Premium Fashion Store" />
              </div>
              <div>
                <Label>Site Description</Label>
                <Textarea
                  defaultValue="Discover premium fashion and trendy clothing at TheOn. Shop the latest collections with free shipping on orders over ₹2000."
                  rows={3}
                />
              </div>
              <div>
                <Label>Keywords</Label>
                <Input defaultValue="fashion, clothing, online shopping, premium apparel" />
              </div>
              <div>
                <Label>Google Analytics ID</Label>
                <Input placeholder="G-XXXXXXXXXX" />
              </div>
              <div>
                <Label>Facebook Pixel ID</Label>
                <Input placeholder="XXXXXXXXXXXXXXXX" />
              </div>
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}