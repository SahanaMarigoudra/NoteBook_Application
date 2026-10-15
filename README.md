# NoteSpace — Professional Full-Stack Notes Management Application

NoteSpace is a modern, enterprise-grade personal notes and knowledge management web application built with a secure Node.js/Express backend, MongoDB database persistence, and a reactive React/TypeScript frontend.

![NoteSpace Application](client/public/notebook-hero.jpg)

---

## ✨ Key Features

- 🔐 **Dual-Token Authentication:** Secure registration and login using JWT access tokens with rotating HttpOnly refresh cookies and server-side session revocation.
- 📝 **Rich Note Management:** Create, view, edit, pin, favorite, color-code, and organize notes with real-time character and word count tracking.
- 🏷️ **Categories & Tags:** Color-coded categorization and multi-tagging with instant filtering.
- 🔍 **Full-Text Search:** Instant keyword search across titles and content with text score relevance ranking.
- 🗄️ **Archive & Trash Lifecycles:** Two-step deletion flow with soft-deletion (trash), easy restore, and automatic retention lifecycle.
- 📊 **Interactive Analytics Dashboard:** Real-time metrics computed via MongoDB aggregation pipelines (active, pinned, favorites, category breakdown) and interactive activity trends.
- 🌓 **Tactile & Responsive Design:** Editorial notebook aesthetics, system-aware dark and light modes, and distraction-free typography.
- 🛡️ **Comprehensive Security:** Helmet protection, strict CORS allowlist, rate limiting, and Zod input validation on all routes.
- 👑 **Dedicated Administrator Control Suite:**
  - **Live MongoDB Admin Dashboard:** Real-time metric cards and interactive visual analytics.
  - **User Management:** Searchable, sortable, paginated user management with status and role controls.
  - **Notes Oversight & Privacy:** Audited inspection safeguards protecting user confidentiality.
  - **Activity Logs & Audit Trail:** Immutable append-only audit trail capturing administrative operations.
  - **System Settings & Health:** Application-level configuration and live infrastructure monitoring.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS, PostCSS, Radix UI Primitives, Lucide Icons
- **State & Data Sync:** TanStack Query v5 + Axios with automatic token refresh interceptors
- **Forms:** React Hook Form + Zod schema validation
- **Routing:** React Router v6

### Backend
- **Runtime & Server:** Node.js, Express, TypeScript (ESM)
- **Database:** MongoDB via Mongoose ODM
- **Validation:** Zod schemas for all request bodies, params, and queries
- **Security:** bcryptjs, jsonwebtoken, Helmet, CORS, express-rate-limit, cookie-parser
- **Logging:** Pino & Pino-HTTP structured JSON logging

---

## 📄 License

This project is licensed under the MIT License.
