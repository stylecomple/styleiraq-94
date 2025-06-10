import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isOwner: boolean;
  isOrderManager: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isOrderManager, setIsOrderManager] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkUserRoles = async (userId: string) => {
    try {
      console.log('Checking roles for user:', userId);
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        setIsAdmin(false);
        setIsOwner(false);
        setIsOrderManager(false);
        return;
      }

      console.log('User roles found:', roles);
      const userRoles = roles?.map(r => r.role) || [];
      const adminStatus = userRoles.includes('admin');
      const ownerStatus = userRoles.includes('owner');
      const orderManagerStatus = userRoles.includes('order_manager');
      
      setIsAdmin(adminStatus);
      setIsOwner(ownerStatus);
      setIsOrderManager(orderManagerStatus);
      
      console.log('Role status:', { isAdmin: adminStatus, isOwner: ownerStatus, isOrderManager: orderManagerStatus });
    } catch (error) {
      console.error('Error in checkUserRoles:', error);
      setIsAdmin(false);
      setIsOwner(false);
      setIsOrderManager(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session check:', initialSession?.user?.id);
        
        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        setLoading(false);
        
        if (initialSession?.user) {
          checkUserRoles(initialSession.user.id);
        } else {
          setIsAdmin(false);
          setIsOwner(false);
          setIsOrderManager(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        setLoading(false);
        
        if (session?.user) {
          checkUserRoles(session.user.id);
        } else {
          setIsAdmin(false);
          setIsOwner(false);
          setIsOrderManager(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    console.log('SignOut called in AuthContext');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsOwner(false);
      setIsOrderManager(false);
      
      console.log('SignOut completed successfully');
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isAdmin,
    isOwner,
    isOrderManager,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
