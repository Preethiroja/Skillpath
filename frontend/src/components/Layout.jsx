import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import {
  LayoutDashboard,
  Map,
  MessageSquare,
  Bot,
  Award,
  Bell,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ShieldAlert,
  User as UserIcon,
  Calendar,
  Timer,
  Trophy,
  StickyNote,
  Heart,
  Medal,
  Compass
} from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);

  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Career Discovery', path: '/career-discovery', icon: Compass },
    { name: 'Learning Paths', path: '/paths', icon: Map },
    { name: 'AI Mentor', path: '/ai-mentor', icon: Bot },
    { name: 'Support Chat', path: '/support-chat', icon: MessageSquare },
    { name: 'Certificates', path: '/certificates', icon: Award },
    { name: 'Study Timer', path: '/study-timer', icon: Timer },
    { name: 'Notes', path: '/notes', icon: StickyNote },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'Badges', path: '/badges', icon: Medal },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  const adminNavItems = [
    { name: 'Admin Panel', path: '/admin', icon: ShieldAlert },
  ];

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-slate-200/50 dark:border-slate-800/40 transform transition-transform duration-300 md:translate-x-0 md:static md:flex md:flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-800/40">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            <span>🚀 SkillPath AI</span>
          </Link>
          <button className="md:hidden text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/40">
          <div className="flex items-center gap-3 p-2 bg-slate-100/50 dark:bg-slate-900/40 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate">{user?.name || 'Loading user...'}</h4>
              <p className="text-xs text-slate-500 capitalize">{user?.role || 'student'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPath.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Admin Navigation */}
          {user?.role === 'admin' && (
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/40 mt-4">
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase mb-2">Management</p>
              {adminNavItems.map((item) => {
                const isActive = currentPath.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-rose-600/80 hover:bg-rose-50 dark:hover:bg-rose-950/20'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/40">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-0 min-w-0">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-800/40 glass-panel sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-lg hidden md:block capitalize">
              {currentPath.substring(1).replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>

          {/* Action Center */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 hover:text-violet-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-slate-500 hover:text-violet-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Basic Notification Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl p-4 shadow-2xl z-50 text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h5 className="font-semibold text-sm">Notifications</h5>
                    <Link to="/notifications" className="text-xs text-violet-600 hover:underline" onClick={() => setNotifDropdownOpen(false)}>View All</Link>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {unreadCount === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No unread notifications</p>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-1">You have {unreadCount} new alerts</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar click leads to settings */}
            <Link to="/profile" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
