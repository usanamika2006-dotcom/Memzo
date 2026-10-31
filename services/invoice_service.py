from datetime import date, timedelta
from decimal import Decimal
from extensions import db
from models import Invoice, InvoiceItem, Product
from utils import generate_invoice_number
from services.tax_service import calculate_tax
from services.discount_service import validate_discount, record_discount_usage
from services.notification_service import create_notification


def create_invoice(
    customer_id,
    items,
    subscription_id=None,
    discount_code=None,
    due_days=14,
    status="Draft"
):
    """
    Create a complete invoice with items, calculating subtotal, taxes, and discounts.
    items: list of dicts [{'product_id': id, 'quantity': qty, 'unit_price': price}]
    """
    subtotal = Decimal("0.00")
    invoice_items_data = []

    for item in items:
        p_id = item["product_id"]
        qty = int(item.get("quantity", 1))
        unit_price = Decimal(str(item["unit_price"]))
        line_total = unit_price * qty
        subtotal += line_total
        invoice_items_data.append({
            "product_id": p_id,
            "quantity": qty,
            "unit_price": unit_price,
            "tax_amount": Decimal("0.00"),
            "total_amount": line_total
        })

    # Discount Calculation
    discount_amount = Decimal("0.00")
    discount_obj = None
    if discount_code:
        valid, msg, discount_obj, disc_val = validate_discount(
            discount_code, subtotal, quantity=sum(i["quantity"] for i in invoice_items_data)
        )
        if valid:
            discount_amount = disc_val

    taxable_amount = max(Decimal("0.00"), subtotal - discount_amount)
    
    # Tax Calculation
    _, tax_amount, _ = calculate_tax(taxable_amount)
    
    total_amount = taxable_amount + tax_amount

    inv_date = date.today()
    due_date = inv_date + timedelta(days=due_days)

    invoice = Invoice(
        invoice_number=generate_invoice_number(),
        subscription_id=subscription_id,
        customer_id=customer_id,
        invoice_date=inv_date,
        due_date=due_date,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=discount_amount,
        total_amount=total_amount,
        status=status
    )
    db.session.add(invoice)
    db.session.flush()

    for item_data in invoice_items_data:
        inv_item = InvoiceItem(
            invoice_id=invoice.invoice_id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            tax_amount=item_data["tax_amount"],
            total_amount=item_data["total_amount"]
        )
        db.session.add(inv_item)

    if discount_obj and discount_amount > 0:
        record_discount_usage(discount_obj.discount_id)

    db.session.commit()

    create_notification(
        user_id=customer_id,
        message=f"Invoice #{invoice.invoice_number} for {invoice.total_amount} has been generated.",
        notification_type="invoice_generated"
    )

    return invoice


def confirm_invoice(invoice_id):
    """Transition invoice from Draft to Confirmed."""
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return False, "Invoice not found."
    if invoice.status != "Draft":
        return False, f"Cannot confirm invoice with status '{invoice.status}'."
        
    invoice.status = "Confirmed"
    db.session.commit()
    return True, "Invoice confirmed successfully."


def update_invoice_status_on_payment(invoice_id):
    """Update invoice status to Paid if fully settled."""
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return False
        
    if invoice.outstanding_amount <= Decimal("0.00"):
        invoice.status = "Paid"
        db.session.commit()
        return True
    return False
