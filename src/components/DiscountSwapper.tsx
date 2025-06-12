
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Tag, Package, Star, Heart, Crown } from 'lucide-react';

interface Discount {
  id: string;
  discount_type: 'all_products' | 'category' | 'subcategory';
  target_value: string | null;
  discount_percentage: number;
}

const DiscountSwapper = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch active discounts
  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ['active-discounts-swapper'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('is_active', true)
        .order('discount_percentage', { ascending: false });
      
      if (error) throw error;
      return data as Discount[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Marketing content when no discounts are active
  const marketingContent = [
    {
      icon: <Crown className="w-6 h-6 text-yellow-400" />,
      title: "أحدث صيحات الموضة",
      subtitle: "اكتشف مجموعتنا الحصرية من أجمل القطع العصرية"
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      title: "جودة عالية - أسعار منافسة",
      subtitle: "منتجات مختارة بعناية لتناسب جميع الأذواق والميزانيات"
    },
    {
      icon: <Heart className="w-6 h-6 text-pink-400" />,
      title: "خدمة عملاء مميزة",
      subtitle: "فريق دعم متاح لمساعدتك في اختيار الأنسب لك"
    },
    {
      icon: <Package className="w-6 h-6 text-blue-400" />,
      title: "توصيل سريع وآمن",
      subtitle: "خدمة توصيل موثوقة لجميع أنحاء العراق"
    }
  ];

  // Auto-rotate content
  useEffect(() => {
    const contentToShow = discounts.length > 0 ? discounts : marketingContent;
    if (contentToShow.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % contentToShow.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [discounts.length, marketingContent.length]);

  const getDiscountText = (discount: Discount) => {
    if (discount.discount_type === 'all_products') {
      return `خصم ${discount.discount_percentage}% على جميع المنتجات`;
    } else if (discount.discount_type === 'category') {
      return `خصم ${discount.discount_percentage}% على فئة مختارة`;
    } else {
      return `خصم ${discount.discount_percentage}% على منتجات مختارة`;
    }
  };

  const getDiscountIcon = (discount: Discount) => {
    if (discount.discount_type === 'all_products') {
      return <Package className="w-6 h-6" />;
    } else {
      return <Tag className="w-6 h-6" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 overflow-hidden relative">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-lg">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  // Show discounts if available, otherwise show marketing content
  const hasDiscounts = discounts.length > 0;
  const contentToShow = hasDiscounts ? discounts : marketingContent;
  const currentContent = contentToShow[currentIndex];

  return (
    <div className={`${
      hasDiscounts 
        ? 'bg-gradient-to-r from-red-500 via-pink-500 to-purple-600' 
        : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600'
    } text-white py-4 overflow-hidden relative shadow-lg`}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-center min-h-[60px]">
          <div className="flex items-center gap-4">
            <Sparkles className="w-6 h-6 animate-spin" />
            
            <div className="text-center transition-all duration-700 ease-in-out">
              {hasDiscounts ? (
                // Discount content
                <div className="flex items-center gap-3">
                  {getDiscountIcon(currentContent as Discount)}
                  <div>
                    <h3 className="text-lg font-bold">
                      {getDiscountText(currentContent as Discount)}
                    </h3>
                    <p className="text-sm opacity-90">
                      عرض محدود - لا تفوت الفرصة!
                    </p>
                  </div>
                </div>
              ) : (
                // Marketing content
                <div className="flex items-center gap-3">
                  {(currentContent as any).icon}
                  <div>
                    <h3 className="text-lg font-bold">
                      {(currentContent as any).title}
                    </h3>
                    <p className="text-sm opacity-90">
                      {(currentContent as any).subtitle}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <Sparkles 
              className="w-6 h-6 animate-spin" 
              style={{ animationDirection: 'reverse' }} 
            />
          </div>
        </div>

        {/* Indicators */}
        {contentToShow.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {contentToShow.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountSwapper;
