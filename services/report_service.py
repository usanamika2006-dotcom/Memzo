from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy import func
from extensions import db
from models import User, Subscription, Invoice, Payment, Product, SubscriptionItem


def get_admin_dashboard_metrics():
    """Calculate key financial and operational metrics for Admin dashboard."""
    # Customers
    total_customers = User.query.filter_by(role="customer", is_active=True).count()

    # Subscriptions
    active_subscriptions = Subscription.query.filter_by(status="Active").count()
    total_subscriptions = Subscription.query.count()

    # Revenue from Successful Payments
    revenue_query = db.session.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).filter(Payment.status == "Successful").scalar()
    total_revenue = Decimal(str(revenue_query))

    # Invoices
    all_invoices = Invoice.query.all()
    pending_invoices = [inv for inv in all_invoices if inv.status != "Paid" and inv.outstanding_amount > Decimal("0.00")]
    overdue_invoices = [inv for inv in all_invoices if inv.is_overdue]

    pending_invoices_count = len(pending_invoices)
    overdue_invoices_count = len(overdue_invoices)
    pending_revenue = sum((inv.outstanding_amount for inv in pending_invoices), Decimal("0.00"))

    # Recent Records
    recent_payments = (
        Payment.query.order_by(Payment.payment_date.desc()).limit(6).all()
    )
    recent_subscriptions = (
        Subscription.query.order_by(Subscription.created_at.desc()).limit(6).all()
    )

    # Monthly revenue trends (past 6 months)
    monthly_labels = []
    monthly_data = []
    today = date.today()
    for i in range(5, -1, -1):
        # Approximate month subtraction
        m_year = today.year
        m_month = today.month - i
        while m_month <= 0:
            m_month += 12
            m_year -= 1
        label = datetime(m_year, m_month, 1).strftime("%b %Y")
        monthly_labels.append(label)

        # Start and end of month
        start_m = datetime(m_year, m_month, 1)
        if m_month == 12:
            end_m = datetime(m_year + 1, 1, 1)
        else:
            end_m = datetime(m_year, m_month + 1, 1)

        m_sum = db.session.query(
            func.coalesce(func.sum(Payment.amount), 0)
        ).filter(
            Payment.status == "Successful",
            Payment.payment_date >= start_m,
            Payment.payment_date < end_m
        ).scalar()
        monthly_data.append(float(m_sum))

    # Status distribution
    status_counts = {
        "Active": Subscription.query.filter_by(status="Active").count(),
        "Confirmed": Subscription.query.filter_by(status="Confirmed").count(),
        "Draft": Subscription.query.filter_by(status="Draft").count(),
        "Closed": Subscription.query.filter_by(status="Closed").count(),
    }

    return {
        "total_customers": total_customers,
        "active_subscriptions": active_subscriptions,
        "total_subscriptions": total_subscriptions,
        "total_revenue": total_revenue,
        "pending_invoices_count": pending_invoices_count,
        "overdue_invoices_count": overdue_invoices_count,
        "pending_revenue": pending_revenue,
        "recent_payments": recent_payments,
        "recent_subscriptions": recent_subscriptions,
        "monthly_labels": monthly_labels,
        "monthly_data": monthly_data,
        "status_counts": status_counts,
    }


def get_staff_dashboard_metrics():
    """Calculate operational metrics for Staff dashboard."""
    admin_metrics = get_admin_dashboard_metrics()
    return admin_metrics


def get_customer_dashboard_metrics(customer_id):
    """Calculate personalized statistics for Customer dashboard."""
    active_subs = Subscription.query.filter_by(
        customer_id=customer_id, status="Active"
    ).all()
    all_subs = Subscription.query.filter_by(customer_id=customer_id).all()
    invoices = Invoice.query.filter_by(customer_id=customer_id).all()
    
    pending_invoices = [inv for inv in invoices if inv.status != "Paid" and inv.outstanding_amount > Decimal("0.00")]
    
    spent_query = db.session.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).filter(
        Payment.customer_id == customer_id,
        Payment.status == "Successful"
    ).scalar()
    total_spent = Decimal(str(spent_query))

    # Upcoming renewals in next 14 days
    now = datetime.utcnow()
    in_14_days = now + timedelta(days=14)
    upcoming_renewals = [
        s for s in active_subs if now <= s.expiry_date <= in_14_days
    ]

    recent_invoices = Invoice.query.filter_by(customer_id=customer_id).order_by(Invoice.created_at.desc()).limit(5).all()
    recent_payments = Payment.query.filter_by(customer_id=customer_id).order_by(Payment.payment_date.desc()).limit(5).all()

    return {
        "active_subscriptions_count": len(active_subs),
        "total_subscriptions_count": len(all_subs),
        "pending_invoices_count": len(pending_invoices),
        "total_spent": total_spent,
        "upcoming_renewals": upcoming_renewals,
        "recent_invoices": recent_invoices,
        "recent_payments": recent_payments,
        "active_subs": active_subs,
    }
