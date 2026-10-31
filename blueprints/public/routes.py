from decimal import Decimal
from flask import render_template, redirect, url_for, flash, request, abort
from flask_login import current_user, login_required
from extensions import db
from models import Product, Plan, ProductVariant, TaxRule, Discount
from forms import CheckoutForm
from blueprints.public import public_bp
from services.subscription_service import create_subscription
from services.invoice_service import create_invoice
from services.payment_service import record_payment
from services.discount_service import validate_discount
from services.tax_service import calculate_tax


@public_bp.route("/")
def index():
    # Load published products for the landing page showcase
    published_products = Product.query.filter_by(is_published=True, is_archived=False).all()
    return render_template("index.html", products=published_products)


@public_bp.route("/products")
def products():
    search = request.args.get("q", "").strip()
    ptype = request.args.get("type", "").strip()

    query = Product.query.filter_by(is_published=True, is_archived=False)

    if search:
        query = query.filter(
            Product.product_name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%")
        )
    if ptype:
        query = query.filter(Product.product_type == ptype)

    all_products = query.order_by(Product.created_at.desc()).all()
    
    # Available product types for filter
    product_types = [
        r[0] for r in db.session.query(Product.product_type).distinct().all() if r[0]
    ]

    return render_template(
        "products.html",
        products=all_products,
        search=search,
        selected_type=ptype,
        product_types=product_types
    )


@public_bp.route("/products/<int:product_id>")
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    if not product.is_published or product.is_archived:
        abort(404)

    variants = ProductVariant.query.filter_by(product_id=product.product_id).all()
    plans = Plan.query.filter_by(product_id=product.product_id, is_active=True).all()

    return render_template(
        "product_detail.html",
        product=product,
        variants=variants,
        plans=plans
    )


@public_bp.route("/checkout", methods=["GET", "POST"])
def checkout():
    if not current_user.is_authenticated:
        flash("Please log in or register to complete your subscription purchase.", "info")
        return redirect(url_for("auth.login", next=request.url))

    if not current_user.is_customer:
        flash("Admin and Staff accounts should use internal quotation/subscription creation.", "warning")

    plan_id = request.args.get("plan_id", type=int)
    variant_id = request.args.get("variant_id", type=int)
    
    plan = None
    if plan_id:
        plan = Plan.query.get(plan_id)

    if not plan or not plan.is_active:
        flash("Please select a valid active subscription plan.", "warning")
        return redirect(url_for("public.products"))

    product = plan.product
    variants = ProductVariant.query.filter_by(product_id=product.product_id).all()
    
    form = CheckoutForm()
    form.plan_id.choices = [(plan.plan_id, f"{plan.plan_name} (${plan.price}/{plan.billing_cycle})")]
    form.variant_id.choices = [(0, "Standard Edition (Included)")] + [
        (v.variant_id, f"{v.variant_name} (+${v.additional_price})") for v in variants
    ]

    # Pre-select plan and variant
    if request.method == "GET":
        form.plan_id.data = plan.plan_id
        if variant_id:
            form.variant_id.data = variant_id

    # Compute server-side financial breakdown
    selected_variant_id = form.variant_id.data if form.variant_id.data and form.variant_id.data > 0 else None
    variant_obj = ProductVariant.query.get(selected_variant_id) if selected_variant_id else None
    
    qty = max(form.quantity.data or 1, plan.minimum_quantity)
    base_unit_price = Decimal(str(plan.price))
    if variant_obj:
        base_unit_price += Decimal(str(variant_obj.additional_price))

    subtotal = base_unit_price * Decimal(str(qty))

    # Apply promo discount if entered
    discount_code_input = request.args.get("discount_code") or (form.discount_code.data if request.method == "POST" else None)
    discount_amount = Decimal("0.00")
    discount_msg = ""
    discount_valid = False
    
    if discount_code_input:
        discount_valid, discount_msg, _, discount_amount = validate_discount(
            discount_code_input, subtotal, quantity=qty
        )

    taxable_amount = max(Decimal("0.00"), subtotal - discount_amount)
    tax_rate, tax_amount, _ = calculate_tax(taxable_amount)
    final_total = taxable_amount + tax_amount

    if form.validate_on_submit():
        # Execute genuine server-side subscription creation & simulated payment
        # 1. Create Subscription
        success, msg, subscription = create_subscription(
            customer_id=current_user.user_id,
            plan_id=plan.plan_id,
            quantity=qty,
            variant_id=selected_variant_id,
            payment_terms="Immediate",
            status="Active"
        )
        if not success:
            flash(msg, "danger")
            return redirect(url_for("public.checkout", plan_id=plan.plan_id))

        # 2. Create Invoice
        invoice = create_invoice(
            customer_id=current_user.user_id,
            items=[{
                "product_id": product.product_id,
                "quantity": qty,
                "unit_price": base_unit_price
            }],
            subscription_id=subscription.subscription_id,
            discount_code=discount_code_input if discount_valid else None,
            due_days=7,
            status="Confirmed"
        )

        # 3. Process Simulated Payment
        pay_success, pay_msg, payment = record_payment(
            invoice_id=invoice.invoice_id,
            customer_id=current_user.user_id,
            amount=final_total,
            payment_method=form.payment_method.data,
            notes=f"Simulated checkout for {product.product_name} - {plan.plan_name}",
            status="Successful"
        )

        if pay_success:
            flash("Subscription activated! Your invoice and payment have been confirmed.", "success")
            return redirect(url_for("customer.subscription_detail", subscription_id=subscription.subscription_id))
        else:
            flash(f"Payment issue: {pay_msg}", "warning")
            return redirect(url_for("customer.invoice_detail", invoice_id=invoice.invoice_id))

    return render_template(
        "checkout.html",
        form=form,
        plan=plan,
        product=product,
        variants=variants,
        subtotal=subtotal,
        discount_amount=discount_amount,
        discount_msg=discount_msg,
        discount_valid=discount_valid,
        tax_rate=tax_rate,
        tax_amount=tax_amount,
        final_total=final_total
    )
