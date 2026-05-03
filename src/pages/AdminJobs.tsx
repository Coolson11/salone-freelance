import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Briefcase, Search, Loader2, Trash2, XCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  created_at: string;
  client_id: string;
  client_name?: string;
  applications_count?: number;
}

const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          client:public_profiles(full_name),
          applications(count)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const mappedJobs = (data || []).map((j: any) => ({
        ...j,
        client_name: j.client?.full_name || 'Unknown Client',
        applications_count: j.applications?.[0]?.count || 0
      }));
      
      setJobs(mappedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This will also delete all its applications.')) return;
    setActionLoading(jobId);
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) throw error;
      setJobs(jobs.filter(j => j.id !== jobId));
      alert('Job deleted successfully');
    } catch (error: any) {
      alert('Error deleting job: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseJob = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const { error } = await supabase.from('jobs').update({ status: 'closed' }).eq('id', jobId);
      if (error) throw error;
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'closed' } : j));
      alert('Job closed successfully');
    } catch (error: any) {
      alert('Error closing job: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-500">Oversee all job postings and their status.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-primary-600 mx-auto" size={32} />
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Apps</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 line-clamp-1">{job.title}</p>
                      <p className="text-xs text-gray-400">{new Date(job.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {job.client_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {job.budget_max ? `SLE ${job.budget_max}` : job.budget_min ? `SLE ${job.budget_min}+` : 'Negotiable'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        job.status === 'open' ? 'bg-green-100 text-green-700' :
                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        job.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {job.applications_count}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/jobs/${job.id}`} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                          <Eye size={18} />
                        </Link>
                        {job.status === 'open' && (
                          <button 
                            onClick={() => handleCloseJob(job.id)}
                            disabled={actionLoading === job.id}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-100"
                            title="Close Job"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={actionLoading === job.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                          title="Delete Job"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;
