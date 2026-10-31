# MEMZO — Subscription Management System

**MEMZO** is a centralized, database-driven Subscription Management System engineered for a software company selling its own proprietary software products through tiered subscription plans (Monthly, Yearly, etc.).

---

## 1. Visual Blueprint & Design Identity

The visual design is built to recreate the **SIXOY website reference blueprint** while adapting the branding, typography, and content for a subscription management SaaS platform.

### Design Tokens
| Token | Hex | Usage |
|---|---|---|
| **Deep Teal** | `#062722` | Hero background, navigation bars, primary branding accents |
| **Mint Green** | `#91E8C1` | Hero headline, glowing accents, badge highlights |
| **Lime Green** | `#C9FF82` | Primary CTA buttons, interactive hover highlights |
| **Soft Cream** | `#F0F2DF` | Outer page backdrop, framing borders, subtle sections |
| **Pure White** | `#FFFFFF` | Main content cards, tables, dashboard panels |
| **Main Text** | `#171C19` | High-contrast typography and headings |
| **Secondary Text** | `#777F79` | Descriptive copy, timestamps, subtitles |
| **Light Border** | `#E6E9E2` | Refined card, modal, and table dividers |

### Blueprint Sections Implemented on Landing Page (`/`)
1. **Teal Hero Section:** Fixed max-width canvas framed inside soft cream, centered mint green headline (*"Your subscriptions. One smarter platform."*), lime green CTA button, and a 3D-styled glowing device mockup collage with floating subscription KPI cards.
2. **Horizontal Software Logo Strip:** Clean monochrome logo bar featuring MEMZO's enterprise software suite: *BrightBooks, StaffTrack, StockMaster, EduManage, ShopFlow, CloudGuard*.
3. **Core Features Section:** Centered headline with interactive horizontal pill tabs (*Product Management, Subscription Tracking, Invoices & Payments, Discounts & Taxes*) and feature overview cards.
4. **Two-Column Feature Showcase:** Left column with feature tag, headline, description, and action CTA; right column featuring a rounded lime-tinted dashboard mockup with a floating glassmorphic card.
5. **Use-Case Grid Showcase:** 4 rounded cards with modern imagery and bottom pill badges (*Accounting & ERP, Workforce Management, School & Campus, Retail & POS*).
6. **Footer:** Deep teal navigation footer with branding, product directory, legal links, and status indicator.

---

## 2. Technology Stack & Architecture

- **Backend:** Python 3.12+ / Flask (Application Factory & Blueprints)
- **Database:** SQLite (`database/memzo.db`)
- **ORM:** Flask-SQLAlchemy (14 normalized database models)
- **Authentication:** Flask-Login with Werkzeug password hashing
- **Security & Forms:** Flask-WTF with CSRF token protection
- **Frontend:** Jinja2 templates, Bootstrap 5 grid utilities, Vanilla CSS custom styling, and Chart.js

### Project Directory Structure
```text
MEMZO/
├── app.py                     # Flask application factory & error handlers
├── config.py                  # Environment-driven configuration
├── extensions.py              # SQLAlchemy, LoginManager, Migrate, CSRF
├── models.py                  # 14 SQLAlchemy database tables & relationships
├── forms.py                   # WTForms form definitions with validation
├── decorators.py              # Role-based access control decorators
├── utils.py                   # Currency formatting, ID generators, password checks
├── seed.py                    # Comprehensive database seeder
├── requirements.txt           # Python dependencies
├── .env / .env.example        # Environment configuration
│
├── database/
│   └── memzo.db               # Shared SQLite database
│
├── blueprints/
│   ├── auth/                  # Authentication routes (login, register, reset)
│   ├── public/                # Public landing page, catalog, checkout
│   ├── admin/                 # Full administrative management
│   ├── staff/                 # Operational management & quotations
│   └── customer/              # Customer self-service portal
│
├── services/
│   ├── subscription_service.py # Expiry calculation, status transitions, renewals
│   ├── invoice_service.py      # Subtotal, tax, discount, balance calculations
│   ├── payment_service.py      # Payment recording, verification, balances
│   ├── discount_service.py     # Discount eligibility, limits, dates
│   ├── tax_service.py          # Active tax rules & invoice line calculations
│   ├── notification_service.py # User notifications & reminders
│   └── report_service.py       # Revenue aggregations & operational metrics
│
├── templates/
│   ├── base.html              # Base HTML with fonts and shared scripts
│   ├── index.html             # SIXOY blueprint-matching landing page
│   ├── login.html / register.html / checkout.html / products.html
│   ├── components/            # Navbars, footers, sidebars, badges, flash messages
│   ├── admin/                 # 17 Admin management templates
│   ├── staff/                 # 10 Staff operational templates
│   └── customer/              # 8 Customer self-service templates
│
├── static/
│   ├── css/ (style.css, auth.css, dashboard.css, admin.css, staff.css, customer.css)
│   ├── js/  (main.js, charts.js)
│   └── images/ (logo.svg, hero mockups, feature cards, showcase images)
│
└── tests/
    ├── test_auth.py           # Registration, login, password security
    ├── test_permissions.py    # Strict role separation and ownership tests
    ├── test_products.py       # Product catalog, publishing, plans
    ├── test_subscriptions.py  # Lifecycle, cycles, status transitions, renewal
    ├── test_invoices.py       # Invoicing, taxes, discounts, balance settling
    └── test_payments.py       # Payment processing, partial payments, duplicates
```

