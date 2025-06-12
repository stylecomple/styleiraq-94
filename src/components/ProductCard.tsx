
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  const handleViewProduct = () => {
    navigate(`/app/product/${product.id}`);
  };

  const getEffectivePrice = () => {
    if (product.discount_percentage && product.discount_percentage > 0) {
      return product.price * (1 - product.discount_percentage / 100);
    }
    return product.price;
  };

  const hasValidDiscount = product.discount_percentage && product.discount_percentage > 0;

  // Get category and subcategory names for display
  const categoryName = product.categories && product.categories.length > 0 ? product.categories[0] : '';
  const subcategoryName = product.subcategories && product.subcategories.length > 0 ? product.subcategories[0] : '';

  // Define cool colors for categories and subcategories
  const getCategoryColor = (category: string) => {
    const colors = {
      'makeup': 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
      'perfumes': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
      'flowers': 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
      'home': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      'default': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const getSubcategoryColor = (subcategory: string) => {
    const colors = {
      'lipstick': 'bg-gradient-to-r from-pink-400 to-rose-400 text-white',
      'foundation': 'bg-gradient-to-r from-orange-400 to-amber-400 text-white',
      'eyeshadow': 'bg-gradient-to-r from-purple-400 to-violet-400 text-white',
      'fragrance': 'bg-gradient-to-r from-indigo-400 to-blue-400 text-white',
      'default': 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'
    };
    return colors[subcategory as keyof typeof colors] || colors.default;
  };

  return (
    <Card 
      className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white cursor-pointer h-80 flex flex-col hover:scale-105"
      onClick={handleViewProduct}
    >
      <div className="relative overflow-hidden h-36 flex-shrink-0">
        <img
          src={product.cover_image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Discount badge */}
        {hasValidDiscount && (
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-xs font-bold shadow-lg animate-pulse">
            -{product.discount_percentage}%
          </Badge>
        )}
      </div>

      <CardContent className="p-3 flex flex-col flex-1 relative">
        <h3 className="font-semibold text-sm mb-2 text-gray-800 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {/* Category and Subcategory with cool styling */}
        {(categoryName || subcategoryName) && (
          <div className="flex flex-wrap gap-1 mb-2">
            {categoryName && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(categoryName)}`}>
                {categoryName}
              </span>
            )}
            {subcategoryName && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSubcategoryColor(subcategoryName)}`}>
                {subcategoryName}
              </span>
            )}
          </div>
        )}

        {/* Price - more compact spacing */}
        <div className="flex flex-col mb-3">
          {hasValidDiscount ? (
            <>
              <span className="text-lg font-bold text-pink-600">
                {Math.round(getEffectivePrice()).toLocaleString()} د.ع
              </span>
              <span className="text-xs text-gray-500 line-through">
                {product.price.toLocaleString()} د.ع
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-pink-600">
              {product.price.toLocaleString()} د.ع
            </span>
          )}
        </div>

        {/* View Product Button - always visible at bottom */}
        <div className="mt-auto">
          <Button 
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-2 rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Eye className="w-4 h-4 mr-1" />
            عرض المنتج
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
