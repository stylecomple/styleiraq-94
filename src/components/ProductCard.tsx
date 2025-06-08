
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
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

  const handleAddToCart = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.cover_image || '/placeholder.svg',
      quantity: 1,
      selectedColor: product.options?.[0]?.name || null
    });
  };

  const discountedPrice = product.discount_percentage && product.discount_percentage > 0
    ? product.price * (1 - product.discount_percentage / 100)
    : null;

  const hasValidDiscount = product.discount_percentage && product.discount_percentage > 0;

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
      <div className="relative overflow-hidden">
        <img
          src={product.cover_image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Only show discount badge if percentage > 0 */}
        {hasValidDiscount && (
          <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white font-bold">
            خصم {product.discount_percentage}%
          </Badge>
        )}

        <div className="absolute top-3 left-3">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 hover:bg-white text-gray-700 hover:text-red-500 rounded-full"
          >
            <Heart className="w-4 h-4" />
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
            {/* Only show discounted price if there's a valid discount */}
            {hasValidDiscount ? (
              <>
                <span className="text-2xl font-bold text-pink-600">
                  {discountedPrice?.toFixed(0)} د.ع
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.price} د.ع
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-pink-600">
                {product.price} د.ع
              </span>
            )}
          </div>
        </div>

        <Button 
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 rounded-full transition-all duration-300 transform hover:scale-105"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          أضف للسلة
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
