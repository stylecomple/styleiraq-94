import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { ProductOption } from '@/types';

interface ProductOptionsManagerProps {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
  mainProductPrice: number;
}

const ProductOptionsManager = ({ options, onChange, mainProductPrice }: ProductOptionsManagerProps) => {
  const [newOption, setNewOption] = useState<ProductOption>({ name: '', price: undefined });

  const addOption = () => {
    if (!newOption.name.trim()) return;
    
    const updatedOptions = [...options, { ...newOption }];
    onChange(updatedOptions);
    setNewOption({ name: '', price: undefined });
  };

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    onChange(updatedOptions);
  };

  const updateOption = (index: number, field: keyof ProductOption, value: string | number) => {
    const updatedOptions = options.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    );
    onChange(updatedOptions);
  };

  const getDisplayPrice = (option: ProductOption) => {
    return option.price || mainProductPrice;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">الخيارات المتاحة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Options */}
        {options.map((option, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor={`option-name-${index}`}>اسم الخيار</Label>
              <Input
                id={`option-name-${index}`}
                value={option.name}
                onChange={(e) => updateOption(index, 'name', e.target.value)}
                placeholder="مثال: أحمر، كبير، إلخ"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`option-price-${index}`}>السعر (اتركه فارغاً لاستخدام السعر الأساسي)</Label>
              <Input
                id={`option-price-${index}`}
                type="number"
                value={option.price || ''}
                onChange={(e) => updateOption(index, 'price', e.target.value ? Number(e.target.value) : undefined)}
                placeholder={`السعر الأساسي: ${mainProductPrice} د.ع`}
              />
            </div>
            <div className="text-sm text-gray-600 min-w-[100px]">
              السعر النهائي: {getDisplayPrice(option)} د.ع
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeOption(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {/* Add New Option */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">إضافة خيار جديد</h4>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="new-option-name">اسم الخيار</Label>
              <Input
                id="new-option-name"
                value={newOption.name}
                onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                placeholder="مثال: أحمر، كبير، إلخ"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="new-option-price">السعر (اختياري)</Label>
              <Input
                id="new-option-price"
                type="number"
                value={newOption.price || ''}
                onChange={(e) => setNewOption({ ...newOption, price: e.target.value ? Number(e.target.value) : undefined })}
                placeholder={`السعر الأساسي: ${mainProductPrice} د.ع`}
              />
            </div>
            <Button
              type="button"
              onClick={addOption}
              disabled={!newOption.name.trim()}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              إضافة
            </Button>
          </div>
        </div>

        {options.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            لم يتم إضافة أي خيارات بعد
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductOptionsManager;
