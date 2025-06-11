
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BottomNavigation from './BottomNavigation';

interface MobileAppLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  backPath?: string;
}

const MobileAppLayout = ({ children, title, showBackButton = true, backPath }: MobileAppLayoutProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-gray-800 flex-1">{title}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20 overflow-y-auto">
        {children}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default MobileAppLayout;
