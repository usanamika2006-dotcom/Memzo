import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Lock, Heart, CheckCircle2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#051c14] text-white/80 pt-16 pb-12 border-t border-[#133e30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#133e30]/80">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10b981] to-[#bef264] flex items-center justify-center text-[#051c14] shadow-md">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                MEM<span className="text-[#bef264]">ZO</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm">
              The all-in-one SaaS subscription management platform powering modern software companies. Streamline software products, recurring billing, invoices, quotations, and staff workflows.
            </p>
            <div className="flex items-center gap-4 text-xs text-white/50 pt-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                SOC2 Compliant Architecture
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Lock className="w-4 h-4" />
                256-bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* Software Suite */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Software Suite
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link to="/catalog" className="hover:text-[#bef264] transition-colors">BrightBooks (Accounting)</Link></li>
              <li><Link to="/catalog" className="hover:text-[#bef264] transition-colors">StaffTrack (HR & Payroll)</Link></li>
              <li><Link to="/catalog" className="hover:text-[#bef264] transition-colors">StockMaster (Inventory)</Link></li>
              <li><Link to="/catalog" className="hover:text-[#bef264] transition-colors">EduManage (Education ERP)</Link></li>
              <li><Link to="/catalog" className="hover:text-[#bef264] transition-colors">ShopFlow (Retail POS)</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link to="/pricing" className="hover:text-[#bef264] transition-colors">Subscription Plans</Link></li>
              <li><Link to="/catalog" className="hover:text-[#bef264] transition-colors">Product Catalogue</Link></li>
              <li><Link to="/login" className="hover:text-[#bef264] transition-colors">Client Portal</Link></li>
              <li><Link to="/register" className="hover:text-[#bef264] transition-colors">Self-Service Checkout</Link></li>
              <li><Link to="/about" className="hover:text-[#bef264] transition-colors">Company Story</Link></li>
            </ul>
          </div>

          {/* Enterprise & Security */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Access & Roles
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link to="/login" className="hover:text-[#bef264] transition-colors">Administrator Portal</Link></li>
              <li><Link to="/login" className="hover:text-[#bef264] transition-colors">Operations Staff Hub</Link></li>
              <li><Link to="/login" className="hover:text-[#bef264] transition-colors">Customer Dashboard</Link></li>
              <li><span className="text-emerald-400 font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> API Status: Operational</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© {new Date().getFullYear()} MEMZO Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security Whitepaper</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
