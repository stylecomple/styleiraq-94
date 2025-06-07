import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Users, Package, BarChart3, Plus, ArrowLeft, Volume2, TrendingUp, Settings, Clock } from 'lucide-react';
import ProductsManagement from '@/components/admin/ProductsManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
import AddProductForm from '@/components/admin/AddProductForm';
import CategoryManager from '@/components/admin/CategoryManager';
import StatisticsPanel from '@/components/admin/StatisticsPanel';
import ChangesLogPanel from '@/components/admin/ChangesLogPanel';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import AdminSettings from '@/components/admin/AdminSettings';

const AdminPanel = () => {
  const {
    user,
    isAdmin,
    isOwner,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const {
    playNotificationSound
  } = useNotificationSound();
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categories, setCategories] = useState([
    { id: 'makeup', name: 'مكياج', icon: '💄' },
    { id: 'perfumes', name: 'عطور', icon: '🌸' },
    { id: 'flowers', name: 'ورد', icon: '🌹' },
    { id: 'home', name: 'مستلزمات منزلية', icon: '🏠' },
    { id: 'personal_care', name: 'عناية شخصية', icon: '🧴' },
    { id: 'exclusive_offers', name: 'العروض الحصرية', icon: '✨' }
  ]);

  // تفعيل مراقبة الطلبات الجديدة
  useOrderNotifications();

  useEffect(() => {
    if (!loading && (!user || (!isAdmin && !isOwner))) {
      navigate('/');
    }
  }, [user, isAdmin, isOwner, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // الحصول على عدد المستخدمين الإجمالي
        const {
          count: totalUsers
        } = await supabase.from('profiles').select('*', {
          count: 'exact',
          head: true
        });

        // الحصول على عدد المستخدمين المديرين
        const {
          count: adminUsers
        } = await supabase.from('user_roles').select('*', {
          count: 'exact',
          head: true
        }).eq('role', 'admin');

        // الحصول على عدد المنتجات الإجمالي
        const {
          count: totalProducts
        } = await supabase.from('products').select('*', {
          count: 'exact',
          head: true
        });

        // الحصول على عدد الطلبات الإجمالي
        const {
          count: totalOrders
        } = await supabase.from('orders').select('*', {
          count: 'exact',
          head: true
        });

        setStats({
          totalUsers: totalUsers || 0,
          adminUsers: adminUsers || 0,
          totalProducts: totalProducts || 0,
          totalOrders: totalOrders || 0
        });
      } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const testNotificationSound = async () => {
    console.log('🧪 اختبار صوت الإشعار...');
    try {
      const result = await playNotificationSound();
      console.log('نتيجة الاختبار:', result);
    } catch (error) {
      console.error('خطأ في الاختبار:', error);
    }
  };

  useEffect(() => {
    console.log('حالة المدير:', {
      user: user?.id,
      isAdmin,
      isOwner,
      loading
    });
  }, [user, isAdmin, isOwner, loading]);

  // تحميل الفئات من localStorage
  useEffect(() => {
    const savedCategories = localStorage.getItem('productCategories');
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    }
  }, []);

  // حفظ الفئات في localStorage
  const handleCategoriesChange = (newCategories: typeof categories) => {
    setCategories(newCategories);
    localStorage.setItem('productCategories', JSON.stringify(newCategories));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري التحميل...</div>
      </div>;
  }

  if (!user || (!isAdmin && !isOwner)) {
    return null;
  }

  return <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-foreground">
              {isOwner ? 'لوحة تحكم المالك' : 'لوحة التحكم الإدارية'}
            </h1>
          </div>
          <p className="text-muted-foreground">إدارة متجر ستايل العامرية</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المديرين</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className={`grid w-full ${isOwner ? 'grid-cols-5' : 'grid-cols-3'}`}>
            <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
            <TabsTrigger value="orders">إدارة الطلبات</TabsTrigger>
            <TabsTrigger value="statistics">الإحصائيات</TabsTrigger>
            {isOwner && <TabsTrigger value="changes-log">سجل التغييرات</TabsTrigger>}
            {isOwner && <TabsTrigger value="settings">الإعدادات</TabsTrigger>}
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
              <div className="flex gap-3">
                <Button onClick={() => setShowCategoryManager(true)} variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50">
                  <Settings className="w-4 h-4 mr-2" />
                  إدارة الفئات
                </Button>
                <Button onClick={() => setShowAddProduct(true)} className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة منتج جديد
                </Button>
              </div>
            </div>
            
            {showCategoryManager && (
              <CategoryManager 
                categories={categories} 
                onCategoriesChange={handleCategoriesChange}
                onClose={() => setShowCategoryManager(false)} 
              />
            )}
            
            {showAddProduct && <AddProductForm onClose={() => setShowAddProduct(false)} />}
            
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <StatisticsPanel />
          </TabsContent>

          {isOwner && (
            <TabsContent value="changes-log" className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6" />
                سجل التغييرات
              </h2>
              <ChangesLogPanel />
            </TabsContent>
          )}

          {isOwner && (
            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-2xl font-bold">إعدادات المتجر</h2>
              <AdminSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>;
};

export default AdminPanel;
