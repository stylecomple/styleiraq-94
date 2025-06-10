
import React from 'react';
import { Tag, Percent, Sparkles } from 'lucide-react';

interface Product {
  name: string;
  discount_percentage: number;
}

interface ProductDiscountTickerProps {
  products: Product[];
}

const ProductDiscountTicker = ({ products }: ProductDiscountTickerProps) => {
  if (!products || products.length === 0) return null;

  // Duplicate products to create seamless loop
  const duplicatedProducts = [...products, ...products];

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 overflow-hidden relative border-b-2 border-orange-600 shadow-lg">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      
      <div className="relative flex items-center">
        {/* Fixed icon on the left */}
        <div className="flex items-center gap-2 px-4 bg-red-600/80 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 animate-spin text-yellow-300" />
          <span className="font-bold text-sm whitespace-nowrap">عروض حصرية</span>
          <Tag className="w-4 h-4" />
        </div>

        {/* Scrolling content */}
        <div className="flex-1 overflow-hidden">
          <div 
            className="flex items-center gap-8 whitespace-nowrap animate-[scroll_30s_linear_infinite]"
          >
            {duplicatedProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-2 text-sm font-semibold">
                <Percent className="w-3 h-3 text-yellow-300" />
                <span className="text-yellow-100">
                  {product.name}
                </span>
                <span className="bg-yellow-400 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                  خصم {product.discount_percentage}%
                </span>
                <span className="text-white/60 mx-2">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed icon on the right */}
        <div className="flex items-center gap-2 px-4 bg-red-600/80 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 animate-spin text-yellow-300" style={{ animationDirection: 'reverse' }} />
        </div>
      </div>
    </div>
  );
};

export default ProductDiscountTicker;
