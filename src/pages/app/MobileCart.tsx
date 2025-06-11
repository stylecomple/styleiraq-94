
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import MobileAppLayout from '@/components/MobileAppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCartDiscounts } from '@/hooks/useCartDiscounts';

const MobileCart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const { user } = useAuth();
  const { discountedCartItems, hasDiscounts } = useCartDiscounts(items);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  const getTotalPriceWithDiscounts = () => {
    return discountedCartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (!user) {
    return (
      <MobileAppLayout title="سلة التسوق" showBackButton={false}>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">تسجيل الدخول مطلوب</h2>
            <p className="text-gray-600 mb-6">يجب تسجيل الدخول لعرض السلة</p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <MobileAppLayout title="سلة التسوق" showBackButton={false}>
      <div className="p-4 space-y-4">
        {discountedCartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">السلة فارغة</h3>
              <p className="text-gray-500 mb-6">ابدأ بإضافة منتجات إلى سلتك</p>
              <Button onClick={() => navigate('/app/products')} className="w-full">
                تسوق الآن
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3">
              {discountedCartItems.map((item) => (
                <Card key={`${item.id}-${item.selectedOption || 'default'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        {item.selectedOption && (
                          <Badge variant="outline" className="mt-1">
                            {item.selectedOption}
                          </Badge>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {item.discountPercentage > 0 ? (
                            <>
                              <span className="text-red-600 font-bold">{formatPrice(item.price)}</span>
                              <span className="text-gray-400 line-through text-sm">{formatPrice(item.originalPrice)}</span>
                              <Badge variant="destructive" className="text-xs">
                                -{item.discountPercentage}%
                              </Badge>
                            </>
                          ) : (
                            <span className="text-gray-600">{formatPrice(item.price)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOption)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
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
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Total and Checkout */}
            <Card className="sticky bottom-4">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع:</span>
                    <span className={hasDiscounts ? "text-red-600" : ""}>
                      {formatPrice(getTotalPriceWithDiscounts())}
                    </span>
                  </div>
                  
                  {hasDiscounts && (
                    <div className="flex justify-between text-red-600">
                      <span>توفير الخصم:</span>
                      <span>
                        -{formatPrice(
                          discountedCartItems.reduce((total, item) => 
                            total + ((item.originalPrice - item.price) * item.quantity), 0
                          )
                        )}
                      </span>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
                    onClick={() => navigate('/cart')}
                  >
                    متابعة إلى الدفع
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MobileAppLayout>
  );
};

export default MobileCart;
