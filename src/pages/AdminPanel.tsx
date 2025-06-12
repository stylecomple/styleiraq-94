import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, Users, BarChart3, Settings, MessageSquare, Percent, FolderPlus, Menu } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import AdminSidebar from '@/components/AdminSidebar';
import ProductsManagement from '@/components/admin/ProductsManagement';
import AddProductForm from '@/components/admin/AddProductForm';
import CategoryManager from '@/components/admin/CategoryManager';
import UserManagement from '@/components/admin/UserManagement';
import StatisticsPanel from '@/components/admin/StatisticsPanel';
import AdminSettings from '@/components/admin/AdminSettings';
import FeedbackManagement from '@/components/admin/FeedbackManagement';
import SimpleDiscountManagement from '@/components/admin/SimpleDiscountManagement';
import EnhancedOrdersManagement from '@/components/admin/EnhancedOrdersManagement';
import ChangesLogPanel from '@/components/admin/ChangesLogPanel';
import MobileAdminPanel from '@/components/admin/MobileAdminPanel';

const AdminPanel = () => {
  const { user, isAdmin, isOwner, isOrderManager, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const isMobile = useIsMobile();
  
  const activeTab = searchParams.get('tab') || (isOrderManager && !isAdmin && !isOwner ? 'orders' : 'products');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isOwner && !isOrderManager)) {
    return <Navigate to="/auth" replace />;
  }

  const isFullAdmin = isAdmin || isOwner;

  // Show mobile admin panel for small screens and full admins
  if (isMobile && isFullAdmin) {
    return <MobileAdminPanel />;
  }

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return isFullAdmin ? (
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                إدارة المنتجات
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowCategoryManager(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">إدارة الفئات</span>
                </Button>
                <Button 
                  onClick={() => setShowAddProduct(true)}
                  size="sm"
                  className="bg-pink-600 hover:bg-pink-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">إضافة منتج</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <ProductsManagement />
            </CardContent>
          </Card>
        ) : null;

      case 'orders':
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                إدارة الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <EnhancedOrdersManagement />
            </CardContent>
          </Card>
        );

      case 'users':
        return isFullAdmin ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                إدارة المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <UserManagement />
            </CardContent>
          </Card>
        ) : null;

      case 'statistics':
        return isFullAdmin ? (
          <div className="space-y-6">
            <StatisticsPanel />
            <ChangesLogPanel />
          </div>
        ) : null;

      case 'discounts':
        return isFullAdmin ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                إدارة الخصومات العامة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <SimpleDiscountManagement />
            </CardContent>
          </Card>
        ) : null;

      case 'feedback':
        return isFullAdmin ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                إدارة التقييمات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <FeedbackManagement />
            </CardContent>
          </Card>
        ) : null;

      case 'settings':
        return isFullAdmin ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                إعدادات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <AdminSettings />
            </CardContent>
          </Card>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <AdminSidebar />
        
        <SidebarInset className="flex-1">
          {/* Mobile Header */}
          <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
            <SidebarTrigger />
            <h1 className="font-semibold">
              {isOrderManager && !isFullAdmin ? 'لوحة إدارة الطلبات' : 'لوحة الإدارة'}
            </h1>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 space-y-6">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold">
                  {isOrderManager && !isFullAdmin ? 'لوحة إدارة الطلبات' : 'لوحة الإدارة'}
                </h1>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </main>
        </SidebarInset>

        {/* Modals */}
        {showAddProduct && isFullAdmin && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <AddProductForm onClose={() => setShowAddProduct(false)} />
            </div>
          </div>
        )}

        {showCategoryManager && isFullAdmin && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">إدارة الفئات والفئات الفرعية</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCategoryManager(false)}
                  >
                    إغلاق
                  </Button>
                </div>
                <CategoryManager />
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;
