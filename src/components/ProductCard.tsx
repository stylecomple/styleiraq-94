
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
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
      navigate('/app/auth');
      return;
    }

    // If product has options, redirect to product detail page
    if (product.options && product.options.length > 0) {
      navigate(`/app/product/${product.id}`);
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
    navigate(`/app/product/${product.id}`);
  };

  const getEffectivePrice = () => {
    if (product.discount_percentage && product.discount_percentage > 0) {
      return product.price * (1 - product.discount_percentage / 100);
    }
    return product.price;
  };

  const hasValidDiscount = product.discount_percentage && product.discount_percentage > 0;
  const hasOptions = product.options && product.options.length > 0;

  // Get category and subcategory names (simplified for mobile)
  const categoryName = product.categories && product.categories.length > 0 ? product.categories[0] : '';
  const subcategoryName = product.subcategories && product.subcategories.length > 0 ? product.subcategories[0] : '';

  return (
    <Card 
      className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-white cursor-pointer"
      onClick={handleViewProduct}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.cover_image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        {/* Discount badge */}
        {hasValidDiscount && (
          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs">
            -{product.discount_percentage}%
          </Badge>
        )}
      </div>

      <CardContent className="p-3">
        <h3 className="font-semibold text-sm mb-1 text-gray-800 line-clamp-1">
          {product.name}
        </h3>
        
        {/* Category and Subcategory */}
        <div className="text-xs text-gray-500 mb-2">
          {categoryName && <span>{categoryName}</span>}
          {categoryName && subcategoryName && <span> • </span>}
          {subcategoryName && <span>{subcategoryName}</span>}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
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
        </div>

        <Button 
          onClick={handleQuickAdd}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 rounded-md text-sm"
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          {hasOptions ? 'عرض' : 'أضف'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
