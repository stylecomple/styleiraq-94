import React, { useState } from 'react';
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
import { Trash2, Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import EditProductForm from './EditProductForm';
import { ProductOption, Product } from '@/types';

const ProductsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logChange } = useChangeLogger();
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform raw database data to match Product interface
      return data.map(rawProduct => {
        // Handle legacy colors field - convert to options format
        const options = (rawProduct as any).options || 
          ((rawProduct as any).colors ? (rawProduct as any).colors.map((color: string) => ({ name: color, price: undefined })) : []);
        
        // Ensure subcategories field exists
        const subcategories = (rawProduct as any).subcategories || [];

        return {
          ...rawProduct,
          options,
          subcategories
        } as Product;
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (product: any) => {
      console.log('Starting product deletion process for:', product.id);
      
      try {
        // First, check if product exists in any orders
        const { data: orderItems, error: checkError } = await supabase
          .from('order_items')
          .select('id')
          .eq('product_id', product.id);
        
        if (checkError) {
          console.error('Error checking order items:', checkError);
          throw new Error('فشل في التحقق من الطلبات المرتبطة بالمنتج');
        }

        // If product has order items, we can't delete it physically
        if (orderItems && orderItems.length > 0) {
          console.log('Product has existing orders, deactivating instead of deleting');
          // Instead of deleting, we'll deactivate the product
          const { error: deactivateError } = await supabase
            .from('products')
            .update({ is_active: false })
            .eq('id', product.id);
          
          if (deactivateError) {
            console.error('Error deactivating product:', deactivateError);
            throw new Error('فشل في إلغاء تفعيل المنتج');
          }

          // Log the change as deactivation instead of deletion
          await logChange('product_deactivated', 'product', product.id, {
            product_name: product.name,
            product_price: product.price,
            reason: 'Product has existing orders, deactivated instead of deleted'
          });

          return { ...product, deleted: false, deactivated: true };
        }

        // If no order items exist, we can safely delete the product
        console.log('No orders found, proceeding with deletion');
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
        
        if (deleteError) {
          console.error('Error deleting product:', deleteError);
          throw new Error('فشل في حذف المنتج من قاعدة البيانات');
        }

        // Log the change
        await logChange('product_deleted', 'product', product.id, {
          product_name: product.name,
          product_price: product.price
        });

        return { ...product, deleted: true, deactivated: false };
      } catch (error) {
        console.error('Error in deleteProductMutation:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      // Force refresh the products list
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.refetchQueries({ queryKey: ['admin-products'] });
      
      if (result.deactivated) {
        toast({
          title: 'تم إلغاء تفعيل المنتج',
          description: `تم إلغاء تفعيل ${result.name} لأنه مرتبط بطلبات موجودة`,
        });
      } else {
        toast({
          title: 'تم حذف المنتج',
          description: `تم حذف ${result.name} بنجاح`,
        });
      }
    },
    onError: (error: any) => {
      console.error('Error in deleteProductMutation onError:', error);
      const errorMessage = error.message || 'فشل في حذف المنتج';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });

  const toggleProductStatus = useMutation({
    mutationFn: async ({ id, is_active, name }: { id: string; is_active: boolean; name: string }) => {
      const newStatus = !is_active;
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', id);
      
      if (error) throw error;

      // Log the change
      await logChange(
        newStatus ? 'product_activated' : 'product_deactivated',
        'product',
        id,
        { product_name: name, new_status: newStatus }
      );

      return { id, newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: 'تم تحديث حالة المنتج',
        description: 'تم تحديث حالة المنتج بنجاح',
      });
    },
    onError: (error: any) => {
      console.error('Error toggling product status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة المنتج',
        variant: 'destructive',
      });
    }
  });

  const categoryLabels = {
    makeup: 'مكياج',
    perfumes: 'عطور',
    flowers: 'ورد',
    home: 'مستلزمات منزلية',
    personal_care: 'عناية شخصية',
    exclusive_offers: 'العروض الحصرية'
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  const formatOptions = (options: ProductOption[] | string[] | null, mainPrice: number) => {
    if (!options || !Array.isArray(options)) return 'لا توجد خيارات';
    
    // Handle old colors format (array of strings)
    if (options.length > 0 && typeof options[0] === 'string') {
      return (options as string[]).slice(0, 3).join(', ') + (options.length > 3 ? '...' : '');
    }
    
    // Handle new options format (array of objects)
    const optionStrings = (options as ProductOption[]).slice(0, 3).map(option => {
      const price = option.price || mainPrice;
      return `${option.name} (${formatPrice(price)})`;
    });
    
    return optionStrings.join(', ') + (options.length > 3 ? '...' : '');
  };

  const handleDeleteProduct = (product: any) => {
    console.log('Delete button clicked for product:', product.id);
    deleteProductMutation.mutate(product);
  };

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      {editingProduct && (
        <EditProductForm 
          product={editingProduct} 
          onClose={() => setEditingProduct(null)} 
        />
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الصورة</TableHead>
              <TableHead className="text-right">اسم المنتج</TableHead>
              <TableHead className="text-right">الفئات</TableHead>
              <TableHead className="text-right">السعر</TableHead>
              <TableHead className="text-right">الخيارات المتاحة</TableHead>
              <TableHead className="text-right">المخزون</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.cover_image || '/placeholder.svg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.categories?.map((category: string) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {categoryLabels[category as keyof typeof categoryLabels] || category}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={formatOptions(product.options, product.price)}>
                  {formatOptions(product.options, product.price)}
                </TableCell>
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>
                  <Badge 
                    variant={product.is_active ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleProductStatus.mutate({ 
                      id: product.id, 
                      is_active: product.is_active,
                      name: product.name 
                    })}
                  >
                    {product.is_active ? 'نشط' : 'غير نشط'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductsManagement;
