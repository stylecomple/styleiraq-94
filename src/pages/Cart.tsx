import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingCart, Package, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import PaymentDialog from '@/components/PaymentDialog';
import { useNavigate } from 'react-router-dom';

interface PaymentConfig {
  enabled: boolean;
  [key: string]: any;
}

interface AdminSettingsData {
  visa_card_config?: PaymentConfig;
  zain_cash_config?: PaymentConfig;
}

const Cart = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice, 
    clearCart,
    isPaymentDialogOpen,
    selectedPaymentMethod,
    pendingOrder,
    openPaymentDialog,
    closePaymentDialog
  } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'visa_card' | 'zain_cash'>('cash_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: adminSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('visa_card_config, zain_cash_config')
        .single();
      
      if (error) throw error;
      return data as AdminSettingsData;
    }
  });

  const governorates = [
    "بغداد", "البصرة", "نينوى", "ذي قار", "الأنبار", "ديالى", "صلاح الدين", "كركوك", "بابل", "القادسية",
    "النجف", "كربلاء", "ميسان", "المثنى", "واسط", "أربيل", "دهوك", "السليمانية", "حلبجة", "العامريه"
  ];

  const getShippingCost = () => {
    if (!governorate) return 0;
    if (governorate === 'بغداد') return 5000;
    if (governorate === 'العامريه') return 2000;
    return 6000;
  };

  const getTotalWithShipping = () => {
    return getTotalPrice() + getShippingCost();
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    if (!shippingAddress || !phone || !governorate) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "خطأ",
        description: "السلة فارغة",
        variant: "destructive",
      });
      return;
    }

    // Check if payment method requires gateway and if it's enabled
    if (paymentMethod === 'visa_card' && !adminSettings?.visa_card_config?.enabled) {
      toast({
        title: "خطأ",
        description: "طريقة الدفع بالفيزا غير متاحة حالياً",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'zain_cash' && !adminSettings?.zain_cash_config?.enabled) {
      toast({
        title: "خطأ",
        description: "طريقة الدفع بزين كاش غير متاحة حالياً",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order in database with shipping cost included
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: getTotalWithShipping(),
          shipping_address: shippingAddress,
          phone: phone,
          governorate: governorate,
          payment_method: paymentMethod,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with selected options
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        selected_color: item.selectedOption || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // If payment method requires gateway processing, open payment dialog
      if (paymentMethod === 'visa_card' || paymentMethod === 'zain_cash') {
        const orderData = {
          orderId: order.id,
          totalAmount: getTotalWithShipping(),
          items: items
        };
        openPaymentDialog(paymentMethod, orderData);
      } else {
        // For cash on delivery, complete the order immediately
        await completeOrder(order.id);
      }

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOrder = async (orderId: string) => {
    try {
      // Send Telegram notification
      await supabase.functions.invoke('send-telegram-notification', {
        body: { orderId }
      });

      clearCart();
      toast({
        title: "تم إنشاء الطلب بنجاح",
        description: "سيتم التواصل معك قريباً لتأكيد الطلب",
      });

      // Reset form
      setShippingAddress('');
      setPhone('');
      setGovernorate('');
      setPaymentMethod('cash_on_delivery');
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        title: "تم إنشاء الطلب",
        description: "تم إنشاء الطلب بنجاح ولكن قد يكون هناك تأخير في الإشعارات",
      });
    }
  };

  const handlePaymentSuccess = () => {
    if (pendingOrder) {
      completeOrder(pendingOrder.orderId);
    }
    closePaymentDialog();
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-gray-600 mb-6">يجب تسجيل الدخول لعرض السلة</p>
          <Button onClick={() => navigate('/auth')}>
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewOrders}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            طلباتي
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">سلة التسوق</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  المنتجات ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">السلة فارغة</p>
                    <Button onClick={() => navigate('/')}>
                      ابدأ التسوق
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.selectedOption || 'default'}`} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            {item.selectedOption && (
                              <Badge variant="outline" className="mt-1">
                                {item.selectedOption}
                              </Badge>
                            )}
                            <p className="text-gray-600">{formatPrice(item.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOption)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedOption)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.id, item.selectedOption)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  {governorate && (
                    <div className="flex justify-between">
                      <span>تكلفة التوصيل:</span>
                      <span>{formatPrice(getShippingCost())}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>المجموع الكلي:</span>
                      <span>{formatPrice(getTotalWithShipping())}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>معلومات التوصيل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="governorate">المحافظة *</Label>
                    <Select value={governorate} onValueChange={setGovernorate}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent>
                        {governorates.map((gov) => (
                          <SelectItem key={gov} value={gov}>
                            {gov}
                            {gov === 'بغداد' && (
                              <span className="text-sm text-green-600 mr-2">(5,000 د.ع)</span>
                            )}
                            {gov === 'العامريه' && (
                              <span className="text-sm text-blue-600 mr-2">(2,000 د.ع)</span>
                            )}
                            {gov !== 'بغداد' && gov !== 'العامريه' && (
                              <span className="text-sm text-orange-600 mr-2">(6,000 د.ع)</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {governorate && (
                      <p className="text-sm text-gray-600 mt-1">
                        تكلفة التوصيل: {formatPrice(getShippingCost())}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address">العنوان التفصيلي *</Label>
                    <Input
                      id="address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="أدخل العنوان التفصيلي"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>

                  <div>
                    <Label>طريقة الدفع *</Label>
                    <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash_on_delivery" id="cash" />
                        <Label htmlFor="cash">الدفع عند الاستلام</Label>
                      </div>
                      {adminSettings?.visa_card_config?.enabled && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="visa_card" id="visa" />
                          <Label htmlFor="visa">فيزا كارد</Label>
                        </div>
                      )}
                      {adminSettings?.zain_cash_config?.enabled && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="zain_cash" id="zain" />
                          <Label htmlFor="zain">زين كاش</Label>
                        </div>
                      )}
                    </RadioGroup>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'جاري المعالجة...' : `تأكيد الطلب (${formatPrice(getTotalWithShipping())})`}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={closePaymentDialog}
        paymentMethod={selectedPaymentMethod}
        orderData={pendingOrder}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Cart;
