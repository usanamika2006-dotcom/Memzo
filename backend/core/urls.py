from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register_view, login_view, me_view, demo_users_view,
    users_list_create, user_detail_update_delete,
    ProductViewSet, SubscriptionPlanViewSet, ProductVariantViewSet,
    TaxRuleViewSet, DiscountViewSet, validate_discount,
    checkout_view, SubscriptionViewSet, InvoiceViewSet,
    PaymentViewSet, QuotationViewSet, NotificationViewSet,
    dashboard_stats
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'plans', SubscriptionPlanViewSet)
router.register(r'variants', ProductVariantViewSet)
router.register(r'taxes', TaxRuleViewSet)
router.register(r'discounts', DiscountViewSet)
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'quotations', QuotationViewSet, basename='quotation')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', register_view, name='auth-register'),
    path('auth/login/', login_view, name='auth-login'),
    path('auth/me/', me_view, name='auth-me'),
    path('auth/demo-users/', demo_users_view, name='demo-users'),

    # User management
    path('users/', users_list_create, name='users-list-create'),
    path('users/<int:pk>/', user_detail_update_delete, name='user-detail-update-delete'),

    # Checkout & discount validation
    path('checkout/', checkout_view, name='checkout'),
    path('discounts/validate/', validate_discount, name='validate-discount'),

    # Analytics & Dashboard
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),

    # ViewSets
    path('', include(router.urls)),
]
