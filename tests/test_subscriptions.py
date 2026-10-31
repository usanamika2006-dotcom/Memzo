import unittest
from decimal import Decimal
from datetime import datetime, timedelta
from app import create_app
from config import TestConfig
from extensions import db
from models import User, Product, Plan, Subscription
from services.subscription_service import create_subscription, renew_subscription, close_subscription


class SubscriptionsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        self.customer = User(name="Test Customer", email="sub_cust@test.com", role="customer")
        self.customer.set_password("Password123!")
        
        self.product = Product(
            product_name="BrightBooks Cloud",
            sales_price=Decimal("29.00"),
            is_published=True
        )
        db.session.add_all([self.customer, self.product])
        db.session.flush()

        self.plan_monthly = Plan(
            product_id=self.product.product_id,
            plan_name="Monthly Tier",
            billing_cycle="Monthly",
            price=Decimal("29.00"),
            minimum_quantity=1,
            allow_renew=True,
            allow_early_close=True,
            is_active=True
        )
        self.plan_yearly = Plan(
            product_id=self.product.product_id,
            plan_name="Annual Tier",
            billing_cycle="Yearly",
            price=Decimal("290.00"),
            minimum_quantity=1,
            allow_renew=True,
            allow_early_close=False,
            is_active=True
        )
        db.session.add_all([self.plan_monthly, self.plan_yearly])
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_subscription_creation_and_expiry_calculation(self):
        start = datetime(2026, 1, 1, 12, 0, 0)
        ok, msg, sub = create_subscription(
            customer_id=self.customer.user_id,
            plan_id=self.plan_monthly.plan_id,
            quantity=2,
            start_date=start
        )
        self.assertTrue(ok)
        self.assertEqual(sub.status, "Active")
        # Monthly cycle = +30 days
        expected_expiry = start + timedelta(days=30)
        self.assertEqual(sub.expiry_date, expected_expiry)
        # Quantity calculation: 29.00 * 2 = 58.00
        self.assertEqual(sub.total_amount, Decimal("58.00"))

    def test_subscription_renewal(self):
        start = datetime.utcnow()
        _, _, sub = create_subscription(
            customer_id=self.customer.user_id,
            plan_id=self.plan_monthly.plan_id,
            start_date=start
        )
        initial_expiry = sub.expiry_date

        # Renew
        ok, msg = renew_subscription(sub.subscription_id)
        self.assertTrue(ok)
        db.session.refresh(sub)
        self.assertGreater(sub.expiry_date, initial_expiry)

    def test_subscription_closure_permission(self):
        _, _, sub_yearly = create_subscription(
            customer_id=self.customer.user_id,
            plan_id=self.plan_yearly.plan_id
        )
        # Plan yearly disallows customer early close
        ok, msg = close_subscription(sub_yearly.subscription_id, is_admin=False)
        self.assertFalse(ok)
        self.assertEqual(sub_yearly.status, "Active")

        # Admin close override
        ok_admin, msg_admin = close_subscription(sub_yearly.subscription_id, is_admin=True)
        self.assertTrue(ok_admin)
        self.assertEqual(sub_yearly.status, "Closed")


if __name__ == "__main__":
    unittest.main()
