import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, DollarSign, MessageSquare, Briefcase, ChevronRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { fetchReviewsForFreelancer, fetchTalentProfileById, makeChatId, fetchJobsByClientId, fetchCompletedJobsByFreelancerId } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';

const TalentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const profileData = await fetchTalentProfileById(id);
        setProfile(profileData);

        const reviewsData = await fetchReviewsForFreelancer(id);
        setReviews(reviewsData);

        if (profileData.role === 'client') {
          const clientJobs = await fetchJobsByClientId(id);
          setJobs(clientJobs);
        } else {
          const freelancerJobs = await fetchCompletedJobsByFreelancerId(id);
          setJobs(freelancerJobs);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [id]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    return total / reviews.length;
  }, [reviews]);

  const initials = useMemo(() => {
    if (!profile?.full_name) return 'U';
    const parts = profile.full_name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h2>
          <button onClick={() => navigate(-1)} className="text-primary-600 font-bold hover:underline flex items-center justify-center mx-auto">
             <ArrowLeft size={18} className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Profile Header */}
      <div className="bg-primary-900 text-white pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-primary-200 hover:text-white mb-8 transition-colors">
              <ArrowLeft size={16} className="mr-2" /> Back
           </button>
           
           <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className="w-32 h-32 bg-primary-100 rounded-3xl border-4 border-primary-800 flex items-center justify-center text-primary-700 text-4xl font-extrabold shadow-2xl overflow-hidden flex-shrink-0">
                 {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                 ) : (
                    initials
                 )}
              </div>
              <div className="flex-1 text-center md:text-left">
                 <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                    <h1 className="text-4xl font-extrabold">{profile.full_name}</h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                       <CheckCircle2 size={12} className="mr-1" /> Verified
                    </span>
                 </div>
                 <p className="text-xl text-primary-100 mb-6 opacity-90">{profile.role === 'freelancer' ? 'Expert Freelancer' : 'Trusted Client'}</p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-primary-200">
                    <div className="flex items-center">
                       <MapPin size={18} className="mr-2 opacity-70" /> {profile.location || 'Remote'}
                    </div>
                    {profile.role === 'freelancer' && (
                      <>
                        <div className="flex items-center">
                           <Star size={18} className="mr-2 text-yellow-400 fill-current" /> 
                           {reviews.length > 0 ? `${avgRating.toFixed(1)} (${reviews.length} reviews)` : 'New'}
                        </div>
                        <div className="flex items-center">
                           <DollarSign size={18} className="mr-2 opacity-70" /> {profile.hourly_rate ? `SLE ${profile.hourly_rate} / hr` : 'Rate not set'}
                        </div>
                      </>
                    )}
                 </div>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                 {profile.id !== currentUser?.id && (
                   <Link 
                    to={`/messages?chatId=${makeChatId(currentUser?.id || '', profile.id)}`}
                    className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-900 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-xl shadow-black/10"
                   >
                      <MessageSquare size={18} className="mr-2" /> Send Message
                   </Link>
                 )}
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
               <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.bio || 'No biography provided yet.'}</p>
               </div>

               <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {profile.role === 'client' ? 'Job Postings' : 'Portfolio & History'}
                  </h2>
                  {jobs.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {jobs.map(job => (
                        <div key={job.id} className="py-6 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                               <Briefcase size={24} />
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{job.title}</h4>
                               <p className="text-sm text-gray-500">{job.category} • {job.budget}</p>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-gray-300 group-hover:text-primary-600 transition-all" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No {profile.role === 'client' ? 'posted' : 'completed'} jobs to show.</p>
                  )}
               </div>

               {profile.role === 'freelancer' && (
                 <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
                    {reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map(review => (
                          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'text-gray-200'} />
                                  ))}
                                </div>
                                <span className="text-sm font-bold text-gray-900">{review.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600 italic">"{review.comment}"</p>
                            <p className="text-xs text-gray-500 mt-2">— {review.reviewer?.full_name || 'Anonymous'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No reviews yet.</p>
                    )}
                 </div>
               )}
            </div>

            <div className="lg:col-span-1 space-y-8">
               <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Details</h3>
                  <div className="space-y-6">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Member Since</span>
                        <span className="font-bold text-gray-900">{new Date(profile.created_at).getFullYear()}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TalentProfile;
