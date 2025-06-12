
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, ArrowLeft, Sparkles, Camera, Type, Palette, BarChart3, Users, Settings, MessageSquare, Percent } from 'lucide-react';
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

  const isFullAdmin = isAdmin || isOwner;

  // For mobile, show the add product form when requested
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
            لوحة الإدارة
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
              {isFullAdmin ? 'إدارة شاملة للمتجر' : 
               isOrderManager ? 'إدارة الطلبات' : 
               'إضافة منتجات جديدة'}
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Add Product - Always visible */}
          <Card 
            className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 hover:scale-105"
            onClick={handleShowAddForm}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-1">إضافة منتج</h3>
              <p className="text-xs text-gray-600">منتج جديد</p>
            </CardContent>
          </Card>

          {/* Orders Management */}
          <Card 
            className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/admin?tab=orders')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-1">الطلبات</h3>
              <p className="text-xs text-gray-600">إدارة الطلبات</p>
            </CardContent>
          </Card>

          {/* Full Admin Options */}
          {isFullAdmin && (
            <>
              <Card 
                className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/admin?tab=products')}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">المنتجات</h3>
                  <p className="text-xs text-gray-600">إدارة المنتجات</p>
                </CardContent>
              </Card>

              <Card 
                className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/admin?tab=users')}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">المستخدمين</h3>
                  <p className="text-xs text-gray-600">إدارة المستخدمين</p>
                </CardContent>
              </Card>

              <Card 
                className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/admin?tab=discounts')}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Percent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">الخصومات</h3>
                  <p className="text-xs text-gray-600">إدارة الخصومات</p>
                </CardContent>
              </Card>

              <Card 
                className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/admin?tab=settings')}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">الإعدادات</h3>
                  <p className="text-xs text-gray-600">إعدادات النظام</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

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
