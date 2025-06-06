import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Minus, Plus, Trash2, ArrowLeft, CreditCard, Smartphone, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import PaymentDialog from '@/components/PaymentDialog';

const Cart = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice,
    isPaymentDialogOpen,
    selectedPaymentMethod,
    pendingOrder,
    openPaymentDialog,
    closePaymentDialog
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    phone: '',
    governorate: '',
    address: '',
    paymentMethod: 'cash_on_delivery'
  });

  // Fetch admin settings to check which payment methods are enabled
  const { data: adminSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('visa_card_config, zain_cash_config')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const governorates = [
    "بغداد", "البصرة", "نينوى", "ذي قار", "الأنبار", "ديالى", "صلاح الدين", "كركوك", "بابل", "القادسية",
    "ميسان", "واسط", "دهوك", "أربيل", "السليمانية", "النجف", "كربلاء", "المثنى"
  ];

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} دينار`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setOrderForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleQuantityChange = (productId: string, quantity: number, selectedColor?: string) => {
    if (quantity < 1) {
      removeFromCart(productId, selectedColor);
    } else {
      updateQuantity(productId, quantity, selectedColor);
    }
  };

  const handleRemoveItem = (productId: string, selectedColor?: string) => {
    removeFromCart(productId, selectedColor);
  };

  const handleOrderSubmit = async () => {
    if (!user) {
      toast({
        title: 'يجب تسجيل الدخول',
        description: 'يرجى تسجيل الدخول لإتمام الطلب',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!orderForm.phone || !orderForm.governorate || !orderForm.address) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'السلة فارغة',
        description: 'يرجى إضافة منتجات للسلة قبل إتمام الطلب',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        user_id: user.id,
        total_amount: getTotalPrice(),
        shipping_address: orderForm.address,
        phone: orderForm.phone,
        governorate: orderForm.governorate,
        payment_method: orderForm.paymentMethod,
        status: 'pending'
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        selected_color: item.selectedColor
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Handle different payment methods
      if (orderForm.paymentMethod === 'visa_card') {
        if (!adminSettings?.visa_card_config?.enabled) {
          toast({
            title: 'خطأ',
            description: 'الدفع بالفيزا كارد غير متاح حالياً',
            variant: 'destructive',
          });
          return;
        }
        
        openPaymentDialog('visa_card', {
          orderId: order.id,
          totalAmount: getTotalPrice(),
          items
        });
      } else if (orderForm.paymentMethod === 'zain_cash') {
        if (!adminSettings?.zain_cash_config?.enabled) {
          toast({
            title: 'خطأ',
            description: 'الدفع بزين كاش غير متاح حالياً',
            variant: 'destructive',
          });
          return;
        }
        
        openPaymentDialog('zain_cash', {
          orderId: order.id,
          totalAmount: getTotalPrice(),
          items
        });
      } else {
        // Cash on delivery - complete immediately
        toast({
          title: 'تم تأكيد الطلب',
          description: 'سيتم التواصل معك قريباً لتأكيد التسليم',
        });
        
        clearCart();
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في إنشاء الطلب',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate('/orders');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">جاري التحميل...</div>
    </div>;
  }

  if (!adminSettings) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">جاري تحميل إعدادات الدفع...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-4 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          العودة للرئيسية
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>سلة التسوق</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">السلة فارغة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-gray-600">{formatPrice(item.price)}</p>
                        {item.selectedColor && (
                          <p className="text-sm text-gray-500">اللون: {item.selectedColor}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.selectedColor)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.selectedColor)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id, item.selectedColor)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="text-2xl font-bold text-right">
                  المجموع الكلي: {formatPrice(getTotalPrice())}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات التسليم والدفع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="phone" className="text-base font-medium">رقم الهاتف</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                placeholder="07XXXXXXXXX"
                value={orderForm.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="governorate" className="text-base font-medium">المحافظة</Label>
              <Select onValueChange={(value) => setOrderForm(prev => ({ ...prev, governorate: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر محافظة" defaultValue={orderForm.governorate} />
                </SelectTrigger>
                <SelectContent>
                  {governorates.map((gov) => (
                    <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address" className="text-base font-medium">العنوان</Label>
              <Input
                type="text"
                id="address"
                name="address"
                placeholder="أدخل عنوان التسليم بالتفصيل"
                value={orderForm.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label className="text-base font-medium mb-4 block">طريقة الدفع</Label>
              <RadioGroup
                value={orderForm.paymentMethod}
                onValueChange={(value) => setOrderForm(prev => ({ ...prev, paymentMethod: value }))}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="cash_on_delivery" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                    <Truck className="w-4 h-4" />
                    الدفع عند الاستلام
                  </Label>
                </div>
                
                {adminSettings?.visa_card_config?.enabled && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="visa_card" id="visa" />
                    <Label htmlFor="visa" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="w-4 h-4" />
                      فيزا كارد
                    </Label>
                  </div>
                )}
                
                {adminSettings?.zain_cash_config?.enabled && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="zain_cash" id="zain" />
                    <Label htmlFor="zain" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="w-4 h-4" />
                      زين كاش
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            <Button onClick={handleOrderSubmit} className="w-full bg-pink-600 hover:bg-pink-700" disabled={loading}>
              تأكيد الطلب
            </Button>
          </CardContent>
        </Card>
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
