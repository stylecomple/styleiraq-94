
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const FeedbackForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    rating: 0,
    user_name: '',
    user_email: ''
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const feedbackData = {
        ...data,
        user_id: user?.id || null,
        user_email: data.user_email || user?.email || '',
        rating: data.rating || null
      };

      const { error } = await supabase
        .from('feedback')
        .insert([feedbackData]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'تم إرسال التعليق',
        description: 'شكراً لك! تم إرسال تعليقك بنجاح وسنقوم بمراجعته قريباً',
      });
      setFormData({
        subject: '',
        message: '',
        rating: 0,
        user_name: '',
        user_email: ''
      });
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال التعليق، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    if (!user && (!formData.user_name.trim() || !formData.user_email.trim())) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسمك وبريدك الإلكتروني',
        variant: 'destructive',
      });
      return;
    }

    submitFeedbackMutation.mutate(formData);
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= formData.rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50">
          <MessageSquare className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            إرسال تعليق
          </DialogTitle>
          <DialogDescription>
            نحن نقدر رأيك! أرسل لنا تعليقك أو اقتراحك
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <>
              <div>
                <label className="text-sm font-medium">الاسم *</label>
                <Input
                  value={formData.user_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                  placeholder="اسمك الكريم"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">البريد الإلكتروني *</label>
                <Input
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </>
          )}
          
          <div>
            <label className="text-sm font-medium">الموضوع *</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="موضوع التعليق"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">الرسالة *</label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="اكتب تعليقك هنا..."
              rows={4}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">التقييم (اختياري)</label>
            <div className="mt-2">
              {renderStars()}
            </div>
            {formData.rating > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                تقييمك: {formData.rating} من 5 نجوم
              </p>
            )}
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={submitFeedbackMutation.isPending}
              className="bg-pink-600 hover:bg-pink-700 flex-1"
            >
              {submitFeedbackMutation.isPending ? (
                'جاري الإرسال...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  إرسال التعليق
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
