from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, BackgroundTasks, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
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
import re
import hashlib
import mimetypes
import urllib.request
import urllib.error
from urllib.parse import urlparse

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
PASSWORD_RESET_EXPIRATION_HOURS = 1

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

# Frontend URL for links in transactional emails
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
MAX_PRODUCT_IMAGE_BYTES = int(os.environ.get("MAX_PRODUCT_IMAGE_BYTES", 5 * 1024 * 1024))
UPLOADS_DIR = ROOT_DIR / "uploads"
PRODUCT_UPLOADS_DIR = UPLOADS_DIR / "products"
SITE_UPLOADS_DIR = UPLOADS_DIR / "site"
PRODUCT_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
SITE_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_PRODUCT_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
REMOTE_IMAGE_PATTERN = re.compile(r"^https?://", re.IGNORECASE)
REMOTE_IMAGE_LOCAL_MAP: Dict[str, str] = {
    "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stall10.jpg": "/uploads/products/chickpea-sr1.jpg",
    "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stall000.jpg": "/uploads/products/mustard-sr19.jpg",
    "https://ifsseeds.com/wp-content/uploads/2023/05/manish-stallgd.jpg": "/uploads/products/cluster-bean-sr23.jpg",
    "https://images.unsplash.com/photo-1693667660388-7cccf194fc06?w=800": "/uploads/products/moong-sr25.jpg",
    "https://images.unsplash.com/photo-1731970820339-e725b78f55e4?w=800": "/uploads/products/fenugreek-sr30.jpg",
}
LEGACY_REMOTE_LOGO_URL = "https://019c6f48-94c7-7a6c-843e-4138d52fc944.mochausercontent.com/ifslogop.png"
DEFAULT_EMAIL_LOGO_URL = os.environ.get(
    "EMAIL_LOGO_URL",
    f"{os.environ.get('BACKEND_PUBLIC_URL', FRONTEND_URL).rstrip('/')}/uploads/site/ifs-logo.png"
)

