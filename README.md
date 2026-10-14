# NoteSpace — Professional Full-Stack Notes Management Application

NoteSpace is a modern, enterprise-grade personal notes and knowledge management web application built with a secure Node.js/Express backend, MongoDB database persistence, and a reactive React/TypeScript frontend.

![NoteSpace Application](https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Key Features

- 🔐 **Dual-Token Authentication:** Secure registration and login using JWT access tokens (15m) + HttpOnly rotating refresh cookies (7d) with server session revocation.
- 📝 **Rich Note Management:** Create, view, edit, pin, favorite, color-code, and organize notes. Real-time character and word count tracking.
- 🏷️ **Categories & Tags:** Color-coded categorization and multi-tagging with instant filtering.
- 🔍 **Full-Text Search:** Instant keyword search across titles and content with text score relevance ranking.
- 🗄️ **Archive & Trash Lifecycles:** Two-step deletion flow with soft-deletion (trash), easy restore, automatic 30-day purge, or instant permanent deletion.
- 📊 **Interactive Analytics Dashboard:** Real-time metrics computed via MongoDB aggregation pipelines (active, pinned, favorites, category breakdown) and interactive 7-day/30-day activity trends using Recharts.
- 🌓 **Dark & Light Mode:** System-aware, responsive theme switcher with glassmorphic cards and polished UI tokens.
- 🛡️ **Comprehensive Security:** Helmet protection, strict CORS allowlist, rate limiting, and Zod input validation on all routes.
- 👑 **Dedicated Administrator Control Suite:**
  - **Admin Authentication:** Secure dedicated portal at `/admin/login` with live backend role verification (`requireAdmin`) and access-denied handling (`/admin/forbidden`).
  - **Live MongoDB Admin Dashboard:** 8 real-time metric cards, interactive Recharts graphs (user registrations, note creation, category distribution, account status breakdown).
  - **User Management:** Searchable, sortable, paginated user table with note counts, role modification (`user` ↔ `admin`), status toggling (`active` ↔ `suspended`), and deletion with safeguards.
  - **Notes Oversight & Privacy:** Bulk metadata-only inspection; private content inspection requires audited justification.
  - **Category & Tag Management:** System-wide visibility with note binding counts and safe deletion.
  - **Activity Logs & Audit Trail:** Immutable append-only audit trail capturing administrative operations, IP addresses, and outcomes.
  - **System Settings & Health:** Application-level configuration (registration toggling, maintenance mode, quotas) and live infrastructure stats (Node, memory, uptime, database).

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS, PostCSS, Radix UI Primitives, Lucide Icons
- **State & Data Sync:** TanStack Query v5 (React Query) + Axios with automatic 401 token refresh interceptors
- **Forms:** React Hook Form + Zod schema validation
- **Routing:** React Router v6

### Backend
- **Runtime & Server:** Node.js, Express, TypeScript (ESM)
- **Database:** MongoDB 8.0 via Mongoose ODM
- **Validation:** Zod schemas for all request bodies, params, and queries
- **Security:** bcryptjs (12 rounds), jsonwebtoken, Helmet, CORS, express-rate-limit, cookie-parser
- **Logging:** Pino & Pino-HTTP structured JSON logging

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection URI

### 2. Installation
Clone the repository and install dependencies across the monorepo:
```bash
# Install root, backend, and frontend dependencies
npm run setup
```

### 3. Environment Configuration

#### Server (`server/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/notespace
JWT_ACCESS_SECRET=notespace_dev_access_secret_abc123xyz789
JWT_ACCESS_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=notespace_dev_refresh_secret_def456uvw012
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
LOG_LEVEL=info
BCRYPT_ROUNDS=12
```

#### Client (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 4. Running Locally
Run both backend API and Vite development server concurrently:
```bash
npm run dev
```

The application will be accessible at:
- **User App:** [http://localhost:5173](http://localhost:5173)
- **Admin Portal:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Admin Dashboard:** [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard)
- **Backend API:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

### 5. Provisioning an Administrator Account
To securely seed or promote an administrator account without exposing public endpoints:
```bash
# Provision default administrator (admin@notespace.io / AdminPassword123!)
npm run seed:admin

# Or supply custom credentials via arguments:
npm run seed:admin -- admin@mycompany.com MyStrongPassword123! "Lead Admin"
```

---

## 🧪 Testing

NoteSpace includes an automated test suite across backend and frontend using Vitest and Supertest:

```bash
# Run all tests (Server + Client)
npm run test

# Run backend API integration tests
npm run test:server

# Run frontend unit tests
npm run test:client
```

---

## 📦 Production Build

```bash
# Build both frontend and backend bundles
npm run build

# Start production server
npm run dev:server
```

---

## 📚 Documentation
- [System Architecture](file:///docs/architecture.md)
- [REST API Reference](file:///docs/api.md)
- [Security Model & Defenses](file:///docs/security.md)
