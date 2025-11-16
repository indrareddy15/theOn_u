/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, ChevronDown } from "lucide-react";

export default function MegaMenu({ categories, onNavigate }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Subcategories organized by actual product sub_category field values
  const mainCategories = [
    {
      id: "men",
      name: "Men",
      subcategories: [
        { name: "Tops", slug: "tops" },
        { name: "Bottoms", slug: "bottoms" },
        { name: "Outerwear", slug: "outerwear" },
        { name: "Shoes", slug: "shoes" },
        { name: "Accessories", slug: "accessories" },
        { name: "Bags", slug: "bags" },
      ],
    },
    {
      id: "women",
      name: "Women",
      subcategories: [
        { name: "Tops", slug: "tops" },
        { name: "Dresses", slug: "dresses" },
        { name: "Bottoms", slug: "bottoms" },
        { name: "Outerwear", slug: "outerwear" },
        { name: "Shoes", slug: "shoes" },
        { name: "Bags", slug: "bags" },
        { name: "Accessories", slug: "accessories" },
      ],
    },
    {
      id: "kids",
      name: "Kids",
      subcategories: [
        { name: "Clothing", slug: "clothing" },
        { name: "Shoes", slug: "shoes" },
        { name: "Accessories", slug: "accessories" },
        { name: "Bags", slug: "bags" },
      ],
    },
  ];

  const handleMouseEnter = (categoryId) => {
    if (!isMobile) {
      setActiveMenu(categoryId);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      // Use a timeout to prevent menu flickering when moving cursor
      setTimeout(() => {
        setActiveMenu(null);
      }, 200);
    }
  };

  const toggleMobileCategory = (categoryId) => {
    setExpandedMobile((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Desktop Navigation
  if (!isMobile) {
    return (
      <nav className="hidden lg:flex items-center gap-8">
        {mainCategories.map((category) => (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(category.id)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to={createPageUrl("Shop") + `?gender=${category.id}`}
              onClick={() => onNavigate?.()}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors uppercase tracking-wide"
            >
              {category.name}
            </Link>

            {/* Mega Menu Dropdown */}
            {activeMenu === category.id && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50 animate-fadeIn"
                onMouseEnter={() => setActiveMenu(category.id)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 min-w-[300px] backdrop-blur-sm">
                  {/* Categories Panel */}
                  <div className="bg-gradient-to-br from-gray-50 to-white p-8">
                    {/* <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                            Shop by Category
                                        </h3> */}
                    <div className="space-y-1">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          to={
                            createPageUrl("Shop") +
                            `?gender=${category.id}&subCategory=${sub.slug}`
                          }
                          onClick={() => onNavigate?.()}
                          className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <span>{sub.name}</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Additional Links */}
        <Link
          to={createPageUrl("Shop")}
          onClick={() => onNavigate?.()}
          className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors uppercase tracking-wide"
        >
          All Products
        </Link>
      </nav>
    );
  }

  // Mobile Navigation (for Layout mobile menu)
  return (
    <div className="space-y-2">
      {mainCategories.map((category) => (
        <div key={category.id}>
          <button
            onClick={() => toggleMobileCategory(category.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="uppercase tracking-wide">{category.name}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                expandedMobile[category.id] ? "rotate-180" : ""
              }`}
            />
          </button>

          {expandedMobile[category.id] && (
            <div className="ml-4 mt-2 space-y-1 animate-fadeIn">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.slug}
                  to={
                    createPageUrl("Shop") +
                    `?gender=${category.id}&subCategory=${sub.slug}`
                  }
                  onClick={() => onNavigate?.()}
                  className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
      <Link
        to={createPageUrl("Shop")}
        onClick={() => onNavigate?.()}
        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors uppercase tracking-wide"
      >
        All Products
      </Link>
    </div>
  );
}
