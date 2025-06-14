
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppLogo } from '@/hooks/useAppLogo';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const { logoUrl } = useAppLogo();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a password reset session
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is in password recovery mode
      }
    });
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور يجب أن تكون أكثر من 6 أحرف",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: "خطأ في تحديث كلمة المرور",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setPasswordReset(true);
        toast({
          title: "تم تحديث كلمة المرور",
          description: "تم تحديث كلمة المرور بنجاح"
        });
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.message || "حاول مرة أخرى لاحقاً",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (passwordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {/* App Logo */}
            <div className="relative mx-auto mb-4">
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-30"></div>
              <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <img 
                  src={logoUrl || "/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png"} 
                  alt="Style" 
                  className="w-14 h-14 object-contain rounded-full"
                />
              </div>
            </div>
            
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <CardTitle className="text-2xl font-bold text-green-600">
              تم تحديث كلمة المرور
            </CardTitle>
            <CardDescription>
              تم تحديث كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* App Logo */}
          <div className="relative mx-auto mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-30"></div>
            <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <img 
                src={logoUrl || "/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png"} 
                alt="Style" 
                className="w-14 h-14 object-contain rounded-full"
              />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-pink-600">
            تحديث كلمة المرور
          </CardTitle>
          <CardDescription>
            ادخل كلمة المرور الجديدة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="ادخل كلمة المرور الجديدة"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir="ltr"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  dir="ltr"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700"
              disabled={loading}
            >
              {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
