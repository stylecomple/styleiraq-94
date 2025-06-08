
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeedbackForm from '@/components/FeedbackForm';
import Index from '@/pages/Index';
import Products from '@/pages/Products';
import Auth from '@/pages/Auth';
import Cart from '@/pages/Cart';
import Orders from '@/pages/Orders';
import NotFound from '@/pages/NotFound';
import AdminPanel from '@/pages/AdminPanel';
import OwnerPanelPage from '@/pages/OwnerPanel';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
              <Header />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:category" element={<Products />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/owner-panel" element={<OwnerPanelPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
              <FeedbackForm />
              <Toaster />
            </div>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
