
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    // If product has options, redirect to product detail page
    if (product.options && product.options.length > 0) {
      navigate(`/product/${product.id}`);
      return;
    }

    // Quick add for products without options
    addToCart({
      id: product.id,
      name: product.name,
      price: getEffectivePrice(),
      image: product.cover_image || '/placeholder.svg',
      quantity: 1,
      selectedColor: null
    });
  };

  const handleViewProduct = () => {
    navigate(`/product/${product.id}`);
  };

  const getEffectivePrice = () => {
    if (product.discount_percentage && product.discount_percentage > 0) {
      return product.price * (1 - product.discount_percentage / 100);
    }
    return product.price;
  };

  const hasValidDiscount = product.discount_percentage && product.discount_percentage > 0;
  const hasOptions = product.options && product.options.length > 0;
  const hasMultipleImages = product.images && product.images.length > 0;

  return (
    <Card 
      className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white cursor-pointer"
      onClick={handleViewProduct}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.cover_image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Discount badge - only show if there's a valid discount */}
        {hasValidDiscount && (
          <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white font-bold">
            خصم {product.discount_percentage}%
          </Badge>
        )}

        {/* Multiple images indicator */}
        {hasMultipleImages && (
          <Badge className="absolute top-3 left-3 bg-blue-500 hover:bg-blue-600 text-white text-xs">
            +{product.images.length} صور
          </Badge>
        )}

        {/* Options indicator */}
        {hasOptions && (
          <Badge className="absolute bottom-3 right-3 bg-purple-500 hover:bg-purple-600 text-white text-xs">
            خيارات متعددة
          </Badge>
        )}

        <div className="absolute top-3 left-3">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 hover:bg-white text-gray-700 hover:text-red-500 rounded-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* View overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white text-gray-700 rounded-full"
          >
            <Eye className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-pink-600 transition-colors">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            {hasValidDiscount ? (
              <>
                <span className="text-2xl font-bold text-pink-600">
                  {Math.round(getEffectivePrice()).toLocaleString()} د.ع
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.price.toLocaleString()} د.ع
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-pink-600">
                {product.price.toLocaleString()} د.ع
              </span>
            )}
          </div>
        </div>

        <Button 
          onClick={handleQuickAdd}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 rounded-full transition-all duration-300 transform hover:scale-105"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {hasOptions ? 'عرض التفاصيل' : 'أضف للسلة'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
