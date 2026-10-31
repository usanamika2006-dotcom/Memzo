import os
import sys
import django
from datetime import timedelta
from decimal import Decimal
import uuid

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from django.contrib.auth import get_user_model
from core.models import (
    Product, ProductVariant, SubscriptionPlan, TaxRule, Discount,
    Subscription, SubscriptionItem, Quotation, QuotationItem,
    Invoice, InvoiceItem, Payment, Notification
)

User = get_user_model()

def run_seed():
    print("[*] Clearing old database records (if any)...")
    Notification.objects.all().delete()
    Payment.objects.all().delete()
    InvoiceItem.objects.all().delete()
    Invoice.objects.all().delete()
    QuotationItem.objects.all().delete()
    Quotation.objects.all().delete()
    SubscriptionItem.objects.all().delete()
    Subscription.objects.all().delete()
    SubscriptionPlan.objects.all().delete()
    ProductVariant.objects.all().delete()
    Product.objects.all().delete()
    Discount.objects.all().delete()
    TaxRule.objects.all().delete()
    User.objects.all().delete()

    print("[*] Creating demo users for all three roles...")
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@memzo.io',
        password='password123',
        first_name='Sarah',
        last_name='Jenkins',
        role=User.Role.ADMIN,
        phone='+1 (555) 019-2834',
        company_name='MEMZO HQ'
    )

    staff = User.objects.create_user(
        username='staff',
        email='staff@memzo.io',
        password='password123',
        first_name='Alex',
        last_name='Rivera',
        role=User.Role.STAFF,
        phone='+1 (555) 014-9921',
        company_name='MEMZO Operations'
    )

    customer = User.objects.create_user(
        username='customer',
        email='customer@memzo.io',
        password='password123',
        first_name='Michael',
        last_name='Chang',
        role=User.Role.CUSTOMER,
        phone='+1 (555) 482-9011',
        company_name='Apex Enterprises'
    )

    customer2 = User.objects.create_user(
        username='elena',
        email='elena@lumina.tech',
        password='password123',
        first_name='Elena',
        last_name='Rostova',
        role=User.Role.CUSTOMER,
        phone='+1 (555) 773-1204',
        company_name='Lumina Digital Systems'
    )

    customer3 = User.objects.create_user(
        username='david',
        email='david@velocity.co',
        password='password123',
        first_name='David',
        last_name='Kim',
        role=User.Role.CUSTOMER,
        phone='+1 (555) 620-3349',
        company_name='Velocity Logistics'
    )

    print("[*] Creating Tax Rules & Discounts...")
    TaxRule.objects.create(name='Standard SaaS Tax (10%)', rate=Decimal('10.00'), country='Global')
    TaxRule.objects.create(name='EU VAT (12%)', rate=Decimal('12.00'), country='European Union', is_active=False)

    Discount.objects.create(
        code='WELCOME20',
        description='20% Off First Subscription Purchase',
        discount_type=Discount.DiscountType.PERCENTAGE,
        value=Decimal('20.00'),
        min_order_value=Decimal('30.00'),
        is_active=True
    )
    Discount.objects.create(
        code='MEMZO50',
        description='$50 Flat Instant Promotional Discount',
        discount_type=Discount.DiscountType.FIXED,
        value=Decimal('50.00'),
        min_order_value=Decimal('50.00'),
        is_active=True
    )
    Discount.objects.create(
        code='GROWTH15',
        description='15% Growth Stage Coupon',
        discount_type=Discount.DiscountType.PERCENTAGE,
        value=Decimal('15.00'),
        min_order_value=Decimal('50.00'),
        is_active=True
    )

    print("[*] Creating Software Products...")
    # 1. BrightBooks
    brightbooks = Product.objects.create(
        name='BrightBooks',
        slug='brightbooks',
        tagline='Automated Cloud Accounting & Enterprise Financial Intelligence',
        description='Effortlessly handle invoicing, double-entry bookkeeping, automated tax compliance, bank reconciliation, and real-time cash flow forecasting tailored for growing modern companies.',
        category='Finance & Accounting',
        icon='Calculator',
        badge='Most Popular',
        color='#10B981',
        rating=Decimal('4.9'),
        review_count=340,
        features=[
            'Automated invoice generation & reconciliation',
            'Multi-currency ledger & exchange sync',
            'AI-assisted expense classification',
            'Real-time P&L, balance sheet, and tax reports',
            'Stripe & banking live-sync integration'
        ]
    )

    # 2. StaffTrack
    stafftrack = Product.objects.create(
        name='StaffTrack',
        slug='stafftrack',
        tagline='Next-Gen Workforce Management, Payroll & People Analytics',
        description='Unify applicant tracking, employee onboarding, automated time tracking, PTO management, and global payroll processing in a single intuitive workspace.',
        category='Human Resources',
        icon='Users',
        badge='Top Rated',
        color='#6366F1',
        rating=Decimal('4.8'),
        review_count=215,
        features=[
            'Employee directory & automated self-onboarding',
            'One-click regional & international payroll',
            'Time-off, shift scheduling & attendance tracker',
            'Performance reviews and KPI dashboards',
            'Document signing and compliance storage'
        ]
    )

    # 3. StockMaster
    stockmaster = Product.objects.create(
        name='StockMaster',
        slug='stockmaster',
        tagline='Smart Multi-Warehouse Inventory & Supply Chain Automation',
        description='Eliminate stockouts and overselling with real-time stock sync across multiple channels, automated reorder triggers, serial/batch tracking, and supplier forecasting.',
        category='Supply Chain & Logistics',
        icon='Boxes',
        badge='Enterprise Choice',
        color='#F59E0B',
        rating=Decimal('4.9'),
        review_count=180,
        features=[
            'Multi-warehouse real-time quantity monitoring',
            'Barcode scanning and batch/lot expiration alerts',
            'Automated purchase order creation when stock drops',
            'Seamless B2B supplier catalog sync',
            'Advanced predictive demand analytics'
        ]
    )

    # 4. EduManage
    edumanage = Product.objects.create(
        name='EduManage',
        slug='edumanage',
        tagline='Unified Campus, Student Life & Academic Administration ERP',
        description='Modern digital portal for universities, K-12 schools, and corporate academies. Covers admissions, fee collection, gradebooks, attendance, and parent communication.',
        category='Education Technology',
        icon='GraduationCap',
        badge='Best Value',
        color='#06B6D4',
        rating=Decimal('4.7'),
        review_count=145,
        features=[
            'Student admissions and enrollment pipeline',
            'Automated tuition fee collection & receipts',
            'Digital attendance, timetable & exam scheduling',
            'Parent & student mobile-responsive portals',
            'Custom report card generator and gradebook'
        ]
    )

    # 5. ShopFlow
    shopflow = Product.objects.create(
        name='ShopFlow',
        slug='shopflow',
        tagline='Modern Retail Point-of-Sale, Omnichannel Orders & Loyalty',
        description='Power your retail stores and online storefronts simultaneously. Lightning-fast offline POS checkout, centralized loyalty rewards, gift cards, and unified customer profiles.',
        category='Retail & Commerce',
        icon='ShoppingBag',
        badge='New Release',
        color='#EC4899',
        rating=Decimal('4.9'),
        review_count=98,
        features=[
            'High-speed touch-friendly Cloud POS interface',
            'Unified loyalty points and customer reward tiers',
            'Online and in-store inventory synchronization',
            'Split payments, refunds, and digital receipts',
            'Daily store sales and register closure auditing'
        ]
    )

    print("[*] Creating Subscription Plans for Products...")
    products = [brightbooks, stafftrack, stockmaster, edumanage, shopflow]

    plan_templates = [
        {
            'name': 'Starter',
            'monthly_price': Decimal('29.00'),
            'annual_price': Decimal('290.00'),
            'features': ['Up to 5 team members', 'Core feature set', 'Standard email support', '10GB cloud storage', 'Weekly automated backups'],
            'is_popular': False
        },
        {
            'name': 'Professional',
            'monthly_price': Decimal('79.00'),
            'annual_price': Decimal('790.00'),
            'features': ['Up to 25 team members', 'Advanced analytics & reporting', 'Priority 24/7 support', '100GB cloud storage', 'Custom API webhooks', 'Automated workflows'],
            'is_popular': True
        },
        {
            'name': 'Enterprise',
            'monthly_price': Decimal('199.00'),
            'annual_price': Decimal('1990.00'),
            'features': ['Unlimited team members', 'Dedicated account manager', '99.99% uptime SLA', 'Unlimited storage', 'Custom SSO & SAML', 'Custom integrations'],
            'is_popular': False
        }
    ]

    all_plans = []
    for prod in products:
        for tpl in plan_templates:
            # Monthly plan
            p_month = SubscriptionPlan.objects.create(
                product=prod,
                name=f"{tpl['name']}",
                billing_cycle=SubscriptionPlan.BillingCycle.MONTHLY,
                price=tpl['monthly_price'],
                trial_days=14,
                features=tpl['features'],
                is_popular=tpl['is_popular'],
                is_active=True
            )
            # Annual plan
            p_annual = SubscriptionPlan.objects.create(
                product=prod,
                name=f"{tpl['name']}",
                billing_cycle=SubscriptionPlan.BillingCycle.ANNUALLY,
                price=tpl['annual_price'],
                trial_days=30,
                features=tpl['features'],
                is_popular=False,
                is_active=True
            )
            all_plans.extend([p_month, p_annual])

    print("[*] Seeding Subscriptions, Invoices & Payments for realistic analytics...")
    today = timezone.now().date()

    # Sub 1: Customer (Michael) -> BrightBooks Professional Monthly (Active)
    bb_pro_month = SubscriptionPlan.objects.get(product=brightbooks, name='Professional', billing_cycle=SubscriptionPlan.BillingCycle.MONTHLY)
    sub1 = Subscription.objects.create(
        customer=customer,
        plan=bb_pro_month,
        status=Subscription.Status.ACTIVE,
        start_date=today - timedelta(days=20),
        end_date=today + timedelta(days=10),
        auto_renew=True
    )
    SubscriptionItem.objects.create(
        subscription=sub1,
        description=f"{brightbooks.name} - Professional Monthly",
        quantity=1,
        unit_price=bb_pro_month.price
    )
    inv1 = Invoice.objects.create(
        invoice_number="INV-2026-00001",
        customer=customer,
        subscription=sub1,
        issue_date=today - timedelta(days=20),
        due_date=today - timedelta(days=6),
        subtotal=Decimal('79.00'),
        discount_amount=Decimal('0.00'),
        tax_amount=Decimal('7.90'),
        total_amount=Decimal('86.90'),
        status=Invoice.Status.PAID,
        notes="Automated recurring subscription charge."
    )
    InvoiceItem.objects.create(
        invoice=inv1,
        description="BrightBooks Professional Subscription",
        quantity=1,
        unit_price=Decimal('79.00'),
        total=Decimal('79.00')
    )
    Payment.objects.create(
        invoice=inv1,
        customer=customer,
        amount=Decimal('86.90'),
        payment_method=Payment.Method.CARD,
        card_last_four='4242',
        transaction_id=f"TXN-{uuid.uuid4().hex[:10].upper()}",
        status=Payment.Status.COMPLETED
    )

    # Sub 2: Elena -> StaffTrack Enterprise Annual (Active)
    st_ent_annual = SubscriptionPlan.objects.get(product=stafftrack, name='Enterprise', billing_cycle=SubscriptionPlan.BillingCycle.ANNUALLY)
    sub2 = Subscription.objects.create(
        customer=customer2,
        plan=st_ent_annual,
        status=Subscription.Status.ACTIVE,
        start_date=today - timedelta(days=60),
        end_date=today + timedelta(days=305),
        auto_renew=True
    )
    SubscriptionItem.objects.create(
        subscription=sub2,
        description=f"{stafftrack.name} - Enterprise Annual",
        quantity=1,
        unit_price=st_ent_annual.price
    )
    inv2 = Invoice.objects.create(
        invoice_number="INV-2026-00002",
        customer=customer2,
        subscription=sub2,
        issue_date=today - timedelta(days=60),
        due_date=today - timedelta(days=46),
        subtotal=Decimal('1990.00'),
        discount_amount=Decimal('398.00'), # 20% discount applied
        tax_amount=Decimal('159.20'),
        total_amount=Decimal('1751.20'),
        status=Invoice.Status.PAID,
        notes="Annual enterprise package with VIP onboarding."
    )
    InvoiceItem.objects.create(
        invoice=inv2,
        description="StaffTrack Enterprise Annual License",
        quantity=1,
        unit_price=Decimal('1990.00'),
        total=Decimal('1990.00')
    )
    Payment.objects.create(
        invoice=inv2,
        customer=customer2,
        amount=Decimal('1751.20'),
        payment_method=Payment.Method.CARD,
        card_last_four='8819',
        transaction_id=f"TXN-{uuid.uuid4().hex[:10].upper()}",
        status=Payment.Status.COMPLETED
    )

    # Sub 3: David -> StockMaster Starter Monthly (Active)
    sm_starter_month = SubscriptionPlan.objects.get(product=stockmaster, name='Starter', billing_cycle=SubscriptionPlan.BillingCycle.MONTHLY)
    sub3 = Subscription.objects.create(
        customer=customer3,
        plan=sm_starter_month,
        status=Subscription.Status.ACTIVE,
        start_date=today - timedelta(days=15),
        end_date=today + timedelta(days=15),
        auto_renew=True
    )
    SubscriptionItem.objects.create(
        subscription=sub3,
        description=f"{stockmaster.name} - Starter Monthly",
        quantity=1,
        unit_price=sm_starter_month.price
    )
    inv3 = Invoice.objects.create(
        invoice_number="INV-2026-00003",
        customer=customer3,
        subscription=sub3,
        issue_date=today - timedelta(days=15),
        due_date=today - timedelta(days=1),
        subtotal=Decimal('29.00'),
        discount_amount=Decimal('0.00'),
        tax_amount=Decimal('2.90'),
        total_amount=Decimal('31.90'),
        status=Invoice.Status.PAID,
        notes="StockMaster Single-Warehouse Starter"
    )
    InvoiceItem.objects.create(
        invoice=inv3,
        description="StockMaster Starter Plan",
        quantity=1,
        unit_price=Decimal('29.00'),
        total=Decimal('29.00')
    )
    Payment.objects.create(
        invoice=inv3,
        customer=customer3,
        amount=Decimal('31.90'),
        payment_method=Payment.Method.CARD,
        card_last_four='1142',
        transaction_id=f"TXN-{uuid.uuid4().hex[:10].upper()}",
        status=Payment.Status.COMPLETED
    )

    # Sub 4: Customer (Michael) -> ShopFlow Growth (Pending Invoice)
    sf_pro_month = SubscriptionPlan.objects.get(product=shopflow, name='Professional', billing_cycle=SubscriptionPlan.BillingCycle.MONTHLY)
    inv4 = Invoice.objects.create(
        invoice_number="INV-2026-00004",
        customer=customer,
        issue_date=today - timedelta(days=2),
        due_date=today + timedelta(days=12),
        subtotal=Decimal('79.00'),
        discount_amount=Decimal('0.00'),
        tax_amount=Decimal('7.90'),
        total_amount=Decimal('86.90'),
        status=Invoice.Status.UNPAID,
        notes="Additional POS terminal license add-on invoice."
    )
    InvoiceItem.objects.create(
        invoice=inv4,
        description="ShopFlow Retail POS Add-on Station",
        quantity=1,
        unit_price=Decimal('79.00'),
        total=Decimal('79.00')
    )

    print("[*] Creating Sample Quotations...")
    quote1 = Quotation.objects.create(
        quotation_number="QT-2026-0001",
        customer=customer,
        created_by=staff,
        title="Custom Multi-Site EduManage Deployment",
        valid_until=today + timedelta(days=25),
        subtotal=Decimal('1580.00'),
        discount_amount=Decimal('158.00'),
        tax_amount=Decimal('142.20'),
        total_amount=Decimal('1564.20'),
        status=Quotation.Status.SENT,
        notes="Includes 3 campus satellite synchronizers and dedicated data migration assistance."
    )
    QuotationItem.objects.create(
        quotation=quote1,
        product=edumanage,
        description="EduManage Campus Annual License (3 Sites)",
        quantity=3,
        unit_price=Decimal('400.00'),
        total=Decimal('1200.00')
    )
    QuotationItem.objects.create(
        quotation=quote1,
        description="Dedicated Data Migration & Staff Training",
        quantity=1,
        unit_price=Decimal('380.00'),
        total=Decimal('380.00')
    )

    print("[*] Creating Initial Notifications...")
    Notification.objects.create(
        user=admin,
        title="Welcome to MEMZO System",
        message="MEMZO platform initialized with 5 software products, 30 subscription tiers, and live telemetry.",
        notification_type=Notification.NotificationType.INFO,
        link="/admin"
    )
    Notification.objects.create(
        user=admin,
        title="New Enterprise Subscription",
        message="Elena Rostova (Lumina Digital Systems) subscribed to StaffTrack Enterprise Annual ($1,751.20).",
        notification_type=Notification.NotificationType.SUCCESS,
        link="/admin/subscriptions"
    )
    Notification.objects.create(
        user=staff,
        title="New Quote Dispatched",
        message="Quotation QT-2026-0001 was dispatched to Michael Chang (Apex Enterprises).",
        notification_type=Notification.NotificationType.INFO,
        link="/staff/quotations"
    )
    Notification.objects.create(
        user=customer,
        title="BrightBooks Subscription Active",
        message="Your BrightBooks Professional plan is active. Next billing on " + (today + timedelta(days=10)).strftime("%b %d, %Y"),
        notification_type=Notification.NotificationType.SUCCESS,
        link="/customer/subscriptions"
    )

    print("[+] Database seeding completed successfully!")
    print("\n" + "="*50)
    print("DEMO ACCOUNTS READY:")
    print("Admin:    admin    / password123")
    print("Staff:    staff    / password123")
    print("Customer: customer / password123")
    print("="*50 + "\n")

if __name__ == '__main__':
    run_seed()
