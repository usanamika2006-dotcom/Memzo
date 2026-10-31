# Brightloop – SaaS Subscription Management System

[![Django](https://img.shields.io/badge/Backend-Django_5.2_%2B_DRF-092e20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/Frontend-React_19_%2B_Vite_8-0a241b?style=for-the-badge&logo=react&logoColor=%23bef264)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-051c14?style=for-the-badge&logo=tailwindcss&logoColor=%2338bdf8)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-SQLite-071f16?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

**Brightloop** is a modern, full-stack enterprise SaaS Subscription Management System built for a software company selling its own proprietary suite of subscription-based cloud software products.

The platform is designed following an ultra-premium aesthetic inspired by modern fintech systems, featuring deep obsidian-emerald hero sections (`#0a241b`), electric lime accents (`#bef264`), smooth glassmorphic cards, and real-time dashboard telemetry.

---

## 🌟 Quick Demo Credentials (Hackathon Evaluators)

| Role | Username | Password | Full Name | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **ADMIN** | `admin` | `password123` | Sarah Jenkins | Complete administrative control, products & plans CRUD, discounts, staff accounts, revenue analytics. |
| 💼 **STAFF** | `staff` | `password123` | Alex Rivera | Daily operations, customer directory, dispatching quotations, generating invoices, recording payments. |
| 👤 **CUSTOMER** | `customer` | `password123` | Michael Chang | Self-service software catalog, subscription purchases, checkout, invoice settlements, renewal management. |

> **Tip:** You can switch between any of the three roles in **1 click** using the sticky **Hackathon Reviewer Mode** top bar (`DemoBar`) on any page.

---

## 📦 Proprietary Software Suite

Brightloop sells and operates its own software products, all dynamically managed in the backend database:

1. **BrightBooks** – Automated Cloud Accounting, Multi-Currency Ledger & Financial Intelligence.
2. **StaffTrack** – Next-Gen Workforce Management, Global Payroll & People Analytics.
3. **StockMaster** – Smart Multi-Warehouse Inventory & Supply Chain Automation.
4. **EduManage** – Unified Campus, Student Life & Academic Administration ERP.
5. **ShopFlow** – Modern Retail Point-of-Sale, Omnichannel Orders & Loyalty.

---

## 🚀 How to Run Locally

### 1. Backend (Django REST Framework)
The Python virtual environment is located at `backend/venv`.

```bash
cd backend
venv\Scripts\activate
python manage.py migrate
python seed.py          # Seeds demo users, products, plans, and historical telemetry
python manage.py runserver 127.0.0.1:8000
```
*Backend API available at: `http://127.0.0.1:8000/api/`*

### 2. Frontend (React Vite + Tailwind)
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend Application available at: `http://127.0.0.1:5173/`*

---

## 🔄 End-to-End Subscription Workflow

1. **Catalog Browsing**: Navigate to the public storefront or `/catalog` to view products loaded dynamically from Django.
2. **Plan Selection**: Select any software product (e.g., *BrightBooks* or *StaffTrack*) and choose either **Monthly** or **Annual** billing.
3. **Checkout & Discount**: On `/checkout`, apply promo coupons like `WELCOME20` (20% off) or `HACKATHON50` ($50 off) with real-time backend validation.
4. **Simulated Payment**: Enter any test card (pre-filled with `4242 •••• 4242`) and click **"Pay & Activate Subscription"**.
5. **Instant Execution**:
   - An active **Subscription** is created with exact start/end dates and auto-renewal flag.
   - An official **Tax Invoice** is generated (e.g., `INV-2026-00005`) marked as `PAID`.
   - A **Payment** record with unique transaction ID (e.g., `TXN-38C19E7C2D`) is saved.
   - Live system notifications are dispatched to both the customer and admin/staff.
6. **Real-time Telemetry**: Switch to the **Admin Dashboard** (`/admin`) to see the newly captured revenue and active contract count reflected immediately in the **Recharts** charts.

---

## 🏗️ System Architecture & Database Entities

### Backend Models (`backend/core/models.py`)
- `User`: Custom user model with role choices (`ADMIN`, `STAFF`, `CUSTOMER`), phone, company, and avatar.
- `Product`: Name, slug, category, icon, tagline, features list, rating, review count, badge.
- `ProductVariant`: Editions and variant SKUs.
- `SubscriptionPlan`: Foreign key to Product, billing cycle (`MONTHLY`, `ANNUALLY`), price, trial days, feature matrix.
- `Subscription`: Foreign key to Customer and Plan, status (`ACTIVE`, `PAST_DUE`, `CANCELLED`, `TRIAL`), dates, auto-renewal.
- `SubscriptionItem`: Line items associated with subscriptions.
- `Quotation` & `QuotationItem`: Commercial proposals dispatched by Staff/Admin with status (`SENT`, `ACCEPTED`, `REJECTED`) and 1-click invoice conversion.
- `TaxRule` & `Discount`: Localized tax rates and promotional coupon validation.
- `Invoice` & `InvoiceItem`: Unique invoice numbering, due dates, breakdown (subtotal, tax, discount, total), status (`PAID`, `UNPAID`, `OVERDUE`).
- `Payment`: Records payment transactions, method (`CARD`, `BANK_TRANSFER`, `SIMULATED`), transaction ID, and clearance status.
- `Notification`: User notifications with unread tracking and direct action links.

### REST API Endpoints (`/api/`)
- `POST /api/auth/login/` – Authenticate with username or email, returns JWT tokens and user profile.
- `POST /api/auth/register/` – Customer self-service registration.
- `GET /api/auth/me/` – Get current authenticated profile.
- `GET /api/auth/demo-users/` – Pre-seeded test accounts.
- `GET, POST, PUT, DELETE /api/products/` – Software product catalog (Admin CRUD, Public Read).
- `GET, POST, PUT, DELETE /api/plans/` – Subscription plan management.
- `POST /api/discounts/validate/` – Coupon verification and discount calculation.
- `POST /api/checkout/` – Core atomic purchase, subscription creation, invoice generation & payment.
- `GET /api/subscriptions/` – Role-filtered subscription records.
- `POST /api/subscriptions/<id>/cancel/` – Cancel subscription.
- `POST /api/subscriptions/<id>/renew/` – Renew subscription & issue renewal invoice.
- `GET, POST /api/invoices/` – Invoices ledger & manual invoice generation.
- `POST /api/invoices/<id>/pay/` – Settle unpaid invoice.
- `GET, POST /api/quotations/` – Enterprise quotation creation and acceptance.
- `GET, POST /api/payments/` – Payment ledger & offline wire recording.
- `GET /api/dashboard/stats/` – Role-aware analytics, ARR calculation, and charts data.
- `GET, POST /api/notifications/` – In-app alerts and mark-as-read endpoints.

---

## 🎨 Design System

- **Primary Colors**: Deep Obsidian Emerald (`#0a241b`), Forest Dark (`#051c14`), Electric Lime (`#bef264`), Mint Accent (`#10b981`).
- **Typography**: Google Fonts *Plus Jakarta Sans* & *Inter*.
- **Interactive UI**: Glassmorphic panels, micro-animations, collapsible sidebars, status pills, interactive Recharts curves.
