from functools import wraps
from flask import abort, flash, redirect, url_for, request
from flask_login import current_user


def role_required(*roles):
    """Ensure user is logged in and belongs to one of the authorized roles."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                return redirect(url_for("auth.login", next=request.url))
            if current_user.role not in roles:
                abort(403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def admin_required(f):
    """Only Admins can access."""
    return role_required("admin")(f)


def staff_required(f):
    """Staff and Admins can access operational staff routes."""
    return role_required("admin", "staff")(f)


def customer_required(f):
    """Customers can access."""
    return role_required("customer")(f)
