
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, ArrowLeft, Clock, UserCog, Trash2, Ban, Percent } from 'lucide-react';
import ChangesLogPanel from './ChangesLogPanel';
import UserManagement from './UserManagement';
import OwnerOrdersManagement from './OwnerOrdersManagement';
import UserBanManagement from './UserBanManagement';
import DiscountManagement from './DiscountManagement';

const OwnerPanel = () => {
  const { user, isOwner, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!user || !isOwner) {
    navigate('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')} 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للوحة التحكم
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-foreground">
              لوحة تحكم المالك
            </h1>
          </div>
          <p className="text-muted-foreground">إدارة متقدمة للنظام والمستخدمين</p>
        </div>

        <Tabs defaultValue="discounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="discounts">إدارة الخصومات</TabsTrigger>
            <TabsTrigger value="changes-log">سجل التغييرات</TabsTrigger>
            <TabsTrigger value="user-management">إدارة المستخدمين</TabsTrigger>
            <TabsTrigger value="orders-management">إدارة الطلبات</TabsTrigger>
            <TabsTrigger value="user-ban">حظر المستخدمين</TabsTrigger>
          </TabsList>

          <TabsContent value="discounts" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Percent className="w-6 h-6" />
              إدارة الخصومات
            </h2>
            <DiscountManagement />
          </TabsContent>

          <TabsContent value="changes-log" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6" />
              سجل التغييرات
            </h2>
            <ChangesLogPanel />
          </TabsContent>

          <TabsContent value="user-management" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <UserCog className="w-6 h-6" />
              إدارة المستخدمين والأدوار
            </h2>
            <UserManagement />
          </TabsContent>

          <TabsContent value="orders-management" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              إدارة وحذف الطلبات
            </h2>
            <OwnerOrdersManagement />
          </TabsContent>

          <TabsContent value="user-ban" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Ban className="w-6 h-6" />
              حظر وإلغاء حظر المستخدمين
            </h2>
            <UserBanManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerPanel;
