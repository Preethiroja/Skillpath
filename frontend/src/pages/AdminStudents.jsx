import React from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminUserManager from '../components/AdminUserManager';

const AdminStudents = () => (
  <AdminLayout>
    <AdminUserManager role="student" title="Manage Students" emptyLabel="No students found." />
  </AdminLayout>
);

export default AdminStudents;
