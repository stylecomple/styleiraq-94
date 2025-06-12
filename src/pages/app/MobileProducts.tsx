
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import ProductCard from '@/components/ProductCard';
import OnboardingTour from '@/components/OnboardingTour';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { Product } from '@/types';

const MobileProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    } else if (!user) {
      // Show guest prompt for non-logged in users who have seen onboarding
      setShowGuestPrompt(true);
    }
  }, [user]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['mobile-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform raw database data to match Product interface
      return (data || []).map(rawProduct => {
        const options = (rawProduct as any).options || 
          ((rawProduct as any).colors ? (rawProduct as any).colors.map((color: string) => ({ name: color, price: undefined })) : []);
        
        const subcategories = (rawProduct as any).subcategories || [];

        return {
          ...rawProduct,
          options,
          subcategories
        } as Product;
      });
    }
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
    if (!user) {
      setShowGuestPrompt(true);
    }
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
    if (!user) {
      setShowGuestPrompt(true);
    }
  };

  const handleLoginClick = () => {
    setShowGuestPrompt(false);
    navigate('/app/auth');
  };

  const handleContinueAsGuest = () => {
    setShowGuestPrompt(false);
  };

  return (
    <>
      <MobileAppLayout title="جميع المنتجات" showBackButton={false}>
        <div className="space-y-6 animate-fade-in">
          {/* App Logo Section */}
          <div className="flex justify-center py-4 animate-slide-down">
            <div className="relative group">
              <div className="absolute -inset-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative bg-white rounded-full p-4 shadow-lg transform transition-all duration-300 hover:scale-105">
                <img 
                  src="/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png" 
                  alt="Style متجر الجمال والأناقة" 
                  className="w-24 h-24 object-contain rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Guest login prompt */}
          {!user && showGuestPrompt && (
            <div className="mx-4 mb-4">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">مرحباً بك!</h3>
                      <p className="text-sm text-gray-600">سجل دخولك للحصول على تجربة أفضل</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    onClick={handleLoginClick}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    size="sm"
                  >
                    تسجيل الدخول
                  </Button>
                  <Button 
                    onClick={handleContinueAsGuest}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    متابعة كضيف
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-200 animate-pulse rounded-lg h-80"
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {products.map((product, index) => (
                  <div 
                    key={product.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-500">لا توجد منتجات متاحة حالياً.</p>
              </div>
            )}
          </div>
        </div>
      </MobileAppLayout>

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </>
  );
};

export default MobileProducts;
