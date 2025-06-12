
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Grid3X3, ShoppingCart, User, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCache } from '@/contexts/CacheContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { cachedData } = useCache();
  const [isCheckingDiscounts, setIsCheckingDiscounts] = useState(false);

  const cartItemCount = getTotalItems();

  // Quick discount check query
  const { refetch: checkDiscounts } = useQuery({
    queryKey: ['quick-discount-check'],
    queryFn: async () => {
      console.log('Quick discount check...');
      
      // Check cached data first
      if (cachedData?.discounts) {
        return {
          hasActiveDiscounts: cachedData.discounts.activeDiscounts?.length > 0,
          hasDiscountedProducts: cachedData.discounts.discountedProducts?.length > 0
        };
      }

      // Fallback to database check
      const [activeDiscountsResult, discountedProductsResult] = await Promise.all([
        supabase
          .from('active_discounts')
          .select('id')
          .eq('is_active', true)
          .limit(1),
        supabase
          .from('products')
          .select('id')
          .gt('discount_percentage', 0)
          .eq('is_active', true)
          .limit(1)
      ]);

      return {
        hasActiveDiscounts: (activeDiscountsResult.data?.length || 0) > 0,
        hasDiscountedProducts: (discountedProductsResult.data?.length || 0) > 0
      };
    },
    enabled: false // Only run when manually triggered
  });

  const handleProductsClick = async () => {
    if (location.pathname === '/app/products') {
      return; // Already on products page
    }

    setIsCheckingDiscounts(true);
    
    try {
      // Quick discount check
      await checkDiscounts();
      
      // Small delay for smooth UX
      setTimeout(() => {
        navigate('/app/products');
        setIsCheckingDiscounts(false);
      }, 300);
    } catch (error) {
      console.error('Error checking discounts:', error);
      // Navigate anyway if there's an error
      navigate('/app/products');
      setIsCheckingDiscounts(false);
    }
  };

  const navItems = [
    {
      id: 'products',
      icon: ShoppingBag,
      label: 'المنتجات',
      path: '/app/products',
      color: 'from-pink-500 to-rose-500',
      onClick: handleProductsClick
    },
    {
      id: 'categories',
      icon: Grid3X3,
      label: 'الفئات',
      path: '/app/categories',
      color: 'from-purple-500 to-violet-500'
    },
    {
      id: 'search',
      icon: Search,
      label: 'البحث',
      path: '/app/search',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'cart',
      icon: ShoppingCart,
      label: 'السلة',
      path: '/app/cart',
      badge: cartItemCount > 0 ? cartItemCount : null,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'account',
      icon: User,
      label: 'حسابي',
      path: '/app/account',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-lg border-t border-gray-200/50"></div>
      
      {/* Main navigation container */}
      <div className="relative px-6 py-3">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isProductsIcon = item.id === 'products';
            const showSkeleton = isProductsIcon && isCheckingDiscounts;
            
            return (
              <button
                key={item.id}
                onClick={item.onClick || (() => navigate(item.path))}
                disabled={showSkeleton}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 transform group ${
                  active 
                    ? 'scale-110' 
                    : 'hover:scale-105 active:scale-95'
                } ${showSkeleton ? 'cursor-wait' : ''}`}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Active background indicator */}
                {active && !showSkeleton && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl opacity-15 animate-pulse`}></div>
                )}

                {/* Skeleton loading state for products icon */}
                {showSkeleton && (
                  <div className="absolute inset-0 bg-gray-200 rounded-2xl animate-pulse opacity-50"></div>
                )}

                {/* Icon container with gradient effect when active */}
                <div className="relative mb-1">
                  {showSkeleton ? (
                    <div className="w-8 h-8 rounded-xl bg-gray-300 animate-pulse flex items-center justify-center">
                      <div className="w-5 h-5 bg-gray-400 rounded animate-pulse"></div>
                    </div>
                  ) : active ? (
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg animate-bounce-gentle`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                    </div>
                  )}
                  
                  {/* Badge for cart */}
                  {item.badge && !showSkeleton && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center min-w-[24px] shadow-lg animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                </div>

                {/* Label with animated color */}
                <span className={`text-xs font-medium transition-all duration-200 ${
                  showSkeleton 
                    ? 'bg-gray-300 text-transparent rounded animate-pulse h-3 w-12'
                    : active 
                      ? 'text-transparent bg-gradient-to-r bg-clip-text font-semibold scale-105' + ' ' + item.color.replace('from-', 'from-').replace('to-', 'to-')
                      : 'text-gray-600 group-hover:text-gray-800'
                }`}>
                  {showSkeleton ? '' : item.label}
                </span>

                {/* Active dot indicator */}
                {active && !showSkeleton && (
                  <div className={`absolute -bottom-1 w-2 h-2 bg-gradient-to-r ${item.color} rounded-full animate-ping`}></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Floating active indicator line */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-20"></div>
      </div>
    </div>
  );
};

export default BottomNavigation;
