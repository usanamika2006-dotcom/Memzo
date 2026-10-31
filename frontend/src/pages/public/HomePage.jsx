import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import Icon from '../../components/Icon';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Star, 
  ChevronRight, 
  BarChart3, 
  Lock, 
  Clock, 
  Sparkles,
  CreditCard,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/');
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    fetchProducts();
  }, []);

  const featureTabs = [
    {
      title: "Automated Subscriptions",
      badge: "Quick Setup • Always On",
      headline: "A subscription engine built for high velocity",
      description: "Manage monthly and annual billing cycles, automated trial conversions, instant plan upgrades, and recurring revenue pipelines without friction.",
      stat1: "$2.4M+",
      stat1Label: "Processed Monthly",
      stat2: "99.99%",
      stat2Label: "Billing Accuracy"
    },
    {
      title: "Dynamic Product Catalogue",
      badge: "Real-time Sync",
      headline: "Publish enterprise software products in seconds",
      description: "Define multi-tier pricing, feature matrices, localized tax rules, and promotional coupons from a central administrative control room.",
      stat1: "5 Core",
      stat1Label: "Proprietary Apps",
      stat2: "100%",
      stat2Label: "Database Driven"
    },
    {
      title: "Enterprise Quotations",
      badge: "Staff Enabled",
      headline: "Convert custom deals into paid recurring contracts",
      description: "Equip your operations team to draft custom quotes, apply bespoke discounts, and transform accepted agreements into active subscriptions with one click.",
      stat1: "3x Faster",
      stat1Label: "Deal Closing",
      stat2: "Instant",
      stat2Label: "Invoice Creation"
    },
    {
      title: "Role-Isolated Security",
      badge: "Zero-Trust SaaS",
      headline: "Triple-layer protection for Admin, Staff & Clients",
      description: "Strict database permissions ensure customers only access their subscriptions and invoices, while staff handle daily ops without administrative risk.",
      stat1: "3 Roles",
      stat1Label: "Dedicated Dashboards",
      stat2: "SOC2",
      stat2Label: "Standards Aligned"
    }
  ];

  return (
    <div className="bg-[#f8faf8]">
      
      {/* HERO SECTION (Sixpay Emerald Theme Inspired) */}
      <section className="bg-gradient-to-b from-[#0a241b] via-[#0b281f] to-[#071f16] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#bef264]/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-[#10b981]/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/90 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#bef264] animate-ping"></span>
            <span className="font-semibold text-[#bef264]">MEMZO Platform Live</span>
            <span className="text-white/40">•</span>
            <span>Enterprise Software Subscription Engine</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] leading-[1.1] max-w-4xl mx-auto text-balance">
            The software subscription system that <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bef264] via-[#10b981] to-emerald-300">gets growth done.</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Sell and manage proprietary software subscriptions, multi-tier pricing plans, invoices, custom quotations, and client self-service in a single unified architecture.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalog"
              className="w-full sm:w-auto bg-[#bef264] hover:bg-[#a3e635] text-[#051c14] font-bold text-base px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 group"
            >
              <span>Explore Software Suite</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/pricing"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-4 rounded-2xl backdrop-blur-sm border border-white/15 transition-all flex items-center justify-center gap-2"
            >
              <span>View Pricing Plans</span>
              <ChevronRight className="w-4 h-4 text-white/60" />
            </Link>
          </div>

          {/* Rating */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-white/60">
            <div className="flex items-center text-[#bef264]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span><strong>4.9 / 5</strong> rating from 1,200+ enterprise subscribers</span>
          </div>

          {/* HERO VISUAL MOCKUP (Sixpay style floating cards) */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            {/* Center Main Mockup Card */}
            <div className="rounded-3xl bg-[#0e3327]/90 border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-left relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#bef264] text-[#051c14] flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">MEMZO Operations Central</h3>
                    <p className="text-xs text-emerald-400">Live Production Telemetry • 5 Connected Apps</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#10b981]/20 text-[#bef264] text-xs font-semibold border border-[#10b981]/40">
                    System Healthy
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                    100% SQLite Synced
                  </span>
                </div>
              </div>

              {/* Floating metrics inside hero banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="bg-[#082218] p-5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/50 uppercase font-semibold">Total ARR Tracked</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">$482,900</p>
                  <p className="text-xs text-[#bef264] mt-2 flex items-center gap-1 font-medium">
                    ↑ +28.4% month-over-month
                  </p>
                </div>

                <div className="bg-[#082218] p-5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/50 uppercase font-semibold">Active Subscriptions</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">1,420</p>
                  <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                    100% automated recurring renewal
                  </p>
                </div>

                <div className="bg-[#082218] p-5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/50 uppercase font-semibold">Payment Success Rate</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#bef264] mt-1">99.8%</p>
                  <p className="text-xs text-white/60 mt-2 font-medium">
                    Simulated card gateway live
                  </p>
                </div>
              </div>

              {/* Sample Software Apps Strip */}
              <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
                <span className="font-semibold text-white">Active Software Suite:</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[#bef264]">BrightBooks (Finance)</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-indigo-300">StaffTrack (HR)</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-amber-300">StockMaster (Supply)</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300">EduManage (Campus)</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-pink-300">ShopFlow (POS)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER LOGOS RIBBON (Matching Sixpay theme) */}
      <section className="bg-white py-10 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Trusted by modern enterprise engineering teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="text-lg font-extrabold tracking-tight text-slate-800">amazon</span>
            <span className="text-lg font-bold text-slate-800">Allianz</span>
            <span className="text-lg font-semibold tracking-wide text-slate-800">Adecco</span>
            <span className="text-lg font-bold tracking-tight text-slate-800">Bread</span>
            <span className="text-lg font-bold tracking-tight text-slate-800">PayPal</span>
            <span className="text-lg font-semibold tracking-wide text-slate-800">Lydia</span>
            <span className="text-lg font-bold tracking-tight text-slate-800">ripple</span>
          </div>
        </div>
      </section>

      {/* CORE FEATURES INTERACTIVE TAB SECTION (From Reference Image) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full uppercase tracking-wider">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 font-['Plus_Jakarta_Sans']">
            Core Features That Power Your Subscription Engine
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Engineered with Django REST Framework backend and responsive React frontend for maximum reliability.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-12 flex items-center justify-center overflow-x-auto pb-4 gap-2 border-b border-slate-200">
          {featureTabs.map((tab, idx) => (
            <button
              key={tab.title}
              onClick={() => setActiveTab(idx)}
              className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === idx
                  ? 'bg-[#0a241b] text-[#bef264] shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Tab Content Display (Card showcase matching Sixpay) */}
        <div className="mt-12 bg-white rounded-3xl p-8 lg:p-12 border border-slate-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">
              {featureTabs[activeTab].badge}
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {featureTabs[activeTab].headline}
            </h3>
            <p className="text-slate-600 text-base leading-relaxed">
              {featureTabs[activeTab].description}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <p className="text-3xl font-extrabold text-slate-900">{featureTabs[activeTab].stat1}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">{featureTabs[activeTab].stat1Label}</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-emerald-600">{featureTabs[activeTab].stat2}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">{featureTabs[activeTab].stat2Label}</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all"
              >
                <span>Browse Software Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="bg-[#051c14] rounded-3xl p-6 sm:p-8 text-white border border-[#1b4332] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#bef264]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live System Node</span>
              <span className="text-xs bg-[#bef264]/20 text-[#bef264] px-2 py-0.5 rounded-full font-semibold">Active</span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[#bef264] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Simulated Payment Received</p>
                    <p className="text-[10px] text-white/50">Transaction TXN-4928A • Instant Activation</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-[#bef264]">+$79.00</span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                    INV
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Automated Invoice Generated</p>
                    <p className="text-[10px] text-white/50">INV-2026-0004 • Michael Chang (Apex)</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300">PAID</span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                    SUB
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Next Renewal Scheduled</p>
                    <p className="text-[10px] text-white/50">Auto-extend 30 days on due date</p>
                  </div>
                </div>
                <span className="text-xs text-white/70">In 28 Days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC PRODUCTS CATALOGUE PREVIEW */}
      <section className="bg-slate-100/70 py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Proprietary Software Catalog
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 font-['Plus_Jakarta_Sans']">
                Software Products Ready for Deployment
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                All software products are dynamically loaded from the Django database with real-time subscription tiers.
              </p>
            </div>

            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span>View All 5 Products & Editions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 3).map((product) => {
              const lowestPrice = product.plans && product.plans.length > 0
                ? Math.min(...product.plans.map(p => Number(p.price)))
                : 29;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0a241b] text-[#bef264] flex items-center justify-center shadow-md">
                        <Icon name={product.icon} className="w-6 h-6" />
                      </div>
                      {product.badge && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] group-hover:text-emerald-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {product.category}
                    </p>
                    <p className="text-sm text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Features preview */}
                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                      {product.features?.slice(0, 3).map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Starting from</span>
                      <span className="text-2xl font-extrabold text-slate-900">${lowestPrice}</span>
                      <span className="text-xs text-slate-500 font-medium">/mo</span>
                    </div>

                    <Link
                      to={`/products/${product.id}`}
                      className="bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>View Plans</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER (Matching Sixpay theme) */}
      <section className="bg-[#0a241b] text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#0e382b] to-[#0a241b] border border-[#1b4332] p-8 sm:p-14 text-center relative z-10 shadow-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#bef264]/20 text-[#bef264] text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Zero Setup Fee • 14-Day Free Trials Available
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] text-white">
            Ready to experience MEMZO in action?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Test the complete subscription purchase, simulated card checkout, automatic invoice creation, and role-based dashboards in under 60 seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalog"
              className="bg-[#bef264] hover:bg-[#a3e635] text-[#051c14] font-bold px-8 py-3.5 rounded-xl text-sm transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all border border-white/15"
            >
              Login to Demo Accounts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
