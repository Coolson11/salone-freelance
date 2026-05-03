import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, Search, Loader2, Trash2, Download } from 'lucide-react';

interface Application {
  id: string;
  created_at: string;
  status: string;
  freelancer_id: string;
  job_id: string;
  attachment_url: string | null;
  freelancer_name?: string;
  job_title?: string;
  client_name?: string;
}

const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          freelancer:public_profiles(full_name),
          job:jobs(
            title,
            client:public_profiles(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mapped = (data || []).map((app: any) => ({
        ...app,
        freelancer_name: app.freelancer?.full_name || 'Unknown Freelancer',
        job_title: app.job?.title || 'Unknown Job',
        client_name: app.job?.client?.full_name || 'Unknown Client'
      }));
      
      setApplications(mapped);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    setActionLoading(appId);
    try {
      const { error } = await supabase.from('applications').delete().eq('id', appId);
      if (error) throw error;
      setApplications(applications.filter(a => a.id !== appId));
      alert('Application deleted successfully');
    } catch (error: any) {
      alert('Error deleting application: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApps = applications.filter(app => 
    app.freelancer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-500">Monitor all project applications across the platform.</p>
        </div>
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-primary-600 mx-auto" size={32} />
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Freelancer</th>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {app.freelancer_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {app.job_title}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {app.client_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        app.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {app.attachment_url && (
                          <a 
                            href={app.attachment_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-primary-100"
                            title="Download CV"
                          >
                            <Download size={18} />
                          </a>
                        )}
                        <button 
                          onClick={() => handleDeleteApplication(app.id)}
                          disabled={actionLoading === app.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                          title="Delete Application"
                        >
                          {actionLoading === app.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
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
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No applications found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplications;