# Supported email templates with default content and metadata.
EMAIL_TEMPLATE_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    "smtp_test": {
        "name": "SMTP Test Email",
        "description": "Used when admin tests SMTP configuration from settings.",
        "variables": ["site_name", "admin_name", "from_email", "current_year"],
        "sample_values": {
            "site_name": "IFS Seeds",
            "admin_name": "Admin",
            "from_email": "noreply@ifsseeds.com",
            "current_year": str(datetime.now(timezone.utc).year),
        },
        "subject": "SMTP Test Successful - {{site_name}}",
        "html_body": """<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f6faf7;font-family:Arial,sans-serif;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d9e7de;">
            <tr>
              <td style="background:linear-gradient(120deg,#166534,#16a34a);padding:28px 32px;color:#ffffff;">
                <img src="https://019c6f48-94c7-7a6c-843e-4138d52fc944.mochausercontent.com/ifslogop.png" alt="IFS Seeds Logo" style="height:56px;display:block;margin:0 0 14px 0;" />
                <h1 style="margin:0;font-size:24px;line-height:30px;">SMTP Test Successful</h1>
                <p style="margin:10px 0 0 0;font-size:14px;opacity:0.95;">Your email setup is active and ready.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 14px 0;font-size:15px;">Hi {{admin_name}},</p>
                <p style="margin:0 0 14px 0;font-size:15px;line-height:24px;">
                  Great news. {{site_name}} can send emails correctly using the configured SMTP server.
                </p>
                <div style="padding:12px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;font-size:14px;">
                  Sent from: <strong>{{from_email}}</strong>
                </div>
                <p style="margin:18px 0 0 0;font-size:14px;color:#4b5563;">This message was generated by the {{site_name}} admin panel.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#0f172a;color:#cbd5e1;font-size:12px;line-height:20px;">
                <p style="margin:0 0 10px 0;font-size:13px;color:#f8fafc;font-weight:700;">IFS Seeds (Innovative Farmers Seed)</p>
                <p style="margin:0 0 8px 0;">📞 <a href="tel:+919950279664" style="color:#86efac;text-decoration:none;">+91 99502 79664</a></p>
                <p style="margin:0 0 8px 0;">📍 Ward no. 1, dhabai wali kothi, Danta, Sikar, Rajasthan, India 332702</p>
                <p style="margin:0 0 8px 0;">
                  💬 <a href="https://wa.me/919950279664" style="color:#86efac;text-decoration:none;">WhatsApp: +91 99502 79664</a>
                  &nbsp;|&nbsp;
                  📸 <a href="https://www.instagram.com/ifsseeds" style="color:#86efac;text-decoration:none;">Instagram: @ifsseeds</a>
                </p>
                <p style="margin:0 0 8px 0;">✉️ <a href="mailto:info@ifsseeds.com" style="color:#86efac;text-decoration:none;">info@ifsseeds.com</a></p>
                <p style="margin:12px 0 0 0;color:#94a3b8;">© {{current_year}} {{site_name}}. First Choice of Farmers.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>""",
    },
    "order_confirmation": {
        "name": "Order Confirmation",
        "description": "Sent to customers after successful payment verification.",
        "variables": ["site_name", "customer_name", "order_id_short", "order_total", "delivery_eta", "current_year"],
        "sample_values": {
            "site_name": "IFS Seeds",
            "customer_name": "Rajesh Sharma",
            "order_id_short": "A1B2C3D4",
            "order_total": "640",
            "delivery_eta": "3-5 business days",
            "current_year": str(datetime.now(timezone.utc).year),
        },
        "subject": "Order Confirmed - {{site_name}} #{{order_id_short}}",
        "html_body": """<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f6faf7;font-family:Arial,sans-serif;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d9e7de;">
            <tr>
              <td style="background:linear-gradient(120deg,#166534,#16a34a);padding:28px 32px;color:#ffffff;">
                <img src="https://019c6f48-94c7-7a6c-843e-4138d52fc944.mochausercontent.com/ifslogop.png" alt="IFS Seeds Logo" style="height:56px;display:block;margin:0 0 14px 0;" />
                <h1 style="margin:0;font-size:24px;line-height:30px;">Thank you for your order</h1>
                <p style="margin:10px 0 0 0;font-size:14px;opacity:0.95;">Your payment has been received and order is confirmed.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 12px 0;font-size:15px;">Hi {{customer_name}},</p>
                <p style="margin:0 0 16px 0;font-size:15px;line-height:24px;">
                  We have started processing your order and will keep you updated at every step.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="padding:12px 14px;font-size:14px;color:#475569;">Order ID</td>
                    <td style="padding:12px 14px;font-size:14px;font-weight:700;text-align:right;">#{{order_id_short}}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;font-size:14px;color:#475569;border-top:1px solid #e2e8f0;">Total Amount</td>
                    <td style="padding:12px 14px;font-size:14px;font-weight:700;text-align:right;border-top:1px solid #e2e8f0;">₹{{order_total}}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;font-size:14px;color:#475569;border-top:1px solid #e2e8f0;">Estimated Delivery</td>
                    <td style="padding:12px 14px;font-size:14px;font-weight:700;text-align:right;border-top:1px solid #e2e8f0;">{{delivery_eta}}</td>
                  </tr>
                </table>
                <p style="margin:16px 0 0 0;font-size:14px;color:#4b5563;">{{site_name}} - First Choice of Farmers</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#0f172a;color:#cbd5e1;font-size:12px;line-height:20px;">
                <p style="margin:0 0 10px 0;font-size:13px;color:#f8fafc;font-weight:700;">IFS Seeds (Innovative Farmers Seed)</p>
                <p style="margin:0 0 8px 0;">📞 <a href="tel:+919950279664" style="color:#86efac;text-decoration:none;">+91 99502 79664</a></p>
                <p style="margin:0 0 8px 0;">📍 Ward no. 1, dhabai wali kothi, Danta, Sikar, Rajasthan, India 332702</p>
                <p style="margin:0 0 8px 0;">
                  💬 <a href="https://wa.me/919950279664" style="color:#86efac;text-decoration:none;">WhatsApp: +91 99502 79664</a>
                  &nbsp;|&nbsp;
                  📸 <a href="https://www.instagram.com/ifsseeds" style="color:#86efac;text-decoration:none;">Instagram: @ifsseeds</a>
                </p>
                <p style="margin:0 0 8px 0;">✉️ <a href="mailto:info@ifsseeds.com" style="color:#86efac;text-decoration:none;">info@ifsseeds.com</a></p>
                <p style="margin:12px 0 0 0;color:#94a3b8;">© {{current_year}} {{site_name}}. First Choice of Farmers.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>""",
    },
    "order_status_update": {
        "name": "Order Status Update",
        "description": "Sent when admin updates order status.",
        "variables": ["site_name", "customer_name", "order_id_short", "order_status", "status_label", "current_year"],
        "sample_values": {
            "site_name": "IFS Seeds",
            "customer_name": "Priya Patel",
            "order_id_short": "X8Y7Z6T5",
            "order_status": "shipped",
            "status_label": "SHIPPED",
            "current_year": str(datetime.now(timezone.utc).year),
        },
        "subject": "Order Update - {{site_name}} #{{order_id_short}}",
        "html_body": """<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background:linear-gradient(120deg,#1d4ed8,#2563eb);padding:28px 32px;color:#ffffff;">
                <img src="https://019c6f48-94c7-7a6c-843e-4138d52fc944.mochausercontent.com/ifslogop.png" alt="IFS Seeds Logo" style="height:56px;display:block;margin:0 0 14px 0;" />
                <h1 style="margin:0;font-size:24px;line-height:30px;">Order status updated</h1>
                <p style="margin:10px 0 0 0;font-size:14px;opacity:0.95;">Your order progress has changed.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 14px 0;font-size:15px;">Hi {{customer_name}},</p>
                <p style="margin:0 0 16px 0;font-size:15px;line-height:24px;">
                  Your order <strong>#{{order_id_short}}</strong> is now:
                </p>
                <div style="display:inline-block;padding:8px 14px;background:#dbeafe;border:1px solid #93c5fd;color:#1d4ed8;border-radius:999px;font-size:13px;font-weight:700;letter-spacing:0.02em;">
                  {{status_label}}
                </div>
                <p style="margin:18px 0 0 0;font-size:14px;color:#4b5563;">Thank you for choosing {{site_name}}.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#0f172a;color:#cbd5e1;font-size:12px;line-height:20px;">
                <p style="margin:0 0 10px 0;font-size:13px;color:#f8fafc;font-weight:700;">IFS Seeds (Innovative Farmers Seed)</p>
                <p style="margin:0 0 8px 0;">📞 <a href="tel:+919950279664" style="color:#86efac;text-decoration:none;">+91 99502 79664</a></p>
                <p style="margin:0 0 8px 0;">📍 Ward no. 1, dhabai wali kothi, Danta, Sikar, Rajasthan, India 332702</p>
                <p style="margin:0 0 8px 0;">
                  💬 <a href="https://wa.me/919950279664" style="color:#86efac;text-decoration:none;">WhatsApp: +91 99502 79664</a>
                  &nbsp;|&nbsp;
                  📸 <a href="https://www.instagram.com/ifsseeds" style="color:#86efac;text-decoration:none;">Instagram: @ifsseeds</a>
                </p>
                <p style="margin:0 0 8px 0;">✉️ <a href="mailto:info@ifsseeds.com" style="color:#86efac;text-decoration:none;">info@ifsseeds.com</a></p>
                <p style="margin:12px 0 0 0;color:#94a3b8;">© {{current_year}} {{site_name}}. First Choice of Farmers.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>""",
    },
    "contact_admin_notification": {
        "name": "Contact Message Notification",
        "description": "Sent to admin when a visitor submits the contact form.",
        "variables": ["site_name", "contact_name", "contact_phone", "contact_email", "contact_subject", "contact_message", "current_year"],
        "sample_values": {
            "site_name": "IFS Seeds",
            "contact_name": "Amit Verma",
            "contact_phone": "9876543212",
            "contact_email": "amit.verma@gmail.com",
            "contact_subject": "Bulk order inquiry",
            "contact_message": "Please share pricing for dealer-level quantities.",
            "current_year": str(datetime.now(timezone.utc).year),
        },
        "subject": "New Contact Message: {{contact_subject}}",
        "html_body": """<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#fffaf0;font-family:Arial,sans-serif;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #fde68a;">
            <tr>
              <td style="background:linear-gradient(120deg,#b45309,#f59e0b);padding:28px 32px;color:#ffffff;">
                <img src="https://019c6f48-94c7-7a6c-843e-4138d52fc944.mochausercontent.com/ifslogop.png" alt="IFS Seeds Logo" style="height:56px;display:block;margin:0 0 14px 0;" />
                <h1 style="margin:0;font-size:24px;line-height:30px;">New contact inquiry</h1>
                <p style="margin:10px 0 0 0;font-size:14px;opacity:0.95;">A new message was submitted from the website.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr><td style="padding:6px 0;font-size:14px;color:#475569;"><strong>Name:</strong> {{contact_name}}</td></tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#475569;"><strong>Phone:</strong> {{contact_phone}}</td></tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#475569;"><strong>Email:</strong> {{contact_email}}</td></tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#475569;"><strong>Subject:</strong> {{contact_subject}}</td></tr>
                </table>
                <div style="margin-top:16px;padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;font-size:14px;line-height:22px;">
                  {{contact_message}}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#0f172a;color:#cbd5e1;font-size:12px;line-height:20px;">
                <p style="margin:0 0 10px 0;font-size:13px;color:#f8fafc;font-weight:700;">IFS Seeds (Innovative Farmers Seed)</p>
                <p style="margin:0 0 8px 0;">📞 <a href="tel:+919950279664" style="color:#86efac;text-decoration:none;">+91 99502 79664</a></p>
                <p style="margin:0 0 8px 0;">📍 Ward no. 1, dhabai wali kothi, Danta, Sikar, Rajasthan, India 332702</p>
                <p style="margin:0 0 8px 0;">
                  💬 <a href="https://wa.me/919950279664" style="color:#86efac;text-decoration:none;">WhatsApp: +91 99502 79664</a>
                  &nbsp;|&nbsp;
                  📸 <a href="https://www.instagram.com/ifsseeds" style="color:#86efac;text-decoration:none;">Instagram: @ifsseeds</a>
                </p>
                <p style="margin:0 0 8px 0;">✉️ <a href="mailto:info@ifsseeds.com" style="color:#86efac;text-decoration:none;">info@ifsseeds.com</a></p>
                <p style="margin:12px 0 0 0;color:#94a3b8;">© {{current_year}} {{site_name}}. Internal notification from website contact form.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>""",
    },
    "password_reset": {
        "name": "Password Reset",
        "description": "Sent when a user requests to reset account password.",
        "variables": ["site_name", "customer_name", "reset_link", "expiry_hours", "support_email", "current_year"],
        "sample_values": {
            "site_name": "IFS Seeds",
            "customer_name": "Sunita Devi",
            "reset_link": "https://ifsseeds.com/reset-password?token=example-token",
            "expiry_hours": "1",
            "support_email": "support@ifsseeds.com",
            "current_year": str(datetime.now(timezone.utc).year),
        },
        "subject": "Reset your {{site_name}} password",
        "html_body": """<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background:linear-gradient(120deg,#065f46,#059669);padding:28px 32px;color:#ffffff;">
                <img src="https://019c6f48-94c7-7a6c-843e-4138d52fc944.mochausercontent.com/ifslogop.png" alt="IFS Seeds Logo" style="height:56px;display:block;margin:0 0 14px 0;" />
                <h1 style="margin:0;font-size:24px;line-height:30px;">Password reset request</h1>
                <p style="margin:10px 0 0 0;font-size:14px;opacity:0.95;">Use the secure button below to reset your password.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 14px 0;font-size:15px;">Hi {{customer_name}},</p>
                <p style="margin:0 0 18px 0;font-size:15px;line-height:24px;">
                  We received a request to reset your account password. This link expires in {{expiry_hours}} hour(s).
                </p>
                <p style="margin:0 0 22px 0;">
                  <a href="{{reset_link}}" style="display:inline-block;padding:12px 20px;background:#059669;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
                    Reset Password
                  </a>
                </p>
                <p style="margin:0 0 12px 0;font-size:13px;color:#6b7280;line-height:20px;">
                  If the button does not work, copy and paste this URL in your browser:<br />
                  <span style="color:#0f766e;">{{reset_link}}</span>
                </p>
                <p style="margin:0;font-size:13px;color:#6b7280;">If you did not request this, you can safely ignore this email or contact {{support_email}}.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#0f172a;color:#cbd5e1;font-size:12px;line-height:20px;">
                <p style="margin:0 0 10px 0;font-size:13px;color:#f8fafc;font-weight:700;">IFS Seeds (Innovative Farmers Seed)</p>
                <p style="margin:0 0 8px 0;">📞 <a href="tel:+919950279664" style="color:#86efac;text-decoration:none;">+91 99502 79664</a></p>
                <p style="margin:0 0 8px 0;">📍 Ward no. 1, dhabai wali kothi, Danta, Sikar, Rajasthan, India 332702</p>
                <p style="margin:0 0 8px 0;">
                  💬 <a href="https://wa.me/919950279664" style="color:#86efac;text-decoration:none;">WhatsApp: +91 99502 79664</a>
                  &nbsp;|&nbsp;
                  📸 <a href="https://www.instagram.com/ifsseeds" style="color:#86efac;text-decoration:none;">Instagram: @ifsseeds</a>
                </p>
                <p style="margin:0 0 8px 0;">✉️ <a href="mailto:info@ifsseeds.com" style="color:#86efac;text-decoration:none;">info@ifsseeds.com</a></p>
                <p style="margin:12px 0 0 0;color:#94a3b8;">© {{current_year}} {{site_name}}. First Choice of Farmers.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>""",
    },
}
EMAIL_TEMPLATE_PATTERN = re.compile(r"{{\s*([a-zA-Z0-9_]+)\s*}}")
for template_definition in EMAIL_TEMPLATE_DEFINITIONS.values():
    template_definition["html_body"] = template_definition["html_body"].replace(
        LEGACY_REMOTE_LOGO_URL,
        DEFAULT_EMAIL_LOGO_URL
    )

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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)

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
    courier_name: Optional[str] = None
    tracking_id: Optional[str] = None
    shipped_at: Optional[str] = None
    created_at: str
    updated_at: str

