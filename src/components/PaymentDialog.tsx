
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Smartphone, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: 'visa_card' | 'zain_cash' | null;
  orderData: {
    orderId: string;
    totalAmount: number;
    items: any[];
  } | null;
  onPaymentSuccess: () => void;
}

const PaymentDialog = ({ isOpen, onClose, paymentMethod, orderData, onPaymentSuccess }: PaymentDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    // Visa Card fields
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    // Zain Cash fields
    phoneNumber: '',
    pin: ''
  });

  // Don't render if orderData is null
  if (!orderData) {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateVisaCard = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = paymentData;
    
    if (!cardNumber || cardNumber.length < 16) {
      toast({
        title: "خطأ",
        description: "رقم البطاقة غير صحيح",
        variant: "destructive",
      });
      return false;
    }
    
    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      toast({
        title: "خطأ",
        description: "تاريخ الانتهاء غير صحيح (MM/YY)",
        variant: "destructive",
      });
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      toast({
        title: "خطأ",
        description: "رمز CVV غير صحيح",
        variant: "destructive",
      });
      return false;
    }
    
    if (!cardholderName.trim()) {
      toast({
        title: "خطأ",
        description: "اسم حامل البطاقة مطلوب",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const validateZainCash = () => {
    const { phoneNumber, pin } = paymentData;
    
    if (!phoneNumber || phoneNumber.length < 11) {
      toast({
        title: "خطأ",
        description: "رقم الهاتف غير صحيح",
        variant: "destructive",
      });
      return false;
    }
    
    if (!pin || pin.length < 4) {
      toast({
        title: "خطأ",
        description: "الرقم السري غير صحيح",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handlePayment = async () => {
    if (!paymentMethod || !orderData) return;

    // Validate payment data
    if (paymentMethod === 'visa_card' && !validateVisaCard()) return;
    if (paymentMethod === 'zain_cash' && !validateZainCash()) return;

    setLoading(true);
    
    try {
      // Call secure payment processing edge function
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          paymentMethod,
          paymentData: {
            ...paymentData,
            // Add security measures
            timestamp: new Date().toISOString(),
            orderId: orderData.orderId,
            amount: orderData.totalAmount
          },
          orderData
        }
      });

      if (error) {
        console.error('Payment processing error:', error);
        toast({
          title: "خطأ في الدفع",
          description: "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "تم الدفع بنجاح",
          description: "تم تأكيد طلبك وسيتم معالجته قريباً",
        });
        onPaymentSuccess();
        onClose();
      } else {
        toast({
          title: "فشل في الدفع",
          description: data?.message || "فشل في معالجة الدفع",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentMethod === 'visa_card' ? (
              <>
                <CreditCard className="w-5 h-5" />
                الدفع بالفيزا كارد
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5" />
                الدفع بزين كاش
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            أدخل بيانات الدفع لإتمام طلبك بأمان
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تفاصيل الطلب</CardTitle>
            <CardDescription>
              المبلغ الإجمالي: {orderData.totalAmount.toLocaleString()} دينار
            </CardDescription>
          </CardHeader>
        </Card>

        {paymentMethod === 'visa_card' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                بيانات البطاقة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">رقم البطاقة</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                  maxLength={19}
                  disabled={loading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    maxLength={5}
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={4}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cardholderName">اسم حامل البطاقة</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="الاسم كما يظهر على البطاقة"
                  value={paymentData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {paymentMethod === 'zain_cash' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                بيانات زين كاش
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="07XXXXXXXXX"
                  value={paymentData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={11}
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="pin">الرقم السري</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="أدخل الرقم السري"
                  value={paymentData.pin}
                  onChange={(e) => handleInputChange('pin', e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>بياناتك محمية بتشفير SSL 256-bit</span>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-pink-600 hover:bg-pink-700"
          >
            {loading ? 'جاري المعالجة...' : 'دفع الآن'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
