import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchTalentProfileById, updateProfile, uploadAvatar } from '../services/marketplaceService';
import type { TalentProfileRecord } from '../services/marketplaceService';
import { User, MapPin, Save, Loader2, Camera } from 'lucide-react';

const DashboardProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<Partial<TalentProfileRecord>>({
    full_name: '',
    location: '',
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const data = await fetchTalentProfileById(user.id);
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        full_name: profile.full_name,
        location: profile.location,
        bio: profile.bio,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploadingAvatar(true);
    try {
      const publicUrl = await uploadAvatar(user.id, file);
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      await updateProfile(user.id, { avatar_url: publicUrl });
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <p className="text-gray-500 text-sm mt-1">Information you share here will be visible on your public profile.</p>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-50">
            <div className="relative group">
              <div className="w-24 h-24 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 text-2xl font-bold overflow-hidden border-2 border-white shadow-md">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile.full_name?.[0] || 'U'
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                <Camera className="text-white" size={20} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl">
                  <Loader2 className="animate-spin text-primary-600" size={20} />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Profile Picture</h4>
              <p className="text-sm text-gray-500 mb-2">JPG, GIF or PNG. Max size 2MB.</p>
              <button 
                type="button"
                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                className="text-sm font-bold text-primary-600 hover:text-primary-700"
              >
                Change Photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="full_name"
                  value={profile.full_name || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                  placeholder="Your full name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="location"
                  value={profile.location || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                  placeholder="e.g. Freetown, Sierra Leone"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
              <textarea 
                name="bio"
                value={profile.bio || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all resize-none"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardProfilePage;
