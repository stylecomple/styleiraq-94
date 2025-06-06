
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import ImageUploadCrop from './ImageUploadCrop';
import MultiImageUpload from './MultiImageUpload';

interface AddProductFormProps {
  onClose: () => void;
}

const AddProductForm = ({ onClose }: AddProductFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categories: [] as string[],
    cover_image: '',
    images: [] as string[],
    colors: '',
    stock_quantity: ''
  });

  const availableCategories = [
    { id: 'makeup', label: 'مكياج' },
    { id: 'perfumes', label: 'عطور' },
    { id: 'flowers', label: 'ورد' },
    { id: 'home', label: 'مستلزمات منزلية' },
    { id: 'personal_care', label: 'عناية شخصية' },
    { id: 'exclusive_offers', label: 'العروض الحصرية' }
  ];

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      console.log('Adding product with data:', productData);

      const colors = productData.colors 
        ? productData.colors.split('\n').filter((color: string) => color.trim()) 
        : [];

      const productToInsert = {
        name: productData.name,
        description: productData.description || null,
        price: parseInt(productData.price),
        categories: productData.categories,
        cover_image: productData.cover_image || null,
        images: productData.images,
        colors: colors,
        stock_quantity: parseInt(productData.stock_quantity) || 0
      };

      console.log('Product to insert:', productToInsert);

      const { data, error } = await supabase
        .from('products')
        .insert(productToInsert)
        .select();
      
      console.log('Insert response:', { data, error });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'تم إضافة المنتج',
        description: 'تم إضافة المنتج الجديد بنجاح',
      });
      setFormData({
        name: '',
        description: '',
        price: '',
        categories: [],
        cover_image: '',
        images: [],
        colors: '',
        stock_quantity: ''
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error adding product:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة المنتج',
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
        description: 'يرجى ملء جميع الحقول المطلوبة واختيار فئة واحدة على الأقل',
        variant: 'destructive',
      });
      return;
    }
    
    addProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryId]
        : prev.categories.filter(id => id !== categoryId)
    }));
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>إضافة منتج جديد</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          <div className="space-y-2">
            <Label>الفئات * (اختر فئة واحدة أو أكثر)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={category.id}
                    checked={formData.categories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                  />
                  <Label htmlFor={category.id} className="text-sm">
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
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

          <div className="space-y-4">
            <ImageUploadCrop
              currentImage={formData.cover_image}
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, cover_image: url }))}
              onRemove={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
              label="الصورة الرئيسية *"
            />
          </div>

          <div className="space-y-2">
            <Label>الصور الإضافية</Label>
            <MultiImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
              maxImages={5}
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
              disabled={addProductMutation.isPending}
            >
              {addProductMutation.isPending ? 'جاري الإضافة...' : 'إضافة المنتج'}
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

export default AddProductForm;
