
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Package, LogOut, LogIn, Settings } from 'lucide-react';

const MobileAccount = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/app/products');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    navigate('/app/auth');
  };

  const handleOrders = () => {
    navigate('/app/orders');
  };

  return (
    <MobileAppLayout title="حسابي" showBackButton={false}>
      <div className="p-4 space-y-4">
        {user ? (
          <>
            {/* User Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {user.email}
                    </h2>
                    <p className="text-sm text-gray-600">مرحباً بك في متجرنا</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-14 text-right"
                onClick={handleOrders}
              >
                <Package className="w-5 h-5 ml-3" />
                طلباتي
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-14 text-right"
              >
                <Settings className="w-5 h-5 ml-3" />
                الإعدادات
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-14 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5 ml-3" />
                تسجيل الخروج
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Not Signed In */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-pink-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  مرحباً بك
                </h2>
                <p className="text-gray-600 mb-6">
                  سجل دخولك للوصول إلى حسابك وطلباتك
                </p>
                <Button 
                  onClick={handleSignIn}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  تسجيل الدخول
                </Button>
              </CardContent>
            </Card>

            {/* Guest Menu */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-14 text-right"
              >
                <Settings className="w-5 h-5 ml-3" />
                الإعدادات
              </Button>
            </div>
          </>
        )}

        {/* App Info */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-sm text-gray-500">
              <p>متجر Style Iraq</p>
              <p>الإصدار 1.0.0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileAppLayout>
  );
};

export default MobileAccount;
