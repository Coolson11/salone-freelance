import React, { useEffect, useMemo, useState } from 'react';
import HeroSection from '../components/HeroSection';
import CategoryCard from '../components/CategoryCard';
import JobCard from '../components/JobCard';
import TalentCard from '../components/TalentCard';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  fetchMarketplaceOverviewStats,
  fetchJobs
} from '../services/marketplaceService';
import { CategoryCardSkeleton, JobCardSkeleton, TalentCardSkeleton } from '../components/Skeletons';

const Home: React.FC = () => {
  const [jobs, setJobs] = useState<Array<{ id: string; title: string; budget: string; category: string; location: string; postedAt: string }>>([]);
  const [talent, setTalent] = useState<Array<{ id: string; name: string; skill: string; rating: number; price: string; avatar: string; avatarUrl?: string | null; skills?: string[] | string | null; location?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTalent, setLoadingTalent] = useState(true);
  const [overviewStats, setOverviewStats] = useState({
    totalTalents: 0,
    totalJobs: 0,
    averageRating: 0
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // 1. Stats & Site Audit
      try {
        const stats = await fetchMarketplaceOverviewStats();
        setOverviewStats(stats);
      } catch (err) {}

      // 2. Jobs
      try {
        const jobsData = await fetchJobs();
        setJobs(jobsData.slice(0, 4).map(j => ({
          id: j.id,
          title: j.title,
          budget: j.budget,
          category: j.category,
          location: j.location ?? 'Remote',
          postedAt: j.status === 'in_progress' ? 'In Progress' : 'Active'
        })));
      } catch (e) {
        console.error('Home Page - Error fetching jobs:', e);
      } finally {
        setLoading(false);
      }

      // 3. Talent & Site-Wide Search
      setLoadingTalent(true);
      try {
        const [profRes, reviewsRes] = await Promise.all([
          supabase.from('public_profiles').select('*').ilike('role', 'freelancer').order('created_at', { ascending: false }),
          supabase.from('reviews').select('*')
        ]);

        if (profRes.data) {
          const allR = reviewsRes.data || [];
          const mapped = profRes.data.map(p => {
            // Find reviews for this freelancer
            const matches = allR.filter(r => (r.freelancer_id || r.freelancerId) === p.id);
            
            let val = 0;
            if (matches.length > 0) {
              const sum = matches.reduce((s, r) => s + Number(r.rating || 0), 0);
              val = sum / matches.length;
            }

            return {
              id: p.id,
              name: p.full_name || 'Freelancer',
              skill: p.bio ? (p.bio.length > 40 ? p.bio.slice(0, 40) + '...' : p.bio) : 'Verified Professional',
              rating: val,
              price: p.hourly_rate ? `SLE ${p.hourly_rate} / hr` : 'Rate not set',
              avatar: (p.full_name || 'F').substring(0, 2).toUpperCase(),
              avatarUrl: p.avatar_url,
              skills: p.skills,
              location: p.location
            };
          });
          setTalent(mapped);
        }
      } catch (error) {
        console.error('Failed to load talent:', error);
      } finally {
        setLoadingTalent(false);
      }
    };

    loadData();

    const channel = supabase.channel('home-refresh-v16')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        loadData();
        setTimeout(loadData, 1000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const categories = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    jobs.forEach(job => {
      categoryCounts.set(job.category, (categoryCounts.get(job.category) ?? 0) + 1);
    });
    
    const activeCategories = Array.from(categoryCounts.keys());
    const displayCategories = activeCategories.length > 0 ? activeCategories : ['Development', 'Design', 'Marketing', 'Writing', 'Business', 'Others'];

    return displayCategories.slice(0, 6).map((name, idx) => ({
      id: String(idx + 1),
      name,
      icon: 'Briefcase'
    }));
  }, [jobs]);

  return (
    <div className="bg-white">
      <HeroSection 
        totalTalents={overviewStats.totalTalents} 
        totalJobs={overviewStats.totalJobs} 
        averageRating={overviewStats.averageRating} 
      />
      
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Browse by category</h2>
              <p className="text-gray-500 text-lg">Find the right expertise for every business need.</p>
            </div>
            <Link to="/jobs" className="text-primary-600 font-bold hover:text-primary-700 flex items-center">
              See all categories <ArrowRight size={20} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <>
                <CategoryCardSkeleton />
                <CategoryCardSkeleton />
                <CategoryCardSkeleton />
              </>
            ) : (
              categories.map((cat) => (
                <CategoryCard key={cat.id} name={cat.name} iconName={cat.icon} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Featured Jobs</h2>
              <p className="text-gray-500 text-lg">The latest opportunities in the marketplace.</p>
            </div>
            <Link to="/jobs" className="text-primary-600 font-bold hover:text-primary-700 flex items-center">
              Browse all jobs <ArrowRight size={20} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <JobCard key={job.id} {...job} />
              ))
            ) : (
              <div className="col-span-2 text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">No jobs posted yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold mb-8 leading-tight">Reliable work, <br />trusted by thousands.</h2>
              <div className="space-y-6">
                {[
                  { title: 'Safe Payments', desc: 'Every payment is protected with our escrow system.' },
                  { title: 'Verified Talent', desc: 'We vet every freelancer to ensure high quality work.' },
                  { title: 'Support 24/7', desc: 'Our team is here to help you anytime, anywhere.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                      <p className="text-primary-100 opacity-80">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link to="/signup" className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-bold transition-colors">
                  Get Started Now
                </Link>
              </div>
            </div>
            <div className="mt-16 lg:mt-0 relative">
              <div className="w-full h-96 bg-primary-800 rounded-3xl border border-primary-700 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500 rounded-full blur-[120px] opacity-30"></div>
                <div className="text-center p-8">
                   <div className="text-6xl font-bold mb-2">98%</div>
                   <p className="text-primary-200 text-lg uppercase tracking-widest font-semibold">Client Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Top Talent</h2>
              <p className="text-gray-500 text-lg">Hire experts with a proven track record.</p>
            </div>
            <Link to="/talent" className="text-primary-600 font-bold hover:text-primary-700 flex items-center">
              Find more talent <ArrowRight size={20} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loadingTalent ? (
              <>
                <TalentCardSkeleton />
                <TalentCardSkeleton />
                <TalentCardSkeleton />
                <TalentCardSkeleton />
              </>
            ) : talent.length > 0 ? (
              talent.map((t) => (
                <TalentCard key={t.id} {...t} />
              ))
            ) : (
              <div className="col-span-4 text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">No talents available yet. Join the community!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-12 lg:p-16 shadow-xl flex flex-col lg:flex-row items-center justify-between border border-gray-100">
            <div className="lg:max-w-xl text-center lg:text-left mb-10 lg:mb-0">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">Ready to post your first project?</h2>
              <p className="text-gray-500 text-lg mb-8">It only takes a few minutes to get your job in front of the best professionals.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                  Post a Job
                </Link>
                <Link to="/jobs" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                  Browse Projects
                </Link>
              </div>
            </div>
            <div className="w-48 h-48 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
              <CheckCircle size={96} strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
