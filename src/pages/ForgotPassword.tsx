
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppLogo } from '@/hooks/useAppLogo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { logoUrl } = useAppLogo();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "خطأ في إرسال رابط الاستعادة",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setEmailSent(true);
        toast({
          title: "تم إرسال رابط الاستعادة",
          description: "تحقق من بريدك الإلكتروني لاستعادة كلمة المرور"
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

  if (emailSent) {
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
            
            <Mail className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <CardTitle className="text-2xl font-bold text-green-600">
              تم إرسال البريد الإلكتروني
            </CardTitle>
            <CardDescription>
              تحقق من بريدك الإلكتروني واتبع التعليمات لاستعادة كلمة المرور
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              العودة لتسجيل الدخول
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
            استعادة كلمة المرور
          </CardTitle>
          <CardDescription>
            ادخل بريدك الإلكتروني لاستعادة كلمة المرور
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="ادخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700"
              disabled={loading}
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => navigate('/auth')}
              className="text-gray-600 flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة لتسجيل الدخول
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
