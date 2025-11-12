import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, Sparkles, Quote } from "lucide-react";
import ProductCard from "../components/store/ProductCard";
import CategoryGrid from "../components/store/CategoryGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customerReviews, setCustomerReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [featured, recent, cats, reviews] = await Promise.all([
        base44.entities.Product.filter({ is_featured: true, is_active: true }, '-created_date', 8),
        base44.entities.Product.filter({ is_active: true }, '-created_date', 8),
        base44.entities.Category.filter({ is_active: true }, 'display_order', 6),
        base44.entities.CustomerReview.filter({ is_active: true }, 'display_order', 10)
      ]);
      setFeaturedProducts(featured);
      setNewArrivals(recent);
      setCategories(cats);
      setCustomerReviews(reviews);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium Enhanced */}
      <section className="relative h-[600px] md:h-[800px] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-hidden group">
        {/* Enhanced Gradient Blobs with Better Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          {/* Additional subtle overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl animate-slideInLeft" style={{ animationDuration: '0.8s' }}>
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-white/90 backdrop-blur-md rounded-full mb-8 shadow-premium hover:shadow-premium-lg transition-all duration-300 border border-white/70 group/badge hover:scale-105">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse-subtle" />
              <span className="text-sm font-bold text-gray-800 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">New Season Collection</span>
            </div>

            {/* Enhanced Headline with Better Typography */}
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-6 leading-tight tracking-tight animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              Redefine Your
              <span className="block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Everyday Style
              </span>
            </h1>

            {/* Enhanced Subheading */}
            <p className="text-lg md:text-2xl text-gray-700 mb-12 max-w-lg leading-relaxed font-semibold animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              Discover premium fashion designed for modern living — curated for those who dress with purpose.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-premium hover:shadow-premium-lg transition-all duration-300 group rounded-xl font-bold text-base px-8"
                onClick={() => navigate(createPageUrl('Shop'))}
              >
                <span>Shop Now</span>
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl hover:bg-gray-100 border-2 border-gray-900 text-gray-900 font-bold transition-all duration-300 hover:shadow-premium px-8"
                onClick={() => navigate(createPageUrl('Shop'))}
              >
                Browse Collections
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Find Your Perfect Fit
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Explore looks that speak your language.
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (
            <CategoryGrid categories={categories} />
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 animate-fadeIn">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-gray-600">Curated Selection</span>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  Editor's Picks for You
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed">
                  Elevate your wardrobe with this season's exclusive pieces.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('Shop'))}
              className="hidden md:inline-flex whitespace-nowrap"
            >
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-80 rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews */}
      {customerReviews.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fadeIn">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Quote className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-600">Our Community</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Real Stories. Real Style.
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Our community speaks for our quality and design.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customerReviews.slice(0, 6).map(review => (
                <Card key={review.id} className="hover:shadow-md transition-all duration-300 border border-gray-100 bg-white/50 backdrop-blur-sm hover:bg-white/80 animate-fadeIn">
                  <CardContent className="pt-6 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {review.customer_image ? (
                          <img
                            src={review.customer_image}
                            alt={review.customer_name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ring-2 ring-gray-100">
                            <span className="text-gray-600 font-bold text-lg">
                              {review.customer_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.customer_name}</h4>
                          {review.location && (
                            <p className="text-xs text-gray-500">{review.location}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed italic">"{review.review_text}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 animate-fadeIn">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-gray-600">Fresh Releases</span>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  Just Dropped
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed">
                  Be the first to wear what's next in fashion.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('Shop'))}
              className="hidden md:inline-flex whitespace-nowrap"
            >
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-80 rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-yellow-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fadeIn">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Join the Style Revolution
          </h2>
          <p className="text-base md:text-lg text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Sign up for early access and exclusive drops.
          </p>
          <Button
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group font-semibold"
            onClick={() => navigate(createPageUrl('Shop'))}
          >
            Shop the Collection
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
