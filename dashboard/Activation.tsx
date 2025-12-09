import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/mockDatabase';
import { Profile } from '../../types';
import { Lock, Smartphone, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface ActivationProps {
  user: Profile;
  onUpdateUser: (user: Profile) => void;
}

const Activation: React.FC<ActivationProps> = ({ user, onUpdateUser }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'waiting' | 'success'>('idle');
  const navigate = useNavigate();

  const handlePayment = async () => {
    setStatus('processing');
    
    // Step 1: Trigger STK Push
    const res = await paymentService.initiateSTKPush(user.phone_number || '0700000000', 500);
    
    if (res.success) {
      setStatus('waiting');
      
      // Step 2: Simulate User Entering PIN and Webhook Callback
      const updatedUser = await paymentService.confirmPayment(user);
      onUpdateUser(updatedUser);
      setStatus('success');
      
      // Step 3: Redirect
      setTimeout(() => {
        navigate('/dashboard/tasks');
      }, 2000);
    } else {
      setStatus('idle');
      alert('Failed to initiate payment. Check phone number.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Payment Confirmed!</h2>
          <p className="text-slate-600 mb-8">Your account is now active. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
        {/* Back Button */}
        <button 
            onClick={() => navigate('/dashboard/tasks')}
            className="absolute top-4 left-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-colors z-10"
            title="Back to Dashboard"
        >
            <ArrowLeft size={20} />
        </button>

        <div className="bg-slate-900 p-8 text-center pt-12">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <Lock className="text-blue-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Account Activation Required</h1>
          <p className="text-slate-400">Unlock high-paying jobs and instant withdrawals.</p>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div>
              <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">Activation Fee</p>
              <p className="text-3xl font-bold text-slate-900">KES 500<span className="text-sm font-normal text-slate-500">.00</span></p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
               <span className="font-bold">1x</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              'Access exclusive jobs daily at 7 AM',
              'Instant M-PESA withdrawals',
              '24/7 Priority Support',
              'Verified Writer Badge'
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-600">
                <CheckCircle size={18} className="text-green-500" />
                {feature}
              </li>
            ))}
          </ul>

          {status === 'waiting' ? (
             <div className="text-center py-6">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-bold text-slate-900">Check your phone</p>
                <p className="text-sm text-slate-500">Enter your M-PESA PIN to complete the transaction.</p>
             </div>
          ) : (
            <div className="space-y-3">
                <button
                onClick={handlePayment}
                disabled={status === 'processing'}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/30"
                >
                {status === 'processing' ? 'Connecting to Safaricom...' : (
                    <>
                    <Smartphone size={20} />
                    Pay with M-PESA
                    <ArrowRight size={20} />
                    </>
                )}
                </button>
                <button
                    onClick={() => navigate('/dashboard/tasks')}
                    className="w-full py-3 text-slate-500 font-medium text-sm hover:text-slate-700 transition-colors"
                >
                    I'll do this later
                </button>
            </div>
          )}
          
          <p className="text-xs text-center text-slate-400 mt-6">
            Secure payment powered by Safaricom Daraja API. <br/>Phone: {user.phone_number}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Activation;