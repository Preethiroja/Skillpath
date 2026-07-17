import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Map,
  Sparkles,
  BookOpen,
  HelpCircle,
  Mail,
  Zap,
  Users,
  Compass,
  Code
} from 'lucide-react';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { value: '50K+', label: 'Active Students' },
    { value: '120K+', label: 'Paths Generated' },
    { value: '94%', label: 'Career Success Rate' },
    { value: '4.8/5', label: 'User Rating' }
  ];

  const features = [
    {
      icon: Map,
      title: 'AI Roadmaps',
      desc: 'Get highly personalized, chronological paths outlining exactly what to learn, when to build, and when to test.'
    },
    {
      icon: Sparkles,
      title: 'AI Mentor Assistant',
      desc: 'An AI coding tutor and career advisor available 24/7. Chat live, review code bugs, and get dynamic explanations.'
    },
    {
      icon: Cpu,
      title: 'AI Resume Audit & Gap Analysis',
      desc: 'Upload your resume to scan core skill matches, gaps, and receive suggestions tailored to your targets.'
    },
    {
      icon: CheckCircle2,
      title: 'Dynamic Quizzes & Assessments',
      desc: 'Challenge yourself with custom AI quizzes generated instantly on any topic, updating your level as you answer.'
    }
  ];

  const faqs = [
    {
      q: 'How does SkillPath AI generate my personalized roadmap?',
      a: 'SkillPath AI processes your educational background, target career titles, existing skills, and weekly hour commitment. It interfaces with our custom-trained OpenAI models to build a custom step-by-step roadmap linking direct resources.'
    },
    {
      q: 'Can I connect with human mentors or is it purely AI?',
      a: 'We support both! Students can utilize the real-time AI Chatbot for quick coding reviews, or switch to Live Support Chat to communicate with experienced mentors and administrators.'
    },
    {
      q: 'Does it cost anything to get started?',
      a: 'Our Starter plan is completely free and includes 3 AI roadmap generations and basic mentor access. Upgrade to Pro for unlimited path generations, resume reviews, and live chats.'
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever',
      features: ['3 AI Path Generations', 'Basic AI Mentor Chat', 'Public community access'],
      cta: 'Start Learning',
      popular: false
    },
    {
      name: 'Pro Learner',
      price: '$19',
      period: 'monthly',
      features: ['Unlimited AI Path Generations', 'Full AI Resume Audit', '24/7 Priority AI Coding Mentor', 'Live Chat Support with Human Mentors', 'Issued Certificates & Badges'],
      cta: 'Go Pro Now',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$49',
      period: 'monthly',
      features: ['Team roadmap allocations', 'Advanced admin analytics control', 'Custom API integration hooks', 'Weekly live calls with technical leads'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans selection:bg-violet-500 selection:text-white overflow-hidden bg-grid-pattern">
      
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none"></div>

      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            <span>SkillPath AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-violet-400 transition-colors">Features</a>
            <a href="#works" className="hover:text-violet-400 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-violet-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-violet-400 transition-colors">FAQs</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-lg shadow-violet-600/30">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-950/50 border border-violet-800/40 rounded-full text-violet-400 text-xs font-semibold">
            <Sparkles size={12} />
            <span>Next-Generation Personalized AI Learning</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Master Any Skill with Personalized AI Learning Path Roadmaps
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
            Skip search fatigue. Enter your target career role and SkillPath AI immediately configures step-by-step learning schedules, quizzes, AI mentor guidance, and certifications.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 font-bold rounded-2xl shadow-xl shadow-violet-600/20 hover:shadow-violet-600/35 transition-all text-white group">
              <span>Start Free Journey</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 hover:text-white rounded-2xl transition-all text-slate-300 font-semibold">
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Visual Mock Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-16 border border-slate-800/80 rounded-3xl p-4 bg-slate-950/80 shadow-2xl relative max-w-5xl mx-auto overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
          <div className="h-6 flex items-center gap-1.5 px-3 border-b border-slate-800/80 pb-3 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-slate-500 font-mono ml-2">skillpath-dashboard-preview.exe</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
            {/* Sidebar Mock */}
            <div className="bg-slate-900/60 border border-slate-800/40 rounded-xl p-4 space-y-4">
              <div className="h-4 bg-slate-800 rounded w-2/3"></div>
              <div className="space-y-2">
                <div className="h-8 bg-violet-950/40 border border-violet-800/20 rounded-lg flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                  <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-slate-800/30 rounded-lg flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  <div className="h-2 bg-slate-700 rounded w-1/3"></div>
                </div>
                <div className="h-8 bg-slate-800/30 rounded-lg flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            {/* Central Timeline Mock */}
            <div className="md:col-span-2 bg-slate-900/60 border border-slate-800/40 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                <div className="h-6 bg-emerald-500/20 border border-emerald-500/30 rounded-full w-16"></div>
              </div>
              
              <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-900"></div>
                  <h4 className="text-sm font-semibold text-white">Module 1: Web Programming core HTML/CSS</h4>
                  <p className="text-xs text-slate-500 mt-1">Status: Completed</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-violet-600 border-4 border-slate-900 animate-pulse"></div>
                  <h4 className="text-sm font-semibold text-white">Module 2: Node.js MVC architecture pattern</h4>
                  <p className="text-xs text-slate-500 mt-1">Status: In Progress</p>
                </div>
                <div className="relative opacity-50">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-700 border-4 border-slate-900"></div>
                  <h4 className="text-sm font-semibold text-slate-400">Module 3: Custom REST Quiz & assessment</h4>
                  <p className="text-xs text-slate-600 mt-1">Status: Locked</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-950/60 border-y border-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-extrabold text-violet-400">{stat.value}</h3>
              <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Engineered For Dynamic Growth</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Everything you need to accelerate your capabilities, map skill gaps, and prove your knowledge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="p-8 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:border-violet-800/40 transition-all space-y-4 hover:shadow-xl hover:shadow-violet-950/5">
                <div className="p-3 bg-violet-950/40 border border-violet-800/20 rounded-xl w-fit text-violet-400">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 bg-slate-950/40 border-t border-slate-800/40 rounded-3xl relative">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Unlock your technical future. Choose the plan that aligns with your ambitions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <div key={i} className={`p-8 rounded-2xl flex flex-col justify-between border relative ${plan.popular ? 'bg-gradient-to-b from-violet-950/40 to-slate-950 border-violet-600/80 shadow-2xl' : 'bg-slate-900/30 border-slate-800/60'}`}>
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow">
                  MOST POPULAR
                </span>
              )}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-slate-400">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-sm text-slate-500">/ {plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3.5 text-sm text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-violet-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/register" className={`w-full text-center py-3.5 rounded-xl font-bold mt-8 block transition-all ${plan.popular ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 relative">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-800/80 rounded-2xl bg-slate-900/30 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between text-white font-semibold text-base"
              >
                <span>{faq.q}</span>
                <HelpCircle size={20} className={`text-violet-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-12 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
            <span className="font-extrabold text-lg text-white">SkillPath AI</span>
            <div className="flex items-center gap-6 text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#works" className="hover:text-white transition-colors">How it Works</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            </div>
          </div>
          <hr className="border-slate-900" />
          <p>&copy; {new Date().getFullYear()} SkillPath AI. All rights reserved. Built for engineering excellence.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
