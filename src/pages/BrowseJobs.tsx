import React, { useEffect, useState } from 'react';
import JobCard from '../components/JobCard';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { fetchJobs } from '../services/marketplaceService';

const BrowseJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Array<{
    id: string;
    title: string;
    budget: string;
    category: string;
    location: string;
    postedAt: string;
  }>>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await fetchJobs();
        setJobs(
          data.map((job) => ({
            id: job.id,
            title: job.title,
            budget: job.budget,
            category: job.category,
            location: job.location ?? 'Remote',
            postedAt: job.postedAt,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setJobs([]);
      }
    };

    loadJobs();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">Find your next opportunity</h1>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm shadow-sm"
                placeholder="Search jobs..."
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4">
               <button 
                 onClick={() => setShowFilters(!showFilters)}
                 className="lg:hidden flex items-center px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
               >
                 <Filter size={18} className="mr-2" /> Filters
               </button>
               <button className="hidden sm:flex items-center px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                 <SlidersHorizontal size={18} className="mr-2" /> Budget
               </button>
               <button className="flex-1 sm:flex-none bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                 Find Jobs
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters - Desktop & Mobile Toggle */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64 space-y-8 bg-white lg:bg-transparent p-6 lg:p-0 rounded-2xl border border-gray-100 lg:border-0 shadow-sm lg:shadow-none`}>
            <div>
              <div className="flex justify-between items-center mb-4 lg:mb-4">
                <h3 className="text-lg font-bold text-gray-900">Job Type</h3>
                <button onClick={() => setShowFilters(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {['Fixed Price', 'Hourly', 'Contract', 'Full-time'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    <span className="ml-3 text-sm text-gray-600">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Experience Level</h3>
              <div className="space-y-3">
                {['Entry Level', 'Intermediate', 'Expert'].map((level) => (
                  <label key={level} className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    <span className="ml-3 text-sm text-gray-600">{level}</span>
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

          {/* Job List */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">Showing <span className="font-bold text-gray-900">{jobs.length}</span> jobs</p>
              <select className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer">
                <option>Newest first</option>
                <option>Highest budget</option>
                <option>Most relevant</option>
              </select>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {jobs.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseJobs;
