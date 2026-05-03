import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Star, Search, Loader2, Trash2, Flag } from 'lucide-react';

interface Review {
  id: string;
  created_at: string;
  rating: number;
  comment: string | null;
  freelancer_id: string;
  reviewer_id: string;
  freelancer_name?: string;
  reviewer_name?: string;
}

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          freelancer:public_profiles!freelancer_id(full_name),
          reviewer:public_profiles!reviewer_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback if relationship naming is different
        console.warn('Relationships might be named differently, trying simpler fetch');
        const { data: simpleData, error: simpleError } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (simpleError) throw simpleError;

        // Manually fetch profile names
        const enriched = await Promise.all((simpleData || []).map(async (r: any) => {
          const [fRes, rRes] = await Promise.all([
            supabase.from('public_profiles').select('full_name').eq('id', r.freelancer_id).single(),
            supabase.from('public_profiles').select('full_name').eq('id', r.reviewer_id).single()
          ]);
          return {
            ...r,
            freelancer_name: fRes.data?.full_name || 'Unknown',
            reviewer_name: rRes.data?.full_name || 'Unknown'
          };
        }));
        setReviews(enriched);
      } else {
        const mapped = (data || []).map((r: any) => ({
          ...r,
          freelancer_name: r.freelancer?.full_name || 'Unknown',
          reviewer_name: r.reviewer?.full_name || 'Unknown'
        }));
        setReviews(mapped);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setActionLoading(reviewId);
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
      setReviews(reviews.filter(r => r.id !== reviewId));
      alert('Review deleted successfully');
    } catch (error: any) {
      alert('Error deleting review: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter(review => 
    review.freelancer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.reviewer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-500">Manage platform feedback and ratings.</p>
        </div>
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-primary-600 mx-auto" size={32} />
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Freelancer</th>
                  <th className="px-6 py-4">Reviewer</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Comment</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {review.freelancer_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {review.reviewer_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < review.rating ? 'currentColor' : 'none'} 
                            className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {review.comment || <span className="italic">No comment</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-amber-600 transition-colors" title="Flag Review">
                          <Flag size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={actionLoading === review.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                          title="Delete Review"
                        >
                          {actionLoading === review.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No reviews found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
