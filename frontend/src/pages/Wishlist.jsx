import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Heart, ExternalLink, Trash2, BookOpen, Video } from 'lucide-react';
import Layout from '../components/Layout';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = () => {
    setIsLoading(true);
    api.get('/student/wishlist')
      .then((res) => setItems(res.data.items))
      .catch(() => toast.error('Could not load wishlist'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/student/wishlist/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Could not remove item');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Heart size={20} className="text-rose-500" /> Wishlist
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Resources and courses you've saved to revisit later. Save items from any learning path node.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs glass-card rounded-3xl">
            <Heart size={36} className="mx-auto text-slate-300 dark:text-slate-800 mb-3" />
            <p>Your wishlist is empty. Open any learning path and tap "Save" on a resource to add it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((entry) => {
              const item = entry.item;
              if (!item) return null;
              const isCourse = entry.itemType === 'Course';
              return (
                <div key={entry._id} className="glass-card rounded-3xl p-5 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                    {isCourse ? <BookOpen size={16} className="text-violet-600" /> : <Video size={16} className="text-violet-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-semibold">{entry.itemType}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:underline"
                      >
                        <ExternalLink size={11} /> Open
                      </a>
                      <button
                        onClick={() => handleRemove(entry._id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-600"
                      >
                        <Trash2 size={11} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
