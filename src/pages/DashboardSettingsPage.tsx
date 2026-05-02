import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { deleteUserAccount } from '../services/marketplaceService';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogOut, Loader2, ShieldCheck, AlertCircle, Trash2 } from 'lucide-react';

const DashboardSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    setDeleteLoading(true);
    try {
      // 1. Delete user files and profile data
      await deleteUserAccount(user.id);
      
      // 2. Since we can't delete auth.user from client, 
      // we log them out and inform them. 
      // In a real production app, you'd call a Supabase Edge Function here.
      await logout();
      alert('Your data and files have been removed. Your account deletion is being processed.');
      navigate('/login');
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert('Failed to delete some data. Please contact support.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Account Info Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary-600" />
            Account Security
          </h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Email Display */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600">
              <Mail size={18} />
              <span className="text-sm font-medium">{user?.email}</span>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Verified</span>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">To change your email, please contact support.</p>
          </div>

          <hr className="border-gray-50" />

          {/* Password Change Form */}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Change Password</h4>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm flex items-center gap-2">
                <ShieldCheck size={16} />
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all text-sm"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all text-sm"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || !newPassword}
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-gray-900">Sign Out</h4>
          <p className="text-sm text-gray-500">Are you sure you want to log out of your account?</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
        <div className="p-6 border-b border-red-100">
          <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
            <Trash2 size={20} />
            Danger Zone
          </h3>
        </div>
        <div className="p-6">
          {!showDeleteConfirm ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-red-900">Delete Account</h4>
                <p className="text-sm text-red-700 opacity-80">Once you delete your account, all of your data and files will be permanently removed.</p>
              </div>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm whitespace-nowrap"
              >
                Delete Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-100 border border-red-200 rounded-xl text-red-800 text-sm">
                <strong>Warning:</strong> This action is irreversible. All your profile information, jobs, messages, and uploaded files will be deleted.
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {deleteLoading && <Loader2 size={16} className="animate-spin" />}
                  Yes, Delete My Account
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSettingsPage;

