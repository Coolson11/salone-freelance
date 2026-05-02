import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('AuthContext: Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('public_profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      if (data) {
        console.log('AuthContext: Found role in DB:', data.role);
        setRole(data.role);
        return data.role;
      }
      console.log('AuthContext: No profile found in DB');
      setRole(null);
      return null;
    } catch (err) {
      console.error('AuthContext: Error fetching profile:', err);
      return null;
    }
  }, []);

  const syncProfile = useCallback(async (currentUser: User) => {
    // 1. Check if profile already exists
    const existingRole = await fetchProfile(currentUser.id);
    if (existingRole) {
      return;
    }

    // Skip sync if we are on the callback page - let the callback handle creation to avoid race conditions
    if (window.location.pathname === '/auth/callback') {
      console.log('AuthContext: On callback page, deferring profile creation to AuthCallback');
      return;
    }

    try {
      const { full_name, role: metadataRole } = currentUser.user_metadata || {};
      
      // Priority: metadata > sessionStorage (for OAuth) > localStorage
      const oauthRole = sessionStorage.getItem('oauth_role');
      const pendingRole = localStorage.getItem('pending_role');
      const roleToUse = metadataRole || oauthRole || pendingRole;
      
      if (!roleToUse) {
        console.log('AuthContext: No role source found, skipping background profile creation');
        return;
      }

      console.log('AuthContext: Creating profile with role:', roleToUse);
      const { error: insertError } = await supabase
        .from('public_profiles')
        .insert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: full_name || '',
          role: roleToUse,
        });

      if (insertError) {
        console.error('AuthContext: Error creating profile:', insertError);
      } else {
        setRole(roleToUse);
        sessionStorage.removeItem('oauth_role');
        localStorage.removeItem('pending_role');
      }
    } catch (err) {
      console.error('AuthContext: Unexpected error during profile sync:', err);
    }
  }, [fetchProfile]);

  const syncUser = useCallback(async (session: Session | null) => {
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    
    if (currentUser) {
      await syncProfile(currentUser);
    } else {
      setRole(null);
    }
    setLoading(false);
  }, [syncProfile]);

  useEffect(() => {
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
  }, [syncUser]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    sessionStorage.removeItem('oauth_role');
    localStorage.removeItem('pending_role');
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout, refreshProfile }}>
      {children}
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
