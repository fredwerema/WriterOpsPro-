import React, { useEffect, useState } from 'react';
import { taskService, SQL_SETUP_SCRIPT } from '../../services/mockDatabase';
import { Task, TaskStatus } from '../../types';
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  Download, 
  FileText, 
  Calendar,
  User,
  DollarSign,
  RefreshCw,
  Clock,
  Database,
  Copy,
  X
} from 'lucide-react';

const AdminReview: React.FC = () => {
  const [reviews, setReviews] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    const data = await taskService.getReviews();
    setReviews(data);
    setLoading(false);
  };

  const handleDecision = async (taskId: string, approved: boolean) => {
    const confirmed = window.confirm(
        approved 
        ? "Approve this task? This will mark it as complete and credit the writer." 
        : "Reject this task? It will be sent back to the writer for revision."
    );
    
    if (!confirmed) return;

    // Optimistic Update: Remove from list immediately
    const originalReviews = [...reviews];
    setReviews(prev => prev.filter(t => t.id !== taskId));

    const result = await taskService.processReview(taskId, approved);
    
    if (!result.success) {
        alert(`Error: ${result.message}`);
        // Revert on failure
        setReviews(originalReviews);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Task Reviews</h1>
            <p className="text-slate-500">Review submissions and approve payments.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowSql(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                title="Run this if you see errors"
            >
                <Database size={16} /> Fix Database
            </button>
            <button 
                onClick={loadReviews}
                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                title="Refresh List"
            >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1,2,3].map(i => (
             <div key={i} className="h-40 bg-white rounded-xl border border-slate-100 animate-pulse"></div>
           ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
            <ClipboardList className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
            <p className="text-slate-500">There are no tasks pending review at the moment.</p>
            <button 
                onClick={loadReviews}
                className="mt-4 text-blue-600 text-sm font-bold hover:underline"
            >
                Check again
            </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map(task => (
            <div key={task.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                     <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase rounded-md flex items-center gap-1">
                           <Clock size={12} /> Pending Review
                        </span>
                        <span className="text-xs text-slate-400">ID: {task.id}</span>
                     </div>
                     <h3 className="text-xl font-bold text-slate-900">{task.title}</h3>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-500">
                      <div className="flex flex-col items-end">
                          <span className="text-xs uppercase font-bold tracking-wider">Writer ID</span>
                          <span className="flex items-center gap-1 font-mono text-slate-900"><User size={14}/> {task.assigned_to?.substring(0,8)}...</span>
                      </div>
                      <div className="flex flex-col items-end">
                          <span className="text-xs uppercase font-bold tracking-wider">Submitted</span>
                          <span className="flex items-center gap-1 text-slate-900"><Calendar size={14}/> Today</span>
                      </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <FileText size={16} /> Submission Notes
                        </h4>
                        <p className="text-sm text-slate-600 italic">
                            "{task.submission_notes || 'No notes provided.'}"
                        </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                        <div>
                             <h4 className="text-sm font-bold text-slate-900 mb-1">Attached File</h4>
                             <p className="text-xs text-slate-500 truncate max-w-[200px]">{task.submission_url}</p>
                        </div>
                        <a 
                            href={task.submission_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Download size={16} /> Download
                        </a>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                   <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                        <DollarSign size={20} className="text-green-600" />
                        {(task.price_cents / 100).toLocaleString()} KES
                        <span className="text-xs font-normal text-slate-500 ml-1">(Payout Amount)</span>
                   </div>

                   <div className="flex items-center gap-3">
                       <button 
                         onClick={() => handleDecision(task.id, false)}
                         className="px-5 py-2.5 text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                       >
                           <XCircle size={18} /> Reject
                       </button>
                       <button 
                         onClick={() => handleDecision(task.id, true)}
                         className="px-6 py-2.5 bg-green-600 text-white font-bold text-sm hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
                       >
                           <CheckCircle size={18} /> Approve & Pay
                       </button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Database Fix Modal */}
      {showSql && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Run Database Setup</h3>
                    <button onClick={() => setShowSql(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto bg-slate-50">
                    <p className="text-sm text-slate-600 mb-4">
                        If you are seeing "Permission Denied" or "Failed to process" errors, your database table permissions (RLS) are likely too strict. 
                        <br/><br/>
                        <strong>Copy the code below</strong> and run it in the <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline">Supabase SQL Editor</a>.
                    </p>
                    <div className="relative">
                        <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto font-mono custom-scrollbar border border-slate-700">
                            {SQL_SETUP_SCRIPT}
                        </pre>
                        <button 
                            onClick={handleCopySql}
                            className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg backdrop-blur-sm transition-colors flex items-center gap-1"
                        >
                            {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                            {copied ? 'Copied!' : 'Copy SQL'}
                        </button>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={() => setShowSql(false)}
                        className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminReview;