import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Wallet, LogOut, CheckCircle, ShieldAlert, PlusCircle, GraduationCap, ClipboardList, Menu, X, Database, Copy } from 'lucide-react';
import { Profile, UserRole } from '../types';
import { SQL_SETUP_SCRIPT } from '../services/mockDatabase';

interface LayoutProps {
  children: React.ReactNode;
  user: Profile;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
      
      {/* DB Setup Helper */}
      <div className="mt-auto px-4 pb-4">
        <button 
          onClick={() => {
            setShowSqlModal(true);
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-500 hover:text-blue-400 transition-colors w-full border border-slate-800 rounded-lg hover:border-blue-900/50"
        >
          <Database size={14} />
          Database Setup
        </button>
      </div>
    </>
  );

  const UserProfile = () => (
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

      {/* Database Setup Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Database className="text-blue-600" size={20} />
                Database Setup Script
              </h3>
              <button onClick={() => setShowSqlModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-slate-600 mb-4">
                Run this SQL query in your Supabase <strong>SQL Editor</strong> to create the necessary tables and fix the "policy already exists" errors.
              </p>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto font-mono border border-slate-700 h-96">
                  {SQL_SETUP_SCRIPT}
                </pre>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
                    alert("SQL copied to clipboard!");
                  }}
                  className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Copy size={14} /> Copy SQL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;