import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import Icon from '../../components/Icon';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';

export const PricingPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/products/');
        setProducts(res.data);
        if (res.data.length > 0) {
          setSelectedProductId(res.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];
  const plans = activeProduct?.plans ? activeProduct.plans.filter(p => p.billing_cycle === billingCycle) : [];

  const faqs = [
    {
      q: "Can I switch billing cycles or upgrade plans at any time?",
      a: "Yes! You can instantly upgrade or switch between monthly and annual billing cycles directly from your Customer Dashboard. Prorated credits are automatically calculated."
    },
    {
      q: "How does simulated payment processing work?",
      a: "MEMZO features a built-in sandbox payment processor. During checkout, enter any standard test card number (or use the pre-filled 4242 test card) to immediately simulate a live charge, invoice generation, and instant subscription activation."
    },
    {
      q: "Are tax rates and discounts automatically applied?",
      a: "Yes. Active discount coupons like 'WELCOME20' (20% off) or 'MEMZO50' ($50 off) can be applied in real-time on the checkout page, and local tax rates are calculated dynamically."
    },
    {
      q: "What if I require a custom enterprise deployment?",
      a: "Our staff team can generate custom enterprise quotations with multi-site licenses, volume discounts, and bespoke SLAs through our quotation workflow."
    }
  ];

  return (
    <div className="bg-[#f8faf8] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3.5 py-1 rounded-full uppercase tracking-wider">
            Predictable SaaS Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 font-['Plus_Jakarta_Sans']">
            Transparent Subscription Plans
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Select a software system from our suite to explore tiered subscription plans. All plans include automated invoicing and a 14-day trial period.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300">
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

        {/* Product Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedProductId === p.id
                  ? 'bg-[#0a241b] text-[#bef264] shadow-md scale-102'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon name={p.icon} className="w-4 h-4" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Product Info Banner */}
        {activeProduct && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0a241b] text-[#bef264] flex items-center justify-center font-bold">
                <Icon name={activeProduct.icon} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{activeProduct.name}</h3>
                <p className="text-xs text-slate-500">{activeProduct.tagline}</p>
              </div>
            </div>
            <Link
              to={`/products/${activeProduct.id}`}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View Product Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan) => {
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
                    Recommended Tier
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans']">{plan.name}</h3>
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
                      Tier Features:
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
                    <span>Get Started with {plan.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto pt-10 border-t border-slate-200">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-slate-500 mt-1">Everything you need to know about MEMZO subscriptions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-sm text-slate-900 mb-2 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
