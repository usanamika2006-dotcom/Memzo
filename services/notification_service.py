from extensions import db
from models import Notification


def create_notification(user_id, message, notification_type="info"):
    """Create a persistent user notification."""
    notif = Notification(
        user_id=user_id,
        message=message,
        notification_type=notification_type,
        is_read=False
    )
    db.session.add(notif)
    db.session.commit()
    return notif


def mark_as_read(notification_id, user_id):
    """Mark a specific notification as read."""
    notif = Notification.query.filter_by(
        notification_id=notification_id,
        user_id=user_id
    ).first()
    if notif:
        notif.is_read = True
        db.session.commit()
        return True
    return False


def mark_all_as_read(user_id):
    """Mark all notifications for a user as read."""
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()


def get_user_notifications(user_id, limit=20, unread_only=False):
    """Fetch notifications for a specific user."""
    query = Notification.query.filter_by(user_id=user_id)
    if unread_only:
        query = query.filter_by(is_read=False)
    return query.order_by(Notification.created_at.desc()).limit(limit).all()
