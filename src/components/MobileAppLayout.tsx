
import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BottomNavigation from './BottomNavigation';

interface MobileAppLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  backPath?: string;
}

const MobileAppLayout = ({ children, title, showBackButton = true, backPath }: MobileAppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      // Smart back navigation within the app
      const currentPath = location.pathname;
      
      if (currentPath.startsWith('/app/category/')) {
        navigate('/app/categories');
      } else if (currentPath.startsWith('/app/product/')) {
        navigate('/app/products');
      } else if (currentPath === '/app/auth') {
        navigate('/app/products');
      } else if (currentPath === '/app/orders') {
        navigate('/app/account');
      } else {
        // Default fallback to products page
        navigate('/app/products');
      }
    }
  };

  // Hide back button on main navigation pages
  const hideBackButton = [
    '/app/products', 
    '/app/categories', 
    '/app/cart', 
    '/app/account',
    '/app/search'
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Header with slide down animation */}
      <div className={`bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-40 transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        {showBackButton && !hideBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2 transition-all duration-200 hover:bg-pink-50 hover:text-pink-600"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-gray-800 flex-1">{title}</h1>
      </div>

      {/* Content with fade in and slide up animation - increased bottom padding */}
      <div className={`flex-1 pb-32 overflow-y-auto transition-all duration-700 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        {children}
      </div>

      {/* Bottom Navigation - always visible */}
      <BottomNavigation />
    </div>
  );
};

export default MobileAppLayout;
