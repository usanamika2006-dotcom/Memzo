from decimal import Decimal
from extensions import db
from models import Payment, Invoice, Subscription
from utils import generate_transaction_ref
from services.notification_service import create_notification


def record_payment(
    invoice_id,
    customer_id,
    amount,
    payment_method="Simulated Credit Card",
    notes=None,
    status="Successful",
    transaction_reference=None
):
    """
    Record payment against an invoice.
    Updates invoice status to Paid when balance is settled.
    Activates any associated subscription.
    """
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return False, "Invoice not found.", None

    amount_dec = Decimal(str(amount))
    if amount_dec <= Decimal("0.00"):
        return False, "Payment amount must be greater than zero.", None

    if status == "Successful" and amount_dec > invoice.outstanding_amount:
        return False, f"Payment exceeds outstanding invoice balance of ${invoice.outstanding_amount:.2f}.", None

    if not transaction_reference:
        transaction_reference = generate_transaction_ref("SIM-PAY")

    # Prevent duplicate transaction reference
    existing = Payment.query.filter_by(transaction_reference=transaction_reference).first()
    if existing:
        return False, f"Transaction reference '{transaction_reference}' already recorded.", None

    payment = Payment(
        invoice_id=invoice_id,
        customer_id=customer_id,
        amount=amount_dec,
        payment_method=payment_method,
        transaction_reference=transaction_reference,
        status=status,
        notes=notes
    )
    db.session.add(payment)
    db.session.flush()

    if status == "Successful":
        # Check if invoice is fully settled
        total_settled = db.session.query(
            db.func.coalesce(db.func.sum(Payment.amount), Decimal("0.00"))
        ).filter(
            Payment.invoice_id == invoice.invoice_id,
            Payment.status == "Successful"
        ).scalar()

        if total_settled >= invoice.total_amount:
            invoice.status = "Paid"

        # If invoice is associated with a subscription, activate it
        if invoice.subscription_id:
            sub = Subscription.query.get(invoice.subscription_id)
            if sub and sub.status in ["Draft", "Confirmed"]:
                sub.status = "Active"

        create_notification(
            user_id=customer_id,
            message=f"Payment of ${amount_dec:.2f} for Invoice #{invoice.invoice_number} was successfully processed.",
            notification_type="payment_success"
        )
    elif status == "Failed":
        create_notification(
            user_id=customer_id,
            message=f"Payment attempt of ${amount_dec:.2f} for Invoice #{invoice.invoice_number} failed.",
            notification_type="payment_failed"
        )

    db.session.commit()
    return True, "Payment recorded successfully.", payment
