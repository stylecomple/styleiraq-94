
import React, { useEffect, useState } from 'react';

const MobileSplash = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content with staggered animations */}
      <div className={`text-center space-y-8 transition-all duration-1000 transform ${
        showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        {/* Logo container with advanced animations */}
        <div className="relative group">
          <div className="absolute -inset-6 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse-slow" />
          
          <div className="relative">
            {/* Rotating ring */}
            <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-white/30 rounded-full animate-spin-slow" />
            
            {/* Inner glow ring */}
            <div className="absolute inset-2 w-28 h-28 mx-auto border-2 border-white/50 rounded-full animate-ping-slow" />
            
            {/* Logo container */}
            <div className="relative w-32 h-32 mx-auto bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transform transition-all duration-700 hover:scale-110 animate-bounce-gentle">
              <img 
                src="/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png" 
                alt="Style متجر الجمال والأناقة" 
                className="w-24 h-24 object-contain animate-fade-in-scale" 
              />
            </div>
            
            {/* Floating sparkles */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce delay-100" />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce delay-300" />
            <div className="absolute top-8 -left-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-bounce delay-500" />
          </div>
        </div>
        
        {/* Title with typewriter effect */}
        <div className={`space-y-3 transition-all duration-1000 delay-300 ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <h1 className="text-5xl font-bold tracking-wide bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent animate-gradient-x">
            Style
          </h1>
          <p className="text-xl font-medium opacity-90 animate-fade-in-up delay-500">
            متجر الجمال والأناقة
          </p>
        </div>
        
        {/* Animated loading dots */}
        <div className={`flex space-x-2 justify-center transition-all duration-1000 delay-700 ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse-wave" />
          <div className="w-3 h-3 bg-white rounded-full animate-pulse-wave delay-150" />
          <div className="w-3 h-3 bg-white rounded-full animate-pulse-wave delay-300" />
        </div>

        {/* Loading text */}
        <div className={`transition-all duration-1000 delay-1000 ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <p className="text-lg font-light opacity-80 animate-fade-in-up">
            جاري التحميل...
          </p>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          <div className="w-1 h-16 bg-white/20 rounded-full animate-wave delay-0" />
          <div className="w-1 h-12 bg-white/30 rounded-full animate-wave delay-100" />
          <div className="w-1 h-20 bg-white/25 rounded-full animate-wave delay-200" />
          <div className="w-1 h-8 bg-white/35 rounded-full animate-wave delay-300" />
          <div className="w-1 h-14 bg-white/20 rounded-full animate-wave delay-400" />
        </div>
      </div>
    </div>
  );
};

export default MobileSplash;
