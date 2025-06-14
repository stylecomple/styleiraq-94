
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLogo } from '@/hooks/useAppLogo';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const { user } = useAuth();
  const { logoUrl } = useAppLogo();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already verified
    if (user?.email_confirmed_at) {
      setEmailVerified(true);
    }

    // Listen for auth state changes (email verification)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          setEmailVerified(true);
          toast({
            title: "تم تأكيد البريد الإلكتروني",
            description: "تم تأكيد بريدك الإلكتروني بنجاح"
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [user]);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) {
        toast({
          title: "خطأ في إرسال البريد",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "تم إرسال البريد",
          description: "تم إرسال رابط التأكيد إلى بريدك الإلكتروني"
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

  if (emailVerified) {
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
              تم تأكيد البريد الإلكتروني
            </CardTitle>
            <CardDescription>
              تم تأكيد بريدك الإلكتروني بنجاح، يمكنك الآن استخدام التطبيق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/app/products')}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              الذهاب للمتجر
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
          
          <Mail className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-blue-600">
            تأكيد البريد الإلكتروني
          </CardTitle>
          <CardDescription>
            تحقق من بريدك الإلكتروني واضغط على رابط التأكيد لتفعيل حسابك
          </CardDescription>
          
          {user?.email && (
            <div className="mt-3 text-sm text-gray-600">
              تم إرسال رابط التأكيد إلى: <span className="font-semibold">{user.email}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                إعادة إرسال البريد
              </>
            )}
          </Button>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate('/auth')}
              className="text-gray-600"
            >
              العودة لتسجيل الدخول
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
