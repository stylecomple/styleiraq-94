
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Edit2, Check } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

const CategoryManager = ({ categories, onCategoriesChange }: CategoryManagerProps) => {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState({ name: '', icon: '' });

  const addCategory = () => {
    if (!newCategory.name.trim() || !newCategory.icon) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الفئة واختيار إيموجي',
        variant: 'destructive',
      });
      return;
    }

    const categoryId = newCategory.name.toLowerCase().replace(/\s+/g, '_');
    
    if (categories.some(cat => cat.id === categoryId)) {
      toast({
        title: 'خطأ',
        description: 'هذه الفئة موجودة بالفعل',
        variant: 'destructive',
      });
      return;
    }

    const updatedCategories = [
      ...categories,
      {
        id: categoryId,
        name: newCategory.name.trim(),
        icon: newCategory.icon
      }
    ];

    onCategoriesChange(updatedCategories);
    setNewCategory({ name: '', icon: '' });
    
    toast({
      title: 'تم إضافة الفئة',
      description: 'تم إضافة الفئة الجديدة بنجاح',
    });
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingCategory({ name: category.name, icon: category.icon });
  };

  const saveEdit = () => {
    if (!editingCategory.name.trim() || !editingCategory.icon) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الفئة واختيار إيموجي',
        variant: 'destructive',
      });
      return;
    }

    const updatedCategories = categories.map(cat => 
      cat.id === editingId 
        ? { ...cat, name: editingCategory.name.trim(), icon: editingCategory.icon }
        : cat
    );

    onCategoriesChange(updatedCategories);
    setEditingId(null);
    setEditingCategory({ name: '', icon: '' });
    
    toast({
      title: 'تم تحديث الفئة',
      description: 'تم تحديث الفئة بنجاح',
    });
  };

  const deleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    onCategoriesChange(updatedCategories);
    
    toast({
      title: 'تم حذف الفئة',
      description: 'تم حذف الفئة بنجاح',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة الفئات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* إضافة فئة جديدة */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">إضافة فئة جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="categoryName">اسم الفئة</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسم الفئة"
              />
            </div>
            <div className="space-y-2">
              <Label>الإيموجي</Label>
              <div className="flex gap-2">
                <EmojiPicker
                  selectedEmoji={newCategory.icon}
                  onEmojiSelect={(emoji) => setNewCategory(prev => ({ ...prev, icon: emoji }))}
                />
                <span className="text-sm text-muted-foreground self-center">
                  {newCategory.icon ? `المحدد: ${newCategory.icon}` : 'لم يتم اختيار إيموجي'}
                </span>
              </div>
            </div>
            <Button onClick={addCategory} className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              إضافة
            </Button>
          </div>
        </div>

        {/* قائمة الفئات الموجودة */}
        <div className="space-y-2">
          <h3 className="font-medium">الفئات الموجودة</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                {editingId === category.id ? (
                  <div className="flex items-center gap-3 flex-1">
                    <Input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                      className="max-w-xs"
                    />
                    <EmojiPicker
                      selectedEmoji={editingCategory.icon}
                      onEmojiSelect={(emoji) => setEditingCategory(prev => ({ ...prev, icon: emoji }))}
                    />
                    <Button size="sm" onClick={saveEdit}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">({category.id})</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEditing(category)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteCategory(category.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
