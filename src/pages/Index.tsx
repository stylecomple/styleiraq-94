
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

const Index = () => {
  const { user } = useAuth();
  const [cartItemsCount] = useState(0);

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartItemsCount={cartItemsCount} onCartClick={handleCartClick} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-600 mb-4">
            مرحباً بكم في مجمع ستايل العامرية
          </h1>
          <p className="text-xl text-gray-600">
            متجركم المتكامل لجميع احتياجاتكم من المكياج والعطور والورد
          </p>
          {user && (
            <p className="text-lg text-green-600 mt-4">
              مرحباً {user.user_metadata?.full_name || user.email}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold text-pink-600 mb-2">مكياج</h3>
            <p className="text-gray-600">أحدث منتجات المكياج من أفضل الماركات العالمية</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold text-pink-600 mb-2">عطور</h3>
            <p className="text-gray-600">تشكيلة واسعة من العطور الفاخرة للرجال والنساء</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold text-pink-600 mb-2">ورد</h3>
            <p className="text-gray-600">باقات ورد طبيعية وصناعية لجميع المناسبات</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
