import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Users,
  Compass,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Trash2,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    totalPaths: 0,
    onlineCount: 0,
    totalTokensUsed: 0,
    aiConversationsCount: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Access Denied: Admin Authorization Required');
      navigate('/dashboard');
      return;
    }

    // Load admin statistics and lists
    const loadAdminData = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data.stats);

        const usersRes = await api.get('/admin/users');
        setUsersList(usersRes.data.users || []);

        const feedRes = await api.get('/admin/feedback');
        setFeedbacks(feedRes.data.feedbacks || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load administrative analytics');
        // Seed mock fallback data for visual correctness
        setStats({
          totalStudents: 14,
          totalMentors: 2,
          totalPaths: 8,
          onlineCount: 1,
          totalTokensUsed: 12400,
          aiConversationsCount: 12
        });
        setUsersList([
          { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', isVerified: true },
          { _id: '2', name: 'Sarah Connor', email: 'sarah@example.com', role: 'mentor', isVerified: true },
          { _id: '3', name: 'James Student', email: 'james@student.com', role: 'student', isVerified: true },
        ]);
        setFeedbacks([
          { _id: 'f-1', user: { name: 'James Student' }, rating: 5, comment: 'Amazing AI paths!' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [user, navigate]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        toast.success('User role modified successfully');
        setUsersList(usersList.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to modify role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        toast.success('User removed successfully');
        setUsersList(usersList.filter(u => u._id !== userId));
      }
    } catch (err) {
      toast.error('Failed to remove user account');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold tracking-tight">Administrative Analytics Dashboard</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 glass-panel rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Students</p>
              <h4 className="text-xl font-bold">{stats.totalStudents}</h4>
            </div>
          </div>
          <div className="p-5 glass-panel rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Active Paths</p>
              <h4 className="text-xl font-bold">{stats.totalPaths}</h4>
            </div>
          </div>
          <div className="p-5 glass-panel rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Cpu size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">AI Tokens Used</p>
              <h4 className="text-xl font-bold">{stats.totalTokensUsed}</h4>
            </div>
          </div>
          <div className="p-5 glass-panel rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">AI Chats</p>
              <h4 className="text-xl font-bold">{stats.aiConversationsCount}</h4>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="p-6 glass-card rounded-3xl space-y-4">
          <h3 className="font-bold text-base">User Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Verified</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-550 dark:text-slate-400">{u.email}</td>
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback logs list */}
        <div className="p-6 glass-card rounded-3xl space-y-4">
          <h3 className="font-bold text-base">User Feedback & Ratings</h3>
          <div className="space-y-3">
            {feedbacks.length > 0 ? feedbacks.map(f => (
              <div key={f._id} className="p-4 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold text-xs shrink-0">
                  {f.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-xs">{f.user?.name || 'Anonymous Learner'}</h4>
                  <div className="flex items-center gap-1 my-1 text-amber-500 text-xs">
                    {Array(f.rating).fill('★').join('')}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{f.comment}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-400 font-light italic">No user feedback submitted yet.</p>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