class OrderStatusUpdate(BaseModel):
    status: str
    courier_name: Optional[str] = None
    tracking_id: Optional[str] = None

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

class EmailTemplateUpdate(BaseModel):
    subject: str = Field(min_length=3, max_length=200)
    html_body: str = Field(min_length=20, max_length=100000)

class AdminCustomerUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: Optional[str] = None

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

def create_password_reset_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "purpose": "password_reset",
        "exp": datetime.now(timezone.utc) + timedelta(hours=PASSWORD_RESET_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_password_reset_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("purpose") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Reset token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid reset token")

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

def apply_email_variables(template: str, variables: Dict[str, Any]) -> str:
    def replacer(match: re.Match) -> str:
        key = match.group(1)
        value = variables.get(key)
        return str(value) if value is not None else ""
    return EMAIL_TEMPLATE_PATTERN.sub(replacer, template)

async def get_email_template(template_key: str) -> Dict[str, Any]:
    definition = EMAIL_TEMPLATE_DEFINITIONS.get(template_key)
    if not definition:
        raise HTTPException(status_code=404, detail="Email template not found")

    custom_template = await db.settings.find_one(
        {"type": "email_template", "template_key": template_key},
        {"_id": 0}
    )

    return {
        "key": template_key,
        "name": definition["name"],
        "description": definition["description"],
        "variables": definition["variables"],
        "sample_values": definition["sample_values"],
        "subject": custom_template["subject"] if custom_template else definition["subject"],
        "html_body": custom_template["html_body"] if custom_template else definition["html_body"],
        "is_custom": custom_template is not None,
    }

async def send_templated_email(to_email: str, template_key: str, variables: Dict[str, Any]):
    template = await get_email_template(template_key)
    subject = apply_email_variables(template["subject"], variables)
    html_body = apply_email_variables(template["html_body"], variables)
    await send_email(to_email, subject, html_body)

def local_image_url_to_file_path(local_image_url: str) -> Optional[Path]:
    if not local_image_url.startswith("/uploads/"):
        return None
    relative_path = local_image_url.removeprefix("/uploads/")
    return UPLOADS_DIR / relative_path

def get_local_image_if_available(image_url: str) -> str:
    if not image_url:
        return image_url
    if image_url.startswith("/uploads/"):
        return image_url
    mapped_local = REMOTE_IMAGE_LOCAL_MAP.get(image_url)
    if not mapped_local:
        return image_url
    local_path = local_image_url_to_file_path(mapped_local)
    if local_path and local_path.exists():
        return mapped_local
    return image_url

def infer_image_extension(image_url: str, content_type: str = "") -> str:
    ext = Path(urlparse(image_url).path).suffix.lower()
    if ext == ".jfif":
        ext = ".jpg"
    if ext in ALLOWED_PRODUCT_IMAGE_EXTENSIONS:
        return ext

    mime_map = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/avif": ".avif",
    }
    content_type = content_type.split(";")[0].strip().lower() if content_type else ""
    if content_type in mime_map:
        return mime_map[content_type]

    guessed_ext = mimetypes.guess_extension(content_type) if content_type else None
    if guessed_ext in ALLOWED_PRODUCT_IMAGE_EXTENSIONS:
        return guessed_ext

    return ".jpg"

