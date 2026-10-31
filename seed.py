import os
from datetime import datetime, date, timedelta
from decimal import Decimal
from app import create_app
from extensions import db
from models import (
    User, Product, ProductVariant, Plan, Subscription, SubscriptionItem,
    Quotation, QuotationItem, TaxRule, Discount, Invoice, InvoiceItem,
    Payment, Notification, SystemSetting
)
from utils import generate_subscription_number, generate_invoice_number, generate_quotation_number, generate_transaction_ref


def seed_database():
    app = create_app()
    with app.app_context():
        # Ensure database tables exist
        db.create_all()

        print("[MEMZO] Checking database contents...")

        # 1. Admin Account
        admin = User.query.filter_by(email="admin@memzo.com").first()
        if not admin:
            admin = User(
                name="Admin Director",
                email="admin@memzo.com",
                role="admin",
                phone="+1 (555) 019-2834",
                is_active=True
            )
            admin.set_password("Admin@Password123")
            db.session.add(admin)
            print("  Created Admin: admin@memzo.com / Admin@Password123")
        else:
            print("  Admin already exists.")

        # 2. Staff Account
        staff = User.query.filter_by(email="staff@memzo.com").first()
        if not staff:
            staff = User(
                name="Sarah Jenkins (Operations)",
                email="staff@memzo.com",
                role="staff",
                phone="+1 (555) 019-5829",
                is_active=True
            )
            staff.set_password("Staff@Password123")
            db.session.add(staff)
            print("  Created Staff: staff@memzo.com / Staff@Password123")
        else:
            print("  Staff already exists.")

        # 3. Customer Accounts
        customer = User.query.filter_by(email="customer@memzo.com").first()
        if not customer:
            customer = User(
                name="David Miller",
                email="customer@memzo.com",
                role="customer",
                phone="+1 (555) 482-1920",
                is_active=True
            )
            customer.set_password("Customer@Password123")
            db.session.add(customer)
            print("  Created Customer: customer@memzo.com / Customer@Password123")

        customer2 = User.query.filter_by(email="emma@clientcorp.io").first()
        if not customer2:
            customer2 = User(
                name="Emma Watson",
                email="emma@clientcorp.io",
                role="customer",
                phone="+1 (555) 304-9182",
                is_active=True
            )
            customer2.set_password("Customer@Password123")
            db.session.add(customer2)

        db.session.commit()

        # 4. Tax Rules
        if TaxRule.query.count() == 0:
            tax1 = TaxRule(tax_name="Standard Software VAT (10%)", tax_percentage=Decimal("10.00"), is_active=True)
            tax2 = TaxRule(tax_name="Digital Sales Tax (2%)", tax_percentage=Decimal("2.00"), is_active=False)
            db.session.add_all([tax1, tax2])
            print("  Created Tax Rules.")

        # 5. Discounts
        if Discount.query.count() == 0:
            disc1 = Discount(
                discount_name="WELCOME20",
                discount_type="Percentage",
                discount_value=Decimal("20.00"),
                minimum_purchase=Decimal("25.00"),
                minimum_quantity=1,
                usage_limit=500,
                used_count=12,
                is_active=True
            )
            disc2 = Discount(
                discount_name="SAVE50",
                discount_type="Fixed",
                discount_value=Decimal("50.00"),
                minimum_purchase=Decimal("150.00"),
                minimum_quantity=1,
                usage_limit=100,
                used_count=5,
                is_active=True
            )
            disc3 = Discount(
                discount_name="SPRING10",
                discount_type="Percentage",
                discount_value=Decimal("10.00"),
                minimum_purchase=Decimal("15.00"),
                minimum_quantity=1,
                is_active=True
            )
            db.session.add_all([disc1, disc2, disc3])
            print("  Created Discount Promo Rules.")

        # 6. Software Products & Variants & Plans
        if Product.query.count() == 0:
            p1 = Product(
                product_name="BrightBooks Accounting",
                description="Comprehensive cloud financial software with automated bookkeeping, GST/VAT tax compliance, cashflow tracking, and multi-currency bank reconciliation.",
                product_type="Cloud SaaS",
                sales_price=Decimal("29.00"),
                cost_price=Decimal("6.50"),
                notes="Flagship accounting software for SMBs and financial firms.",
                is_published=True
            )
            p2 = Product(
                product_name="StaffTrack HR Suite",
                description="Modern employee management platform featuring automated payroll, shift scheduling, performance reviews, time tracking, and leave management.",
                product_type="Cloud SaaS",
                sales_price=Decimal("39.00"),
                cost_price=Decimal("8.00"),
                notes="HR and workforce automation solution.",
                is_published=True
            )
            p3 = Product(
                product_name="StockMaster Inventory ERP",
                description="Enterprise warehouse management with real-time barcode scanning, purchase orders, reorder thresholds, and supply chain tracking.",
                product_type="Enterprise Suite",
                sales_price=Decimal("59.00"),
                cost_price=Decimal("12.00"),
                notes="High demand product for logistics and e-commerce.",
                is_published=True
            )
            p4 = Product(
                product_name="EduManage Campus System",
                description="Complete digital school and university management platform: student admissions, grade books, fees, virtual classrooms, and parent portal.",
                product_type="Cloud SaaS",
                sales_price=Decimal("79.00"),
                cost_price=Decimal("15.00"),
                notes="Specialized software for academies and schools.",
                is_published=True
            )
            p5 = Product(
                product_name="ShopFlow Retail POS",
                description="Next-generation omnichannel point-of-sale software: offline checkout sync, contactless payments, customer loyalty, and unified receipts.",
                product_type="Desktop Software",
                sales_price=Decimal("49.00"),
                cost_price=Decimal("10.00"),
                notes="Retail and boutique checkout solution.",
                is_published=True
            )
            p6 = Product(
                product_name="CloudPulse Observability",
                description="Real-time application performance monitoring, automated anomaly detection, microservice metrics, and uptime alerting for engineering teams.",
                product_type="API Service",
                sales_price=Decimal("35.00"),
                cost_price=Decimal("5.00"),
                notes="Developer and DevOps tooling platform.",
                is_published=True
            )

            db.session.add_all([p1, p2, p3, p4, p5, p6])
            db.session.flush()

            # Add Variants
            v1_1 = ProductVariant(product_id=p1.product_id, variant_name="Standard Edition", additional_price=Decimal("0.00"), description="Single company entity up to 3 users.")
            v1_2 = ProductVariant(product_id=p1.product_id, variant_name="Pro Multi-Entity", additional_price=Decimal("15.00"), description="Up to 5 business entities and unlimited users.")
            v1_3 = ProductVariant(product_id=p1.product_id, variant_name="Enterprise CPA Suite", additional_price=Decimal("35.00"), description="Dedicated accountant portal and API access.")

            v2_1 = ProductVariant(product_id=p2.product_id, variant_name="Team Edition (up to 25 seats)", additional_price=Decimal("0.00"))
            v2_2 = ProductVariant(product_id=p2.product_id, variant_name="Growth Edition (up to 100 seats)", additional_price=Decimal("25.00"))
            v2_3 = ProductVariant(product_id=p2.product_id, variant_name="Unlimited Enterprise", additional_price=Decimal("60.00"))

            v3_1 = ProductVariant(product_id=p3.product_id, variant_name="Single Depot Edition", additional_price=Decimal("0.00"))
            v3_2 = ProductVariant(product_id=p3.product_id, variant_name="Multi-Warehouse Mesh", additional_price=Decimal("40.00"))

            db.session.add_all([v1_1, v1_2, v1_3, v2_1, v2_2, v2_3, v3_1, v3_2])
            db.session.flush()

            # Add Plans
            plans = [
                Plan(product_id=p1.product_id, plan_name="BrightBooks Monthly", billing_cycle="Monthly", price=Decimal("29.00"), minimum_quantity=1, allow_renew=True, allow_pause=True, allow_early_close=True, is_active=True),
                Plan(product_id=p1.product_id, plan_name="BrightBooks Annual (Save 20%)", billing_cycle="Yearly", price=Decimal("278.00"), minimum_quantity=1, allow_renew=True, allow_pause=True, allow_early_close=True, is_active=True),
                Plan(product_id=p2.product_id, plan_name="StaffTrack Monthly Team", billing_cycle="Monthly", price=Decimal("39.00"), minimum_quantity=1, allow_renew=True, allow_pause=True, allow_early_close=True, is_active=True),
                Plan(product_id=p2.product_id, plan_name="StaffTrack Annual Pro", billing_cycle="Yearly", price=Decimal("390.00"), minimum_quantity=1, allow_renew=True, allow_pause=True, allow_early_close=True, is_active=True),
                Plan(product_id=p3.product_id, plan_name="StockMaster Monthly Growth", billing_cycle="Monthly", price=Decimal("59.00"), minimum_quantity=1, allow_renew=True, allow_pause=True, allow_early_close=True, is_active=True),
                Plan(product_id=p4.product_id, plan_name="EduManage Academic Semester", billing_cycle="Monthly", price=Decimal("79.00"), minimum_quantity=1, allow_renew=True, allow_pause=True, allow_early_close=True, is_active=True),
                Plan(product_id=p5.product_id, plan_name="ShopFlow Monthly Register", billing_cycle="Monthly", price=Decimal("49.00"), minimum_quantity=1, allow_renew=True, allow_pause=True, allow_early_close=True, is_active=True),
                Plan(product_id=p6.product_id, plan_name="CloudPulse DevOps Monthly", billing_cycle="Monthly", price=Decimal("35.00"), minimum_quantity=1, allow_renew=True, allow_pause=True, allow_early_close=True, is_active=True),
            ]
            db.session.add_all(plans)
            db.session.flush()
            print("  Created Software Products, Variants, and Subscription Plans.")

        db.session.commit()

        # 7. Seed Sample Live Data (Subscriptions, Invoices, Payments, Quotations)
        if Subscription.query.count() == 0:
            plan_bb = Plan.query.filter_by(plan_name="BrightBooks Monthly").first()
            plan_st = Plan.query.filter_by(plan_name="StaffTrack Monthly Team").first()

            if plan_bb and customer:
                # Sub 1: Active
                sub1 = Subscription(
                    subscription_number=generate_subscription_number(),
                    customer_id=customer.user_id,
                    plan_id=plan_bb.plan_id,
                    start_date=datetime.utcnow() - timedelta(days=15),
                    expiry_date=datetime.utcnow() + timedelta(days=15),
                    payment_terms="Immediate",
                    status="Active"
                )
                db.session.add(sub1)
                db.session.flush()

                item1 = SubscriptionItem(
                    subscription_id=sub1.subscription_id,
                    product_id=plan_bb.product_id,
                    quantity=1,
                    unit_price=plan_bb.price,
                    tax_amount=Decimal("2.90"),
                    total_amount=plan_bb.price
                )
                db.session.add(item1)

                # Invoice 1: Paid
                inv1 = Invoice(
                    invoice_number=generate_invoice_number(),
                    subscription_id=sub1.subscription_id,
                    customer_id=customer.user_id,
                    invoice_date=date.today() - timedelta(days=15),
                    due_date=date.today() - timedelta(days=1),
                    subtotal=Decimal("29.00"),
                    tax_amount=Decimal("2.90"),
                    discount_amount=Decimal("0.00"),
                    total_amount=Decimal("31.90"),
                    status="Paid"
                )
                db.session.add(inv1)
                db.session.flush()

                inv_item1 = InvoiceItem(
                    invoice_id=inv1.invoice_id,
                    product_id=plan_bb.product_id,
                    quantity=1,
                    unit_price=Decimal("29.00"),
                    tax_amount=Decimal("2.90"),
                    total_amount=Decimal("29.00")
                )
                db.session.add(inv_item1)

                pay1 = Payment(
                    invoice_id=inv1.invoice_id,
                    customer_id=customer.user_id,
                    amount=Decimal("31.90"),
                    payment_method="Simulated Credit Card",
                    payment_date=datetime.utcnow() - timedelta(days=15),
                    transaction_reference=generate_transaction_ref("SIM-SET"),
                    status="Successful",
                    notes="Automated billing cycle settlement"
                )
                db.session.add(pay1)

            if plan_st and customer2:
                # Sub 2: Active for customer2
                sub2 = Subscription(
                    subscription_number=generate_subscription_number(),
                    customer_id=customer2.user_id,
                    plan_id=plan_st.plan_id,
                    start_date=datetime.utcnow() - timedelta(days=5),
                    expiry_date=datetime.utcnow() + timedelta(days=25),
                    payment_terms="Immediate",
                    status="Active"
                )
                db.session.add(sub2)
                db.session.flush()

                item2 = SubscriptionItem(
                    subscription_id=sub2.subscription_id,
                    product_id=plan_st.product_id,
                    quantity=2,
                    unit_price=plan_st.price,
                    tax_amount=Decimal("7.80"),
                    total_amount=Decimal("78.00")
                )
                db.session.add(item2)

                # Invoice 2: Confirmed with pending payment
                inv2 = Invoice(
                    invoice_number=generate_invoice_number(),
                    subscription_id=sub2.subscription_id,
                    customer_id=customer2.user_id,
                    invoice_date=date.today() - timedelta(days=5),
                    due_date=date.today() + timedelta(days=9),
                    subtotal=Decimal("78.00"),
                    tax_amount=Decimal("7.80"),
                    discount_amount=Decimal("0.00"),
                    total_amount=Decimal("85.80"),
                    status="Confirmed"
                )
                db.session.add(inv2)
                db.session.flush()

                inv_item2 = InvoiceItem(
                    invoice_id=inv2.invoice_id,
                    product_id=plan_st.product_id,
                    quantity=2,
                    unit_price=plan_st.price,
                    tax_amount=Decimal("7.80"),
                    total_amount=Decimal("78.00")
                )
                db.session.add(inv_item2)

            # Sample Quotation
            p_erp = Product.query.filter_by(product_name="StockMaster Inventory ERP").first()
            if p_erp and customer:
                quo = Quotation(
                    quotation_number=generate_quotation_number(),
                    customer_id=customer.user_id,
                    quotation_date=date.today(),
                    valid_until=date.today() + timedelta(days=30),
                    subtotal=Decimal("590.00"),
                    tax_amount=Decimal("59.00"),
                    discount_amount=Decimal("50.00"),
                    total_amount=Decimal("599.00"),
                    status="Sent"
                )
                db.session.add(quo)
                db.session.flush()

                q_item = QuotationItem(
                    quotation_id=quo.quotation_id,
                    product_id=p_erp.product_id,
                    quantity=10,
                    unit_price=Decimal("59.00"),
                    tax_amount=Decimal("59.00"),
                    total_amount=Decimal("590.00")
                )
                db.session.add(q_item)

            # Sample Notification
            n1 = Notification(
                user_id=customer.user_id,
                message="Welcome to MEMZO! Your BrightBooks Accounting subscription is active.",
                notification_type="subscription_created",
                is_read=False
            )
            db.session.add(n1)

            print("  Created initial subscriptions, invoices, payments, and quotations.")

        # 8. Settings
        default_settings = {
            "company_name": "MEMZO Technologies Inc.",
            "company_email": "billing@memzo.com",
            "support_email": "support@memzo.com",
            "default_currency": "USD ($)",
            "invoice_prefix": "INV",
            "auto_renew_enabled": "true",
            "trial_period_days": "14"
        }
        for k, v in default_settings.items():
            if not SystemSetting.query.get(k):
                db.session.add(SystemSetting(setting_key=k, setting_value=v))

        db.session.commit()
        print("[MEMZO] Database successfully seeded and ready!")


if __name__ == "__main__":
    seed_database()
