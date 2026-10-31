import unittest
from decimal import Decimal
from app import create_app
from config import TestConfig
from extensions import db
from models import User, Product


class ProductsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        self.admin = User(name="Admin", email="admin@test.com", role="admin")
        self.admin.set_password("AdminPass123!")
        db.session.add(self.admin)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def login_admin(self):
        return self.client.post("/login", data={"email": "admin@test.com", "password": "AdminPass123!"}, follow_redirects=True)

    def test_product_lifecycle_and_visibility(self):
        self.login_admin()

        # 1. Create Product
        res = self.client.post("/admin/products/add", data={
            "product_name": "Test Cloud ERP",
            "product_type": "Cloud SaaS",
            "sales_price": "49.00",
            "cost_price": "10.00",
            "description": "Enterprise cloud ERP system.",
            "is_published": True
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)

        product = Product.query.filter_by(product_name="Test Cloud ERP").first()
        self.assertIsNotNone(product)
        self.assertTrue(product.is_published)

        # 2. Public Storefront Visibility
        pub_res = self.client.get("/products")
        self.assertIn(b"Test Cloud ERP", pub_res.data)

        # 3. Unpublish Product
        self.client.post(f"/admin/products/{product.product_id}/publish", follow_redirects=True)
        db.session.refresh(product)
        self.assertFalse(product.is_published)

        # 4. Hidden from Public Storefront
        pub_res2 = self.client.get("/products")
        self.assertNotIn(b"Test Cloud ERP", pub_res2.data)

        # 5. Public Product Detail returns 404 when unpublished
        detail_res = self.client.get(f"/products/{product.product_id}")
        self.assertEqual(detail_res.status_code, 404)


if __name__ == "__main__":
    unittest.main()
