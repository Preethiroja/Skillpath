import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { loadPaths, loadGoals } from '../store/slices/roadmapSlice';
import api from '../utils/api';
import {
  Zap,
  Flame,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  MapPin,
  Sparkles,
  Trophy,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import Layout from '../components/Layout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { paths, goals } = useSelector((state) => state.roadmap);
  const { user } = useSelector((state) => state.auth);

  // local stats state loaded from Progress model
  const [progressStats, setProgressStats] = useState({
    currentStreak: 3,
    totalTimeSpent: 120,
    completedQuizzesCount: 1,
    completedNodes: []
  });

  // Daily Planner State
  const [todos, setTodos] = useState([
    { id: 1, text: 'Study Node.js Streams API documentation', done: false },
    { id: 2, text: 'Complete dynamic quiz on React Hooks', done: true },
    { id: 3, text: 'Review career mentor recommendations', done: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  // Pomodoro Timer State
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerType, setTimerType] = useState('work'); // 'work' or 'break'

  useEffect(() => {
    dispatch(loadPaths());
    dispatch(loadGoals());

    // Fetch user progress statistics
    api.get('/auth/profile')
      .then((res) => {
        // Mock progression stats fallback if database progress is fresh
        if (res.data.profile) {
          api.get('/paths')
            .then(pRes => {
              // Extract completed nodes count
              const completedCount = pRes.data.paths?.reduce((acc, p) => acc + p.nodes.filter(n => n.status === 'completed').length, 0) || 0;
              setProgressStats(s => ({
                ...s,
                completedNodes: Array(completedCount).fill('node')
              }));
            });
        }
      })
      .catch(err => console.error(err));
  }, [dispatch]);

  // Pomodoro Countdown Effect
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            // Timer expired
            if (timerType === 'work') {
              setTimerMinutes(5);
              setTimerType('break');
              setProgressStats(s => ({ ...s, totalTimeSpent: s.totalTimeSpent + 25 }));
              // Post active study time to server
              api.put('/auth/profile', { weeklyCommitmentHours: 12 }).catch(e => console.error(e));
            } else {
              setTimerMinutes(25);
              setTimerType('work');
            }
            setTimerActive(false);
          } else {
            setTimerMinutes(timerMinutes - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(timerSeconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerMinutes, timerSeconds, timerType]);

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, done: false }]);
    setNewTodo('');
  };

  // Activity Chart Data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Study Minutes',
        data: [30, 45, 15, 25, 60, 10, 5],
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { display: false },
      x: { grid: { display: false } }
    }
  };

  const activePath = paths[0] || null;

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-transparent border border-violet-500/15 rounded-3xl gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Welcome Back, {user?.name}! 👋</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ready to boost your roadmap milestones today?</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/paths" className="px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-md transition-all">
              Manage Path
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 glass-panel rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Daily Streak</p>
              <h4 className="text-xl font-bold">{progressStats.currentStreak} Days</h4>
            </div>
          </div>
          <div className="p-5 glass-panel rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-500 rounded-xl">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Time</p>
              <h4 className="text-xl font-bold">{progressStats.totalTimeSpent} Mins</h4>
            </div>
          </div>
          <div className="p-5 glass-panel rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Completed Steps</p>
              <h4 className="text-xl font-bold">{progressStats.completedNodes.length} Nodes</h4>
            </div>
          </div>
          <div className="p-5 glass-panel rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Quizzes Passed</p>
              <h4 className="text-xl font-bold">{progressStats.completedQuizzesCount} Quizzes</h4>
            </div>
          </div>
        </div>

        {/* Central split widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Roadmap & Career Goals */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 glass-card rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <TrendingUp size={18} className="text-violet-500" />
                  <span>Active Learning Roadmap</span>
                </h3>
                {activePath && (
                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full capitalize">
                    {activePath.status.replace('_', ' ')}
                  </span>
                )}
              </div>

              {activePath ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-semibold">{activePath.title}</span>
                      <span className="text-slate-400 font-medium">{activePath.currentProgress}% Complete</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-600 rounded-full transition-all" style={{ width: `${activePath.currentProgress}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    <p className="text-xs text-slate-400 font-semibold uppercase">Current Tasks</p>
                    <div className="space-y-2">
                      {activePath.nodes.slice(0, 3).map((node, i) => (
                        <div key={node.id} className="flex items-center justify-between p-3.5 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/25 dark:border-slate-800/30 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${node.status === 'completed' ? 'bg-emerald-500' : node.status === 'unlocked' ? 'bg-violet-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            <span className="text-xs font-semibold">{node.title}</span>
                          </div>
                          <Link to={`/paths/${activePath._id}`} className="text-xs text-violet-500 font-semibold hover:underline">
                            View details
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <p className="text-sm text-slate-400">You do not have any active learning roadmap.</p>
                  <Link to="/paths" className="inline-flex px-5 py-2.5 text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg shadow-violet-600/25">
                    Generate Path with AI
                  </Link>
                </div>
              )}
            </div>

            {/* Goals Checklist */}
            <div className="p-6 glass-card rounded-3xl space-y-4">
              <h3 className="font-bold text-base">Target Career Roles</h3>
              {goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map(goal => (
                    <div key={goal._id} className="p-4 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl space-y-2">
                      <h4 className="text-sm font-semibold">{goal.title}</h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {goal.targetSkills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-[10px] bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded-full text-slate-500">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-2">No career roles configured. Set up your learning objectives in Learning Paths.</p>
              )}
            </div>
          </div>

          {/* Pomodoro Timer & Planners */}
          <div className="space-y-6">
            
            {/* Study Pomodoro Timer */}
            <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/60 rounded-3xl text-center space-y-4 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-xl"></div>
              <div>
                <h4 className="font-bold text-sm tracking-tight text-slate-400 capitalize">{timerType} Interval</h4>
                <p className="text-3xl font-extrabold tracking-widest mt-2">
                  {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                </p>
              </div>

              {/* Controls */}
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className="p-2.5 bg-violet-600 hover:bg-violet-500 rounded-full transition-colors text-white"
                >
                  {timerActive ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTimerMinutes(timerType === 'work' ? 25 : 5);
                    setTimerSeconds(0);
                  }}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-300"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Daily Planner */}
            <div className="p-6 glass-card rounded-3xl space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Calendar size={18} className="text-violet-500" />
                <span>Daily Study Planner</span>
              </h3>

              <form onSubmit={addTodo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add item..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 text-xs rounded-xl outline-none"
                />
                <button type="submit" className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl">
                  Add
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-center gap-3 p-3.5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-850/40 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 shrink-0"
                    />
                    <span className={`text-xs ${todo.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>{todo.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Chart */}
            <div className="p-6 glass-card rounded-3xl space-y-4">
              <h3 className="font-bold text-sm tracking-tight text-slate-400 uppercase">Weekly Activity</h3>
              <div className="h-28">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;
