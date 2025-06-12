
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Percent, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  discount_percentage: number;
}

const ProductDiscountTicker = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Safe price calculation function
  const calculateDiscountedPrice = (price: number, discountPercentage: number) => {
    if (!price || isNaN(price) || !discountPercentage || isNaN(discountPercentage)) {
      return price || 0;
    }
    return Math.round(price * (1 - discountPercentage / 100));
  };

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        console.log('Fetching discounted products directly from Supabase...');
        
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, discount_percentage')
          .gt('discount_percentage', 0)
          .eq('is_active', true)
          .not('price', 'is', null)
          .limit(10);

        if (error) {
          console.error('Error fetching discounted products:', error);
          return;
        }

        console.log('Discounted products fetched:', data);
        
        // Filter out products with invalid prices and validate discounts
        const validProducts = (data || []).filter(product => {
          const price = Number(product.price);
          const discount = Number(product.discount_percentage);
          
          if (!price || isNaN(price) || !discount || isNaN(discount) || discount <= 0 || discount > 100) {
            return false;
          }
          
          // Test discount calculation
          const discountedPrice = calculateDiscountedPrice(price, discount);
          return !isNaN(discountedPrice) && discountedPrice > 0;
        }).map(product => ({
          ...product,
          price: Number(product.price)
        }));

        console.log('Valid products after filtering:', validProducts);
        
        // If we get NaN or invalid data and haven't retried too much, try again
        if (validProducts.length === 0 && retryCount < 2) {
          console.log('No valid products found, retrying...');
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
        } else {
          setProducts(validProducts);
          setRetryCount(0); // Reset retry count on success
        }
      } catch (error) {
        console.error('Error in fetchDiscountedProducts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscountedProducts();

    // Set up real-time listener for product changes
    const channel = supabase
      .channel('product-discount-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change detected:', payload);
          setRetryCount(0); // Reset retry count
          fetchDiscountedProducts(); // Refetch products on any change
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_discounts'
        },
        (payload) => {
          console.log('Active discount change detected:', payload);
          setRetryCount(0); // Reset retry count
          fetchDiscountedProducts(); // Refetch products on discount changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [retryCount]);

  if (isLoading || !products || products.length === 0) {
    return null;
  }

  // Duplicate products to create seamless loop
  const duplicatedProducts = [...products, ...products];

  const handleProductClick = (productId: string) => {
    navigate(`/app/product/${productId}`);
  };

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
            {duplicatedProducts.map((product, index) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount_percentage);
              
              return (
                <button
                  key={`${product.id}-${index}`}
                  onClick={() => handleProductClick(product.id)}
                  className="flex items-center gap-2 text-sm font-semibold hover:bg-white/10 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  <Percent className="w-3 h-3 text-yellow-300" />
                  <span className="text-yellow-100">
                    {product.name}
                  </span>
                  <span className="bg-yellow-400 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                    خصم {product.discount_percentage}%
                  </span>
                  <span className="text-white/60 mx-2">•</span>
                </button>
              );
            })}
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
