import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../store/slices/authSlice';
import { Mail, Lock, User, ShieldAlert, MapPin, Compass, Flag, Milestone } from 'lucide-react';
import { toast } from 'react-toastify';

const waypoints = [
  { icon: Compass, label: 'Assess your skills' },
  { icon: Milestone, label: 'Get your AI-built path' },
  { icon: MapPin, label: 'Learn milestone by milestone' },
  { icon: Flag, label: 'Earn your certificate' },
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      toast.success(`Welcome to SkillPath AI, ${result.payload.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Signature panel — a vertical trail of waypoints, standing in for the
          product's actual mechanic: a sequenced learning path. */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-950 bg-trail-pattern">
        <div className="absolute w-[420px] h-[420px] bg-indigo-500/20 blur-[110px] rounded-full -top-20 -right-20 animate-drift"></div>
        <div className="absolute w-[380px] h-[380px] bg-violet-500/20 blur-[110px] rounded-full bottom-0 -left-10"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-lg tracking-tight text-white">
            <MapPin size={20} className="text-indigo-300" />
            SkillPath AI
          </Link>

          <div>
            <h1 className="text-4xl font-bold text-white leading-[1.15] tracking-tight mb-4">
              Every skill<br />worth having<br />has a route in.
            </h1>
            <p className="text-violet-200/70 text-sm max-w-xs">
              Four checkpoints between where you are and where you're headed.
            </p>
          </div>

          <div className="space-y-0">
            {waypoints.map((wp, i) => {
              const Icon = wp.icon;
              const isLast = i === waypoints.length - 1;
              return (
                <div key={wp.label}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-indigo-300" />
                    </div>
                    <span className="text-white/90 text-sm font-medium">{wp.label}</span>
                  </div>
                  {!isLast && (
                    <div className="ml-5 my-1.5 w-px h-5 border-l-2 border-dotted border-white/25"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-md">
          <div className="text-center space-y-2 mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-1.5 font-bold text-xl tracking-tight text-white">
              <MapPin size={18} className="text-indigo-400" />
              SkillPath AI
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Start your path</h2>
            <p className="text-slate-400 text-sm mt-1.5">Create an account with your email and a password — that's it.</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2.5">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white rounded-xl text-sm transition-all outline-none"
                />
              </div>
              {errors.name && <span className="text-[10px] text-rose-500">{errors.name.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-500" size={16} />
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white rounded-xl text-sm transition-all outline-none"
                />
              </div>
              {errors.email && <span className="text-[10px] text-rose-500">{errors.email.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-500" size={16} />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white rounded-xl text-sm transition-all outline-none"
                />
              </div>
              {errors.password && <span className="text-[10px] text-rose-500">{errors.password.message}</span>}
              <p className="text-[10px] text-slate-500">Stored securely — hashed before it ever touches the database.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Select Role</label>
              <select
                {...register('role')}
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-slate-300 rounded-xl text-sm transition-all outline-none"
              >
                <option value="student">Student / Learner</option>
                <option value="mentor">Mentor / Instructor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 font-bold rounded-xl text-white text-sm transition-all shadow-lg shadow-violet-600/20"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link to="/login" className="text-indigo-400 hover:underline font-semibold">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
