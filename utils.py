import os
import re
import uuid
from datetime import datetime
from decimal import Decimal
from werkzeug.utils import secure_filename
from flask import current_app


def format_currency(value):
    """Format decimal or float as standard currency string."""
    if value is None:
        value = 0.0
    try:
        dec = Decimal(str(value))
        return f"${dec:,.2f}"
    except Exception:
        return f"${value}"


def validate_password_strength(password):
    """
    Validate password rules:
    - More than 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one special character
    """
    if len(password) <= 8:
        return False, "Password must be more than 8 characters."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\/]", password):
        return False, "Password must contain at least one special character."
    return True, "Password is strong."


def generate_subscription_number():
    year = datetime.utcnow().year
    rand = uuid.uuid4().hex[:6].upper()
    return f"SUB-{year}-{rand}"


def generate_invoice_number():
    year = datetime.utcnow().year
    rand = uuid.uuid4().hex[:6].upper()
    return f"INV-{year}-{rand}"


def generate_quotation_number():
    year = datetime.utcnow().year
    rand = uuid.uuid4().hex[:6].upper()
    return f"QUO-{year}-{rand}"


def generate_transaction_ref(prefix="TXN"):
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    rand = uuid.uuid4().hex[:6].upper()
    return f"{prefix}-{timestamp}-{rand}"


def allowed_file(filename):
    allowed = current_app.config.get("ALLOWED_EXTENSIONS", {"png", "jpg", "jpeg", "webp", "svg"})
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed


def save_image_file(file_storage, subfolder="products"):
    if not file_storage or file_storage.filename == "":
        return None
    if allowed_file(file_storage.filename):
        orig_name = secure_filename(file_storage.filename)
        ext = orig_name.rsplit(".", 1)[1].lower()
        new_filename = f"{uuid.uuid4().hex}.{ext}"
        target_dir = os.path.join(current_app.config["BASE_DIR"], "static", "images", subfolder)
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, new_filename)
        file_storage.save(target_path)
        return f"{subfolder}/{new_filename}"
    return None
