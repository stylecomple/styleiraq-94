
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, Eye, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  cover_image: string | null;
  images: string[] | null;
  stock_quantity: number | null;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const categoryLabels = {
    makeup: 'مكياج',
    perfumes: 'عطور',
    flowers: 'ورد',
    home: 'مستلزمات منزلية',
    personal_care: 'عناية شخصية'
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0
    }).format(price * 1000); // Convert to Iraqi Dinar (assuming price is in USD equivalent)
  };

  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : product.cover_image 
    ? [product.cover_image] 
    : ['/placeholder.svg'];

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-0 shadow-lg">
        <div className="relative overflow-hidden">
          <img
            src={product.cover_image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white text-gray-800 shadow-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                عرض سريع
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-right">{product.name}</DialogTitle>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <img
                    src={allImages[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  
                  {allImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`border-2 rounded-lg overflow-hidden ${
                            selectedImageIndex === index ? 'border-pink-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700 mb-3">
                      {categoryLabels[product.category as keyof typeof categoryLabels]}
                    </Badge>
                    
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500">(4.8)</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-right leading-relaxed">
                    {product.description || 'منتج عالي الجودة من أفضل العلامات التجارية العالمية'}
                  </p>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-bold text-pink-600">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        متوفر: {product.stock_quantity || 0}
                      </span>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 text-lg"
                      disabled={!product.stock_quantity || product.stock_quantity === 0}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {product.stock_quantity && product.stock_quantity > 0 ? 'أضف للسلة' : 'غير متوفر'}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 bg-pink-600 text-white shadow-lg"
          >
            {categoryLabels[product.category as keyof typeof categoryLabels]}
          </Badge>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-right font-semibold">{product.name}</CardTitle>
          <CardDescription className="text-right text-sm line-clamp-2 text-gray-600">
            {product.description || 'منتج عالي الجودة'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-pink-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-gray-500">
              متوفر: {product.stock_quantity || 0}
            </span>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg"
            disabled={!product.stock_quantity || product.stock_quantity === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock_quantity && product.stock_quantity > 0 ? 'أضف للسلة' : 'غير متوفر'}
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default ProductCard;
