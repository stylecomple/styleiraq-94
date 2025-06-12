
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import PaymentDialog from '@/components/PaymentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MobilePayment = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'visa_card' | 'zain_cash' | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [orderData, setOrderData] = useState<{ orderId: string; totalAmount: number; items: any[] } | null>(null);

  const totalAmount = getTotalPrice();

  const handlePaymentMethodSelect = (method: 'visa_card' | 'zain_cash') => {
    if (!user) {
      navigate('/app/auth');
      return;
    }

    if (items.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "يرجى إضافة منتجات للسلة قبل الدفع",
        variant: "destructive",
      });
      return;
    }

    // Create order data
    const orderId = `order_${Date.now()}`;
    const newOrderData = {
      orderId,
      totalAmount,
      items
    };

    setSelectedPaymentMethod(method);
    setOrderData(newOrderData);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    toast({
      title: "تم الدفع بنجاح",
      description: "تم تأكيد طلبك وسيتم معالجته قريباً",
    });
    navigate('/app/orders');
  };

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedPaymentMethod(null);
    setOrderData(null);
  };

  if (!user) {
    return (
      <MobileAppLayout title="الدفع">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                يرجى تسجيل الدخول
              </h2>
              <p className="text-gray-600 mb-6">
                يجب تسجيل الدخول لإتمام عملية الدفع
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

  if (items.length === 0) {
    return (
      <MobileAppLayout title="الدفع">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                السلة فارغة
              </h2>
              <p className="text-gray-600 mb-6">
                يرجى إضافة منتجات للسلة قبل المتابعة للدفع
              </p>
              <Button 
                onClick={() => navigate('/app/products')}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                تصفح المنتجات
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <MobileAppLayout title="الدفع" backPath="/app/cart">
      <div className="p-4 space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  {item.selectedOption && (
                    <p className="text-sm text-gray-600">{item.selectedOption}</p>
                  )}
                  <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                </div>
                <p className="font-semibold">
                  {(item.price * item.quantity).toLocaleString()} د.ع
                </p>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>المجموع الكلي</span>
                <span className="text-pink-600">{totalAmount.toLocaleString()} د.ع</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">اختر طريقة الدفع</h3>
          
          <Card className="cursor-pointer hover:bg-gray-50" onClick={() => handlePaymentMethodSelect('visa_card')}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-semibold">فيزا كارد</h4>
                  <p className="text-sm text-gray-600">ادفع باستخدام بطاقة الفيزا</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50" onClick={() => handlePaymentMethodSelect('zain_cash')}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Smartphone className="w-8 h-8 text-orange-600" />
                <div className="flex-1">
                  <h4 className="font-semibold">زين كاش</h4>
                  <p className="text-sm text-gray-600">ادفع باستخدام زين كاش</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={handleClosePaymentDialog}
        paymentMethod={selectedPaymentMethod}
        orderData={orderData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </MobileAppLayout>
  );
};

export default MobilePayment;
