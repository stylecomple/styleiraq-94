
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductsManagement from '@/components/admin/ProductsManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة الإدارة</h1>
          <p className="text-gray-600">إدارة المتجر والمنتجات والطلبات</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 gap-1">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">الإحصائيات</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">المنتجات</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">الطلبات</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderTree className="w-4 h-4" />
              <span className="hidden sm:inline">الفئات</span>
            </TabsTrigger>
            <TabsTrigger value="discounts" className="flex items-center gap-2">
              <Percent className="w-4 h-4" />
              <span className="hidden sm:inline">الخصومات</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">المستخدمين</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">التعليقات</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">السجلات</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <StatisticsPanel />
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
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
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  إدارة الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OrdersManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5" />
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
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5" />
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
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
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
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
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
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
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
