import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import Icon from '../../components/Icon';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Receipt
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const res = await api.get('/dashboard/stats/');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const subscriptions = data?.subscriptions || [];
  const recentInvoices = data?.recent_invoices || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#0a241b] rounded-3xl p-6 sm:p-8 text-white border border-[#1b4332] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#bef264]/20 text-[#bef264] text-xs font-bold mb-2">
            <span>Customer Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans'] text-white">
            Welcome back, {user?.first_name || user?.username}!
          </h2>
          <p className="text-xs sm:text-sm text-white/70">
            {user?.company_name ? `${user.company_name} Workspace • ` : ''}Manage your active software subscriptions and invoices.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate('/customer/catalog')}
            className="bg-[#bef264] hover:bg-[#a3e635] text-[#051c14] px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Software Suite</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Active Subscriptions"
          value={summary.active_subscriptions_count || 0}
          change="Live Products"
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="Total Spent (USD)"
          value={`$${Number(summary.total_spent || 0).toFixed(2)}`}
          change="All Time"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          title="Unpaid Invoices"
          value={summary.unpaid_invoices_count || 0}
          change={summary.unpaid_invoices_count > 0 ? "Action Required" : "All Paid"}
          isPositive={summary.unpaid_invoices_count === 0}
          icon={FileText}
          color="amber"
        />
      </div>

      {/* Active Subscriptions Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Your Active Software Subscriptions
            </h3>
            <p className="text-xs text-slate-500">Live systems powering your organization</p>
          </div>

          <Link
            to="/customer/subscriptions"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Manage All Subscriptions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {subscriptions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-slate-800">No active subscriptions yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Explore our software catalog to subscribe to BrightBooks, StaffTrack, StockMaster, or other apps.
            </p>
            <button
              onClick={() => navigate('/customer/catalog')}
              className="mt-4 px-4 py-2 bg-[#0a241b] text-[#bef264] rounded-xl text-xs font-bold"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-5 border border-slate-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {sub.status}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      ${sub.plan_details?.price}/{sub.plan_details?.billing_cycle === 'MONTHLY' ? 'mo' : 'yr'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    {sub.plan_details?.product_name}
                  </h4>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                    {sub.plan_details?.name} Plan
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Valid Through:</span>
                      <span className="font-mono font-semibold">{sub.end_date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Auto Renewal:</span>
                      <span className="font-semibold text-emerald-700">
                        {sub.auto_renew ? 'Active' : 'Turned Off'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Sub #{sub.id}</span>
                  <Link
                    to="/customer/subscriptions"
                    className="text-xs font-bold text-[#0a241b] hover:text-emerald-700 flex items-center gap-1"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Recent Invoices & Receipts
            </h3>
            <p className="text-xs text-slate-500">View and settle subscription invoices</p>
          </div>
          <Link
            to="/customer/invoices"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">No invoices generated yet.</td>
                </tr>
              ) : (
                recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {inv.items?.[0]?.description || 'Subscription Service'}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{inv.issue_date}</td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{inv.due_date}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">${inv.total_amount}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {inv.status !== 'PAID' ? (
                        <button
                          onClick={() => navigate('/customer/invoices')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">Paid</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
