import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Wallet, LogOut, CheckCircle, ShieldAlert, PlusCircle, GraduationCap, ClipboardList } from 'lucide-react';
import { Profile, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: Profile;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
          <div>
             <h1 className="text-lg font-bold text-white tracking-tight">
                WriterOpsPro
             </h1>
             <p className="text-[10px] text-slate-500">v2.0.1</p>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
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
              <Link to="/activate" className="block text-center text-xs bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-bold">
                Activate Now
              </Link>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email.split('@')[0]}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;