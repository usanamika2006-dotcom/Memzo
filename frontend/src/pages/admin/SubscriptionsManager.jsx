import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react';

export const SubscriptionsManager = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions/');
      setSubscriptions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this customer's subscription?")) return;
    try {
      await api.post(`/subscriptions/${id}/cancel/`);
      fetchSubscriptions();
    } catch (err) {
      alert("Failed to cancel subscription.");
    }
  };

  const handleRenew = async (id) => {
    try {
      await api.post(`/subscriptions/${id}/renew/`);
      fetchSubscriptions();
      alert("Subscription renewed and invoice generated.");
    } catch (err) {
      alert("Failed to renew subscription.");
    }
  };

  const filtered = subscriptions.filter(s => {
    const matchesSearch = 
      s.customer_details?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plan_details?.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plan_details?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Subscription Lifecycle Management
          </h2>
          <p className="text-xs text-slate-500">
            Monitor all customer software subscriptions, expiry periods, auto-renewals, and cancellations.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, product, or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'ACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#0a241b] text-[#bef264]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Sub ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Software Product & Tier</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4">Validity Range</th>
                <th className="py-3 px-4">Auto Renew</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-700">#{sub.id}</td>
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    <div>{sub.customer_details?.first_name ? `${sub.customer_details.first_name} ${sub.customer_details.last_name || ''}` : sub.customer_details?.username}</div>
                    <div className="text-[10px] text-slate-400 font-normal">@{sub.customer_details?.username}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900 block">{sub.plan_details?.product_name}</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">{sub.plan_details?.name} Plan (${sub.plan_details?.price})</span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {sub.plan_details?.billing_cycle}
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-mono text-[11px]">
                    <div>{sub.start_date}</div>
                    <div className="text-slate-400">to {sub.end_date}</div>
                  </td>
                  <td className="py-4 px-4">
                    {sub.auto_renew ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">No</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      sub.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : sub.status === 'CANCELLED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-1.5">
                    {sub.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleCancel(sub.id)}
                        className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRenew(sub.id)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Re-activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsManager;
