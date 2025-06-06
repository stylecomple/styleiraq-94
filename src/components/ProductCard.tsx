
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  cover_image: string | null;
  stock_quantity: number | null;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const categoryLabels = {
    makeup: 'مكياج',
    perfumes: 'عطور',
    flowers: 'ورد',
    home: 'مستلزمات منزلية',
    personal_care: 'عناية شخصية'
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative overflow-hidden">
        <img
          src={product.cover_image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Eye className="w-4 h-4 mr-2" />
            عرض سريع
          </Button>
        </div>
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2 bg-pink-600 text-white"
        >
          {categoryLabels[product.category as keyof typeof categoryLabels]}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-right">{product.name}</CardTitle>
        <CardDescription className="text-right text-sm line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-pink-600">
            {product.price} ر.س
          </span>
          <span className="text-sm text-muted-foreground">
            متوفر: {product.stock_quantity || 0}
          </span>
        </div>
        
        <Button 
          className="w-full bg-pink-600 hover:bg-pink-700"
          disabled={!product.stock_quantity || product.stock_quantity === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock_quantity && product.stock_quantity > 0 ? 'أضف للسلة' : 'غير متوفر'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
