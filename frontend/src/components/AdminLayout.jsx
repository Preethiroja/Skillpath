import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from './Layout';

const tabs = [
  { name: 'Overview', path: '/admin' },
  { name: 'Students', path: '/admin/students' },
  { name: 'Mentors', path: '/admin/mentors' },
  { name: 'Courses', path: '/admin/courses' },
  { name: 'Resources', path: '/admin/resources' },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </Layout>
  );
};

export default AdminLayout;
