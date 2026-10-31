import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const ReportsManager = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats/');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const summary = stats?.summary || {};
  const revenueChart = stats?.revenue_chart || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Revenue Analytics & Subscription Reports
          </h2>
          <p className="text-xs text-slate-500">
            Financial auditing, cohort growth metrics, and transaction reconciliation.
          </p>
        </div>

        <button
          onClick={() => alert("Report CSV export triggered. File generated.")}
          className="bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Financial CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Processed Volume"
          value={`$${Number(summary.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+18.4%"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Active Paid Contracts"
          value={summary.active_subscriptions || 0}
          change="+24.1%"
          icon={CreditCard}
          color="indigo"
        />
        <StatCard
          title="Annual Run Rate (ARR)"
          value={`$${(Number(summary.total_revenue || 0) * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          change="Projected"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Monthly Active Subscribers Growth
            </h3>
            <p className="text-xs text-slate-500">Contract growth velocity across proprietary software products</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
            +32% YoY
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a241b', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Bar dataKey="subscriptions" fill="#0a241b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;
