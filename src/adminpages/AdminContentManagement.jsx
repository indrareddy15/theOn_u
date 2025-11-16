import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  MapPin,
  Ruler,
  Quote,
  Shield,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminContentManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Customer Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    customer_name: "",
    customer_image: "",
    rating: 5,
    review_text: "",
    location: "",
    is_active: true,
    display_order: 0,
  });

  // Disclaimers
  const [disclaimers, setDisclaimers] = useState([]);
  const [disclaimerDialogOpen, setDisclaimerDialogOpen] = useState(false);
  const [editingDisclaimer, setEditingDisclaimer] = useState(null);
  const [disclaimerForm, setDisclaimerForm] = useState({
    title: "",
    content: "",
    icon: "Shield",
    position: "header",
    is_active: true,
    display_order: 0,
  });

  // Size Charts
  const [sizeCharts, setSizeCharts] = useState([]);
  const [sizeChartDialogOpen, setSizeChartDialogOpen] = useState(false);
  const [editingSizeChart, setEditingSizeChart] = useState(null);
  const [sizeChartForm, setSizeChartForm] = useState({
    category: "",
    unit: "inches",
    is_active: true,
    size_data: [{ size: "S", chest: "", waist: "", length: "", shoulder: "" }],
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: "",
    id: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== "admin") {
        navigate(createPageUrl("Home"));
        return;
      }
      loadData();
    } catch (error) {
      console.error("Authentication error:", error);
      base44.auth.redirectToLogin(window.location.pathname);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsData, disclaimersData, sizeChartsData] = await Promise.all([
        base44.entities.CustomerReview.list("display_order"),
        base44.entities.Disclaimer.list("display_order"),
        base44.entities.SizeChart.list("category"),
      ]);
      setReviews(reviewsData);
      setDisclaimers(disclaimersData);
      setSizeCharts(sizeChartsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Customer Reviews Functions
  const handleSaveReview = async () => {
    if (!reviewForm.customer_name || !reviewForm.review_text) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingReview) {
        await base44.entities.CustomerReview.update(
          editingReview.id,
          reviewForm
        );
        toast.success("Review updated successfully");
      } else {
        await base44.entities.CustomerReview.create(reviewForm);
        toast.success("Review added successfully");
      }
      loadData();
      setReviewDialogOpen(false);
      resetReviewForm();
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review");
    }
  };

  const resetReviewForm = () => {
    setEditingReview(null);
    setReviewForm({
      customer_name: "",
      customer_image: "",
      rating: 5,
      review_text: "",
      location: "",
      is_active: true,
      display_order: 0,
    });
  };

  // Disclaimers Functions
  const handleSaveDisclaimer = async () => {
    if (!disclaimerForm.title || !disclaimerForm.content) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingDisclaimer) {
        await base44.entities.Disclaimer.update(
          editingDisclaimer.id,
          disclaimerForm
        );
        toast.success("Disclaimer updated successfully");
      } else {
        await base44.entities.Disclaimer.create(disclaimerForm);
        toast.success("Disclaimer added successfully");
      }
      loadData();
      setDisclaimerDialogOpen(false);
      resetDisclaimerForm();
    } catch (error) {
      console.error("Error saving disclaimer:", error);
      toast.error("Failed to save disclaimer");
    }
  };

  const resetDisclaimerForm = () => {
    setEditingDisclaimer(null);
    setDisclaimerForm({
      title: "",
      content: "",
      icon: "Shield",
      position: "header",
      is_active: true,
      display_order: 0,
    });
  };

  // Size Charts Functions
  const handleSaveSizeChart = async () => {
    if (!sizeChartForm.category || sizeChartForm.size_data.length === 0) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingSizeChart) {
        await base44.entities.SizeChart.update(
          editingSizeChart.id,
          sizeChartForm
        );
        toast.success("Size chart updated successfully");
      } else {
        await base44.entities.SizeChart.create(sizeChartForm);
        toast.success("Size chart added successfully");
      }
      loadData();
      setSizeChartDialogOpen(false);
      resetSizeChartForm();
    } catch (error) {
      console.error("Error saving size chart:", error);
      toast.error("Failed to save size chart");
    }
  };

  const resetSizeChartForm = () => {
    setEditingSizeChart(null);
    setSizeChartForm({
      category: "",
      unit: "inches",
      is_active: true,
      size_data: [
        { size: "S", chest: "", waist: "", length: "", shoulder: "" },
      ],
    });
  };

  const addSizeRow = () => {
    setSizeChartForm({
      ...sizeChartForm,
      size_data: [
        ...(sizeChartForm.size_data || []),
        { size: "", chest: "", waist: "", length: "", shoulder: "" },
      ],
    });
  };

  const updateSizeRow = (index, field, value) => {
    const currentData = sizeChartForm.size_data || [];
    const newData = [...currentData];
    if (newData[index]) {
      newData[index][field] = value;
      setSizeChartForm({ ...sizeChartForm, size_data: newData });
    }
  };

  const removeSizeRow = (index) => {
    const currentData = sizeChartForm.size_data || [];
    const newData = currentData.filter((_, i) => i !== index);
    setSizeChartForm({ ...sizeChartForm, size_data: newData });
  };

  const handleDelete = async () => {
    try {
      if (deleteDialog.type === "review") {
        await base44.entities.CustomerReview.delete(deleteDialog.id);
        toast.success("Review deleted");
      } else if (deleteDialog.type === "disclaimer") {
        await base44.entities.Disclaimer.delete(deleteDialog.id);
        toast.success("Disclaimer deleted");
      } else if (deleteDialog.type === "sizechart") {
        await base44.entities.SizeChart.delete(deleteDialog.id);
        toast.success("Size chart deleted");
      }
      loadData();
      setDeleteDialog({ open: false, type: "", id: null });
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Content Management
      </h1>

      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
          <TabsTrigger value="disclaimers">Disclaimers</TabsTrigger>
          <TabsTrigger value="sizecharts">Size Charts</TabsTrigger>
        </TabsList>

        {/* Customer Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Quote className="w-5 h-5" />
                Customer Reviews
              </CardTitle>
              <div>
                <Dialog
                  open={reviewDialogOpen}
                  onOpenChange={(open) => {
                    setReviewDialogOpen(open);
                    if (open && !editingReview) {
                      resetReviewForm();
                      setEditingReview(null);
                    }
                    if (!open) {
                      setEditingReview(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingReview ? "Edit" : "Add"} Customer Review
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Customer Name *</Label>
                          <Input
                            value={reviewForm.customer_name}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                customer_name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={reviewForm.location}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                location: e.target.value,
                              })
                            }
                            placeholder="e.g., Mumbai, India"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Customer Image URL</Label>
                        <Input
                          value={reviewForm.customer_image}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              customer_image: e.target.value,
                            })
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label>Rating *</Label>
                        <div className="flex gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() =>
                                setReviewForm({ ...reviewForm, rating: star })
                              }
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= reviewForm.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Review Text *</Label>
                        <Textarea
                          value={reviewForm.review_text}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              review_text: e.target.value,
                            })
                          }
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Display Order</Label>
                          <Input
                            type="number"
                            value={reviewForm.display_order}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                display_order: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-8">
                          <input
                            type="checkbox"
                            id="review-active"
                            checked={reviewForm.is_active}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                is_active: e.target.checked,
                              })
                            }
                            className="w-4 h-4"
                          />
                          <Label htmlFor="review-active">Active</Label>
                        </div>
                      </div>
                      <Button onClick={handleSaveReview} className="w-full">
                        {editingReview ? "Update" : "Add"} Review
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
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{review.customer_name}</p>
                          {review.location && (
                            <p className="text-xs text-gray-500">
                              {review.location}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {review.review_text}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={review.is_active ? "default" : "secondary"}
                        >
                          {review.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingReview(review);
                              setReviewForm(review);
                              setReviewDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: "review",
                                id: review.id,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
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

        {/* Disclaimers Tab */}
        <TabsContent value="disclaimers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Disclaimers
              </CardTitle>
              <div>
                <Dialog
                  open={disclaimerDialogOpen}
                  onOpenChange={(open) => {
                    setDisclaimerDialogOpen(open);
                    if (open && !editingDisclaimer) {
                      resetDisclaimerForm();
                      setEditingDisclaimer(null);
                    }
                    if (!open) {
                      setEditingDisclaimer(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Disclaimer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingDisclaimer ? "Edit" : "Add"} Disclaimer
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 p-6">
                      <div>
                        <Label>Title *</Label>
                        <Input
                          value={disclaimerForm.title}
                          onChange={(e) =>
                            setDisclaimerForm({
                              ...disclaimerForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g., Free Shipping"
                        />
                      </div>
                      <div>
                        <Label>Content *</Label>
                        <Textarea
                          value={disclaimerForm.content}
                          onChange={(e) =>
                            setDisclaimerForm({
                              ...disclaimerForm,
                              content: e.target.value,
                            })
                          }
                          placeholder="e.g., On orders over ₹2000"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Icon</Label>
                          <select
                            value={disclaimerForm.icon}
                            onChange={(e) =>
                              setDisclaimerForm({
                                ...disclaimerForm,
                                icon: e.target.value,
                              })
                            }
                            className="w-full border rounded-md px-3 py-2"
                          >
                            <option value="Shield">Shield 🛡️</option>
                            <option value="Truck">Truck 🚚</option>
                            <option value="RefreshCw">Refresh 🔄</option>
                            <option value="Package">Package 📦</option>
                            <option value="CheckCircle">Check ✓</option>
                            <option value="Heart">Heart ❤️</option>
                          </select>
                        </div>
                        <div>
                          <Label>Position</Label>
                          <select
                            value={disclaimerForm.position}
                            onChange={(e) =>
                              setDisclaimerForm({
                                ...disclaimerForm,
                                position: e.target.value,
                              })
                            }
                            className="w-full border rounded-md px-3 py-2"
                          >
                            <option value="header">
                              🔝 Header / Banner (Above Navbar) - Black
                              Background
                            </option>
                            <option value="footer">
                              📄 Footer (Bottom of Page)
                            </option>
                            <option value="checkout">🛒 Checkout Page</option>
                            <option value="product">📦 Product Page</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Display Order</Label>
                          <Input
                            type="number"
                            value={disclaimerForm.display_order}
                            onChange={(e) =>
                              setDisclaimerForm({
                                ...disclaimerForm,
                                display_order: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-8">
                          <input
                            type="checkbox"
                            id="disclaimer-active"
                            checked={disclaimerForm.is_active}
                            onChange={(e) =>
                              setDisclaimerForm({
                                ...disclaimerForm,
                                is_active: e.target.checked,
                              })
                            }
                            className="w-4 h-4"
                          />
                          <Label htmlFor="disclaimer-active">Active</Label>
                        </div>
                      </div>
                      <Button onClick={handleSaveDisclaimer} className="w-full">
                        {editingDisclaimer ? "Update" : "Add"} Disclaimer
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
                    <TableHead>Title</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disclaimers.map((disclaimer) => (
                    <TableRow key={disclaimer.id}>
                      <TableCell className="font-medium">
                        {disclaimer.title}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {disclaimer.content}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {disclaimer.position}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            disclaimer.is_active ? "default" : "secondary"
                          }
                        >
                          {disclaimer.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingDisclaimer(disclaimer);
                              setDisclaimerForm(disclaimer);
                              setDisclaimerDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: "disclaimer",
                                id: disclaimer.id,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
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

        {/* Size Charts Tab */}
        <TabsContent value="sizecharts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Size Charts
              </CardTitle>
              <div>
                <Dialog
                  open={sizeChartDialogOpen}
                  onOpenChange={(open) => {
                    setSizeChartDialogOpen(open);
                    if (open && !editingSizeChart) {
                      resetSizeChartForm();
                      setEditingSizeChart(null);
                    }
                    if (!open) {
                      setEditingSizeChart(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Size Chart
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSizeChart ? "Edit" : "Add"} Size Chart
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Category *</Label>
                          <Input
                            value={sizeChartForm.category}
                            onChange={(e) =>
                              setSizeChartForm({
                                ...sizeChartForm,
                                category: e.target.value,
                              })
                            }
                            placeholder="e.g., shirts, jeans"
                          />
                        </div>
                        <div>
                          <Label>Unit</Label>
                          <select
                            value={sizeChartForm.unit}
                            onChange={(e) =>
                              setSizeChartForm({
                                ...sizeChartForm,
                                unit: e.target.value,
                              })
                            }
                            className="w-full border rounded-md px-3 py-2"
                          >
                            <option value="inches">Inches</option>
                            <option value="cm">Centimeters</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Size Data</Label>
                        <div className="space-y-2 border rounded-lg p-4">
                          {(sizeChartForm.size_data || []).map((row, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-6 gap-2 items-center"
                            >
                              <Input
                                placeholder="Size"
                                value={row.size || ""}
                                onChange={(e) =>
                                  updateSizeRow(index, "size", e.target.value)
                                }
                              />
                              <Input
                                placeholder="Chest"
                                value={row.chest || ""}
                                onChange={(e) =>
                                  updateSizeRow(index, "chest", e.target.value)
                                }
                              />
                              <Input
                                placeholder="Waist"
                                value={row.waist || ""}
                                onChange={(e) =>
                                  updateSizeRow(index, "waist", e.target.value)
                                }
                              />
                              <Input
                                placeholder="Length"
                                value={row.length || ""}
                                onChange={(e) =>
                                  updateSizeRow(index, "length", e.target.value)
                                }
                              />
                              <Input
                                placeholder="Shoulder"
                                value={row.shoulder || ""}
                                onChange={(e) =>
                                  updateSizeRow(
                                    index,
                                    "shoulder",
                                    e.target.value
                                  )
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSizeRow(index)}
                                disabled={
                                  (sizeChartForm.size_data || []).length === 1
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addSizeRow}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Size
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sizechart-active"
                          checked={sizeChartForm.is_active}
                          onChange={(e) =>
                            setSizeChartForm({
                              ...sizeChartForm,
                              is_active: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <Label htmlFor="sizechart-active">Active</Label>
                      </div>

                      <Button onClick={handleSaveSizeChart} className="w-full">
                        {editingSizeChart ? "Update" : "Add"} Size Chart
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
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Sizes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sizeCharts.map((chart) => (
                    <TableRow key={chart.id}>
                      <TableCell className="font-medium capitalize">
                        {chart.category}
                      </TableCell>
                      <TableCell className="capitalize">{chart.unit}</TableCell>
                      <TableCell>
                        {chart.size_data?.map((s) => s.size).join(", ")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={chart.is_active ? "default" : "secondary"}
                        >
                          {chart.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSizeChart(chart);
                              setSizeChartForm({
                                ...chart,
                                size_data: chart.size_data || [
                                  {
                                    size: "S",
                                    chest: "",
                                    waist: "",
                                    length: "",
                                    shoulder: "",
                                  },
                                ],
                              });
                              setSizeChartDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: "sizechart",
                                id: chart.id,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
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
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this{" "}
              {deleteDialog.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
