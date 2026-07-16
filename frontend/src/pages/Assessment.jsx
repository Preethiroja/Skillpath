import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, Brain, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';

const Assessment = () => {
  const navigate = useNavigate();
  const [assessmentId, setAssessmentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [startRes, questionsRes] = await Promise.all([
          api.post('/assessment/start'),
          api.get('/assessment/questions'),
        ]);
        setAssessmentId(startRes.data.assessmentId);
        setQuestions(questionsRes.data.questions);
      } catch {
        toast.error('Could not start the assessment');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const selectOption = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const goNext = () => {
    if (!isLastQuestion) setCurrentIndex((i) => i + 1);
  };

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    if (answeredCount < questions.length) {
      toast.warning('Please answer every question before finishing');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex,
        })),
      };
      await api.post(`/assessment/${assessmentId}/submit`, payload);
      toast.success('Assessment complete!');
      navigate(`/assessment/${assessmentId}/report`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit assessment');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <Loader2 size={28} className="animate-spin text-violet-500" />
          <p className="text-xs">Preparing your assessment...</p>
        </div>
      </Layout>
    );
  }

  if (isSubmitting) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <Brain size={32} className="animate-pulse text-violet-500" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Analyzing your responses...</p>
          <p className="text-xs">Our AI is building your personality profile and career matches.</p>
        </div>
      </Layout>
    );
  }

  if (!currentQuestion) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wide">{currentQuestion.category}</span>
            <span>{currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8">
          <h3 className="text-lg font-bold mb-6 leading-snug">{currentQuestion.question}</h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => selectOption(idx)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl border text-sm transition-all ${
                    isSelected
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold"
          >
            <ChevronLeft size={14} /> Back
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={answers[currentQuestion.id] === undefined}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/20"
            >
              Finish Assessment <Brain size={14} />
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={answers[currentQuestion.id] === undefined}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/20"
            >
              Next <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Assessment;
