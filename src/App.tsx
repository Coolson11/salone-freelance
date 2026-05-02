import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Briefcase, MessageSquare, Trash2, CheckCircle2, Star, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import { fetchJobsByClientId, makeChatId, deleteJob, markJobAsCompleted, createReview, type JobRecord } from './services/marketplaceService';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import BrowseJobs from './pages/BrowseJobs';
import BrowseTalent from './pages/BrowseTalent';
import JobDetails from './pages/JobDetails';
import TalentProfile from './pages/TalentProfile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import DashboardHome from './pages/DashboardHome';
import Messages from './pages/Messages';
import PostJob from './pages/PostJob';
import JobApplications from './pages/JobApplications';
import DashboardProfilePage from './pages/DashboardProfilePage';
import DashboardSettingsPage from './pages/DashboardSettingsPage';
import AuthCallback from './pages/AuthCallback';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};

const DashboardRoutes: React.FC = () => (
  <ProtectedRoute>
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="jobs" element={<JobsRoute />} />
        <Route path="jobs/:jobId/applications" element={<JobApplications />} />
        <Route path="profile" element={<DashboardProfilePage />} />
        <Route path="settings" element={<DashboardSettingsPage />} />
      </Routes>
    </DashboardLayout>
  </ProtectedRoute>
);

interface JobWithApp extends JobRecord {
  appStatus?: string;
  appId?: string;
  budget?: string;
}

