
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Star, Heart } from 'lucide-react';

interface HeroProps {
  onStartShopping: () => void;
  onBrowseCollections: () => void;
}

const Hero = ({ onStartShopping, onBrowseCollections }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-300/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-16 w-16 h-16 bg-purple-300/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-indigo-300/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-pink-400/20 rounded-full animate-bounce"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-right space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">متجر الجمال والأناقة الأول في العراق</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Style
                </span>
              </h1>
              <p className="text-2xl md:text-3xl font-light text-gray-700 leading-relaxed">
                عالم من الجمال
                <span className="text-pink-500"> ✨ </span>
                في متناول يدك
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              اكتشف مجموعة مميزة من أفضل منتجات المكياج والعطور والعناية الشخصية من العلامات التجارية العالمية
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={onStartShopping}
                className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                ابدأ التسوق الآن
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={onBrowseCollections}
                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
              >
                تصفح المجموعات
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">1000+</div>
                <div className="text-sm text-gray-500">منتج</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">500+</div>
                <div className="text-sm text-gray-500">عميل سعيد</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">24/7</div>
                <div className="text-sm text-gray-500">خدمة عملاء</div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual Elements */}
          <div className="relative order-first lg:order-last">
            <div className="relative">
              {/* Main Circle */}
              <div className="w-80 h-80 md:w-96 md:h-96 mx-auto bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 rounded-full relative overflow-hidden shadow-2xl">
                <div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="text-center text-white space-y-4">
                    <div className="text-6xl">💄</div>
                    <div className="text-xl font-semibold">جمالك يبدأ هنا</div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl p-4 shadow-lg animate-pulse">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">منتجات طبيعية</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-lg animate-bounce">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium">جودة عالية</span>
                </div>
              </div>

              <div className="absolute top-1/2 -right-8 bg-white rounded-xl p-3 shadow-lg">
                <div className="text-2xl">🧴</div>
              </div>

              <div className="absolute top-1/4 -left-8 bg-white rounded-xl p-3 shadow-lg">
                <div className="text-2xl">✨</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Preview */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '💄', name: 'مكياج', color: 'pink' },
            { icon: '🧴', name: 'عطور', color: 'purple' },
            { icon: '🌹', name: 'ورد', color: 'rose' },
            { icon: '🏠', name: 'منزلية', color: 'indigo' }
          ].map((category, index) => (
            <div key={index} className="group cursor-pointer">
              <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-${category.color}-100`}>
                <div className="text-4xl mb-3">{category.icon}</div>
                <p className={`font-medium text-${category.color}-700`}>{category.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
