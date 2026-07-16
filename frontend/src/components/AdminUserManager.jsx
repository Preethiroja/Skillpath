import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Search, Trash2, ShieldCheck, ShieldOff, X, KeyRound } from 'lucide-react';

const AdminUserManager = ({ role, title, emptyLabel }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);

  const fetchUsers = (targetPage = page, searchTerm = search) => {
    setIsLoading(true);
    api.get('/admin/users', { params: { role, search: searchTerm, page: targetPage, limit: 10 } })
      .then((res) => {
        setUsers(res.data.users);
        setPages(res.data.pages);
        setTotal(res.data.total);
      })
      .catch(() => toast.error(`Could not load ${title.toLowerCase()}`))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers(1, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchUsers(1, search);
    }, 350);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const goToPage = (p) => {
    setPage(p);
    fetchUsers(p, search);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Role updated');
      fetchUsers(page, search);
    } catch {
      toast.error('Could not update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this account permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User removed');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setTotal((t) => t - 1);
    } catch {
      toast.error('Could not delete user');
    }
  };

  const handleResetPassword = async (userId, name) => {
    if (!window.confirm(`Reset ${name}'s password? They'll need the new temporary password to sign in.`)) return;
    try {
      const res = await api.put(`/admin/users/${userId}/reset-password`);
      window.prompt(
        `Temporary password for ${name} (share this with them directly — it won't be shown again):`,
        res.data.tempPassword
      );
      toast.success('Password reset');
    } catch {
      toast.error('Could not reset password');
    }
  };

  const openDetail = async (userId) => {
    setSelectedId(userId);
    setDetail(null);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setDetail(res.data);
    } catch {
      toast.error('Could not load user detail');
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-bold text-base">
          {title} <span className="text-slate-400 font-normal text-sm">({total})</span>
        </h3>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 w-56"
          />
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">{emptyLabel}</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                      <button onClick={() => openDetail(u._id)} className="hover:underline text-left">
                        {u.name}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-transparent border border-slate-200/50 dark:border-slate-800 rounded-md py-1 px-2 outline-none text-xs text-slate-500"
                      >
                        <option value="student">student</option>
                        <option value="mentor">mentor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
                          u.isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {u.isVerified ? <ShieldCheck size={10} /> : <ShieldOff size={10} />}
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleResetPassword(u._id, u.name)}
                          title="Reset password"
                          className="p-1.5 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          <KeyRound size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          title="Delete account"
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
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
                onClick={() => goToPage(i + 1)}
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

      {selectedId && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={closeDetail}
        >
          <div className="glass-card rounded-3xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {!detail ? (
              <p className="text-xs text-slate-400 text-center py-10">Loading details...</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-lg">
                      {detail.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{detail.user.name}</h4>
                      <p className="text-xs text-slate-400">{detail.user.email}</p>
                    </div>
                  </div>
                  <button onClick={closeDetail} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl">
                    <p className="text-lg font-bold">{detail.pathsCount}</p>
                    <p className="text-[10px] text-slate-400 uppercase">Paths Started</p>
                  </div>
                  <div className="p-3 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl">
                    <p className="text-lg font-bold">{detail.completedPathsCount}</p>
                    <p className="text-[10px] text-slate-400 uppercase">Paths Completed</p>
                  </div>
                  <div className="p-3 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl">
                    <p className="text-lg font-bold">{detail.progress?.currentStreak || 0}</p>
                    <p className="text-[10px] text-slate-400 uppercase">Day Streak</p>
                  </div>
                  <div className="p-3 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl">
                    <p className="text-lg font-bold">{detail.progress?.points || 0}</p>
                    <p className="text-[10px] text-slate-400 uppercase">Points</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManager;
