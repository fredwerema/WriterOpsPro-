import React, { useEffect, useState } from 'react';
import { taskService } from '../../services/mockDatabase';
import { Task, TaskStatus, Profile } from '../../types';
import { 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Calendar, 
  DollarSign, 
  Paperclip
} from 'lucide-react';

interface MyJobsProps {
  user: Profile;
}

const MyJobs: React.FC<MyJobsProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Submission Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyJobs();
  }, [user.id]);

  const fetchMyJobs = async () => {
    const data = await taskService.getMyJobs(user.id);
    setTasks(data);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !submissionFile) return;

    setSubmitting(true);
    try {
      const result = await taskService.submitTask(selectedTask.id, submissionNotes, submissionFile);
      if (result.success) {
        // Close modal and refresh list
        setSelectedTask(null);
        setSubmissionFile(null);
        setSubmissionNotes('');
        await fetchMyJobs();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const StatusBadge = ({ status }: { status: TaskStatus }) => {
    switch (status) {
      case TaskStatus.ASSIGNED:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            <Clock size={12} /> In Progress
          </span>
        );
      case TaskStatus.REVIEW:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
            <AlertCircle size={12} /> Under Review
          </span>
        );
      case TaskStatus.COMPLETED:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
            <CheckCircle size={12} /> Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Active Jobs</h1>
        <p className="text-slate-500">Track progress and submit your work.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1,2].map(i => (
             <div key={i} className="h-32 bg-white rounded-xl border border-slate-100 animate-pulse"></div>
           ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
            <FileText className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900">No active jobs</h3>
            <p className="text-slate-500">Go to "Available Tasks" to claim your first job.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <StatusBadge status={task.status} />
                       <span className="text-xs text-slate-400">ID: {task.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{task.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Deadline</p>
                    <p className="font-bold text-slate-900 flex items-center gap-1 sm:justify-end">
                       <Calendar size={14} className="text-blue-600" />
                       {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 mb-6 border border-slate-100">
                  {task.description.length > 150 ? `${task.description.substring(0, 150)}...` : task.description}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <DollarSign size={16} className="text-green-600" />
                    {(task.price_cents / 100).toLocaleString()} KES
                  </div>

                  {task.status === TaskStatus.ASSIGNED ? (
                    <button 
                      onClick={() => setSelectedTask(task)}
                      className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2"
                    >
                      <Upload size={16} /> Submit Work
                    </button>
                  ) : (
                    <button disabled className="px-5 py-2 bg-slate-100 text-slate-400 text-sm font-bold rounded-lg cursor-not-allowed border border-slate-200">
                      {task.status === TaskStatus.REVIEW ? 'Awaiting Review' : 'Funds Released'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Submit Assignment</h3>
              <button 
                onClick={() => {
                  setSelectedTask(null);
                  setSubmissionFile(null);
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                 <p className="text-sm font-medium text-slate-700 mb-1">Task</p>
                 <p className="text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                   {selectedTask.title}
                 </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-900 mb-2">Upload File</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors group">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  {submissionFile ? (
                    <div className="flex flex-col items-center text-blue-600">
                      <FileText size={32} className="mb-2" />
                      <p className="text-sm font-medium break-all">{submissionFile.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{(submissionFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-slate-500">
                      <Upload size={32} className="mb-2" />
                      <p className="text-sm font-medium">Click or drag file here</p>
                      <p className="text-xs mt-1">DOCX, PDF, or ZIP supported</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-900 mb-2">Notes for Reviewer (Optional)</label>
                <textarea
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                  rows={3}
                  placeholder="Any comments about this submission..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !submissionFile}
                  className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Paperclip size={16} /> Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;