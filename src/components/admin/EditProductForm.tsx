
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface EditProductFormProps {
  product: any;
  onClose: () => void;
}

const EditProductForm = ({ product, onClose }: EditProductFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price?.toString() || '',
    categories: product.categories || [],
    cover_image: product.cover_image || '',
    images: product.images?.join('\n') || '',
    colors: product.colors?.join('\n') || '',
    stock_quantity: product.stock_quantity?.toString() || '',
    discount_percentage: product.discount_percentage?.toString() || '0'
  });

  const availableCategories = [
    { value: 'makeup', label: 'مكياج' },
    { value: 'perfumes', label: 'عطور' },
    { value: 'flowers', label: 'ورد' },
    { value: 'home', label: 'مستلزمات منزلية' },
    { value: 'personal_care', label: 'عناية شخصية' },
    { value: 'exclusive_offers', label: 'العروض الحصرية' }
  ];

  const updateProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      console.log('Updating product with data:', productData);
      
      const images = productData.images 
        ? productData.images.split('\n').filter((url: string) => url.trim()) 
        : [];

      const colors = productData.colors 
        ? productData.colors.split('\n').filter((color: string) => color.trim()) 
        : [];

      const productToUpdate = {
        name: productData.name,
        description: productData.description || null,
        price: parseInt(productData.price),
        categories: productData.categories,
        cover_image: productData.cover_image || null,
        images: images,
        colors: colors,
        stock_quantity: parseInt(productData.stock_quantity) || 0,
        discount_percentage: parseInt(productData.discount_percentage) || 0
      };

      console.log('Product to update:', productToUpdate);

      const { data, error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', product.id)
        .select();
      
      console.log('Update response:', { data, error });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'تم تحديث المنتج',
        description: 'تم تحديث المنتج بنجاح',
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث المنتج',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!formData.name || !formData.price || formData.categories.length === 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }
    
    updateProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (categoryValue: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryValue]
        : prev.categories.filter(cat => cat !== categoryValue)
    }));
  };

  const isExclusiveOffer = formData.categories.includes('exclusive_offers');

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>تعديل المنتج</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المنتج *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="أدخل اسم المنتج"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">السعر (د.ع) *</Label>
              <Input
                id="price"
                type="number"
                step="1"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">الكمية المتوفرة</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                placeholder="0"
              />
            </div>

            {isExclusiveOffer && (
              <div className="space-y-2">
                <Label htmlFor="discount">نسبة الخصم (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>الفئات *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableCategories.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.value}
                    checked={formData.categories.includes(category.value)}
                    onCheckedChange={(checked) => handleCategoryChange(category.value, checked as boolean)}
                  />
                  <Label 
                    htmlFor={category.value} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="أدخل وصف المنتج"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">رابط الصورة الرئيسية</Label>
            <Input
              id="cover_image"
              value={formData.cover_image}
              onChange={(e) => handleInputChange('cover_image', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">روابط الصور الإضافية (سطر واحد لكل رابط)</Label>
            <Textarea
              id="images"
              value={formData.images}
              onChange={(e) => handleInputChange('images', e.target.value)}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="colors">الألوان المتوفرة (سطر واحد لكل لون)</Label>
            <Textarea
              id="colors"
              value={formData.colors}
              onChange={(e) => handleInputChange('colors', e.target.value)}
              placeholder="أحمر&#10;أزرق&#10;أخضر"
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="bg-pink-600 hover:bg-pink-700"
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? 'جاري التحديث...' : 'تحديث المنتج'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProductForm;
