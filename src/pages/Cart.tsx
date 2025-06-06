
import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    address: '',
    governorate: '',
    area: '',
    phone: '',
    paymentMethod: 'cash'
  });

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
    setShowCheckout(true);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderDetails.address || !orderDetails.governorate || !orderDetails.area || !orderDetails.phone) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically send the order to your backend
    console.log('Order submitted:', {
      items,
      orderDetails,
      total: getTotalPrice()
    });

    toast({
      title: "تم إرسال الطلب",
      description: "سيتم التواصل معك قريباً لتأكيد الطلب"
    });

    clearCart();
    navigate('/');
  };

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCheckout(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للسلة
            </Button>
            <h1 className="text-2xl font-bold">إتمام الشراء</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      value={orderDetails.address}
                      onChange={(e) => setOrderDetails({...orderDetails, address: e.target.value})}
                      placeholder="أدخل العنوان بالتفصيل"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="governorate">المحافظة</Label>
                      <Input
                        id="governorate"
                        value={orderDetails.governorate}
                        onChange={(e) => setOrderDetails({...orderDetails, governorate: e.target.value})}
                        placeholder="المحافظة"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="area">المنطقة السكنية</Label>
                      <Input
                        id="area"
                        value={orderDetails.area}
                        onChange={(e) => setOrderDetails({...orderDetails, area: e.target.value})}
                        placeholder="المنطقة السكنية"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم التلفون</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={orderDetails.phone}
                      onChange={(e) => setOrderDetails({...orderDetails, phone: e.target.value})}
                      placeholder="07xxxxxxxx"
                      required
                    />
                  </div>

                  <div>
                    <Label>طريقة الدفع</Label>
                    <RadioGroup 
                      value={orderDetails.paymentMethod} 
                      onValueChange={(value) => setOrderDetails({...orderDetails, paymentMethod: value})}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash">الدفع عند الاستلام</Label>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value="zaincash" id="zaincash" />
                        <Label htmlFor="zaincash">زين كاش</Label>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value="visa" id="visa" />
                        <Label htmlFor="visa">فيزا كارد</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>المجموع الكلي:</span>
                    <span>{getTotalPrice().toLocaleString()} دينار</span>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700">
                  تأكيد الطلب
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للمتجر
          </Button>
          <h1 className="text-3xl font-bold">سلة التسوق</h1>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">سلة التسوق فارغة</p>
              <Button onClick={() => navigate('/')} className="bg-pink-600 hover:bg-pink-700">
                ابدأ التسوق
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-pink-600 font-bold">{item.price.toLocaleString()} دينار</p>
                      </div>
                      <div className="flex items-center gap-2">
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
                      <div className="text-lg font-bold">
                        {(item.price * item.quantity).toLocaleString()} دينار
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">المجموع الكلي:</span>
                  <span className="text-2xl font-bold text-pink-600">
                    {getTotalPrice().toLocaleString()} دينار
                  </span>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="flex-1"
                  >
                    إفراغ السلة
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    className="flex-1 bg-pink-600 hover:bg-pink-700"
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