def download_remote_image_to_path(source_url: str, destination_path: Path):
    request = urllib.request.Request(
        source_url,
        headers={"User-Agent": "IFSSeeds-ImageLocalizer/1.0"}
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            content_type = response.headers.get("Content-Type", "")
            normalized_content_type = content_type.split(";")[0].strip().lower()
            if normalized_content_type and not normalized_content_type.startswith("image/"):
                raise ValueError("URL does not point to an image")

            payload = response.read(MAX_PRODUCT_IMAGE_BYTES + 1)
            if not payload:
                raise ValueError("Image payload is empty")
            if len(payload) > MAX_PRODUCT_IMAGE_BYTES:
                max_mb = MAX_PRODUCT_IMAGE_BYTES // (1024 * 1024)
                raise ValueError(f"Image exceeds max size of {max_mb}MB")

            destination_path.parent.mkdir(parents=True, exist_ok=True)
            with destination_path.open("wb") as file_obj:
                file_obj.write(payload)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError, ValueError) as exc:
        raise RuntimeError(f"Failed to download {source_url}: {exc}") from exc

def localize_remote_image_url(image_url: str) -> tuple[str, bool]:
    if not image_url or not REMOTE_IMAGE_PATTERN.match(image_url):
        return image_url, False

    mapped_local = REMOTE_IMAGE_LOCAL_MAP.get(image_url)
    if mapped_local:
        target_local_url = mapped_local
    else:
        filename_hash = hashlib.sha1(image_url.encode("utf-8")).hexdigest()[:20]
        target_extension = infer_image_extension(image_url)
        target_local_url = f"/uploads/products/{filename_hash}{target_extension}"

    target_path = local_image_url_to_file_path(target_local_url)
    if target_path is None:
        return image_url, False

    downloaded_now = False
    if not target_path.exists():
        download_remote_image_to_path(image_url, target_path)
        downloaded_now = True

    return target_local_url, downloaded_now

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    normalized_email = user_data.email.lower()
    existing = await db.users.find_one({"email": normalized_email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": normalized_email,
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
        email=normalized_email,
        name=user_data.name,
        phone=user_data.phone,
        role="customer",
        created_at=user_doc["created_at"]
    )
    return UserResponse(user=user_response, token=token)

@api_router.post("/auth/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email.lower()})
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

@api_router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    user = await db.users.find_one({"email": payload.email.lower()})
    if user:
        reset_token = create_password_reset_token(user["id"], user["email"])
        reset_link = f"{FRONTEND_URL.rstrip('/')}/reset-password?token={reset_token}"
        background_tasks.add_task(
            send_templated_email,
            user["email"],
            "password_reset",
            {
                "site_name": "IFS Seeds",
                "customer_name": user.get("name", "Customer"),
                "reset_link": reset_link,
                "expiry_hours": str(PASSWORD_RESET_EXPIRATION_HOURS),
                "support_email": os.environ.get("SMTP_FROM_EMAIL", "support@ifsseeds.com"),
                "current_year": str(datetime.now(timezone.utc).year),
            }
        )

    # Intentionally generic message to avoid account enumeration.
    return {"message": "If this email exists, a password reset link has been sent."}

@api_router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    token_payload = decode_password_reset_token(payload.token)
    user = await db.users.find_one({
        "id": token_payload["user_id"],
        "email": token_payload["email"]
    })
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"password": hash_password(payload.new_password)}}
    )
    return {"message": "Password reset successful"}

