import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { fetchDashboardStats } from '../services/marketplaceService';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Search,
  PlusCircle,
  Camera,
  Loader2,
  Menu,
  X
} from 'lucide-react';

const Sidebar: React.FC<{ role: string; isOpen: boolean; onClose: () => void }> = ({ role, isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Briefcase, label: role === 'Client' ? 'Manage Jobs' : 'My Jobs', path: '/dashboard/jobs' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  if (role === 'Client') {
    menuItems.splice(1, 0, { icon: PlusCircle, label: 'Post Job', path: '/dashboard/post-job' });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:top-0 z-50 w-64 bg-gray-900 min-h-screen transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <Link to="/" className="flex items-center" onClick={onClose}>
            <img src="/SF-logo.png" alt="Salone Freelance Logo" className="h-8 w-auto mr-3" />
            <span className="text-white font-bold text-lg">Salone Freelance</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all w-full text-left"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, role } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileRole = useMemo(() => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }, [role]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('public_profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data?.full_name) setProfileName(data.full_name);
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        
        const stats = await fetchDashboardStats();
        setUnreadCount(stats.unreadMessages);
      } catch (error) {
        console.error('Failed to load profile for dashboard header:', error);
      }
    };

    loadProfile();
  }, [user]);

  const handleAvatarClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size too large. Please select an image under 2MB.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('SaloneFreelance-Profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('SaloneFreelance-Profiles')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('public_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const displayName = useMemo(() => {
    const full = profileName || (user?.user_metadata?.full_name ? String(user.user_metadata.full_name) : '');
    const firstName = full.trim().split(' ').filter(Boolean)[0];
    return firstName || 'User';
  }, [profileName, user?.user_metadata]);

  const initials = useMemo(() => {
    const parts = displayName.trim().split(' ').filter(Boolean);
    const first = parts[0]?.[0] ?? 'U';
    const second = parts[1]?.[0] ?? '';
    return `${first}${second}`.toUpperCase();
  }, [displayName]);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden items-stretch">
      <Sidebar 
        role={profileRole} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
           <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
              
              <div className="relative w-40 sm:w-64 lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
              </div>
           </div>
           
           <div className="flex items-center space-x-3 sm:space-x-6">
              <button className="relative text-gray-400 hover:text-gray-600 transition-colors p-2">
                 <Bell size={20} />
                 {unreadCount > 0 && (
                   <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                 )}
              </button>
              
              <div className="flex items-center space-x-3 group cursor-pointer">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{displayName}</p>
                    <p className="text-xs text-gray-500">{profileRole}</p>
                 </div>
                 
                 <div className="relative">
                    <input 
                       type="file" 
                       ref={fileInputRef} 
                       className="hidden" 
                       accept="image/*"
                       onChange={handleFileChange}
                       disabled={uploading}
                    />
                    <div 
                       onClick={handleAvatarClick}
                       className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold group-hover:ring-2 group-hover:ring-primary-500 transition-all overflow-hidden relative"
                    >
                       {uploading ? (
                          <Loader2 size={16} className="animate-spin text-primary-600" />
                       ) : avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                          initials
                       )}
                       {!uploading && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <Camera size={16} className="text-white" />
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </header>
        
        <main className="p-4 sm:p-6 lg:p-8">
           {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
