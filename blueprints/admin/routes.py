from datetime import datetime, date, timedelta
from decimal import Decimal
from flask import render_template, redirect, url_for, flash, request, abort, jsonify
from flask_login import current_user
from extensions import db
from models import (
    User, Product, ProductVariant, Plan, Subscription, SubscriptionItem,
    Quotation, QuotationItem, TaxRule, Discount, Invoice, InvoiceItem,
    Payment, SystemSetting, Notification
)
from forms import (
    ProductForm, ProductVariantForm, PlanForm, StaffForm,
    QuotationForm, DiscountForm, TaxRuleForm, PaymentForm
)
from decorators import admin_required
from blueprints.admin import admin_bp
from utils import save_image_file, generate_quotation_number
from services.report_service import get_admin_dashboard_metrics
from services.subscription_service import renew_subscription, close_subscription
from services.invoice_service import confirm_invoice
from services.payment_service import record_payment
from services.notification_service import create_notification


@admin_bp.route("/dashboard")
@admin_required
def dashboard():
    metrics = get_admin_dashboard_metrics()
    return render_template("admin/dashboard.html", metrics=metrics)


# ================= PRODUCTS & VARIANTS =================
@admin_bp.route("/products")
@admin_required
def products():
    search = request.args.get("q", "").strip()
    status_filter = request.args.get("status", "")

    query = Product.query
    if search:
        query = query.filter(Product.product_name.ilike(f"%{search}%"))
    if status_filter == "published":
        query = query.filter_by(is_published=True, is_archived=False)
    elif status_filter == "draft":
        query = query.filter_by(is_published=False, is_archived=False)
    elif status_filter == "archived":
        query = query.filter_by(is_archived=True)

    all_products = query.order_by(Product.created_at.desc()).all()
    return render_template("admin/products.html", products=all_products, search=search, status_filter=status_filter)


@admin_bp.route("/products/add", methods=["GET", "POST"])
@admin_required
def product_add():
    form = ProductForm()
    if form.validate_on_submit():
        image_path = None
        if form.image.data:
            image_path = save_image_file(form.image.data, "products")

        product = Product(
            product_name=form.product_name.data.strip(),
            description=form.description.data.strip() if form.description.data else "",
            product_type=form.product_type.data,
            sales_price=form.sales_price.data,
            cost_price=form.cost_price.data or Decimal("0.00"),
            notes=form.notes.data,
            image=image_path,
            is_published=form.is_published.data,
            is_archived=False
        )
        db.session.add(product)
        db.session.commit()
        flash(f"Software product '{product.product_name}' created successfully.", "success")
        return redirect(url_for("admin.products"))

    return render_template("admin/product_form.html", form=form, title="Add Software Product")


@admin_bp.route("/products/<int:product_id>/edit", methods=["GET", "POST"])
@admin_required
def product_edit(product_id):
    product = Product.query.get_or_404(product_id)
    form = ProductForm(obj=product)

    if form.validate_on_submit():
        if form.image.data:
            image_path = save_image_file(form.image.data, "products")
            if image_path:
                product.image = image_path

        product.product_name = form.product_name.data.strip()
        product.description = form.description.data.strip() if form.description.data else ""
        product.product_type = form.product_type.data
        product.sales_price = form.sales_price.data
        product.cost_price = form.cost_price.data or Decimal("0.00")
        product.notes = form.notes.data
        product.is_published = form.is_published.data

        db.session.commit()
        flash(f"Product '{product.product_name}' updated successfully.", "success")
        return redirect(url_for("admin.products"))

    return render_template("admin/product_form.html", form=form, title="Edit Software Product", product=product)


