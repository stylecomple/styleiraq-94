
import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Mobile App Pages
import MobileProducts from "@/pages/app/MobileProducts";
import MobileCategories from "@/pages/app/MobileCategories";
import MobileCategoryDetail from "@/pages/app/MobileCategoryDetail";
import MobileProductDetail from "@/pages/app/MobileProductDetail";
import MobileCart from "@/pages/app/MobileCart";
import MobileAccount from "@/pages/app/MobileAccount";
import MobileSplash from "@/pages/app/MobileSplash";
import MobileAuth from "@/pages/app/MobileAuth";
import MobileOrders from "@/pages/app/MobileOrders";
import MobileSearch from "@/pages/app/MobileSearch";
import MobilePayment from "@/pages/app/MobilePayment";

const queryClient = new QueryClient();

const LovableBadgeRemover: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['admin-settings-badge'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('hide_lovable_banner, favicon_url')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching admin settings:', error);
        return null;
      }
      return data;
    }
  });

  useEffect(() => {
    const removeLovableBadge = () => {
      const badge = document.getElementById('lovable-badge');
      if (badge) {
        badge.remove();
      }
    };

    removeLovableBadge();

    const observer = new MutationObserver(() => {
      removeLovableBadge();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (settings?.favicon_url) {
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.remove();
      }

      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = settings.favicon_url;
      document.head.appendChild(link);
    }
  }, [settings?.favicon_url]);

  return null;
};

const AppContent: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <MobileSplash />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LovableBadgeRemover />
      <Routes>
        <Route path="/" element={<Navigate to="/app/products" replace />} />
        <Route path="/app/products" element={<MobileProducts />} />
        <Route path="/app/categories" element={<MobileCategories />} />
        <Route path="/app/category/:categoryId" element={<MobileCategoryDetail />} />
        <Route path="/app/product/:id" element={<MobileProductDetail />} />
        <Route path="/app/search" element={<MobileSearch />} />
        <Route path="/app/cart" element={<MobileCart />} />
        <Route path="/app/payment" element={<MobilePayment />} />
        <Route path="/app/orders" element={<MobileOrders />} />
        <Route path="/app/account" element={<MobileAccount />} />
        <Route path="/app/auth" element={<MobileAuth />} />
        <Route path="*" element={<Navigate to="/app/products" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
