import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loadProfile, saveProfile, logoutUser } from '../store/slices/authSlice';
import api from '../utils/api';
import { User, Mail, ShieldAlert, KeyRound, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile, isLoading } = useSelector((state) => state.auth);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm();

  useEffect(() => {
    dispatch(loadProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      resetProfileForm({
        currentTitle: profile.currentTitle || '',
        bio: profile.bio || '',
        educationLevel: profile.educationLevel || 'Bachelor\'s Degree',
        weeklyCommitmentHours: profile.weeklyCommitmentHours || 10,
        preferredLanguage: profile.preferredLanguage || 'English',
        githubProfile: profile.githubProfile || '',
        linkedinProfile: profile.linkedinProfile || '',
      });
    }
  }, [profile, resetProfileForm]);

  const onProfileSave = async (data) => {
    const result = await dispatch(saveProfile(data));
    if (saveProfile.fulfilled.match(result)) {
      toast.success('Profile details saved successfully');
    } else {
      toast.error('Failed to update profile details');
    }
  };

  const onPasswordChange = async (data) => {
    try {
      const res = await api.put('/auth/change-password', data);
      if (res.data.success) {
        toast.success('Password successfully changed');
        resetPasswordForm();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account? This action is irreversible.')) {
      return;
    }

    try {
      const res = await api.delete('/auth/delete-account');
      if (res.data.success) {
        toast.success('Account successfully removed');
        dispatch(logoutUser());
      }
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  if (isLoading || !profile) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* Profile Card details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 glass-card rounded-3xl space-y-6">
            <h3 className="font-bold text-base">Edit Profile Information</h3>

            <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Current Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Student, Software Intern"
                    {...registerProfile('currentTitle')}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Education Level</label>
                  <select
                    {...registerProfile('educationLevel')}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none text-slate-500"
                  >
                    <option value="High School">High School</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Self-Taught">Self-Taught</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Bio</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your background and technical goals..."
                  {...registerProfile('bio')}
                  className="w-full p-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Weekly Commitment (Hours)</label>
                  <input
                    type="number"
                    {...registerProfile('weeklyCommitmentHours')}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">GitHub Profile Link</label>
                  <input
                    type="text"
                    placeholder="https://github.com/your-username"
                    {...registerProfile('githubProfile')}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/10"
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>

        {/* Change password & Delete Card */}
        <div className="space-y-6">
          
          {/* Password update form */}
          <div className="p-6 glass-card rounded-3xl space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <KeyRound size={18} className="text-violet-500" />
              <span>Update Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('currentPassword', { required: true })}
                  className="w-full px-3.5 py-2 bg-slate-105 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('newPassword', { required: true, minLength: 6 })}
                  className="w-full px-3.5 py-2 bg-slate-105 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all">
                Change Password
              </button>
            </form>
          </div>

          {/* Delete account */}
          <div className="p-6 glass-card rounded-3xl border border-rose-500/20 bg-rose-500/5 space-y-4">
            <h3 className="font-bold text-base text-rose-500 flex items-center gap-2">
              <Trash2 size={18} />
              <span>Danger Zone</span>
            </h3>
            <p className="text-xs text-rose-450 leading-relaxed font-light">Deleting your account removes all learning paths, certificates, chat histories, and progress statistics permanently.</p>
            
            <button
              onClick={handleDeleteAccount}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              Delete Account
            </button>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default ProfilePage;
