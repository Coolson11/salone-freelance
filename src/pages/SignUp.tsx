import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const SignUp: React.FC = () => {
  const [role, setRole] = useState<'client' | 'freelancer' | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role (Freelancer or Client) first.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const { error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      if (signUpError) {
        setError(signUpError.message || 'Unable to create account.');
      } else {
        navigate('/login', {
          state: {
            email,
            signupSuccess: true,
          },
        });
      }
    } catch {
      setError('Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!role) {
      setError('Please select a role (Freelancer or Client) before continuing with Google.');
      return;
    }

    try {
      console.log('SignUp: Saving selected role to sessionStorage:', role);
      sessionStorage.setItem('oauth_role', role);
      
      // Pass role in the redirect URL as a secondary backup
      const redirectTo = `${window.location.origin}/auth/callback?role=${role}`;
      console.log('SignUp: Redirecting to Google OAuth with redirectTo:', redirectTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          data: {
            role: role
          }
        }
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error('SignUp: Google OAuth error:', err);
      setError('Unable to sign in with Google. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
           <Link to="/" className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/SF-logo.png" alt="Logo" className="w-full h-full object-cover" />
           </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-3xl sm:px-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center text-sm mb-6">
              <AlertCircle size={18} className="mr-2" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSignUp}>
            <div className="grid grid-cols-2 gap-4 mb-8">
               <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all ${role === 'freelancer' ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}
               >
                  <div className={`w-6 h-6 rounded-full border-2 mb-3 flex items-center justify-center ${role === 'freelancer' ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}`}>
                     {role === 'freelancer' && <Check size={14} className="text-white" />}
                  </div>
                  <h3 className={`font-bold ${role === 'freelancer' ? 'text-primary-900' : 'text-gray-900'}`}>Freelancer</h3>
                  <p className="text-xs text-gray-500 mt-1">I want to find work and projects.</p>
               </button>
               
               <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all ${role === 'client' ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}
               >
                  <div className={`w-6 h-6 rounded-full border-2 mb-3 flex items-center justify-center ${role === 'client' ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}`}>
                     {role === 'client' && <Check size={14} className="text-white" />}
                  </div>
                  <h3 className={`font-bold ${role === 'client' ? 'text-primary-900' : 'text-gray-900'}`}>Client</h3>
                  <p className="text-xs text-gray-500 mt-1">I want to hire talent for projects.</p>
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">First Name</label>
                  <div className="mt-1 relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <UserIcon size={18} />
                     </div>
                     <input 
                        type="text" 
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 bg-white" 
                        placeholder="John" 
                     />
                  </div>
               </div>
               <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <div className="mt-1 relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <UserIcon size={18} />
                     </div>
                     <input 
                        type="text" 
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 bg-white" 
                        placeholder="Doe" 
                     />
                  </div>
               </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                   <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 bg-white"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                   <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 bg-white"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the <a href="#" className="text-primary-600 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 font-bold hover:underline">Privacy Policy</a>.
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-200 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                 <span>Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
