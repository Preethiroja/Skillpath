import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Sparkles, TrendingUp, TrendingDown, BookOpen, Compass, ArrowRight, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';

const confidenceColor = (pct) => {
  if (pct >= 85) return 'from-violet-600 to-indigo-600';
  if (pct >= 70) return 'from-emerald-500 to-teal-500';
  return 'from-amber-500 to-orange-500';
};

const AssessmentReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/assessment/${id}`)
      .then((res) => setAssessment(res.data.assessment))
      .catch(() => toast.error('Could not load assessment report'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleBuildRoadmap = (career) => {
    navigate('/paths', {
      state: {
        prefillTitle: career.career,
        prefillSkills: (career.suggestedSkills || []).join(', '),
      },
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <Loader2 size={28} className="animate-spin text-violet-500" />
          <p className="text-xs">Loading your report...</p>
        </div>
      </Layout>
    );
  }

  if (!assessment || assessment.status !== 'completed') {
    return (
      <Layout>
        <div className="text-center py-24 text-slate-400 text-xs">Report not available yet.</div>
      </Layout>
    );
  }

  const { report } = assessment;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600 bg-violet-100 dark:bg-violet-900/40 px-3 py-1 rounded-full">
            <Sparkles size={12} /> Your AI Career Report
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Here's what we found</h2>
        </div>

        {/* Personality Summary */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="font-bold text-sm mb-2">Personality Summary</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{report.personalitySummary}</p>
          <p className="text-xs text-slate-500 mt-3"><span className="font-semibold">Learning style:</span> {report.learningStyle}</p>
        </div>

        {/* Strengths / Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3 text-emerald-600 font-bold text-xs uppercase">
              <TrendingUp size={14} /> Strengths
            </div>
            <ul className="space-y-2">
              {report.strengths?.map((s, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3 text-amber-600 font-bold text-xs uppercase">
              <TrendingDown size={14} /> Growth Areas
            </div>
            <ul className="space-y-2">
              {report.weaknesses?.map((w, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Skill / Interest Profile */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><BookOpen size={14} /> Skill & Interest Profile</h3>
          <div className="flex flex-wrap gap-2">
            {[...(report.skillProfile || []), ...(report.interestProfile || [])].map((tag, i) => (
              <span key={i} className="text-[11px] bg-violet-100 dark:bg-violet-900/40 text-violet-600 px-3 py-1 rounded-full font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Career Recommendations */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2"><Compass size={14} /> Top Career Matches</h3>
          {report.careerRecommendations?.map((career, i) => (
            <div key={i} className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <h4 className="font-bold text-base">{career.career}</h4>
                <span className="text-lg font-bold text-violet-600">{career.confidence}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full bg-gradient-to-r ${confidenceColor(career.confidence)}`}
                  style={{ width: `${career.confidence}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{career.reasoning}</p>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {career.suggestedSkills?.map((s, si) => (
                    <span key={si} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleBuildRoadmap(career)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shrink-0"
                >
                  Build My Roadmap <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AssessmentReport;
