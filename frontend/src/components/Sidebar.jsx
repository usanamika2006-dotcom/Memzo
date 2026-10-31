import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  UserCheck,
  CreditCard,
  FileText,
  FileCheck2,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
  User
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  // Nav menus by role
  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Subscription Plans', path: '/admin/plans', icon: Layers },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Staff Members', path: '/admin/staff', icon: UserCheck },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
    { name: 'Quotations', path: '/admin/quotations', icon: FileCheck2 },
    { name: 'Invoices', path: '/admin/invoices', icon: FileText },
    { name: 'Discounts & Codes', path: '/admin/discounts', icon: Tag },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Revenue Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const staffLinks = [
    { name: 'Staff Dashboard', path: '/staff', icon: LayoutDashboard },
    { name: 'Customers', path: '/staff/customers', icon: Users },
    { name: 'Subscriptions', path: '/staff/subscriptions', icon: CreditCard },
    { name: 'Quotations', path: '/staff/quotations', icon: FileCheck2 },
    { name: 'Invoices', path: '/staff/invoices', icon: FileText },
    { name: 'Payments', path: '/staff/payments', icon: CreditCard },
    { name: 'Profile Settings', path: '/staff/profile', icon: User },
  ];

  const customerLinks = [
    { name: 'My Dashboard', path: '/customer', icon: LayoutDashboard },
    { name: 'Browse Products', path: '/customer/catalog', icon: ShoppingBag },
    { name: 'Active Subscriptions', path: '/customer/subscriptions', icon: CreditCard },
    { name: 'Invoices & Receipts', path: '/customer/invoices', icon: FileText },
    { name: 'Payment History', path: '/customer/payments', icon: CreditCard },
    { name: 'Account Profile', path: '/customer/profile', icon: User },
  ];

  let currentLinks = customerLinks;
  let roleTitle = 'Customer Portal';
  let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';

  if (role === 'ADMIN') {
    currentLinks = adminLinks;
    roleTitle = 'Admin Portal';
    badgeColor = 'bg-[#10b981]/20 text-[#bef264] border-[#10b981]/30';
  } else if (role === 'STAFF') {
    currentLinks = staffLinks;
    roleTitle = 'Operations Hub';
    badgeColor = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
  }

  return (
    <aside
      className={`bg-[#0a241b] text-white/90 border-r border-[#133e30] transition-all duration-300 flex flex-col z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-18 px-4 flex items-center justify-between border-b border-[#133e30]">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#10b981] to-[#bef264] flex items-center justify-center text-[#051c14] font-bold shadow">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight font-['Plus_Jakarta_Sans'] text-white">
                MEM<span className="text-[#bef264]">ZO</span>
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-emerald-400 font-semibold -mt-1">
                {roleTitle}
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-8 h-8 rounded-lg bg-gradient-to-tr from-[#10b981] to-[#bef264] flex items-center justify-center text-[#051c14] font-bold shadow">
            <Zap className="w-4 h-4 fill-current" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Pill */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-[#133e30]/50">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center justify-between ${badgeColor}`}>
            <span className="uppercase tracking-wider">{role}</span>
            <span className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse"></span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {currentLinks.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#bef264] text-[#051c14] font-semibold shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#051c14]' : 'text-white/70'}`} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t border-[#133e30]">
        {!collapsed ? (
          <div className="bg-[#0e2f24] rounded-xl p-3 border border-[#1b4332]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#1b4332] text-[#bef264] flex items-center justify-center font-bold text-sm border border-[#2d6a4f]">
                {user.first_name ? user.first_name[0] : user.username[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                </p>
                <p className="text-xs text-white/50 truncate">{user.email || user.username}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-[#1b4332] text-xs">
              <button
                onClick={() => navigate('/')}
                className="text-emerald-400 hover:text-[#bef264] flex items-center gap-1 transition-colors"
                title="View Website"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Storefront</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full py-2 flex items-center justify-center text-red-400 hover:bg-white/10 rounded-lg"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
