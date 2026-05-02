import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, MapPin } from 'lucide-react';

interface TalentCardProps {
  id: string;
  name: string;
  skill: string;
  rating: number;
  price: string;
  avatar: string;
  avatarUrl?: string | null;
  skills?: string[] | string | null;
  location?: string | null;
}

const TalentCard: React.FC<TalentCardProps> = ({ id, name, skill, rating, price, avatar, avatarUrl, skills, location }) => {
  const renderedSkills = React.useMemo(() => {
    if (!skills) return ['Expert', 'Verified'];
    const skillsArray = Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : [];
    return skillsArray.length > 0 ? skillsArray.slice(0, 2) : ['Expert', 'Verified'];
  }, [skills]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-6 group">
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xl font-bold mr-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            avatar
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
            {name}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-1">{skill}</p>
          {location && (
            <div className="flex items-center text-gray-400 text-xs mt-1">
              <MapPin size={12} className="mr-1" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-sm font-medium">
          <Star size={16} className="text-yellow-400 fill-current mr-1" />
          <span className="text-gray-900 font-bold">
            {rating && Number(rating) > 0 ? Number(rating).toFixed(1) : 'New'}
          </span>
        </div>
        <div className="flex items-center text-sm font-bold text-primary-600">
          <span className="mr-1">SLE</span>
          <span>{price}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {renderedSkills.map((s, idx) => (
          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
            {s}
          </span>
        ))}
      </div>
      
      <Link 
        to={`/talent/${id}`}
        className="flex items-center justify-center w-full py-2.5 border border-primary-600 text-primary-600 rounded-lg font-semibold text-sm hover:bg-primary-600 hover:text-white transition-all duration-300"
      >
        View Profile <ArrowRight size={16} className="ml-2" />
      </Link>
    </div>
  );
};

export default TalentCard;
