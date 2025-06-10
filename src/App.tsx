
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Index from "@/pages/Index";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Orders from "@/pages/Orders";
import Auth from "@/pages/Auth";
import AdminPanel from "@/pages/AdminPanel";
import OwnerPanel from "@/pages/OwnerPanel";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const LovableBadgeRemover: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['admin-settings-badge'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('hide_lovable_banner, favicon_url')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  useEffect(() => {
    const removeLovableBadge = () => {
      const badge = document.getElementById('lovable-badge');
      if (badge && settings?.hide_lovable_banner) {
        badge.remove();
      }
    };

    // Initial check
    removeLovableBadge();

    // Set up a mutation observer to watch for the badge being added
    const observer = new MutationObserver(() => {
      if (settings?.hide_lovable_banner) {
        removeLovableBadge();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [settings?.hide_lovable_banner]);

  // Update favicon if stored in database
  useEffect(() => {
    if (settings?.favicon_url) {
      // Remove existing favicon
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Add new favicon
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
  const location = useLocation();
  const isAdminPanel = location.pathname === '/admin';
  const isOwnerPanel = location.pathname === '/owner';
  const hideFooter = isAdminPanel || isOwnerPanel;

  return (
    <div className="min-h-screen flex flex-col">
      <LovableBadgeRemover />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/owner" element={<OwnerPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
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
