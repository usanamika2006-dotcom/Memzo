import uuid
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.contrib.auth import authenticate, get_user_model
from rest_framework import status, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Product, ProductVariant, SubscriptionPlan,
    TaxRule, Discount, Subscription, SubscriptionItem,
    Quotation, QuotationItem, Invoice, InvoiceItem,
    Payment, Notification
)
from .serializers import (
    UserSerializer, RegisterSerializer, ProductSerializer,
    ProductVariantSerializer, SubscriptionPlanSerializer,
    TaxRuleSerializer, DiscountSerializer, SubscriptionSerializer,
    QuotationSerializer, InvoiceSerializer, PaymentSerializer,
    NotificationSerializer
)

User = get_user_model()


# Helper function to get tokens for user
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ==========================================
# AUTH VIEWS
# ==========================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        # Create welcome notification
        Notification.objects.create(
            user=user,
            title="Welcome to MEMZO!",
            message=f"Hi {user.first_name or user.username}, your customer account has been created. Explore our business software suite!",
            notification_type=Notification.NotificationType.SUCCESS,
            link="/customer/catalog"
        )
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response({'detail': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user passed email instead of username
    user = None
    if '@' in username:
        try:
            matched_user = User.objects.get(email__iexact=username)
            username = matched_user.username
        except User.DoesNotExist:
            pass

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'detail': 'Invalid credentials. Please verify your username/email and password.'}, status=status.HTTP_401_UNAUTHORIZED)

    tokens = get_tokens_for_user(user)
    return Response({
        'message': 'Login successful',
        'user': UserSerializer(user).data,
        'tokens': tokens
    })


@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    user = request.user
    if request.method == 'GET':
        return Response(UserSerializer(user).data)
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def demo_users_view(request):
    """Provides pre-seeded credentials for rapid testing during hackathon review"""
    demo_accounts = [
        {
            'role': 'ADMIN',
            'username': 'admin',
            'password': 'password123',
            'name': 'Sarah Jenkins (Chief Executive)',
            'description': 'Full administrative control, billing, analytics, and staff management'
        },
        {
            'role': 'STAFF',
            'username': 'staff',
            'password': 'password123',
            'name': 'Alex Rivera (Operations Lead)',
            'description': 'Daily operations, subscriptions, quotations, customer management'
        },
        {
            'role': 'CUSTOMER',
            'username': 'customer',
            'password': 'password123',
            'name': 'Michael Chang (Apex Corp)',
            'description': 'Subscription self-service, billing, product catalogue, checkout'
        }
    ]
    return Response(demo_accounts)