# ============== PRODUCT ROUTES ==============

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, active_only: bool = True):
    query = {}
    if category:
        query["category"] = category
    if active_only:
        query["is_active"] = True
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for product in products:
        product["image"] = get_local_image_if_available(product.get("image", ""))
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product["image"] = get_local_image_if_available(product.get("image", ""))
    return product

@api_router.post("/admin/products/upload-image")
async def upload_product_image(
    request: Request,
    image: UploadFile = File(...),
    admin: dict = Depends(get_admin_user)
):
    filename = (image.filename or "").strip()
    if not filename:
        raise HTTPException(status_code=400, detail="Image file is required")

    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    extension = Path(filename).suffix.lower()
    content_type_to_ext = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/avif": ".avif",
    }
    if extension not in ALLOWED_PRODUCT_IMAGE_EXTENSIONS:
        extension = content_type_to_ext.get(image.content_type or "", "")

    if extension not in ALLOWED_PRODUCT_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported image format")

    file_bytes = await image.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")
    if len(file_bytes) > MAX_PRODUCT_IMAGE_BYTES:
        max_mb = MAX_PRODUCT_IMAGE_BYTES // (1024 * 1024)
        raise HTTPException(status_code=400, detail=f"Image size must be {max_mb}MB or less")

    stored_filename = f"{uuid.uuid4().hex}{extension}"
    stored_path = PRODUCT_UPLOADS_DIR / stored_filename
    try:
        with stored_path.open("wb") as out_file:
            out_file.write(file_bytes)
    except OSError:
        logger.exception("Failed to save uploaded product image")
        raise HTTPException(status_code=500, detail="Failed to save image")

    image_url = f"/uploads/products/{stored_filename}"
    absolute_url = f"{str(request.base_url).rstrip('/')}{image_url}"
    return {"url": image_url, "absolute_url": absolute_url, "filename": stored_filename}

