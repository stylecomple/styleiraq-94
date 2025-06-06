import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    address: '',
    governorate: '',
    area: '',
    phone: ''
  });

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "يرجى إضافة منتجات للسلة أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول أولاً لإتمام الشراء",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setShowCheckout(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderDetails.address || !orderDetails.governorate || !orderDetails.area || !orderDetails.phone) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى تسجيل الدخول مرة أخرى",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order without payment_method field
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: getTotalPrice(),
          status: 'pending',
          shipping_address: `${orderDetails.address}, ${orderDetails.area}, ${orderDetails.governorate}`,
          phone: orderDetails.phone
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      toast({
        title: "تم إرسال الطلب",
        description: "سيتم التواصل معك قريباً لتأكيد الطلب"
      });

      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "خطأ في إرسال الطلب",
        description: "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-4 md:py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCheckout(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للسلة
            </Button>
            <h1 className="text-xl md:text-2xl font-bold">إتمام الشراء</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitOrder} className="space-y-4 md:space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address" className="text-sm md:text-base">العنوان</Label>
                    <Input
                      id="address"
                      value={orderDetails.address}
                      onChange={(e) => setOrderDetails({...orderDetails, address: e.target.value})}
                      placeholder="أدخل العنوان بالتفصيل"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="governorate" className="text-sm md:text-base">المحافظة</Label>
                      <Input
                        id="governorate"
                        value={orderDetails.governorate}
                        onChange={(e) => setOrderDetails({...orderDetails, governorate: e.target.value})}
                        placeholder="المحافظة"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="area" className="text-sm md:text-base">المنطقة السكنية</Label>
                      <Input
                        id="area"
                        value={orderDetails.area}
                        onChange={(e) => setOrderDetails({...orderDetails, area: e.target.value})}
                        placeholder="المنطقة السكنية"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm md:text-base">رقم التلفون</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={orderDetails.phone}
                      onChange={(e) => setOrderDetails({...orderDetails, phone: e.target.value})}
                      placeholder="07xxxxxxxx"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg md:text-xl font-bold">
                    <span>المجموع الكلي:</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-pink-600 hover:bg-pink-700 py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للمتجر
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">سلة التسوق</h1>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 md:py-12">
              <p className="text-gray-500 text-lg mb-4">سلة التسوق فارغة</p>
              <Button onClick={() => navigate('/')} className="bg-pink-600 hover:bg-pink-700">
                ابدأ التسوق
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 md:p-4 border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg mx-auto sm:mx-0"
                      />
                      <div className="flex-1 text-center sm:text-right">
                        <h3 className="font-semibold text-base md:text-lg">{item.name}</h3>
                        <p className="text-pink-600 font-bold text-sm md:text-base">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 mx-auto sm:mx-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-base md:text-lg font-bold mx-auto sm:mx-0">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 mx-auto sm:mx-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg md:text-xl font-bold">المجموع الكلي:</span>
                  <span className="text-xl md:text-2xl font-bold text-pink-600">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="flex-1 py-3"
                  >
                    إفراغ السلة
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 py-3"
                  >
                    إتمام الشراء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
