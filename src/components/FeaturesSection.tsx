
import React from 'react';
import { Truck, Shield, Gift, Headphones, Star, Heart } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Truck,
      title: 'توصيل سريع',
      description: 'توصيل مجاني لجميع أنحاء العراق خلال 24-48 ساعة',
      color: 'pink',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Shield,
      title: 'منتجات أصلية',
      description: 'جميع منتجاتنا أصلية ومضمونة الجودة 100%',
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Gift,
      title: 'عروض حصرية',
      description: 'خصومات وعروض خاصة للعملاء المميزين',
      color: 'indigo',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Headphones,
      title: 'دعم 24/7',
      description: 'فريق خدمة العملاء متاح دائماً لمساعدتك',
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Star,
      title: 'تقييم 5 نجوم',
      description: 'أكثر من 500 عميل راضٍ عن خدماتنا',
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Heart,
      title: 'صُنع بحب',
      description: 'نختار كل منتج بعناية فائقة من أجلك',
      color: 'rose',
      gradient: 'from-rose-500 to-pink-500'
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-purple-300 rounded-full"></div>
        <div className="absolute bottom-10 left-1/4 w-40 h-40 bg-indigo-300 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              لماذا تختارنا؟
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نقدم لك أفضل تجربة تسوق للمنتجات التجميلية في العراق
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Icon Container */}
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-purple-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">1000+</div>
              <div className="text-sm text-gray-600">منتج متنوع</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-sm text-gray-600">عميل راضٍ</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">99%</div>
              <div className="text-sm text-gray-600">رضا العملاء</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-rose-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">خدمة مستمرة</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
