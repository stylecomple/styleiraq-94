
import React from 'react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          مجمع ستايل العامرية
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          متجركم المتكامل لجميع احتياجاتكم من المكياج والعطور والورد والمستلزمات المنزلية
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-3 text-lg"
          >
            تسوق الآن
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-pink-600 px-8 py-3 text-lg"
          >
            تصفح المنتجات
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
