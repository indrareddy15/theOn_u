import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation } from "react-router-dom";
import {
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "../components/store/ProductCard";
import { Badge } from "@/components/ui/badge";

export default function Shop() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialCategory = urlParams.get("category");
  const initialSubCategory = urlParams.get("subCategory");
  const initialGender = urlParams.get("gender");
  const initialSearch = urlParams.get("q");

  // Sort options mapping for display
  const sortOptions = {
    "-created_date": "Newest First",
    created_date: "Oldest First",
    price: "Price: Low to High",
    "-price": "Price: High to Low",
    "-average_rating": "Highest Rated",
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [filters, setFilters] = useState({
    genders: initialGender ? [initialGender] : [],
    categories: initialCategory ? [initialCategory] : [],
    subCategories: initialSubCategory ? [initialSubCategory] : [],
    sizes: [],
    specialCategories: [],
    colors: [],
    hasDiscount: false,
    priceRange: [0, 50000],
    sortBy: "-created_date",
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Reinitialize filters when URL parameters change
  useEffect(() => {
    const newUrlParams = new URLSearchParams(location.search);
    const newCategory = newUrlParams.get("category");
    const newSubCategory = newUrlParams.get("subCategory");
    const newGender = newUrlParams.get("gender");
    const newSearch = newUrlParams.get("q");

    setSearchQuery(newSearch || "");
    setFilters((prev) => ({
      ...prev,
      genders: newGender ? [newGender] : [],
      categories: newCategory ? [newCategory] : [],
      subCategories: newSubCategory ? [newSubCategory] : [],
    }));
  }, [location.search]);
  const [showAllColors, setShowAllColors] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    gender: true,
    categories: true,
    subCategories: true,
    sizes: true,
    special: true,
    discount: true,
    price: true,
    colors: true,
  });

  // Calculate available filter options with counts
  const [filterCounts, setFilterCounts] = useState({
    genders: {},
    categories: {},
    subCategories: {},
    sizes: {},
    specialCategories: {},
    colors: {},
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const allProducts = await base44.entities.Product.filter(
        { is_active: true },
        filters.sortBy,
        500
      );
      setProducts(allProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }, [filters.sortBy]);

  const calculateFilterCounts = useCallback(() => {
    const counts = {
      genders: {},
      categories: {},
      subCategories: {},
      sizes: {},
      specialCategories: { bestSeller: 0, topPicks: 0 },
      colors: {},
    };

    // Calculate counts based on current filters (excluding the category we're counting)
    const getFilteredProducts = (excludeFilter) => {
      return products.filter((product) => {
        // Apply all filters except the one we're counting
        if (excludeFilter !== "gender" && filters.genders.length > 0) {
          if (!filters.genders.includes(product.gender)) return false;
        }
        if (excludeFilter !== "category" && filters.categories.length > 0) {
          if (!filters.categories.includes(product.category)) return false;
        }
        if (
          excludeFilter !== "subCategory" &&
          filters.subCategories.length > 0
        ) {
          if (!filters.subCategories.includes(product.sub_category))
            return false;
        }
        if (excludeFilter !== "size" && filters.sizes.length > 0) {
          if (
            !product.sizes?.some(
              (s) => filters.sizes.includes(s.size) && s.stock > 0
            )
          )
            return false;
        }
        if (
          excludeFilter !== "special" &&
          filters.specialCategories.length > 0
        ) {
          if (
            filters.specialCategories.includes("bestSeller") &&
            !product.is_featured
          )
            return false;
          if (
            filters.specialCategories.includes("topPicks") &&
            (product.average_rating || 0) < 4
          )
            return false;
        }
        if (excludeFilter !== "color" && filters.colors.length > 0) {
          if (!product.colors?.some((c) => filters.colors.includes(c.name)))
            return false;
        }
        if (filters.hasDiscount) {
          if (!product.sale_price) return false;
        }
        const price = product.sale_price || product.price;
        if (price < filters.priceRange[0] || price > filters.priceRange[1])
          return false;

        return true;
      });
    };

    // Count genders
    getFilteredProducts("gender").forEach((p) => {
      if (p.gender)
        counts.genders[p.gender] = (counts.genders[p.gender] || 0) + 1;
    });

    // Count categories
    getFilteredProducts("category").forEach((p) => {
      if (p.category)
        counts.categories[p.category] =
          (counts.categories[p.category] || 0) + 1;
    });

    // Count subcategories
    getFilteredProducts("subCategory").forEach((p) => {
      if (p.sub_category)
        counts.subCategories[p.sub_category] =
          (counts.subCategories[p.sub_category] || 0) + 1;
    });

    // Count sizes
    getFilteredProducts("size").forEach((p) => {
      p.sizes?.forEach((s) => {
        if (s.stock > 0) {
          counts.sizes[s.size] = (counts.sizes[s.size] || 0) + 1;
        }
      });
    });

    // Count special categories
    getFilteredProducts("special").forEach((p) => {
      if (p.is_featured) counts.specialCategories.bestSeller++;
      if ((p.average_rating || 0) >= 4) counts.specialCategories.topPicks++;
    });

    // Count colors
    getFilteredProducts("color").forEach((p) => {
      p.colors?.forEach((c) => {
        counts.colors[c.name] = (counts.colors[c.name] || 0) + 1;
      });
    });

    setFilterCounts(counts);
  }, [products, filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    calculateFilterCounts();
  }, [calculateFilterCounts]);

  const getFilteredProducts = () => {
    return products.filter((product) => {
      // Search filter
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          product.title?.toLowerCase().includes(query) ||
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.sub_category?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Gender filter
      if (
        filters.genders.length > 0 &&
        !filters.genders.includes(product.gender)
      ) {
        return false;
      }

      // Category filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category)
      ) {
        return false;
      }

      // Subcategory filter
      if (
        filters.subCategories.length > 0 &&
        !filters.subCategories.includes(product.sub_category)
      ) {
        return false;
      }

      // Size filter
      if (filters.sizes.length > 0) {
        const hasSize = product.sizes?.some(
          (s) => filters.sizes.includes(s.size) && s.stock > 0
        );
        if (!hasSize) return false;
      }

      // Special categories filter
      if (filters.specialCategories.length > 0) {
        if (
          filters.specialCategories.includes("bestSeller") &&
          !product.is_featured
        )
          return false;
        if (
          filters.specialCategories.includes("topPicks") &&
          (product.average_rating || 0) < 4
        )
          return false;
      }

      // Color filter
      if (filters.colors.length > 0) {
        const hasColor = product.colors?.some((c) =>
          filters.colors.includes(c.name)
        );
        if (!hasColor) return false;
      }

      // Discount filter
      if (filters.hasDiscount && !product.sale_price) {
        return false;
      }

      // Price filter
      const price = product.sale_price || product.price;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      return true;
    });
  };

  const filteredProducts = getFilteredProducts();

  const toggleFilter = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((v) => v !== value)
        : [...prev[filterType], value],
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const clearFilters = () => {
    setFilters({
      genders: [],
      categories: [],
      subCategories: [],
      sizes: [],
      specialCategories: [],
      colors: [],
      hasDiscount: false,
      priceRange: [0, 50000],
      sortBy: filters.sortBy,
    });
  };

  const activeFiltersCount =
    filters.genders.length +
    filters.categories.length +
    filters.subCategories.length +
    filters.sizes.length +
    filters.specialCategories.length +
    filters.colors.length +
    (filters.hasDiscount ? 1 : 0);

  const FilterSection = ({ title, items, filterType, sectionKey }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-gray-900">{title}</h4>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {isExpanded && (
          <div className="space-y-2">
            {items.map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id={`${filterType}-${key}`}
                    checked={filters[filterType].includes(key)}
                    onCheckedChange={() => toggleFilter(filterType, key)}
                  />
                  <Label
                    htmlFor={`${filterType}-${key}`}
                    className="ml-2 text-sm text-gray-700 capitalize cursor-pointer"
                  >
                    {key.replace("_", " ")}
                  </Label>
                </div>
                <span className="text-xs text-gray-500">({count})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const FilterContent = () => {
    const colorEntries = Object.entries(filterCounts.colors).sort(
      (a, b) => b[1] - a[1]
    );
    const displayedColors = showAllColors
      ? colorEntries
      : colorEntries.slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {activeFiltersCount > 0 && <Badge>{activeFiltersCount}</Badge>}
          </h3>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Gender */}
        {Object.keys(filterCounts.genders).length > 0 && (
          <FilterSection
            title="Gender"
            items={Object.entries(filterCounts.genders)}
            filterType="genders"
            sectionKey="gender"
          />
        )}

        {/* Categories */}
        {Object.keys(filterCounts.categories).length > 0 && (
          <FilterSection
            title="Categories"
            items={Object.entries(filterCounts.categories)}
            filterType="categories"
            sectionKey="categories"
          />
        )}

        {/* Subcategories */}
        {Object.keys(filterCounts.subCategories).length > 0 && (
          <FilterSection
            title="Subcategories"
            items={Object.entries(filterCounts.subCategories)}
            filterType="subCategories"
            sectionKey="subCategories"
          />
        )}

        {/* Sizes */}
        {Object.keys(filterCounts.sizes).length > 0 && (
          <div className="border-b pb-4">
            <button
              onClick={() => toggleSection("sizes")}
              className="flex items-center justify-between w-full mb-3"
            >
              <h4 className="font-semibold text-gray-900">Size</h4>
              {expandedSections.sizes ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedSections.sizes && (
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(filterCounts.sizes)
                  .sort((a, b) => {
                    // Sort sizes: text sizes first, then numeric
                    const aIsNum = !isNaN(a[0]);
                    const bIsNum = !isNaN(b[0]);
                    if (aIsNum && !bIsNum) return 1;
                    if (!aIsNum && bIsNum) return -1;
                    if (aIsNum && bIsNum)
                      return parseInt(a[0]) - parseInt(b[0]);
                    return a[0].localeCompare(b[0]);
                  })
                  .map(([size, count]) => (
                    <button
                      key={size}
                      onClick={() => toggleFilter("sizes", size)}
                      className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        filters.sizes.includes(size)
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div>{size}</div>
                      <div className="text-xs opacity-70">({count})</div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Special Category */}
        {(filterCounts.specialCategories.bestSeller > 0 ||
          filterCounts.specialCategories.topPicks > 0) && (
          <div className="border-b pb-4">
            <button
              onClick={() => toggleSection("special")}
              className="flex items-center justify-between w-full mb-3"
            >
              <h4 className="font-semibold text-gray-900">Special Category</h4>
              {expandedSections.special ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedSections.special && (
              <div className="space-y-2">
                {filterCounts.specialCategories.bestSeller > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Checkbox
                        id="special-bestSeller"
                        checked={filters.specialCategories.includes(
                          "bestSeller"
                        )}
                        onCheckedChange={() =>
                          toggleFilter("specialCategories", "bestSeller")
                        }
                      />
                      <Label
                        htmlFor="special-bestSeller"
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        Best Seller
                      </Label>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({filterCounts.specialCategories.bestSeller})
                    </span>
                  </div>
                )}
                {filterCounts.specialCategories.topPicks > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Checkbox
                        id="special-topPicks"
                        checked={filters.specialCategories.includes("topPicks")}
                        onCheckedChange={() =>
                          toggleFilter("specialCategories", "topPicks")
                        }
                      />
                      <Label
                        htmlFor="special-topPicks"
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        Top Picks
                      </Label>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({filterCounts.specialCategories.topPicks})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Discount */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("discount")}
            className="flex items-center justify-between w-full mb-3"
          >
            <h4 className="font-semibold text-gray-900">Discount</h4>
            {expandedSections.discount ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.discount && (
            <div className="flex items-center">
              <Checkbox
                id="hasDiscount"
                checked={filters.hasDiscount}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({ ...prev, hasDiscount: checked }))
                }
              />
              <Label
                htmlFor="hasDiscount"
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                Products with discount
              </Label>
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full mb-3"
          >
            <h4 className="font-semibold text-gray-900">Price</h4>
            {expandedSections.price ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.price && (
            <>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, priceRange: value }))
                }
                max={50000}
                step={500}
                className="mb-3"
              />
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>₹{filters.priceRange[0]}</span>
                <span>₹{filters.priceRange[1]}</span>
              </div>
              {filters.priceRange[0] !== 0 ||
              filters.priceRange[1] !== 50000 ? (
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  Showing products between ₹{filters.priceRange[0]} and ₹
                  {filters.priceRange[1]} ({filteredProducts.length})
                </p>
              ) : null}
            </>
          )}
        </div>

        {/* Colors */}
        {Object.keys(filterCounts.colors).length > 0 && (
          <div className="border-b pb-4">
            <button
              onClick={() => toggleSection("colors")}
              className="flex items-center justify-between w-full mb-3"
            >
              <h4 className="font-semibold text-gray-900">Color</h4>
              {expandedSections.colors ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedSections.colors && (
              <>
                <div className="space-y-2">
                  {displayedColors.map(([color, count]) => (
                    <div
                      key={color}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Checkbox
                          id={`color-${color}`}
                          checked={filters.colors.includes(color)}
                          onCheckedChange={() => toggleFilter("colors", color)}
                        />
                        <Label
                          htmlFor={`color-${color}`}
                          className="ml-2 text-sm text-gray-700 cursor-pointer"
                        >
                          {color}
                        </Label>
                      </div>
                      <span className="text-xs text-gray-500">({count})</span>
                    </div>
                  ))}
                </div>
                {colorEntries.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllColors(!showAllColors)}
                    className="mt-2 w-full text-xs"
                  >
                    {showAllColors
                      ? "Show Less"
                      : `More Colors (${colorEntries.length - 5})`}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "Shop All Products"}
            </h1>
            <p className="text-gray-600">
              {loading
                ? "Loading..."
                : `${filteredProducts.length} products found`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={filters?.sortBy}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, sortBy: value }))
              }
            >
              <SelectTrigger className="w-48">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <span className="text-gray-900">
                  {sortOptions[filters?.sortBy] || "Sort by"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_date">Newest First</SelectItem>
                <SelectItem value="created_date">Oldest First</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="-price">Price: High to Low</SelectItem>
                <SelectItem value="-average_rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2">{activeFiltersCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active Filters:</span>
            {filters.genders.map((g) => (
              <Badge
                key={g}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleFilter("genders", g)}
              >
                {g} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.categories.map((c) => (
              <Badge
                key={c}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleFilter("categories", c)}
              >
                {c} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.subCategories.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleFilter("subCategories", s)}
              >
                {s} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.sizes.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleFilter("sizes", s)}
              >
                Size: {s} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.colors.map((c) => (
              <Badge
                key={c}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleFilter("colors", c)}
              >
                {c} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.hasDiscount && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, hasDiscount: false }))
                }
              >
                With Discount <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white border rounded-2xl p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-80 rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
