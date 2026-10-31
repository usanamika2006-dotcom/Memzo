from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user, login_required
from urllib.parse import urlparse
from extensions import db
from models import User
from forms import LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm
from blueprints.auth import auth_bp
from services.notification_service import create_notification


def is_safe_url(target):
    if not target:
        return False
    ref_url = urlparse(request.host_url)
    test_url = urlparse(target)
    return test_url.scheme in ("http", "https") and ref_url.netloc == test_url.netloc


def redirect_for_role(user):
    if user.is_admin:
        return redirect(url_for("admin.dashboard"))
    elif user.is_staff:
        return redirect(url_for("staff.dashboard"))
    return redirect(url_for("customer.dashboard"))


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect_for_role(current_user)

    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data.strip().lower()
        password = form.password.data
        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            if not user.is_active:
                flash("Your account has been deactivated. Please contact support.", "danger")
                return render_template("login.html", form=form)

            login_user(user, remember=form.remember_me.data)
            flash(f"Welcome back, {user.name}!", "success")

            next_page = request.args.get("next")
            if next_page and is_safe_url(next_page):
                return redirect(next_page)
            return redirect_for_role(user)
        else:
            flash("Invalid email or password. Please try again.", "danger")

    return render_template("login.html", form=form)


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect_for_role(current_user)

    form = RegisterForm()
    if form.validate_on_submit():
        user = User(
            name=form.name.data.strip(),
            email=form.email.data.strip().lower(),
            phone=form.phone.data.strip() if form.phone.data else None,
            role="customer",
            is_active=True
        )
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()

        create_notification(
            user.user_id,
            f"Welcome to MEMZO, {user.name}! Browse our software products and activate your first subscription.",
            "account_created"
        )

        login_user(user)
        flash("Registration successful! Welcome to MEMZO.", "success")
        return redirect(url_for("customer.dashboard"))

    return render_template("register.html", form=form)


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been signed out successfully.", "info")
    return redirect(url_for("auth.login"))


@auth_bp.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():
    form = ForgotPasswordForm()
    if form.validate_on_submit():
        email = form.email.data.strip().lower()
        user = User.query.filter_by(email=email).first()
        # Security: Do not reveal if email exists
        flash("If your email is registered in our system, you will receive password reset instructions shortly.", "info")
        return redirect(url_for("auth.login"))

    return render_template("forgot_password.html", form=form)


@auth_bp.route("/reset-password", methods=["GET", "POST"])
def reset_password():
    form = ResetPasswordForm()
    if form.validate_on_submit():
        flash("Password has been reset successfully. Please log in with your new credentials.", "success")
        return redirect(url_for("auth.login"))

    return render_template("reset_password.html", form=form)
