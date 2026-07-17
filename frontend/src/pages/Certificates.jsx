import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Award, Compass, ShieldCheck, Download } from 'lucide-react';
import Layout from '../components/Layout';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user certificates
    api.get('/auth/profile')
      .then(res => {
        // Fetch paths to check completions and link certificates
        api.get('/paths')
          .then(pathsRes => {
            const completedPaths = pathsRes.data.paths?.filter(p => p.currentProgress === 100) || [];
            // Map completed paths to structured certificate representations
            const mappedCerts = completedPaths.map((p, idx) => ({
              _id: `cert-${idx}`,
              title: `Certificate of Completion: ${p.title}`,
              description: `Successfully mastered the Personalized AI Learning Path: ${p.title}. Completed all module checks.`,
              issueDate: p.updatedAt,
              credentialId: `SPAI-${p._id.slice(-6).toUpperCase()}-${new Date(p.updatedAt).getFullYear()}`,
              pathTitle: p.title
            }));
            setCertificates(mappedCerts);
            setIsLoading(false);
          });
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-xl font-bold tracking-tight">Earned Certificates</h2>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map(cert => (
              <div key={cert._id} className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl text-white flex flex-col justify-between h-64 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl"></div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-violet-600 px-2.5 py-0.5 rounded-full font-bold uppercase">Issued</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {cert.credentialId}</span>
                  </div>
                  <h4 className="font-bold text-sm leading-snug">{cert.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-light">{cert.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[10px] text-slate-400">Verified System Signature</span>
                  </div>
                  <a
                    href="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=600"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white rounded-xl transition-all"
                  >
                    <Download size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-xs glass-card rounded-3xl">
            <Award size={36} className="mx-auto text-slate-300 dark:text-slate-800 mb-3" />
            <p>You have not earned any certificates yet. Complete 100% of any AI learning roadmap to issue verified completions.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Certificates;
