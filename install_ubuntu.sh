#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

log() {
  printf "\n[INFO] %s\n" "$1"
}

warn() {
  printf "\n[WARN] %s\n" "$1"
}

fail() {
  printf "\n[ERROR] %s\n" "$1"
  exit 1
}

require_ubuntu() {
  if [[ ! -f /etc/os-release ]]; then
    fail "Cannot detect OS. This script supports Ubuntu."
  fi
  # shellcheck disable=SC1091
  source /etc/os-release
  if [[ "${ID:-}" != "ubuntu" ]]; then
    fail "This installer is for Ubuntu only."
  fi
}

require_project_layout() {
  [[ -f "$BACKEND_DIR/server.py" ]] || fail "backend/server.py not found"
  [[ -f "$FRONTEND_DIR/package.json" ]] || fail "frontend/package.json not found"
}

install_base_packages() {
  log "Installing base packages"
  sudo apt-get update
  sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    build-essential \
    git \
    jq \
    python3 \
    python3-pip \
    python3-venv
}

install_nodejs() {
  local need_install=1
  if command -v node >/dev/null 2>&1; then
    local major
    major="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
    if [[ "$major" -ge 20 ]]; then
      need_install=0
      log "Node.js $(node -v) already installed"
    else
      warn "Node.js $(node -v) found, upgrading to Node.js 20+"
    fi
  fi

  if [[ "$need_install" -eq 1 ]]; then
    log "Installing Node.js 20"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
}

install_mongodb() {
  if command -v mongod >/dev/null 2>&1; then
    log "MongoDB already installed"
  else
    local codename
    codename="$(lsb_release -cs)"

    install_mongo_version() {
      local version="$1"
      local keyring="/usr/share/keyrings/mongodb-server-${version}.gpg"
      local list_file="/etc/apt/sources.list.d/mongodb-org-${version}.list"

      curl -fsSL "https://pgp.mongodb.com/server-${version}.asc" | sudo gpg --dearmor -o "$keyring"
      echo "deb [ arch=amd64,arm64 signed-by=${keyring} ] https://repo.mongodb.org/apt/ubuntu ${codename}/mongodb-org/${version} multiverse" \
        | sudo tee "$list_file" >/dev/null

      sudo apt-get update
      sudo apt-get install -y mongodb-org
    }

    log "Installing MongoDB"
    if ! install_mongo_version "8.0"; then
      warn "MongoDB 8.0 install failed, trying MongoDB 7.0"
      sudo rm -f /etc/apt/sources.list.d/mongodb-org-8.0.list /usr/share/keyrings/mongodb-server-8.0.gpg || true
      install_mongo_version "7.0" || fail "Failed to install MongoDB"
    fi
  fi

  log "Starting MongoDB service"
  sudo systemctl enable --now mongod
  sudo systemctl is-active --quiet mongod || fail "MongoDB service is not running"
}

create_backend_env_if_missing() {
  local env_file="$BACKEND_DIR/.env"
  if [[ -f "$env_file" ]]; then
    log "Backend .env already exists, keeping existing file"
    return
  fi

  local jwt_secret
  jwt_secret="$(openssl rand -hex 32 2>/dev/null || echo "ifsseeds_change_me_jwt_secret")"

  log "Creating backend/.env"
  cat >"$env_file" <<EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="ifsseeds"
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
JWT_SECRET="${jwt_secret}"
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_ENABLED="true"
SMTP_SERVER=""
SMTP_PORT="587"
SMTP_USERNAME=""
SMTP_PASSWORD=""
SMTP_FROM_EMAIL="noreply@ifsseeds.com"
WHATSAPP_NUMBER="+919950279664"
INSTAGRAM_URL="https://www.instagram.com/ifsseeds"
FRONTEND_URL="http://localhost:3000"
BACKEND_PUBLIC_URL="http://localhost:8000"
EOF
}

create_frontend_env_if_missing() {
  local env_file="$FRONTEND_DIR/.env"
  if [[ -f "$env_file" ]]; then
    log "Frontend .env already exists, keeping existing file"
    return
  fi

  log "Creating frontend/.env"
  cat >"$env_file" <<EOF
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=3000
ENABLE_HEALTH_CHECK=false
EOF
}

install_backend_deps() {
  log "Installing backend dependencies"
  cd "$BACKEND_DIR"
  python3 -m venv .venv
  .venv/bin/pip install --upgrade pip setuptools wheel

  if ! .venv/bin/pip install -r requirements.txt; then
    warn "Full backend requirements install failed, retrying without emergentintegrations"
    local tmp_req
    tmp_req="$(mktemp)"
    grep -v '^emergentintegrations==' requirements.txt >"$tmp_req"
    .venv/bin/pip install -r "$tmp_req"
    rm -f "$tmp_req"
  fi
}

install_frontend_deps() {
  log "Installing frontend dependencies"
  cd "$FRONTEND_DIR"
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
}

main() {
  require_ubuntu
  require_project_layout

  install_base_packages
  install_nodejs
  install_mongodb
  create_backend_env_if_missing
  create_frontend_env_if_missing
  install_backend_deps
  install_frontend_deps

  log "Installation completed successfully"
  cat <<'EOF'

Next steps:

1) Start backend:
   cd backend
   .venv/bin/uvicorn server:app --reload --host 127.0.0.1 --port 8000

2) Start frontend (new terminal):
   cd frontend
   npm start

3) Optional seed data:
   curl -X POST http://127.0.0.1:8000/api/seed-initial-data

Open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
EOF
}

main "$@"
