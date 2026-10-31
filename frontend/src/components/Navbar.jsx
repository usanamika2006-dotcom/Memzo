import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard, 
  LogOut, 
  User 
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'STAFF') return '/staff';
    return '/customer';
  };

  return (
    <header className="bg-[#0a241b] text-white border-b border-[#133e30] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10b981] to-[#bef264] flex items-center justify-center text-[#051c14] shadow-md group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans'] flex items-center gap-1">
                MEM<span className="text-[#bef264]">ZO</span>
              </span>
              <span className="text-[10px] text-emerald-400/80 block -mt-1 tracking-wider uppercase font-semibold">
                SaaS Cloud Suite
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
            <Link to="/" className="hover:text-[#bef264] transition-colors">
              Home
            </Link>
            <Link to="/catalog" className="hover:text-[#bef264] transition-colors flex items-center gap-1">
              Products
              <span className="text-[10px] bg-[#10b981]/30 text-[#bef264] px-1.5 py-0.5 rounded-full font-bold">5 Apps</span>
            </Link>
            <Link to="/pricing" className="hover:text-[#bef264] transition-colors">
              Pricing Plans
            </Link>
            <Link to="/about" className="hover:text-[#bef264] transition-colors">
              About
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(getDashboardRoute())}
                  className="bg-[#bef264] hover:bg-[#a3e635] text-[#051c14] px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{user.role} Dashboard</span>
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-[#1b4332]">
                  <div className="w-9 h-9 rounded-full bg-[#133e30] border border-[#2d6a4f] flex items-center justify-center text-sm font-bold text-[#bef264]">
                    {user.first_name ? user.first_name[0] : user.username[0].toUpperCase()}
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-white/60 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#bef264] hover:bg-[#a3e635] text-[#051c14] px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 group hover:scale-[1.02]"
                >
                  <span>Open An Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#071f16] border-b border-[#133e30] px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-white/90 hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            to="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-white/90 hover:bg-white/10"
          >
            Software Products
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-white/90 hover:bg-white/10"
          >
            Pricing Plans
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-white/90 hover:bg-white/10"
          >
            About MEMZO
          </Link>
          
          <div className="pt-4 border-t border-[#1b4332] flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getDashboardRoute());
                  }}
                  className="w-full bg-[#bef264] text-[#051c14] py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to {user.role} Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-red-400 py-2 rounded-xl font-medium text-sm hover:bg-white/5"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 text-white font-medium hover:bg-white/10 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-[#bef264] text-[#051c14] py-2.5 rounded-xl font-bold"
                >
                  Open An Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
