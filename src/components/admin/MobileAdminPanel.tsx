
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, FolderPlus, Menu, X, ArrowLeft } from 'lucide-react';
import AddProductForm from './AddProductForm';
import CategoryManager from './CategoryManager';

const MobileAdminPanel = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'main' | 'add-product' | 'categories'>('main');

  const handleBackToMain = () => {
    setActiveView('main');
  };

  const handleBackToApp = () => {
    navigate('/app/products');
  };

  if (activeView === 'add-product') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={handleBackToMain}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              إغلاق
            </Button>
            <h1 className="text-lg font-bold">إضافة منتج جديد</h1>
          </div>
          <AddProductForm onClose={handleBackToMain} />
        </div>
      </div>
    );
  }

  if (activeView === 'categories') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={handleBackToMain}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              إغلاق
            </Button>
            <h1 className="text-lg font-bold">إدارة الفئات</h1>
          </div>
          <CategoryManager />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="outline" 
            onClick={handleBackToApp}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للتطبيق
          </Button>
          <h1 className="text-xl font-bold text-gray-800">لوحة الإدارة</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Admin Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">إدارة المنتجات والفئات بسهولة</p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <Plus className="w-6 h-6" />
                إضافة منتج جديد
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">أضف منتجات جديدة إلى المتجر بسهولة</p>
              <Button 
                onClick={() => setActiveView('add-product')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                إضافة منتج
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <FolderPlus className="w-6 h-6" />
                إدارة الفئات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">إنشاء وتعديل فئات المنتجات والفئات الفرعية</p>
              <Button 
                onClick={() => setActiveView('categories')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 rounded-xl"
              >
                <FolderPlus className="w-5 h-5 mr-2" />
                إدارة الفئات
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">المنتجات</div>
              <div className="text-sm text-gray-500">إجمالي المنتجات</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FolderPlus className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">الفئات</div>
              <div className="text-sm text-gray-500">إجمالي الفئات</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-2">💡 نصائح سريعة</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• أضف صور عالية الجودة للمنتجات</li>
              <li>• استخدم أوصاف واضحة ومفصلة</li>
              <li>• نظم المنتجات في فئات مناسبة</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileAdminPanel;
