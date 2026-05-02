import React, { useEffect, useState } from 'react';
import TalentCard from '../components/TalentCard';
import { Search, MapPin, Star, Filter, X } from 'lucide-react';
import { fetchTalentProfiles } from '../services/marketplaceService';
import { supabase } from '../supabaseClient';
import { TalentCardSkeleton } from '../components/Skeletons';

const BrowseTalent: React.FC = () => {
  const [talent, setTalent] = useState<Array<{ id: string; name: string; skill: string; rating: number; price: string; avatar: string; avatarUrl?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadTalent = async () => {
      setLoading(true);
      try {
        const profiles = await fetchTalentProfiles();
        const mapped = await Promise.all(
          profiles.map(async (profile) => {
            let avgRating = 0;
            try {
              const { data: simpleReviews } = await supabase
                .from('reviews')
                .select('rating')
                .eq('freelancer_id', profile.id);
              
              if (simpleReviews && simpleReviews.length > 0) {
                const total = simpleReviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0);
                avgRating = total / simpleReviews.length;
              }
            } catch (e) {
              console.warn(`Rating fetch failed for ${profile.id}`);
            }

            const displayName = profile.full_name || 'Freelancer User';
            const parts = displayName.split(' ');
            const avatar = `${parts[0]?.[0] ?? 'F'}${parts[1]?.[0] ?? 'U'}`.toUpperCase();
            return {
              id: profile.id,
              name: displayName,
              skill: profile.bio ? (profile.bio.length > 50 ? profile.bio.slice(0, 50) + '...' : profile.bio) : 'Freelancer',
              rating: avgRating,
              price: profile.hourly_rate ? `SLE ${profile.hourly_rate} / hr` : 'Rate not set',
              avatar,
              avatarUrl: profile.avatar_url
            };
          })
        );
        setTalent(mapped);
      } catch (error) {
        console.error('Failed to load talent:', error);
        setTalent([]);
      } finally {
        setLoading(false);
      }
    };

    loadTalent();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-primary-900 text-white pt-12 sm:pt-16 pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 leading-tight">Hire the best freelancers for any job, online.</h1>
            <p className="text-primary-100 text-base sm:text-lg mb-8 sm:mb-10 opacity-80">Thousands of businesses use Salone Freelance to turn their ideas into reality.</p>
            
            <div className="flex flex-col sm:flex-row bg-white rounded-2xl p-2 gap-2 shadow-2xl">
              <div className="flex-1 relative flex items-center px-4 py-3 sm:py-0">
                <Search size={20} className="text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="What skill are you looking for?"
                  className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-150 ease-in-out whitespace-nowrap">
                Search Talent
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10">
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
               <p className="font-bold text-gray-900">Filters</p>
               <button 
                 onClick={() => setShowFilters(!showFilters)}
                 className="p-2 bg-gray-50 rounded-lg text-primary-600"
               >
                 <Filter size={20} />
               </button>
            </div>

            {/* Filters Sidebar */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1 space-y-6`}>
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                      <MapPin size={18} className="mr-2 text-primary-600" /> Location
                    </h3>
                    <button onClick={() => setShowFilters(false)} className="lg:hidden text-gray-400">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {['Freetown', 'Bo', 'Kenema', 'Makeni', 'Remote'].map((loc) => (
                      <label key={loc} className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary-600 border-gray-300 rounded" />
                        <span className="ml-3 text-sm text-gray-600">{loc}</span>
                      </label>
                    ))}
                  </div>
               </div>
               
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <Star size={18} className="mr-2 text-primary-600" /> Minimum Rating
                  </h3>
                  <div className="space-y-3">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <label key={rating} className="flex items-center">
                        <input type="radio" name="rating" className="h-4 w-4 text-primary-600 border-gray-300" />
                        <span className="ml-3 text-sm text-gray-600">{rating}+ Stars</span>
                      </label>
                    ))}
                  </div>
               </div>

               <button 
                 onClick={() => setShowFilters(false)}
                 className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold lg:hidden"
               >
                 Apply Filters
               </button>
            </div>

            {/* Talent Grid */}
            <div className="lg:col-span-3">
               <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                 <div className="text-gray-600 min-h-[1.5rem]">
                   {loading ? (
                     <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                   ) : (
                     `Found ${talent.length} professionals`
                   )}
                 </div>
                 <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <select className="bg-transparent text-sm font-bold text-gray-900 focus:outline-none cursor-pointer">
                      <option>Top Rated</option>
                      <option>Newest</option>
                      <option>Lowest Rate</option>
                    </select>
                 </div>
               </div>
               
               {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <TalentCardSkeleton />
                   <TalentCardSkeleton />
                   <TalentCardSkeleton />
                   <TalentCardSkeleton />
                   <TalentCardSkeleton />
                   <TalentCardSkeleton />
                 </div>
               ) : talent.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {talent.map((t) => (
                     <TalentCard key={t.id} {...t} />
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                   <p className="text-gray-500">No professionals found matching your criteria.</p>
                 </div>
               )}
               
               {talent.length > 0 && (
                 <div className="mt-12 flex justify-center">
                    <button className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                      Load More Talent
                    </button>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default BrowseTalent;
