
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Star, Heart, Truck } from 'lucide-react';
import CountUpAnimation from './CountUpAnimation';

interface HeroProps {
  onStartShopping: () => void;
  onBrowseCollections: () => void;
  onCategoryClick: (categoryId: string) => void;
}

const Hero = ({ onStartShopping, onBrowseCollections, onCategoryClick }: HeroProps) => {
  const categories = [
    { id: 'makeup', icon: '💄', name: 'مكياج', color: 'pink' },
    { id: 'perfumes', icon: '🧴', name: 'عطور', color: 'purple' },
    { id: 'flowers', icon: '🌹', name: 'ورد', color: 'rose' },
    { id: 'home', icon: '🏠', name: 'منزلية', color: 'indigo' }
  ];

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
            {/* Badge with delivery info */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg animate-fade-in">
              <Truck className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">توصيل سريع لجميع أنحاء العراق</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold animate-scale-in">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Style
                </span>
              </h1>
              <p className="text-2xl md:text-3xl font-light text-gray-700 leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
                عالم من الجمال
                <span className="text-pink-500 animate-pulse"> ✨ </span>
                في متناول يدك
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fade-in" style={{ animationDelay: '0.6s' }}>
              اكتشف مجموعة مميزة من أفضل منتجات المكياج والعطور والعناية الشخصية من العلامات التجارية العالمية
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.9s' }}>
              <Button 
                size="lg" 
                onClick={onStartShopping}
                className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                ابدأ التسوق الآن
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={onBrowseCollections}
                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
              >
                تصفح المجموعات
              </Button>
            </div>

            {/* Animated Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-8">
              <div className="text-center group">
                <div className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform">
                  <CountUpAnimation end={1000} suffix="+" duration={2000} />
                </div>
                <div className="text-sm text-gray-500">منتج</div>
              </div>
              <div className="text-center group">
                <div className="text-2xl font-bold text-pink-600 group-hover:scale-110 transition-transform">
                  <CountUpAnimation end={500} suffix="+" duration={2300} />
                </div>
                <div className="text-sm text-gray-500">عميل سعيد</div>
              </div>
              <div className="text-center group">
                <div className="text-2xl font-bold text-indigo-600 group-hover:scale-110 transition-transform">
                  <CountUpAnimation end={24} suffix="/7" duration={1800} />
                </div>
                <div className="text-sm text-gray-500">خدمة عملاء</div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual Elements */}
          <div className="relative order-first lg:order-last">
            <div className="relative animate-fade-in" style={{ animationDelay: '0.5s' }}>
              {/* Main Circle */}
              <div className="w-80 h-80 md:w-96 md:h-96 mx-auto bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 rounded-full relative overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="text-center text-white space-y-4">
                    {/* Perfume Image */}
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white/20 backdrop-blur-sm">
                        <img 
                          src="https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/06/344777556_6977049638975843_736243410010398342_n299bac6da051fef8.jpeg"
                          alt="Perfume"
                          className="w-full h-full object-cover rounded-full transform hover:scale-110 transition-transform duration-300"
                        />
                        {/* Overlay gradient for better blend */}
                        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-purple-500/20 rounded-full"></div>
                      </div>
                      {/* Enhanced Sparkle Effects */}
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
                      <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-pink-200 rounded-full animate-ping"></div>
                      <div className="absolute top-1/2 -right-4 w-2 h-2 bg-purple-200 rounded-full animate-pulse"></div>
                      <div className="absolute top-1/4 -left-4 w-1 h-1 bg-white/80 rounded-full animate-bounce"></div>
                      {/* Floating particles */}
                      <div className="absolute -top-4 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                      <div className="absolute -bottom-4 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    <div className="text-xl font-semibold animate-pulse">انضم إلى عالمنا</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl p-4 shadow-lg animate-bounce hover:scale-110 transition-transform">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 animate-pulse" />
                  <span className="text-sm font-medium">منتجات طبيعية</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-lg animate-pulse hover:scale-110 transition-transform">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 animate-spin" />
                  <span className="text-sm font-medium">جودة عالية</span>
                </div>
              </div>

              <div className="absolute top-1/2 -right-8 bg-white rounded-xl p-3 shadow-lg animate-bounce hover:rotate-12 transition-transform">
                <div className="text-2xl">🧴</div>
              </div>

              <div className="absolute top-1/4 -left-8 bg-white rounded-xl p-3 shadow-lg animate-pulse hover:-rotate-12 transition-transform">
                <div className="text-2xl">✨</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Categories Preview with Navigation */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="group cursor-pointer animate-fade-in" 
              style={{ animationDelay: `${1.2 + index * 0.2}s` }}
              onClick={() => onCategoryClick(category.id)}
            >
              <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-${category.color}-100`}>
                <div className="text-4xl mb-3 group-hover:animate-bounce">{category.icon}</div>
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
