import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import Icon from '../../components/Icon';
import { 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertCircle, 
  Calendar,
  Layers
} from 'lucide-react';

export const CustomerSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    if (!window.confirm("Are you sure you want to cancel this subscription? You will still retain access until the end date.")) return;
    try {
      await api.post(`/subscriptions/${id}/cancel/`);
      fetchSubscriptions();
      alert("Subscription cancelled. Auto-renewal has been turned off.");
    } catch (err) {
      alert("Failed to cancel subscription.");
    }
  };

  const handleRenew = async (id) => {
    try {
      await api.post(`/subscriptions/${id}/renew/`);
      fetchSubscriptions();
      alert("Subscription renewed successfully! Your renewal invoice has been generated.");
    } catch (err) {
      alert("Failed to renew subscription.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            My Software Subscriptions
          </h2>
          <p className="text-xs text-slate-500">
            View active licenses, manage billing cycles, cancel or extend renewals.
          </p>
        </div>

        <button
          onClick={() => navigate('/customer/catalog')}
          className="bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Subscribe to Another Software</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No subscriptions found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not currently have any active software subscriptions. Explore our software suite to get started.
          </p>
          <button
            onClick={() => navigate('/customer/catalog')}
            className="mt-4 px-5 py-2.5 bg-[#0a241b] text-[#bef264] rounded-xl text-xs font-bold"
          >
            Explore Software Suite
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const isActive = sub.status === 'ACTIVE';

            return (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0a241b] text-[#bef264] flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <Icon name={sub.plan_details?.product_icon || 'Package'} className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {sub.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: #{sub.id}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                      {sub.plan_details?.product_name}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700">
                      {sub.plan_details?.name} Plan • ${sub.plan_details?.price} / {sub.plan_details?.billing_cycle}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 font-mono">
                      <span className="flex items-center gap-1 font-sans">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Activated: {sub.start_date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-sans">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        Expires / Renews: <strong>{sub.end_date}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Auto-Renew</span>
                    <span className={`text-xs font-bold ${sub.auto_renew ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {sub.auto_renew ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  {isActive ? (
                    <button
                      onClick={() => handleCancel(sub.id)}
                      className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRenew(sub.id)}
                      className="px-4 py-2 bg-[#0a241b] text-[#bef264] hover:bg-[#133e30] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-activate Plan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerSubscriptions;
