
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

interface ProductDiscountTickerProps {
  products?: Product[];
}

const ProductDiscountTicker = ({ products: propProducts }: ProductDiscountTickerProps) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(propProducts || []);
  const [isLoading, setIsLoading] = useState(!propProducts);

  // Safe price calculation function
  const calculateDiscountedPrice = (price: number, discountPercentage: number) => {
    if (!price || isNaN(price) || !discountPercentage || isNaN(discountPercentage)) {
      return price || 0;
    }
    return Math.round(price * (1 - discountPercentage / 100));
  };

  useEffect(() => {
    if (propProducts) {
      console.log('Using prop products:', propProducts);
      // Filter and validate products when passed as props
      const validProducts = propProducts.filter(product => {
        const price = Number(product.price);
        const discount = Number(product.discount_percentage);
        
        if (!price || isNaN(price) || !discount || isNaN(discount) || discount <= 0 || discount > 100) {
          console.log('Invalid product filtered out:', product);
          return false;
        }
        
        const discountedPrice = calculateDiscountedPrice(price, discount);
        return !isNaN(discountedPrice) && discountedPrice > 0;
      });
      
      console.log('Valid products after filtering:', validProducts);
      setProducts(validProducts);
      setIsLoading(false);
      return;
    }

    const fetchDiscountedProducts = async () => {
      try {
        console.log('Fetching discounted products directly from Supabase...');
        
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, discount_percentage')
          .gt('discount_percentage', 0)
          .eq('is_active', true)
          .not('price', 'is', null)
          .order('discount_percentage', { ascending: false });

        if (error) {
          console.error('Error fetching discounted products:', error);
          return;
        }

        console.log('Raw discounted products fetched:', data);
        
        // Filter out products with invalid prices and validate discounts
        const validProducts = (data || []).filter(product => {
          const price = Number(product.price);
          const discount = Number(product.discount_percentage);
          
          if (!price || isNaN(price) || !discount || isNaN(discount) || discount <= 0 || discount > 100) {
            console.log('Invalid product filtered out:', product);
            return false;
          }
          
          // Test discount calculation
          const discountedPrice = calculateDiscountedPrice(price, discount);
          const isValid = !isNaN(discountedPrice) && discountedPrice > 0;
          if (!isValid) {
            console.log('Product with invalid calculated price filtered out:', product);
          }
          return isValid;
        }).map(product => ({
          ...product,
          price: Number(product.price)
        }));

        console.log('Valid products after filtering and mapping:', validProducts);
        setProducts(validProducts);
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
          fetchDiscountedProducts(); // Refetch products on discount changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propProducts]);

  console.log('ProductDiscountTicker render state:', { isLoading, productsCount: products.length, products });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 overflow-hidden relative border-b-2 border-orange-600 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-sm">جاري تحميل العروض...</div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    console.log('No products to display in ticker');
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
