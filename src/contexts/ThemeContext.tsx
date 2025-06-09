
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ThemeConfig {
  christmas: boolean;
  valentine: boolean;
  halloween: boolean;
}

interface ThemeContextType {
  activeTheme: 'christmas' | 'valentine' | 'halloween' | 'default';
  themeConfig: ThemeConfig;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<'christmas' | 'valentine' | 'halloween' | 'default'>('default');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings-theme'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('theme_config')
        .single();
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refetch every 30 seconds to get theme updates
  });

  const themeConfig: ThemeConfig = (settings?.theme_config as ThemeConfig) || {
    christmas: false,
    valentine: false,
    halloween: false
  };

  useEffect(() => {
    // Determine active theme based on priority
    if (themeConfig.christmas) {
      setActiveTheme('christmas');
    } else if (themeConfig.valentine) {
      setActiveTheme('valentine');
    } else if (themeConfig.halloween) {
      setActiveTheme('halloween');
    } else {
      setActiveTheme('default');
    }
  }, [themeConfig]);

  useEffect(() => {
    // Apply theme classes to body
    const body = document.body;
    
    // Remove all theme classes
    body.classList.remove('theme-christmas', 'theme-valentine', 'theme-halloween');
    
    // Add active theme class
    if (activeTheme !== 'default') {
      body.classList.add(`theme-${activeTheme}`);
    }

    return () => {
      // Cleanup on unmount
      body.classList.remove('theme-christmas', 'theme-valentine', 'theme-halloween');
    };
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, themeConfig, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};
