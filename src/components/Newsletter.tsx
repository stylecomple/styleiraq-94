
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <section className="relative py-20 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full animate-bounce"></div>
        <div className="absolute bottom-10 left-1/4 w-40 h-40 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-white rounded-full animate-bounce"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8">
            <Mail className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            اشترك في نشرتنا الإخبارية
          </h2>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl mb-4 text-pink-100">
            كن أول من يعلم بأحدث المنتجات والعروض الحصرية
          </p>
          
          <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto">
            احصل على خصم 10% على طلبك الأول + نصائح جمالية حصرية وعروض خاصة مباشرة في بريدك الإلكتروني
          </p>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  className="w-full px-6 py-4 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 text-lg"
                  required
                />
              </div>
              <Button
                type="submit"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Send className="w-5 h-5 ml-2" />
                اشتراك
              </Button>
            </div>
          </form>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="text-lg font-semibold mb-2">عروض حصرية</h3>
              <p className="text-white/80 text-sm">خصومات خاصة للمشتركين فقط</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="text-lg font-semibold mb-2">نصائح جمالية</h3>
              <p className="text-white/80 text-sm">أحدث اتجاهات الموضة والجمال</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold mb-2">إطلاق مبكر</h3>
              <p className="text-white/80 text-sm">كن أول من يحصل على المنتجات الجديدة</p>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-white/60 text-sm mt-8">
            نحن نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
