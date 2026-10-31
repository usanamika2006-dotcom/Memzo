import unittest
from decimal import Decimal
from app import create_app
from config import TestConfig
from extensions import db
from models import User, Product, Invoice, Payment
from services.invoice_service import create_invoice
from services.payment_service import record_payment


class PaymentsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        self.customer = User(name="Payment Customer", email="pay_test@test.com", role="customer")
        self.customer.set_password("Password123!")
        self.product = Product(product_name="Cloud SaaS", sales_price=Decimal("50.00"), is_published=True)
        db.session.add_all([self.customer, self.product])
        db.session.commit()

        self.inv = create_invoice(
            customer_id=self.customer.user_id,
            items=[{"product_id": self.product.product_id, "quantity": 1, "unit_price": Decimal("50.00")}],
            status="Confirmed"
        )

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_overpayment_rejection(self):
        # Invoice total is 50.00. Attempt payment of 100.00
        ok, msg, p = record_payment(
            invoice_id=self.inv.invoice_id,
            customer_id=self.customer.user_id,
            amount=Decimal("100.00"),
            status="Successful"
        )
        self.assertFalse(ok)
        self.assertIn("exceeds outstanding", msg)

    def test_failed_payment_does_not_settle_invoice(self):
        ok, msg, p = record_payment(
            invoice_id=self.inv.invoice_id,
            customer_id=self.customer.user_id,
            amount=Decimal("50.00"),
            status="Failed"
        )
        self.assertTrue(ok)
        db.session.refresh(self.inv)
        self.assertEqual(self.inv.amount_paid, Decimal("0.00"))
        self.assertEqual(self.inv.status, "Confirmed")

    def test_duplicate_transaction_reference_rejection(self):
        ok1, _, _ = record_payment(
            invoice_id=self.inv.invoice_id,
            customer_id=self.customer.user_id,
            amount=Decimal("20.00"),
            transaction_reference="TXN-DUP-001"
        )
        self.assertTrue(ok1)

        ok2, msg2, _ = record_payment(
            invoice_id=self.inv.invoice_id,
            customer_id=self.customer.user_id,
            amount=Decimal("20.00"),
            transaction_reference="TXN-DUP-001"
        )
        self.assertFalse(ok2)
        self.assertIn("already recorded", msg2)


if __name__ == "__main__":
    unittest.main()
