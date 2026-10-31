import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'STAFF') navigate('/staff');
    else navigate('/customer');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      redirectAfterLogin(user.role);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginAs(role);
      redirectAfterLogin(user.role);
    } catch (err) {
      setError('Demo login failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand & Visual Panel (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0a241b] via-[#0b281f] to-[#051c14] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-[#bef264]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10b981] to-[#bef264] flex items-center justify-center text-[#051c14] font-bold shadow-md">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                MEM<span className="text-[#bef264]">ZO</span>
              </span>
            </div>

            <div className="mt-12 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#bef264] bg-[#bef264]/15 px-3 py-1 rounded-full inline-block">
                SaaS Subscription Control
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] leading-snug">
                Powering recurring software ecosystems.
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Connect your business apps, configure pricing tiers, issue custom quotations, and automate subscriber operations.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 space-y-3 text-xs text-white/60">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Multi-role access: Admin, Staff & Customer</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Real-time Django SQLite database telemetry</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Welcome back
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your credentials or choose a quick demo role below.
                </p>
              </div>

              <Link
                to="/"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Back to Site
              </Link>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 mb-6 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin, staff, or customer"
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:bg-white transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (e.g. password123)"
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:bg-white transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Logins Section */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
                Instant Role Demo Access (1-Click)
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('ADMIN')}
                  className="p-3 rounded-xl border border-slate-200 hover:border-[#10b981] hover:bg-emerald-50/50 text-left transition-all group"
                >
                  <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1">
                    👑 Admin
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">Sarah Jenkins</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('STAFF')}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all group"
                >
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 flex items-center gap-1">
                    💼 Staff
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">Alex Rivera</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('CUSTOMER')}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
                >
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1">
                    👤 Customer
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">Michael Chang</p>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>New customer? </span>
            <Link to="/register" className="font-bold text-emerald-700 hover:underline">
              Create a free customer account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
