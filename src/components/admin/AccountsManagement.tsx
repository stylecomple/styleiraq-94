import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle, User, Mail, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const AccountsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { logChange } = useChangeLogger();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      console.log('Fetching all profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      console.log('Fetched profiles:', data?.length);
      return data;
    }
  });

  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async () => {
      console.log('Fetching all user roles...');
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      
      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }
      console.log('Fetched user roles:', data?.length);
      return data;
    }
  });

  // Combine profiles with their roles
  const accounts = React.useMemo(() => {
    if (!profiles || !userRoles) return [];
    
    return profiles.map(profile => {
      const profileRoles = userRoles.filter(role => role.user_id === profile.id);
      return {
        ...profile,
        user_roles: profileRoles
      };
    });
  }, [profiles, userRoles]);

  const deleteAccountMutation = useMutation({
    mutationFn: async (account: any) => {
      console.log('Starting account deletion for user:', account.id);
      
      // First delete all related data
      // Delete order items for this user's orders
      const { data: userOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', account.id);

      if (userOrders && userOrders.length > 0) {
        const orderIds = userOrders.map(order => order.id);
        
        // Delete order items
        const { error: orderItemsError } = await supabase
          .from('order_items')
          .delete()
          .in('order_id', orderIds);
        
        if (orderItemsError) {
          console.error('Error deleting order items:', orderItemsError);
          throw orderItemsError;
        }

        // Delete orders
        const { error: ordersError } = await supabase
          .from('orders')
          .delete()
          .eq('user_id', account.id);
        
        if (ordersError) {
          console.error('Error deleting orders:', ordersError);
          throw ordersError;
        }
      }

      // Delete user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', account.id);
      
      if (rolesError) {
        console.error('Error deleting user roles:', rolesError);
        throw rolesError;
      }

      // Delete feedback
      const { error: feedbackError } = await supabase
        .from('feedback')
        .delete()
        .eq('user_id', account.id);
      
      if (feedbackError) {
        console.error('Error deleting feedback:', feedbackError);
        throw feedbackError;
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', account.id);
      
      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw profileError;
      }

      console.log('Account deleted successfully from database');

      // Log the change
      await logChange('account_deleted_by_owner', 'user', account.id, {
        user_email: account.email,
        user_name: account.full_name,
        roles: account.user_roles?.map((r: any) => r.role) || []
      });

      return account;
    },
    onSuccess: (deletedAccount) => {
      console.log('Account deletion mutation successful, updating cache');
      
      // Force invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      
      toast({
        title: 'تم حذف الحساب',
        description: `تم حذف حساب ${deletedAccount.email} وجميع البيانات المرتبطة به بنجاح`,
      });
    },
    onError: (error) => {
      console.error('Error deleting account:', error);
      toast({
        title: 'خطأ في الحذف',
        description: 'فشل في حذف الحساب. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  });

  const getRoleColor = (roles: any[]) => {
    if (!roles || roles.length === 0) return 'bg-gray-100 text-gray-800';
    
    const roleNames = roles.map(r => r.role);
    if (roleNames.includes('owner')) return 'bg-red-100 text-red-800';
    if (roleNames.includes('admin')) return 'bg-blue-100 text-blue-800';
    if (roleNames.includes('order_manager')) return 'bg-green-100 text-green-800';
    if (roleNames.includes('products_adder')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleText = (roles: any[]) => {
    if (!roles || roles.length === 0) return 'مستخدم';
    
    const roleNames = roles.map(r => r.role);
    if (roleNames.includes('owner')) return 'مالك';
    if (roleNames.includes('admin')) return 'مدير';
    if (roleNames.includes('order_manager')) return 'مدير طلبات';
    if (roleNames.includes('products_adder')) return 'مضيف منتجات';
    return 'مستخدم';
  };

  const canDeleteAccount = (account: any) => {
    const roles = account.user_roles || [];
    const roleNames = roles.map((r: any) => r.role);
    return !roleNames.includes('owner'); // Can't delete owner accounts
  };

  const filteredAccounts = accounts?.filter(account => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      account.email?.toLowerCase().includes(search) ||
      account.full_name?.toLowerCase().includes(search) ||
      account.id.toLowerCase().includes(search)
    );
  });

  const isLoading = profilesLoading || rolesLoading;

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <p className="text-sm text-orange-700">
          تحذير: حذف الحسابات عملية لا يمكن التراجع عنها. سيتم حذف جميع البيانات المرتبطة بالحساب نهائياً.
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts?.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    {account.full_name || 'غير محدد'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {account.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(account.user_roles)}>
                    {getRoleText(account.user_roles)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {new Date(account.created_at).toLocaleDateString('ar-EG')}
                  </div>
                </TableCell>
                <TableCell>
                  {canDeleteAccount(account) ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          disabled={deleteAccountMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد حذف الحساب</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف حساب {account.email}؟ 
                            <br />
                            <strong>سيتم حذف جميع البيانات التالية نهائياً:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>الملف الشخصي</li>
                              <li>جميع الطلبات وتفاصيلها</li>
                              <li>الأدوار والصلاحيات</li>
                              <li>التقييمات والتعليقات</li>
                            </ul>
                            <br />
                            هذا الإجراء لا يمكن التراجع عنه!
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAccountMutation.mutate(account)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteAccountMutation.isPending}
                          >
                            {deleteAccountMutation.isPending ? 'جاري الحذف...' : 'حذف نهائياً'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <span className="text-muted-foreground text-sm">لا يمكن حذف المالك</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {!accounts?.length && (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد حسابات حالياً
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsManagement;
