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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Edit, Eye, Percent, EyeOff, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import EditProductForm from './EditProductForm';
import SearchBar from '@/components/SearchBar';
import CategorySection from '@/components/CategorySection';
import SubCategorySection from '@/components/SubCategorySection';
import { ProductOption, Product } from '@/types';

const ProductsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logChange } = useChangeLogger();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch subcategories based on selected category
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', selectedCategory)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCategory
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', searchQuery, selectedCategory, selectedSubcategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply search filter
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      // Apply category filter
      if (selectedCategory) {
        query = query.contains('categories', [selectedCategory]);
      }
      
      // Apply subcategory filter
      if (selectedSubcategory) {
        query = query.contains('subcategories', [selectedSubcategory]);
      }
      
      const { data, error } = await query;
      
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

  // Bulk discount mutation
  const bulkDiscountMutation = useMutation({
    mutationFn: async ({ productIds, discount }: { productIds: string[], discount: number }) => {
      const { error } = await supabase
        .from('products')
        .update({ discount_percentage: discount })
        .in('id', productIds);
      
      if (error) throw error;
      return { productIds, discount };
    },
    onSuccess: ({ productIds, discount }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      logChange('bulk_discount_applied', 'products', undefined, {
        product_count: productIds.length,
        discount_percentage: discount,
        product_ids: productIds
      });
      toast({
        title: 'تم تطبيق الخصم',
        description: `تم تطبيق خصم ${discount}% على ${productIds.length} منتج`,
      });
      setSelectedProducts([]);
      setDiscountPercentage('');
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: 'فشل في تطبيق الخصم',
        variant: 'destructive',
      });
    }
  });

  // Bulk inactive mutation
  const bulkInactiveMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .in('id', productIds);
      
      if (error) throw error;
      return productIds;
    },
    onSuccess: (productIds) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      logChange('bulk_products_deactivated', 'products', undefined, {
        product_count: productIds.length,
        product_ids: productIds
      });
      toast({
        title: 'تم إلغاء تفعيل المنتجات',
        description: `تم إلغاء تفعيل ${productIds.length} منتج`,
      });
      setSelectedProducts([]);
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: 'فشل في إلغاء تفعيل المنتجات',
        variant: 'destructive',
      });
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      // Check if any products have orders
      const { data: orderItems, error: checkError } = await supabase
        .from('order_items')
        .select('product_id')
        .in('product_id', productIds);
      
      if (checkError) throw new Error('فشل في التحقق من الطلبات المرتبطة');

      const productsWithOrders = orderItems?.map(item => item.product_id) || [];
      const productsToDelete = productIds.filter(id => !productsWithOrders.includes(id));
      const productsToDeactivate = productIds.filter(id => productsWithOrders.includes(id));

      // Delete products without orders
      if (productsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .in('id', productsToDelete);
        
        if (deleteError) throw new Error('فشل في حذف بعض المنتجات');
      }

      // Deactivate products with orders
      if (productsToDeactivate.length > 0) {
        const { error: deactivateError } = await supabase
          .from('products')
          .update({ is_active: false })
          .in('id', productsToDeactivate);
        
        if (deactivateError) throw new Error('فشل في إلغاء تفعيل بعض المنتجات');
      }

      return { deleted: productsToDelete, deactivated: productsToDeactivate };
    },
    onSuccess: ({ deleted, deactivated }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      
      if (deleted.length > 0) {
        logChange('bulk_products_deleted', 'products', undefined, {
          product_count: deleted.length,
          product_ids: deleted
        });
      }
      
      if (deactivated.length > 0) {
        logChange('bulk_products_deactivated', 'products', undefined, {
          product_count: deactivated.length,
          product_ids: deactivated,
          reason: 'Products had existing orders'
        });
      }

      let message = '';
      if (deleted.length > 0 && deactivated.length > 0) {
        message = `تم حذف ${deleted.length} منتج وإلغاء تفعيل ${deactivated.length} منتج (مرتبط بطلبات)`;
      } else if (deleted.length > 0) {
        message = `تم حذف ${deleted.length} منتج`;
      } else if (deactivated.length > 0) {
        message = `تم إلغاء تفعيل ${deactivated.length} منتج (مرتبط بطلبات)`;
      }

      toast({
        title: 'تمت العملية',
        description: message,
      });
      setSelectedProducts([]);
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف المنتجات',
        variant: 'destructive',
      });
    }
  });

  // Handle individual product operations
  const deleteProductMutation = useMutation({
    mutationFn: async (product: any) => {
      console.log('Starting product deletion process for:', product.id);
      
      try {
        const { data: orderItems, error: checkError } = await supabase
          .from('order_items')
          .select('id')
          .eq('product_id', product.id);
        
        if (checkError) {
          throw new Error('فشل في التحقق من الطلبات المرتبطة بالمنتج');
        }

        if (orderItems && orderItems.length > 0) {
          const { error: deactivateError } = await supabase
            .from('products')
            .update({ is_active: false })
            .eq('id', product.id);
          
          if (deactivateError) {
            throw new Error('فشل في إلغاء تفعيل المنتج');
          }

          await logChange('product_deactivated', 'product', product.id, {
            product_name: product.name,
            product_price: product.price,
            reason: 'Product has existing orders, deactivated instead of deleted'
          });

          return { ...product, deleted: false, deactivated: true };
        }

        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
        
        if (deleteError) {
          throw new Error('فشل في حذف المنتج من قاعدة البيانات');
        }

        await logChange('product_deleted', 'product', product.id, {
          product_name: product.name,
          product_price: product.price
        });

        return { ...product, deleted: true, deactivated: false };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (result) => {
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
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة المنتج',
        variant: 'destructive',
      });
    }
  });

  const handleSelectAll = () => {
    if (selectedProducts.length === products?.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products?.map(p => p.id) || []);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkDiscount = () => {
    const discount = parseInt(discountPercentage);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال نسبة خصم صحيحة (0-100)',
        variant: 'destructive',
      });
      return;
    }
    
    bulkDiscountMutation.mutate({ productIds: selectedProducts, discount });
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when category changes
  };

  const handleSubcategorySelect = (subcategoryId: string | null) => {
    setSelectedSubcategory(subcategoryId);
  };

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
    
    if (options.length > 0 && typeof options[0] === 'string') {
      return (options as string[]).slice(0, 3).join(', ') + (options.length > 3 ? '...' : '');
    }
    
    const optionStrings = (options as ProductOption[]).slice(0, 3).map(option => {
      const price = option.price || mainPrice;
      return `${option.name} (${formatPrice(price)})`;
    });
    
    return optionStrings.join(', ') + (options.length > 3 ? '...' : '');
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

      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            تصفية
          </Button>
        </div>

        {showFilters && (
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <CategorySection
              categories={categories || []}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
            
            {selectedCategory && subcategories && subcategories.length > 0 && (
              <SubCategorySection
                subcategories={subcategories}
                selectedSubcategory={selectedSubcategory}
                onSubcategorySelect={handleSubcategorySelect}
              />
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-muted p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              تم تحديد {selectedProducts.length} منتج
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedProducts([])}
            >
              إلغاء التحديد
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Bulk Discount */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="نسبة الخصم %"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="w-32"
                min="0"
                max="100"
              />
              <Button
                onClick={handleBulkDiscount}
                disabled={!discountPercentage || bulkDiscountMutation.isPending}
                size="sm"
                className="flex items-center gap-2"
              >
                <Percent className="w-4 h-4" />
                تطبيق خصم
              </Button>
            </div>

            {/* Bulk Inactive */}
            <Button
              onClick={() => bulkInactiveMutation.mutate(selectedProducts)}
              disabled={bulkInactiveMutation.isPending}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              إلغاء التفعيل
            </Button>

            {/* Bulk Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                  حذف المحددة
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد من حذف {selectedProducts.length} منتج؟ 
                    المنتجات المرتبطة بطلبات سيتم إلغاء تفعيلها بدلاً من حذفها.
                    هذا الإجراء لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => bulkDeleteMutation.mutate(selectedProducts)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right w-12">
                <Checkbox
                  checked={selectedProducts.length === products?.length && products?.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
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
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleSelectProduct(product.id)}
                  />
                </TableCell>
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deleteProductMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف منتج "{product.name}"؟ 
                            إذا كان هذا المنتج مرتبط بطلبات، سيتم إلغاء تفعيله بدلاً من حذفه.
                            هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteProductMutation.mutate(product)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
