import unittest
from decimal import Decimal
from datetime import date
from app import create_app
from config import TestConfig
from extensions import db
from models import User, Product, TaxRule, Discount, Invoice
from services.invoice_service import create_invoice, confirm_invoice
from services.payment_service import record_payment


class InvoicesTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        self.customer = User(name="Invoice Test Customer", email="inv_cust@test.com", role="customer")
        self.customer.set_password("Password123!")

        self.product = Product(product_name="EduManage ERP", sales_price=Decimal("100.00"), is_published=True)
        
        # 10% tax rule
        self.tax = TaxRule(tax_name="VAT 10%", tax_percentage=Decimal("10.00"), is_active=True)
        
        # 20% discount
        self.discount = Discount(
            discount_name="DISC20",
            discount_type="Percentage",
            discount_value=Decimal("20.00"),
            is_active=True
        )

        db.session.add_all([self.customer, self.product, self.tax, self.discount])
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_invoice_creation_tax_and_discount(self):
        # Subtotal: 100 * 2 = 200.00
        # Discount (20% of 200): 40.00 -> Net: 160.00
        # Tax (10% of 160): 16.00
        # Total: 160 + 16 = 176.00
        inv = create_invoice(
            customer_id=self.customer.user_id,
            items=[{"product_id": self.product.product_id, "quantity": 2, "unit_price": Decimal("100.00")}],
            discount_code="DISC20",
            status="Draft"
        )

        self.assertEqual(inv.subtotal, Decimal("200.00"))
        self.assertEqual(inv.discount_amount, Decimal("40.00"))
        self.assertEqual(inv.tax_amount, Decimal("16.00"))
        self.assertEqual(inv.total_amount, Decimal("176.00"))
        self.assertEqual(inv.status, "Draft")

        # Confirm invoice
        ok, msg = confirm_invoice(inv.invoice_id)
        self.assertTrue(ok)
        self.assertEqual(inv.status, "Confirmed")

    def test_partial_and_full_payment_balance(self):
        inv = create_invoice(
            customer_id=self.customer.user_id,
            items=[{"product_id": self.product.product_id, "quantity": 1, "unit_price": Decimal("100.00")}],
            status="Confirmed"
        )
        # Without discount, subtotal=100.00, tax=10.00, total=110.00
        self.assertEqual(inv.total_amount, Decimal("110.00"))
        self.assertEqual(inv.outstanding_amount, Decimal("110.00"))

        # 1. Partial Payment of $50.00
        ok, msg, p1 = record_payment(
            invoice_id=inv.invoice_id,
            customer_id=self.customer.user_id,
            amount=Decimal("50.00"),
            status="Successful"
        )
        self.assertTrue(ok)
        db.session.refresh(inv)
        self.assertEqual(inv.amount_paid, Decimal("50.00"))
        self.assertEqual(inv.outstanding_amount, Decimal("60.00"))
        self.assertEqual(inv.status, "Confirmed")  # Still Confirmed because not fully paid

        # 2. Final Payment of $60.00
        ok2, msg2, p2 = record_payment(
            invoice_id=inv.invoice_id,
            customer_id=self.customer.user_id,
            amount=Decimal("60.00"),
            status="Successful"
        )
        self.assertTrue(ok2)
        db.session.refresh(inv)
        self.assertEqual(inv.amount_paid, Decimal("110.00"))
        self.assertEqual(inv.outstanding_amount, Decimal("0.00"))
        self.assertEqual(inv.status, "Paid")  # Transitioned to Paid!


if __name__ == "__main__":
    unittest.main()
