
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

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
    category: '',
    cover_image: '',
    images: '',
    stock_quantity: ''
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const images = productData.images 
        ? productData.images.split('\n').filter((url: string) => url.trim()) 
        : [];

      const { error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
          category: productData.category,
          cover_image: productData.cover_image,
          images: images,
          stock_quantity: parseInt(productData.stock_quantity) || 0
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: 'تم إضافة المنتج',
        description: 'تم إضافة المنتج الجديد بنجاح',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة المنتج',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }
    addProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <Label htmlFor="category">الفئة *</Label>
              <Select onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="makeup">مكياج</SelectItem>
                  <SelectItem value="perfumes">عطور</SelectItem>
                  <SelectItem value="flowers">ورد</SelectItem>
                  <SelectItem value="home">مستلزمات منزلية</SelectItem>
                  <SelectItem value="personal_care">عناية شخصية</SelectItem>
                </SelectContent>
              </Select>
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
