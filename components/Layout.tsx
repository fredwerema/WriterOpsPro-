import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Wallet, LogOut, CheckCircle, ShieldAlert, PlusCircle, GraduationCap, ClipboardList, Menu, X, MessageCircle, User, Crown, Star, Smartphone, Loader, Phone } from 'lucide-react';
import { Profile, UserRole } from '../types';
import { paymentService } from '../services/mockDatabase';

interface LayoutProps {
  children: React.ReactNode;
  user: Profile;
  onLogout: () => void;
  onUpdateUser?: (user: Profile) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onUpdateUser }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const handleUpgrade = async (plan: 'Pro' | 'Elite', amount: number) => {
      setUpgradingPlan(plan);
      try {
          const res = await paymentService.initiateSTKPush(user.phone_number || '0700000000', amount);
          if (res.success) {
              // Wait a bit to simulate user entering PIN
              const updatedUser = await paymentService.upgradeTier(user, plan, amount * 100);
              if (onUpdateUser) onUpdateUser(updatedUser);
              alert(`Success! You are now on the ${plan} plan.`);
          } else {
              alert(res.message);
          }
      } catch (error: any) {
          alert("Upgrade failed: " + error.message);
      } finally {
          setUpgradingPlan(null);
      }
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
        isActive(to)
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );

  const SidebarContent = () => (
    <>
      <div className="mb-6">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Workspace
        </p>
        {user.role === UserRole.ADMIN ? (
           <>
             <NavItem to="/dashboard/admin/review" icon={ClipboardList} label="Review Tasks" />
             <NavItem to="/dashboard/admin/post" icon={PlusCircle} label="Post New Job" />
             <NavItem to="/dashboard/tasks" icon={Briefcase} label="All Tasks (View)" />
           </>
        ) : (
          <>
            <NavItem to="/dashboard/tasks" icon={Briefcase} label="Available Tasks" />
            <NavItem to="/dashboard/my-jobs" icon={CheckCircle} label="My Active Jobs" />
            <NavItem to="/dashboard/training" icon={GraduationCap} label="Training Academy" />
          </>
        )}
        <NavItem to="/dashboard/wallet" icon={Wallet} label="Wallet & Earnings" />
      </div>

      {!user.is_active && user.role !== UserRole.ADMIN && (
        <div className="mx-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-4">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <ShieldAlert size={16} />
            <span className="text-xs font-bold uppercase">Action Required</span>
          </div>
          <p className="text-xs text-orange-200 mb-3">
            Account not active. Pay the activation fee to claim jobs.
          </p>
          <Link 
            to="/activate" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center text-xs bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-bold"
          >
            Activate Now
          </Link>
        </div>
      )}
    </>
  );

  const UserProfile = () => (
    <div className="p-4 border-t border-slate-800">
      <div 
        onClick={() => setProfileModalOpen(true)}
        className="flex items-center gap-3 px-4 py-3 mb-2 cursor-pointer hover:bg-slate-800 rounded-lg transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.email.split('@')[0]}</p>
          <div className="flex items-center gap-1">
             <span className="text-xs text-slate-500 truncate capitalize">{user.role}</span>
             {user.tier && user.tier !== 'Basic' && (
                 <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${user.tier === 'Elite' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {user.tier}
                 </span>
             )}
          </div>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-20 flex-shrink-0">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="font-bold text-lg">WriterOpsPro</span>
         </div>
         <button onClick={() => setMobileMenuOpen(true)} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <Menu size={28} />
         </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 flex-shrink-0 z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
          <div>
             <h1 className="text-lg font-bold text-white tracking-tight">
                WriterOpsPro
             </h1>
             <p className="text-[10px] text-slate-500">v2.0.1</p>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col">
          <SidebarContent />
        </nav>

        <UserProfile />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
             onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="absolute top-0 bottom-0 left-0 w-[85%] max-w-xs bg-slate-900 text-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
             <div className="p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
                    <span className="font-bold text-lg">Menu</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <X size={24} />
                </button>
             </div>
             
             <nav className="flex-1 p-4 overflow-y-auto flex flex-col">
                <SidebarContent />
             </nav>
             
             <UserProfile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative w-full bg-slate-50">
        {children}
      </main>

      {/* Profile Modal */}
      {profileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                  <div className="relative bg-slate-900 p-8 text-center text-white overflow-hidden">
                       <button 
                          onClick={() => setProfileModalOpen(false)}
                          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                           <X size={20} />
                       </button>
                       <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-slate-800 shadow-xl">
                           {user.email.charAt(0).toUpperCase()}
                       </div>
                       <h2 className="text-2xl font-bold">{user.email.split('@')[0]}</h2>
                       <p className="text-slate-400 mb-4">{user.email}</p>
                       <div className="flex items-center justify-center gap-3">
                           <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-300 flex items-center gap-1">
                               <Phone size={12} /> {user.phone_number || 'N/A'}
                           </span>
                           <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                               user.tier === 'Elite' ? 'bg-purple-500/20 text-purple-300' : 
                               user.tier === 'Pro' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-300'
                           }`}>
                               {user.tier === 'Elite' ? <Crown size={12} /> : user.tier === 'Pro' ? <Star size={12} /> : <User size={12} />}
                               {user.tier || 'Basic'} Plan
                           </span>
                       </div>
                  </div>

                  <div className="p-8 bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-900 mb-6">Upgrade Your Plan</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                          {/* Basic Plan */}
                          <div className={`p-5 rounded-xl border-2 transition-all ${user.tier === 'Basic' || !user.tier ? 'border-green-500 bg-white ring-4 ring-green-500/10' : 'border-slate-200 bg-white opacity-60'}`}>
                              <div className="mb-4">
                                  <span className="text-xs font-bold uppercase text-slate-500">Starter</span>
                                  <h4 className="text-xl font-bold text-slate-900">Basic</h4>
                              </div>
                              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Standard Rates</li>
                                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Daily Payments</li>
                              </ul>
                              <button disabled className="w-full py-2 bg-slate-100 text-slate-500 font-bold text-xs rounded-lg">
                                  {user.tier === 'Basic' || !user.tier ? 'Current Plan' : 'Free'}
                              </button>
                          </div>

                          {/* Pro Plan */}
                          <div className={`p-5 rounded-xl border-2 transition-all ${user.tier === 'Pro' ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg'}`}>
                              <div className="mb-4">
                                  <span className="text-xs font-bold uppercase text-blue-600">Popular</span>
                                  <h4 className="text-xl font-bold text-slate-900">Pro</h4>
                                  <p className="text-sm font-bold text-slate-500">KES 1,000<span className="text-[10px] font-normal">/mo</span></p>
                              </div>
                              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-500"/> 20% Higher Rates</li>
                                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-500"/> Priority Support</li>
                                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-500"/> Access Pro Jobs</li>
                              </ul>
                              {user.tier === 'Pro' ? (
                                  <button disabled className="w-full py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg border border-blue-100">
                                      Current Plan
                                  </button>
                              ) : (
                                  <button 
                                    onClick={() => handleUpgrade('Pro', 1000)}
                                    disabled={!!upgradingPlan}
                                    className="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                  >
                                      {upgradingPlan === 'Pro' ? <Loader size={14} className="animate-spin"/> : 'Upgrade'}
                                  </button>
                              )}
                          </div>

                          {/* Elite Plan */}
                          <div className={`p-5 rounded-xl border-2 transition-all ${user.tier === 'Elite' ? 'border-purple-500 bg-white ring-4 ring-purple-500/10' : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-lg'}`}>
                              <div className="mb-4">
                                  <span className="text-xs font-bold uppercase text-purple-600">Best Value</span>
                                  <h4 className="text-xl font-bold text-slate-900">Elite</h4>
                                  <p className="text-sm font-bold text-slate-500">KES 2,500<span className="text-[10px] font-normal">/mo</span></p>
                              </div>
                              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-500"/> 40% Higher Rates</li>
                                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-500"/> Direct Client Chat</li>
                                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-500"/> 0% Service Fees</li>
                              </ul>
                              {user.tier === 'Elite' ? (
                                  <button disabled className="w-full py-2 bg-purple-50 text-purple-600 font-bold text-xs rounded-lg border border-purple-100">
                                      Current Plan
                                  </button>
                              ) : (
                                  <button 
                                    onClick={() => handleUpgrade('Elite', 2500)}
                                    disabled={!!upgradingPlan}
                                    className="w-full py-2 bg-purple-600 text-white font-bold text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                  >
                                      {upgradingPlan === 'Elite' ? <Loader size={14} className="animate-spin"/> : 'Upgrade'}
                                  </button>
                              )}
                          </div>
                      </div>
                      
                      {upgradingPlan && (
                          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-center gap-3 animate-fade-in-up">
                              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                  <Smartphone size={20} />
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-yellow-900">Check your phone</p>
                                  <p className="text-xs text-yellow-700">Enter your M-PESA PIN to complete the upgrade to {upgradingPlan}.</p>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/254111461415" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-green-500 text-white px-5 py-3 rounded-full font-bold shadow-lg hover:bg-green-600 hover:scale-105 transition-all flex items-center gap-2"
      >
        <MessageCircle size={24} />
        Chat with us
      </a>
    </div>
  );
};

export default Layout;