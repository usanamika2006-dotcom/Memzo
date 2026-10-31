from datetime import date, timedelta
from decimal import Decimal
from flask import render_template, redirect, url_for, flash, request, abort
from flask_login import current_user
from extensions import db
from models import (
    User, Product, ProductVariant, Plan, Subscription,
    Quotation, QuotationItem, Invoice, Payment, Notification
)
from forms import QuotationForm, PaymentForm, ProfileForm
from decorators import staff_required
from blueprints.staff import staff_bp
from utils import generate_quotation_number
from services.report_service import get_staff_dashboard_metrics
from services.invoice_service import confirm_invoice
from services.payment_service import record_payment
from services.notification_service import get_user_notifications, mark_as_read


@staff_bp.route("/dashboard")
@staff_required
def dashboard():
    metrics = get_staff_dashboard_metrics()
    return render_template("staff/dashboard.html", metrics=metrics)


# ================= CUSTOMERS =================
@staff_bp.route("/customers")
@staff_required
def customers():
    search = request.args.get("q", "").strip()
    query = User.query.filter_by(role="customer")
    if search:
        query = query.filter(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))

    customers_list = query.order_by(User.created_at.desc()).all()
    return render_template("staff/customers.html", customers=customers_list, search=search)


@staff_bp.route("/customers/<int:customer_id>")
@staff_required
def customer_detail(customer_id):
    customer = User.query.filter_by(user_id=customer_id, role="customer").first_or_404()
    subscriptions = Subscription.query.filter_by(customer_id=customer.user_id).order_by(Subscription.created_at.desc()).all()
    invoices = Invoice.query.filter_by(customer_id=customer.user_id).order_by(Invoice.created_at.desc()).all()
    payments = Payment.query.filter_by(customer_id=customer.user_id).order_by(Payment.payment_date.desc()).all()
    quotations = Quotation.query.filter_by(customer_id=customer.user_id).order_by(Quotation.created_at.desc()).all()

    return render_template(
        "staff/customer_detail.html",
        customer=customer,
        subscriptions=subscriptions,
        invoices=invoices,
        payments=payments,
        quotations=quotations
    )


# ================= SUBSCRIPTIONS =================
@staff_bp.route("/subscriptions")
@staff_required
def subscriptions():
    status_filter = request.args.get("status", "")
    query = Subscription.query
    if status_filter:
        query = query.filter_by(status=status_filter)

    all_subs = query.order_by(Subscription.created_at.desc()).all()
    return render_template("staff/subscriptions.html", subscriptions=all_subs, status_filter=status_filter)


@staff_bp.route("/subscriptions/<int:subscription_id>")
@staff_required
def subscription_detail(subscription_id):
    subscription = Subscription.query.get_or_404(subscription_id)
    return render_template("staff/subscription_detail.html", subscription=subscription)


# ================= QUOTATIONS =================
@staff_bp.route("/quotations")
@staff_required
def quotations():
    all_quotes = Quotation.query.order_by(Quotation.created_at.desc()).all()
    return render_template("staff/quotations.html", quotations=all_quotes)


@staff_bp.route("/quotations/add", methods=["GET", "POST"])
@staff_required
def quotation_add():
    form = QuotationForm()
    customers = User.query.filter_by(role="customer", is_active=True).all()
    products = Product.query.filter_by(is_archived=False).all()

    form.customer_id.choices = [(c.user_id, f"{c.name} ({c.email})") for c in customers]
    form.product_id.choices = [(p.product_id, f"{p.product_name} - Base ${p.sales_price}") for p in products]
    form.variant_id.choices = [(0, "None / Base Product")]

    if request.method == "GET" and products:
        form.valid_until.data = date.today() + timedelta(days=30)

    if form.validate_on_submit():
        product = Product.query.get(form.product_id.data)
        qty = form.quantity.data
        unit_price = form.unit_price.data
        subtotal = unit_price * Decimal(str(qty))

        quote = Quotation(
            quotation_number=generate_quotation_number(),
            customer_id=form.customer_id.data,
            quotation_date=date.today(),
            valid_until=form.valid_until.data,
            subtotal=subtotal,
            tax_amount=Decimal("0.00"),
            discount_amount=Decimal("0.00"),
            total_amount=subtotal,
            status="Draft"
        )
        db.session.add(quote)
        db.session.flush()

        q_item = QuotationItem(
            quotation_id=quote.quotation_id,
            product_id=product.product_id,
            quantity=qty,
            unit_price=unit_price,
            tax_amount=Decimal("0.00"),
            total_amount=subtotal
        )
        db.session.add(q_item)
        db.session.commit()

        flash(f"Quotation #{quote.quotation_number} generated.", "success")
        return redirect(url_for("staff.quotations"))

    return render_template("staff/quotation_form.html", form=form, title="Create Quotation")


# ================= INVOICES =================
@staff_bp.route("/invoices")
@staff_required
def invoices():
    status_filter = request.args.get("status", "")
    query = Invoice.query
    if status_filter:
        query = query.filter_by(status=status_filter)

    all_invoices = query.order_by(Invoice.created_at.desc()).all()
    return render_template("staff/invoices.html", invoices=all_invoices, status_filter=status_filter)


@staff_bp.route("/invoices/<int:invoice_id>")
@staff_required
def invoice_detail(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    form = PaymentForm()
    form.amount.data = invoice.outstanding_amount
    return render_template("staff/invoice_detail.html", invoice=invoice, form=form)


@staff_bp.route("/invoices/<int:invoice_id>/confirm", methods=["POST"])
@staff_required
def invoice_confirm_route(invoice_id):
    ok, msg = confirm_invoice(invoice_id)
    flash(msg, "success" if ok else "warning")
    return redirect(url_for("staff.invoice_detail", invoice_id=invoice_id))


# ================= PAYMENTS =================
@staff_bp.route("/payments", methods=["GET", "POST"])
@staff_required
def payments():
    all_payments = Payment.query.order_by(Payment.payment_date.desc()).all()
    return render_template("staff/payments.html", payments=all_payments)


@staff_bp.route("/invoices/<int:invoice_id>/pay", methods=["POST"])
@staff_required
def record_invoice_payment(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    form = PaymentForm()
    if form.validate_on_submit():
        ok, msg, payment = record_payment(
            invoice_id=invoice.invoice_id,
            customer_id=invoice.customer_id,
            amount=form.amount.data,
            payment_method=form.payment_method.data,
            notes=form.notes.data,
            status="Successful"
        )
        flash(msg, "success" if ok else "danger")
    return redirect(url_for("staff.invoice_detail", invoice_id=invoice.invoice_id))


# ================= NOTIFICATIONS & PROFILE =================
@staff_bp.route("/notifications")
@staff_required
def notifications():
    notifs = get_user_notifications(current_user.user_id, limit=50)
    return render_template("staff/notifications.html", notifications=notifs)


@staff_bp.route("/notifications/<int:notification_id>/read", methods=["POST"])
@staff_required
def notification_read(notification_id):
    mark_as_read(notification_id, current_user.user_id)
    return redirect(url_for("staff.notifications"))


@staff_bp.route("/profile", methods=["GET", "POST"])
@staff_required
def profile():
    form = ProfileForm(obj=current_user)
    if form.validate_on_submit():
        current_user.name = form.name.data.strip()
        current_user.phone = form.phone.data.strip() if form.phone.data else None
        if form.new_password.data:
            current_user.set_password(form.new_password.data)
        db.session.commit()
        flash("Profile updated successfully.", "success")
        return redirect(url_for("staff.profile"))

    return render_template("staff/profile.html", form=form)
