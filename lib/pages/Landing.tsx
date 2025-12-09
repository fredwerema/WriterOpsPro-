import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, GraduationCap, Zap, ShieldCheck } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">W</div>
             <span className="text-2xl font-bold text-slate-900">WriterOpsPro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600">
              Log in
            </Link>
            <Link to="/register" className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Daily Job Drops at 7:00 AM
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
            Write Your Future, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">One Job at a Time</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The elite marketplace for Kenyan writers. Access high-paying micro-tasks, level up with our Training Academy, and get paid instantly via M-PESA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30">
              Start Earning Today <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
              View Open Tasks
            </Link>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10"></div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to succeed</h2>
            <p className="text-slate-500 mt-2">More than just a job board.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Training Academy</h3>
              <p className="text-slate-600 leading-relaxed">Access exclusive courses. Move from Basic to Elite tiers to unlock higher-paying tasks and priority support.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Payments</h3>
              <p className="text-slate-600 leading-relaxed">No waiting for end-of-month. Withdraw your earnings to M-PESA immediately after task approval.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Guaranteed Work</h3>
              <p className="text-slate-600 leading-relaxed">Verified Active writers get access to a consistent stream of work posted every single morning.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;