@admin_bp.route("/products/<int:product_id>/publish", methods=["POST"])
@admin_required
def product_toggle_publish(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_published = not product.is_published
    db.session.commit()
    state = "published" if product.is_published else "unpublished"
    flash(f"Product '{product.product_name}' is now {state}.", "info")
    return redirect(url_for("admin.products"))


@admin_bp.route("/products/<int:product_id>/archive", methods=["POST"])
@admin_required
def product_archive(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_archived = not product.is_archived
    db.session.commit()
    state = "archived" if product.is_archived else "restored"
    flash(f"Product '{product.product_name}' {state}.", "info")
    return redirect(url_for("admin.products"))


@admin_bp.route("/products/<int:product_id>/variants", methods=["GET", "POST"])
@admin_required
def product_variants(product_id):
    product = Product.query.get_or_404(product_id)
    form = ProductVariantForm()

    if form.validate_on_submit():
        variant = ProductVariant(
            product_id=product.product_id,
            variant_name=form.variant_name.data.strip(),
            additional_price=form.additional_price.data,
            description=form.description.data
        )
        db.session.add(variant)
        db.session.commit()
        flash(f"Variant '{variant.variant_name}' added.", "success")
        return redirect(url_for("admin.product_variants", product_id=product.product_id))

    variants = ProductVariant.query.filter_by(product_id=product.product_id).all()
    return render_template("admin/variants.html", product=product, variants=variants, form=form)


# ================= PLANS =================
@admin_bp.route("/plans")
@admin_required
def plans():
    all_plans = Plan.query.join(Product).order_by(Plan.created_at.desc()).all()
    return render_template("admin/plans.html", plans=all_plans)


@admin_bp.route("/plans/add", methods=["GET", "POST"])
@admin_required
def plan_add():
    form = PlanForm()
    products = Product.query.filter_by(is_archived=False).all()
    form.product_id.choices = [(p.product_id, p.product_name) for p in products]

    if form.validate_on_submit():
        plan = Plan(
            product_id=form.product_id.data,
            plan_name=form.plan_name.data.strip(),
            billing_cycle=form.billing_cycle.data,
            price=form.price.data,
            minimum_quantity=form.minimum_quantity.data,
            available_from=form.available_from.data,
            available_until=form.available_until.data,
            auto_close=form.auto_close.data,
            allow_early_close=form.allow_early_close.data,
            allow_pause=form.allow_pause.data,
            allow_renew=form.allow_renew.data,
            is_active=form.is_active.data
        )
        db.session.add(plan)
        db.session.commit()
        flash(f"Subscription plan '{plan.plan_name}' created.", "success")
        return redirect(url_for("admin.plans"))

    return render_template("admin/plan_form.html", form=form, title="Create Subscription Plan")


@admin_bp.route("/plans/<int:plan_id>/edit", methods=["GET", "POST"])
@admin_required
def plan_edit(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    form = PlanForm(obj=plan)
    products = Product.query.filter_by(is_archived=False).all()
    form.product_id.choices = [(p.product_id, p.product_name) for p in products]

    if form.validate_on_submit():
        plan.product_id = form.product_id.data
        plan.plan_name = form.plan_name.data.strip()
        plan.billing_cycle = form.billing_cycle.data
        plan.price = form.price.data
        plan.minimum_quantity = form.minimum_quantity.data
        plan.available_from = form.available_from.data
        plan.available_until = form.available_until.data
        plan.auto_close = form.auto_close.data
        plan.allow_early_close = form.allow_early_close.data
        plan.allow_pause = form.allow_pause.data
        plan.allow_renew = form.allow_renew.data
        plan.is_active = form.is_active.data

        db.session.commit()
        flash(f"Plan '{plan.plan_name}' updated.", "success")
        return redirect(url_for("admin.plans"))

    return render_template("admin/plan_form.html", form=form, title="Edit Subscription Plan", plan=plan)


@admin_bp.route("/plans/<int:plan_id>/toggle", methods=["POST"])
@admin_required
def plan_toggle(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    plan.is_active = not plan.is_active
    db.session.commit()
    flash(f"Plan '{plan.plan_name}' is now {'Active' if plan.is_active else 'Inactive'}.", "info")
    return redirect(url_for("admin.plans"))


# ================= STAFF MANAGEMENT =================
@admin_bp.route("/staff")
@admin_required
def staff():
    staff_members = User.query.filter_by(role="staff").order_by(User.created_at.desc()).all()
    return render_template("admin/staff.html", staff_members=staff_members)


@admin_bp.route("/staff/add", methods=["GET", "POST"])
@admin_required
def staff_add():
    form = StaffForm()
    if form.validate_on_submit():
        email = form.email.data.strip().lower()
        if User.query.filter_by(email=email).first():
            flash("User with this email already exists.", "danger")
            return render_template("admin/staff_form.html", form=form, title="Add Staff Account")

        if not form.password.data:
            flash("Password is required when creating a new Staff account.", "danger")
            return render_template("admin/staff_form.html", form=form, title="Add Staff Account")

        staff_user = User(
            name=form.name.data.strip(),
            email=email,
            phone=form.phone.data.strip() if form.phone.data else None,
            role="staff",
            is_active=form.is_active.data
        )
        staff_user.set_password(form.password.data)
        db.session.add(staff_user)
        db.session.commit()
        flash(f"Staff account for '{staff_user.name}' created.", "success")
        return redirect(url_for("admin.staff"))

    return render_template("admin/staff_form.html", form=form, title="Add Staff Account")


@admin_bp.route("/staff/<int:user_id>/edit", methods=["GET", "POST"])
@admin_required
def staff_edit(user_id):
    staff_user = User.query.filter_by(user_id=user_id, role="staff").first_or_404()
    form = StaffForm(obj=staff_user)

    if form.validate_on_submit():
        staff_user.name = form.name.data.strip()
        staff_user.phone = form.phone.data.strip() if form.phone.data else None
        staff_user.is_active = form.is_active.data
        if form.password.data:
            staff_user.set_password(form.password.data)

        db.session.commit()
        flash(f"Staff member '{staff_user.name}' updated.", "success")
        return redirect(url_for("admin.staff"))

    return render_template("admin/staff_form.html", form=form, title="Edit Staff Member", staff_user=staff_user)


@admin_bp.route("/staff/<int:user_id>/toggle", methods=["POST"])
@admin_required
def staff_toggle(user_id):
    staff_user = User.query.filter_by(user_id=user_id, role="staff").first_or_404()
    staff_user.is_active = not staff_user.is_active
    db.session.commit()
    flash(f"Staff account '{staff_user.name}' {'activated' if staff_user.is_active else 'suspended'}.", "info")
    return redirect(url_for("admin.staff"))


# ================= CUSTOMERS =================
@admin_bp.route("/customers")
@admin_required
def customers():
    search = request.args.get("q", "").strip()
    query = User.query.filter_by(role="customer")
    if search:
        query = query.filter(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))

    customers_list = query.order_by(User.created_at.desc()).all()
    return render_template("admin/customers.html", customers=customers_list, search=search)


@admin_bp.route("/customers/<int:customer_id>")
@admin_required
def customer_detail(customer_id):
    customer = User.query.filter_by(user_id=customer_id, role="customer").first_or_404()
    subscriptions = Subscription.query.filter_by(customer_id=customer.user_id).order_by(Subscription.created_at.desc()).all()
    invoices = Invoice.query.filter_by(customer_id=customer.user_id).order_by(Invoice.created_at.desc()).all()
    payments = Payment.query.filter_by(customer_id=customer.user_id).order_by(Payment.payment_date.desc()).all()
    quotations = Quotation.query.filter_by(customer_id=customer.user_id).order_by(Quotation.created_at.desc()).all()

    return render_template(
        "admin/customer_detail.html",
        customer=customer,
        subscriptions=subscriptions,
        invoices=invoices,
        payments=payments,
        quotations=quotations
    )


# ================= SUBSCRIPTIONS =================
@admin_bp.route("/subscriptions")
@admin_required
def subscriptions():
    status_filter = request.args.get("status", "")
    query = Subscription.query
    if status_filter:
        query = query.filter_by(status=status_filter)

    all_subs = query.order_by(Subscription.created_at.desc()).all()
    return render_template("admin/subscriptions.html", subscriptions=all_subs, status_filter=status_filter)


@admin_bp.route("/subscriptions/<int:subscription_id>")
@admin_required
def subscription_detail(subscription_id):
    subscription = Subscription.query.get_or_404(subscription_id)
    return render_template("admin/subscription_detail.html", subscription=subscription)


@admin_bp.route("/subscriptions/<int:subscription_id>/status", methods=["POST"])
@admin_required
def subscription_update_status(subscription_id):
    subscription = Subscription.query.get_or_404(subscription_id)
    new_status = request.form.get("status")
    allowed = ["Draft", "Quotation", "Confirmed", "Active", "Closed"]
    if new_status in allowed:
        subscription.status = new_status
        db.session.commit()
        flash(f"Subscription #{subscription.subscription_number} status updated to {new_status}.", "success")
    else:
        flash("Invalid status transition.", "danger")
    return redirect(url_for("admin.subscription_detail", subscription_id=subscription.subscription_id))


# ================= QUOTATIONS =================
@admin_bp.route("/quotations")
@admin_required
def quotations():
    all_quotes = Quotation.query.order_by(Quotation.created_at.desc()).all()
    return render_template("admin/quotations.html", quotations=all_quotes)


@admin_bp.route("/quotations/add", methods=["GET", "POST"])
@admin_required
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
        return redirect(url_for("admin.quotations"))

    return render_template("admin/quotation_form.html", form=form, title="Create Quotation")


@admin_bp.route("/quotations/<int:quotation_id>")
@admin_required
def quotation_detail(quotation_id):
    quotation = Quotation.query.get_or_404(quotation_id)
    return render_template("admin/quotation_detail.html", quotation=quotation)


@admin_bp.route("/quotations/<int:quotation_id>/status", methods=["POST"])
@admin_required
def quotation_update_status(quotation_id):
    quotation = Quotation.query.get_or_404(quotation_id)
    new_status = request.form.get("status")
    if new_status in ["Draft", "Sent", "Accepted", "Rejected", "Expired"]:
        quotation.status = new_status
        db.session.commit()
        flash(f"Quotation #{quotation.quotation_number} marked as {new_status}.", "info")
    return redirect(url_for("admin.quotation_detail", quotation_id=quotation.quotation_id))


# ================= INVOICES =================
@admin_bp.route("/invoices")
@admin_required
def invoices():
    status_filter = request.args.get("status", "")
    query = Invoice.query
    if status_filter:
        query = query.filter_by(status=status_filter)

    all_invoices = query.order_by(Invoice.created_at.desc()).all()
    return render_template("admin/invoices.html", invoices=all_invoices, status_filter=status_filter)


@admin_bp.route("/invoices/<int:invoice_id>")
@admin_required
def invoice_detail(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    form = PaymentForm()
    form.amount.data = invoice.outstanding_amount
    return render_template("admin/invoice_detail.html", invoice=invoice, form=form)


@admin_bp.route("/invoices/<int:invoice_id>/confirm", methods=["POST"])
@admin_required
def invoice_confirm_route(invoice_id):
    ok, msg = confirm_invoice(invoice_id)
    flash(msg, "success" if ok else "warning")
    return redirect(url_for("admin.invoice_detail", invoice_id=invoice_id))


# ================= DISCOUNTS =================
@admin_bp.route("/discounts")
@admin_required
def discounts():
    all_discounts = Discount.query.order_by(Discount.created_at.desc()).all()
    return render_template("admin/discounts.html", discounts=all_discounts)


@admin_bp.route("/discounts/add", methods=["GET", "POST"])
@admin_required
def discount_add():
    form = DiscountForm()
    if form.validate_on_submit():
        code = form.discount_name.data.strip().upper()
        if Discount.query.filter_by(discount_name=code).first():
            flash("Discount code already exists.", "danger")
            return render_template("admin/discount_form.html", form=form, title="Create Discount")

        discount = Discount(
            discount_name=code,
            discount_type=form.discount_type.data,
            discount_value=form.discount_value.data,
            minimum_purchase=form.minimum_purchase.data or Decimal("0.00"),
            minimum_quantity=form.minimum_quantity.data,
            start_date=form.start_date.data,
            end_date=form.end_date.data,
            usage_limit=form.usage_limit.data,
            is_active=form.is_active.data
        )
        db.session.add(discount)
        db.session.commit()
        flash(f"Discount rule '{discount.discount_name}' saved.", "success")
        return redirect(url_for("admin.discounts"))

    return render_template("admin/discount_form.html", form=form, title="Create Discount")


@admin_bp.route("/discounts/<int:discount_id>/toggle", methods=["POST"])
@admin_required
def discount_toggle(discount_id):
    discount = Discount.query.get_or_404(discount_id)
    discount.is_active = not discount.is_active
    db.session.commit()
    flash(f"Discount '{discount.discount_name}' {'activated' if discount.is_active else 'deactivated'}.", "info")
    return redirect(url_for("admin.discounts"))


# ================= TAXES =================
@admin_bp.route("/taxes", methods=["GET", "POST"])
@admin_required
def taxes():
    form = TaxRuleForm()
    if form.validate_on_submit():
        tax = TaxRule(
            tax_name=form.tax_name.data.strip(),
            tax_percentage=form.tax_percentage.data,
            is_active=form.is_active.data
        )
        db.session.add(tax)
        db.session.commit()
        flash(f"Tax rule '{tax.tax_name}' added.", "success")
        return redirect(url_for("admin.taxes"))

    all_taxes = TaxRule.query.order_by(TaxRule.created_at.desc()).all()
    return render_template("admin/taxes.html", taxes=all_taxes, form=form)


@admin_bp.route("/taxes/<int:tax_id>/toggle", methods=["POST"])
@admin_required
def tax_toggle(tax_id):
    tax = TaxRule.query.get_or_404(tax_id)
    tax.is_active = not tax.is_active
    db.session.commit()
    flash(f"Tax rule '{tax.tax_name}' {'activated' if tax.is_active else 'disabled'}.", "info")
    return redirect(url_for("admin.taxes"))


# ================= PAYMENTS =================
@admin_bp.route("/payments")
@admin_required
def payments():
    all_payments = Payment.query.order_by(Payment.payment_date.desc()).all()
    return render_template("admin/payments.html", payments=all_payments)


@admin_bp.route("/invoices/<int:invoice_id>/pay", methods=["POST"])
@admin_required
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
    return redirect(url_for("admin.invoice_detail", invoice_id=invoice.invoice_id))


# ================= REPORTS =================
@admin_bp.route("/reports")
@admin_required
def reports():
    metrics = get_admin_dashboard_metrics()
    return render_template("admin/reports.html", metrics=metrics)


# ================= SETTINGS =================
@admin_bp.route("/settings", methods=["GET", "POST"])
@admin_required
def settings():
    if request.method == "POST":
        for key in request.form:
            if key != "csrf_token":
                setting = SystemSetting.query.get(key)
                if not setting:
                    setting = SystemSetting(setting_key=key)
                    db.session.add(setting)
                setting.setting_value = request.form[key]
        db.session.commit()
        flash("System settings saved successfully.", "success")
        return redirect(url_for("admin.settings"))

    all_settings = {s.setting_key: s.setting_value for s in SystemSetting.query.all()}
    return render_template("admin/settings.html", settings=all_settings)
