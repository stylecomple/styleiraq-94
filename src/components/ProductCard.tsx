
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Eye, Star, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  cover_image: string | null;
  images: string[] | null;
  colors: string[] | null;
  stock_quantity: number | null;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const categoryLabels = {
    makeup: 'مكياج',
    perfumes: 'عطور',
    flowers: 'ورد',
    home: 'مستلزمات منزلية',
    personal_care: 'عناية شخصية'
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : product.cover_image 
    ? [product.cover_image] 
    : ['/placeholder.svg'];

  const handleAddToCart = () => {
    const hasColors = product.colors && product.colors.length > 0;
    
    if (hasColors && !selectedColor) {
      toast({
        title: "يجب اختيار اللون",
        description: "يرجى اختيار لون للمنتج قبل إضافته للسلة",
        variant: "destructive"
      });
      return;
    }

    addToCart(product, selectedColor || undefined);
    
    toast({
      title: "تم إضافة المنتج",
      description: `تم إضافة ${product.name} ${selectedColor ? `(${selectedColor})` : ''} إلى السلة`,
    });
  };

  const isOutOfStock = !product.stock_quantity || product.stock_quantity === 0;
  const hasColors = product.colors && product.colors.length > 0;

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white border-0 shadow-lg rounded-2xl">
        <div className="relative overflow-hidden rounded-t-2xl">
          <img
            src={product.cover_image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Quick View Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 shadow-lg rounded-full px-6"
              >
                <Eye className="w-4 h-4 mr-2" />
                عرض سريع
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
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

                  {hasColors && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">اختر اللون: <span className="text-red-500">*</span></Label>
                      <Select value={selectedColor} onValueChange={setSelectedColor}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر لون" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.colors!.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-3xl font-bold text-pink-600">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={handleAddToCart}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 text-lg rounded-full"
                      disabled={isOutOfStock}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {isOutOfStock ? 'غير متوفر' : 'أضف للسلة'}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Category Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg border-0 rounded-full px-3 py-1"
          >
            {categoryLabels[product.category as keyof typeof categoryLabels]}
          </Badge>
        </div>
        
        <CardHeader className="pb-3 px-6">
          <CardTitle className="text-lg text-right font-bold text-gray-800 group-hover:text-purple-700 transition-colors line-clamp-1">
            {product.name}
          </CardTitle>
          <CardDescription className="text-right text-sm line-clamp-2 text-gray-600">
            {product.description || 'منتج عالي الجودة من أفضل العلامات التجارية'}
          </CardDescription>
          
          {/* Rating */}
          <div className="flex items-center justify-center gap-1 pt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-xs text-gray-500 mr-2">(4.8)</span>
          </div>

          {hasColors && (
            <div className="flex flex-wrap gap-1 justify-center pt-2">
              {product.colors!.slice(0, 3).map((color, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {color}
                </Badge>
              ))}
              {product.colors!.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.colors!.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0 px-6 pb-6">
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-full py-6"
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isOutOfStock ? 'غير متوفر' : 'أضف للسلة'}
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default ProductCard;
