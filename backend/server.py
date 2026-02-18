from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import razorpay
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Razorpay client
razorpay_client = razorpay.Client(
    auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', ''))
)

# Security
security = HTTPBearer()

app = FastAPI(title="IFS Seeds E-commerce API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str
    role: str = "customer"
    created_at: str
    
class UserResponse(BaseModel):
    user: User
    token: str

class ProductVariant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    weight: str
    price: float
    original_price: float
    stock: int = 0
    sku: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    variety: str
    category: str
    description: str
    image: str
    features: List[str] = []
    variants: List[ProductVariant] = []
    is_active: bool = True

class Product(ProductCreate):
    id: str
    created_at: str
    updated_at: str

class CartItem(BaseModel):
    product_id: str
    variant_id: str
    quantity: int

class AddressInfo(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str

class OrderCreate(BaseModel):
    items: List[CartItem]
    address: AddressInfo
    coupon_code: Optional[str] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    variant_id: str
    variant_name: str
    weight: str
    price: float
    quantity: int

class Order(BaseModel):
    id: str
    user_id: Optional[str] = None
    items: List[OrderItem]
    address: AddressInfo
    subtotal: float
    discount: float = 0
    shipping: float = 0
    total: float
    coupon_code: Optional[str] = None
    payment_status: str = "pending"
    payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    order_status: str = "pending"
    created_at: str
    updated_at: str

class CouponCreate(BaseModel):
    code: str
    discount_type: str  # "percentage" or "fixed"
    discount_value: float
    min_order_value: float = 0
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    valid_from: str
    valid_until: str
    is_active: bool = True

class Coupon(CouponCreate):
    id: str
    usage_count: int = 0
    created_at: str

class SMTPSettings(BaseModel):
    smtp_server: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    from_email: str

class RazorpaySettings(BaseModel):
    enabled: bool
    key_id: str
    key_secret: str

class WhatsAppSettings(BaseModel):
    number: str
    enabled: bool = True

class SiteSettings(BaseModel):
    whatsapp_number: str
    instagram_url: str
    razorpay_enabled: bool

class ContactMessage(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    subject: str
    message: str

# ============== HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = await get_current_user(credentials)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def send_email(to_email: str, subject: str, html_content: str):
    try:
        settings = await db.settings.find_one({"type": "smtp"}, {"_id": 0})
        if not settings:
            settings = {
                "smtp_server": os.environ.get('SMTP_SERVER', 'mail.smtp2go.com'),
                "smtp_port": int(os.environ.get('SMTP_PORT', 2525)),
                "smtp_username": os.environ.get('SMTP_USERNAME', ''),
                "smtp_password": os.environ.get('SMTP_PASSWORD', ''),
                "from_email": os.environ.get('SMTP_FROM_EMAIL', 'noreply@ifsseeds.com')
            }
        
        message = MIMEMultipart("alternative")
        message["From"] = settings["from_email"]
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(html_content, "html"))
        
        await aiosmtplib.send(
            message,
            hostname=settings["smtp_server"],
            port=settings["smtp_port"],
            username=settings["smtp_username"],
            password=settings["smtp_password"],
            start_tls=True
        )
        logger.info(f"Email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "phone": user_data.phone,
        "password": hash_password(user_data.password),
        "role": "customer",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, "customer")
    user_response = User(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        role="customer",
        created_at=user_doc["created_at"]
    )
    return UserResponse(user=user_response, token=token)

@api_router.post("/auth/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["role"])
    user_response = User(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        phone=user.get("phone"),
        role=user["role"],
        created_at=user["created_at"]
    )
    return UserResponse(user=user_response, token=token)

@api_router.get("/auth/me", response_model=User)
async def get_me(user: dict = Depends(get_current_user)):
    return User(**user)

# ============== PRODUCT ROUTES ==============

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, active_only: bool = True):
    query = {}
    if category:
        query["category"] = category
    if active_only:
        query["is_active"] = True
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/admin/products", response_model=Product)
async def create_product(product: ProductCreate, admin: dict = Depends(get_admin_user)):
    product_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    product_doc = {
        "id": product_id,
        **product.model_dump(),
        "created_at": now,
        "updated_at": now
    }
    await db.products.insert_one(product_doc)
    return Product(**product_doc)

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductCreate, admin: dict = Depends(get_admin_user)):
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    now = datetime.now(timezone.utc).isoformat()
    update_doc = {**product.model_dump(), "updated_at": now}
    await db.products.update_one({"id": product_id}, {"$set": update_doc})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return Product(**updated)

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

@api_router.get("/categories")
async def get_categories():
    categories = await db.products.distinct("category")
    return {"categories": ["All"] + categories}

# ============== ORDER ROUTES ==============

@api_router.post("/orders/create", response_model=Order)
async def create_order(order_data: OrderCreate, background_tasks: BackgroundTasks, user: dict = Depends(get_current_user)):
    items = []
    subtotal = 0
    
    for cart_item in order_data.items:
        product = await db.products.find_one({"id": cart_item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
        
        variant = next((v for v in product["variants"] if v["id"] == cart_item.variant_id), None)
        if not variant:
            raise HTTPException(status_code=404, detail=f"Variant {cart_item.variant_id} not found")
        
        if variant["stock"] < cart_item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        item_total = variant["price"] * cart_item.quantity
        subtotal += item_total
        
        items.append(OrderItem(
            product_id=cart_item.product_id,
            product_name=product["name"],
            variant_id=cart_item.variant_id,
            variant_name=variant["name"],
            weight=variant["weight"],
            price=variant["price"],
            quantity=cart_item.quantity
        ))
    
    # Apply coupon
    discount = 0
    if order_data.coupon_code:
        coupon = await db.coupons.find_one({
            "code": order_data.coupon_code.upper(),
            "is_active": True
        }, {"_id": 0})
        
        if coupon:
            now = datetime.now(timezone.utc).isoformat()
            if coupon["valid_from"] <= now <= coupon["valid_until"]:
                if subtotal >= coupon["min_order_value"]:
                    if coupon["usage_limit"] is None or coupon["usage_count"] < coupon["usage_limit"]:
                        if coupon["discount_type"] == "percentage":
                            discount = subtotal * (coupon["discount_value"] / 100)
                            if coupon.get("max_discount"):
                                discount = min(discount, coupon["max_discount"])
                        else:
                            discount = coupon["discount_value"]
                        
                        await db.coupons.update_one(
                            {"code": order_data.coupon_code.upper()},
                            {"$inc": {"usage_count": 1}}
                        )
    
    shipping = 0 if subtotal >= 500 else 50
    total = subtotal - discount + shipping
    
    # Create Razorpay order
    razorpay_order = razorpay_client.order.create({
        "amount": int(total * 100),
        "currency": "INR",
        "payment_capture": 1
    })
    
    order_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    order_doc = {
        "id": order_id,
        "user_id": user["id"],
        "items": [item.model_dump() for item in items],
        "address": order_data.address.model_dump(),
        "subtotal": subtotal,
        "discount": discount,
        "shipping": shipping,
        "total": total,
        "coupon_code": order_data.coupon_code,
        "payment_status": "pending",
        "razorpay_order_id": razorpay_order["id"],
        "order_status": "pending",
        "created_at": now,
        "updated_at": now
    }
    
    await db.orders.insert_one(order_doc)
    
    return Order(**order_doc)

@api_router.post("/orders/{order_id}/verify-payment")
async def verify_payment(order_id: str, payment_data: dict, background_tasks: BackgroundTasks):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payment_data['razorpay_order_id'],
            'razorpay_payment_id': payment_data['razorpay_payment_id'],
            'razorpay_signature': payment_data['razorpay_signature']
        })
        
        # Update order
        await db.orders.update_one(
            {"id": order_id},
            {"$set": {
                "payment_status": "paid",
                "payment_id": payment_data['razorpay_payment_id'],
                "order_status": "confirmed",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update inventory
        for item in order["items"]:
            await db.products.update_one(
                {"id": item["product_id"], "variants.id": item["variant_id"]},
                {"$inc": {"variants.$.stock": -item["quantity"]}}
            )
        
        # Send confirmation email
        if order["address"].get("email"):
            background_tasks.add_task(
                send_email,
                order["address"]["email"],
                f"Order Confirmed - IFS Seeds #{order_id[:8]}",
                f"""
                <h2>Thank you for your order!</h2>
                <p>Dear {order['address']['name']},</p>
                <p>Your order has been confirmed. Order ID: <strong>{order_id[:8]}</strong></p>
                <p>Total Amount: <strong>₹{order['total']}</strong></p>
                <p>We will deliver your order within 3-5 business days.</p>
                <br>
                <p>IFS Seeds - First Choice of Farmers</p>
                """
            )
        
        return {"status": "success", "message": "Payment verified"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment verification failed")

@api_router.get("/orders/my-orders", response_model=List[Order])
async def get_my_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(status: Optional[str] = None, admin: dict = Depends(get_admin_user)):
    query = {}
    if status:
        query["order_status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: dict, background_tasks: BackgroundTasks, admin: dict = Depends(get_admin_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {
            "order_status": status_data["status"],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Send status update email
    if order["address"].get("email"):
        background_tasks.add_task(
            send_email,
            order["address"]["email"],
            f"Order Update - IFS Seeds #{order_id[:8]}",
            f"""
            <h2>Order Status Update</h2>
            <p>Dear {order['address']['name']},</p>
            <p>Your order status has been updated to: <strong>{status_data['status'].upper()}</strong></p>
            <p>Order ID: {order_id[:8]}</p>
            <br>
            <p>IFS Seeds - First Choice of Farmers</p>
            """
        )
    
    return {"message": "Order status updated"}

# ============== COUPON ROUTES ==============

@api_router.post("/coupons/validate")
async def validate_coupon(data: dict):
    code = data.get("code", "").upper()
    subtotal = data.get("subtotal", 0)
    
    coupon = await db.coupons.find_one({"code": code, "is_active": True}, {"_id": 0})
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    now = datetime.now(timezone.utc).isoformat()
    if not (coupon["valid_from"] <= now <= coupon["valid_until"]):
        raise HTTPException(status_code=400, detail="Coupon expired")
    
    if subtotal < coupon["min_order_value"]:
        raise HTTPException(status_code=400, detail=f"Minimum order value is ₹{coupon['min_order_value']}")
    
    if coupon["usage_limit"] and coupon["usage_count"] >= coupon["usage_limit"]:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    
    if coupon["discount_type"] == "percentage":
        discount = subtotal * (coupon["discount_value"] / 100)
        if coupon.get("max_discount"):
            discount = min(discount, coupon["max_discount"])
    else:
        discount = coupon["discount_value"]
    
    return {"valid": True, "discount": discount, "coupon": coupon}

@api_router.get("/admin/coupons", response_model=List[Coupon])
async def get_coupons(admin: dict = Depends(get_admin_user)):
    coupons = await db.coupons.find({}, {"_id": 0}).to_list(1000)
    return coupons

@api_router.post("/admin/coupons", response_model=Coupon)
async def create_coupon(coupon: CouponCreate, admin: dict = Depends(get_admin_user)):
    existing = await db.coupons.find_one({"code": coupon.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon_id = str(uuid.uuid4())
    coupon_doc = {
        "id": coupon_id,
        **coupon.model_dump(),
        "code": coupon.code.upper(),
        "usage_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.coupons.insert_one(coupon_doc)
    return Coupon(**coupon_doc)

@api_router.delete("/admin/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.coupons.delete_one({"id": coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon deleted"}

# ============== CUSTOMER ROUTES ==============

@api_router.get("/admin/customers")
async def get_customers(admin: dict = Depends(get_admin_user)):
    customers = await db.users.find({"role": "customer"}, {"_id": 0, "password": 0}).to_list(1000)
    
    # Get order count for each customer
    for customer in customers:
        order_count = await db.orders.count_documents({"user_id": customer["id"]})
        total_spent = 0
        orders = await db.orders.find({"user_id": customer["id"], "payment_status": "paid"}, {"_id": 0, "total": 1}).to_list(1000)
        total_spent = sum(o["total"] for o in orders)
        customer["order_count"] = order_count
        customer["total_spent"] = total_spent
    
    return customers

# ============== INVENTORY ROUTES ==============

@api_router.get("/admin/inventory")
async def get_inventory(admin: dict = Depends(get_admin_user)):
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    inventory = []
    
    for product in products:
        for variant in product.get("variants", []):
            inventory.append({
                "product_id": product["id"],
                "product_name": product["name"],
                "variant_id": variant["id"],
                "variant_name": variant["name"],
                "weight": variant["weight"],
                "stock": variant["stock"],
                "sku": variant.get("sku", ""),
                "low_stock": variant["stock"] < 10
            })
    
    return inventory

@api_router.put("/admin/inventory/{product_id}/{variant_id}")
async def update_inventory(product_id: str, variant_id: str, data: dict, admin: dict = Depends(get_admin_user)):
    result = await db.products.update_one(
        {"id": product_id, "variants.id": variant_id},
        {"$set": {"variants.$.stock": data["stock"]}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product/variant not found")
    return {"message": "Inventory updated"}

# ============== SETTINGS ROUTES ==============

@api_router.get("/admin/settings/smtp")
async def get_smtp_settings(admin: dict = Depends(get_admin_user)):
    settings = await db.settings.find_one({"type": "smtp"}, {"_id": 0})
    if not settings:
        return {
            "smtp_server": os.environ.get('SMTP_SERVER', ''),
            "smtp_port": int(os.environ.get('SMTP_PORT', 2525)),
            "smtp_username": os.environ.get('SMTP_USERNAME', ''),
            "smtp_password": "",
            "from_email": os.environ.get('SMTP_FROM_EMAIL', '')
        }
    settings.pop("type", None)
    return settings

@api_router.put("/admin/settings/smtp")
async def update_smtp_settings(settings: SMTPSettings, admin: dict = Depends(get_admin_user)):
    settings_doc = {
        "type": "smtp",
        **settings.model_dump()
    }
    await db.settings.update_one(
        {"type": "smtp"},
        {"$set": settings_doc},
        upsert=True
    )
    return {"message": "SMTP settings updated"}

@api_router.post("/admin/settings/smtp/test")
async def test_smtp_settings(data: dict, admin: dict = Depends(get_admin_user)):
    try:
        await send_email(
            data.get("email", admin["email"]),
            "IFS Seeds - SMTP Test",
            "<h2>SMTP Test Successful</h2><p>Your email configuration is working correctly.</p>"
        )
        return {"message": "Test email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send test email: {str(e)}")

# Razorpay Settings
@api_router.get("/admin/settings/razorpay")
async def get_razorpay_settings(admin: dict = Depends(get_admin_user)):
    settings = await db.settings.find_one({"type": "razorpay"}, {"_id": 0})
    if not settings:
        return {
            "enabled": os.environ.get('RAZORPAY_ENABLED', 'true').lower() == 'true',
            "key_id": os.environ.get('RAZORPAY_KEY_ID', ''),
            "key_secret": ""
        }
    settings.pop("type", None)
    return settings

@api_router.put("/admin/settings/razorpay")
async def update_razorpay_settings(settings: RazorpaySettings, admin: dict = Depends(get_admin_user)):
    settings_doc = {
        "type": "razorpay",
        **settings.model_dump()
    }
    await db.settings.update_one(
        {"type": "razorpay"},
        {"$set": settings_doc},
        upsert=True
    )
    return {"message": "Razorpay settings updated"}

# WhatsApp Settings
@api_router.get("/admin/settings/whatsapp")
async def get_whatsapp_settings(admin: dict = Depends(get_admin_user)):
    settings = await db.settings.find_one({"type": "whatsapp"}, {"_id": 0})
    if not settings:
        return {
            "number": os.environ.get('WHATSAPP_NUMBER', '+919950279664'),
            "enabled": True
        }
    settings.pop("type", None)
    return settings

@api_router.put("/admin/settings/whatsapp")
async def update_whatsapp_settings(settings: WhatsAppSettings, admin: dict = Depends(get_admin_user)):
    settings_doc = {
        "type": "whatsapp",
        **settings.model_dump()
    }
    await db.settings.update_one(
        {"type": "whatsapp"},
        {"$set": settings_doc},
        upsert=True
    )
    return {"message": "WhatsApp settings updated"}

# Site Settings (Public)
@api_router.get("/settings/site")
async def get_site_settings():
    whatsapp = await db.settings.find_one({"type": "whatsapp"}, {"_id": 0})
    razorpay_settings = await db.settings.find_one({"type": "razorpay"}, {"_id": 0})
    
    return {
        "whatsapp_number": whatsapp.get("number") if whatsapp else os.environ.get('WHATSAPP_NUMBER', '+919950279664'),
        "whatsapp_enabled": whatsapp.get("enabled", True) if whatsapp else True,
        "instagram_url": os.environ.get('INSTAGRAM_URL', 'https://www.instagram.com/ifsseeds'),
        "razorpay_enabled": razorpay_settings.get("enabled", True) if razorpay_settings else os.environ.get('RAZORPAY_ENABLED', 'true').lower() == 'true'
    }

# ============== CONTACT ROUTES ==============

@api_router.post("/contact")
async def send_contact_message(message: ContactMessage, background_tasks: BackgroundTasks):
    # Save to database
    msg_doc = {
        "id": str(uuid.uuid4()),
        **message.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "new"
    }
    await db.contact_messages.insert_one(msg_doc)
    
    # Send notification email to admin
    admin_email = os.environ.get('SMTP_FROM_EMAIL', 'admin@ifsseeds.com')
    background_tasks.add_task(
        send_email,
        admin_email,
        f"New Contact Message: {message.subject}",
        f"""
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> {message.name}</p>
        <p><strong>Phone:</strong> {message.phone}</p>
        <p><strong>Email:</strong> {message.email or 'Not provided'}</p>
        <p><strong>Subject:</strong> {message.subject}</p>
        <p><strong>Message:</strong></p>
        <p>{message.message}</p>
        """
    )
    
    return {"message": "Message sent successfully"}

@api_router.get("/admin/contact-messages")
async def get_contact_messages(admin: dict = Depends(get_admin_user)):
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return messages

# ============== DASHBOARD STATS ==============

@api_router.get("/admin/dashboard/stats")
async def get_dashboard_stats(admin: dict = Depends(get_admin_user)):
    total_orders = await db.orders.count_documents({})
    total_customers = await db.users.count_documents({"role": "customer"})
    total_products = await db.products.count_documents({})
    
    # Revenue
    paid_orders = await db.orders.find({"payment_status": "paid"}, {"_id": 0, "total": 1}).to_list(10000)
    total_revenue = sum(o["total"] for o in paid_orders)
    
    # Recent orders
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    # Low stock items
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    low_stock_count = 0
    for p in products:
        for v in p.get("variants", []):
            if v["stock"] < 10:
                low_stock_count += 1
    
    # Order stats by status
    pending_orders = await db.orders.count_documents({"order_status": "pending"})
    confirmed_orders = await db.orders.count_documents({"order_status": "confirmed"})
    shipped_orders = await db.orders.count_documents({"order_status": "shipped"})
    delivered_orders = await db.orders.count_documents({"order_status": "delivered"})
    
    return {
        "total_orders": total_orders,
        "total_customers": total_customers,
        "total_products": total_products,
        "total_revenue": total_revenue,
        "low_stock_count": low_stock_count,
        "pending_orders": pending_orders,
        "confirmed_orders": confirmed_orders,
        "shipped_orders": shipped_orders,
        "delivered_orders": delivered_orders,
        "recent_orders": recent_orders
    }

# ============== RAZORPAY CONFIG ==============

@api_router.get("/razorpay/config")
async def get_razorpay_config():
    return {"key_id": os.environ.get('RAZORPAY_KEY_ID', '')}

# ============== SEED DATA ==============

@api_router.post("/admin/seed-data")
async def seed_initial_data(admin: dict = Depends(get_admin_user)):
    # Check if products already exist
    existing = await db.products.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded"}
    
    products_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Chickpea Seed SR-1",
            "variety": "SR-1",
            "category": "Legumes",
            "description": "Premium bold-seeded chickpea variety known for high yield and disease resistance. Perfect for Rabi season cultivation in Gujarat and Rajasthan.",
            "image": "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stall10.jpg",
            "features": ["Bold-seeded variety", "High germination rate", "Disease resistant", "Suitable for Rabi season", "High protein content"],
            "variants": [
                {"id": str(uuid.uuid4()), "name": "1 KG Pack", "weight": "1 KG", "price": 250, "original_price": 499, "stock": 100, "sku": "SR1-1KG"},
                {"id": str(uuid.uuid4()), "name": "2 KG Pack", "weight": "2 KG", "price": 450, "original_price": 899, "stock": 50, "sku": "SR1-2KG"}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Yellow Mustard Seeds SR-19",
            "variety": "SR-19",
            "category": "Cash Crops",
            "description": "High-quality yellow mustard seeds with excellent oil content and white rust resistance. Ideal for commercial farming.",
            "image": "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stall000.jpg",
            "features": ["White rust resistant", "High oil content (42%+)", "Early maturing variety", "Drought tolerant", "Premium market price"],
            "variants": [
                {"id": str(uuid.uuid4()), "name": "1 KG Pack", "weight": "1 KG", "price": 799, "original_price": 1199, "stock": 80, "sku": "SR19-1KG"},
                {"id": str(uuid.uuid4()), "name": "2 KG Pack", "weight": "2 KG", "price": 1499, "original_price": 2199, "stock": 40, "sku": "SR19-2KG"}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cluster Bean (Guar) Seeds SR-23",
            "variety": "SR-23",
            "category": "Cash Crops",
            "description": "Superior guar seeds with high gum content, perfect for industrial and food processing applications. Thrives in arid conditions.",
            "image": "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stallgd.jpg",
            "features": ["High gum content", "Heat tolerant", "Low water requirement", "Multiple harvests possible", "Industrial grade quality"],
            "variants": [
                {"id": str(uuid.uuid4()), "name": "2 KG Pack", "weight": "2 KG", "price": 400, "original_price": 499, "stock": 120, "sku": "SR23-2KG"},
                {"id": str(uuid.uuid4()), "name": "5 KG Pack", "weight": "5 KG", "price": 950, "original_price": 1199, "stock": 30, "sku": "SR23-5KG"}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Moong Bean Seeds SR-25",
            "variety": "SR-25",
            "category": "Legumes",
            "description": "Virus-resistant moong bean variety with high yield potential. Suitable for both Kharif and summer seasons.",
            "image": "https://images.unsplash.com/photo-1693667660388-7cccf194fc06?w=800",
            "features": ["Virus resistant", "High yield", "Short duration (60-65 days)", "Bold grains", "Good market demand"],
            "variants": [
                {"id": str(uuid.uuid4()), "name": "1 KG Pack", "weight": "1 KG", "price": 350, "original_price": 499, "stock": 90, "sku": "SR25-1KG"},
                {"id": str(uuid.uuid4()), "name": "2 KG Pack", "weight": "2 KG", "price": 650, "original_price": 899, "stock": 45, "sku": "SR25-2KG"}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fenugreek Seeds SR-30",
            "variety": "SR-30",
            "category": "Spices",
            "description": "Premium quality fenugreek seeds with high medicinal value. Rich in fiber and minerals.",
            "image": "https://images.unsplash.com/photo-1731970820339-e725b78f55e4?w=800",
            "features": ["High medicinal value", "Rich in fiber", "Good germination", "Aromatic", "Multi-purpose use"],
            "variants": [
                {"id": str(uuid.uuid4()), "name": "500g Pack", "weight": "500g", "price": 150, "original_price": 249, "stock": 150, "sku": "SR30-500G"},
                {"id": str(uuid.uuid4()), "name": "1 KG Pack", "weight": "1 KG", "price": 280, "original_price": 449, "stock": 75, "sku": "SR30-1KG"}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products_data)
    
    # Create a sample coupon
    coupon_data = {
        "id": str(uuid.uuid4()),
        "code": "WELCOME20",
        "discount_type": "percentage",
        "discount_value": 20,
        "min_order_value": 500,
        "max_discount": 200,
        "usage_limit": 100,
        "valid_from": datetime.now(timezone.utc).isoformat(),
        "valid_until": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
        "is_active": True,
        "usage_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.coupons.insert_one(coupon_data)
    
    return {"message": "Data seeded successfully"}

# ============== PUBLIC SEED DATA (No Auth) ==============

@api_router.post("/seed-initial-data")
async def seed_public_data():
    """Public endpoint to seed initial data without authentication"""
    existing = await db.products.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded", "product_count": existing}
    
    # Create admin user
    admin_exists = await db.users.find_one({"email": "admin@ifsseeds.com"})
    if not admin_exists:
        admin_doc = {
            "id": str(uuid.uuid4()),
            "email": "admin@ifsseeds.com",
            "name": "Admin",
            "phone": "9999999999",
            "password": hash_password("admin123"),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_doc)
    
    products_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Chickpea Seed SR-1",
            "variety": "SR-1",
            "category": "Legumes",
            "description": "Premium bold-seeded chickpea variety known for high yield and disease resistance. Perfect for Rabi season cultivation in Gujarat and Rajasthan.",
            "image": "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stall10.jpg",
            "features": ["Bold-seeded variety", "High germination rate", "Disease resistant", "Suitable for Rabi season", "High protein content"],
            "variants": [
                {"id": str(uuid.uuid4()), "name": "1 KG Pack", "weight": "1 KG", "price": 250, "original_price": 499, "stock": 100, "sku": "SR1-1KG"},
                {"id": str(uuid.uuid4()), "name": "2 KG Pack", "weight": "2 KG", "price": 450, "original_price": 899, "stock": 50, "sku": "SR1-2KG"}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Yellow Mustard Seeds SR-19",
            "variety": "SR-19",
            "category": "Cash Crops",
            "description": "High-quality yellow mustard seeds with excellent oil content and white rust resistance. Ideal for commercial farming.",
            "image": "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stall000.jpg",
            "features": ["White rust resistant", "High oil content (42%+)", "Early maturing variety", "Drought tolerant", "Premium market price"],
            "variants": [
                {"id": str(uuid.uuid4()), "name": "1 KG Pack", "weight": "1 KG", "price": 799, "original_price": 1199, "stock": 80, "sku": "SR19-1KG"},
                {"id": str(uuid.uuid4()), "name": "2 KG Pack", "weight": "2 KG", "price": 1499, "original_price": 2199, "stock": 40, "sku": "SR19-2KG"}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cluster Bean (Guar) Seeds SR-23",
            "variety": "SR-23",
            "category": "Cash Crops",
            "description": "Superior guar seeds with high gum content, perfect for industrial and food processing applications. Thrives in arid conditions.",
            "image": "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stallgd.jpg",
            "features": ["High gum content", "Heat tolerant", "Low water requirement", "Multiple harvests possible", "Industrial grade quality"],
            "variants": [
                {"id": str(uuid.uuid4()), "name": "2 KG Pack", "weight": "2 KG", "price": 400, "original_price": 499, "stock": 120, "sku": "SR23-2KG"},
                {"id": str(uuid.uuid4()), "name": "5 KG Pack", "weight": "5 KG", "price": 950, "original_price": 1199, "stock": 30, "sku": "SR23-5KG"}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Moong Bean Seeds SR-25",
            "variety": "SR-25",
            "category": "Legumes",
            "description": "Virus-resistant moong bean variety with high yield potential. Suitable for both Kharif and summer seasons.",
            "image": "https://images.unsplash.com/photo-1693667660388-7cccf194fc06?w=800",
            "features": ["Virus resistant", "High yield", "Short duration (60-65 days)", "Bold grains", "Good market demand"],
            "variants": [
                {"id": str(uuid.uuid4()), "name": "1 KG Pack", "weight": "1 KG", "price": 350, "original_price": 499, "stock": 90, "sku": "SR25-1KG"},
                {"id": str(uuid.uuid4()), "name": "2 KG Pack", "weight": "2 KG", "price": 650, "original_price": 899, "stock": 45, "sku": "SR25-2KG"}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fenugreek Seeds SR-30",
            "variety": "SR-30",
            "category": "Spices",
            "description": "Premium quality fenugreek seeds with high medicinal value. Rich in fiber and minerals.",
            "image": "https://images.unsplash.com/photo-1731970820339-e725b78f55e4?w=800",
            "features": ["High medicinal value", "Rich in fiber", "Good germination", "Aromatic", "Multi-purpose use"],
            "variants": [
                {"id": str(uuid.uuid4()), "name": "500g Pack", "weight": "500g", "price": 150, "original_price": 249, "stock": 150, "sku": "SR30-500G"},
                {"id": str(uuid.uuid4()), "name": "1 KG Pack", "weight": "1 KG", "price": 280, "original_price": 449, "stock": 75, "sku": "SR30-1KG"}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products_data)
    
    # Create sample coupon
    coupon_data = {
        "id": str(uuid.uuid4()),
        "code": "WELCOME20",
        "discount_type": "percentage",
        "discount_value": 20,
        "min_order_value": 500,
        "max_discount": 200,
        "usage_limit": 100,
        "valid_from": datetime.now(timezone.utc).isoformat(),
        "valid_until": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
        "is_active": True,
        "usage_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.coupons.insert_one(coupon_data)
    
    return {"message": "Data seeded successfully", "admin_email": "admin@ifsseeds.com", "admin_password": "admin123"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
