import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Layers, 
  Users, 
  Code2, 
  Database, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="bg-[#f8faf8] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3.5 py-1 rounded-full uppercase tracking-wider">
            About MEMZO
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 font-['Plus_Jakarta_Sans']">
            Reinventing How Modern Software Companies Sell & Scale
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            MEMZO is a premier software company that sells and operates its own suite of cloud business applications. This platform is the unified operational backbone powering our subscription ecosystem.
          </p>
        </div>

        {/* Mission Card */}
        <div className="bg-[#0a241b] text-white rounded-3xl p-8 sm:p-12 border border-[#1b4332] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#bef264]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#bef264]">Our Core Philosophy</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans'] text-white">
              End-to-End Control Over Product, Pricing, and Billing
            </h2>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
              Unlike third-party aggregator tools, MEMZO is a dedicated commercial software creator. We engineer every product in our catalogue—BrightBooks, StaffTrack, StockMaster, EduManage, and ShopFlow—and manage them through a centralized, high-speed Django + React architecture.
            </p>
          </div>
        </div>

        {/* Technical Architecture Grid */}
        <div>
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Modern Enterprise Tech Stack
            </h3>
            <p className="text-xs text-slate-500 mt-1">Robust, production-grade technologies working in harmony</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Django REST Framework</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Clean Python backend with custom User role management, relational SQLite database, SimpleJWT authentication, and transaction safety.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">React & Vite Frontend</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Lightning-fast single-page application with React Router v7, Axios API interceptors, and dynamic client-side state management.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Tailwind CSS & Recharts</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                State-of-the-art fintech UI inspired by modern banking dashboards, smooth micro-interactions, and real-time revenue analytics.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
          <h3 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Ready to explore our software products?
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Experience our simulated checkout flow or sign in as an Administrator to review the company control center.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/catalog"
              className="bg-[#0a241b] text-[#bef264] px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              <span>Explore Software Suite</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
