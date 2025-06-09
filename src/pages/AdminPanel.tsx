
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductsManagement from '@/components/admin/ProductsManagement';
import EnhancedOrdersManagement from '@/components/admin/EnhancedOrdersManagement';
import CategoryManager from '@/components/admin/CategoryManager';
import SimpleDiscountManagement from '@/components/admin/SimpleDiscountManagement';
import UserManagement from '@/components/admin/UserManagement';
import FeedbackManagement from '@/components/admin/FeedbackManagement';
import AdminSettings from '@/components/admin/AdminSettings';
import StatisticsPanel from '@/components/admin/StatisticsPanel';
import ChangesLogPanel from '@/components/admin/ChangesLogPanel';
import { Package, ShoppingCart, Users, MessageSquare, Settings, BarChart3, FileText, Percent, FolderTree } from 'lucide-react';

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');

  const { data: hasAdminRole, isLoading: roleLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user || !hasAdminRole) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">لوحة الإدارة</h1>
          <p className="text-sm sm:text-base text-gray-600">إدارة المتجر والمنتجات والطلبات</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-max min-w-full grid-cols-4 lg:grid-cols-9 gap-1 p-1">
              <TabsTrigger value="stats" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">الإحصائيات</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">المنتجات</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">الطلبات</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <FolderTree className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">الفئات</span>
              </TabsTrigger>
              <TabsTrigger value="discounts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Percent className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">الخصومات</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">المستخدمين</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">التعليقات</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">السجلات</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">الإعدادات</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="stats">
            <StatisticsPanel />
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  إدارة المنتجات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  إدارة الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedOrdersManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <FolderTree className="w-4 h-4 sm:w-5 sm:h-5" />
                  إدارة الفئات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discounts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
                  إدارة الخصومات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleDiscountManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  إدارة المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  إدارة التعليقات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <ChangesLogPanel />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  إعدادات النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
