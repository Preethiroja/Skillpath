import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Search, Plus, Trash2, Pencil, X, Save, Star } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const emptyDraft = {
  title: '',
  description: '',
  instructor: 'SkillPath AI Creator',
  platform: 'Internal',
  url: '',
  rating: 4.5,
  duration: '2 hours',
  category: 'General',
  level: 'All Levels',
  thumbnail: '',
};

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);

  const fetchCourses = (targetPage = page, searchTerm = search) => {
    setIsLoading(true);
    api.get('/admin/courses', { params: { search: searchTerm, page: targetPage, limit: 9 } })
      .then((res) => {
        setCourses(res.data.courses);
        setPages(res.data.pages);
        setTotal(res.data.total);
      })
      .catch(() => toast.error('Could not load courses'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchCourses(1, ''); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    const delay = setTimeout(() => { setPage(1); fetchCourses(1, search); }, 350);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openNewForm = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setIsFormOpen(true);
  };

  const openEditForm = (course) => {
    setEditingId(course._id);
    setDraft({ ...emptyDraft, ...course });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/admin/courses/${editingId}`, draft);
        toast.success('Course updated');
      } else {
        await api.post('/admin/courses', draft);
        toast.success('Course created');
      }
      setIsFormOpen(false);
      fetchCourses(page, search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save course');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course permanently?')) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      toast.success('Course deleted');
      setCourses((prev) => prev.filter((c) => c._id !== id));
      setTotal((t) => t - 1);
    } catch {
      toast.error('Could not delete course');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-base">
            Manage Courses <span className="text-slate-400 font-normal text-sm">({total})</span>
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 w-48"
              />
            </div>
            <button
              onClick={openNewForm}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shrink-0"
            >
              <Plus size={14} /> New Course
            </button>
          </div>
        </div>

        {isFormOpen && (
          <div className="glass-card rounded-3xl p-5 space-y-3 border-violet-300/50 dark:border-violet-800/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Course title"
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                value={draft.instructor}
                onChange={(e) => setDraft({ ...draft, instructor: e.target.value })}
                placeholder="Instructor"
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <select
                value={draft.platform}
                onChange={(e) => setDraft({ ...draft, platform: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {['Internal', 'YouTube', 'Udemy', 'Coursera', 'Other'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={draft.level}
                onChange={(e) => setDraft({ ...draft, level: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {['All Levels', 'Beginner', 'Intermediate', 'Advanced'].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <input
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                placeholder="Category (e.g. Web Development)"
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                value={draft.duration}
                onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                placeholder="Duration (e.g. 12 hours)"
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                value={draft.url}
                onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                placeholder="Course URL"
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 sm:col-span-2"
              />
              <input
                value={draft.thumbnail}
                onChange={(e) => setDraft({ ...draft, thumbnail: e.target.value })}
                placeholder="Thumbnail image URL"
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 sm:col-span-2"
              />
              <input
                type="number" min="1" max="5" step="0.1"
                value={draft.rating}
                onChange={(e) => setDraft({ ...draft, rating: parseFloat(e.target.value) })}
                placeholder="Rating (1-5)"
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Course description"
              rows={3}
              className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsFormOpen(false)}
                className="flex items-center gap-1.5 px-4 py-2 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-semibold"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold"
              >
                <Save size={14} /> {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs glass-card rounded-3xl">
            No courses found. Create your first one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <div key={c._id} className="glass-card rounded-3xl overflow-hidden flex flex-col">
                <div
                  className="h-24 bg-cover bg-center"
                  style={{ backgroundImage: `url(${c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400'})` }}
                />
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] bg-violet-100 dark:bg-violet-900/40 text-violet-600 px-2 py-0.5 rounded-full font-semibold">{c.platform}</span>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-semibold">{c.level}</span>
                  </div>
                  <h4 className="font-bold text-sm mb-1 line-clamp-1">{c.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 flex-1">{c.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                      <Star size={11} className="fill-amber-500" /> {c.rating}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditForm(c)} className="text-violet-500 hover:text-violet-700">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="text-rose-400 hover:text-rose-600">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 py-2">
            {[...Array(pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { setPage(i + 1); fetchCourses(i + 1, search); }}
                className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                  page === i + 1 ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCourses;
