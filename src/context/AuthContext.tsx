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
      // Skip sync if we are on the callback page - let the callback handle it
      if (window.location.pathname === '/auth/callback') {
        console.log('AuthContext: On callback page, skipping background sync');
        return;
      }

      try {
        const { full_name, role: metadataRole } = currentUser.user_metadata || {};
        console.log('AuthContext: Syncing profile for:', currentUser.email);
        
        // 1. Check if profile already exists in the database
        const { data: existing, error: fetchError } = await supabase
          .from('public_profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();
        
        if (fetchError) throw fetchError;

        // 2. If profile exists, don't overwrite the role
        if (existing) {
          console.log('AuthContext: Profile already exists with role:', existing.role);
          return;
        }

        // 3. Profile doesn't exist, we need to create it.
        // Priority: metadata > sessionStorage (for OAuth) > localStorage
        const oauthRole = sessionStorage.getItem('oauth_role');
        const pendingRole = localStorage.getItem('pending_role');
        const roleToUse = metadataRole || oauthRole || pendingRole;
        
        console.log('AuthContext: Determined role for sync:', roleToUse);

        if (!roleToUse) {
          console.warn('AuthContext: No role found for new user. Skipping profile creation to avoid default role.');
          return;
        }

        const { error: insertError } = await supabase
          .from('public_profiles')
          .insert({
            id: currentUser.id,
            full_name: full_name || '',
            role: roleToUse,
            email: currentUser.email,
          });

        if (insertError) {
          console.error('AuthContext: Error creating profile during sync:', insertError);
        } else {
          console.log('AuthContext: Profile successfully created during sync');
          // Successfully created, clean up temporary storage
          sessionStorage.removeItem('oauth_role');
          localStorage.removeItem('pending_role');
        }
      } catch (err) {
        console.error('AuthContext: Unexpected error during profile sync:', err);
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
