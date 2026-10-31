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

# MEMZO – Subscription Management System

## 1. Project Overview

**MEMZO** is a centralized, database-driven Subscription Management System developed for a software company that sells its own software products through different subscription plans.

The system provides a unified platform to manage software products, subscription plans, customers, subscriptions, quotations, invoices, payments, discounts and taxes.

It supports three types of users – Admin, Staff and Customer – with separate access permissions and functionalities.

MEMZO aims to simplify subscription operations, improve record management and provide an organized way to monitor subscription activities and payments.

## 2. Problem Statement

Managing software subscriptions manually can become difficult as the number of customers, products and transactions increases.

Maintaining customer records, tracking subscription periods, generating invoices, monitoring payments and managing renewals separately can lead to errors and inefficient workflows.

MEMZO addresses these challenges by providing a centralized platform where subscription-related activities can be managed and monitored efficiently.

## 3. Objectives

- Develop a centralized subscription management platform.
- Manage software products and their subscription plans.
- Maintain customer and staff information.
- Create, track and manage subscriptions.
- Generate quotations and invoices.
- Record and monitor payment transactions.
- Apply discounts and tax rules.
- Provide role-based access and data protection.
- Generate reports for monitoring business activities.

## 4. Key Features

### 4.1 Product Management
- Add, edit and manage software products.
- Manage product variants and subscription plans.
- Publish or unpublish products.
- Display available products through the public catalogue.

### 4.2 Subscription Management
- Create and manage customer subscriptions.
- Support monthly and yearly subscription cycles.
- Track subscription status and validity.
- Manage subscription renewals and expiry.
- View subscription details and history.

### 4.3 Customer Management
- Customer registration and authentication.
- Maintain customer profiles.
- View individual subscription details.
- Access invoices, payment records and notifications.

### 4.4 Quotation Management
- Create quotations for customers.
- Add products and quantities.
- Manage quotation status.
- Convert accepted quotations into invoices through the application workflow.

### 4.5 Invoice Management
- Generate invoices for subscription transactions.
- Calculate subtotals, discounts and taxes.
- Track invoice status and outstanding balances.
- Maintain invoice records.

### 4.6 Payment Management
- Record customer payments.
- Support partial and full payment records.
- Track payment status.
- Update outstanding invoice balances.

**Note:** Payment processing in this project is simulated. No external payment gateway or real financial transaction is involved.

### 4.7 Discount and Tax Management
- Create and manage discount rules.
- Support percentage-based and fixed discounts.
- Configure tax rules.
- Apply eligible discounts and taxes during invoice calculations.

### 4.8 Reports and Notifications
- View business and financial reports.
- Monitor subscription and payment activities.
- Display notifications and relevant updates to users.

## 5. User Roles and Permissions

MEMZO provides three main user roles.

| Role | Functionalities |
|---|---|
| **Admin** | Complete system management, including products, plans, staff, customers, subscriptions, quotations, invoices, payments, discounts, taxes, reports and settings. |
| **Staff** | Manage customers, subscriptions, quotations, invoices, payments and notifications within assigned permissions. |
| **Customer** | Register, log in, browse products, purchase plans, view subscriptions, manage renewals, access invoices and payments, and update profile details. |

Each role has a separate dashboard and restricted access to authorized functionalities.

## 6. Technology Stack

| Category | Technologies |
|---|---|
| Programming Language | Python |
| Backend Framework | Flask |
| Frontend | HTML5, CSS3, JavaScript |
| UI Framework | Bootstrap 5 |
| Template Engine | Jinja2 |
| Database | SQLite |
| ORM | Flask-SQLAlchemy |
| Authentication | Flask-Login |
| Form Validation | Flask-WTF |
| Security | Werkzeug Password Hashing, CSRF Protection |
| Charts | Chart.js |
| Version Control | Git and GitHub |

## 7. System Architecture

MEMZO follows a modular Flask application architecture using the Application Factory pattern and Blueprints.

The application is organized into separate modules based on user roles and functionality.

### Main Components

- **Application Layer:** Handles application initialization, configuration and error handling.
- **Authentication Layer:** Manages registration, login, logout and password-related operations.
- **Blueprint Layer:** Separates public, admin, staff and customer functionalities.
- **Service Layer:** Contains business logic for subscriptions, invoices, payments, discounts, taxes, notifications and reports.
- **Database Layer:** Stores application data using SQLite and SQLAlchemy models.
- **Presentation Layer:** Uses HTML templates, CSS, Bootstrap and JavaScript to provide the user interface.

