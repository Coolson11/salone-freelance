import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AlertTriangle, Search, Eye, CheckCircle, Trash2, Loader2 } from 'lucide-react';

interface Report {
  id: string;
  reporter: string;
  reported_item: string;
  reason: string;
  status: 'pending' | 'resolved';
  created_at: string;
  type: 'user' | 'job';
}

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Attempt to fetch from 'reports' table if it exists
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Reports table might not exist yet:', error.message);
        setReports([]);
      } else {
        setReports(data || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', id);
      
      if (error) throw error;
      
      setReports(reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
      alert('Report marked as resolved');
    } catch (error: any) {
      alert('Error resolving report: ' + error.message);
    }
  };

  const filteredReports = reports.filter(report => 
    report.reporter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reported_item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Reports</h1>
          <p className="text-gray-500">Review and resolve issues reported by the community.</p>
        </div>
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search reports..."
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
        ) : filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Reporter</th>
                  <th className="px-6 py-4">Reported Item</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {report.reporter}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${report.type === 'job' ? 'bg-amber-400' : 'bg-blue-400'}`}></span>
                        <span className="text-gray-700 capitalize">{report.type}: {report.reported_item}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {report.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="View Details">
                          <Eye size={18} />
                        </button>
                        {report.status === 'pending' && (
                          <button 
                            onClick={() => handleResolve(report.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                            title="Resolve Report"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100" title="Take Action">
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
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
