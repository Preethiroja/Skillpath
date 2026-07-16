import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';
import { Mail, Lock, ShieldAlert, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

const stats = [
  { value: '2,400+', label: 'Paths generated' },
  { value: '96%', label: 'Would learn again' },
  { value: '18min', label: 'Avg. daily focus' },
];

const Login = () => {
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
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Signature panel */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-950 bg-trail-pattern">
        <div className="absolute w-[420px] h-[420px] bg-indigo-500/20 blur-[110px] rounded-full -bottom-20 -left-16 animate-drift"></div>
        <div className="absolute w-[380px] h-[380px] bg-violet-500/20 blur-[110px] rounded-full top-0 -right-10"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-lg tracking-tight text-white">
            <MapPin size={20} className="text-indigo-300" />
            SkillPath AI
          </Link>

          <div>
            <h1 className="text-4xl font-bold text-white leading-[1.15] tracking-tight mb-4">
              Pick up right<br />where you<br />left the trail.
            </h1>
            <p className="text-violet-200/70 text-sm max-w-xs">
              Your streak, your path, and your mentor are exactly where you left them.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-violet-200/60 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
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
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-1.5">Sign in with the email and password you registered with.</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2.5">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-500" size={16} />
                <input
                  type="email"
                  placeholder="you@example.com"
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
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white rounded-xl text-sm transition-all outline-none"
                />
              </div>
              {errors.password && <span className="text-[10px] text-rose-500">{errors.password.message}</span>}
              <p className="text-[10px] text-slate-500">Forgot it? There's no email recovery — ask an admin to reset your account.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 font-bold rounded-xl text-white text-sm transition-all shadow-lg shadow-violet-600/20"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-indigo-400 hover:underline font-semibold">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
