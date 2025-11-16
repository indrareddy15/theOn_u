import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  Download,
  CheckSquare,
  Square,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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

export default function AdminProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    product: null,
  });
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [bulkActionDialog, setBulkActionDialog] = useState({
    open: false,
    action: null,
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Category color mapping
  const categoryColors = {
    men: "bg-blue-100 text-blue-800",
    women: "bg-pink-100 text-pink-800",
    kids: "bg-purple-100 text-purple-800",
    tops: "bg-green-100 text-green-800",
    bottoms: "bg-orange-100 text-orange-800",
    dresses: "bg-red-100 text-red-800",
    outerwear: "bg-indigo-100 text-indigo-800",
    shoes: "bg-yellow-100 text-yellow-800",
    accessories: "bg-cyan-100 text-cyan-800",
    bags: "bg-teal-100 text-teal-800",
  };

  const getFeaturedBadgeClass = () => "bg-amber-100 text-amber-800";

  const getCategoryBadgeClass = (category) => {
    const categoryKey = (category || "uncategorized")
      .toLowerCase()
      .replace(/\s+/g, "");
    return categoryColors[categoryKey] || "bg-gray-100 text-gray-800";
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, statusFilter, categoryFilter, sortConfig]);

  const checkAuth = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== "admin") {
        navigate(createPageUrl("Home"));
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
      const [productsData, categoriesData] = await Promise.all([
        base44.entities.Product.list("-created_date"),
        base44.entities.Category.list(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.product_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => {
        if (statusFilter === "active") return p.is_active === true;
        if (statusFilter === "inactive") return p.is_active === false;
        if (statusFilter === "out_of_stock") return (p.total_stock || 0) === 0;
        if (statusFilter === "low_stock")
          return (p.total_stock || 0) > 0 && (p.total_stock || 0) <= 10;
        return true;
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle price sorting
        if (sortConfig.key === "price") {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }

        // Handle stock sorting
        if (sortConfig.key === "total_stock") {
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
        }

        // Handle string sorting
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = (bValue || "").toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredProducts(filtered);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        // If same key, cycle through: asc -> desc -> null
        if (prevConfig.direction === "asc") {
          return { key, direction: "desc" };
        } else if (prevConfig.direction === "desc") {
          return { key: null, direction: null };
        }
      }
      // If different key or no direction, start with asc
      return { key, direction: "asc" };
    });
  };

  const handleDelete = async () => {
    if (!deleteDialog.product) return;

    try {
      await base44.entities.Product.delete(deleteDialog.product.id);
      setProducts((prev) =>
        prev.filter((p) => p.id !== deleteDialog.product.id)
      );
      toast.success("Product deleted successfully");
      setDeleteDialog({ open: false, product: null });
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      await base44.entities.Product.update(product.id, {
        is_active: !product.is_active,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: !p.is_active } : p
        )
      );
      toast.success(
        `Product ${!product.is_active ? "activated" : "deactivated"}`
      );
    } catch (error) {
      toast.error("Failed to update product status");
    }
  };

  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const toggleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedProducts.size === 0) {
      toast.error("No products selected");
      return;
    }

    setBulkActionDialog({ open: true, action });
  };

  const executeBulkAction = async () => {
    const { action } = bulkActionDialog;
    const selectedIds = Array.from(selectedProducts);

    try {
      for (const id of selectedIds) {
        if (action === "activate") {
          await base44.entities.Product.update(id, { is_active: true });
        } else if (action === "deactivate") {
          await base44.entities.Product.update(id, { is_active: false });
        } else if (action === "delete") {
          await base44.entities.Product.delete(id);
        } else if (action === "feature") {
          await base44.entities.Product.update(id, { is_featured: true });
        } else if (action === "unfeature") {
          await base44.entities.Product.update(id, { is_featured: false });
        }
      }

      // Reload data
      loadData();
      setSelectedProducts(new Set());
      setBulkActionDialog({ open: false, action: null });

      const actionText = {
        activate: "activated",
        deactivate: "deactivated",
        delete: "deleted",
        feature: "featured",
        unfeature: "unfeatured",
      }[action];

      toast.success(`${selectedIds.length} products ${actionText}`);
    } catch (error) {
      toast.error("Failed to perform bulk action");
    }
  };

  // Export Functions
  const exportToCSV = () => {
    const headers = [
      "Title",
      "SKU",
      "Category",
      "Price",
      "Sale Price",
      "Stock",
      "Status",
    ];
    const rows = filteredProducts.map((product) => [
      product.title,
      product.sku || "",
      product.category || "",
      product.price,
      product.sale_price || "",
      product.total_stock || 0,
      product.is_active ? "Active" : "Inactive",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Products exported successfully");
  };

  const exportSelectedToCSV = () => {
    if (selectedProducts.size === 0) {
      toast.error("No products selected");
      return;
    }

    const selected = filteredProducts.filter((p) => selectedProducts.has(p.id));
    const headers = [
      "Title",
      "SKU",
      "Category",
      "Price",
      "Sale Price",
      "Stock",
      "Status",
    ];
    const rows = selected.map((product) => [
      product.title,
      product.sku || "",
      product.category || "",
      product.price,
      product.sale_price || "",
      product.total_stock || 0,
      product.is_active ? "Active" : "Inactive",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected-products-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    toast.success(`${selectedProducts.size} products exported`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            {filteredProducts.length} products found
            {selectedProducts.size > 0 &&
              ` • ${selectedProducts.size} selected`}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                Export All to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportSelectedToCSV}>
                Export Selected to CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => navigate("/admin/products/form")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock (≤10)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={cat.slug}
                  className="capitalize"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setCategoryFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedProducts.size} product
            {selectedProducts.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("activate")}
            >
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("deactivate")}
            >
              Deactivate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("feature")}
            >
              Feature
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("unfeature")}
            >
              Unfeature
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("delete")}
              className="text-red-600"
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedProducts.size === filteredProducts.length &&
                      filteredProducts.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead
                  sortable={true}
                  onSort={() => handleSort("title")}
                  sortDirection={
                    sortConfig.key === "title" ? sortConfig.direction : null
                  }
                >
                  Product
                </TableHead>
                <TableHead
                  sortable={true}
                  onSort={() => handleSort("category")}
                  sortDirection={
                    sortConfig.key === "category" ? sortConfig.direction : null
                  }
                >
                  Category
                </TableHead>
                <TableHead
                  sortable={true}
                  onSort={() => handleSort("price")}
                  sortDirection={
                    sortConfig.key === "price" ? sortConfig.direction : null
                  }
                >
                  Price
                </TableHead>
                <TableHead
                  sortable={true}
                  onSort={() => handleSort("total_stock")}
                  sortDirection={
                    sortConfig.key === "total_stock"
                      ? sortConfig.direction
                      : null
                  }
                >
                  Stock
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No products found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() => toggleSelectProduct(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={
                          product.images?.[0] ||
                          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100"
                        }
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          SKU: {product.sku || "N/A"}
                        </p>
                        {product.is_featured && (
                          <Badge
                            className={`mt-1 text-xs ${getFeaturedBadgeClass()}`}
                          >
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize ${getCategoryBadgeClass(
                          product.category
                        )}`}
                      >
                        {product.category || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-gray-900">
                          ₹
                          {(
                            product.sale_price || product.price
                          ).toLocaleString()}
                        </p>
                        {product.sale_price && (
                          <p className="text-sm text-gray-400 line-through">
                            ₹{product.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(product.total_stock || 0) === 0 ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-600 font-medium">
                              Out of Stock
                            </span>
                          </>
                        ) : (product.total_stock || 0) <= 10 ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            <span className="text-yellow-600 font-medium">
                              {product.total_stock}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-900">
                            {product.total_stock}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.is_active ? "default" : "secondary"}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/products/form/${product.id}`)
                            }
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => toggleProductStatus(product)}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            {product.is_active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteDialog({ open: true, product })
                            }
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, product: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteDialog.product?.title}". This
              action cannot be undone.
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

      {/* Bulk Action Confirmation */}
      <AlertDialog
        open={bulkActionDialog.open}
        onOpenChange={(open) => setBulkActionDialog({ open, action: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {bulkActionDialog.action}{" "}
              {selectedProducts.size} product(s)?
              {bulkActionDialog.action === "delete" &&
                " This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkAction}
              className={
                bulkActionDialog.action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
