from datetime import datetime, date
from decimal import Decimal
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from extensions import db, login_manager


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User(UserMixin, db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="customer")  # 'admin', 'staff', 'customer'
    phone = db.Column(db.String(30), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    subscriptions = db.relationship("Subscription", back_populates="customer", cascade="all, delete-orphan")
    quotations = db.relationship("Quotation", back_populates="customer", cascade="all, delete-orphan")
    invoices = db.relationship("Invoice", back_populates="customer", cascade="all, delete-orphan")
    payments = db.relationship("Payment", back_populates="customer", cascade="all, delete-orphan")
    notifications = db.relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    def get_id(self):
        return str(self.user_id)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self):
        return self.role == "admin"

    @property
    def is_staff(self):
        return self.role == "staff"

    @property
    def is_customer(self):
        return self.role == "customer"

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"


class Product(db.Model):
    __tablename__ = "products"

    product_id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    product_type = db.Column(db.String(80), nullable=True, default="Cloud SaaS")
    sales_price = db.Column(db.Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    cost_price = db.Column(db.Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    notes = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(255), nullable=True)
    is_published = db.Column(db.Boolean, default=True, nullable=False, index=True)
    is_archived = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    variants = db.relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    plans = db.relationship("Plan", back_populates="product", cascade="all, delete-orphan")
    subscription_items = db.relationship("SubscriptionItem", back_populates="product")
    quotation_items = db.relationship("QuotationItem", back_populates="product")
    invoice_items = db.relationship("InvoiceItem", back_populates="product")

    @property
    def active_plans(self):
        return [p for p in self.plans if p.is_active]

    def __repr__(self):
        return f"<Product {self.product_name}>"


class ProductVariant(db.Model):
    __tablename__ = "product_variants"

    variant_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.product_id"), nullable=False)
    variant_name = db.Column(db.String(120), nullable=False)
    additional_price = db.Column(db.Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    description = db.Column(db.Text, nullable=True)

    product = db.relationship("Product", back_populates="variants")

    def __repr__(self):
        return f"<Variant {self.variant_name} (+${self.additional_price})>"


class Plan(db.Model):
    __tablename__ = "plans"

    plan_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.product_id"), nullable=False)
    plan_name = db.Column(db.String(120), nullable=False)
    billing_cycle = db.Column(db.String(20), nullable=False, default="Monthly")  # 'Daily', 'Weekly', 'Monthly', 'Yearly'
    price = db.Column(db.Numeric(10, 2), nullable=False)
    minimum_quantity = db.Column(db.Integer, default=1, nullable=False)
    available_from = db.Column(db.Date, nullable=True)
    available_until = db.Column(db.Date, nullable=True)
    auto_close = db.Column(db.Boolean, default=False, nullable=False)
    allow_early_close = db.Column(db.Boolean, default=True, nullable=False)
    allow_pause = db.Column(db.Boolean, default=True, nullable=False)
    allow_renew = db.Column(db.Boolean, default=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    product = db.relationship("Product", back_populates="plans")
    subscriptions = db.relationship("Subscription", back_populates="plan")

    def __repr__(self):
        return f"<Plan {self.plan_name} (${self.price}/{self.billing_cycle})>"


class Subscription(db.Model):
    __tablename__ = "subscriptions"

    subscription_id = db.Column(db.Integer, primary_key=True)
    subscription_number = db.Column(db.String(64), unique=True, nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey("plans.plan_id"), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False)
    payment_terms = db.Column(db.String(50), default="Immediate", nullable=False)
    status = db.Column(db.String(30), nullable=False, default="Active")  # 'Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    customer = db.relationship("User", back_populates="subscriptions")
    plan = db.relationship("Plan", back_populates="subscriptions")
    items = db.relationship("SubscriptionItem", back_populates="subscription", cascade="all, delete-orphan")
    invoices = db.relationship("Invoice", back_populates="subscription")

    @property
    def is_expired(self):
        return datetime.utcnow() > self.expiry_date

    @property
    def total_amount(self):
        return sum(item.total_amount for item in self.items)

    def __repr__(self):
        return f"<Subscription {self.subscription_number} ({self.status})>"


class SubscriptionItem(db.Model):
    __tablename__ = "subscription_items"

    item_id = db.Column(db.Integer, primary_key=True)
    subscription_id = db.Column(db.Integer, db.ForeignKey("subscriptions.subscription_id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.product_id"), nullable=False)
    variant_id = db.Column(db.Integer, db.ForeignKey("product_variants.variant_id"), nullable=True)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)

    subscription = db.relationship("Subscription", back_populates="items")
    product = db.relationship("Product", back_populates="subscription_items")
    variant = db.relationship("ProductVariant")


class Quotation(db.Model):
    __tablename__ = "quotations"

    quotation_id = db.Column(db.Integer, primary_key=True)
    quotation_number = db.Column(db.String(64), unique=True, nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    quotation_date = db.Column(db.Date, default=date.today, nullable=False)
    valid_until = db.Column(db.Date, nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    discount_amount = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    status = db.Column(db.String(30), default="Draft", nullable=False)  # 'Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    customer = db.relationship("User", back_populates="quotations")
    items = db.relationship("QuotationItem", back_populates="quotation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Quotation {self.quotation_number} ({self.status})>"


class QuotationItem(db.Model):
    __tablename__ = "quotation_items"

    item_id = db.Column(db.Integer, primary_key=True)
    quotation_id = db.Column(db.Integer, db.ForeignKey("quotations.quotation_id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.product_id"), nullable=False)
    variant_id = db.Column(db.Integer, db.ForeignKey("product_variants.variant_id"), nullable=True)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)

    quotation = db.relationship("Quotation", back_populates="items")
    product = db.relationship("Product", back_populates="quotation_items")
    variant = db.relationship("ProductVariant")


class TaxRule(db.Model):
    __tablename__ = "tax_rules"

    tax_id = db.Column(db.Integer, primary_key=True)
    tax_name = db.Column(db.String(80), nullable=False)
    tax_percentage = db.Column(db.Numeric(5, 2), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<TaxRule {self.tax_name} ({self.tax_percentage}%)>"


class Discount(db.Model):
    __tablename__ = "discounts"

    discount_id = db.Column(db.Integer, primary_key=True)
    discount_name = db.Column(db.String(100), unique=True, nullable=False)
    discount_type = db.Column(db.String(20), nullable=False)  # 'Fixed' or 'Percentage'
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    minimum_purchase = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    minimum_quantity = db.Column(db.Integer, default=1, nullable=False)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    usage_limit = db.Column(db.Integer, nullable=True)
    used_count = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def is_valid_for(self, amount, quantity=1):
        if not self.is_active:
            return False, "Discount code is inactive."
        today = date.today()
        if self.start_date and today < self.start_date:
            return False, "Discount is not yet active."
        if self.end_date and today > self.end_date:
            return False, "Discount has expired."
        if self.usage_limit is not None and self.used_count >= self.usage_limit:
            return False, "Discount usage limit reached."
        if Decimal(str(amount)) < self.minimum_purchase:
            return False, f"Minimum purchase amount of ${self.minimum_purchase:.2f} required."
        if quantity < self.minimum_quantity:
            return False, f"Minimum quantity of {self.minimum_quantity} required."
        return True, "Valid"

    def calculate_discount(self, amount):
        amount_dec = Decimal(str(amount))
        if self.discount_type == "Percentage":
            calc = (amount_dec * (self.discount_value / Decimal("100.0"))).quantize(Decimal("0.01"))
            return min(calc, amount_dec)
        else:
            return min(self.discount_value, amount_dec)

    def __repr__(self):
        return f"<Discount {self.discount_name} ({self.discount_type} {self.discount_value})>"


class Invoice(db.Model):
    __tablename__ = "invoices"

    invoice_id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(64), unique=True, nullable=False, index=True)
    subscription_id = db.Column(db.Integer, db.ForeignKey("subscriptions.subscription_id"), nullable=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    invoice_date = db.Column(db.Date, default=date.today, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    discount_amount = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    status = db.Column(db.String(30), default="Draft", nullable=False)  # 'Draft', 'Confirmed', 'Paid'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    subscription = db.relationship("Subscription", back_populates="invoices")
    customer = db.relationship("User", back_populates="invoices")
    items = db.relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    payments = db.relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")

    @property
    def amount_paid(self):
        try:
            val = db.session.query(
                db.func.coalesce(db.func.sum(Payment.amount), Decimal("0.00"))
            ).filter(
                Payment.invoice_id == self.invoice_id,
                Payment.status == "Successful"
            ).scalar()
            return Decimal(str(val))
        except Exception:
            successful_payments = [
                p.amount for p in self.payments if p.status == "Successful"
            ]
            return sum(successful_payments, Decimal("0.00"))

    @property
    def outstanding_amount(self):
        bal = self.total_amount - self.amount_paid
        return max(Decimal("0.00"), bal)

    @property
    def is_overdue(self):
        if self.status != "Paid" and self.due_date < date.today() and self.outstanding_amount > 0:
            return True
        return False

    def __repr__(self):
        return f"<Invoice {self.invoice_number} ({self.status})>"


class InvoiceItem(db.Model):
    __tablename__ = "invoice_items"

    item_id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey("invoices.invoice_id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.product_id"), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)

    invoice = db.relationship("Invoice", back_populates="items")
    product = db.relationship("Product", back_populates="invoice_items")


class Payment(db.Model):
    __tablename__ = "payments"

    payment_id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey("invoices.invoice_id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50), default="Simulated Credit Card", nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    transaction_reference = db.Column(db.String(100), unique=True, nullable=False, index=True)
    status = db.Column(db.String(30), default="Successful", nullable=False)  # 'Pending', 'Successful', 'Failed'
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    invoice = db.relationship("Invoice", back_populates="payments")
    customer = db.relationship("User", back_populates="payments")

    def __repr__(self):
        return f"<Payment {self.transaction_reference} (${self.amount} - {self.status})>"


class Notification(db.Model):
    __tablename__ = "notifications"

    notification_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), default="info", nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification #{self.notification_id} for User {self.user_id}>"


class SystemSetting(db.Model):
    __tablename__ = "system_settings"

    setting_key = db.Column(db.String(50), primary_key=True)
    setting_value = db.Column(db.Text, nullable=True)
    description = db.Column(db.String(200), nullable=True)

    def __repr__(self):
        return f"<Setting {self.setting_key}={self.setting_value}>"
