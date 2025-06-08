
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Edit2, Check, ChevronDown, ChevronRight } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Subcategory {
  id: string;
  name: string;
  icon: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: Subcategory[];
}

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  onClose: () => void;
}

const CategoryManager = ({ categories, onCategoriesChange, onClose }: CategoryManagerProps) => {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', icon: '', parentId: '' });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [editCategoryData, setEditCategoryData] = useState({ name: '', icon: '' });
  const [editSubcategoryData, setEditSubcategoryData] = useState({ name: '', icon: '' });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
        icon: newCategory.icon,
        subcategories: []
      }
    ];

    onCategoriesChange(updatedCategories);
    setNewCategory({ name: '', icon: '' });
    
    toast({
      title: 'تم إضافة الفئة',
      description: 'تم إضافة الفئة الجديدة بنجاح',
    });
  };

  const addSubcategory = () => {
    if (!newSubcategory.name.trim() || !newSubcategory.icon || !newSubcategory.parentId) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الفئة الفرعية واختيار إيموجي والفئة الرئيسية',
        variant: 'destructive',
      });
      return;
    }

    const subcategoryId = `${newSubcategory.parentId}_${newSubcategory.name.toLowerCase().replace(/\s+/g, '_')}`;
    
    const updatedCategories = categories.map(cat => {
      if (cat.id === newSubcategory.parentId) {
        const existingSubcategories = cat.subcategories || [];
        
        if (existingSubcategories.some(sub => sub.id === subcategoryId)) {
          toast({
            title: 'خطأ',
            description: 'هذه الفئة الفرعية موجودة بالفعل',
            variant: 'destructive',
          });
          return cat;
        }

        return {
          ...cat,
          subcategories: [
            ...existingSubcategories,
            {
              id: subcategoryId,
              name: newSubcategory.name.trim(),
              icon: newSubcategory.icon
            }
          ]
        };
      }
      return cat;
    });

    onCategoriesChange(updatedCategories);
    setNewSubcategory({ name: '', icon: '', parentId: '' });
    
    toast({
      title: 'تم إضافة الفئة الفرعية',
      description: 'تم إضافة الفئة الفرعية الجديدة بنجاح',
    });
  };

  const startEditingCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditCategoryData({ name: category.name, icon: category.icon });
  };

  const saveEditCategory = () => {
    if (!editCategoryData.name.trim() || !editCategoryData.icon) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الفئة واختيار إيموجي',
        variant: 'destructive',
      });
      return;
    }

    const updatedCategories = categories.map(cat => 
      cat.id === editingCategory 
        ? { ...cat, name: editCategoryData.name.trim(), icon: editCategoryData.icon }
        : cat
    );

    onCategoriesChange(updatedCategories);
    setEditingCategory(null);
    setEditCategoryData({ name: '', icon: '' });
    
    toast({
      title: 'تم تحديث الفئة',
      description: 'تم تحديث الفئة بنجاح',
    });
  };

  const startEditingSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory.id);
    setEditSubcategoryData({ name: subcategory.name, icon: subcategory.icon });
  };

  const saveEditSubcategory = (categoryId: string) => {
    if (!editSubcategoryData.name.trim() || !editSubcategoryData.icon) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الفئة الفرعية واختيار إيموجي',
        variant: 'destructive',
      });
      return;
    }

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories?.map(sub => 
            sub.id === editingSubcategory
              ? { ...sub, name: editSubcategoryData.name.trim(), icon: editSubcategoryData.icon }
              : sub
          ) || []
        };
      }
      return cat;
    });

    onCategoriesChange(updatedCategories);
    setEditingSubcategory(null);
    setEditSubcategoryData({ name: '', icon: '' });
    
    toast({
      title: 'تم تحديث الفئة الفرعية',
      description: 'تم تحديث الفئة الفرعية بنجاح',
    });
  };

  const deleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    onCategoriesChange(updatedCategories);
    
    toast({
      title: 'تم حذف الفئة',
      description: 'تم حذف الفئة وجميع فئاتها الفرعية بنجاح',
    });
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories?.filter(sub => sub.id !== subcategoryId) || []
        };
      }
      return cat;
    });

    onCategoriesChange(updatedCategories);
    
    toast({
      title: 'تم حذف الفئة الفرعية',
      description: 'تم حذف الفئة الفرعية بنجاح',
    });
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>إدارة الفئات والفئات الفرعية</CardTitle>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Main Category */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">إضافة فئة رئيسية جديدة</h3>
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
              إضافة فئة
            </Button>
          </div>
        </div>

        {/* Add Subcategory */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">إضافة فئة فرعية جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>الفئة الرئيسية</Label>
              <Select 
                value={newSubcategory.parentId} 
                onValueChange={(value) => setNewSubcategory(prev => ({ ...prev, parentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة الرئيسية" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategoryName">اسم الفئة الفرعية</Label>
              <Input
                id="subcategoryName"
                value={newSubcategory.name}
                onChange={(e) => setNewSubcategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسم الفئة الفرعية"
              />
            </div>
            <div className="space-y-2">
              <Label>الإيموجي</Label>
              <EmojiPicker
                selectedEmoji={newSubcategory.icon}
                onEmojiSelect={(emoji) => setNewSubcategory(prev => ({ ...prev, icon: emoji }))}
              />
            </div>
            <Button onClick={addSubcategory} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              إضافة فئة فرعية
            </Button>
          </div>
        </div>

        {/* Existing Categories */}
        <div className="space-y-2">
          <h3 className="font-medium">الفئات الموجودة</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-3">
                {/* Main Category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategoryExpansion(category.id)}
                      className="p-1"
                    >
                      {expandedCategories.has(category.id) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </Button>
                    
                    {editingCategory === category.id ? (
                      <div className="flex items-center gap-2">
                        <EmojiPicker
                          selectedEmoji={editCategoryData.icon}
                          onEmojiSelect={(emoji) => setEditCategoryData(prev => ({ ...prev, icon: emoji }))}
                        />
                        <Input
                          value={editCategoryData.name}
                          onChange={(e) => setEditCategoryData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-40"
                        />
                        <Button size="sm" onClick={saveEditCategory}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">({category.id})</span>
                        {category.subcategories && category.subcategories.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {category.subcategories.length} فئة فرعية
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  
                  {editingCategory !== category.id && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => startEditingCategory(category)}
                      >
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
                  )}
                </div>

                {/* Subcategories */}
                {expandedCategories.has(category.id) && category.subcategories && (
                  <div className="mt-3 ml-8 space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        {editingSubcategory === subcategory.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <EmojiPicker
                              selectedEmoji={editSubcategoryData.icon}
                              onEmojiSelect={(emoji) => setEditSubcategoryData(prev => ({ ...prev, icon: emoji }))}
                            />
                            <Input
                              value={editSubcategoryData.name}
                              onChange={(e) => setEditSubcategoryData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-40"
                            />
                            <Button size="sm" onClick={() => saveEditSubcategory(category.id)}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingSubcategory(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{subcategory.icon}</span>
                              <span className="font-medium">{subcategory.name}</span>
                              <span className="text-sm text-muted-foreground">({subcategory.id})</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => startEditingSubcategory(subcategory)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => deleteSubcategory(category.id, subcategory.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
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
