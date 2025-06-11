
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Grid3X3, ShoppingCart, User } from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
      id: 'cart',
      icon: ShoppingCart,
      label: 'السلة',
      path: '/app/cart'
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                active 
                  ? 'text-pink-600 bg-pink-50' 
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${active ? 'text-pink-600' : 'text-gray-600'}`} />
              <span className={`text-xs font-medium ${active ? 'text-pink-600' : 'text-gray-600'}`}>
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
