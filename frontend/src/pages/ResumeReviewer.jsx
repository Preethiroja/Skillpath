import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Cpu, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const ResumeReviewer = () => {
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    // Check if user has an existing audit saved in Profile
    api.get('/auth/profile')
      .then(res => {
        if (res.data.profile?.resumeAnalysis?.formattingScore) {
          setAnalysis(res.data.profile.resumeAnalysis);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) return toast.warning('Please paste your resume text');

    setIsLoading(true);
    try {
      const res = await api.post('/ai/resume-analyze', { resumeText });
      if (res.data.success) {
        setAnalysis(res.data.analysis);
        toast.success('Resume audited successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Resume audit request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* Paste Resume Box */}
        <div className="lg:col-span-1 p-6 glass-card rounded-3xl space-y-6 h-fit">
          <div className="space-y-1.5">
            <h3 className="font-bold text-base flex items-center gap-2">
              <FileText size={20} className="text-violet-500" />
              <span>Resume Audit</span>
            </h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">Paste your raw resume text to audit your technical strengths, identify key framework gaps, and review structure recommendations.</p>
          </div>

          <form onSubmit={handleAudit} className="space-y-4">
            <textarea
              rows={12}
              placeholder="Paste your resume text here (experience, summary, skills)..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-2xl text-xs outline-none resize-none"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              {isLoading ? 'Auditing Resume...' : 'Analyze Resume'}
            </button>
          </form>
        </div>

        {/* Audit Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="p-12 glass-card rounded-3xl text-center space-y-4 animate-pulse">
              <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h4 className="font-bold text-sm">Auditing Experience Profiles...</h4>
              <p className="text-xs text-slate-400 font-light">Resolving target tech stacks and scoring layout formatting...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              
              {/* Score card */}
              <div className="p-6 glass-card rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="font-bold text-base leading-snug">Resume Formatting Score</h3>
                  <p className="text-xs text-slate-400 font-light max-w-sm">Calculated by measuring technical keyword densities and chronologies matching standard templates.</p>
                </div>
                <div className="relative shrink-0 flex items-center justify-center">
                  {/* Circular progress bar */}
                  <svg className="w-24 h-24">
                    <circle className="text-slate-100 dark:text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48"/>
                    <circle className="text-violet-600" strokeWidth="6" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - analysis.formattingScore / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48"/>
                  </svg>
                  <span className="absolute text-xl font-extrabold">{analysis.formattingScore}</span>
                </div>
              </div>

              {/* Skills Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills found */}
                <div className="p-6 glass-card rounded-3xl space-y-4">
                  <h4 className="font-bold text-sm text-emerald-500 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Identified Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.skillsFound.map((skill, i) => (
                      <span key={i} className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-3 py-1 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills gaps */}
                <div className="p-6 glass-card rounded-3xl space-y-4">
                  <h4 className="font-bold text-sm text-rose-500 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>Skill Gaps</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.skillsGaps.map((gap, i) => (
                      <span key={i} className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 px-3 py-1 rounded-full font-medium">
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations & Feedback */}
              <div className="p-6 glass-card rounded-3xl space-y-4">
                <h4 className="font-bold text-sm text-violet-500 flex items-center gap-2">
                  <Lightbulb size={16} />
                  <span>Improvement Recommendations</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-light whitespace-pre-wrap">
                  {analysis.recommendations}
                </p>
              </div>

              <div className="p-6 glass-card rounded-3xl space-y-4">
                <h4 className="font-bold text-sm text-slate-400 flex items-center gap-2">
                  <TrendingUp size={16} />
                  <span>AI Profile Feedback</span>
                </h4>
                <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-light">
                  {analysis.feedback}
                </p>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              <Cpu size={32} className="mx-auto text-slate-300 dark:text-slate-800 mb-3" />
              <p>Trigger your first resume audit on the left. The output will show formatting score, skill matching, and improvements lists.</p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default ResumeReviewer;
