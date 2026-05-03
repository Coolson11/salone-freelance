import React, { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, CheckCircle2, Star, AlertTriangle, TrendingUp, UserCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface AdminStats {
  totalFreelancers: number;
  totalClients: number;
  totalJobs: number;
  totalApplications: number;
  totalCompletedJobs: number;
  totalReviews: number;
}

const StatCard: React.FC<{ title: string; value: number | string; icon: any; color: string; bgColor: string }> = ({ title, value, icon: Icon, color, bgColor }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalFreelancers: 0,
    totalClients: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalCompletedJobs: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [
          freelancersRes,
          clientsRes,
          jobsRes,
          appsRes,
          completedJobsRes,
          reviewsRes
        ] = await Promise.all([
          supabase.from('public_profiles').select('id', { count: 'exact', head: true }).eq('role', 'freelancer'),
          supabase.from('public_profiles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
          supabase.from('jobs').select('id', { count: 'exact', head: true }),
          supabase.from('applications').select('id', { count: 'exact', head: true }),
          supabase.from('jobs').select('id', { count: 'exact', head: true }).in('status', ['completed', 'closed']),
          supabase.from('reviews').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          totalFreelancers: freelancersRes.count || 0,
          totalClients: clientsRes.count || 0,
          totalJobs: jobsRes.count || 0,
          totalApplications: appsRes.count || 0,
          totalCompletedJobs: completedJobsRes.count || 0,
          totalReviews: reviewsRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, Admin. Here's an overview of the platform performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Freelancers" 
          value={stats.totalFreelancers} 
          icon={UserCheck} 
          color="text-blue-600" 
          bgColor="bg-blue-50" 
        />
        <StatCard 
          title="Total Clients" 
          value={stats.totalClients} 
          icon={Users} 
          color="text-indigo-600" 
          bgColor="bg-indigo-50" 
        />
        <StatCard 
          title="Total Jobs" 
          value={stats.totalJobs} 
          icon={Briefcase} 
          color="text-amber-600" 
          bgColor="bg-amber-50" 
        />
        <StatCard 
          title="Total Applications" 
          value={stats.totalApplications} 
          icon={FileText} 
          color="text-purple-600" 
          bgColor="bg-purple-50" 
        />
        <StatCard 
          title="Completed Jobs" 
          value={stats.totalCompletedJobs} 
          icon={CheckCircle2} 
          color="text-green-600" 
          bgColor="bg-green-50" 
        />
        <StatCard 
          title="Total Reviews" 
          value={stats.totalReviews} 
          icon={Star} 
          color="text-yellow-600" 
          bgColor="bg-yellow-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <button className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center">
              View All <TrendingUp size={16} className="ml-1" />
            </button>
          </div>
          <div className="space-y-4">
             {/* Placeholder for recent activity */}
             <p className="text-gray-400 text-sm italic py-8 text-center">Activity log integration coming soon...</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Platform Reports</h2>
            <AlertTriangle size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
             {/* Placeholder for reports */}
             <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">Flagged Jobs</p>
                  <p className="text-xs text-gray-500">0 pending reviews</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wider">Clean</span>
             </div>
             <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">Reported Users</p>
                  <p className="text-xs text-gray-500">0 pending investigations</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wider">Clean</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
