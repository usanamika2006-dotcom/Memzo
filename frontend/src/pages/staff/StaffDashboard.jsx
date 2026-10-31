import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import { 
  Users, 
  CreditCard, 
  FileText, 
  FileCheck2, 
  Plus, 
  ArrowRight, 
  Receipt,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const StaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        const res = await api.get('/dashboard/stats/');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffStats();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const recentSubs = data?.recent_subscriptions || [];
  const recentQuotes = data?.recent_quotations || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2">
            <span>Staff Operations Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans'] text-white">
            Daily Subscription Workflow Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Handle customer accounts, issue commercial quotes, record payments, and manage invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => navigate('/staff/quotations')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quotation</span>
          </button>
          <button
            onClick={() => navigate('/staff/invoices')}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-xs border border-white/20 flex items-center gap-1.5 transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>Issue Invoice</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Customers"
          value={summary.total_customers || 0}
          change="Directory"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Live Subscriptions"
          value={summary.active_subscriptions || 0}
          change="Monitored"
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="Pending Invoices"
          value={summary.pending_invoices || 0}
          change="Awaiting Pay"
          isPositive={false}
          icon={FileText}
          color="amber"
        />
        <StatCard
          title="Open Quotations"
          value={summary.recent_quotations_count || 0}
          change="Commercial"
          icon={FileCheck2}
          color="purple"
        />
      </div>

      {/* Grid: Recent Subscriptions & Recent Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Subscriptions */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Active Client Subscriptions
              </h3>
              <p className="text-xs text-slate-500">Live contracts and renewal monitoring</p>
            </div>
            <button
              onClick={() => navigate('/staff/subscriptions')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentSubs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No subscriptions recorded.</p>
            ) : (
              recentSubs.map((s) => (
                <div key={s.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {s.plan_details?.product_name} – {s.plan_details?.name} Plan
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Customer: {s.customer_details?.username} ({s.customer_details?.company_name || 'Individual'})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {s.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Due: {s.end_date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Dispatched Quotations
              </h3>
              <p className="text-xs text-slate-500">Custom business proposals</p>
            </div>
            <button
              onClick={() => navigate('/staff/quotations')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentQuotes.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No quotations dispatched yet.</p>
            ) : (
              recentQuotes.map((q) => (
                <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{q.title}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {q.quotation_number} • To: {q.customer_details?.username}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-slate-900 block">${q.total_amount}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {q.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffDashboard;
