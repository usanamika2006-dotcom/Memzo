from datetime import datetime, timedelta
from decimal import Decimal
from extensions import db
from models import Subscription, SubscriptionItem, Plan, Product, ProductVariant
from utils import generate_subscription_number
from services.notification_service import create_notification


def compute_expiry_date(start_date, billing_cycle):
    """Calculate expiry date based on billing cycle."""
    cycle = billing_cycle.capitalize()
    if cycle == "Daily":
        return start_date + timedelta(days=1)
    elif cycle == "Weekly":
        return start_date + timedelta(days=7)
    elif cycle == "Monthly":
        return start_date + timedelta(days=30)
    elif cycle == "Yearly":
        return start_date + timedelta(days=365)
    return start_date + timedelta(days=30)


def create_subscription(
    customer_id,
    plan_id,
    quantity=1,
    variant_id=None,
    payment_terms="Immediate",
    status="Active",
    start_date=None
):
    """
    Create a new subscription with subscription items.
    """
    plan = Plan.query.get(plan_id)
    if not plan:
        return False, "Plan not found.", None

    if not plan.is_active:
        return False, "Selected plan is inactive.", None

    if quantity < plan.minimum_quantity:
        return False, f"Minimum required quantity for this plan is {plan.minimum_quantity}.", None

    if start_date is None:
        start_date = datetime.utcnow()

    expiry_date = compute_expiry_date(start_date, plan.billing_cycle)

    sub_number = generate_subscription_number()

    subscription = Subscription(
        subscription_number=sub_number,
        customer_id=customer_id,
        plan_id=plan_id,
        start_date=start_date,
        expiry_date=expiry_date,
        payment_terms=payment_terms,
        status=status
    )
    db.session.add(subscription)
    db.session.flush()

    # Calculate item unit price
    unit_price = Decimal(str(plan.price))
    if variant_id:
        variant = ProductVariant.query.get(variant_id)
        if variant:
            unit_price += Decimal(str(variant.additional_price))

    total_amount = unit_price * int(quantity)

    sub_item = SubscriptionItem(
        subscription_id=subscription.subscription_id,
        product_id=plan.product_id,
        variant_id=variant_id,
        quantity=int(quantity),
        unit_price=unit_price,
        tax_amount=Decimal("0.00"),
        total_amount=total_amount
    )
    db.session.add(sub_item)
    db.session.commit()

    create_notification(
        user_id=customer_id,
        message=f"Subscription #{subscription.subscription_number} for {plan.plan_name} has been created.",
        notification_type="subscription_created"
    )

    return True, "Subscription created successfully.", subscription


def renew_subscription(subscription_id):
    """
    Renew an existing subscription. Extends its expiry date.
    """
    sub = Subscription.query.get(subscription_id)
    if not sub:
        return False, "Subscription not found."

    if not sub.plan.allow_renew:
        return False, "Renewal is not allowed for this plan."

    now = datetime.utcnow()
    # If already expired, start from now; else extend from current expiry
    base_date = sub.expiry_date if sub.expiry_date > now else now
    new_expiry = compute_expiry_date(base_date, sub.plan.billing_cycle)

    sub.expiry_date = new_expiry
    sub.status = "Active"
    db.session.commit()

    create_notification(
        user_id=sub.customer_id,
        message=f"Subscription #{sub.subscription_number} renewed until {new_expiry.strftime('%Y-%m-%d')}.",
        notification_type="subscription_renewed"
    )

    return True, f"Subscription successfully renewed until {new_expiry.strftime('%Y-%m-%d')}."


def close_subscription(subscription_id, is_admin=False):
    """Close/cancel a subscription."""
    sub = Subscription.query.get(subscription_id)
    if not sub:
        return False, "Subscription not found."

    if not is_admin and not sub.plan.allow_early_close:
        return False, "Early cancellation is not permitted on this plan."

    sub.status = "Closed"
    db.session.commit()

    create_notification(
        user_id=sub.customer_id,
        message=f"Subscription #{sub.subscription_number} has been closed.",
        notification_type="subscription_closed"
    )

    return True, "Subscription closed successfully."
