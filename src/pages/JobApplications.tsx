import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, MessageSquare, Check, X, Loader2, FileText, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { fetchApplicationsByJobId, updateApplicationStatus, makeChatId } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const JobApplications: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user: currentUser } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Modal State
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      if (!jobId) return;
      try {
        const data = await fetchApplicationsByJobId(jobId);
        setApplications(data || []);
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [jobId]);

  const handleStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setProcessingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update application status.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewAttachment = async (rawPath: string) => {
    let cleanPath = rawPath.trim().replace(/^\/+|\/+$/g, '');
    if (cleanPath.startsWith('http')) {
      try {
        const url = new URL(cleanPath);
        const parts = url.pathname.split('/');
        const bIdx = parts.findIndex(p => p.toLowerCase().includes('documents'));
        if (bIdx !== -1) cleanPath = parts.slice(bIdx + 1).join('/');
      } catch (e) {}
    }

    setPreviewPath(cleanPath);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewLoading(true);
    setShowPreview(true);

    const bucket = 'SaloneFreelance-Documents';

    try {
      // 1. Try the exact path first
      let { data, error } = await supabase.storage.from(bucket).createSignedUrl(cleanPath, 60);

      // 2. SMART DISCOVERY: If not found, look for the file in the user's folder
      if (error || !data?.signedUrl) {
        const pathParts = cleanPath.split('/');
        if (pathParts.length >= 2) {
          const folderPath = pathParts.slice(0, -1).join('/');
          const fileName = pathParts[pathParts.length - 1].split('.')[0].toLowerCase();
          
          const { data: files } = await supabase.storage.from(bucket).list(folderPath);
          
          if (files && files.length > 0) {
            // Find a file that starts with the same name (e.g., 'cv')
            const actualFile = files.find(f => f.name.toLowerCase().startsWith(fileName));
            if (actualFile) {
              const discoveryPath = `${folderPath}/${actualFile.name}`;
              const retry = await supabase.storage.from(bucket).createSignedUrl(discoveryPath, 60);
              if (!retry.error && retry.data?.signedUrl) {
                setPreviewUrl(retry.data.signedUrl);
                setPreviewPath(discoveryPath);
                return;
              }
            }
          }
        }
        throw error || new Error('Object not found');
      }
      
      setPreviewUrl(data.signedUrl);
    } catch (error: any) {
      console.error('Final decision:', error.message);
      setPreviewError('The document could not be found. It may have been deleted or the path is incorrect.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const isPDF = (path: string | null) => {
    return path?.toLowerCase().endsWith('.pdf') || path?.toLowerCase().includes('.pdf?');
  };

  const isImage = (path: string | null) => {
    const cleanPath = path?.split('?')[0] || '';
    const ext = cleanPath.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/jobs" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-500">Review and manage freelancers who applied to your job.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {applications.length > 0 ? (
          applications.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 font-bold text-xl overflow-hidden">
                    {app.freelancer?.avatar_url ? (
                      <img src={app.freelancer.avatar_url} alt={app.freelancer.full_name} className="w-full h-full object-cover" />
                    ) : (
                      app.freelancer?.full_name?.substring(0, 2).toUpperCase() || 'U'
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{app.freelancer?.full_name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{app.freelancer?.bio || 'Freelancer'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                      "{app.cover_letter || 'No cover letter provided.'}"
                    </p>
                  </div>

                  {app.attachment_url && (
                    <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100 w-fit">
                      <FileText className="text-primary-600" size={20} />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-primary-900">CV / Attachment</span>
                        <button 
                          onClick={() => handleViewAttachment(app.attachment_url)}
                          className="text-xs text-primary-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          View Document <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      <Link 
                        to={`/talent/${app.freelancer_id}`}
                        className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <User size={16} /> View Profile
                      </Link>
                      {app.status === 'accepted' && currentUser?.id && (
                        <Link 
                          to={`/messages?chatId=${makeChatId(currentUser.id, app.freelancer_id)}`}
                          className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                          <MessageSquare size={16} /> Send Message
                        </Link>
                      )}
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          disabled={processingId === app.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 border border-red-100 transition-all disabled:opacity-50"
                        >
                          <X size={16} /> Reject
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'accepted')}
                          disabled={processingId === app.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 disabled:opacity-50"
                        >
                          <Check size={16} /> Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
               <User size={32} />
            </div>
            <p className="text-gray-500">No applications received yet for this job.</p>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Document Preview</h2>
                  <p className="text-xs text-gray-500">Authorized Access Only</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {previewUrl && (
                  <a 
                    href={previewUrl} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Download size={18} /> Download CV
                  </a>
                )}
                <button 
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50 min-h-[400px] flex flex-col items-center justify-center">
              {previewLoading ? (
                <div className="text-center space-y-4">
                  <Loader2 className="animate-spin text-primary-600 mx-auto" size={48} />
                  <p className="text-gray-500 font-medium">Securing document access...</p>
                </div>
              ) : previewError ? (
                <div className="text-center space-y-4 max-w-sm px-6">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={32} />
                  </div>
                  <p className="text-red-600 font-bold text-lg">{previewError}</p>
                  <p className="text-gray-500 text-sm mb-4 text-center">
                    Check if your Supabase RLS policy allows you to view files in the 'SaloneFreelance-Documents' bucket.
                  </p>
                  <button 
                    onClick={() => previewPath && handleViewAttachment(previewPath)}
                    className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
                  >
                    Try Refreshing
                  </button>
                </div>
              ) : previewUrl ? (
                <div className="w-full h-full flex flex-col items-center">
                  {isPDF(previewPath) ? (
                    <iframe 
                      src={`${previewUrl}#toolbar=0`}
                      className="w-full h-[600px] rounded-xl border border-gray-200 shadow-inner"
                      title="PDF Preview"
                    />
                  ) : isImage(previewPath) ? (
                    <img 
                      src={previewUrl} 
                      alt="Document Preview" 
                      className="max-w-full h-auto rounded-xl shadow-lg border border-gray-100"
                    />
                  ) : (
                    <div className="text-center p-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                      <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-900 font-bold mb-2">Preview not available for this file type</p>
                      <a 
                        href={previewUrl} 
                        download 
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
                      >
                        <Download size={20} /> Download File
                      </a>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplications;