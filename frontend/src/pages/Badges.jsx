import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Award, Lock, CheckCircle2, Flame, Timer, Brain, GraduationCap } from 'lucide-react';
import Layout from '../components/Layout';

const conditionIcon = {
  streak: Flame,
  timer_spent: Timer,
  quiz_score: Brain,
  path_completion: GraduationCap,
  custom: Award,
};

const conditionLabel = (badge) => {
  switch (badge.conditionType) {
    case 'streak':
      return `Reach a ${badge.conditionValue}-day streak`;
    case 'timer_spent':
      return `Log ${badge.conditionValue} minutes of study time`;
    case 'quiz_score':
      return `Complete ${badge.conditionValue} quizzes`;
    case 'path_completion':
      return `Finish ${badge.conditionValue} learning path${badge.conditionValue > 1 ? 's' : ''}`;
    default:
      return 'Special achievement';
  }
};

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [earnedCount, setEarnedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBadges = () => {
    setIsLoading(true);
    api.get('/student/badges')
      .then((res) => {
        setBadges(res.data.badges);
        setEarnedCount(res.data.earnedCount);
        setTotalCount(res.data.totalCount);
      })
      .catch(() => toast.error('Could not load badges'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Achievements & Badges</h2>
            <p className="text-xs text-slate-500 mt-1">
              Earn badges automatically as you build streaks, finish quizzes, log study time, and complete paths.
            </p>
          </div>
          <div className="glass-card rounded-2xl px-5 py-3 text-center min-w-[140px]">
            <p className="text-2xl font-bold text-violet-600">{earnedCount}/{totalCount}</p>
            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Unlocked</p>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const Icon = conditionIcon[badge.conditionType] || Award;
              return (
                <div
                  key={badge._id}
                  className={`p-5 rounded-3xl border transition-all relative overflow-hidden ${
                    badge.earned
                      ? 'glass-card border-violet-300/50 dark:border-violet-800/50'
                      : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                        badge.earned ? 'bg-violet-100 dark:bg-violet-900/40' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    >
                      {badge.earned ? badge.icon : <Lock size={18} className="text-slate-400" />}
                    </div>
                    {badge.earned && <CheckCircle2 size={20} className="text-emerald-500" />}
                  </div>
                  <h4 className="font-bold text-sm mb-1">{badge.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{badge.description}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <Icon size={12} />
                    <span>{conditionLabel(badge)}</span>
                  </div>
                  {badge.earned && badge.earnedAt && (
                    <p className="text-[10px] text-violet-500 mt-2 font-semibold">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Badges;
