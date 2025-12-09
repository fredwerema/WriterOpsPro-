import React, { useEffect, useState } from 'react';
import { walletService } from '../../services/mockDatabase';
import { Profile, Transaction } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, Filter, ChevronDown } from 'lucide-react';

interface WalletProps {
  user: Profile;
}

const Wallet: React.FC<WalletProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetch = async () => {
      const data = await walletService.getTransactions(user.id);
      setTransactions(data);
    };
    fetch();
  }, [user.id]);

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  // Transform data for chart
  const chartData = filteredTransactions.map(t => ({
    name: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
    amount: t.amount_cents / 100
  }));

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Wallet & Earnings</h1>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="text-slate-400" size={16} />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
          >
            <option value="all">All Transactions</option>
            <option value="payout">Payouts</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="activation_fee">Activation Fees</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="text-slate-400" size={16} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg shadow-blue-500/20">
          <p className="text-blue-100 text-sm font-medium mb-1">Available Balance</p>
          <h2 className="text-4xl font-bold mb-4">KES 4,500</h2>
          <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-bold backdrop-blur-sm transition-all">
            Withdraw to M-PESA
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-3">
             <ArrowDownLeft size={20} />
          </div>
          <p className="text-slate-500 text-sm">Total Earned</p>
          <h2 className="text-2xl font-bold text-slate-900">KES 12,450</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-3">
             <ArrowUpRight size={20} />
          </div>
          <p className="text-slate-500 text-sm">Pending Clearance</p>
          <h2 className="text-2xl font-bold text-slate-900">KES 1,200</h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Earnings History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
            {filterType !== 'all' && (
              <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-md capitalize">
                {filterType.replace('_', ' ')}
              </span>
            )}
          </div>
          <div className="space-y-4">
            {filteredTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-default">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${t.type === 'payout' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'payout' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">{t.type.replace('_', ' ')}</p>
                    <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.type === 'payout' ? 'text-green-600' : 'text-slate-900'}`}>
                    {t.type === 'payout' ? '+' : '-'} {t.amount_cents / 100}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{t.mpesa_reference}</p>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Filter className="text-slate-300" size={20} />
                  </div>
                  <p className="text-sm text-slate-500">No {filterType.replace('_', ' ')} transactions found.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;