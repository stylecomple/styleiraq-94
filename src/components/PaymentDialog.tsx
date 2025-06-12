
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentMethod } from '@/types';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethod | null;
  orderData: { orderId: string; totalAmount: number; items: any[] } | null;
  onPaymentSuccess: () => void;
}

const PaymentDialog = ({ isOpen, onClose, paymentMethod, orderData, onPaymentSuccess }: PaymentDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    phoneNumber: '',
    pin: ''
  });

  const handlePayment = async () => {
    if (!orderData || !user || !paymentMethod) return;

    // Validate payment data based on method
    if (paymentMethod === 'visa_card') {
      if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى ملء جميع بيانات البطاقة",
          variant: "destructive",
        });
        return;
      }
    }

    if (paymentMethod === 'zain_cash') {
      if (!paymentData.phoneNumber || !paymentData.pin) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى ملء رقم الهاتف ورقم PIN",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);
    try {
      console.log('Processing payment with method:', paymentMethod);
      console.log('Order data:', orderData);

      // Create order in database first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderData.orderId,
          user_id: user.id,
          total_amount: orderData.totalAmount,
          status: 'pending',
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: orderData.orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        selected_color: item.selectedOption || item.selectedColor
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      // Process payment through edge function
      const { data: paymentResult, error: paymentError } = await supabase.functions.invoke('process-payment', {
        body: {
          paymentMethod,
          paymentData: {
            ...paymentData,
            timestamp: new Date().toISOString()
          },
          orderData
        }
      });

      if (paymentError) {
        console.error('Payment processing error:', paymentError);
        throw new Error('فشل في معالجة الدفع');
      }

      if (paymentResult?.success) {
        toast({
          title: "تم الدفع بنجاح",
          description: `تم تأكيد الدفع. رقم المعاملة: ${paymentResult.transactionId}`,
        });
        onPaymentSuccess();
      } else {
        throw new Error(paymentResult?.message || 'فشل في معالجة الدفع');
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "خطأ في الدفع",
        description: error.message || "حدث خطأ أثناء معالجة الدفع",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentTitle = () => {
    switch (paymentMethod) {
      case 'visa_card':
        return 'دفع بالفيزا كارد';
      case 'zain_cash':
        return 'دفع بزين كاش';
      default:
        return 'الدفع';
    }
  };

  const getPaymentIcon = () => {
    switch (paymentMethod) {
      case 'visa_card':
        return <CreditCard className="w-6 h-6" />;
      case 'zain_cash':
        return <Smartphone className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  if (!paymentMethod || paymentMethod === 'cash_on_delivery') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPaymentIcon()}
            {getPaymentTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {orderData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">تفاصيل الطلب</h3>
              <p>رقم الطلب: {orderData.orderId}</p>
              <p>المبلغ الإجمالي: {orderData.totalAmount.toLocaleString()} د.ع</p>
            </div>
          )}

          {paymentMethod === 'visa_card' && (
            <>
              <div>
                <Label htmlFor="cardholderName">اسم حامل البطاقة</Label>
                <Input
                  id="cardholderName"
                  placeholder="الاسم كما يظهر على البطاقة"
                  value={paymentData.cardholderName}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="cardNumber">رقم البطاقة</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === 'zain_cash' && (
            <>
              <div>
                <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                <Input
                  id="phoneNumber"
                  placeholder="07XXXXXXXXX"
                  value={paymentData.phoneNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="pin">رقم PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="أدخل رقم PIN الخاص بك"
                  value={paymentData.pin}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, pin: e.target.value }))}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'جاري المعالجة...' : 'تأكيد الدفع'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
