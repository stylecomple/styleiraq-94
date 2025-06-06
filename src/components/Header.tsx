
import React from 'react';
import { ShoppingCart, User, Shield, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

const Header = ({ cartItemsCount, onCartClick }: HeaderProps) => {
  const { user, isAdmin, signOut } = useAuth();
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

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-pink-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Style
            </h1>
            <span className="text-sm text-gray-500 hidden md:block">متجر الجمال والأناقة</span>
          </div>
          
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOrdersClick}
                className="flex items-center gap-2 border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <Package className="w-4 h-4" />
                طلباتي
              </Button>
            )}
            
            {user && isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdminClick}
                className="flex items-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <Shield className="w-4 h-4" />
                لوحة التحكم
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleAuthClick}
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
            >
              {user ? (
                <>
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  تسجيل الدخول
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onCartClick}
              className="relative flex items-center gap-2 border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>السلة</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
