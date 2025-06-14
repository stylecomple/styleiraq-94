import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, User, Package, ShoppingCart, Store } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ChangesLogPanel = () => {
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');

  const { data: changes, isLoading } = useQuery({
    queryKey: ['changes-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('changes_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) throw error;
      return data;
    }
  });

  const getActionColor = (actionType: string) => {
    if (actionType.includes('added') || actionType.includes('created')) {
      return 'bg-green-100 text-green-800';
    }
    if (actionType.includes('deleted') || actionType.includes('removed')) {
      return 'bg-red-100 text-red-800';
    }
    if (actionType.includes('updated') || actionType.includes('changed')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (actionType.includes('store_closed')) {
      return 'bg-orange-100 text-orange-800';
    }
    if (actionType.includes('store_opened')) {
      return 'bg-emerald-100 text-emerald-800';
    }
    if (actionType.includes('account_deleted')) {
      return 'bg-red-200 text-red-900';
    }
    if (actionType.includes('order_deleted')) {
      return 'bg-red-150 text-red-850';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'product': return <Package className="w-4 h-4" />;
      case 'order': return <ShoppingCart className="w-4 h-4" />;
      case 'store': return <Store className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const filteredChanges = changes?.filter(change => {
    const matchesAction = filterAction === 'all' || change.action_type.includes(filterAction);
    const matchesEntity = filterEntity === 'all' || change.entity_type === filterEntity;
    
    return matchesAction && matchesEntity;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            سجل التغييرات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          سجل التغييرات
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="نوع العملية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع العمليات</SelectItem>
              <SelectItem value="added">إضافة</SelectItem>
              <SelectItem value="updated">تحديث</SelectItem>
              <SelectItem value="deleted">حذف</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterEntity} onValueChange={setFilterEntity}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="نوع الكائن" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الكائنات</SelectItem>
              <SelectItem value="product">منتج</SelectItem>
              <SelectItem value="order">طلب</SelectItem>
              <SelectItem value="user">مستخدم</SelectItem>
              <SelectItem value="store">متجر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredChanges?.map((change) => (
            <div key={change.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getEntityIcon(change.entity_type)}
                  <span className="font-medium">{change.admin_name}</span>
                </div>
                <Badge className={getActionColor(change.action_type)}>
                  {change.action_type}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600">
                <div>النوع: {change.entity_type}</div>
                {change.entity_id && (
                  <div>المعرف: {change.entity_id}</div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">
                    {format(new Date(change.created_at), 'yyyy/MM/dd')} - {format(new Date(change.created_at), 'HH:mm:ss')}
                  </span>
                </div>
              </div>
              
              {change.details && (
                <div className="text-xs bg-gray-50 p-2 rounded">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(change.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
          
          {!filteredChanges?.length && (
            <div className="text-center py-8 text-gray-500">
              {filterAction !== 'all' || filterEntity !== 'all' 
                ? 'لم يتم العثور على تغييرات تطابق الفلاتر'
                : 'لا توجد تغييرات مسجلة'
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChangesLogPanel;
