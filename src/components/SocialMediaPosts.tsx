
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Facebook, ExternalLink } from 'lucide-react';

const SocialMediaPosts = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            تابعونا على وسائل التواصل
          </h2>
          <p className="text-gray-600 text-lg">
            آخر المنشورات والعروض الحصرية
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Instagram Post */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Instagram className="w-6 h-6" />
                Instagram
                <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-600/20"></div>
                <div className="text-center z-10">
                  <Instagram className="w-16 h-16 text-pink-500 mb-4 mx-auto" />
                  <p className="text-gray-600 font-medium">آخر منشور Instagram</p>
                  <p className="text-sm text-gray-500 mt-2">منتجات جمال حصرية ✨</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">
                  🌟 مجموعة جديدة من منتجات العناية بالبشرة
                </p>
                <p className="text-gray-700 leading-relaxed">
                  💄 أحدث صيحات المكياج لهذا الموسم
                </p>
                <div className="flex gap-2 flex-wrap mt-3">
                  <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm">#جمال</span>
                  <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm">#مكياج</span>
                  <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm">#عناية</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facebook Post */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Facebook className="w-6 h-6" />
                Facebook
                <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-600/20"></div>
                <div className="text-center z-10">
                  <Facebook className="w-16 h-16 text-blue-500 mb-4 mx-auto" />
                  <p className="text-gray-600 font-medium">آخر منشور Facebook</p>
                  <p className="text-sm text-gray-500 mt-2">عروض حصرية وجديدة 🎉</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">
                  🎉 عرض خاص لفترة محدودة
                </p>
                <p className="text-gray-700 leading-relaxed">
                  💝 خصومات تصل إلى 30% على منتجات مختارة
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg mt-3 border border-blue-200">
                  <p className="text-blue-700 font-medium text-sm">
                    📞 اتصلوا الآن للحجز والاستفسار
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            تابعونا للحصول على آخر العروض والمنتجات الجديدة
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaPosts;
