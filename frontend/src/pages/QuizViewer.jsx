import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { HelpCircle, BrainCircuit, ArrowLeft, Check, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const QuizViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const defaultTopic = location.state?.topic || '';

  // Steps state: 'setup', 'loading', 'active', 'results'
  const [quizStep, setQuizStep] = useState('setup');
  const [topic, setTopic] = useState(defaultTopic);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [quizData, setQuizData] = useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [resultsData, setResultsData] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return toast.warning('Please specify a quiz topic');

    setQuizStep('loading');
    try {
      const res = await api.post('/ai/quiz', { topic, difficulty });
      if (res.data.success) {
        setQuizData(res.data.quiz);
        setSelectedAnswers(Array(res.data.quiz.questions.length).fill(null));
        setQuizStep('active');
        setCurrentQuestionIndex(0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate AI quiz');
      setQuizStep('setup');
    }
  };

  const handleOptionSelect = (optionIndex) => {
    const updated = [...selectedAnswers];
    updated[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < quizData.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Check that all questions are answered
    if (selectedAnswers.includes(null)) {
      return toast.warning('Please answer all questions before submitting');
    }

    setQuizStep('loading');
    try {
      const res = await api.post(`/ai/quiz/${quizData._id}/submit`, { answers: selectedAnswers });
      if (res.data.success) {
        setResultsData(res.data);
        setQuizStep('results');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit quiz results');
      setQuizStep('active');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Setup Screen */}
        {quizStep === 'setup' && (
          <div className="p-6 glass-card rounded-3xl space-y-6">
            <div className="space-y-1 text-center">
              <div className="w-12 h-12 bg-violet-600/10 border border-violet-500/25 text-violet-600 flex items-center justify-center rounded-2xl mx-auto mb-3">
                <BrainCircuit size={24} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">AI Skill Assessment</h2>
              <p className="text-xs text-slate-400 font-light">Generate custom multiple choice assessments on any skill to test your knowledge.</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 max-w-md mx-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Skill Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Redux Toolkit state configurations"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 focus:border-violet-500 rounded-xl text-xs outline-none text-slate-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 font-bold rounded-xl text-white text-xs transition-all shadow-md shadow-violet-600/10"
              >
                Generate Quiz
              </button>
            </form>
          </div>
        )}

        {/* Loading Screen */}
        {quizStep === 'loading' && (
          <div className="p-12 glass-card rounded-3xl text-center space-y-4">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 className="font-bold text-sm">Formulating Custom AI Assessment Questions...</h4>
            <p className="text-xs text-slate-400 font-light">Analyzing topic guidelines and drafting explanations...</p>
          </div>
        )}

        {/* Active Quiz Screen */}
        {quizStep === 'active' && quizData && (
          <div className="p-6 glass-card rounded-3xl space-y-6">
            {/* Header progress */}
            <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
              <span>{quizData.title}</span>
              <span>Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h4 className="font-bold text-base leading-snug">
                {quizData.questions[currentQuestionIndex].questionText}
              </h4>
              
              {/* Options */}
              <div className="space-y-2">
                {quizData.questions[currentQuestionIndex].options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left p-4 bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900/40 border rounded-2xl text-xs font-semibold transition-all ${isSelected ? 'border-violet-500 bg-violet-550/5 ring-1 ring-violet-500' : 'border-slate-200/40 dark:border-slate-800/45'}`}
                    >
                      <span className="mr-3 text-slate-400">{String.fromCharCode(65 + idx)}.</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-xs font-bold border border-slate-200/50 dark:border-slate-800/60 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/50 disabled:opacity-40"
              >
                Previous
              </button>

              {currentQuestionIndex + 1 === quizData.questions.length ? (
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Submit Assessment
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Screen */}
        {quizStep === 'results' && resultsData && (
          <div className="space-y-6">
            
            {/* Score Summary Card */}
            <div className="p-6 glass-card rounded-3xl text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center rounded-2xl mx-auto">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Assessment Completed</h3>
                <p className="text-3xl font-extrabold text-violet-500 mt-2">
                  {resultsData.score} / {resultsData.maxScore}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-light">Passing rate: {Math.round((resultsData.score / resultsData.maxScore) * 100)}%</p>
              </div>
              <div className="flex justify-center gap-4 pt-2">
                <button
                  onClick={() => setQuizStep('setup')}
                  className="px-4 py-2 border border-slate-200/50 dark:border-slate-800/60 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 rounded-xl text-xs font-bold"
                >
                  Try Another Quiz
                </button>
                <Link
                  to="/paths"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold"
                >
                  Back to Path
                </Link>
              </div>
            </div>

            {/* Questions Detailed Review */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm tracking-tight text-slate-400 uppercase">Assessment Review</h4>
              {resultsData.questions.map((q, idx) => {
                const selected = resultsData.answersSubmitted[idx];
                const correct = q.correctAnswerIndex;
                const isCorrect = selected === correct;

                return (
                  <div key={idx} className="p-5 glass-card rounded-3xl space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="font-bold text-sm leading-snug">{q.questionText}</h5>
                      <span className={`p-1.5 rounded-full shrink-0 text-white ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {isCorrect ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {q.options.map((opt, oIdx) => {
                        let styling = 'bg-slate-50/50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200/20 dark:border-slate-850/40';
                        if (oIdx === correct) {
                          styling = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold';
                        } else if (oIdx === selected && !isCorrect) {
                          styling = 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold';
                        }
                        
                        return (
                          <div key={oIdx} className={`p-3 border rounded-xl text-xs flex items-center gap-2 ${styling}`}>
                            <span className="text-[10px] uppercase font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-xs text-slate-400 bg-slate-100/50 dark:bg-slate-900/40 p-3 rounded-xl leading-relaxed border border-slate-200/15 dark:border-slate-800/15">
                      <span className="font-semibold text-slate-500 block mb-1">Explanation:</span>
                      {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </Layout>
  );
};

export default QuizViewer;
