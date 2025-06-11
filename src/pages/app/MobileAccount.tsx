
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MobileAppLayout from '@/components/MobileAppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Package, 
  Settings, 
  LogOut, 
  Shield,
  Crown,
  ChevronLeft
} from 'lucide-react';

const MobileAccount = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, isOwner } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const accountMenuItems = [
    {
      id: 'orders',
      icon: Package,
      label: 'طلباتي',
      action: () => navigate('/orders')
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'الإعدادات',
      action: () => console.log('Settings clicked')
    }
  ];

  // Add admin/owner panel access
  if (isAdmin || isOwner) {
    accountMenuItems.push({
      id: 'admin',
      icon: isOwner ? Crown : Shield,
      label: isOwner ? 'لوحة المالك' : 'لوحة الإدارة',
      action: () => navigate(isOwner ? '/owner' : '/admin')
    });
  }

  if (!user) {
    return (
      <MobileAppLayout title="حسابي" showBackButton={false}>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">تسجيل الدخول مطلوب</h2>
            <p className="text-gray-600 mb-6">يرجى تسجيل الدخول للوصول إلى حسابك</p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <MobileAppLayout title="حسابي" showBackButton={false}>
      <div className="p-4 space-y-4">
        {/* User Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">
                  مرحباً بك
                </h2>
                <p className="text-gray-600">{user.email}</p>
                {(isAdmin || isOwner) && (
                  <div className="flex items-center gap-1 mt-1">
                    {isOwner ? <Crown className="w-4 h-4 text-yellow-500" /> : <Shield className="w-4 h-4 text-blue-500" />}
                    <span className="text-sm font-medium text-gray-700">
                      {isOwner ? 'مالك' : 'مشرف'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2">
          {accountMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="outline"
                className="w-full h-14 justify-between bg-white hover:bg-gray-50"
                onClick={item.action}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 ml-3 text-gray-600" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </Button>
            );
          })}
        </div>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          className="w-full h-14 justify-center text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 ml-2" />
          تسجيل الخروج
        </Button>
      </div>
    </MobileAppLayout>
  );
};

export default MobileAccount;
