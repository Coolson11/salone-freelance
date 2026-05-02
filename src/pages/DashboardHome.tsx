import React, { useEffect, useMemo, useState } from 'react';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  ExternalLink,
  ChevronRight,
  PlusCircle,
  Users,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  fetchDashboardStats, 
  fetchJobsByClientId, 
  fetchCompletedJobsByFreelancerId,
  fetchTalentProfiles,
  fetchReviewsForFreelancer
} from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import TalentCard from '../components/TalentCard';

interface Talent {
  id: string;
  name: string;
  skill: string;
  rating: number;
  price: string;
  avatar: string;
  avatarUrl?: string | null;
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number | string }>, label: string, value: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 font-bold text-lg`}>
       {label.includes('Spent') || label.includes('Earned') ? 'SLE' : <Icon size={24} />}
    </div>
    <p className="text-gray-500 text-sm font-medium">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeJobs: 0, pendingOffers: 0, unreadMessages: 0 });
  const [jobs, setJobs] = useState<Array<{ id: string; title: string }>>([]);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileRole, setProfileRole] = useState<string>('Freelancer');
  const [talent, setTalent] = useState<Talent[]>([]);
  const [loadingTalent, setLoadingTalent] = useState(false);

  useEffect(() => {
    const loadTalent = async () => {
      if (profileRole !== 'Client') return;
      setLoadingTalent(true);
      try {
        const profiles = await fetchTalentProfiles();
        const mapped = await Promise.all(
          profiles
            .filter(p => p.id !== user?.id) // Don't show self
            .slice(0, 2)
            .map(async (profile) => {
              const reviews = await fetchReviewsForFreelancer(profile.id);
              const avgRating =
                reviews.length > 0 ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length : 0;
              const parts = (profile.full_name ?? 'Freelancer User').split(' ');
              const avatar = `${parts[0]?.[0] ?? 'F'}${parts[1]?.[0] ?? 'U'}`.toUpperCase();
              return {
                id: profile.id,
                name: profile.full_name ?? 'Freelancer User',
                skill: profile.bio ? profile.bio.slice(0, 50) + (profile.bio.length > 50 ? '...' : '') : 'Freelancer',
                rating: avgRating,
                price: profile.hourly_rate ? `${profile.hourly_rate} / hr` : 'Rate not set',
                avatar,
                avatarUrl: profile.avatar_url
              };
            })
        );
        setTalent(mapped);
      } catch (error) {
        console.error('Failed to load talent:', error);
      } finally {
        setLoadingTalent(false);
      }
    };

    loadTalent();
  }, [profileRole, user?.id]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) return;
      try {
        const statsData = await fetchDashboardStats();
        setStats(statsData);

        // Fetch jobs based on role
        const role = user?.user_metadata?.role || 'freelancer';
        let jobsData;
        if (role === 'client') {
          jobsData = await fetchJobsByClientId(user.id);
        } else {
          jobsData = await fetchCompletedJobsByFreelancerId(user.id);
        }
        
        const activeOnly = jobsData.filter((j: any) => j.status !== 'completed' && j.status !== 'closed');
        setJobs(activeOnly.slice(0, 3).map((job: { id: string; title: string }) => ({ id: job.id, title: job.title })));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboard();
  }, [user]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('public_profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        setProfileName(data?.full_name ?? null);
        
        if (user?.user_metadata?.role) {
          setProfileRole(user.user_metadata.role === 'client' ? 'Client' : 'Freelancer');
        } else if (data?.role) {
          setProfileRole(data.role === 'client' ? 'Client' : 'Freelancer');
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadProfile();
  }, [user]);

  const fullName = useMemo(() => {
    return (profileName || (user?.user_metadata?.full_name ? String(user.user_metadata.full_name) : '')).trim();
  }, [profileName, user?.user_metadata]);

  const displayName = fullName.split(' ').filter(Boolean)[0] || 'User';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {displayName}!</h1>
          <p className="text-gray-500">
            {profileRole === 'Client' 
              ? "Manage your projects and find top talent in Sierra Leone." 
              : "Here's what's happening with your projects today."}
          </p>
        </div>
        {profileRole === 'Client' && (
          <Link 
            to="/dashboard/post-job" 
            className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            <PlusCircle size={18} className="mr-2" /> Post a Job
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Briefcase} 
          label={profileRole === 'Client' ? "My Job Posts" : "Active Jobs"} 
          value={String(stats.activeJobs)} 
          color="bg-primary-100 text-primary-600" 
        />
        <StatCard 
          icon={DollarSign} 
          label={profileRole === 'Client' ? "Total Spent" : "Total Earned"} 
          value="SLE 0" 
          color="bg-green-100 text-green-600" 
        />
        <StatCard 
          icon={Clock} 
          label={profileRole === 'Client' ? "Applications" : "Pending Offers"} 
          value={String(stats.pendingOffers)} 
          color="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          icon={MessageSquare} 
          label="Unread Messages" 
          value={String(stats.unreadMessages || 0)} 
          color="bg-purple-100 text-purple-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-gray-900">
                 {profileRole === 'Client' ? "Your Recent Postings" : "Ongoing Projects"}
               </h3>
               <Link to="/dashboard/jobs" className="text-sm font-bold text-primary-600 hover:text-primary-700">View All</Link>
            </div>
            <div className="divide-y divide-gray-50">
               {jobs.length > 0 ? jobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                     <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                           <Briefcase size={20} />
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{job.title}</h4>
                           <p className="text-sm text-gray-500">Status: {profileRole === 'Client' ? 'Active' : 'In Progress'}</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-gray-300 group-hover:text-primary-600 transition-all" />
                  </div>
               )) : (
                 <div className="p-12 text-center text-gray-500">No jobs to display.</div>
               )}
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-gray-900">
                 {profileRole === 'Client' ? "Recommended Talent" : "Recent Applications"}
               </h3>
               <Link to={profileRole === 'Client' ? "/talent" : "/dashboard/applications"} className="text-sm font-bold text-primary-600 hover:text-primary-700">View All</Link>
            </div>
            <div className="p-6">
               {profileRole === 'Client' ? (
                 loadingTalent ? (
                   <div className="grid grid-cols-1 gap-4">
                     {[...Array(2)].map((_, i) => (
                       <div key={i} className="h-40 bg-gray-50 animate-pulse rounded-xl border border-gray-100" />
                     ))}
                   </div>
                 ) : talent.length > 0 ? (
                   <div className="grid grid-cols-1 gap-4">
                     {talent.map((t) => (
                       <TalentCard key={t.id} {...t} />
                     ))}
                   </div>
                 ) : (
                   <div className="py-8 text-center">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                        <Users size={24} />
                     </div>
                     <p className="text-gray-500 mb-6">Discover top freelancers for your next big project.</p>
                     <Link to="/talent" className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors">
                        Browse Talent
                     </Link>
                   </div>
                 )
               ) : (
                 <div className="py-8 text-center">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                      <ExternalLink size={24} />
                   </div>
                   <p className="text-gray-500 mb-6">You haven't applied to any new jobs recently.</p>
                   <Link to="/jobs" className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors">
                      Find Work
                   </Link>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default DashboardHome;
