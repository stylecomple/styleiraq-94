
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartShopping = () => {
    navigate('/products');
  };

  const handleBrowseCollections = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <Hero onStartShopping={handleStartShopping} onBrowseCollections={handleBrowseCollections} />
      
      <FeaturesSection />

      {user && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full px-6 py-3">
              <span className="text-lg text-gray-700">
                مرحباً <span className="font-semibold text-purple-700">{user.user_metadata?.full_name || user.email}</span>
              </span>
              <span className="text-2xl">👋</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
