import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Bot, User, Send, Sparkles, Brain, Cpu, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const AiMentor = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am your SkillPath AI Advisor. Choose an advisory mode (General Mentor, Career Advisor, Coding Tutor, or Mock Interviewer) to configure our session context. How can I help you map your journey today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [roleMode, setRoleMode] = useState('mentor'); // 'mentor', 'career', 'coding', 'mock_interview'
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const roleConfigs = {
    mentor: { title: 'AI Mentor', desc: 'Senior Software Architect guidance', icon: Bot, color: 'text-violet-500 bg-violet-500/10' },
    career: { title: 'Career Advisor', desc: 'Resume auditing & job strategies', icon: Brain, color: 'text-emerald-500 bg-emerald-500/10' },
    coding: { title: 'Coding Tutor', desc: 'Bug explanation & coding principles', icon: Cpu, color: 'text-blue-500 bg-blue-500/10' },
    mock_interview: { title: 'Interviewer', desc: 'Interactive technical quiz reviews', icon: MessageSquare, color: 'text-rose-500 bg-rose-500/10' },
  };

  const suggestions = {
    mentor: ['Explain difference between Monolithic vs Microservices', 'Explain REST APIs design best practices'],
    career: ['What are core gaps on junior developer resumes?', 'How to prepare for System Design interviews?'],
    coding: ['Show me Javascript closure code example', 'Explain MVC architecture pattern in Express'],
    mock_interview: ['Give me an intermediate Javascript coding question', 'What does O(N) time complexity mean?']
  };

  useEffect(() => {
    // Auto-scroll to bottom of thread
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', {
        message: textToSend,
        type: roleMode,
        conversationId
      });

      if (res.data.success) {
        setConversationId(res.data.conversationId);
        
        // Simulating character-by-character stream effect for premium UI feel
        setIsTyping(false);
        const replyText = res.data.reply;
        let currentText = '';
        let wordIndex = 0;
        const words = replyText.split(' ');
        
        const placeholderMsg = { role: 'assistant', content: '' };
        setMessages(prev => [...prev, placeholderMsg]);

        const streamInterval = setInterval(() => {
          if (wordIndex < words.length) {
            currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: currentText };
              return updated;
            });
            wordIndex++;
          } else {
            clearInterval(streamInterval);
          }
        }, 30); // 30ms per word represents smooth readable stream
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      toast.error('AI request connection failed');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection timed out. Check your backend configs.' }]);
    }
  };

  const handleRoleChange = (role) => {
    setRoleMode(role);
    setConversationId(null); // start fresh thread context
    setMessages([
      {
        role: 'assistant',
        content: `Initializing ${roleConfigs[role].title} Mode. ${roleConfigs[role].desc}. Ask me anything!`
      }
    ]);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto h-[calc(100vh-140px)]">
        
        {/* Selector Sidebar */}
        <div className="lg:col-span-1 glass-card p-5 rounded-3xl space-y-4 flex flex-col justify-between h-fit lg:h-full">
          <div className="space-y-4">
            <h3 className="font-bold text-sm tracking-tight text-slate-400 uppercase">AI Assistant Modes</h3>
            
            <div className="space-y-2">
              {Object.keys(roleConfigs).map(role => {
                const config = roleConfigs[role];
                const Icon = config.icon;
                const isSelected = roleMode === role;

                return (
                  <div
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`p-3 rounded-2xl flex items-start gap-3 cursor-pointer transition-all border ${isSelected ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/15' : 'bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/25 dark:border-slate-800/30'}`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white/20 text-white' : config.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-xs">{config.title}</h4>
                      <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/70' : 'text-slate-400 font-light'}`}>{config.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggestions Helper */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 hidden lg:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Prompts</p>
            <div className="space-y-1.5">
              {suggestions[roleMode].map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="w-full text-left p-2.5 bg-slate-100/50 dark:bg-slate-900/40 hover:bg-violet-600 hover:text-white rounded-xl text-[10px] text-slate-500 font-medium transition-all truncate"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Thread Panel */}
        <div className="lg:col-span-3 glass-card rounded-3xl flex flex-col justify-between overflow-hidden h-[500px] lg:h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3 bg-slate-50/30 dark:bg-slate-900/20">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/10 border border-violet-500/25 text-violet-600 flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
                {roleConfigs[roleMode].title}
              </h4>
              <p className="text-[10px] text-slate-400 font-light">Powered by OpenAI gpt-4o-mini</p>
            </div>
          </div>

          {/* Messages body */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div key={index} className={`flex gap-3 max-w-[85%] ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                  
                  {/* Bubble */}
                  <div className={`p-4 rounded-3xl text-xs leading-relaxed ${isAssistant ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/25 dark:border-slate-800/30' : 'bg-violet-600 text-white rounded-tr-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3 mr-auto max-w-[80%]">
                <div className="p-4 rounded-3xl rounded-tl-none bg-slate-100 dark:bg-slate-900 text-slate-400 text-xs flex items-center gap-1.5 border border-slate-200/25 dark:border-slate-800/30">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={scrollRef}></div>
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                placeholder="Ask me a question or paste some code here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-250/30 dark:border-slate-800/80 focus:border-violet-500 rounded-2xl text-xs outline-none"
              />
              <button
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                className="p-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-850 rounded-2xl text-white transition-all shadow-md shadow-violet-600/10"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AiMentor;
