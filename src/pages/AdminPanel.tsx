
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, Users, BarChart3, Settings, MessageSquare, Percent } from 'lucide-react';
import ProductsManagement from '@/components/admin/ProductsManagement';
import AddProductForm from '@/components/admin/AddProductForm';
import UserManagement from '@/components/admin/UserManagement';
import StatisticsPanel from '@/components/admin/StatisticsPanel';
import AdminSettings from '@/components/admin/AdminSettings';
import FeedbackManagement from '@/components/admin/FeedbackManagement';
import SimpleDiscountManagement from '@/components/admin/SimpleDiscountManagement';
import EnhancedOrdersManagement from '@/components/admin/EnhancedOrdersManagement';
import ChangesLogPanel from '@/components/admin/ChangesLogPanel';

const AdminPanel = () => {
  const { user, isAdmin, loading } = useAuth();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
        {activeTab === 'products' && (
          <Button 
            onClick={() => setShowAddProduct(true)}
            className="bg-pink-600 hover:bg-pink-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج جديد
          </Button>
        )}
      </div>

      {showAddProduct && (
        <AddProductForm onClose={() => setShowAddProduct(false)} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            المنتجات
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            الطلبات
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            المستخدمين
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            الإحصائيات
          </TabsTrigger>
          <TabsTrigger value="discounts" className="flex items-center gap-2">
            <Percent className="w-4 h-4" />
            الخصومات
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            التقييمات
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
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

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedOrdersManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
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

        <TabsContent value="statistics" className="space-y-6">
          <StatisticsPanel />
          <ChangesLogPanel />
        </TabsContent>

        <TabsContent value="discounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                إدارة الخصومات العامة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleDiscountManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                إدارة التقييمات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
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
  );
};

export default AdminPanel;
