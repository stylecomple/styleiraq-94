import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import PaymentDialog from '@/components/PaymentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod } from '@/types';

const MobilePayment = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [orderData, setOrderData] = useState<{ orderId: string; totalAmount: number; items: any[] } | null>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const governorates = [
    { name: 'بغداد', cost: 5000 },
    { name: 'العامرية', cost: 2000 },
    { name: 'الأنبار', cost: 6000 },
    { name: 'بابل', cost: 6000 },
    { name: 'البصرة', cost: 6000 },
    { name: 'ذي قار', cost: 6000 },
    { name: 'القادسية', cost: 6000 },
    { name: 'كربلاء', cost: 6000 },
    { name: 'كركوك', cost: 6000 },
    { name: 'ميسان', cost: 6000 },
    { name: 'المثنى', cost: 6000 },
    { name: 'النجف', cost: 6000 },
    { name: 'نينوى', cost: 6000 },
    { name: 'صلاح الدين', cost: 6000 },
    { name: 'واسط', cost: 6000 },
    { name: 'أربيل', cost: 6000 },
    { name: 'دهوك', cost: 6000 },
    { name: 'السليمانية', cost: 6000 }
  ];

  const subtotalAmount = getTotalPrice();
  const selectedGov = governorates.find(gov => gov.name === selectedGovernorate);
  const shippingCost = selectedGov ? selectedGov.cost : 0;
  const totalAmount = subtotalAmount + shippingCost;

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
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

    if (!selectedGovernorate) {
      toast({
        title: "اختر المحافظة",
        description: "يرجى اختيار المحافظة لحساب تكلفة التوصيل",
        variant: "destructive",
      });
      return;
    }

    if (!shippingAddress.trim()) {
      toast({
        title: "العنوان مطلوب",
        description: "يرجى إدخال عنوان التوصيل",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "رقم الهاتف مطلوب",
        description: "يرجى إدخال رقم الهاتف",
        variant: "destructive",
      });
      return;
    }

    if (method === 'cash_on_delivery') {
      handleCashOnDeliveryOrder();
    } else {
      // Create order data for online payment
      const orderId = `order_${Date.now()}`;
      const newOrderData = {
        orderId,
        totalAmount,
        items
      };

      setSelectedPaymentMethod(method);
      setOrderData(newOrderData);
      setIsPaymentDialogOpen(true);
    }
  };

  const handleCashOnDeliveryOrder = async () => {
    try {
      const orderId = `cod_${Date.now()}`;
      
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: user!.id,
          total_amount: totalAmount,
          status: 'pending',
          payment_method: 'cash_on_delivery',
          shipping_address: shippingAddress,
          governorate: selectedGovernorate,
          phone: phoneNumber
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        selected_color: item.selectedOption || item.selectedColor
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      toast({
        title: "تم إنشاء الطلب بنجاح",
        description: "سيتم التواصل معك لتأكيد الطلب",
      });
      navigate('/app/orders');
    } catch (error) {
      console.error('Error creating cash on delivery order:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive",
      });
    }
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
        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              معلومات التوصيل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="governorate">المحافظة</Label>
              <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {governorates.map((gov) => (
                    <SelectItem key={gov.name} value={gov.name}>
                      {gov.name} - {gov.cost.toLocaleString()} د.ع
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="address">العنوان التفصيلي</Label>
              <Input
                id="address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="أدخل العنوان التفصيلي"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07XXXXXXXXX"
                type="tel"
              />
            </div>
          </CardContent>
        </Card>

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
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span>المجموع الفرعي</span>
                <span>{subtotalAmount.toLocaleString()} د.ع</span>
              </div>
              {selectedGov && (
                <div className="flex justify-between items-center">
                  <span>التوصيل ({selectedGov.name})</span>
                  <span>{shippingCost.toLocaleString()} د.ع</span>
                </div>
              )}
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
          
          <Card className="cursor-pointer hover:bg-gray-50" onClick={() => handlePaymentMethodSelect('cash_on_delivery')}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Truck className="w-8 h-8 text-green-600" />
                <div className="flex-1">
                  <h4 className="font-semibold">دفع عند الاستلام</h4>
                  <p className="text-sm text-gray-600">ادفع نقداً عند وصول الطلب</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