@api_router.post("/admin/products/localize-images")
async def localize_product_images(admin: dict = Depends(get_admin_user)):
    products = await db.products.find(
        {"image": {"$regex": r"^https?://"}},
        {"_id": 0, "id": 1, "image": 1}
    ).to_list(2000)

    updated_count = 0
    downloaded_count = 0
    failed_items: List[Dict[str, str]] = []

    for product in products:
        image_url = (product.get("image") or "").strip()
        if not image_url:
            continue

        try:
            local_image_url, downloaded_now = localize_remote_image_url(image_url)
        except RuntimeError as exc:
            failed_items.append({"product_id": product.get("id", ""), "image": image_url, "error": str(exc)})
            continue

        if downloaded_now:
            downloaded_count += 1

        if local_image_url != image_url:
            await db.products.update_one(
                {"id": product["id"]},
                {"$set": {
                    "image": local_image_url,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            updated_count += 1

    return {
        "message": "Product image localization completed",
        "total_remote_products": len(products),
        "updated_products": updated_count,
        "downloaded_images": downloaded_count,
        "failed_count": len(failed_items),
        "failed_items": failed_items[:20],
    }

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
                send_templated_email,
                order["address"]["email"],
                "order_confirmation",
                {
                    "site_name": "IFS Seeds",
                    "customer_name": order["address"]["name"],
                    "order_id_short": order_id[:8],
                    "order_total": str(order["total"]),
                    "delivery_eta": "3-5 business days",
                    "current_year": str(datetime.now(timezone.utc).year),
                }
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
async def update_order_status(order_id: str, status_data: OrderStatusUpdate, background_tasks: BackgroundTasks, admin: dict = Depends(get_admin_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    normalized_status = status_data.status.strip().lower()
    allowed_statuses = {"pending", "confirmed", "shipped", "delivered", "cancelled"}
    if normalized_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid order status")

    update_payload = {
        "order_status": normalized_status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    if normalized_status == "shipped":
        courier_name = (status_data.courier_name or "").strip()
        tracking_id = (status_data.tracking_id or "").strip()
        if not courier_name:
            raise HTTPException(status_code=400, detail="Courier name is required for shipped orders")
        if not tracking_id:
            raise HTTPException(status_code=400, detail="Tracking ID is required for shipped orders")
        update_payload["courier_name"] = courier_name
        update_payload["tracking_id"] = tracking_id
        if not order.get("shipped_at"):
            update_payload["shipped_at"] = datetime.now(timezone.utc).isoformat()

    await db.orders.update_one(
        {"id": order_id},
        {"$set": update_payload}
    )
    
    # Send status update email
    if order["address"].get("email"):
        background_tasks.add_task(
            send_templated_email,
            order["address"]["email"],
            "order_status_update",
            {
                "site_name": "IFS Seeds",
                "customer_name": order["address"]["name"],
                "order_id_short": order_id[:8],
                "order_status": normalized_status,
                "status_label": normalized_status.upper(),
                "current_year": str(datetime.now(timezone.utc).year),
            }
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

@api_router.put("/admin/customers/{user_id}")
async def update_customer(user_id: str, payload: AdminCustomerUpdate, admin: dict = Depends(get_admin_user)):
    existing_user = await db.users.find_one({"id": user_id})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    normalized_email = payload.email.lower()
    duplicate_email_user = await db.users.find_one({
        "email": normalized_email,
        "id": {"$ne": user_id}
    })
    if duplicate_email_user:
        raise HTTPException(status_code=400, detail="Email is already used by another user")

    updated_phone = payload.phone.strip() if payload.phone else None
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "name": payload.name.strip(),
            "email": normalized_email,
            "phone": updated_phone,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    return {"message": "User updated successfully", "user": updated_user}

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
        smtp_config = await db.settings.find_one({"type": "smtp"}, {"_id": 0}) or {}
        await send_templated_email(
            data.get("email", admin["email"]),
            "smtp_test",
            {
                "site_name": "IFS Seeds",
                "admin_name": admin.get("name", "Admin"),
                "from_email": smtp_config.get("from_email", os.environ.get("SMTP_FROM_EMAIL", admin["email"])),
                "current_year": str(datetime.now(timezone.utc).year),
            }
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

@api_router.get("/admin/settings/email-templates")
async def get_email_templates(admin: dict = Depends(get_admin_user)):
    templates = []
    for template_key in EMAIL_TEMPLATE_DEFINITIONS:
        templates.append(await get_email_template(template_key))
    return {"templates": templates}

@api_router.put("/admin/settings/email-templates/{template_key}")
async def update_email_template(template_key: str, payload: EmailTemplateUpdate, admin: dict = Depends(get_admin_user)):
    definition = EMAIL_TEMPLATE_DEFINITIONS.get(template_key)
    if not definition:
        raise HTTPException(status_code=404, detail="Email template not found")

    template_doc = {
        "type": "email_template",
        "template_key": template_key,
        "subject": payload.subject,
        "html_body": payload.html_body,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.settings.update_one(
        {"type": "email_template", "template_key": template_key},
        {"$set": template_doc},
        upsert=True
    )
    return {"message": "Email template updated"}

@api_router.post("/admin/settings/email-templates/{template_key}/reset")
async def reset_email_template(template_key: str, admin: dict = Depends(get_admin_user)):
    if template_key not in EMAIL_TEMPLATE_DEFINITIONS:
        raise HTTPException(status_code=404, detail="Email template not found")

    await db.settings.delete_one({"type": "email_template", "template_key": template_key})
    return {"message": "Email template reset to default"}

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
        send_templated_email,
        admin_email,
        "contact_admin_notification",
        {
            "site_name": "IFS Seeds",
            "contact_name": message.name,
            "contact_phone": message.phone,
            "contact_email": message.email or "Not provided",
            "contact_subject": message.subject,
            "contact_message": message.message,
            "current_year": str(datetime.now(timezone.utc).year),
        }
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
            "image": "/uploads/products/chickpea-sr1.jpg",
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
            "image": "/uploads/products/mustard-sr19.jpg",
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
            "image": "/uploads/products/cluster-bean-sr23.jpg",
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
            "image": "/uploads/products/moong-sr25.jpg",
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
            "image": "/uploads/products/fenugreek-sr30.jpg",
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
    existing_products = await db.products.count_documents({})
    existing_orders = await db.orders.count_documents({})
    
    if existing_products > 0 and existing_orders > 0:
        return {"message": "Data already seeded", "product_count": existing_products}
    
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
    
    # Only seed products if none exist
    if existing_products == 0:
        products_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Chickpea Seed SR-1",
            "variety": "SR-1",
            "category": "Legumes",
            "description": "Premium bold-seeded chickpea variety known for high yield and disease resistance. Perfect for Rabi season cultivation in Gujarat and Rajasthan.",
            "image": "/uploads/products/chickpea-sr1.jpg",
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
            "image": "/uploads/products/mustard-sr19.jpg",
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
            "image": "/uploads/products/cluster-bean-sr23.jpg",
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
            "image": "/uploads/products/moong-sr25.jpg",
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
            "image": "/uploads/products/fenugreek-sr30.jpg",
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
    
    # Create dummy users
    dummy_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "rajesh.sharma@gmail.com",
            "name": "Rajesh Sharma",
            "phone": "9876543210",
            "password": hash_password("user123"),
            "role": "customer",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "priya.patel@gmail.com",
            "name": "Priya Patel",
            "phone": "9876543211",
            "password": hash_password("user123"),
            "role": "customer",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=25)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "amit.verma@gmail.com",
            "name": "Amit Verma",
            "phone": "9876543212",
            "password": hash_password("user123"),
            "role": "customer",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "sunita.devi@gmail.com",
            "name": "Sunita Devi",
            "phone": "9876543213",
            "password": hash_password("user123"),
            "role": "customer",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=15)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "ramesh.kumar@gmail.com",
            "name": "Ramesh Kumar",
            "phone": "9876543214",
            "password": hash_password("user123"),
            "role": "customer",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        }
    ]
    await db.users.insert_many(dummy_users)
    
    # Create dummy orders
    products = await db.products.find({}, {"_id": 0}).to_list(5)
    dummy_orders = [
        {
            "id": str(uuid.uuid4()),
            "user_id": dummy_users[0]["id"],
            "items": [
                {"product_id": products[0]["id"], "product_name": products[0]["name"], "variant_id": products[0]["variants"][0]["id"], "variant_name": products[0]["variants"][0]["name"], "weight": "1 KG", "price": 250, "quantity": 2}
            ],
            "address": {"name": "Rajesh Sharma", "phone": "9876543210", "email": "rajesh.sharma@gmail.com", "address": "123, Farm House, Village Road", "city": "Jaipur", "state": "Rajasthan", "pincode": "302001"},
            "subtotal": 500,
            "discount": 100,
            "shipping": 0,
            "total": 400,
            "coupon_code": "WELCOME20",
            "payment_status": "paid",
            "payment_id": "pay_dummy_001",
            "razorpay_order_id": "order_dummy_001",
            "order_status": "delivered",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=28)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=25)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": dummy_users[1]["id"],
            "items": [
                {"product_id": products[1]["id"], "product_name": products[1]["name"], "variant_id": products[1]["variants"][0]["id"], "variant_name": products[1]["variants"][0]["name"], "weight": "1 KG", "price": 799, "quantity": 1}
            ],
            "address": {"name": "Priya Patel", "phone": "9876543211", "email": "priya.patel@gmail.com", "address": "45, Green Valley", "city": "Ahmedabad", "state": "Gujarat", "pincode": "380001"},
            "subtotal": 799,
            "discount": 159,
            "shipping": 0,
            "total": 640,
            "coupon_code": "WELCOME20",
            "payment_status": "paid",
            "payment_id": "pay_dummy_002",
            "razorpay_order_id": "order_dummy_002",
            "order_status": "shipped",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": dummy_users[2]["id"],
            "items": [
                {"product_id": products[2]["id"], "product_name": products[2]["name"], "variant_id": products[2]["variants"][0]["id"], "variant_name": products[2]["variants"][0]["name"], "weight": "2 KG", "price": 400, "quantity": 3}
            ],
            "address": {"name": "Amit Verma", "phone": "9876543212", "email": "amit.verma@gmail.com", "address": "78, Kisan Nagar", "city": "Sikar", "state": "Rajasthan", "pincode": "332001"},
            "subtotal": 1200,
            "discount": 200,
            "shipping": 0,
            "total": 1000,
            "coupon_code": "WELCOME20",
            "payment_status": "paid",
            "payment_id": "pay_dummy_003",
            "razorpay_order_id": "order_dummy_003",
            "order_status": "confirmed",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": dummy_users[3]["id"],
            "items": [
                {"product_id": products[3]["id"], "product_name": products[3]["name"], "variant_id": products[3]["variants"][0]["id"], "variant_name": products[3]["variants"][0]["name"], "weight": "1 KG", "price": 350, "quantity": 2},
                {"product_id": products[4]["id"], "product_name": products[4]["name"], "variant_id": products[4]["variants"][0]["id"], "variant_name": products[4]["variants"][0]["name"], "weight": "500g", "price": 150, "quantity": 2}
            ],
            "address": {"name": "Sunita Devi", "phone": "9876543213", "email": "sunita.devi@gmail.com", "address": "12, Agri Colony", "city": "Jodhpur", "state": "Rajasthan", "pincode": "342001"},
            "subtotal": 1000,
            "discount": 0,
            "shipping": 0,
            "total": 1000,
            "payment_status": "paid",
            "payment_id": "pay_dummy_004",
            "razorpay_order_id": "order_dummy_004",
            "order_status": "pending",
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=12)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(hours=12)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": dummy_users[4]["id"],
            "items": [
                {"product_id": products[0]["id"], "product_name": products[0]["name"], "variant_id": products[0]["variants"][1]["id"], "variant_name": products[0]["variants"][1]["name"], "weight": "2 KG", "price": 450, "quantity": 5}
            ],
            "address": {"name": "Ramesh Kumar", "phone": "9876543214", "email": "ramesh.kumar@gmail.com", "address": "56, Farm Road", "city": "Udaipur", "state": "Rajasthan", "pincode": "313001"},
            "subtotal": 2250,
            "discount": 200,
            "shipping": 0,
            "total": 2050,
            "coupon_code": "WELCOME20",
            "payment_status": "paid",
            "payment_id": "pay_dummy_005",
            "razorpay_order_id": "order_dummy_005",
            "order_status": "delivered",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=15)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=12)).isoformat()
        }
    ]
    await db.orders.insert_many(dummy_orders)
    
    return {"message": "Data seeded successfully", "admin_email": "admin@ifsseeds.com", "admin_password": "admin123"}

# Include router
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
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
