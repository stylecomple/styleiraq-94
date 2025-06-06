
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const OrdersManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            products (name, cover_image)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: 'تم تحديث حالة الطلب',
        description: 'تم تحديث حالة الطلب بنجاح',
      });
    }
  });

  const statusLabels = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} دينار`;
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right min-w-[120px]">رقم الطلب</TableHead>
              <TableHead className="text-right min-w-[100px]">المبلغ الإجمالي</TableHead>
              <TableHead className="text-right min-w-[100px]">الحالة</TableHead>
              <TableHead className="text-right min-w-[120px]">رقم الهاتف</TableHead>
              <TableHead className="text-right min-w-[200px]">عنوان الشحن</TableHead>
              <TableHead className="text-right min-w-[120px]">طريقة الدفع</TableHead>
              <TableHead className="text-right min-w-[100px]">تاريخ الطلب</TableHead>
              <TableHead className="text-right min-w-[150px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">
                  {order.id.slice(0, 8)}...
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(order.total_amount)}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={statusColors[order.status as keyof typeof statusColors]}
                  >
                    {statusLabels[order.status as keyof typeof statusLabels]}
                  </Badge>
                </TableCell>
                <TableCell>{order.phone || 'غير محدد'}</TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={order.shipping_address || 'غير محدد'}>
                    {order.shipping_address || 'غير محدد'}
                  </div>
                </TableCell>
                <TableCell>
                  {order.payment_method === 'cash' ? 'الدفع عند الاستلام' :
                   order.payment_method === 'zaincash' ? 'زين كاش' :
                   order.payment_method === 'visa' ? 'فيزا كارد' : order.payment_method}
                </TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString('ar-SA')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {order.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateOrderStatus.mutate({ 
                          orderId: order.id, 
                          status: 'processing' 
                        })}
                      >
                        معالجة
                      </Button>
                    )}
                    {order.status === 'processing' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateOrderStatus.mutate({ 
                          orderId: order.id, 
                          status: 'shipped' 
                        })}
                      >
                        شحن
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateOrderStatus.mutate({ 
                          orderId: order.id, 
                          status: 'delivered' 
                        })}
                      >
                        تسليم
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {orders?.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    طلب رقم: {order.id.slice(0, 8)}...
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <Badge 
                  className={statusColors[order.status as keyof typeof statusColors]}
                >
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="font-medium">المبلغ الإجمالي: </span>
                  <span className="text-pink-600 font-bold">{formatPrice(order.total_amount)}</span>
                </div>
                {order.phone && (
                  <div>
                    <span className="font-medium">رقم الهاتف: </span>
                    <span>{order.phone}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium">طريقة الدفع: </span>
                  <span>
                    {order.payment_method === 'cash' ? 'الدفع عند الاستلام' :
                     order.payment_method === 'zaincash' ? 'زين كاش' :
                     order.payment_method === 'visa' ? 'فيزا كارد' : order.payment_method}
                  </span>
                </div>
                {order.shipping_address && (
                  <div>
                    <span className="font-medium">عنوان الشحن: </span>
                    <span className="text-gray-600">{order.shipping_address}</span>
                  </div>
                )}
              </div>
              
              {order.order_items && order.order_items.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">المنتجات:</h4>
                  <div className="space-y-2">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <img
                          src={item.products?.cover_image || '/placeholder.svg'}
                          alt={item.products?.name || 'منتج'}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.products?.name || 'منتج غير معروف'}</p>
                          <p className="text-xs text-gray-600">
                            الكمية: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {order.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOrderStatus.mutate({ 
                      orderId: order.id, 
                      status: 'processing' 
                    })}
                    className="flex-1"
                  >
                    معالجة
                  </Button>
                )}
                {order.status === 'processing' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOrderStatus.mutate({ 
                      orderId: order.id, 
                      status: 'shipped' 
                    })}
                    className="flex-1"
                  >
                    شحن
                  </Button>
                )}
                {order.status === 'shipped' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOrderStatus.mutate({ 
                      orderId: order.id, 
                      status: 'delivered' 
                    })}
                    className="flex-1"
                  >
                    تسليم
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!orders || orders.length === 0) && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">لا توجد طلبات حالياً</p>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
