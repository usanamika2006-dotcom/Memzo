import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Tag, 
  Check, 
  AlertCircle, 
  Sparkles,
  Receipt,
  FileCheck2,
  Layers,
  ChevronLeft
} from 'lucide-react';

export const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const planIdParam = searchParams.get('plan');
  const navigate = useNavigate();
  const { user, isAuthenticated, loginAs } = useAuth();

  const [products, setProducts] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(planIdParam || '');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Discount coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Payment form state
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardName, setCardName] = useState(user?.company_name || 'Michael Chang');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [autoRenew, setAutoRenew] = useState(true);

  // Checkout process state
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch all products and plans
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/products/');
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    fetchCatalog();
  }, []);

  // Sync selected plan
  useEffect(() => {
    if (products.length > 0) {
      let foundPlan = null;
      let foundProd = null;

      for (const prod of products) {
        if (prod.plans) {
          const match = prod.plans.find(p => String(p.id) === String(selectedPlanId));
          if (match) {
            foundPlan = match;
            foundProd = prod;
            break;
          }
        }
      }

      if (foundPlan) {
        setSelectedPlan(foundPlan);
        setSelectedProduct(foundProd);
      } else if (!selectedPlanId && products[0]?.plans?.length > 0) {
        // Default to first plan
        setSelectedPlanId(products[0].plans[0].id);
        setSelectedPlan(products[0].plans[0]);
        setSelectedProduct(products[0]);
      }
    }
  }, [products, selectedPlanId]);

  // Calculate totals
  const subtotal = selectedPlan ? Number(selectedPlan.price) : 0;
  const discountAmount = appliedDiscount ? Number(appliedDiscount.discount_amount) : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = 0.10; // 10%
  const taxAmount = round(taxableAmount * taxRate);
  const totalAmount = round(taxableAmount + taxAmount);

  function round(val) {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }

  // Handle coupon validation
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setDiscountError('');

    try {
      const res = await api.post('/discounts/validate/', {
        code: couponCode.trim(),
        amount: subtotal
      });
      if (res.data.valid) {
        setAppliedDiscount(res.data);
      }
    } catch (err) {
      setAppliedDiscount(null);
      setDiscountError(err.response?.data?.detail || 'Invalid or expired discount code.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponCode('');
    setDiscountError('');
  };

  // Execute Simulated Checkout
  const handleCompletePayment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMessage('Please sign in or select a demo user account below to complete your checkout.');
      return;
    }
    if (!selectedPlan) {
      setErrorMessage('Please select a valid subscription plan.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const payload = {
        plan_id: selectedPlan.id,
        discount_code: appliedDiscount ? appliedDiscount.code : '',
        card_number: cardNumber.replace(/\s+/g, ''),
        card_name: cardName,
        card_expiry: cardExpiry,
        card_cvv: cardCvv,
        auto_renew: autoRenew,
      };

      const res = await api.post('/checkout/', payload);
      setCheckoutSuccess(res.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Payment simulation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#f8faf8] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/catalog')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>

          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            256-Bit SSL Encrypted Sandbox Checkout
          </span>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3.5 py-1 rounded-full uppercase tracking-wider">
            Secure Subscription Checkout
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 font-['Plus_Jakarta_Sans']">
            Activate Your Software Subscription
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Real-time automated subscription setup, invoice generation, and simulated card clearance.
          </p>
        </div>

        {/* User Auth Banner if Not Logged In */}
        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Account Required for Subscription</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Sign in or click below to simulate instant customer authentication.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loginAs('CUSTOMER')}
                className="bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                1-Click Demo Login (Customer)
              </button>
              <Link
                to="/login"
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl text-xs font-semibold"
              >
                Existing User Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Payment & Customer Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Plan Selector Dropdown (in case user wants to switch) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Choose Software & Plan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:bg-white transition-all"
              >
                {products.map((prod) => (
                  <optgroup key={prod.id} label={prod.name}>
                    {prod.plans?.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {prod.name} – {pl.name} (${pl.price}/{pl.billing_cycle === 'MONTHLY' ? 'mo' : 'yr'})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Simulated Payment Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0a241b] text-[#bef264] flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                      Payment Details
                    </h3>
                    <p className="text-xs text-slate-500">Simulated Card Gateway (Safe Sandbox)</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Sandbox Active
                </span>
              </div>

              <form onSubmit={handleCompletePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. Michael Chang"
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl pl-4 pr-10 py-2.5 text-slate-800 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:bg-white transition-all"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Use any 16-digit test card or pre-filled digits.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl px-4 py-2.5 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="CVC"
                      className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl px-4 py-2.5 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Auto Renew Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={autoRenew}
                      onChange={(e) => setAutoRenew(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="font-medium">
                      Enable auto-renewal at the end of the billing period.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#bef264] border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Simulated Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#bef264]" />
                        <span>Pay ${totalAmount} & Activate Subscription</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Coupon (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Plan Preview Card */}
            {selectedProduct && selectedPlan && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-[#0a241b] text-[#bef264] flex items-center justify-center font-bold shadow-xs">
                    <Icon name={selectedProduct.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg font-['Plus_Jakarta_Sans']">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-xs text-emerald-600 font-semibold">
                      {selectedPlan.name} Plan • {selectedPlan.billing_cycle}
                    </p>
                  </div>
                </div>

                <div className="py-4 space-y-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Features Included:</p>
                  {selectedPlan.features?.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div className="pt-4 pb-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Promo Coupon</span>
                  </p>

                  {appliedDiscount ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Code '{appliedDiscount.code}' applied ({appliedDiscount.description || `$${appliedDiscount.discount_amount} off`})</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-500 hover:text-red-700 font-bold ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Try: WELCOME20 or MEMZO50"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {validatingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    </form>
                  )}

                  {discountError && (
                    <p className="text-[11px] text-red-500 mt-1">{discountError}</p>
                  )}
                </div>

                {/* Calculation Breakdown */}
                <div className="pt-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Subscription Subtotal</span>
                    <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex items-center justify-between text-emerald-600 font-semibold">
                      <span>Discount ({appliedDiscount.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Estimated Tax (10% standard rule)</span>
                    <span className="font-semibold text-slate-900">+${taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-base font-extrabold text-slate-900">
                    <span>Total Due Today</span>
                    <span className="text-xl text-[#0a241b]">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="bg-[#0a241b] text-white/80 rounded-3xl p-6 border border-[#1b4332] space-y-3 text-xs">
              <div className="flex items-center gap-2 text-[#bef264] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Simulated Secure Transaction</span>
              </div>
              <p className="text-white/60 leading-relaxed text-[11px]">
                Upon successful payment completion, your subscription will be marked ACTIVE in the database, a receipt invoice will be generated, and you will receive instant dashboard access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      <Modal
        isOpen={!!checkoutSuccess}
        onClose={() => navigate('/customer/subscriptions')}
        title="Subscription Successfully Activated!"
        subtitle="Your simulated payment has cleared and the subscription is now live."
        maxWidth="max-w-xl"
      >
        {checkoutSuccess && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#bef264] text-[#051c14] flex items-center justify-center mx-auto font-bold shadow-lg">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="text-center">
              <h4 className="text-xl font-bold text-slate-900">
                Welcome to {checkoutSuccess.subscription?.plan_details?.product_name || selectedProduct?.name}!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Your subscription has been recorded in the central database.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-sans font-semibold">Invoice Number</span>
                <span className="font-bold text-slate-900">{checkoutSuccess.invoice?.invoice_number}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-sans font-semibold">Transaction ID</span>
                <span className="font-bold text-emerald-700">{checkoutSuccess.payment?.transaction_id}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-sans font-semibold">Subscription Status</span>
                <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {checkoutSuccess.subscription?.status || 'ACTIVE'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-sans font-semibold">Validity Period</span>
                <span className="font-bold text-slate-900">
                  {checkoutSuccess.subscription?.start_date} to {checkoutSuccess.subscription?.end_date}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-sans font-extrabold text-slate-900 pt-1">
                <span>Amount Paid</span>
                <span className="text-emerald-700">${checkoutSuccess.payment?.amount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/customer/subscriptions')}
                className="w-full bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <span>View My Subscriptions</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/customer/invoices')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>View Invoice & Receipts</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CheckoutPage;
