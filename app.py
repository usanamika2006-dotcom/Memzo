import os
from flask import Flask, render_template
from config import Config
from extensions import db, login_manager, migrate, csrf
from utils import format_currency
from datetime import datetime


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure required directories exist
    os.makedirs(app.config["BASE_DIR"] / "database", exist_ok=True)
    os.makedirs(app.config["BASE_DIR"] / "static" / "images" / "products", exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)

    # Context processors & template filters
    @app.context_processor
    def inject_global_vars():
        from flask_login import current_user
        from models import Notification
        
        unread_count = 0
        if current_user.is_authenticated:
            try:
                unread_count = Notification.query.filter_by(
                    user_id=current_user.user_id, is_read=False
                ).count()
            except Exception:
                unread_count = 0

        return {
            "current_year": datetime.utcnow().year,
            "format_currency": format_currency,
            "unread_notifications_count": unread_count,
            "brand_name": "MEMZO"
        }

    @app.template_filter("currency")
    def currency_filter(value):
        return format_currency(value)

    # Register Blueprints
    from blueprints.auth.routes import auth_bp
    from blueprints.public.routes import public_bp
    from blueprints.admin.routes import admin_bp
    from blueprints.staff.routes import staff_bp
    from blueprints.customer.routes import customer_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(staff_bp, url_prefix="/staff")
    app.register_blueprint(customer_bp, url_prefix="/customer")

    # Error handlers
    @app.errorhandler(403)
    def forbidden(e):
        return render_template("403.html"), 403

    @app.errorhandler(404)
    def not_found(e):
        return render_template("404.html"), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template("500.html"), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
