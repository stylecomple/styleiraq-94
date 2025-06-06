
import React from 'react';
import { ShoppingCart, User, Shield, LogOut, Package, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleOrdersClick = () => {
    navigate('/orders');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-pink-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-4 rtl:space-x-reverse cursor-pointer group"
            onClick={handleHomeClick}
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              Style
            </h1>
            <span className="text-sm text-gray-500 hidden md:block font-medium">
              متجر الجمال والأناقة
            </span>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCartClick}
              className="group flex items-center gap-2 border-pink-200 text-pink-600 hover:bg-pink-50 relative rounded-full px-4 py-2 transition-all duration-300 hover:shadow-lg"
            >
              <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">السلة</span>
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>

            {/* Orders Button (for logged in users) */}
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOrdersClick}
                className="hidden sm:flex items-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full px-4 py-2 transition-all duration-300"
              >
                <Package className="w-4 h-4" />
                طلباتي
              </Button>
            )}
            
            {/* Admin Button (for admin users) */}
            {user && isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdminClick}
                className="hidden md:flex items-center gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-full px-4 py-2 transition-all duration-300"
              >
                <Shield className="w-4 h-4" />
                لوحة التحكم
              </Button>
            )}
            
            {/* Auth Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAuthClick}
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 rounded-full px-4 py-2 transition-all duration-300"
            >
              {user ? (
                <>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">تسجيل الخروج</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                </>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden border-gray-200 rounded-full p-2"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* User Welcome Message (Mobile) */}
        {user && (
          <div className="sm:hidden mt-3 text-center">
            <span className="text-sm text-gray-600">
              مرحباً <span className="font-semibold text-purple-600">{user.user_metadata?.full_name || user.email}</span>
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
