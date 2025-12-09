import React from 'react';
import { BookOpen, PlayCircle, Lock, Trophy, Star, Check } from 'lucide-react';

const Training: React.FC = () => {
  const tiers = [
    { name: 'Basic', active: true, price: 0, color: 'text-slate-600', bg: 'bg-slate-100' },
    { name: 'Pro', active: false, price: 800, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Elite', active: false, price: 1500, color: 'text-purple-600', bg: 'bg-purple-100' }
  ];

  const courses = [
    {
      id: 1,
      title: "SEO Writing Mastery",
      modules: 4,
      duration: "2h 30m",
      progress: 75,
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=300",
      tier: "Basic"
    },
    {
      id: 2,
      title: "Technical Transcription",
      modules: 8,
      duration: "4h 15m",
      progress: 0,
      image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=300",
      tier: "Basic"
    },
    {
      id: 3,
      title: "Elite Copywriting",
      modules: 12,
      duration: "6h 00m",
      progress: 0,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300",
      tier: "Elite",
      locked: true
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Training Academy</h1>
        <p className="text-slate-500">Complete courses to unlock higher tiers and better pay.</p>
      </div>

      {/* Tier Progress */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10">
        <div className="flex items-center justify-between mb-6">
           <div>
             <h3 className="font-bold text-slate-900">Your Writer Tier</h3>
             <p className="text-xs text-slate-500">Upgrade to access exclusive high-value jobs.</p>
           </div>
           <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Current: Basic</span>
        </div>
        
        <div className="flex items-center justify-between relative px-4">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2"></div>
          
          {tiers.map((tier, idx) => (
            <div key={tier.name} className="flex flex-col items-center gap-3 bg-white px-4 py-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all ${tier.active ? 'border-blue-600 bg-white text-blue-600 shadow-blue-200 shadow-lg' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                {tier.active ? <Trophy size={24} /> : <Lock size={20} />}
              </div>
              <div className="text-center flex flex-col items-center">
                  <span className={`block text-sm font-bold ${tier.active ? 'text-slate-900' : 'text-slate-500'}`}>{tier.name}</span>
                  
                  {tier.active ? (
                    <span className="mt-1 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                       <Check size={10} /> Active
                    </span>
                  ) : tier.price > 0 ? (
                      <button 
                        onClick={() => alert(`Initiate M-PESA payment of KES ${tier.price} to unlock ${tier.name} tier.`)}
                        className="mt-2 px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-full hover:bg-blue-600 hover:scale-105 transition-all shadow-lg shadow-slate-900/20 whitespace-nowrap"
                      >
                          Unlock KES {tier.price}
                      </button>
                  ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Free</span>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-lg transition-all">
            <div className="h-40 bg-slate-200 relative">
               <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute top-3 right-3">
                 <span className={`px-3 py-1 rounded-lg text-xs font-bold bg-white/90 backdrop-blur-sm ${course.tier === 'Elite' ? 'text-purple-600' : 'text-slate-700'}`}>
                   {course.tier}
                 </span>
               </div>
               {course.locked && (
                 <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                   <Lock className="text-white" size={32} />
                 </div>
               )}
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-slate-900 mb-2">{course.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><BookOpen size={14} /> {course.modules} Modules</span>
                <span className="flex items-center gap-1"><PlayCircle size={14} /> {course.duration}</span>
              </div>
              
              {!course.locked && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{course.progress}% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              )}

              <button disabled={course.locked} className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${course.locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
                {course.progress > 0 ? 'Continue Learning' : (course.locked ? 'Locked' : 'Start Course')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Training;