---

## 3. User Roles & Default Test Credentials

The database is pre-seeded with 3 primary user accounts:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Admin** | `admin@memzo.com` | `Admin@Password123` | Complete system control: products, variants, plans, staff creation, all customers, quotations, invoices, taxes, discounts, payments, financial reports, system settings. |
| **Staff** | `staff@memzo.com` | `Staff@Password123` | Operational tasks: customer management, quotation creation, invoice generation & confirmation, recording payments, viewing activity. *(Cannot create staff or alter tax/discount rules)* |
| **Customer** | `customer@memzo.com` | `Customer@Password123` | Self-service portal: browse catalog, purchase plans via checkout, view active subscriptions, manage renewals, inspect invoices & payment receipts, update profile. |

---

## 4. Setup & Running Instructions

### 1. Prerequisites
- Python 3.10+ (Recommended Python 3.12)
- Git and virtual environment tools

### 2. Clone and Setup Environment
```bash
# Navigate to the project directory
cd memzo

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (Command Prompt):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt
```

### 3. Initialize & Seed Database
```bash
# Runs migrations/schema creation and populates demo accounts, software products, plans, taxes, discounts, and sample invoices
python seed.py
```

### 4. Run the Development Server
```bash
python app.py
```
Open your browser and navigate to **`http://127.0.0.1:5000`**.

---

## 5. Running the Automated Test Suite

A dedicated unit test suite with 16 automated tests verifies authentication, access control permissions, catalog management, subscription life-cycles, tax/discount computations, and invoice balance tracking.

```bash
# Run all tests
python -m unittest discover tests
```

Expected result:
```text
Ran 16 tests in ~5s
OK
```

---

## 6. End-to-End Workflow Demonstration

### Workflow A: Customer Purchases a Subscription
1. Visit `http://127.0.0.1:5000/products` or click **"Browse Software"**.
2. Select **BrightBooks — Accounting Software** or **StaffTrack**.
3. Choose a subscription plan (e.g., *Professional Yearly*).
4. Click **"Subscribe Now"** to open `/checkout`.
5. Enter promo code `LAUNCH25` (25% off) and select a simulated payment method (Credit Card, Bank Transfer, or UPI).
6. Click **"Confirm & Complete Payment"**.
7. The server recalculates totals, validates the promotion, processes the simulated payment, generates Invoice `#INV-...`, and sets the subscription to **Active**.
8. View the new subscription in the **Customer Dashboard** (`/customer/subscriptions`).

### Workflow B: Admin Configures a New Product & Plan
1. Log in as `admin@memzo.com` with `Admin@Password123`.
2. Navigate to **Products** (`/admin/products`) -> click **"Add New Product"**.
3. Fill in product name, description, sales price, and publish status.
4. Navigate to **Plans** (`/admin/plans`) -> click **"Create Plan"** to attach Monthly or Yearly billing cycles.
5. The product immediately appears on the public catalog.

### Workflow C: Staff Creates a Quotation & Records Payment
1. Log in as `staff@memzo.com` with `Staff@Password123`.
2. Go to **Quotations** (`/staff/quotations`) -> click **"New Quotation"**.
3. Select a customer and add product line items with custom quantities.
4. Mark quotation as **Sent** or **Accepted**.
5. Once accepted, navigate to **Invoices** (`/staff/invoices`), select an unpaid invoice, click **"Record Payment"**, and enter partial or full amount.
6. The invoice outstanding balance automatically adjusts; when paid in full, status transitions to **Paid**.

---

## 7. Key Business Logic & Security Guarantees

1. **Server-Side Validation:** All financial totals (subtotals, percentage & fixed discounts, taxes, balances) are calculated on the server using `Decimal` arithmetic. Browser-submitted prices are never trusted.
2. **Access Control:** Enforced at the route decorator level (`@admin_required`, `@staff_required`, `@customer_required`). Customer route endpoints verify `customer_id == current_user.user_id` to prevent IDOR attacks.
3. **Simulation Notice:** All payment processing in this prototype is explicitly handled via server-side simulation without external credit card gateways, ensuring safety and determinism.
4. **Data Isolation:** Staff cannot create admin or other staff accounts; customers cannot view other customers' invoices or subscriptions.
