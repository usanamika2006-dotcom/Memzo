import unittest
from app import create_app
from config import TestConfig
from extensions import db
from models import User
from utils import validate_password_strength


class AuthTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_password_strength_validation(self):
        # Too short
        ok, _ = validate_password_strength("Short1!")
        self.assertFalse(ok)

        # No uppercase
        ok, _ = validate_password_strength("lowercase123!")
        self.assertFalse(ok)

        # No lowercase
        ok, _ = validate_password_strength("UPPERCASE123!")
        self.assertFalse(ok)

        # No special character
        ok, _ = validate_password_strength("ValidPassword123")
        self.assertFalse(ok)

        # Valid strong password
        ok, _ = validate_password_strength("ValidPassword123!")
        self.assertTrue(ok)

    def test_customer_registration_and_login(self):
        # Register new customer
        response = self.client.post("/register", data={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "phone": "+15551234567",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!"
        }, follow_redirects=True)
        self.assertEqual(response.status_code, 200)

        # Verify in database
        user = User.query.filter_by(email="jane@example.com").first()
        self.assertIsNotNone(user)
        self.assertEqual(user.role, "customer")
        self.assertTrue(user.check_password("StrongPassword123!"))

        # Logout
        self.client.get("/logout", follow_redirects=True)

        # Login
        login_res = self.client.post("/login", data={
            "email": "jane@example.com",
            "password": "StrongPassword123!"
        }, follow_redirects=True)
        self.assertEqual(login_res.status_code, 200)
        self.assertIn(b"Jane Doe", login_res.data)

    def test_duplicate_email_prevention(self):
        user = User(name="First User", email="dup@example.com", role="customer")
        user.set_password("Password123!")
        db.session.add(user)
        db.session.commit()

        # Attempt to register with duplicate email
        response = self.client.post("/register", data={
            "name": "Second User",
            "email": "dup@example.com",
            "phone": "+15551234567",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!"
        }, follow_redirects=True)
        self.assertIn(b"already exists", response.data)


if __name__ == "__main__":
    unittest.main()
