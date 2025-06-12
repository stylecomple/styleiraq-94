
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PaymentDialog from '@/components/PaymentDialog';
import { CreditCard, Smartphone, Truck, MapPin, Phone, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PaymentMethod } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const GOVERNORATES = [
  { name: 'بغداد', cost: 5000 },
  { name: 'العامرية', cost: 2000 },
  { name: 'البصرة', cost: 6000 },
  { name: 'نينوى', cost: 6000 },
  { name: 'أربيل', cost: 6000 },
  { name: 'النجف', cost: 6000 },
  { name: 'كربلاء', cost: 6000 },
  { name: 'الأنبار', cost: 6000 },
  { name: 'دهوك', cost: 6000 },
  { name: 'السليمانية', cost: 6000 },
  { name: 'كركوك', cost: 6000 },
  { name: 'ديالى', cost: 6000 },
  { name: 'صلاح الدين', cost: 6000 },
  { name: 'القادسية', cost: 6000 },
  { name: 'بابل', cost: 6000 },
  { name: 'واسط', cost: 6000 },
  { name: 'ميسان', cost: 6000 },
  { name: 'ذي قار', cost: 6000 },
  { name: 'المثنى', cost: 6000 }
];

const MobilePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [orderData, setOrderData] = useState<{ orderId: string; totalAmount: number; items: any[] } | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    governorate: '',
    address: ''
  });

  // Load saved user data on component mount
  useEffect(() => {
    if (user) {
      setShippingInfo({
        fullName: user.user_metadata?.full_name || '',
        phone: localStorage.getItem('user-phone') || '',
        governorate: localStorage.getItem('user-governorate') || '',
        address: ''
      });
    }
  }, [user]);

  const productsPrice = getTotalPrice();
  const selectedGov = GOVERNORATES.find(gov => gov.name === shippingInfo.governorate);
  const shippingCost = selectedGov ? selectedGov.cost : 0;
  const totalPrice = productsPrice + shippingCost;

  const paymentMethods = [
    {
      id: 'cash_on_delivery' as PaymentMethod,
      name: 'الدفع عند الاستلام',
      description: 'ادفع عند وصول الطلب',
      icon: <Truck className="w-6 h-6" />,
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      id: 'zain_cash' as PaymentMethod,
      name: 'زين كاش',
      description: 'الدفع عبر محفظة زين كاش',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    {
      id: 'visa_card' as PaymentMethod,
      name: 'بطاقة فيزا',
      description: 'الدفع بالبطاقة الائتمانية',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    }
  ];

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "يرجى اختيار طريقة الدفع",
        variant: "destructive",
      });
      return;
    }

    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.governorate || !shippingInfo.address) {
      toast({
        title: "يرجى ملء جميع بيانات الشحن",
        variant: "destructive",
      });
      return;
    }

    if (selectedPaymentMethod === 'cash_on_delivery') {
      try {
        const orderId = crypto.randomUUID();
        
        // Process cash on delivery order directly
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            id: orderId,
            user_id: user.id,
            total_amount: totalPrice,
            status: 'pending',
            payment_method: selectedPaymentMethod,
            phone: shippingInfo.phone,
            governorate: shippingInfo.governorate,
            shipping_address: shippingInfo.address
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
        console.error('Payment error:', error);
        toast({
          title: "خطأ في إنشاء الطلب",
          description: "حدث خطأ أثناء إنشاء الطلب",
          variant: "destructive",
        });
      }
    } else {
      // For other payment methods, show payment dialog
      const orderId = crypto.randomUUID();
      setOrderData({
        orderId,
        totalAmount: totalPrice,
        items
      });
      setShowPaymentDialog(true);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setShowPaymentDialog(false);
    toast({
      title: "تم الدفع بنجاح",
      description: "تم إنشاء طلبك بنجاح",
    });
    navigate('/app/orders');
  };

  if (!user) {
    navigate('/app/auth');
    return null;
  }

  if (items.length === 0) {
    return (
      <MobileAppLayout title="إتمام الطلب" showBackButton={true}>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">السلة فارغة</h2>
            <p className="text-gray-600 mb-6">أضف بعض المنتجات إلى سلتك أولاً</p>
            <Button onClick={() => navigate('/app/products')}>
              تصفح المنتجات
            </Button>
          </div>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <MobileAppLayout title="إتمام الطلب" showBackButton={true}>
      <div className="p-4 space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={`${item.id}-${item.selectedOption || item.selectedColor}`} className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    {(item.selectedOption || item.selectedColor) && (
                      <p className="text-sm text-gray-600">
                        {item.selectedOption || item.selectedColor}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{(item.price * item.quantity).toLocaleString()} د.ع</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span>المنتجات:</span>
                  <span>{productsPrice.toLocaleString()} د.ع</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between items-center">
                    <span>رسوم الشحن:</span>
                    <span>{shippingCost.toLocaleString()} د.ع</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>المجموع الكلي:</span>
                  <span>{totalPrice.toLocaleString()} د.ع</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الشحن</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={shippingInfo.fullName}
                  onChange={(e) => setShippingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="أدخل اسمك الكامل"
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="07XXXXXXXXX"
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="governorate">المحافظة</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  value={shippingInfo.governorate}
                  onValueChange={(value) => setShippingInfo(prev => ({ ...prev, governorate: value }))}
                  required
                >
                  <SelectTrigger className="pr-10">
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOVERNORATES.map((gov) => (
                      <SelectItem key={gov.name} value={gov.name}>
                        {gov.name} - {gov.cost.toLocaleString()} د.ع
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">العنوان التفصيلي</Label>
              <Textarea
                id="address"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="أدخل عنوانك التفصيلي (المنطقة، الشارع، رقم البيت)"
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>طريقة الدفع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === method.id
                    ? method.color + ' border-current'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={selectedPaymentMethod === method.id ? '' : 'text-gray-600'}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedPaymentMethod === method.id
                      ? 'bg-current border-current'
                      : 'border-gray-300'
                  }`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Complete Order Button */}
        <Button
          onClick={handlePayment}
          className="w-full h-12 text-lg font-semibold bg-pink-600 hover:bg-pink-700"
          disabled={!selectedPaymentMethod}
        >
          إتمام الطلب - {totalPrice.toLocaleString()} د.ع
        </Button>

        {/* Payment Dialog */}
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          paymentMethod={selectedPaymentMethod}
          orderData={orderData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </MobileAppLayout>
  );
};

export default MobilePayment;
