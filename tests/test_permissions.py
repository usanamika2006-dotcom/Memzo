import unittest
from app import create_app
from config import TestConfig
from extensions import db
from models import User, Subscription, Invoice, Plan, Product
from datetime import datetime, date, timedelta


class PermissionsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        # Create Admin
        self.admin = User(name="Admin", email="admin@test.com", role="admin")
        self.admin.set_password("AdminPass123!")

        # Create Staff
        self.staff = User(name="Staff", email="staff@test.com", role="staff")
        self.staff.set_password("StaffPass123!")

        # Create Customer 1
        self.cust1 = User(name="Customer 1", email="cust1@test.com", role="customer")
        self.cust1.set_password("CustPass123!")

        # Create Customer 2
        self.cust2 = User(name="Customer 2", email="cust2@test.com", role="customer")
        self.cust2.set_password("CustPass123!")

        db.session.add_all([self.admin, self.staff, self.cust1, self.cust2])
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def login(self, email, password):
        return self.client.post("/login", data={"email": email, "password": password}, follow_redirects=True)

    def logout(self):
        return self.client.get("/logout", follow_redirects=True)

    def test_admin_access(self):
        self.login("admin@test.com", "AdminPass123!")
        res = self.client.get("/admin/dashboard")
        self.assertEqual(res.status_code, 200)

    def test_staff_cannot_access_admin_dashboard(self):
        self.login("staff@test.com", "StaffPass123!")
        res = self.client.get("/admin/dashboard")
        self.assertEqual(res.status_code, 403)

    def test_customer_cannot_access_admin_or_staff(self):
        self.login("cust1@test.com", "CustPass123!")
        res_admin = self.client.get("/admin/dashboard")
        self.assertEqual(res_admin.status_code, 403)

        res_staff = self.client.get("/staff/dashboard")
        self.assertEqual(res_staff.status_code, 403)

    def test_customer_ownership_isolation(self):
        # Create an invoice belonging to customer 2
        inv2 = Invoice(
            invoice_number="INV-TEST-002",
            customer_id=self.cust2.user_id,
            invoice_date=date.today(),
            due_date=date.today() + timedelta(days=14),
            total_amount=100.0,
            status="Confirmed"
        )
        db.session.add(inv2)
        db.session.commit()

        # Login as customer 1 and attempt to access customer 2's invoice
        self.login("cust1@test.com", "CustPass123!")
        res = self.client.get(f"/customer/invoices/{inv2.invoice_id}")
        self.assertEqual(res.status_code, 404)


if __name__ == "__main__":
    unittest.main()
