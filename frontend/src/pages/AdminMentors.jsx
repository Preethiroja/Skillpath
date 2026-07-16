import React from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminUserManager from '../components/AdminUserManager';

const AdminMentors = () => (
  <AdminLayout>
    <AdminUserManager role="mentor" title="Manage Mentors" emptyLabel="No mentors found." />
  </AdminLayout>
);

export default AdminMentors;
