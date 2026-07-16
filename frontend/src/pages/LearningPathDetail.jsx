import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadPathById, toggleNode, clearNewCertificate } from '../store/slices/roadmapSlice';
import {
  Map,
  Compass,
  Lock,
  Play,
  CheckCircle,
  HelpCircle,
  FileText,
  Award,
  Video,
  Code,
  Check,
  ChevronRight,
  BookOpen,
  Heart,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import api from '../utils/api';

const LearningPathDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPath, isLoading, newCertificate } = useSelector((state) => state.roadmap);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    dispatch(loadPathById(id));
  }, [dispatch, id]);

  // Show modal/celebration when certificate is earned
  useEffect(() => {
    if (newCertificate) {
      toast.success('Congratulations! You earned a Certificate of Completion!', {
        position: 'top-center',
        autoClose: 8000,
      });
      // Redirect to certificates after 3s
      setTimeout(() => {
        dispatch(clearNewCertificate());
        navigate('/certificates');
      }, 3000);
    }
  }, [newCertificate, navigate, dispatch]);

  const handleToggleNode = async (nodeId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'unlocked' : 'completed';
    const result = await dispatch(toggleNode({ pathId: id, nodeId, status: nextStatus }));
    if (toggleNode.fulfilled.match(result)) {
      toast.success(nextStatus === 'completed' ? 'Node completed! Next node unlocked.' : 'Progress updated.');
      dispatch(loadPathById(id)); // refresh
    } else {
      toast.error('Failed to update node status');
    }
  };

  if (isLoading || !currentPath) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-60 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      </Layout>
    );
  }

  const getNodeIcon = (type) => {
    switch (type) {
      case 'course':
        return BookOpen;
      case 'video':
        return Video;
      case 'quiz':
        return HelpCircle;
      case 'project':
        return Code;
      default:
        return FileText;
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link to="/paths" className="hover:underline">Learning Paths</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 dark:text-slate-300 truncate">{currentPath.title}</span>
        </div>

        {/* Roadmap Overview Card */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-[80px]"></div>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs bg-violet-600 px-2.5 py-0.5 rounded-full font-bold">AI Recommended</span>
              <span className="text-xs bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-300 font-bold uppercase">{currentPath.difficulty}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{currentPath.title}</h2>
            <p className="text-sm text-slate-400 max-w-2xl font-light">{currentPath.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-semibold text-slate-300">Milestone Progress</span>
                <span className="text-violet-400 font-bold">{currentPath.currentProgress}% Complete</span>
              </div>
              <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/30">
                <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all" style={{ width: `${currentPath.currentProgress}%` }}></div>
              </div>
            </div>
            {currentPath.currentProgress === 100 && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl w-fit md:ml-auto text-emerald-400 text-xs font-semibold">
                <Award size={16} />
                <span>Roadmap fully completed! Certificate generated.</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Nodes Timeline Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Node Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-lg tracking-tight">Timeline Roadmap</h3>

            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-8">
              {currentPath.nodes.map((node, index) => {
                const Icon = getNodeIcon(node.type);
                const isSelected = selectedNode?.id === node.id;
                
                return (
                  <div key={node.id} className="relative group">
                    
                    {/* Floating Node Status Indicator */}
                    <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center text-white ${node.status === 'completed' ? 'bg-emerald-500' : node.status === 'unlocked' ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-800'}`}>
                      {node.status === 'completed' ? <Check size={10} strokeWidth={4} /> : null}
                    </div>

                    {/* Timeline Info Card */}
                    <div
                      onClick={() => node.status !== 'locked' && setSelectedNode(node)}
                      className={`p-5 glass-card rounded-2xl transition-all select-none ${node.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-violet-500/30'} ${isSelected ? 'border-violet-500 dark:border-violet-500 shadow-violet-500/5 ring-1 ring-violet-500' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 text-slate-500 uppercase px-2 py-0.5 rounded-md font-bold tracking-wider">
                              {node.type}
                            </span>
                            {node.status === 'unlocked' && (
                              <span className="text-[10px] text-violet-500 font-semibold animate-pulse">Active</span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{node.title}</h4>
                          <p className="text-xs text-slate-400 font-light truncate max-w-md">{node.description}</p>
                        </div>

                        {node.status === 'locked' ? (
                          <Lock size={16} className="text-slate-400 mt-1 shrink-0" />
                        ) : (
                          <ChevronRight size={16} className="text-slate-400 mt-1 shrink-0" />
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Details Inspection Panel */}
          <div>
            <div className="p-6 glass-card rounded-3xl sticky top-24 space-y-6">
              {selectedNode ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] bg-violet-600/10 border border-violet-500/20 text-violet-500 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {selectedNode.type} Details
                    </span>
                    <h4 className="font-bold text-base leading-snug">{selectedNode.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">{selectedNode.description}</p>
                  </div>

                  {/* Resource Section */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Recommended Material</p>
                      {selectedNode.resourceRef && (
                        <button
                          onClick={() => {
                            api.post('/student/wishlist', { itemType: 'Resource', itemId: selectedNode.resourceRef._id })
                              .then(() => toast.success('Saved to wishlist'))
                              .catch(() => toast.error('Could not save to wishlist'));
                          }}
                          className="flex items-center gap-1 text-[10px] font-semibold text-rose-500 hover:text-rose-600"
                        >
                          <Heart size={12} /> Save
                        </button>
                      )}
                    </div>
                    {selectedNode.resourceRef ? (
                      <div className="p-4 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/40 rounded-2xl space-y-3">
                        <div className="flex items-start gap-2.5">
                          {selectedNode.type === 'quiz' ? (
                            <HelpCircle size={18} className="text-violet-500 mt-0.5 shrink-0" />
                          ) : selectedNode.type === 'project' ? (
                            <Code size={18} className="text-violet-500 mt-0.5 shrink-0" />
                          ) : (
                            <Video size={18} className="text-violet-500 mt-0.5 shrink-0" />
                          )}
                          <div className="overflow-hidden">
                            <h5 className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">{selectedNode.title}</h5>
                            <p className="text-[10px] text-slate-400 font-light truncate mt-0.5">{selectedNode.resourceRef.url}</p>
                          </div>
                        </div>
                        {selectedNode.type === 'quiz' ? (
                          <button
                            onClick={() => navigate('/quiz-viewer', { state: { topic: selectedNode.title } })}
                            className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all text-center block"
                          >
                            Launch AI Quiz Assessment
                          </button>
                        ) : (
                          <a
                            href={selectedNode.resourceRef.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all text-center block"
                          >
                            Open Learning Material
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-light italic">No dynamic material attached.</p>
                    )}
                  </div>

                  {/* Toggle Complete Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleToggleNode(selectedNode.id, selectedNode.status)}
                      className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${selectedNode.status === 'completed' ? 'bg-amber-600/10 border border-amber-500/25 text-amber-500 hover:bg-amber-600/20' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/15'}`}
                    >
                      {selectedNode.status === 'completed' ? (
                        <>
                          <RotateCcw size={14} />
                          <span>Mark Node Incomplete</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} strokeWidth={3} />
                          <span>Mark Step as Complete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Compass size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
                  <p>Select an unlocked timeline step to view learning details, resources, and complete milestones.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default LearningPathDetail;
