import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import CatalogPage from './pages/public/CatalogPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import PricingPage from './pages/public/PricingPage';
import CheckoutPage from './pages/public/CheckoutPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import AboutPage from './pages/public/AboutPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsManager from './pages/admin/ProductsManager';
import CustomersManager from './pages/admin/CustomersManager';
import StaffManager from './pages/admin/StaffManager';
import SubscriptionsManager from './pages/admin/SubscriptionsManager';
import InvoicesManager from './pages/admin/InvoicesManager';
import QuotationsManager from './pages/admin/QuotationsManager';
import DiscountsManager from './pages/admin/DiscountsManager';
import ReportsManager from './pages/admin/ReportsManager';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffPayments from './pages/staff/StaffPayments';
import StaffProfile from './pages/staff/StaffProfile';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerSubscriptions from './pages/customer/CustomerSubscriptions';
import CustomerInvoices from './pages/customer/CustomerInvoices';
import CustomerPayments from './pages/customer/CustomerPayments';
import CustomerProfile from './pages/customer/CustomerProfile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Storefront Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<DashboardLayout allowedRoles={['ADMIN']} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="plans" element={<ProductsManager />} />
            <Route path="customers" element={<CustomersManager />} />
            <Route path="staff" element={<StaffManager />} />
            <Route path="subscriptions" element={<SubscriptionsManager />} />
            <Route path="quotations" element={<QuotationsManager />} />
            <Route path="invoices" element={<InvoicesManager />} />
            <Route path="discounts" element={<DiscountsManager />} />
            <Route path="payments" element={<StaffPayments />} />
            <Route path="reports" element={<ReportsManager />} />
          </Route>

          {/* Staff Protected Routes */}
          <Route path="/staff" element={<DashboardLayout allowedRoles={['STAFF', 'ADMIN']} />}>
            <Route index element={<StaffDashboard />} />
            <Route path="customers" element={<CustomersManager />} />
            <Route path="subscriptions" element={<SubscriptionsManager />} />
            <Route path="quotations" element={<QuotationsManager />} />
            <Route path="invoices" element={<InvoicesManager />} />
            <Route path="payments" element={<StaffPayments />} />
            <Route path="profile" element={<StaffProfile />} />
          </Route>

          {/* Customer Protected Routes */}
          <Route path="/customer" element={<DashboardLayout allowedRoles={['CUSTOMER']} />}>
            <Route index element={<CustomerDashboard />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="subscriptions" element={<CustomerSubscriptions />} />
            <Route path="invoices" element={<CustomerInvoices />} />
            <Route path="payments" element={<CustomerPayments />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
