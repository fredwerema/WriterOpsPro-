import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/mockDatabase';
import { Profile, UserRole } from './types';

// Layouts & Pages
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Activation from './pages/dashboard/Activation';
import Tasks from './pages/dashboard/Tasks';
import Wallet from './pages/dashboard/Wallet';
import Training from './pages/dashboard/Training';
import AdminPostJob from './pages/dashboard/AdminPostJob';
import AdminReview from './pages/dashboard/AdminReview';
import MyJobs from './pages/dashboard/MyJobs';

// Define Props Interface explicitly to resolve TS children inference issues
interface ProtectedRouteProps {
  children?: React.ReactNode;
  user: Profile | null;
  requireActivation?: boolean;
}

// Auth Guard Component
const ProtectedRoute = ({ children, user, requireActivation = true }: ProtectedRouteProps) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Revised Logic: Only redirect if strictly required by the specific route wrapper.
  // We now allow dashboard access (requireActivation=false) but might restrict specific actions.
  if (requireActivation && !user.is_active && user.role !== UserRole.ADMIN) {
    return <Navigate to="/activate" replace />;
  }
  return <>{children}</>;
};

interface AdminRouteProps {
  children?: React.ReactNode;
  user: Profile | null;
}

// Admin Guard Component
const AdminRoute = ({ children, user }: AdminRouteProps) => {
    // Check if user exists and has the 'admin' role
    if (!user || user.role !== UserRole.ADMIN) {
        return <Navigate to="/dashboard/tasks" replace />;
    }
    return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for persisted session on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register onLogin={setUser} />} />
        
        {/* Activation Paywall - Accessible directly */}
        <Route path="/activate" element={
          user ? (
            <Activation user={user} onUpdateUser={setUser} />
          ) : (
            <Navigate to="/login" />
          )
        } />

        {/* Protected Dashboard Routes - Now accessible to inactive users (requireActivation=false) */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute user={user} requireActivation={false}>
            <Layout user={user!} onLogout={handleLogout} onUpdateUser={setUser}>
              <Routes>
                <Route path="tasks" element={<Tasks user={user!} />} />
                <Route path="wallet" element={<Wallet user={user!} />} />
                <Route path="training" element={<Training />} />
                <Route path="my-jobs" element={<MyJobs user={user!} />} />
                
                {/* Admin Routes */}
                <Route path="admin/post" element={
                    <AdminRoute user={user}>
                        <AdminPostJob />
                    </AdminRoute>
                } />
                 <Route path="admin/review" element={
                    <AdminRoute user={user}>
                        <AdminReview />
                    </AdminRoute>
                } />

                {/* Redirect old admin route for backward compatibility if needed, or default to reviews */}
                <Route path="admin" element={<Navigate to="admin/review" />} />
                
                <Route path="*" element={<Navigate to="tasks" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;