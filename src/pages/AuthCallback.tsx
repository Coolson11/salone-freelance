import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session?.user) {
          navigate('/login');
          return;
        }

        const user = session.user;
        const params = new URLSearchParams(window.location.search);
        const urlRole = params.get('role');

        // 1. Check if user already exists in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('public_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        let role = profile?.role;

        if (!profile) {
          // 2. If user doesn't exist, determine role
          // Priority: URL param > metadata > localStorage > default
          const storedRole = urlRole || user.user_metadata?.role || localStorage.getItem('pending_role') || 'freelancer';
          role = storedRole;

          // 3. Create a new profile record
          const { error: insertError } = await supabase
            .from('public_profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              role: storedRole,
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }

        // 4. Cleanup
        localStorage.removeItem('pending_role');

        // 5. Redirect based on role
        if (role === 'client') {
          navigate('/client/dashboard');
        } else {
          navigate('/freelancer/dashboard');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
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
