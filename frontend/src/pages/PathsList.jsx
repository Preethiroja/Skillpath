import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loadPaths, generatePathAI, addGoal } from '../store/slices/roadmapSlice';
import { Compass, Sparkles, Map, ChevronRight, BrainCircuit } from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const PathsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { paths, isLoading, isGenerating } = useSelector((state) => state.roadmap);

  // Form parameters — prefilled if arriving from an assessment report recommendation
  const [title, setTitle] = useState(location.state?.prefillTitle || '');
  const [skills, setSkills] = useState(location.state?.prefillSkills || '');
  const [currentSkills, setCurrentSkills] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [hours, setHours] = useState(10);

  useEffect(() => {
    dispatch(loadPaths());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !skills.trim()) {
      return toast.warning('Please specify your target role and skills');
    }

    const targetSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
    const current = currentSkills.split(',').map(s => s.trim()).filter(Boolean);

    if (targetSkills.length === 0) {
      return toast.warning('Please enter at least one valid skill, separated by commas');
    }

    // Save as goal first
    dispatch(addGoal({ title, targetSkills, targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }));

    const result = await dispatch(generatePathAI({
      title,
      targetSkills,
      currentSkills: current,
      level,
      commitmentHours: hours
    }));

    if (generatePathAI.fulfilled.match(result)) {
      toast.success('Roadmap generated successfully!');
      navigate(`/paths/${result.payload._id}`);
    } else {
      toast.error(result.payload || 'Failed to generate roadmap');
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* Generate Path Card */}
        <div className="lg:col-span-1 p-6 glass-card rounded-3xl space-y-6 h-fit">
          {location.state?.prefillTitle && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-violet-600 bg-violet-100 dark:bg-violet-900/40 px-3 py-2 rounded-xl">
              <Sparkles size={12} /> Prefilled from your assessment recommendation
            </div>
          )}
          <div className="space-y-1.5">
            <h3 className="font-bold text-base flex items-center gap-2">
              <BrainCircuit size={20} className="text-violet-500" />
              <span>Configure AI Path</span>
            </h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">Tell SkillPath AI what you want to achieve, and we will formulate a personalized study route.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Target Career Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Skills to Acquire (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. React Router, Redux, Docker"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Current Known Skills (Optional)</label>
              <input
                type="text"
                placeholder="e.g. HTML, CSS, Basic JavaScript"
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Target Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none text-slate-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Weekly Commitment</label>
                <input
                  type="number"
                  min={1}
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 font-bold rounded-xl text-white text-xs transition-all shadow-md shadow-violet-600/10"
            >
              {isGenerating ? 'Analyzing with AI...' : 'Generate Paths'}
            </button>
          </form>
        </div>

        {/* Paths List Section */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-lg">My Personalized Roadmaps</h3>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            </div>
          ) : paths.length > 0 ? (
            <div className="space-y-4">
              {paths.map(path => (
                <div key={path._id} className="p-5 glass-card rounded-3xl hover:border-violet-500/25 transition-all flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-slate-850 dark:text-slate-150">{path.title}</h4>
                    <p className="text-xs text-slate-400 font-light truncate max-w-sm">{path.description}</p>
                    
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                      <span className="font-semibold uppercase bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200/30 dark:border-slate-800/30">
                        {path.difficulty}
                      </span>
                      <span>Progress: {path.currentProgress}%</span>
                    </div>
                  </div>

                  <Link to={`/paths/${path._id}`} className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 hover:bg-violet-600 hover:text-white rounded-2xl transition-colors">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Map size={32} className="mx-auto text-slate-300 dark:text-slate-800 mb-3" />
              <p>Configure parameters on the left and trigger your first AI personalized learning path.</p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default PathsList;
