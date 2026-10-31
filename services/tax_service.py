from decimal import Decimal
from extensions import db
from models import TaxRule


def get_active_tax_rules():
    """Retrieve all active tax rules."""
    return TaxRule.query.filter_by(is_active=True).all()


def calculate_tax(amount):
    """
    Calculate applicable tax on an amount based on active tax rules.
    Returns:
        total_tax_rate (Decimal): sum of percentages
        tax_amount (Decimal): total calculated tax
        rules_applied (list): list of dicts with rule details
    """
    amount_dec = Decimal(str(amount))
    active_rules = get_active_tax_rules()
    
    total_tax_amount = Decimal("0.00")
    total_rate = Decimal("0.00")
    rules_applied = []
    
    for rule in active_rules:
        rate = Decimal(str(rule.tax_percentage))
        total_rate += rate
        rule_tax = (amount_dec * (rate / Decimal("100.0"))).quantize(Decimal("0.01"))
        total_tax_amount += rule_tax
        rules_applied.append({
            "tax_id": rule.tax_id,
            "tax_name": rule.tax_name,
            "tax_percentage": rule.tax_percentage,
            "amount": rule_tax,
        })
        
    return total_rate, total_tax_amount, rules_applied
