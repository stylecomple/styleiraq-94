
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Package, LogOut, Shield } from 'lucide-react';

const MobileAccount = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, isOwner, isOrderManager } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/app/products');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  // Show admin panel button for any user with admin privileges
  const showAdminPanel = user && (isAdmin || isOwner || isOrderManager);

  if (!user) {
    return (
      <MobileAppLayout title="حسابي">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                تسجيل الدخول مطلوب
              </h2>
              <p className="text-gray-600 mb-6">
                يرجى تسجيل الدخول لعرض معلومات حسابك
              </p>
              <Button 
                onClick={() => navigate('/app/auth')}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                تسجيل الدخول
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <MobileAppLayout title="حسابي">
      <div className="p-4 space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              معلومات المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">الاسم</p>
              <p className="font-semibold">
                {user.user_metadata?.full_name || 'غير محدد'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">البريد الإلكتروني</p>
              <p className="font-semibold">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">الإجراءات السريعة</h3>
          
          <Button
            onClick={() => navigate('/app/orders')}
            variant="outline"
            className="w-full justify-start gap-3 h-12"
          >
            <Package className="w-5 h-5" />
            طلباتي
          </Button>

          {/* Admin Panel Button - Show for admin, owner, or order manager */}
          {showAdminPanel && (
            <Button
              onClick={handleAdminPanel}
              variant="outline"
              className="w-full justify-start gap-3 h-12 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              <Shield className="w-5 h-5" />
              لوحة التحكم
            </Button>
          )}

          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full justify-start gap-3 h-12 border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </MobileAppLayout>
  );
};

export default MobileAccount;
