import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase } from 'lucide-react';

interface JobCardProps {
  id: string;
  title: string;
  budget: string;
  category: string;
  location: string;
  postedAt: string;
}

const JobCard: React.FC<JobCardProps> = ({ id, title, budget, category, location, postedAt }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-2">
            {category}
          </span>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            <Link to={`/jobs/${id}`} className="hover:text-primary-600 transition-colors">
              {title}
            </Link>
          </h3>
        </div>
        <button className="text-gray-400 hover:text-primary-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
      
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
        <div className="flex items-center text-primary-600 font-bold">
          <span className="mr-1">SLE</span>
          <span>{budget}</span>
        </div>
        <div className="flex items-center">
          <MapPin size={16} className="mr-1 text-gray-400" />
          <span>{location}</span>
        </div>
        <div className="flex items-center">
          <Clock size={16} className="mr-1 text-gray-400" />
          <span>{postedAt}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
            <Briefcase size={14} className="text-gray-500" />
          </div>
          <span className="text-sm font-medium text-gray-700">Client Verified</span>
        </div>
        <Link 
          to={`/jobs/${id}`} 
          className="text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
