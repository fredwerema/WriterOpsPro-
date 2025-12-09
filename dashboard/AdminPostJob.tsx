import React, { useState } from 'react';
import { taskService } from '../../services/mockDatabase';
import { useNavigate } from 'react-router-dom';
import { JOB_CATEGORIES } from '../../types';
import { 
  Briefcase, 
  DollarSign, 
  FileText, 
  Send, 
  Type, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Database
} from 'lucide-react';

const AdminPostJob: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: JOB_CATEGORIES[0], // Default to first category
    description: '',
    duration: '48' // hours
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSeedData = async () => {
      if (!window.confirm("This will add 30+ sample tasks to the database. Continue?")) return;
      setSeedLoading(true);
      const res = await taskService.seedTasks();
      setSeedLoading(false);
      if (res.success) {
          alert(res.message);
      } else {
          setError(res.message);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.title || !formData.price || !formData.description) {
        throw new Error("Please fill in all required fields.");
      }

      const priceCents = parseInt(formData.price) * 100;
      if (isNaN(priceCents) || priceCents <= 0) {
        throw new Error("Please enter a valid positive price.");
      }

      const deadline = new Date();
      deadline.setHours(deadline.getHours() + parseInt(formData.duration));

      await taskService.createTask({
        title: formData.title,
        description: formData.description,
        price_cents: priceCents,
        category: formData.category,
        deadline: deadline.toISOString()
      });

      setSuccess(true);
      
      // Redirect after showing success state
      setTimeout(() => {
        navigate('/dashboard/tasks');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to post job');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Posted Successfully!</h2>
        <p className="text-slate-500">Redirecting you to the job board...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Post a New Job</h1>
            <p className="text-slate-500 mt-1">Create a new task for the freelance community.</p>
        </div>
        <button 
            type="button"
            onClick={handleSeedData}
            disabled={seedLoading}
            className="text-xs flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors font-medium"
        >
            {seedLoading ? (
                <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
            ) : <Database size={14} />}
            Generate Sample Data
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Progress Bar / Header Visual */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 w-full"></div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Job Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Type className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400"
                placeholder="e.g. Write 5 SEO Articles about Fintech"
                autoFocus
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Budget (KES)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="text-slate-400 group-focus-within:text-green-500 transition-colors" size={18} />
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="2500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Set a competitive price to attract top talent.</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 bg-white appearance-none cursor-pointer"
                >
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
             {/* Deadline Preset */}
             <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Duration / Deadline</label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                </div>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 bg-white appearance-none cursor-pointer"
                >
                  <option value="24">24 Hours</option>
                  <option value="48">48 Hours</option>
                  <option value="72">3 Days</option>
                  <option value="168">1 Week</option>
                </select>
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description</label>
            <div className="relative group">
              <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                <FileText className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400 min-h-[160px] resize-y"
                placeholder="Provide detailed instructions, word count requirements, and style guides..."
              ></textarea>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
             <button
              type="button"
              onClick={() => navigate('/dashboard/tasks')}
              className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Publish Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPostJob;