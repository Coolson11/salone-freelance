import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Type, AlignLeft, Send } from 'lucide-react';
import { createJob } from '../services/marketplaceService';

const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Development',
    budget: '',
    location: 'Remote'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createJob({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budgetMax: formData.budget ? Number(formData.budget) : null,
        location: formData.location
      });
      navigate('/dashboard/jobs');
    } catch (error) {
      console.error('Failed to post job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-500">Describe the project and the talent you're looking for.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Job Title</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Type size={18} />
              </div>
              <input
                required
                type="text"
                placeholder="e.g. Senior React Developer for Fintech App"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Development</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>Writing</option>
                <option>Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Remote or City"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Job Description</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                <AlignLeft size={18} />
              </div>
              <textarea
                required
                rows={6}
                placeholder="Describe the responsibilities, requirements, and deliverables..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Budget (SLE)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-600 font-bold text-xs">
                SLE
              </div>
              <input
                type="number"
                placeholder="1000"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center disabled:opacity-60"
          >
            {loading ? 'Posting...' : 'Post Job Now'} <Send size={18} className="ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
