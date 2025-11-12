import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";

export default function CategoryGrid({ categories }) {
    const navigate = useNavigate();

    const getCategoryImage = (category) => {
        return category.image_url || `https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500`;
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
                <div
                    key={category.id}
                    className={`group relative overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                        }`}
                    onClick={() => navigate(createPageUrl(`Shop?category=${category.slug}`))}
                >
                    <div className={`${index === 0 ? 'h-full min-h-[420px]' : 'h-64'} relative`}>
                        <img
                            src={getCategoryImage(category)}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 group-hover:via-black/50 transition-all duration-300" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h3 className={`font-bold mb-2 capitalize ${index === 0 ? 'text-3xl md:text-4xl' : 'text-xl'
                                }`}>
                                {category.name}
                            </h3>
                            {category.description && (
                                <p className="text-white/80 text-sm mb-4 line-clamp-2">
                                    {category.description}
                                </p>
                            )}
                            <div className="inline-flex items-center gap-2 text-sm font-semibold bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full group-hover:bg-white/20 transition-all duration-300">
                                <span>Shop Now</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