### Application Flow

1. Users access the application through the web interface.
2. Authentication verifies user credentials.
3. Role-based access control determines the available functionalities.
4. Flask routes process user requests.
5. Service modules execute the required business logic.
6. SQLAlchemy communicates with the SQLite database.
7. Results are displayed through Jinja2 templates.

## 8. Database Design

MEMZO uses SQLite as its relational database and Flask-SQLAlchemy as its ORM.

The database contains models representing the major entities of the system, including:

- Users
- Products
- Product Variants
- Plans
- Subscriptions
- Subscription Items
- Quotations
- Quotation Items
- Tax Rules
- Discounts
- Invoices
- Invoice Items
- Payments
- Notifications

These models represent the relationships between users, products, subscriptions and financial records.

## 9. Project Directory Structure

```text
MEMZO/
│
├── app.py
├── config.py
├── extensions.py
├── models.py
├── forms.py
├── decorators.py
├── utils.py
├── seed.py
├── requirements.txt
├── .env.example
│
├── blueprints/
│   ├── auth/
│   ├── public/
│   ├── admin/
│   ├── staff/
│   └── customer/
│
├── services/
│   ├── subscription_service.py
│   ├── invoice_service.py
│   ├── payment_service.py
│   ├── discount_service.py
│   ├── tax_service.py
│   ├── notification_service.py
│   └── report_service.py
│
├── templates/
│   ├── admin/
│   ├── staff/
│   ├── customer/
│   ├── components/
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── checkout.html
│
├── static/
│   ├── css/
│   ├── js/
│   └── images/
│
└── tests/
    ├── test_auth.py
    ├── test_permissions.py
    ├── test_products.py
    ├── test_subscriptions.py
    ├── test_invoices.py
    └── test_payments.py
```

## 10. Installation and Setup

### Prerequisites

- Python 3.10 or above
- Git
- pip package manager

### Step 1: Clone the Repository

```bash
git clone https://github.com/usanamika2006-dotcom/Memzo.git
cd Memzo
```

### Step 2: Create a Virtual Environment

```bash
python -m venv venv
```

Activate the environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**

```cmd
venv\Scripts\activate.bat
```

**Linux/macOS:**

```bash
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create a `.env` file using `.env.example` as a reference and configure the required application settings.

Do not commit private environment variables or secret keys to the repository.

### Step 5: Initialize and Seed the Database

```bash
python seed.py
```

This initializes and populates the database with demo data and test accounts.

### Step 6: Run the Application

```bash
python app.py
```

Open the following address in your browser:

```text
http://127.0.0.1:5000/
```

## 11. Demo User Accounts

The database seeder provides sample accounts for testing the different user roles.

| Role | Email |
|---|---|
| Admin | admin@memzo.com |
| Staff | staff@memzo.com |
| Customer | customer@memzo.com |

The corresponding demo passwords are configured in the database seeding code. These accounts are intended only for local demonstration and testing.

## 12. Testing

MEMZO includes an automated test suite to verify important application functionalities.

The test modules cover:

- User authentication.
- Role-based permissions and access control.
- Product and plan management.
- Subscription operations.
- Invoice calculations and balances.
- Payment recording and validation.

Run the test suite using:

```bash
python -m unittest discover tests
```

## 13. Security and Validation

The application includes several security and validation mechanisms:

- Password hashing using Werkzeug.
- Authentication using Flask-Login.
- Role-based access control.
- CSRF protection using Flask-WTF.
- Server-side form validation.
- Customer-specific data access restrictions.
- Server-side financial calculations using Decimal arithmetic.

These mechanisms help protect application data and ensure that users can access only the functionalities permitted by their roles.

## 14. Conclusion

MEMZO provides an integrated solution for managing software subscriptions and related business operations.

By combining product management, subscription tracking, customer management, quotation generation, invoicing and payment monitoring into one platform, the system helps organize subscription workflows efficiently.

The modular architecture also makes the application easier to maintain and extend with additional functionalities in the future.

---

**Project Name:** MEMZO – Subscription Management System  
**Backend:** Python Flask  
**Database:** SQLite  
**Project Type:** Web-Based Application  
**Repository:** https://github.com/usanamika2006-dotcom/Memzo
