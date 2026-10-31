from flask import render_template, redirect, url_for, flash, request, abort
from flask_login import current_user
from extensions import db
from models import User, Subscription, Invoice, Payment, Notification, Quotation
from forms import ProfileForm, PaymentForm
from decorators import customer_required
from blueprints.customer import customer_bp
from services.report_service import get_customer_dashboard_metrics
from services.subscription_service import renew_subscription, close_subscription
from services.payment_service import record_payment
from services.notification_service import get_user_notifications, mark_as_read, mark_all_as_read


@customer_bp.route("/dashboard")
@customer_required
def dashboard():
    metrics = get_customer_dashboard_metrics(current_user.user_id)
    return render_template("customer/dashboard.html", metrics=metrics)


# ================= SUBSCRIPTIONS =================
@customer_bp.route("/subscriptions")
@customer_required
def subscriptions():
    user_subs = Subscription.query.filter_by(
        customer_id=current_user.user_id
    ).order_by(Subscription.created_at.desc()).all()
    return render_template("customer/subscriptions.html", subscriptions=user_subs)


@customer_bp.route("/subscriptions/<int:subscription_id>")
@customer_required
def subscription_detail(subscription_id):
    subscription = Subscription.query.filter_by(
        subscription_id=subscription_id,
        customer_id=current_user.user_id
    ).first_or_404()
    return render_template("customer/subscription_detail.html", subscription=subscription)


@customer_bp.route("/subscriptions/<int:subscription_id>/renew", methods=["POST"])
@customer_required
def subscription_renew(subscription_id):
    subscription = Subscription.query.filter_by(
        subscription_id=subscription_id,
        customer_id=current_user.user_id
    ).first_or_404()

    ok, msg = renew_subscription(subscription.subscription_id)
    flash(msg, "success" if ok else "warning")
    return redirect(url_for("customer.subscription_detail", subscription_id=subscription.subscription_id))


@customer_bp.route("/subscriptions/<int:subscription_id>/close", methods=["POST"])
@customer_required
def subscription_close(subscription_id):
    subscription = Subscription.query.filter_by(
        subscription_id=subscription_id,
        customer_id=current_user.user_id
    ).first_or_404()

    ok, msg = close_subscription(subscription.subscription_id, is_admin=False)
    flash(msg, "info" if ok else "warning")
    return redirect(url_for("customer.subscription_detail", subscription_id=subscription.subscription_id))


# ================= INVOICES =================
@customer_bp.route("/invoices")
@customer_required
def invoices():
    user_invoices = Invoice.query.filter_by(
        customer_id=current_user.user_id
    ).order_by(Invoice.created_at.desc()).all()
    return render_template("customer/invoices.html", invoices=user_invoices)


@customer_bp.route("/invoices/<int:invoice_id>")
@customer_required
def invoice_detail(invoice_id):
    invoice = Invoice.query.filter_by(
        invoice_id=invoice_id,
        customer_id=current_user.user_id
    ).first_or_404()

    form = PaymentForm()
    form.amount.data = invoice.outstanding_amount
    return render_template("customer/invoice_detail.html", invoice=invoice, form=form)


@customer_bp.route("/invoices/<int:invoice_id>/pay", methods=["POST"])
@customer_required
def invoice_pay(invoice_id):
    invoice = Invoice.query.filter_by(
        invoice_id=invoice_id,
        customer_id=current_user.user_id
    ).first_or_404()

    form = PaymentForm()
    if form.validate_on_submit():
        ok, msg, payment = record_payment(
            invoice_id=invoice.invoice_id,
            customer_id=current_user.user_id,
            amount=form.amount.data,
            payment_method=form.payment_method.data,
            notes=form.notes.data,
            status="Successful"
        )
        flash(msg, "success" if ok else "danger")
    return redirect(url_for("customer.invoice_detail", invoice_id=invoice.invoice_id))


# ================= PAYMENTS =================
@customer_bp.route("/payments")
@customer_required
def payments():
    user_payments = Payment.query.filter_by(
        customer_id=current_user.user_id
    ).order_by(Payment.payment_date.desc()).all()
    return render_template("customer/payments.html", payments=user_payments)


# ================= NOTIFICATIONS =================
@customer_bp.route("/notifications")
@customer_required
def notifications():
    notifs = get_user_notifications(current_user.user_id, limit=50)
    return render_template("customer/notifications.html", notifications=notifs)


@customer_bp.route("/notifications/<int:notification_id>/read", methods=["POST"])
@customer_required
def notification_read(notification_id):
    mark_as_read(notification_id, current_user.user_id)
    return redirect(url_for("customer.notifications"))


@customer_bp.route("/notifications/read-all", methods=["POST"])
@customer_required
def notifications_read_all():
    mark_all_as_read(current_user.user_id)
    flash("All notifications marked as read.", "info")
    return redirect(url_for("customer.notifications"))


# ================= PROFILE =================
@customer_bp.route("/profile", methods=["GET", "POST"])
@customer_required
def profile():
    form = ProfileForm(obj=current_user)
    if form.validate_on_submit():
        current_user.name = form.name.data.strip()
        current_user.phone = form.phone.data.strip() if form.phone.data else None
        if form.new_password.data:
            current_user.set_password(form.new_password.data)
        db.session.commit()
        flash("Your profile has been updated.", "success")
        return redirect(url_for("customer.profile"))

    return render_template("customer/profile.html", form=form)
