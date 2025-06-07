
import React from 'react';
import CountUpAnimation from './CountUpAnimation';

const AnimatedStats = () => {
  const stats = [
    { number: 1000, suffix: '+', label: 'منتج متنوع', color: 'text-pink-600' },
    { number: 500, suffix: '+', label: 'عميل راضٍ', color: 'text-purple-600' },
    { number: 99, suffix: '%', label: 'رضا العملاء', color: 'text-indigo-600' },
    { number: 24, suffix: '/7', label: 'خدمة مستمرة', color: 'text-rose-600' }
  ];

  return (
    <div className="mt-20 bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-8 relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0">
        <div className="absolute top-4 left-4 w-16 h-16 bg-pink-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 right-4 w-20 h-20 bg-purple-200/30 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-indigo-200/30 rounded-full animate-ping"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="group transform hover:scale-105 transition-all duration-300"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className={`text-3xl font-bold ${stat.color} mb-2 group-hover:animate-pulse`}>
              <CountUpAnimation 
                end={stat.number} 
                suffix={stat.suffix}
                duration={2500 + index * 300}
              />
            </div>
            <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedStats;