const JobsRoute: React.FC = () => {
  const { user, role } = useAuth();
  const [jobs, setJobs] = useState<JobWithApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<{ isOpen: boolean, jobId: string } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<{ isOpen: boolean, jobId: string, freelancerId: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadJobs = async () => {
    if (!user?.id || !role) return;
    try {
      let data;
      if (role === 'client') {
        data = await fetchJobsByClientId(user.id);
      } else if (role === 'freelancer') {
        // For freelancers, fetch all applications to show status
        const { data: apps, error } = await supabase
          .from('applications')
          .select(`
            id,
            status,
            created_at,
            jobs (
              id,
              title,
              category,
              budget_min,
              budget_max,
              status,
              client_id
            )
          `)
          .eq('freelancer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const appList = (apps || []) as unknown as Array<{ id: string, status: string, jobs: JobRecord }>;
        data = appList
          .filter(app => {
            // Show if application is accepted (active/completed) OR if it's pending/rejected but recent
            return app.status === 'accepted' || app.jobs.status === 'open';
          })
          .map(app => {
            const job = app.jobs;
            return {
              ...job,
              appStatus: app.status,
              appId: app.id,
              client_id: job.client_id,
              budget: `SLE ${job.budget_max || job.budget_min || '?'}`
            };
          });
      }
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading user jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [user, role]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This will also delete all applications for it.')) return;
    setActionLoading(jobId);
    try {
      await deleteJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsCompleted = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      // 1. Get the accepted application to get freelancerId for review
      const { data: appData } = await supabase
        .from('applications')
        .select('freelancer_id')
        .eq('job_id', jobId)
        .eq('status', 'accepted')
        .single();

      // 2. Mark as completed (updates status)
      await markJobAsCompleted(jobId);
      
      // 3. Remove from local state so it disappears from the list immediately
      setJobs(prev => prev.filter(j => j.id !== jobId));
      
      // Close confirmation modal
      setShowCompleteModal(null);
      
      if (appData) {
        setShowReviewModal({ isOpen: true, jobId, freelancerId: appData.freelancer_id });
      } else {
        // If no review needed, delete the job now
        await deleteJob(jobId);
      }
      
      alert('Project marked as completed');
    } catch (error) {
      console.error('Error marking job as completed:', error);
      alert('Failed to update job status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewSubmit = async () => {
    if (!showReviewModal) return;
    setSubmitting(true);
    try {
      await createReview({
        freelancerId: showReviewModal.freelancerId,
        rating,
        comment
      });
      
      // Delete the job AFTER the review is successfully created
      await deleteJob(showReviewModal.jobId);
      
      setShowReviewModal(null);
      setRating(5);
      setComment('');
      alert('Thank you for your review!');
      
      // Refresh UI
      if (typeof loadJobs === 'function') {
        loadJobs();
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipReview = async () => {
    if (!showReviewModal) return;
    const jobId = showReviewModal.jobId;
    setShowReviewModal(null);
    setRating(5);
    setComment('');
    try {
      await deleteJob(jobId);
    } catch (error) {
      console.error('Error deleting job after skip:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Complete Confirmation Modal */}
      {showCompleteModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete Project?</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure this project has been completed? This action will close the job and move it to project history.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowCompleteModal(null)}
                  className="px-6 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleMarkAsCompleted(showCompleteModal.jobId)}
                  className="px-6 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Leave a Review</h3>
              <button onClick={() => setShowReviewModal(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6 text-center">How was your experience working with this freelancer?</p>
              
              <div className="flex justify-center space-x-2 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star 
                      size={40} 
                      className={`${s <= rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
                    />
                  </button>
                ))}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block ml-1">Your Feedback</label>
                <textarea 
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the work quality, communication, and professionalism..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-4">
              <button 
                onClick={handleSkipReview}
                className="px-6 py-2 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip
              </button>
              <button 
                disabled={submitting}
                onClick={handleReviewSubmit}
                className="bg-primary-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {role === 'client' ? 'Manage Jobs' : 'My Applications'}
        </h1>
        <p className="text-gray-500">
          {role === 'client' 
            ? 'Track and manage your posted projects.' 
            : 'Track the status of your project applications.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {jobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-sm text-gray-500 flex items-center">
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            (job.appStatus || job.status) === 'accepted' || job.status === 'in_progress' ? 'bg-green-500' : 
                            job.status === 'completed' || job.status === 'closed' ? 'bg-gray-500' :
                            job.appStatus === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></span>
                          Status: <span className="capitalize ml-1">{job.appStatus || job.status || 'Open'}</span>
                        </span>
                        <span className="text-sm text-gray-500">{job.category}</span>
                        <span className="text-sm font-bold text-primary-600">{job.budget}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
                    <Link 
                      to={`/jobs/${job.id}`} 
                      className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                    {role === 'client' ? (
                      <>
                        <Link 
                          to={`/dashboard/jobs/${job.id}/applications`}
                          className="px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
                        >
                          View Applications
                        </Link>
                        {job.status === 'in_progress' && (
                          <button 
                            onClick={() => setShowCompleteModal({ isOpen: true, jobId: job.id })}
                            disabled={actionLoading === job.id}
                            className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} /> Complete
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
                      </>
                    ) : (
                      job.appStatus === 'accepted' && user?.id && (
                        <Link 
                          to={`/messages?chatId=${makeChatId(user.id, job.client_id)}`}
                          className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                        >
                          <MessageSquare size={16} /> Chat
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
               <Briefcase size={32} />
            </div>
            <p className="text-gray-500 mb-6">
              {role === 'client' 
                ? "You haven't posted any jobs yet." 
                : "You haven't applied to any jobs yet."}
            </p>
            {role === 'client' && (
              <Link to="/dashboard/post-job" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                Post Your First Job
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard') || location.pathname.startsWith('/messages');
  const isAuth = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/verify-email' || location.pathname === '/auth/callback';

  return (
    <div className="flex flex-col min-h-screen">
      {!isDashboard && !isAuth && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/talent" element={<BrowseTalent />} />
          <Route path="/talent/:id" element={<TalentProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Dashboard Protected Routes */}
          <Route path="/dashboard/*" element={<DashboardRoutes />} />
          <Route path="/freelancer/dashboard/*" element={<DashboardRoutes />} />
          <Route path="/client/dashboard/*" element={<DashboardRoutes />} />
          
          <Route 
            path="/messages/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route index element={<Messages />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!isDashboard && !isAuth && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
