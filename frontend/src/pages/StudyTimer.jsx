import React, { useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Flame, Clock, Award } from 'lucide-react';
import Layout from '../components/Layout';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

const StudyTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'break'
  const [label, setLabel] = useState('');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchStats = () => {
    api.get('/student/timer/stats')
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Could not load study stats'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    clearInterval(intervalRef.current);

    if (mode === 'work') {
      try {
        const res = await api.post('/student/timer/session', {
          durationMinutes: WORK_MINUTES,
          mode: 'pomodoro',
          label: label || 'Focus session',
        });
        toast.success(`Great focus! Logged ${WORK_MINUTES} minutes.`);
        if (res.data.newBadges?.length > 0) {
          res.data.newBadges.forEach((b) => toast.info(`🏆 New badge unlocked: ${b.title}!`));
        }
        fetchStats();
      } catch {
        toast.error('Could not save your session');
      }
      setMode('break');
      setSecondsLeft(BREAK_MINUTES * 60);
    } else {
      toast.info('Break over — ready for another focus session?');
      setMode('work');
      setSecondsLeft(WORK_MINUTES * 60);
    }
  };

  const toggleTimer = () => setIsActive((prev) => !prev);

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setSecondsLeft(WORK_MINUTES * 60);
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalSeconds = (mode === 'work' ? WORK_MINUTES : BREAK_MINUTES) * 60;
  const progressPct = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <TimerIcon size={20} className="text-violet-600" /> Study Timer
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Focus in 25-minute Pomodoro sessions. Completed sessions count toward your streak and points.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Card */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6 ${
                mode === 'work'
                  ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600'
                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'
              }`}
            >
              {mode === 'work' ? 'Focus Session' : 'Break Time'}
            </span>

            <div className="relative w-56 h-56 flex items-center justify-center mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-800" />
                <circle
                  cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 90}
                  strokeDashoffset={2 * Math.PI * 90 * (1 - progressPct / 100)}
                  strokeLinecap="round"
                  className={mode === 'work' ? 'text-violet-600' : 'text-emerald-500'}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="absolute text-4xl font-bold tracking-tight">{formatTime(secondsLeft)}</span>
            </div>

            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="What are you focusing on? (optional)"
              className="w-full max-w-xs text-center text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 mb-6 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTimer}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-violet-600/20 transition-all"
              >
                {isActive ? <Pause size={16} /> : <Play size={16} />}
                {isActive ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetTimer}
                className="p-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl transition-all"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="space-y-4">
            <div className="glass-card rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-semibold">
                <Flame size={14} className="text-orange-500" /> Current Streak
              </div>
              <p className="text-2xl font-bold">{isLoading ? '—' : stats?.currentStreak || 0} days</p>
            </div>
            <div className="glass-card rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-semibold">
                <Clock size={14} /> Studied Today
              </div>
              <p className="text-2xl font-bold">{isLoading ? '—' : stats?.todayMinutes || 0} min</p>
            </div>
            <div className="glass-card rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-semibold">
                <Award size={14} className="text-violet-500" /> Total Points
              </div>
              <p className="text-2xl font-bold">{isLoading ? '—' : stats?.points || 0}</p>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="glass-card rounded-3xl p-6">
          <h4 className="font-semibold text-sm mb-4">Recent Sessions</h4>
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
            </div>
          ) : stats?.recentSessions?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentSessions.slice(0, 8).map((s) => (
                <div key={s._id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-slate-600 dark:text-slate-300">{s.label || 'Focus session'}</span>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>{s.durationMinutes} min</span>
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No sessions logged yet. Start your first Pomodoro above!</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudyTimer;
