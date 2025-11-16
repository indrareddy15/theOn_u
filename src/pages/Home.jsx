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
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">New Season Collection</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Elevate Your
              <span className="block bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                Style
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Discover the latest trends in fashion. Premium quality clothing designed for the modern individual.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => navigate(createPageUrl('Shop'))}
              >
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate(createPageUrl('Shop'))}
              >
                Browse Collections
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated collections designed to match every style and occasion
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-gray-600">Handpicked for You</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Featured Products
              </h2>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate(createPageUrl('Shop'))}
              className="hidden md:flex"
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
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Quote className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">What Our Customers Say</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Customer Reviews
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customerReviews.slice(0, 6).map(review => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      {review.customer_image ? (
                        <img 
                          src={review.customer_image} 
                          alt={review.customer_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
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
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{review.review_text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Fresh Off the Runway</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                New Arrivals
              </h2>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate(createPageUrl('Shop'))}
              className="hidden md:flex"
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
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Join Our Fashion Community
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Get exclusive access to new collections, special offers, and style inspiration
          </p>
          <Button 
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100"
            onClick={() => navigate(createPageUrl('Shop'))}
          >
            Start Shopping
            <ArrowRight className="ml-2 w-5 h-5" />
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