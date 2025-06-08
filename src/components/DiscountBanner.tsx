
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Percent, Sparkles, Tag, Package } from 'lucide-react';

interface Discount {
  id: string;
  discount_type: 'all_products' | 'category' | 'subcategory';
  target_value: string | null;
  discount_percentage: number;
}

interface DiscountBannerProps {
  discounts: Discount[];
}

const DiscountBanner = ({ discounts }: DiscountBannerProps) => {
  if (!discounts || discounts.length === 0) return null;

  const getDiscountText = (discount: Discount) => {
    if (discount.discount_type === 'all_products') {
      return `خصم ${discount.discount_percentage}% على جميع المنتجات`;
    } else if (discount.discount_type === 'category') {
      return `خصم ${discount.discount_percentage}% على فئة مختارة`;
    } else {
      return `خصم ${discount.discount_percentage}% على فئة فرعية مختارة`;
    }
  };

  const getDiscountIcon = (discount: Discount) => {
    if (discount.discount_type === 'all_products') {
      return <Package className="w-5 h-5" />;
    } else if (discount.discount_type === 'category') {
      return <Tag className="w-5 h-5" />;
    } else {
      return <Percent className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white py-3 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-8 animate-bounce">
          <Sparkles className="w-6 h-6 animate-spin" />
          
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {discounts.map((discount, index) => (
              <div key={discount.id} className="flex items-center gap-2">
                {getDiscountIcon(discount)}
                <span className="font-bold text-lg">
                  {getDiscountText(discount)}
                </span>
                {index < discounts.length - 1 && (
                  <span className="text-white/70 mx-2">•</span>
                )}
              </div>
            ))}
          </div>
          
          <Sparkles className="w-6 h-6 animate-spin" style={{ animationDirection: 'reverse' }} />
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;
