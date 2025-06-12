
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowLeft, Sparkles, Layers, Grid3X3 } from 'lucide-react';
import AddProductForm from './AddProductForm';
import CategoryManager from './CategoryManager';

const MobileAdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, isOwner, isOrderManager, isProductsAdder } = useAuth();
  const [activeView, setActiveView] = useState<'menu' | 'add-product' | 'categories'>('menu');

  const handleBackToApp = () => {
    navigate('/app/products');
  };

  const handleCloseView = () => {
    setActiveView('menu');
  };

  const isFullAdmin = isAdmin || isOwner;

  // Add Product View
  if (activeView === 'add-product') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={handleCloseView}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
            >
              <ArrowLeft className="w-4 h-4" />
              رجوع
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              إضافة منتج جديد
            </h1>
            <div className="w-16"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
            <AddProductForm onClose={handleCloseView} />
          </div>
        </div>
      </div>
    );
  }

  // Categories Management View
  if (activeView === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={handleCloseView}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4" />
              رجوع
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              إدارة الفئات
            </h1>
            <div className="w-16"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            <CategoryManager />
          </div>
        </div>
      </div>
    );
  }

  // Main Menu View
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-pink-100 p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Button 
            variant="outline" 
            onClick={handleBackToApp}
            className="flex items-center gap-2 border-pink-200 hover:bg-pink-50"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            لوحة الإدارة المبسطة
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        {/* Welcome Card */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600">
          <CardContent className="p-6 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">مرحباً بك!</h2>
            <p className="text-pink-100 text-sm">
              {isFullAdmin ? 'إدارة سريعة ومبسطة' : 
               isOrderManager ? 'إدارة الطلبات' : 
               'إضافة منتجات جديدة'}
            </p>
          </CardContent>
        </Card>

        {/* Essential Actions */}
        <div className="space-y-4">
          {/* Add Product - Always visible */}
          <Card 
            className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setActiveView('add-product')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">إضافة منتج جديد</h3>
                  <p className="text-sm text-gray-600">أضف منتجات جديدة للمتجر بسهولة</p>
                </div>
                <div className="text-pink-500">
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories Management */}
          <Card 
            className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setActiveView('categories')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Grid3X3 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">إدارة الفئات</h3>
                  <p className="text-sm text-gray-600">أضف وعدل فئات المنتجات والفئات الفرعية</p>
                </div>
                <div className="text-blue-500">
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access to Orders (only for admins) */}
          {(isFullAdmin || isOrderManager) && (
            <Card 
              className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={() => navigate('/admin?tab=orders')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <Layers className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">الطلبات</h3>
                    <p className="text-sm text-gray-600">عرض وإدارة طلبات العملاء</p>
                  </div>
                  <div className="text-green-500">
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Tips */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              نصائح سريعة
            </h3>
            <ul className="text-sm text-amber-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                استخدم صور واضحة وعالية الجودة
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                اكتب أوصاف جذابة ومفيدة
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                نظم المنتجات في فئات مناسبة
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer note for full access */}
        {isFullAdmin && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-2">للوصول الكامل لجميع الميزات</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin')}
              className="text-xs"
            >
              افتح اللوحة الكاملة
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAdminPanel;
