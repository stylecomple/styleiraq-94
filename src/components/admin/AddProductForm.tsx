import React, { useState, useEffect } from 'react';
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
import CategoryManager from './CategoryManager';

interface AddProductFormProps {
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  icon: string;
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
    stock_quantity: '',
    ignore_stock: false
  });

  const [availableCategories, setAvailableCategories] = useState<Category[]>([
    { id: 'makeup', name: 'مكياج', icon: '💄' },
    { id: 'perfumes', name: 'عطور', icon: '🌸' },
    { id: 'flowers', name: 'ورد', icon: '🌹' },
    { id: 'home', name: 'مستلزمات منزلية', icon: '🏠' },
    { id: 'personal_care', name: 'عناية شخصية', icon: '🧴' },
    { id: 'exclusive_offers', name: 'العروض الحصرية', icon: '✨' }
  ]);

  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // تحميل الفئات من localStorage عند بدء تشغيل المكون
  useEffect(() => {
    const savedCategories = localStorage.getItem('productCategories');
    if (savedCategories) {
      try {
        setAvailableCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Error loading categories from localStorage:', error);
      }
    }
  }, []);

  // حفظ الفئات في localStorage عند تغييرها
  const handleCategoriesChange = (newCategories: Category[]) => {
    setAvailableCategories(newCategories);
    localStorage.setItem('productCategories', JSON.stringify(newCategories));
  };

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
        stock_quantity: productData.ignore_stock ? null : (parseInt(productData.stock_quantity) || 0)
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
        stock_quantity: '',
        ignore_stock: false
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

    if (!formData.ignore_stock && formData.stock_quantity && parseInt(formData.stock_quantity) < 0) {
      toast({
        title: 'خطأ',
        description: 'الكمية المتوفرة يجب أن تكون رقماً موجباً',
        variant: 'destructive',
      });
      return;
    }
    
    addProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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
    <div className="space-y-6">
      {showCategoryManager && (
        <CategoryManager 
          categories={availableCategories}
          onCategoriesChange={handleCategoriesChange}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>إضافة منتج جديد</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCategoryManager(!showCategoryManager)}
            >
              إدارة الفئات
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
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
                    <Label htmlFor={category.id} className="text-sm flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="ignore_stock"
                  checked={formData.ignore_stock}
                  onCheckedChange={(checked) => handleInputChange('ignore_stock', !!checked)}
                />
                <Label htmlFor="ignore_stock" className="text-sm">
                  تجاهل تتبع المخزون (مخزون غير محدود)
                </Label>
              </div>
              
              {!formData.ignore_stock && (
                <div className="space-y-2">
                  <Label htmlFor="stock">الكمية المتوفرة</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
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
    </div>
  );
};

export default AddProductForm;
