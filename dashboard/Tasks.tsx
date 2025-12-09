import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../../services/mockDatabase';
import { Task, Profile, TaskStatus, JOB_CATEGORIES, Bid, UserRole } from '../../types';
import { Clock, DollarSign, Briefcase, Filter, AlertTriangle, X, AlignLeft, Calendar, CheckSquare, Lock, Users, CheckCircle } from 'lucide-react';

interface TasksProps {
  user: Profile;
}

const Tasks: React.FC<TasksProps> = ({ user }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Async Data State
  const [bidCounts, setBidCounts] = useState<Record<string, number>>({});
  const [userBids, setUserBids] = useState<Set<string>>(new Set());

  // Bidding State
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [taskToApply, setTaskToApply] = useState<Task | null>(null);
  const [proposal, setProposal] = useState('');
  
  // Admin View State
  const [viewingBidsTask, setViewingBidsTask] = useState<Task | null>(null);
  const [currentBids, setCurrentBids] = useState<Bid[]>([]);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); 

  useEffect(() => {
    loadData();
    // Poll for updates
    const interval = setInterval(() => {
         loadData(true); // silent update
    }, 15000);
    return () => clearInterval(interval);
  }, [user.id, forceUpdate]);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    
    // 1. Fetch Tasks
    const tasksData = await taskService.getTasks();
    const openTasks = tasksData.filter(t => t.status === TaskStatus.OPEN);
    setTasks(openTasks);

    // 2. Fetch All Bids (to calculate counts)
    const allBids = await taskService.getAllBids();
    const counts: Record<string, number> = {};
    allBids.forEach(b => {
        counts[b.task_id] = (counts[b.task_id] || 0) + 1;
    });
    setBidCounts(counts);

    // 3. Fetch My Bids
    const myBids = await taskService.getUserBids(user.id);
    const myBidSet = new Set(myBids.map(b => b.task_id));
    setUserBids(myBidSet);

    if (!silent) setLoading(false);
  };

  const handleAttemptApply = (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!user.is_active && user.role !== 'admin') {
      navigate('/activate');
      return;
    }

    if (userBids.has(task.id)) {
        alert("You have already applied for this task.");
        return;
    }

    setTaskToApply(task);
    setSelectedTask(null);
  };

  const handleConfirmApplication = async () => {
    if (!taskToApply || !agreedToTerms) return;
    
    const taskId = taskToApply.id;
    setApplyingId(taskId);
    setTaskToApply(null);

    const result = await taskService.placeBid(taskId, user.id, proposal);
    
    if (result.success) {
      alert('Application Submitted! The client will review your profile.');
      setForceUpdate(prev => prev + 1); // Refresh data
    } else {
      alert(result.message);
    }
    setApplyingId(null);
  };

  const handleAdminViewBids = async (task: Task, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const bids = await taskService.getBidsByTask(task.id);
      setCurrentBids(bids);
      setViewingBidsTask(task);
      setSelectedTask(null);
  };

  const handleAdminAssign = async (bid: Bid) => {
      if (!window.confirm("Assign this task to this writer?")) return;
      
      const res = await taskService.assignTask(bid.task_id, bid.user_id);
      if (res.success) {
          alert("Task Assigned Successfully");
          setViewingBidsTask(null);
          loadData(); 
      } else {
          alert("Failed: " + res.message);
      }
  };

  // Reset agreement when opening modal
  useEffect(() => {
    if (taskToApply) {
        setAgreedToTerms(false);
        setProposal('');
    }
  }, [taskToApply]);

  const NextDropTimer = () => (
    <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-lg mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <Clock size={20} />
        </div>
        <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Next Job Drop</p>
            <p className="text-lg font-mono font-bold">07:00:00 AM</p>
        </div>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-xs text-slate-400">Time remaining</p>
        <p className="text-sm font-medium text-blue-400">12h 45m 30s</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      
      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="pr-8">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-md mb-3 inline-block">
                  {selectedTask.category}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedTask.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedTask(null)} 
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                   <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                     <DollarSign size={20} />
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 font-medium uppercase">Budget</p>
                     <p className="text-lg font-bold text-slate-900">{(selectedTask.price_cents / 100).toLocaleString()} KES</p>
                   </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                     <Users size={20} />
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 font-medium uppercase">Applicants</p>
                     <p className="text-lg font-bold text-slate-900">
                       {bidCounts[selectedTask.id] || 0} <span className="text-sm font-normal text-slate-500">Bids</span>
                     </p>
                   </div>
                </div>
              </div>

              <div className="mb-2 flex items-center gap-2 text-slate-900 font-bold">
                <AlignLeft size={18} className="text-blue-600" />
                <h3>Job Description</h3>
              </div>
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {selectedTask.description}
                <br /><br />
                <p className="italic text-slate-400 text-sm border-t border-slate-100 pt-4">
                  Job ID: {selectedTask.id} • Posted on {new Date(selectedTask.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
               <button
                onClick={() => setSelectedTask(null)}
                className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              
              {user.role === UserRole.ADMIN ? (
                 <button
                    onClick={() => handleAdminViewBids(selectedTask)}
                    className="px-8 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                 >
                    View & Accept Bids
                 </button>
              ) : (
                <button
                    onClick={() => handleAttemptApply(selectedTask)}
                    disabled={userBids.has(selectedTask.id)}
                    className={`px-8 py-2.5 font-bold text-sm rounded-lg transition-all shadow-lg flex items-center gap-2 ${
                    user.is_active 
                        ? (userBids.has(selectedTask.id) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-900/20')
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20'
                    }`}
                >
                    {user.is_active 
                        ? (userBids.has(selectedTask.id) ? 'Applied' : 'Apply Now') 
                        : (<><Lock size={16} /> Activate to Apply</>)
                    }
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin View Bids Modal */}
      {viewingBidsTask && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-900">
                      Applications for "{viewingBidsTask.title}"
                  </h3>
                  <button onClick={() => setViewingBidsTask(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                      <X size={20} />
                  </button>
              </div>
              <div className="p-6 overflow-y-auto bg-slate-50/50">
                  {currentBids.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 italic">
                          No applications received yet.
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {currentBids.map(bid => (
                              <div key={bid.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Writer ID</p>
                                          <p className="font-mono text-slate-700 text-sm">{bid.user_id}</p>
                                      </div>
                                      <span className="text-xs text-slate-400">{new Date(bid.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="mb-4">
                                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Proposal</p>
                                      <p className="text-slate-800 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                          {bid.proposal}
                                      </p>
                                  </div>
                                  <div className="flex justify-end">
                                      <button 
                                          onClick={() => handleAdminAssign(bid)}
                                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                                      >
                                          <CheckCircle size={16} /> Assign Writer
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
           </div>
        </div>
      )}

      {/* Application Modal (Writer) */}
      {taskToApply && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full flex-shrink-0">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Apply for Job</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Submit your proposal for <span className="font-bold text-slate-900">"{taskToApply.title}"</span>.
                  </p>
                </div>
              </div>

              <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Why are you the best fit?</label>
                  <textarea 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                    placeholder="Briefly describe your experience relevant to this task..."
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                  ></textarea>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                  Note: Submitting a bid does not guarantee assignment. The client will review all proposals.
                </p>
              </div>

              <div 
                className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
              >
                <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreedToTerms ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400 bg-white'}`}>
                        {agreedToTerms && <CheckSquare size={14} />}
                    </div>
                    <span className="text-sm font-medium text-slate-700 select-none">I understand the terms.</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setTaskToApply(null)}
                className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApplication}
                disabled={!agreedToTerms || proposal.length < 10}
                className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Submit Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Available Tasks</h1>
          <p className="text-slate-500">Browse and bid on open micro-tasks.</p>
        </div>
        
        {/* Dynamic Category Filter */}
        <div className="w-full overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                <button
                    onClick={() => setFilter('All')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap ${
                        filter === 'All' 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    All Categories
                </button>
                {JOB_CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap ${
                            filter === cat 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </header>

      <NextDropTimer />

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
           {[1,2,3,4].map(i => (
             <div key={i} className="h-48 bg-white rounded-xl border border-slate-100 animate-pulse"></div>
           ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
            <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900">No jobs available</h3>
            <p className="text-slate-500">Wait for the next drop at 7 AM.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tasks
            .filter(t => filter === 'All' || t.category === filter)
            .map(task => {
                const hasApplied = userBids.has(task.id);
                const applicantCount = bidCounts[task.id] || 0;
                
                return (
                <div 
                key={task.id} 
                onClick={() => setSelectedTask(task)}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer ring-0 hover:ring-2 ring-blue-500/10"
                >
                <div>
                    <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-md truncate max-w-[150px]">
                        {task.category}
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1 flex-shrink-0">
                        <Users size={12} /> {applicantCount} Bids
                    </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {task.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-6">
                    {task.description}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-slate-900 font-bold text-lg">
                    <DollarSign size={18} className="text-green-600" />
                    {(task.price_cents / 100).toLocaleString()} KES
                    </div>
                    
                    {user.role === UserRole.ADMIN ? (
                         <button
                            onClick={(e) => handleAdminViewBids(task, e)}
                            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium text-sm transition-colors hover:bg-slate-800 shadow-md"
                        >
                            Review {applicantCount} Bids
                        </button>
                    ) : (
                        <button
                        onClick={(e) => handleAttemptApply(task, e)}
                        disabled={applyingId === task.id || hasApplied}
                        className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${
                            user.is_active
                            ? (hasApplied ? 'bg-slate-100 text-slate-500 shadow-none' : 'bg-slate-900 text-white hover:bg-blue-600')
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        >
                        {user.is_active 
                            ? (applyingId === task.id ? 'Sending...' : (hasApplied ? 'Applied' : 'Apply')) 
                            : 'Activate'}
                        </button>
                    )}
                </div>
                </div>
            )})}
        </div>
      )}
    </div>
  );
};

export default Tasks;