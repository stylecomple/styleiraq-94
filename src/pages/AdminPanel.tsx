import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Percent,
  Crown,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import UserManagement from '@/components/admin/UserManagement';
import StatisticsPanel from '@/components/admin/StatisticsPanel';
import EnhancedDiscountManagement from '@/components/admin/EnhancedDiscountManagement';
import FeedbackManagement from '@/components/admin/FeedbackManagement';
import AdminSettings from '@/components/admin/AdminSettings';
import ProductsManagement from '@/components/admin/ProductsManagement';
import EnhancedOrdersManagement from '@/components/admin/EnhancedOrdersManagement';

const AdminPanel = () => {
  const { user, isAdmin, isOwner, isOrderManager, isProductsAdder, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'products');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab) {
      navigate(`/admin?tab=${activeTab}`);
    }
  }, [activeTab, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!isAdmin && !isOwner && !isOrderManager && !isProductsAdder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح لك بالوصول</h1>
          <p className="text-gray-600 mb-6">ليس لديك صلاحيات للوصول إلى لوحة الإدارة</p>
          <Button onClick={() => navigate('/app/products')}>العودة للصفحة الرئيسية</Button>
        </div>
      </div>
    );
  }

  const isFullAdmin = isAdmin || isOwner;

  const availableTabs = [
    ...(isFullAdmin ? ['products', 'orders', 'users', 'statistics', 'discounts', 'feedback', 'settings'] : []),
    ...(isOrderManager && !isFullAdmin ? ['orders'] : []),
    ...(isProductsAdder && !isFullAdmin ? ['products'] : []),
  ];

  if (!availableTabs.includes(activeTab)) {
    setActiveTab(availableTabs[0] || 'products');
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <AdminSidebar />
        
        <SidebarInset className="flex-1">
          {/* Mobile Header */}
          <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
            <SidebarTrigger />
            <h1 className="font-semibold">لوحة الإدارة</h1>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
                  <p className="text-muted-foreground">
                    {isProductsAdder && !isFullAdmin ? 'إضافة وإدارة المنتجات' :
                     isOrderManager && !isFullAdmin ? 'إدارة الطلبات' : 'إدارة شاملة للمتجر'}
                  </p>
                </div>
              </div>
              {isOwner && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/owner')} 
                  className="flex items-center gap-2"
                >
                  <Crown className="w-4 h-4 text-yellow-600" />
                  لوحة المالك
                </Button>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full h-auto" style={{
                gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)`
              }}>
                {isFullAdmin && (
                  <TabsTrigger value="products" className="flex items-center gap-2 text-xs lg:text-sm">
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:inline">المنتجات</span>
                  </TabsTrigger>
                )}
                
                {isProductsAdder && !isFullAdmin && (
                  <TabsTrigger value="products" className="flex items-center gap-2 text-xs lg:text-sm">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">إضافة منتجات</span>
                  </TabsTrigger>
                )}

                <TabsTrigger value="orders" className="flex items-center gap-2 text-xs lg:text-sm">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">الطلبات</span>
                </TabsTrigger>

                {isFullAdmin && (
                  <>
                    <TabsTrigger value="users" className="flex items-center gap-2 text-xs lg:text-sm">
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">المستخدمين</span>
                    </TabsTrigger>
                    <TabsTrigger value="statistics" className="flex items-center gap-2 text-xs lg:text-sm">
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden sm:inline">الإحصائيات</span>
                    </TabsTrigger>
                    <TabsTrigger value="discounts" className="flex items-center gap-2 text-xs lg:text-sm">
                      <Percent className="w-4 h-4" />
                      <span className="hidden sm:inline">الخصومات</span>
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="flex items-center gap-2 text-xs lg:text-sm">
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">التقييمات</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2 text-xs lg:text-sm">
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">الإعدادات</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              {/* Products Tab - Available for full admins and products_adder */}
              {(isFullAdmin || isProductsAdder) && (
                <TabsContent value="products" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {isProductsAdder && !isFullAdmin ? <Plus className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                        {isProductsAdder && !isFullAdmin ? 'إضافة منتجات جديدة' : 'إدارة المنتجات'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProductsManagement />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Orders Tab - Available for all admin roles */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-6 h-6" />
                      إدارة الطلبات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EnhancedOrdersManagement />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Full Admin Only Tabs */}
              {isFullAdmin && (
                <>
                  <TabsContent value="users" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-6 h-6" />
                          إدارة المستخدمين
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <UserManagement />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="statistics" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-6 h-6" />
                          الإحصائيات والتقارير
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <StatisticsPanel />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="discounts" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Percent className="w-6 h-6" />
                          إدارة الخصومات
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <EnhancedDiscountManagement />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="feedback" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-6 h-6" />
                          إدارة التقييمات والملاحظات
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
                          <Settings className="w-6 h-6" />
                          إعدادات النظام
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AdminSettings />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;
