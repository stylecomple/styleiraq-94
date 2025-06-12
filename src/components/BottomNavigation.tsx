
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Grid3X3, ShoppingCart, User, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();

  const cartItemCount = getTotalItems();

  const navItems = [
    {
      id: 'products',
      icon: ShoppingBag,
      label: 'المنتجات',
      path: '/app/products'
    },
    {
      id: 'categories',
      icon: Grid3X3,
      label: 'الفئات',
      path: '/app/categories'
    },
    {
      id: 'search',
      icon: Search,
      label: 'البحث',
      path: '/app/search'
    },
    {
      id: 'cart',
      icon: ShoppingCart,
      label: 'السلة',
      path: '/app/cart',
      badge: cartItemCount > 0 ? cartItemCount : null
    },
    {
      id: 'account',
      icon: User,
      label: 'حسابي',
      path: '/app/account'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-[60] shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center py-1 px-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                active 
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-1 ${active ? 'text-pink-600' : 'text-gray-600'}`} />
                {item.badge && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium truncate ${active ? 'text-pink-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
