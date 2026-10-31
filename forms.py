from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import (
    StringField,
    PasswordField,
    BooleanField,
    SubmitField,
    TextAreaField,
    DecimalField,
    IntegerField,
    SelectField,
    DateField
)
from wtforms.validators import (
    DataRequired,
    Email,
    EqualTo,
    Length,
    Optional,
    NumberRange,
    ValidationError
)
from models import User
from utils import validate_password_strength


class LoginForm(FlaskForm):
    email = StringField("Email Address", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    remember_me = BooleanField("Remember Me")
    submit = SubmitField("Sign In")


class RegisterForm(FlaskForm):
    name = StringField("Full Name", validators=[DataRequired(), Length(min=2, max=120)])
    email = StringField("Email Address", validators=[DataRequired(), Email(), Length(max=120)])
    phone = StringField("Phone Number", validators=[Optional(), Length(max=30)])
    password = PasswordField("Password", validators=[DataRequired()])
    confirm_password = PasswordField(
        "Confirm Password",
        validators=[DataRequired(), EqualTo("password", message="Passwords must match.")]
    )
    submit = SubmitField("Create Account")

    def validate_email(self, field):
        if User.query.filter_by(email=field.data.strip().lower()).first():
            raise ValidationError("An account with this email address already exists.")

    def validate_password(self, field):
        is_strong, msg = validate_password_strength(field.data)
        if not is_strong:
            raise ValidationError(msg)


class ForgotPasswordForm(FlaskForm):
    email = StringField("Email Address", validators=[DataRequired(), Email()])
    submit = SubmitField("Request Password Reset")


class ResetPasswordForm(FlaskForm):
    password = PasswordField("New Password", validators=[DataRequired()])
    confirm_password = PasswordField(
        "Confirm New Password",
        validators=[DataRequired(), EqualTo("password", message="Passwords must match.")]
    )
    submit = SubmitField("Set New Password")

    def validate_password(self, field):
        is_strong, msg = validate_password_strength(field.data)
        if not is_strong:
            raise ValidationError(msg)


class ProductForm(FlaskForm):
    product_name = StringField("Product Name", validators=[DataRequired(), Length(max=150)])
    description = TextAreaField("Description", validators=[Optional()])
    product_type = SelectField(
        "Product Type",
        choices=[
            ("Cloud SaaS", "Cloud SaaS Platform"),
            ("Desktop Software", "Desktop Software"),
            ("API Service", "API Service & SDK"),
            ("Enterprise Suite", "Enterprise Suite"),
            ("Mobile Platform", "Mobile App Platform"),
        ],
        default="Cloud SaaS"
    )
    sales_price = DecimalField("Base Sales Price ($)", places=2, validators=[DataRequired(), NumberRange(min=0)])
    cost_price = DecimalField("Cost Price ($)", places=2, validators=[Optional(), NumberRange(min=0)], default=0.0)
    notes = TextAreaField("Internal Notes", validators=[Optional()])
    image = FileField("Product Cover Image", validators=[Optional(), FileAllowed(["jpg", "jpeg", "png", "webp"], "Images only!")])
    is_published = BooleanField("Publish to Catalogue", default=True)
    submit = SubmitField("Save Product")


class ProductVariantForm(FlaskForm):
    variant_name = StringField("Variant Name", validators=[DataRequired(), Length(max=120)])
    additional_price = DecimalField("Additional Price ($)", places=2, validators=[DataRequired(), NumberRange(min=0)], default=0.0)
    description = TextAreaField("Variant Details", validators=[Optional()])
    submit = SubmitField("Save Variant")


class PlanForm(FlaskForm):
    product_id = SelectField("Select Product", coerce=int, validators=[DataRequired()])
    plan_name = StringField("Plan Name", validators=[DataRequired(), Length(max=120)])
    billing_cycle = SelectField(
        "Billing Cycle",
        choices=[
            ("Monthly", "Monthly"),
            ("Yearly", "Yearly"),
            ("Weekly", "Weekly"),
            ("Daily", "Daily"),
        ],
        default="Monthly"
    )
    price = DecimalField("Plan Price ($)", places=2, validators=[DataRequired(), NumberRange(min=0)])
    minimum_quantity = IntegerField("Minimum Quantity", default=1, validators=[DataRequired(), NumberRange(min=1)])
    available_from = DateField("Available From", validators=[Optional()])
    available_until = DateField("Available Until", validators=[Optional()])
    auto_close = BooleanField("Auto-Close Upon Expiry", default=False)
    allow_early_close = BooleanField("Allow Early Cancellation", default=True)
    allow_pause = BooleanField("Allow Pausing", default=True)
    allow_renew = BooleanField("Allow Self Renewal", default=True)
    is_active = BooleanField("Active Plan", default=True)
    submit = SubmitField("Save Plan")


class StaffForm(FlaskForm):
    name = StringField("Full Name", validators=[DataRequired(), Length(min=2, max=120)])
    email = StringField("Email Address", validators=[DataRequired(), Email(), Length(max=120)])
    phone = StringField("Phone Number", validators=[Optional(), Length(max=30)])
    password = PasswordField("Password", validators=[Optional()])
    is_active = BooleanField("Account Active", default=True)
    submit = SubmitField("Save Staff Member")


class QuotationForm(FlaskForm):
    customer_id = SelectField("Customer", coerce=int, validators=[DataRequired()])
    product_id = SelectField("Product", coerce=int, validators=[DataRequired()])
    variant_id = SelectField("Variant (Optional)", coerce=int, validators=[Optional()])
    quantity = IntegerField("Quantity", default=1, validators=[DataRequired(), NumberRange(min=1)])
    unit_price = DecimalField("Unit Price ($)", places=2, validators=[DataRequired(), NumberRange(min=0)])
    valid_until = DateField("Quotation Valid Until", validators=[DataRequired()])
    discount_code = StringField("Discount Code", validators=[Optional(), Length(max=50)])
    notes = TextAreaField("Notes / Scope", validators=[Optional()])
    submit = SubmitField("Create Quotation")


class DiscountForm(FlaskForm):
    discount_name = StringField("Promo Code / Name", validators=[DataRequired(), Length(max=100)])
    discount_type = SelectField(
        "Discount Type",
        choices=[("Percentage", "Percentage (%)"), ("Fixed", "Fixed Amount ($)")],
        default="Percentage"
    )
    discount_value = DecimalField("Discount Value", places=2, validators=[DataRequired(), NumberRange(min=0.01)])
    minimum_purchase = DecimalField("Minimum Purchase ($)", places=2, validators=[Optional(), NumberRange(min=0)], default=0.0)
    minimum_quantity = IntegerField("Minimum Quantity", default=1, validators=[DataRequired(), NumberRange(min=1)])
    start_date = DateField("Start Date", validators=[Optional()])
    end_date = DateField("End Date", validators=[Optional()])
    usage_limit = IntegerField("Usage Limit (Leave empty for unlimited)", validators=[Optional(), NumberRange(min=1)])
    is_active = BooleanField("Active", default=True)
    submit = SubmitField("Save Discount")


class TaxRuleForm(FlaskForm):
    tax_name = StringField("Tax Rule Name", validators=[DataRequired(), Length(max=80)])
    tax_percentage = DecimalField("Tax Percentage (%)", places=2, validators=[DataRequired(), NumberRange(min=0, max=100)])
    is_active = BooleanField("Active", default=True)
    submit = SubmitField("Save Tax Rule")


class PaymentForm(FlaskForm):
    amount = DecimalField("Payment Amount ($)", places=2, validators=[DataRequired(), NumberRange(min=0.01)])
    payment_method = SelectField(
        "Payment Method",
        choices=[
            ("Simulated Credit Card", "Simulated Credit Card (Visa/Mastercard)"),
            ("Simulated Bank Transfer", "Simulated Direct Bank Transfer"),
            ("Simulated Corporate Wallet", "Simulated Corporate Account"),
        ],
        default="Simulated Credit Card"
    )
    notes = TextAreaField("Payment Reference / Notes", validators=[Optional()])
    submit = SubmitField("Record Payment")


class ProfileForm(FlaskForm):
    name = StringField("Full Name", validators=[DataRequired(), Length(min=2, max=120)])
    phone = StringField("Phone Number", validators=[Optional(), Length(max=30)])
    new_password = PasswordField("New Password (Leave blank to keep current)", validators=[Optional()])
    confirm_password = PasswordField(
        "Confirm New Password",
        validators=[EqualTo("new_password", message="Passwords must match.")]
    )
    submit = SubmitField("Update Profile")

    def validate_new_password(self, field):
        if field.data:
            is_strong, msg = validate_password_strength(field.data)
            if not is_strong:
                raise ValidationError(msg)


class CheckoutForm(FlaskForm):
    plan_id = SelectField("Select Subscription Plan", coerce=int, validators=[DataRequired()])
    variant_id = SelectField("Select Edition / Variant (Optional)", coerce=int, validators=[Optional()])
    quantity = IntegerField("Seats / Quantity", default=1, validators=[DataRequired(), NumberRange(min=1)])
    discount_code = StringField("Promo / Discount Code", validators=[Optional(), Length(max=50)])
    payment_method = SelectField(
        "Payment Method",
        choices=[
            ("Simulated Credit Card", "Simulated Card (Instant Activation)"),
            ("Simulated Bank Transfer", "Simulated Direct Wire"),
        ],
        default="Simulated Credit Card"
    )
    submit = SubmitField("Complete Subscription Purchase")
