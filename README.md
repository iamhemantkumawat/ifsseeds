# IFS Seeds (Full Stack E-commerce)

IFS Seeds is a full-stack agriculture e-commerce platform with:
- Customer storefront (products, cart, checkout, orders)
- Admin panel (products, orders, customers, settings, email templates)
- FastAPI backend + MongoDB
- React frontend
- Local image upload/storage support (`/uploads`)

## Tech Stack
- Backend: FastAPI, Motor (MongoDB), Uvicorn
- Frontend: React (CRACO), Tailwind, Axios
- Database: MongoDB
- Payments: Razorpay

## Project Structure
- `backend/` FastAPI API server
- `frontend/` React app
- `backend/uploads/` local image assets and uploaded product images

## Quick Ubuntu Install (Recommended)

From project root:

```bash
chmod +x install_ubuntu.sh
./install_ubuntu.sh
```

This script will:
- Install system dependencies (Python, Node.js, MongoDB, build tools)
- Create backend virtualenv and install Python packages
- Install frontend npm packages
- Create default `.env` files if missing

## Start the App

Terminal 1:

```bash
cd backend
.venv/bin/uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2:

```bash
cd frontend
npm start
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`

## Seed Initial Data (Optional)

```bash
curl -X POST http://127.0.0.1:8000/api/seed-initial-data
```

## Manual Setup (Any Linux/macOS)

### Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt
cp .env.example .env
```

If `emergentintegrations` fails in your environment:

```bash
grep -v '^emergentintegrations==' requirements.txt > /tmp/ifs-backend-req.txt
.venv/bin/pip install -r /tmp/ifs-backend-req.txt
```

Run backend:

```bash
.venv/bin/uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

## Environment Files
- Backend: `backend/.env`
- Frontend: `frontend/.env`

Use `.env.example` files as templates and update secrets before production.

## Production Notes
- Set strong `JWT_SECRET`
- Set correct `CORS_ORIGINS`
- Use real Razorpay and SMTP credentials
- Keep MongoDB secured and not publicly exposed
- Serve behind reverse proxy (Nginx/Caddy) with HTTPS
