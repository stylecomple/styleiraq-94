
import React from 'react';

const MobileSplash = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <span className="text-4xl">💄</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-wide">Style</h1>
          <p className="text-lg font-medium opacity-90">متجر الجمال والأناقة</p>
        </div>
        
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default MobileSplash;