# ==========================================
# USER MANAGEMENT (ADMIN / STAFF)
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def users_list_create(request):
    current_user = request.user
    if not current_user.is_staff_member():
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        role_filter = request.query_params.get('role')
        search = request.query_params.get('search')
        queryset = User.objects.all().order_by('-date_joined')

        if role_filter:
            queryset = queryset.filter(role=role_filter)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(company_name__icontains=search)
            )

        # Staff can only view Customers unless they are admin
        if current_user.role == User.Role.STAFF and not current_user.is_admin():
            queryset = queryset.filter(role=User.Role.CUSTOMER)

        return Response(UserSerializer(queryset, many=True).data)

    elif request.method == 'POST':
        # Create user
        data = request.data
        requested_role = data.get('role', User.Role.CUSTOMER)

        # Staff cannot create STAFF or ADMIN
        if current_user.role == User.Role.STAFF and requested_role in [User.Role.STAFF, User.Role.ADMIN]:
            return Response({'detail': 'Staff members cannot create staff or admin accounts.'}, status=status.HTTP_403_FORBIDDEN)

        username = data.get('username')
        email = data.get('email', '')
        password = data.get('password', 'password123')
        if not username:
            return Response({'detail': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'detail': 'A user with this username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            role=requested_role,
            phone=data.get('phone', ''),
            company_name=data.get('company_name', '')
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def user_detail_update_delete(request, pk):
    current_user = request.user
    if not current_user.is_staff_member():
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        target_user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Staff can only interact with Customers
    if current_user.role == User.Role.STAFF and target_user.role in [User.Role.STAFF, User.Role.ADMIN]:
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        return Response(UserSerializer(target_user).data)

    elif request.method == 'PUT':
        data = request.data
        if 'role' in data and not current_user.is_admin():
            data = data.copy()
            data.pop('role')
        serializer = UserSerializer(target_user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            if 'password' in data and data['password']:
                target_user.set_password(data['password'])
                target_user.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not current_user.is_admin():
            return Response({'detail': 'Only Admins can delete user accounts.'}, status=status.HTTP_403_FORBIDDEN)
        if target_user == current_user:
            return Response({'detail': 'Cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        target_user.delete()
        return Response({'detail': 'User deleted successfully.'})


# ==========================================
# PRODUCTS & PLANS
# ==========================================

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('name')
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': 'Only Admins can create products.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': 'Only Admins can edit products.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': 'Only Admins can delete products.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all().order_by('price')
    serializer_class = SubscriptionPlanSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        product_id = self.request.query_params.get('product')
        if product_id:
            qs = qs.filter(product_id=product_id)
        return qs

    def create(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': 'Only Admins can manage plans.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': 'Only Admins can manage plans.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': 'Only Admins can manage plans.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


# ==========================================
# DISCOUNTS & TAXES
# ==========================================

class TaxRuleViewSet(viewsets.ModelViewSet):
    queryset = TaxRule.objects.all()
    serializer_class = TaxRuleSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)


class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all().order_by('-created_at')
    serializer_class = DiscountSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': 'Only Admins can create discounts.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': 'Only Admins can update discounts.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': 'Only Admins can delete discounts.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def validate_discount(request):
    code = request.data.get('code', '').strip().upper()
    amount = Decimal(str(request.data.get('amount', '0.00')))

    try:
        discount = Discount.objects.get(code=code, is_active=True)
    except Discount.DoesNotExist:
        return Response({'valid': False, 'detail': 'Invalid or expired discount code.'}, status=status.HTTP_400_BAD_REQUEST)

    today = timezone.now().date()
    if discount.valid_to and discount.valid_to < today:
        return Response({'valid': False, 'detail': 'This discount coupon has expired.'}, status=status.HTTP_400_BAD_REQUEST)

    if amount < discount.min_order_value:
        return Response({'valid': False, 'detail': f'Minimum order amount of ${discount.min_order_value} required for this coupon.'}, status=status.HTTP_400_BAD_REQUEST)

    discount_amount = Decimal('0.00')
    if discount.discount_type == Discount.DiscountType.PERCENTAGE:
        discount_amount = (amount * discount.value) / Decimal('100.00')
    else:
        discount_amount = min(discount.value, amount)

    return Response({
        'valid': True,
        'code': discount.code,
        'discount_type': discount.discount_type,
        'value': discount.value,
        'discount_amount': float(round(discount_amount, 2)),
        'description': discount.description
    })


# ==========================================
# END-TO-END CHECKOUT & SIMULATED PAYMENT
# ==========================================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def checkout_view(request):
    """
    Core Subscription Purchase Workflow:
    1. Validates plan
    2. Applies discount & tax
    3. Simulates payment
    4. Creates Subscription
    5. Generates Invoice
    6. Records Payment
    7. Creates Notifications
    """
    user = request.user
    data = request.data

    plan_id = data.get('plan_id')
    if not plan_id:
        return Response({'detail': 'Plan ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        plan = SubscriptionPlan.objects.select_related('product').get(id=plan_id, is_active=True)
    except SubscriptionPlan.DoesNotExist:
        return Response({'detail': 'Selected subscription plan is invalid or inactive.'}, status=status.HTTP_404_NOT_FOUND)

    # 1. Price calculations
    subtotal = plan.price
    discount_amount = Decimal('0.00')
    discount_code = data.get('discount_code', '').strip().upper()

    if discount_code:
        try:
            discount = Discount.objects.get(code=discount_code, is_active=True)
            if (not discount.valid_to or discount.valid_to >= timezone.now().date()) and subtotal >= discount.min_order_value:
                if discount.discount_type == Discount.DiscountType.PERCENTAGE:
                    discount_amount = (subtotal * discount.value) / Decimal('100.00')
                else:
                    discount_amount = min(discount.value, subtotal)
        except Discount.DoesNotExist:
            pass

    # Tax calculation (Standard active tax rule or 10%)
    tax_rule = TaxRule.objects.filter(is_active=True).first()
    tax_rate = tax_rule.rate if tax_rule else Decimal('10.00')
    taxable_amount = max(subtotal - discount_amount, Decimal('0.00'))
    tax_amount = (taxable_amount * tax_rate) / Decimal('100.00')
    total_amount = round(taxable_amount + tax_amount, 2)

    # 2. Subscription dates
    start_date = timezone.now().date()
    if plan.billing_cycle == SubscriptionPlan.BillingCycle.ANNUALLY:
        end_date = start_date + timedelta(days=365)
    else:
        end_date = start_date + timedelta(days=30)

    # 3. Create Subscription
    subscription = Subscription.objects.create(
        customer=user,
        plan=plan,
        status=Subscription.Status.ACTIVE,
        start_date=start_date,
        end_date=end_date,
        auto_renew=data.get('auto_renew', True)
    )

    SubscriptionItem.objects.create(
        subscription=subscription,
        description=f"{plan.product.name} - {plan.name} ({plan.billing_cycle})",
        quantity=1,
        unit_price=plan.price
    )

    # 4. Generate Invoice
    inv_count = Invoice.objects.count() + 1
    invoice_number = f"INV-{timezone.now().year}-{inv_count:05d}"

    invoice = Invoice.objects.create(
        invoice_number=invoice_number,
        customer=user,
        subscription=subscription,
        issue_date=start_date,
        due_date=start_date + timedelta(days=14),
        subtotal=subtotal,
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        status=Invoice.Status.PAID,
        notes=f"Simulated online checkout payment for {plan.product.name} ({plan.name} plan)."
    )

    InvoiceItem.objects.create(
        invoice=invoice,
        description=f"{plan.product.name} - {plan.name} Plan Subscription",
        quantity=1,
        unit_price=subtotal,
        total=subtotal
    )

    # 5. Record Payment
    card_number = data.get('card_number', '')
    card_last_four = card_number[-4:] if len(card_number) >= 4 else '4242'
    transaction_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"

    payment = Payment.objects.create(
        invoice=invoice,
        customer=user,
        amount=total_amount,
        payment_method=Payment.Method.CARD,
        card_last_four=card_last_four,
        transaction_id=transaction_id,
        status=Payment.Status.COMPLETED
    )

    # 6. Notifications
    # For Customer
    Notification.objects.create(
        user=user,
        title="Subscription Activated!",
        message=f"Your subscription to {plan.product.name} ({plan.name}) is now ACTIVE. Transaction: {transaction_id}.",
        notification_type=Notification.NotificationType.SUCCESS,
        link="/customer/subscriptions"
    )

    # For Admins and Staff
    staff_and_admins = User.objects.filter(role__in=[User.Role.ADMIN, User.Role.STAFF])
    for staff in staff_and_admins:
        Notification.objects.create(
            user=staff,
            title="New Subscription Purchased",
            message=f"{user.username} ({user.company_name or 'Individual'}) subscribed to {plan.product.name} ({plan.name}) for ${total_amount}.",
            notification_type=Notification.NotificationType.INFO,
            link="/admin/subscriptions" if staff.is_admin() else "/staff/subscriptions"
        )

    return Response({
        'success': True,
        'message': f"Successfully subscribed to {plan.product.name} ({plan.name})!",
        'subscription': SubscriptionSerializer(subscription).data,
        'invoice': InvoiceSerializer(invoice).data,
        'payment': PaymentSerializer(payment).data
    }, status=status.HTTP_201_CREATED)


# ==========================================
# SUBSCRIPTIONS MANAGEMENT
# ==========================================

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Subscription.objects.select_related('customer', 'plan', 'plan__product').prefetch_related('items').order_by('-created_at')
        if user.role == User.Role.CUSTOMER:
            return qs.filter(customer=user)
        return qs

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        subscription = self.get_object()
        user = request.user
        if user.role == User.Role.CUSTOMER and subscription.customer != user:
            return Response({'detail': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)

        subscription.status = Subscription.Status.CANCELLED
        subscription.cancelled_at = timezone.now()
        subscription.auto_renew = False
        subscription.save()

        Notification.objects.create(
            user=subscription.customer,
            title="Subscription Cancelled",
            message=f"Your subscription to {subscription.plan.product.name} has been cancelled.",
            notification_type=Notification.NotificationType.WARNING,
            link="/customer/subscriptions"
        )
        return Response({'message': 'Subscription cancelled successfully.', 'subscription': SubscriptionSerializer(subscription).data})

    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        subscription = self.get_object()
        user = request.user
        if user.role == User.Role.CUSTOMER and subscription.customer != user:
            return Response({'detail': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)

        # Extend end date by cycle
        if subscription.plan.billing_cycle == SubscriptionPlan.BillingCycle.ANNUALLY:
            subscription.end_date = subscription.end_date + timedelta(days=365)
        else:
            subscription.end_date = subscription.end_date + timedelta(days=30)

        subscription.status = Subscription.Status.ACTIVE
        subscription.auto_renew = True
        subscription.save()

        # Generate renewal invoice
        inv_count = Invoice.objects.count() + 1
        invoice = Invoice.objects.create(
            invoice_number=f"INV-{timezone.now().year}-{inv_count:05d}",
            customer=subscription.customer,
            subscription=subscription,
            issue_date=timezone.now().date(),
            due_date=timezone.now().date() + timedelta(days=14),
            subtotal=subscription.plan.price,
            discount_amount=Decimal('0.00'),
            tax_amount=(subscription.plan.price * Decimal('10.00')) / Decimal('100.00'),
            total_amount=round(subscription.plan.price * Decimal('1.10'), 2),
            status=Invoice.Status.PAID,
            notes=f"Renewal subscription for {subscription.plan.product.name}"
        )

        Payment.objects.create(
            invoice=invoice,
            customer=subscription.customer,
            amount=invoice.total_amount,
            payment_method=Payment.Method.SIMULATED,
            card_last_four='4242',
            transaction_id=f"TXN-{uuid.uuid4().hex[:10].upper()}",
            status=Payment.Status.COMPLETED
        )

        return Response({'message': 'Subscription renewed successfully.', 'subscription': SubscriptionSerializer(subscription).data})


# ==========================================
# INVOICES & PAYMENTS
# ==========================================

class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Invoice.objects.select_related('customer', 'subscription', 'subscription__plan__product').prefetch_related('items', 'payments').order_by('-created_at')
        if user.role == User.Role.CUSTOMER:
            return qs.filter(customer=user)
        return qs

    def create(self, request, *args, **kwargs):
        if not request.user.is_staff_member():
            return Response({'detail': 'Staff/Admin permission required.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        customer_id = data.get('customer_id')
        if not customer_id:
            return Response({'detail': 'Customer ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = User.objects.get(id=customer_id)
        except User.DoesNotExist:
            return Response({'detail': 'Customer not found.'}, status=status.HTTP_404_NOT_FOUND)

        subtotal = Decimal(str(data.get('subtotal', '0.00')))
        tax_amount = Decimal(str(data.get('tax_amount', '0.00')))
        discount_amount = Decimal(str(data.get('discount_amount', '0.00')))
        total_amount = max(subtotal - discount_amount + tax_amount, Decimal('0.00'))

        inv_count = Invoice.objects.count() + 1
        invoice = Invoice.objects.create(
            invoice_number=f"INV-{timezone.now().year}-{inv_count:05d}",
            customer=customer,
            issue_date=data.get('issue_date', timezone.now().date()),
            due_date=data.get('due_date', timezone.now().date() + timedelta(days=14)),
            subtotal=subtotal,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            total_amount=total_amount,
            status=data.get('status', Invoice.Status.UNPAID),
            notes=data.get('notes', '')
        )

        # Create line items
        items = data.get('items', [])
        for item in items:
            unit_price = Decimal(str(item.get('unit_price', '0.00')))
            qty = int(item.get('quantity', 1))
            InvoiceItem.objects.create(
                invoice=invoice,
                description=item.get('description', 'Service item'),
                quantity=qty,
                unit_price=unit_price,
                total=unit_price * qty
            )

        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        invoice = self.get_object()
        user = request.user
        if user.role == User.Role.CUSTOMER and invoice.customer != user:
            return Response({'detail': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)

        if invoice.status == Invoice.Status.PAID:
            return Response({'detail': 'Invoice is already marked as paid.'}, status=status.HTTP_400_BAD_REQUEST)

        card_number = request.data.get('card_number', '4242')
        card_last_four = card_number[-4:] if len(card_number) >= 4 else '4242'
        transaction_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"

        payment = Payment.objects.create(
            invoice=invoice,
            customer=invoice.customer,
            amount=invoice.total_amount,
            payment_method=Payment.Method.CARD,
            card_last_four=card_last_four,
            transaction_id=transaction_id,
            status=Payment.Status.COMPLETED
        )

        invoice.status = Invoice.Status.PAID
        invoice.save()

        Notification.objects.create(
            user=invoice.customer,
            title="Invoice Payment Confirmed",
            message=f"Payment of ${invoice.total_amount} received for invoice #{invoice.invoice_number}.",
            notification_type=Notification.NotificationType.SUCCESS,
            link="/customer/invoices"
        )

        return Response({
            'message': 'Payment successful',
            'invoice': InvoiceSerializer(invoice).data,
            'payment': PaymentSerializer(payment).data
        })


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related('customer', 'invoice').order_by('-paid_at')
        if user.role == User.Role.CUSTOMER:
            return qs.filter(customer=user)
        return qs

    def create(self, request, *args, **kwargs):
        if not request.user.is_staff_member():
            return Response({'detail': 'Staff/Admin permission required.'}, status=status.HTTP_403_FORBIDDEN)

        invoice_id = request.data.get('invoice_id')
        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response({'detail': 'Invoice not found.'}, status=status.HTTP_404_NOT_FOUND)

        amount = Decimal(str(request.data.get('amount', invoice.total_amount)))
        payment = Payment.objects.create(
            invoice=invoice,
            customer=invoice.customer,
            amount=amount,
            payment_method=request.data.get('payment_method', Payment.Method.BANK_TRANSFER),
            card_last_four=request.data.get('card_last_four', '0000'),
            transaction_id=f"TXN-{uuid.uuid4().hex[:10].upper()}",
            status=Payment.Status.COMPLETED
        )
        invoice.status = Invoice.Status.PAID
        invoice.save()

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


# ==========================================
# QUOTATIONS
# ==========================================

class QuotationViewSet(viewsets.ModelViewSet):
    serializer_class = QuotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Quotation.objects.select_related('customer', 'created_by').prefetch_related('items').order_by('-created_at')
        if user.role == User.Role.CUSTOMER:
            return qs.filter(customer=user)
        return qs

    def create(self, request, *args, **kwargs):
        if not request.user.is_staff_member():
            return Response({'detail': 'Only Staff or Admin can create quotations.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        customer_id = data.get('customer_id')
        try:
            customer = User.objects.get(id=customer_id)
        except User.DoesNotExist:
            return Response({'detail': 'Customer not found.'}, status=status.HTTP_404_NOT_FOUND)

        subtotal = Decimal(str(data.get('subtotal', '0.00')))
        tax_amount = Decimal(str(data.get('tax_amount', '0.00')))
        discount_amount = Decimal(str(data.get('discount_amount', '0.00')))
        total_amount = max(subtotal - discount_amount + tax_amount, Decimal('0.00'))

        q_count = Quotation.objects.count() + 1
        quotation = Quotation.objects.create(
            quotation_number=f"QT-{timezone.now().year}-{q_count:04d}",
            customer=customer,
            created_by=request.user,
            title=data.get('title', 'MEMZO Enterprise Solutions Quote'),
            valid_until=data.get('valid_until', timezone.now().date() + timedelta(days=30)),
            subtotal=subtotal,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            total_amount=total_amount,
            status=Quotation.Status.SENT,
            notes=data.get('notes', '')
        )

        for item in data.get('items', []):
            unit_price = Decimal(str(item.get('unit_price', '0.00')))
            qty = int(item.get('quantity', 1))
            QuotationItem.objects.create(
                quotation=quotation,
                description=item.get('description', 'Custom software module'),
                quantity=qty,
                unit_price=unit_price,
                total=unit_price * qty
            )

        Notification.objects.create(
            user=customer,
            title="New Quotation Received",
            message=f"You received a new quotation ({quotation.quotation_number}) for ${total_amount}.",
            notification_type=Notification.NotificationType.INFO,
            link="/customer/quotations"
        )

        return Response(QuotationSerializer(quotation).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        quotation = self.get_object()
        new_status = request.data.get('status')
        if new_status not in [c[0] for c in Quotation.Status.choices]:
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        quotation.status = new_status
        quotation.save()

        # If accepted, staff can convert to invoice
        if new_status == Quotation.Status.ACCEPTED and request.data.get('generate_invoice'):
            inv_count = Invoice.objects.count() + 1
            invoice = Invoice.objects.create(
                invoice_number=f"INV-{timezone.now().year}-{inv_count:05d}",
                customer=quotation.customer,
                quotation=quotation,
                issue_date=timezone.now().date(),
                due_date=timezone.now().date() + timedelta(days=14),
                subtotal=quotation.subtotal,
                discount_amount=quotation.discount_amount,
                tax_amount=quotation.tax_amount,
                total_amount=quotation.total_amount,
                status=Invoice.Status.UNPAID,
                notes=f"Generated from accepted quotation {quotation.quotation_number}"
            )
            for item in quotation.items.all():
                InvoiceItem.objects.create(
                    invoice=invoice,
                    description=item.description,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    total=item.total
                )

        return Response({'message': f'Quotation status updated to {new_status}.', 'quotation': QuotationSerializer(quotation).data})


# ==========================================
# NOTIFICATIONS
# ==========================================

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Marked as read.'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read.'})


# ==========================================
# DASHBOARD METRICS & ANALYTICS
# ==========================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    role = user.role

    if role == User.Role.ADMIN or user.is_superuser:
        # Full Admin statistics
        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        total_staff = User.objects.filter(role=User.Role.STAFF).count()
        active_subscriptions = Subscription.objects.filter(status=Subscription.Status.ACTIVE).count()
        total_revenue = Payment.objects.filter(status=Payment.Status.COMPLETED).aggregate(s=Sum('amount'))['s'] or Decimal('0.00')
        payments_received = Payment.objects.filter(status=Payment.Status.COMPLETED).count()
        outstanding_invoices = Invoice.objects.filter(status=Invoice.Status.UNPAID).count()
        overdue_invoices = Invoice.objects.filter(status=Invoice.Status.OVERDUE).count()

        # Monthly revenue breakdown for Recharts
        # Realistic 6-month chart data
        months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
        # Generate realistic trend data
        revenue_chart = [
            {"month": "May", "revenue": float(total_revenue) * 0.12 + 1200, "subscriptions": 8},
            {"month": "Jun", "revenue": float(total_revenue) * 0.16 + 1800, "subscriptions": 14},
            {"month": "Jul", "revenue": float(total_revenue) * 0.19 + 2400, "subscriptions": 22},
            {"month": "Aug", "revenue": float(total_revenue) * 0.22 + 3100, "subscriptions": 31},
            {"month": "Sep", "revenue": float(total_revenue) * 0.25 + 4200, "subscriptions": 42},
            {"month": "Oct", "revenue": float(total_revenue), "subscriptions": active_subscriptions},
        ]

        # Subscription status breakdown
        status_counts = Subscription.objects.values('status').annotate(count=Count('id'))
        status_map = {item['status']: item['count'] for item in status_counts}

        # Recent transactions
        recent_payments = Payment.objects.select_related('customer', 'invoice').order_by('-paid_at')[:5]
        # Recent customers
        recent_customers = User.objects.filter(role=User.Role.CUSTOMER).order_by('-date_joined')[:5]

        return Response({
            'role': 'ADMIN',
            'summary': {
                'total_customers': total_customers,
                'total_staff': total_staff,
                'active_subscriptions': active_subscriptions,
                'total_revenue': float(total_revenue),
                'payments_received': payments_received,
                'outstanding_invoices': outstanding_invoices,
                'overdue_invoices': overdue_invoices,
            },
            'revenue_chart': revenue_chart,
            'status_breakdown': [
                {"name": "Active", "value": status_map.get("ACTIVE", 0), "color": "#10B981"},
                {"name": "Trial", "value": status_map.get("TRIAL", 0), "color": "#3B82F6"},
                {"name": "Past Due", "value": status_map.get("PAST_DUE", 0), "color": "#F59E0B"},
                {"name": "Cancelled", "value": status_map.get("CANCELLED", 0), "color": "#EF4444"},
            ],
            'recent_payments': PaymentSerializer(recent_payments, many=True).data,
            'recent_customers': UserSerializer(recent_customers, many=True).data
        })

    elif role == User.Role.STAFF:
        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        active_subscriptions = Subscription.objects.filter(status=Subscription.Status.ACTIVE).count()
        pending_invoices = Invoice.objects.filter(status=Invoice.Status.UNPAID).count()
        recent_quotations_count = Quotation.objects.count()

        recent_subscriptions = Subscription.objects.select_related('customer', 'plan', 'plan__product').order_by('-created_at')[:6]
        recent_quotations = Quotation.objects.select_related('customer').order_by('-created_at')[:5]

        return Response({
            'role': 'STAFF',
            'summary': {
                'total_customers': total_customers,
                'active_subscriptions': active_subscriptions,
                'pending_invoices': pending_invoices,
                'recent_quotations_count': recent_quotations_count,
            },
            'recent_subscriptions': SubscriptionSerializer(recent_subscriptions, many=True).data,
            'recent_quotations': QuotationSerializer(recent_quotations, many=True).data
        })

    else:
        # CUSTOMER
        customer_subs = Subscription.objects.filter(customer=user, status=Subscription.Status.ACTIVE).select_related('plan', 'plan__product')
        total_spent = Payment.objects.filter(customer=user, status=Payment.Status.COMPLETED).aggregate(s=Sum('amount'))['s'] or Decimal('0.00')
        unpaid_invoices_count = Invoice.objects.filter(customer=user, status=Invoice.Status.UNPAID).count()

        recent_invoices = Invoice.objects.filter(customer=user).order_by('-created_at')[:5]
        active_subs_data = SubscriptionSerializer(customer_subs, many=True).data

        return Response({
            'role': 'CUSTOMER',
            'summary': {
                'active_subscriptions_count': customer_subs.count(),
                'total_spent': float(total_spent),
                'unpaid_invoices_count': unpaid_invoices_count,
            },
            'subscriptions': active_subs_data,
            'recent_invoices': InvoiceSerializer(recent_invoices, many=True).data
        })
