
import React from 'react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white py-24 overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
            Style
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-pink-100 font-light leading-relaxed">
            متجركم المتكامل للجمال والأناقة
          </p>
          <p className="text-lg mb-10 text-pink-100 max-w-2xl mx-auto">
            اكتشف مجموعة واسعة من المكياج والعطور والورد والمستلزمات المنزلية بأفضل الأسعار في العراق
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-pink-600 hover:bg-pink-50 px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              ابدأ التسوق الآن
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-10 py-4 text-lg font-semibold rounded-full transition-all duration-300"
            >
              تصفح المجموعات
            </Button>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-2">💄</div>
            <p className="text-pink-100">مكياج</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🌸</div>
            <p className="text-pink-100">عطور</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🌹</div>
            <p className="text-pink-100">ورد</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🏠</div>
            <p className="text-pink-100">منزلية</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
