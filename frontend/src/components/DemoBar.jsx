import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Briefcase, UserCheck, LogOut, Globe, Sparkles } from 'lucide-react';

export const DemoBar = () => {
  const { user, loginAs, logout } = useAuth();
  const navigate = useNavigate();

  const handleQuickSwitch = async (role) => {
    try {
      const loggedUser = await loginAs(role);
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'STAFF') navigate('/staff');
      else if (role === 'CUSTOMER') navigate('/customer');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#051c14] border-b border-[#1b4332] text-xs text-white/90 py-1.5 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#bef264] font-semibold tracking-wide uppercase text-[10px]">
            <Sparkles className="w-3 h-3 text-[#bef264]" />
            Live Role Switcher
          </span>
          <span className="hidden sm:inline text-white/60">One-click role access:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => handleQuickSwitch('ADMIN')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
              user?.role === 'ADMIN'
                ? 'bg-[#bef264] text-[#051c14] shadow-sm font-semibold'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-current" />
            <span>Admin</span>
          </button>

          <button
            onClick={() => handleQuickSwitch('STAFF')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
              user?.role === 'STAFF'
                ? 'bg-[#bef264] text-[#051c14] shadow-sm font-semibold'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-current" />
            <span>Staff</span>
          </button>

          <button
            onClick={() => handleQuickSwitch('CUSTOMER')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
              user?.role === 'CUSTOMER'
                ? 'bg-[#bef264] text-[#051c14] shadow-sm font-semibold'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-current" />
            <span>Customer</span>
          </button>

          <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block"></div>

          <button
            onClick={() => navigate('/')}
            className="px-2 py-1 rounded-md flex items-center gap-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Go to Public Website"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Public Site</span>
          </button>

          {user && (
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-2 py-1 rounded-md flex items-center gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoBar;
