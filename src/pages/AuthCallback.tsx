import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting auth callback processing');
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
          console.log('AuthCallback: Existing user found in database. DB Role:', profile.role);
          finalRole = profile.role;
        } else {
          console.log('AuthCallback: New user detected (no profile found)');
          // 2. If user doesn't exist, read the temporarily stored role
          // Priority: SessionStorage > URL param > metadata
          finalRole = storedRole || urlRole || user.user_metadata?.role;
          console.log('AuthCallback: Determined role for new user:', finalRole);

          if (!finalRole) {
            console.warn('AuthCallback: No role found in storage, URL, or metadata. Redirecting to signup with error.');
            navigate('/signup?error=no_role');
            return;
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

        // 5. Redirect based on role
        const redirectPath = finalRole === 'client' ? '/client/dashboard' : '/freelancer/dashboard';
        console.log('AuthCallback: Final redirect path:', redirectPath);
        navigate(redirectPath);
      } catch (error) {
        console.error('AuthCallback: Unexpected error:', error);
        navigate('/login?error=auth_failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

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
