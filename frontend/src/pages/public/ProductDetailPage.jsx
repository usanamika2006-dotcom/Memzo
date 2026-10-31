import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import Icon from '../../components/Icon';
import { 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Zap, 
  Clock, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}/`);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Loading product information...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
          <p className="text-xs text-slate-500 mt-2">The requested software product could not be found.</p>
          <Link to="/catalog" className="mt-4 inline-block px-5 py-2.5 bg-[#0a241b] text-[#bef264] rounded-xl text-xs font-bold">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Filter plans by chosen cycle
  const currentPlans = product.plans ? product.plans.filter(p => p.billing_cycle === billingCycle) : [];

  return (
    <div className="bg-[#f8faf8] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/catalog')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Software Products</span>
          </button>
        </div>

        {/* Hero Product Banner */}
        <div className="bg-[#0a241b] text-white rounded-3xl p-8 lg:p-12 border border-[#1b4332] shadow-xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#bef264]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-[#bef264]/20 text-[#bef264] px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="text-xs font-bold bg-white/10 text-white px-3 py-1 rounded-full border border-white/20">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#bef264] text-[#051c14] flex items-center justify-center font-bold shadow-lg">
                  <Icon name={product.icon} className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold font-['Plus_Jakarta_Sans'] text-white">
                    {product.name}
                  </h1>
                  <p className="text-sm text-emerald-400 font-semibold">{product.tagline}</p>
                </div>
              </div>

              <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-white/60 pt-2">
                <span className="flex items-center gap-1 text-[#bef264]">
                  <Star className="w-4 h-4 fill-current" />
                  <strong>{product.rating}</strong> ({product.review_count} client reviews)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Enterprise Ready
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  14-Day Guarantee
                </span>
              </div>
            </div>

            {/* Quick feature pill box */}
            <div className="bg-[#0e3327] p-6 rounded-2xl border border-white/10 max-w-sm w-full space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">Core Inclusions</h4>
              {product.features?.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-white/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#bef264] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing & Subscription Tier Selector */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Select Your Subscription Plan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Instant automated setup with full API key generation and customer self-service access.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 inline-flex items-center bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUALLY')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'ANNUALLY'
                  ? 'bg-[#0a241b] text-[#bef264] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-[#bef264] text-[#051c14] px-1.5 py-0.2 rounded-full font-extrabold">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentPlans.map((plan) => {
            const isPro = plan.is_popular || plan.name.toLowerCase().includes('pro');

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  isPro
                    ? 'bg-[#0a241b] text-white shadow-2xl scale-105 border-2 border-[#bef264]'
                    : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#bef264] text-[#051c14] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans']">{plan.name} Plan</h3>
                  <p className={`text-xs mt-1 ${isPro ? 'text-emerald-300' : 'text-slate-500'}`}>
                    Includes {plan.trial_days}-day complimentary evaluation
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
                    <span className={`text-xs font-medium ${isPro ? 'text-white/60' : 'text-slate-400'}`}>
                      /{plan.billing_cycle === 'MONTHLY' ? 'month' : 'year'}
                    </span>
                  </div>

                  <div className="mt-8 space-y-3 pt-6 border-t border-slate-100/20">
                    <p className={`text-[11px] font-bold uppercase tracking-wider ${isPro ? 'text-white/50' : 'text-slate-400'}`}>
                      Included Features:
                    </p>
                    {plan.features?.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${isPro ? 'text-[#bef264]' : 'text-emerald-600'}`} />
                        <span className={isPro ? 'text-white/90' : 'text-slate-700'}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100/20">
                  <button
                    onClick={() => navigate(`/checkout?plan=${plan.id}`)}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                      isPro
                        ? 'bg-[#bef264] hover:bg-[#a3e635] text-[#051c14] hover:scale-102'
                        : 'bg-[#0a241b] hover:bg-[#133e30] text-[#bef264]'
                    }`}
                  >
                    <span>Subscribe to {plan.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
