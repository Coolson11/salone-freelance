import React from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  totalTalents: number;
  totalJobs: number;
  averageRating: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ totalTalents, totalJobs, averageRating }) => {
  return (
    <div className="relative bg-white overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1>
              <span className="block text-sm font-semibold uppercase tracking-wide text-primary-600 sm:text-base lg:text-sm xl:text-base mb-4">
                The Future of Work in Sierra Leone
              </span>
              <span className="block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl text-gray-900 leading-tight">
                Hire the best talent <br />
                <span className="text-primary-600">for your next project</span>
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 sm:max-w-xl sm:mx-auto lg:mx-0">
              Work with verified professionals from across Sierra Leone. From web development to digital marketing, find the expertise you need to grow.
            </p>
            
            <div className="mt-10 sm:max-w-xl sm:mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row bg-white rounded-xl shadow-lg border border-gray-100 p-2 gap-2">
                <div className="flex-1 relative flex items-center px-4 py-3 sm:py-0">
                  <Search size={20} className="text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search for skills or jobs"
                    className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="hidden sm:block w-px h-10 bg-gray-100 self-center"></div>
                <div className="flex-1 relative flex items-center px-4 py-3 sm:py-0">
                  <MapPin size={20} className="text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Freetown or Remote"
                    className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-bold transition duration-150 ease-in-out">
                  Search
                </button>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="text-sm text-gray-500 font-medium self-center">Popular:</span>
                <Link to="/jobs" className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-semibold text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">Web Design</Link>
                <Link to="/jobs" className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-semibold text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">Logo Design</Link>
                <Link to="/jobs" className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-semibold text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">SEO</Link>
              </div>
            </div>
            
            <div className="mt-12 flex items-center space-x-8">
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalTalents.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Talents</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalJobs.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Jobs Posted</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}/5</p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6 relative">
            <div className="relative mx-auto w-full rounded-2xl shadow-2xl overflow-hidden max-w-lg aspect-square bg-gray-50 border border-gray-100 flex items-center justify-center">
              <div className="p-8 text-center">
                 <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 mx-auto transform -rotate-12 overflow-hidden shadow-lg border-2 border-white">
                   <img src="/SF-logo.png" alt="Logo" className="w-full h-full object-cover" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">Start your journey today</h3>
                 <p className="text-gray-500 mb-8">Join thousands of businesses and freelancers building the future of Sierra Leone.</p>
                 <Link to="/signup" className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
                   Create Account <ArrowRight size={20} className="ml-2" />
                 </Link>
              </div>
              {/* Abstract decorative elements */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
