import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { StickyNote, Plus, Pin, Trash2, Search, X, Save } from 'lucide-react';
import Layout from '../components/Layout';

const emptyDraft = { title: '', content: '', tags: '' };

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchNotes = (searchTerm = '') => {
    setIsLoading(true);
    api.get('/student/notes', { params: searchTerm ? { search: searchTerm } : {} })
      .then((res) => setNotes(res.data.notes))
      .catch(() => toast.error('Could not load notes'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => fetchNotes(search), 350);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openNewNoteForm = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setIsFormOpen(true);
  };

  const openEditForm = (note) => {
    setEditingId(note._id);
    setDraft({ title: note.title, content: note.content, tags: note.tags.join(', ') });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!draft.content.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }
    const payload = {
      title: draft.title || 'Untitled Note',
      content: draft.content,
      tags: draft.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/student/notes/${editingId}`, payload);
        toast.success('Note updated');
      } else {
        await api.post('/student/notes', payload);
        toast.success('Note created');
      }
      setIsFormOpen(false);
      fetchNotes(search);
    } catch {
      toast.error('Could not save note');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/student/notes/${id}`);
      toast.success('Note deleted');
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error('Could not delete note');
    }
  };

  const handleTogglePin = async (note) => {
    try {
      const res = await api.put(`/student/notes/${note._id}`, { pinned: !note.pinned });
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? res.data.note : n)).sort((a, b) => (b.pinned - a.pinned))
      );
    } catch {
      toast.error('Could not update note');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <StickyNote size={20} className="text-violet-600" /> Notes
            </h2>
            <p className="text-xs text-slate-500 mt-1">Jot down ideas, code snippets, and takeaways as you learn.</p>
          </div>
          <button
            onClick={openNewNoteForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-xs shadow-lg shadow-violet-600/20 transition-all"
          >
            <Plus size={14} /> New Note
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {isFormOpen && (
          <div className="glass-card rounded-3xl p-5 space-y-3 border-violet-300/50 dark:border-violet-800/50">
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Note title"
              className="w-full bg-transparent font-semibold text-sm focus:outline-none border-b border-slate-200 dark:border-slate-800 pb-2"
            />
            <textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="Write your note..."
              rows={5}
              className="w-full bg-transparent text-sm focus:outline-none resize-none"
            />
            <input
              type="text"
              value={draft.tags}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              placeholder="Tags, comma separated (e.g. react, hooks)"
              className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
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
                <Save size={14} /> {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs glass-card rounded-3xl">
            <StickyNote size={36} className="mx-auto text-slate-300 dark:text-slate-800 mb-3" />
            <p>No notes yet. Capture your first learning insight!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div key={note._id} className="glass-card rounded-3xl p-5 flex flex-col justify-between h-48">
                <div className="overflow-hidden">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-sm truncate pr-2">{note.title}</h4>
                    <button onClick={() => handleTogglePin(note)} className="shrink-0">
                      <Pin
                        size={15}
                        className={note.pinned ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-4">{note.content}</p>
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[9px] bg-violet-100 dark:bg-violet-900/40 text-violet-600 px-2 py-0.5 rounded-full font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEditForm(note)} className="text-[10px] text-violet-500 hover:underline font-semibold">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(note._id)} className="text-rose-400 hover:text-rose-600">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notes;
