import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Calendar, Shield, ArrowLeft, Send, X, FileText, Upload, Loader2 } from 'lucide-react';
import { applyToJob, fetchJobs, fetchTalentProfileById, hasAppliedToJob, uploadDocument } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<{
    id: string;
    title: string;
    budget: string;
    category: string;
    location: string;
    postedAt: string;
    description: string;
    clientId: string;
    clientName: string;
    clientAvatar?: string | null;
  } | null>(null);
  
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        const jobs = await fetchJobs();
        const selected = jobs.find((item) => item.id === id);
        if (!selected) return;

        const applied = await hasAppliedToJob(selected.id);
        setHasApplied(applied);

        let clientName = 'Client';
        let clientAvatar = null;
        try {
          const clientProfile = await fetchTalentProfileById(selected.client_id);
          clientName = clientProfile.full_name || 'Client';
          clientAvatar = clientProfile.avatar_url;
        } catch (e) {
          console.error('Failed to load client details:', e);
        }

        setJob({
          id: selected.id,
          title: selected.title,
          budget: selected.budget,
          category: selected.category,
          location: selected.location ?? 'Remote',
          postedAt: selected.postedAt,
          description: selected.description,
          clientId: selected.client_id,
          clientName,
          clientAvatar
        });
      } catch (error) {
        console.error('Failed to load job details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !user) return;
    if (!coverLetter.trim()) {
      setModalError('Please provide a cover letter.');
      return;
    }

    setApplying(true);
    setModalError(null);

    try {
      let attachmentUrl = null;
      if (file) {
        attachmentUrl = await uploadDocument(user.id, file);
      }

      await applyToJob(job.id, coverLetter, attachmentUrl);
      
      setHasApplied(true);
      setShowModal(false);
      alert('Application sent successfully!');
    } catch (error: any) {
      console.error('Failed to apply for job:', error);
      setModalError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Job not found</h2>
          <Link to="/jobs" className="text-primary-600 font-bold underline">Browse Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <Link to="/jobs" className="flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 mb-6 transition-colors">
              <ArrowLeft size={16} className="mr-2" /> Back to Browse
           </Link>
           
           <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-800 mb-4">
                    {job.category}
                 </span>
                 <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{job.title}</h1>
                 <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                    <div className="flex items-center">
                       <MapPin size={18} className="mr-2 text-gray-400" /> {job.location}
                    </div>
                    <div className="flex items-center">
                       <Clock size={18} className="mr-2 text-gray-400" /> Posted {job.postedAt}
                    </div>
                    <div className="flex items-center">
                       <Calendar size={18} className="mr-2 text-gray-400" /> Deadline: 2 weeks left
                    </div>
                 </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 w-full md:w-auto">
                 <div className="text-center md:text-left">
                    <p className="text-sm text-gray-500 mb-1">Project Budget</p>
                    <p className="text-2xl font-bold text-primary-600 mb-4">{job.budget}</p>
                    <button 
                      onClick={() => !hasApplied && setShowModal(true)} 
                      disabled={hasApplied} 
                      className={`w-full px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center ${
                        hasApplied 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed shadow-none' 
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200'
                      }`}
                    >
                       {hasApplied ? 'Applied' : 'Apply Now'} 
                       {!hasApplied && <Send size={18} className="ml-2" />}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
               <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
                  <div className="prose prose-primary text-gray-600 max-w-none">
                     <p className="mb-4 whitespace-pre-wrap">{job.description}</p>
                     <p className="mb-4">We are looking for a dedicated professional who can deliver high-quality work on time. The ideal candidate should have experience with similar projects and a strong portfolio.</p>
                     <h4 className="font-bold text-gray-900 mt-6 mb-2">Key Responsibilities:</h4>
                     <ul className="list-disc pl-5 space-y-2">
                        <li>Collaborate with our team to understand project requirements.</li>
                        <li>Deliver clean, maintainable, and well-documented code/designs.</li>
                        <li>Participate in weekly progress meetings.</li>
                        <li>Provide ongoing support after project completion.</li>
                     </ul>
                  </div>
               </section>
            </div>

            <div className="lg:col-span-1 space-y-8">
               <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">About the Client</h3>
                  <div className="flex items-center mb-6">
                     <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold mr-4 overflow-hidden">
                        {job.clientAvatar ? (
                           <img src={job.clientAvatar} alt={job.clientName} className="w-full h-full object-cover" />
                        ) : (
                           job.clientName.substring(0, 2).toUpperCase()
                        )}
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-900">{job.clientName}</h4>
                        <p className="text-sm text-gray-500">Sierra Leone</p>
                     </div>
                  </div>
                  <div className="space-y-4 mb-8">
                     <div className="flex items-center text-sm">
                        <Shield size={16} className="text-green-500 mr-2" />
                        <span className="text-gray-600">Payment method verified</span>
                     </div>
                  </div>
                  <Link to={`/talent/${job.clientId}`} className="block text-center text-primary-600 font-bold text-sm hover:underline">
                     View Client Profile
                  </Link>
               </div>
            </div>
         </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Submit Application</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="p-8 space-y-6">
              {/* Job Summary */}
              <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-tight">{job.title}</h4>
                  <div className="flex gap-3 text-xs text-primary-700 mt-1 font-medium">
                    <span>{job.budget}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Letter <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why are you a good fit for this job?"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                ></textarea>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Attachment (Optional)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden" 
                    id="application-file"
                    accept=".pdf,.doc,.docx,.png,.jpg"
                  />
                  <label 
                    htmlFor="application-file"
                    className="flex items-center justify-center w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer group"
                  >
                    <div className="text-center">
                      <Upload size={24} className="mx-auto text-gray-400 group-hover:text-primary-600 mb-2" />
                      <span className="text-sm font-bold text-gray-600 group-hover:text-primary-700">
                        {file ? file.name : 'Upload CV or Portfolio'}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, PNG or JPG (Max 5MB)</p>
                    </div>
                  </label>
                </div>
              </div>

              {modalError && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium">
                  {modalError}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-2 flex-[2] px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center justify-center disabled:opacity-60"
                >
                  {applying ? (
                    <>
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
