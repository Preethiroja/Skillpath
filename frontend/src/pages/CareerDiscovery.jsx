import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Target, Sparkles, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

const CareerDiscovery = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600 bg-violet-100 dark:bg-violet-900/40 px-3 py-1 rounded-full">
            <Sparkles size={12} /> AI Career Discovery
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Let's find your path</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Tell us where you're starting from, and we'll build a personalized learning roadmap around it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/assessment')}
            className="group text-left glass-card rounded-3xl p-8 border-slate-200/50 dark:border-slate-800/40 hover:border-violet-300 dark:hover:border-violet-700 transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mb-5">
              <Compass size={22} className="text-violet-600" />
            </div>
            <h3 className="font-bold text-base mb-2">I don't know what I should learn</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Take a 35-question AI assessment covering your interests, aptitude, and personality. We'll match you to careers with confidence scores.
            </p>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 group-hover:gap-2.5 transition-all">
              Start Assessment <ArrowRight size={14} />
            </span>
          </button>

          <button
            onClick={() => navigate('/paths')}
            className="group text-left glass-card rounded-3xl p-8 border-slate-200/50 dark:border-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-5">
              <Target size={22} className="text-emerald-600" />
            </div>
            <h3 className="font-bold text-base mb-2">I already know my career goal</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Search or enter a career like AI Engineer, Full Stack Developer, or Data Scientist, and get a roadmap built for it instantly.
            </p>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 group-hover:gap-2.5 transition-all">
              Choose My Career <ArrowRight size={14} />
            </span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CareerDiscovery;
