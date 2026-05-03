import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting auth callback processing');
        console.log('AuthCallback: Current URL:', window.location.href);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session?.user) {
          console.error('AuthCallback: No user session found');
          navigate('/login');
          return;
        }

        const user = session.user;
        const params = new URLSearchParams(window.location.search);
        const urlRole = params.get('role');
        const storedRole = sessionStorage.getItem('oauth_role');
        
        console.log('AuthCallback: Authenticated user:', user.email);
        console.log('AuthCallback: URL role parameter:', urlRole);
        console.log('AuthCallback: SessionStorage role:', storedRole);

        // 1. Check if user already exists in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('public_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('AuthCallback: Error fetching profile:', profileError);
          throw profileError;
        }

        let finalRole: string | null = null;

        if (profile) {
          console.log('AuthCallback: Existing user found in DB. DB Role:', profile.role);
          finalRole = profile.role;
          
          // Special case: If user exists as 'freelancer' but they explicitly clicked 'client' 
          // on the signup page (detected via URL or sessionStorage), we should probably respect that choice?
          // For safety in this bug fix, if DB role is already set, we usually keep it.
          // However, if the user is stuck, let's allow the URL/Storage to override IF it's 'client'
          if (profile.role !== 'client' && (urlRole === 'client' || storedRole === 'client')) {
            console.log('AuthCallback: Overriding existing role with "client" choice');
            const { error: updateError } = await supabase
              .from('public_profiles')
              .update({ role: 'client' })
              .eq('id', user.id);
            
            if (!updateError) finalRole = 'client';
          }
        } else {
          console.log('AuthCallback: New user detected (no profile found)');
          // 2. If user doesn't exist, read the temporarily stored role
          // Priority: SessionStorage > URL param > metadata
          finalRole = storedRole || urlRole || user.user_metadata?.role;
          console.log('AuthCallback: Determined role for new user:', finalRole);

          if (!finalRole) {
            console.warn('AuthCallback: No role found in storage, URL, or metadata.');
            // Default to freelancer only as absolute last resort, but better to ask
            finalRole = 'freelancer';
          }

          // 3. Create a new profile record
          console.log('AuthCallback: Creating new profile with role:', finalRole);
          const { error: insertError } = await supabase
            .from('public_profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              role: finalRole,
            });

          if (insertError) {
            console.error('AuthCallback: Error creating profile:', insertError);
            throw insertError;
          }
        }

        // 4. Cleanup temporary storage
        console.log('AuthCallback: Cleaning up temporary storage');
        sessionStorage.removeItem('oauth_role');
        localStorage.removeItem('pending_role');

        // Sync global role state
        await refreshProfile();

        // 5. Final redirect logic
        let redirectPath = '/freelancer/dashboard';
        if (finalRole === 'admin') {
          redirectPath = '/admin';
        } else if (finalRole === 'client') {
          redirectPath = '/client/dashboard';
        }
        
        console.log('AuthCallback: Final redirect path:', redirectPath);
        
        // Use a short timeout to ensure the state update from refreshProfile is processed
        setTimeout(() => {
          navigate(redirectPath);
        }, 100);
        
      } catch (error) {
        console.error('AuthCallback: Unexpected error:', error);
        navigate('/login?error=auth_failed');
      }
    };

    handleAuthCallback();
  }, [navigate, refreshProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Finalizing sign-in...</h2>
        <p className="text-gray-500 mt-2">Please wait while we set up your account.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
