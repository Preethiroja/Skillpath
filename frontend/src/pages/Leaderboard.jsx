import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Trophy, Flame, Clock, Medal } from 'lucide-react';
import Layout from '../components/Layout';

const rankStyles = [
  'bg-gradient-to-br from-amber-400 to-yellow-500 text-white',
  'bg-gradient-to-br from-slate-300 to-slate-400 text-white',
  'bg-gradient-to-br from-amber-700 to-amber-800 text-white',
];

const Leaderboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/student/leaderboard?limit=50')
      .then((res) => {
        setLeaderboard(res.data.leaderboard);
        setMyRank(res.data.myRank);
      })
      .catch(() => toast.error('Could not load leaderboard'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" /> Leaderboard
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ranked by points earned from streaks, quizzes, study sessions, and completed paths.
            </p>
          </div>
          {myRank && (
            <div className="glass-card rounded-2xl px-5 py-3 text-center min-w-[120px]">
              <p className="text-2xl font-bold text-violet-600">#{myRank}</p>
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Your Rank</p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs glass-card rounded-3xl">
            <Trophy size={36} className="mx-auto text-slate-300 dark:text-slate-800 mb-3" />
            <p>No learners have earned points yet. Be the first — study, quiz, and climb the ranks!</p>
          </div>
        ) : (
          <div className="glass-card rounded-3xl divide-y divide-slate-200/50 dark:divide-slate-800/40 overflow-hidden">
            {leaderboard.map((entry) => {
              const isMe = user && entry.userId === user._id;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                    isMe ? 'bg-violet-50 dark:bg-violet-950/20' : ''
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      entry.rank <= 3
                        ? rankStyles[entry.rank - 1]
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {entry.rank <= 3 ? <Medal size={16} /> : entry.rank}
                  </div>

                  <div className="w-9 h-9 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {entry.name?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {entry.name} {isMe && <span className="text-[10px] text-violet-500 font-bold">(You)</span>}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" /> {entry.currentStreak}d streak</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {entry.totalTimeSpent}m studied</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-violet-600 text-sm">{entry.points}</p>
                    <p className="text-[10px] text-slate-400 uppercase">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;
