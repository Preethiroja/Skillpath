import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Search, Plus, Trash2, Pencil, X, Save, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const RESOURCE_TYPES = ['video', 'book', 'article', 'documentation', 'github_project', 'practice_problem', 'coding_challenge'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const emptyDraft = {
  title: '',
  type: 'video',
  url: '',
  description: '',
  tags: '',
  duration: '',
  difficulty: 'All',
  isSystemApproved: true,
};

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);

  const fetchResources = (targetPage = page, searchTerm = search, type = typeFilter) => {
    setIsLoading(true);
    api.get('/admin/resources', { params: { search: searchTerm, type: type || undefined, page: targetPage, limit: 10 } })
      .then((res) => {
        setResources(res.data.resources);
        setPages(res.data.pages);
        setTotal(res.data.total);
      })
      .catch(() => toast.error('Could not load resources'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchResources(1, '', ''); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    const delay = setTimeout(() => { setPage(1); fetchResources(1, search, typeFilter); }, 350);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter]);

  const openNewForm = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setIsFormOpen(true);
  };

  const openEditForm = (resource) => {
    setEditingId(resource._id);
    setDraft({ ...resource, tags: (resource.tags || []).join(', ') });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.url.trim()) {
      toast.error('Title and URL are required');
      return;
    }
    const payload = { ...draft, tags: draft.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    try {
      if (editingId) {
        await api.put(`/admin/resources/${editingId}`, payload);
        toast.success('Resource updated');
      } else {
        await api.post('/admin/resources', payload);
        toast.success('Resource created');
      }
      setIsFormOpen(false);
      fetchResources(page, search, typeFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save resource');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource permanently?')) return;
    try {
      await api.delete(`/admin/resources/${id}`);
      toast.success('Resource deleted');
      setResources((prev) => prev.filter((r) => r._id !== id));
      setTotal((t) => t - 1);
    } catch {
      toast.error('Could not delete resource');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-base">
            Manage Resources <span className="text-slate-400 font-normal text-sm">({total})</span>
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">All types</option>
              {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 w-44"
              />
            </div>
            <button
              onClick={openNewForm}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shrink-0"
            >
              <Plus size={14} /> New Resource
            </button>
          </div>
        </div>

        {isFormOpen && (
          <div className="glass-card rounded-3xl p-5 space-y-3 border-violet-300/50 dark:border-violet-800/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Resource title"
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
              <input
                value={draft.url}
                onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                placeholder="Resource URL"
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 sm:col-span-2"
              />
              <select
                value={draft.difficulty}
                onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })}
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                value={draft.duration}
                onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                placeholder="Duration (e.g. 15 mins)"
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                value={draft.tags}
                onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                placeholder="Tags, comma separated"
                className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 sm:col-span-2"
              />
              <label className="flex items-center gap-2 text-xs text-slate-500 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={draft.isSystemApproved}
                  onChange={(e) => setDraft({ ...draft, isSystemApproved: e.target.checked })}
                  className="rounded"
                />
                Approved (visible in AI-recommended learning paths)
              </label>
            </div>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Description"
              rows={2}
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

        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400">Loading...</td></tr>
                ) : resources.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400">No resources found.</td></tr>
                ) : (
                  resources.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 max-w-xs truncate">
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline">
                          {r.title} <ExternalLink size={11} className="text-slate-400 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 capitalize">{r.type.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 text-slate-500">{r.difficulty}</td>
                      <td className="py-3.5 px-4">
                        {r.isSystemApproved ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500"><CheckCircle2 size={11} /> Approved</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500"><Clock size={11} /> Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditForm(r)} className="text-violet-500 hover:text-violet-700">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(r._id)} className="text-rose-400 hover:text-rose-600">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t border-slate-100 dark:border-slate-800">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPage(i + 1); fetchResources(i + 1, search, typeFilter); }}
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
      </div>
    </AdminLayout>
  );
};

export default AdminResources;
