import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncProfile = async (currentUser: User) => {
      try {
        const { full_name, role } = currentUser.user_metadata || {};
        
        // If we don't have a role in metadata, we check if one exists in DB first
        // to avoid overwriting a 'client' role with default 'freelancer'
        if (!role) {
          const { data: existing } = await supabase
            .from('public_profiles')
            .select('role')
            .eq('id', currentUser.id)
            .maybeSingle();
          
          if (existing) return; // Profile already exists with a role, don't overwrite
        }

        if (!full_name && !role) return;

        // Upsert the profile to ensure the database matches the choice made during sign-up
        const { error } = await supabase
          .from('public_profiles')
          .upsert({
            id: currentUser.id,
            full_name: full_name || '',
            role: role || 'freelancer',
            email: currentUser.email
          }, { onConflict: 'id' });

        if (error) {
          console.error('Error syncing profile to database:', error);
        }
      } catch (err) {
        console.error('Unexpected error during profile sync:', err);
      }
    };

    const syncUser = (session: Session | null) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        syncProfile(currentUser);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      syncUser(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
