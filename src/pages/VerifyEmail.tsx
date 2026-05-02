import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 shadow-sm">
              <Mail size={32} />
           </div>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Verify your email
        </h2>
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10 mt-8">
           <p className="text-gray-600 text-lg leading-relaxed mb-8">
             We have sent you a verification email to <span className="font-bold text-gray-900">{email}</span>. Please verify it and log in.
           </p>
           
           <Link
             to="/login"
             className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-200 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all"
           >
             Go to Login <ArrowRight size={18} className="ml-2" />
           </Link>
           
           <div className="mt-6">
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or try logging in to resend.
              </p>
           </div>
        </div>
        
        <div className="mt-8">
           <Link to="/" className="flex items-center justify-center text-sm font-bold text-primary-600 hover:text-primary-500">
              <div className="w-5 h-5 rounded flex items-center justify-center mr-2 overflow-hidden border border-primary-200">
                 <img src="/SF-logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              Back to Home
           </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
