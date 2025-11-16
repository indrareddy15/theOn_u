import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
  Ruler,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ProductCard from "../components/store/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format, isValid } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProductDetail() {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [user, setUser] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [sizeChart, setSizeChart] = useState(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const loadSizeChart = useCallback(async (category) => {
    try {
      const charts = await base44.entities.SizeChart.filter({
        category,
        is_active: true,
      });
      if (charts.length > 0) {
        setSizeChart(charts[0]);
      }
    } catch {
      console.error("Error loading size chart");
    }
  }, []);

  const loadRelatedProducts = useCallback(
    async (category) => {
      try {
        const data = await base44.entities.Product.filter(
          { category, is_active: true },
          "-created_date",
          8
        );
        setRelatedProducts(data.filter((p) => p.id !== parseInt(productId)));
      } catch {
        console.error("Error loading related products");
      }
    },
    [productId]
  );

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      console.log(
        "Loading product with ID:",
        productId,
        "parsed:",
        parseInt(productId)
      );
      const product = await base44.entities.Product.get(parseInt(productId));
      console.log("Product loaded:", product);
      if (product) {
        setProduct(product);
        if (product.sizes?.length > 0) {
          setSelectedSize(product.sizes[0].size);
        }
        if (product.colors?.length > 0) {
          setSelectedColor(product.colors[0]);
        }
        loadRelatedProducts(product.category);
        loadSizeChart(product.category);
      } else {
        console.log("Product not found, redirecting to shop");
        navigate("/shop");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  }, [productId, navigate, loadRelatedProducts, loadSizeChart]);

  const loadReviews = useCallback(async () => {
    try {
      const reviews = await base44.entities.CustomerReview.filter({
        product_id: parseInt(productId),
      });
      setReviews(reviews);
    } catch {
      console.error("Error loading reviews");
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadReviews();
      loadUser();
    }
  }, [productId, loadProduct, loadReviews]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  const handleAddToCart = async () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (product.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    try {
      const user = await base44.auth.me(); // This will auto-login as customer
      console.log("User for add to cart:", user);
      console.log("Creating cart item:", {
        user_email: user.email,
        product_id: product.id,
        quantity,
        selected_size: selectedSize,
        selected_color: selectedColor?.name,
        price: product.sale_price || product.price,
      });

      await base44.entities.CartItem.create({
        user_email: user.email,
        product_id: product.id,
        quantity,
        selected_size: selectedSize,
        selected_color: selectedColor?.name,
        price: product.sale_price || product.price,
      });
      toast.success("Added to cart");
      navigate(createPageUrl("Cart"));
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlistToggle = async () => {
    try {
      const user = await base44.auth.me(); // This will auto-login as customer

      if (!isWishlisted) {
        await base44.entities.Wishlist.create({
          user_email: user.email,
          product_id: product.id,
        });
        toast.success("Added to wishlist");
        setIsWishlisted(true);
      } else {
        const items = await base44.entities.Wishlist.filter({
          user_email: user.email,
          product_id: product.id,
        });
        if (items[0]) {
          await base44.entities.Wishlist.delete(items[0].id);
          toast.success("Removed from wishlist");
          setIsWishlisted(false);
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleSubmitReview = async () => {
    const currentUser = await base44.auth.me(); // This will auto-login as customer
    if (!currentUser) {
      toast.error("Unable to submit review");
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      setSubmittingReview(true);
      await base44.entities.Review.create({
        product_id: parseInt(productId),
        user_email: currentUser.email,
        user_name:
          currentUser.full_name || currentUser.name || currentUser.email,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        verified_purchase: true,
        is_approved: true,
      });

      toast.success("Review submitted successfully!");
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: "", comment: "" });
      await loadReviews();

      const currentReviews = await base44.entities.Review.filter({
        product_id: parseInt(productId),
        is_approved: true,
      });
      const totalRating = currentReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / currentReviews.length;

      await base44.entities.Product.update(parseInt(productId), {
        average_rating: avgRating,
        review_count: currentReviews.length,
      });
      await loadProduct();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Product not found
        </h2>
        <Button onClick={() => navigate(createPageUrl("Shop"))}>
          Back to Shop
        </Button>
      </div>
    );
  }

  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;
  const displayPrice = product.sale_price || product.price;

  // Get images: use variant images if available, otherwise use product images
  const images =
    selectedColor?.images?.length > 0
      ? selectedColor.images
      : product.images?.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx
                      ? "border-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.category && (
                  <Badge variant="secondary" className="capitalize">
                    {product.category}
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge className="bg-red-500">{discount}% OFF</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              {product.average_rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(product.average_rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.average_rating.toFixed(1)} ({product.review_count}{" "}
                    reviews)
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  ₹{displayPrice.toLocaleString()}
                </span>
                {product.sale_price && (
                  <span className="text-2xl text-gray-400 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Color</h3>
                  <span className="text-sm text-gray-600 capitalize">
                    {selectedColor?.name || "Select a color"}
                  </span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedImage(0); // Reset to first image when changing color
                      }}
                      className={`group relative transition-transform ${
                        selectedColor?.name === color.name
                          ? "scale-110"
                          : "hover:scale-105"
                      }`}
                      title={color.name}
                    >
                      <div
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          selectedColor?.name === color.name
                            ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.code || "#ccc" }}
                      />
                      <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap bg-gray-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Size</h3>
                  {sizeChart && (
                    <Dialog
                      open={sizeChartOpen}
                      onOpenChange={setSizeChartOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Ruler className="w-4 h-4 mr-1" />
                          Size Chart
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            Size Chart - {sizeChart.category}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Size</TableHead>
                                {sizeChart.size_data[0]?.chest && (
                                  <TableHead>
                                    Chest ({sizeChart.unit})
                                  </TableHead>
                                )}
                                {sizeChart.size_data[0]?.waist && (
                                  <TableHead>
                                    Waist ({sizeChart.unit})
                                  </TableHead>
                                )}
                                {sizeChart.size_data[0]?.length && (
                                  <TableHead>
                                    Length ({sizeChart.unit})
                                  </TableHead>
                                )}
                                {sizeChart.size_data[0]?.shoulder && (
                                  <TableHead>
                                    Shoulder ({sizeChart.unit})
                                  </TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sizeChart.size_data.map((row, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">
                                    {row.size}
                                  </TableCell>
                                  {row.chest && (
                                    <TableCell>{row.chest}</TableCell>
                                  )}
                                  {row.waist && (
                                    <TableCell>{row.waist}</TableCell>
                                  )}
                                  {row.length && (
                                    <TableCell>{row.length}</TableCell>
                                  )}
                                  {row.shoulder && (
                                    <TableCell>{row.shoulder}</TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="flex gap-2">
                  {product.sizes.map((size, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(size.size)}
                      disabled={size.stock === 0}
                      className={`px-6 py-3 border-2 rounded-lg font-medium transition-colors ${
                        selectedSize === size.size
                          ? "border-gray-900 bg-gray-900 text-white"
                          : size.stock === 0
                          ? "border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-6 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {product.total_stock > 0 && (
                  <span className="text-sm text-gray-600">
                    {product.total_stock} items available
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-gray-900 hover:bg-gray-800"
                onClick={handleAddToCart}
                disabled={product.total_stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.total_stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleWishlistToggle}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="care">Care</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-8">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Product Details</h3>
                {product.specification && (
                  <p className="text-gray-600">{product.specification}</p>
                )}
                {product.material && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Material</h4>
                    <p className="text-gray-600">{product.material}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="care" className="mt-8">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">
                  Care Instructions
                </h3>
                <p className="text-gray-600">
                  {product.care_instructions ||
                    "Machine wash cold. Tumble dry low. Do not bleach."}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Customer Reviews</h3>
                {user && !showReviewForm && (
                  <Button onClick={() => setShowReviewForm(true)}>
                    Write a Review
                  </Button>
                )}
              </div>

              {showReviewForm && (
                <Card className="mb-8">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4">Write Your Review</h4>
                    <div className="space-y-4">
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
                        <Label>Review Title</Label>
                        <Input
                          value={reviewForm.title}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="Summarize your review"
                        />
                      </div>
                      <div>
                        <Label>Your Review *</Label>
                        <Textarea
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              comment: e.target.value,
                            })
                          }
                          placeholder="Share your thoughts about this product"
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {reviews.length === 0 ? (
                <p className="text-gray-600">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                      <div className="flex items-center gap-2 mb-2">
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
                        <span className="font-medium">{review.user_name}</span>
                        {review.verified_purchase && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-medium mb-2">{review.title}</h4>
                      )}
                      <p className="text-gray-600">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {review.created_date &&
                        isValid(new Date(review.created_date))
                          ? format(
                              new Date(review.created_date),
                              "MMM dd, yyyy"
                            )
                          : "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
