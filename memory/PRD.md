# IFS Seeds E-commerce Platform - PRD

## Project Overview
E-commerce website for IFS Seeds (Innovative Farmers Seed) - a seed company based in Sikar, Rajasthan serving farmers in Gujarat and Rajasthan.

## Original Problem Statement
Build an e-commerce website for https://ifsseeds.com with:
- Razorpay payment integration
- SMTP settings in admin panel
- JWT-based authentication
- WooCommerce-like admin features
- Product management with variants
- Order management, Inventory tracking
- Discount/coupon system
- Customer management

## User Personas
1. **Farmers** - Primary customers looking to buy premium quality seeds
2. **Agricultural Dealers** - Bulk buyers and distributors
3. **Admin Users** - Managing products, orders, inventory, and settings

## Core Requirements (Static)

### Customer-Facing Features
- Landing page with Hero, Products, About, Team, Contact sections
- Product catalog with category filters (Legumes, Cash Crops, Spices)
- Product detail pages with variant selection
- Shopping cart with add/update/remove functionality
- Checkout with Razorpay payment integration
- User registration and login (JWT-based)
- Order history for logged-in users
- Contact form submission

### Admin Panel Features
- Dashboard with stats (revenue, orders, customers, products)
- Product management (CRUD with variants, features, images)
- Order management with status updates
- Inventory tracking with low stock alerts
- Coupon/discount management
- Customer management
- SMTP email settings

## What's Been Implemented (Jan 2026)

### Backend (FastAPI + MongoDB)
- [x] User authentication (JWT-based)
- [x] Product CRUD with variants
- [x] Order creation and management
- [x] Razorpay payment integration
- [x] Coupon validation and application
- [x] Inventory management
- [x] SMTP email configuration
- [x] Contact form handling
- [x] Dashboard statistics API

### Frontend (React + Tailwind + Shadcn)
- [x] Landing page with all sections (Hero, Products, About, Team, Contact)
- [x] Shop page with search, filters, sorting
- [x] Product detail page with variant selection
- [x] Cart sidebar and cart page
- [x] Checkout page with Razorpay
- [x] Login/Register pages
- [x] My Orders page
- [x] Admin Dashboard
- [x] Admin Products management
- [x] Admin Orders management
- [x] Admin Coupons management
- [x] Admin Customers page
- [x] Admin Inventory page
- [x] Admin SMTP Settings page

### Integrations
- [x] Razorpay (Test Key: rzp_test_rFq3xRmaKZu0Go)
- [x] SMTP2GO email service

## Credentials
- **Admin Login**: admin@ifsseeds.com / admin123
- **Sample Coupon**: WELCOME20 (20% off, min order ₹500)

## Prioritized Backlog

### P0 (Critical - Next Phase)
- Product image upload functionality
- Order confirmation emails working end-to-end
- Shipping tracking integration

### P1 (High Priority)
- Product reviews and ratings
- Wishlist functionality
- Order invoice PDF generation
- Bulk product import/export

### P2 (Medium Priority)
- WhatsApp integration for order updates
- Multi-language support (Hindi/Gujarati)
- Advanced analytics dashboard
- SEO optimization

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, MongoDB
- **Payments**: Razorpay
- **Email**: SMTP2GO
- **Auth**: JWT

## Next Tasks
1. Test full checkout flow with Razorpay payment
2. Verify SMTP email delivery
3. Add product image upload to admin
4. Implement order tracking
5. Add WhatsApp order notifications
