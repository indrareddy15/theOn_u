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
                    className={`group relative overflow-hidden rounded-3xl cursor-pointer shadow-premium hover:shadow-premium-lg transition-all duration-500 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                        } animate-fadeIn`}
                    onClick={() => navigate(createPageUrl(`Shop?category=${category.slug}`))}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className={`${index === 0 ? 'h-full min-h-[450px]' : 'h-72'} relative`}>
                        <img
                            src={getCategoryImage(category)}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-120 transition-transform duration-700"
                            loading="lazy"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent group-hover:from-black/95 group-hover:via-black/60 transition-all duration-500" />

                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <h3 className={`font-black mb-3 capitalize ${index === 0 ? 'text-4xl md:text-5xl' : 'text-2xl'
                                } transition-all duration-300`}>
                                {category.name}
                            </h3>
                            {category.description && (
                                <p className="text-white/85 text-base mb-5 line-clamp-2 font-medium">
                                    {category.description}
                                </p>
                            )}
                            <div className="inline-flex items-center gap-3 text-base font-bold bg-white/20 backdrop-blur-md px-6 py-3 rounded-full group-hover:bg-white/30 group-hover:gap-4 transition-all duration-300 shadow-premium">
                                <span>Shop Now</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
