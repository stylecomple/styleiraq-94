
import React from 'react';
import { ShoppingCart, User, Shield, LogOut } from 'lucide-react';
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

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <h1 className="text-2xl font-bold text-pink-600">مجمع ستايل العامرية</h1>
            <span className="text-sm text-gray-600">متجر متكامل لاحتياجاتك</span>
          </div>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {user && isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdminClick}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                لوحة التحكم
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleAuthClick}
              className="flex items-center gap-2"
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
              className="relative flex items-center gap-2"
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
        
        <nav className="mt-4">
          <ul className="flex space-x-6 rtl:space-x-reverse text-gray-700">
            <li><a href="#makeup" className="hover:text-pink-600 transition-colors">مكياج</a></li>
            <li><a href="#perfumes" className="hover:text-pink-600 transition-colors">عطور</a></li>
            <li><a href="#flowers" className="hover:text-pink-600 transition-colors">ورد</a></li>
            <li><a href="#home" className="hover:text-pink-600 transition-colors">مستلزمات منزلية</a></li>
            <li><a href="#personal-care" className="hover:text-pink-600 transition-colors">عناية شخصية</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
