from decimal import Decimal
from extensions import db
from models import Discount


def validate_discount(discount_code, amount, quantity=1):
    """
    Validate discount code for eligibility.
    Returns:
        is_valid (bool)
        message (str)
        discount (Discount or None)
        discount_amount (Decimal)
    """
    if not discount_code:
        return False, "No discount code provided.", None, Decimal("0.00")
        
    code_str = str(discount_code).strip().upper()
    discount = Discount.query.filter(
        db.func.upper(Discount.discount_name) == code_str
    ).first()
    
    if not discount:
        return False, "Invalid promo code.", None, Decimal("0.00")
        
    valid, message = discount.is_valid_for(amount, quantity)
    if not valid:
        return False, message, discount, Decimal("0.00")
        
    calc_discount = discount.calculate_discount(amount)
    return True, "Discount successfully applied.", discount, calc_discount


def record_discount_usage(discount_id):
    """Increment usage counter for a discount."""
    discount = Discount.query.get(discount_id)
    if discount:
        discount.used_count += 1
        db.session.commit()
