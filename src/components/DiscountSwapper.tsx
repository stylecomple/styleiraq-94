
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Tag, Package, Star, Heart, Crown, Zap, Gift } from 'lucide-react';

interface Discount {
  id: string;
  discount_type: 'all_products' | 'category' | 'subcategory';
  target_value: string | null;
  discount_percentage: number;
}

const DiscountSwapper = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch active discounts with proper error handling
  const { data: discounts = [], isLoading, refetch } = useQuery({
    queryKey: ['active-discounts-swapper'],
    queryFn: async () => {
      console.log('Fetching active discounts for swapper...');
      const { data, error } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('is_active', true)
        .order('discount_percentage', { ascending: false });
      
      if (error) {
        console.error('Error fetching discounts:', error);
        throw error;
      }
      
      console.log('Active discounts found:', data?.length || 0);
      return data as Discount[];
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  // Enhanced marketing content with modern styling
  const marketingContent = [
    {
      icon: <Crown className="w-8 h-8 text-yellow-400" />,
      title: "أحدث صيحات الموضة",
      subtitle: "اكتشف مجموعتنا الحصرية من أجمل القطع العصرية",
      gradient: "from-yellow-500 via-orange-500 to-red-500"
    },
    {
      icon: <Star className="w-8 h-8 text-blue-400" />,
      title: "جودة عالية - أسعار منافسة",
      subtitle: "منتجات مختارة بعناية لتناسب جميع الأذواق والميزانيات",
      gradient: "from-blue-500 via-purple-500 to-pink-500"
    },
    {
      icon: <Heart className="w-8 h-8 text-pink-400" />,
      title: "خدمة عملاء مميزة",
      subtitle: "فريق دعم متاح لمساعدتك في اختيار الأنسب لك",
      gradient: "from-pink-500 via-rose-500 to-red-500"
    },
    {
      icon: <Package className="w-8 h-8 text-green-400" />,
      title: "توصيل سريع وآمن",
      subtitle: "خدمة توصيل موثوقة لجميع أنحاء العراق",
      gradient: "from-green-500 via-emerald-500 to-teal-500"
    }
  ];

  // Set up real-time subscription for discount updates
  useEffect(() => {
    const channel = supabase
      .channel('discount-swapper-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_discounts'
        },
        (payload) => {
          console.log('Discount updated in swapper:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Auto-rotate content with smooth transitions
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
      return `خصم ${discount.discount_percentage}% على فئة ${discount.target_value}`;
    } else {
      return `خصم ${discount.discount_percentage}% على منتجات مختارة`;
    }
  };

  const getDiscountIcon = (discount: Discount) => {
    if (discount.discount_type === 'all_products') {
      return <Gift className="w-8 h-8" />;
    } else {
      return <Tag className="w-8 h-8" />;
    }
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl mx-4 my-4">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="animate-spin">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="text-white text-lg font-medium">جاري التحميل...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show discounts if available, otherwise show marketing content
  const hasDiscounts = discounts.length > 0;
  const contentToShow = hasDiscounts ? discounts : marketingContent;
  const currentContent = contentToShow[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl mx-4 my-4 shadow-2xl">
      {/* Dynamic gradient background based on content type */}
      <div className={`relative ${
        hasDiscounts 
          ? 'bg-gradient-to-r from-red-500 via-pink-500 to-purple-600' 
          : `bg-gradient-to-r ${(currentContent as any).gradient || 'from-blue-500 via-indigo-500 to-purple-600'}`
      } p-6 transition-all duration-1000 ease-in-out`}>
        
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 left-8 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-8 right-12 w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-6 left-16 w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-4 right-8 w-1 h-1 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-[80px]">
          <div className="flex items-center gap-6 max-w-4xl mx-auto">
            <div className="animate-spin" style={{ animationDuration: '3s' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <div className="text-center transition-all duration-700 ease-in-out transform">
              {hasDiscounts ? (
                // Discount content with enhanced styling
                <div className="flex items-center gap-4">
                  <div className="animate-pulse">
                    {getDiscountIcon(currentContent as Discount)}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-white mb-1 tracking-wide">
                      {getDiscountText(currentContent as Discount)}
                    </h3>
                    <p className="text-sm text-white/90 font-medium flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" />
                      عرض محدود - لا تفوت الفرصة!
                      <Zap className="w-4 h-4" />
                    </p>
                  </div>
                </div>
              ) : (
                // Marketing content with enhanced styling
                <div className="flex items-center gap-4">
                  <div className="animate-pulse">
                    {(currentContent as any).icon}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-white mb-1 tracking-wide">
                      {(currentContent as any).title}
                    </h3>
                    <p className="text-sm text-white/90 font-medium">
                      {(currentContent as any).subtitle}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Enhanced indicators with modern styling */}
        {contentToShow.length > 1 && (
          <div className="relative z-10 flex justify-center gap-3 mt-4">
            {contentToShow.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
                  index === currentIndex 
                    ? 'bg-white shadow-lg scale-110' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modern border glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 opacity-30 blur-xl -z-10"></div>
    </div>
  );
};

export default DiscountSwapper;
