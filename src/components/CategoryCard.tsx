import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryCardProps {
  name: string;
  iconName: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, iconName }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[iconName];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-300 cursor-pointer group">
      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 mb-4 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
        {Icon && <Icon size={24} />}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{name}</h3>
      <p className="text-sm text-gray-500">200+ Openings</p>
    </div>
  );
};

export default CategoryCard;
