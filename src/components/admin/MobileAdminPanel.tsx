
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, ArrowLeft, Sparkles, Camera, Type, Palette } from 'lucide-react';
import AddProductForm from './AddProductForm';

const MobileAdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, isOwner, isOrderManager, isProductsAdder } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleBackToApp = () => {
    navigate('/app/products');
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  // For mobile, always show the add product interface regardless of role
  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={handleCloseForm}
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
            <AddProductForm onClose={handleCloseForm} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToApp}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للتطبيق
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            لوحة الإدارة
          </h1>
          <div className="w-24"></div>
        </div>

        {/* Welcome Card */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600">
          <CardContent className="p-6 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">مرحباً بك!</h2>
            <p className="text-pink-100 text-sm">
              {isAdmin || isOwner ? 'إدارة شاملة للمتجر' : 
               isOrderManager ? 'إدارة الطلبات' : 
               'إضافة منتجات جديدة'}
            </p>
          </CardContent>
        </Card>

        {/* Main Action Card - Always show Add Product for mobile */}
        <Card className="overflow-hidden border-0 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white pb-8">
            <CardTitle className="flex items-center gap-3 text-center justify-center">
              <Plus className="w-7 h-7" />
              إضافة منتج جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6 text-pink-600" />
                  </div>
                  <p className="text-xs text-gray-600">أضف صور</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                    <Type className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600">اكتب وصف</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto">
                    <Palette className="w-6 h-6 text-indigo-600" />
                  </div>
                  <p className="text-xs text-gray-600">اختر فئة</p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm">
                أضف منتجات جديدة إلى المتجر بطريقة سهلة وسريعة
              </p>
              
              <Button 
                onClick={handleShowAddForm}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-4 rounded-xl text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="w-6 h-6 mr-2" />
                ابدأ الإضافة الآن
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Info */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              نصائح للنجاح
            </h3>
            <ul className="text-sm text-amber-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                استخدم صور عالية الجودة وواضحة
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                اكتب أوصاف مفصلة وجذابة
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                حدد أسعار تنافسية ومناسبة
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileAdminPanel;
