# Migration Notes & Architecture Brief — Md. Mohsin Portfolio v2

---

## 1. Overview of Changes

The portfolio website for **Md. Mohsin** was migrated from a 5-page static site into a **Single-Page Application (SPA)** architecture with smooth anchor navigation, dynamic client rendering from `content.json`, and a self-hosted **Node/Express authentication & self-service admin system**.

---

## 2. Resolved Decisions (`[DECIDE]`)

### A. Old Multi-Page URL Handling
- **Choice**: Dual-layer redirection strategy.
  1. **Server-Level 301 Permanent Redirects**: `server/server.js` issues `HTTP 301` status codes when receiving requests for `/education.html`, `/portfolio.html`, `/experiences.html`, or `/contact.html`, redirecting them to `/ #<anchor>`.
  2. **Client-Level HTML Redirect Stubs**: `education.html`, `portfolio.html`, `experiences.html`, and `contact.html` contain `<meta http-equiv="refresh">` and JavaScript `window.location.replace()` fallback redirects for static file hosting environments.

### B. Featured Hero Project
- **Choice**: **Niramoy** (AI Rural Telemedicine Assistant) was selected as the featured hero project. In `style.css`, a dedicated `.project-card.featured` class provides a 2-column wide grid card layout, a neon crimson glowing border, and a glowing `"Featured Innovation"` badge.

### C. Backend Architecture & Serving Strategy
- **Choice**: Express.js server (`server/server.js`) running on port 3000 (configurable via `.env`).
- Serves static assets (`index.html`, `/admin`, `/images`, `content.json`) directly.
- Implements cookie-parser, bcrypt password hashing, and JWT tokens stored in `httpOnly`, `SameSite=Strict` cookies.
- Protects write API endpoints (`PUT /api/content` and `POST /api/upload`) via `requireAuth` middleware.

### D. Content Read & Save Strategy
- **Choice**: `GET /api/content` serves `content.json`. Public client script `script.js` fetches `content.json` on `DOMContentLoaded` and runs `renderSite(data)` to populate DOM elements.
- Admin dashboard provides per-section `"Save Section"` action buttons for granular edits alongside a top-level `"Save All Changes"` action.

---

## 3. API Endpoints Specification

| Endpoint | Method | Protection | Description |
| :--- | :--- | :--- | :--- |
| `/api/login` | `POST` | Public (Rate-Limited: 5/15min) | Verifies password against `ADMIN_PASSWORD_HASH`, sets HTTP-only `auth_token` JWT cookie. |
| `/api/logout` | `POST` | Public | Clears `auth_token` cookie. |
| `/api/status` | `GET` | Public | Returns `{ authenticated: boolean }` for admin dashboard initialization. |
| `/api/content` | `GET` | Public | Returns full `content.json` data object. |
| `/api/content` | `PUT` | `requireAuth` (JWT) | Validates root schema keys and updates `content.json` on disk. |
| `/api/upload` | `POST` | `requireAuth` (JWT) | Receives `image` file up to 5MB (JPEG, PNG, WebP), saves to `/images`, returns relative path. |

---

## 4. Admin Credentials & Setup

- **Default Development Password**: `admin123`
- **Hash Generation Script**: `npm run generate-hash [new_password]` inside `server/`.
- **Environment File**: `server/.env` contains `ADMIN_PASSWORD_HASH` and `JWT_SECRET`.

---

## 5. Public Single Page Anchor Map

- `#hero`: Hero banner with dual-track CTAs (`Explore as Developer`, `Explore as Designer`).
- `#about`: Who I Am, DIU status, bio paragraphs, and mini skill badges.
- `#testimonials`: Client feedback grid (reordered to social proof early in scroll).
- `#education`: Academic timeline (B.Sc., HSC, SSC, JSC).
- `#projects`: CSE Projects grid with featured Niramoy card.
- `#design-work`: Marquees for Thumbnails, FB Covers, YT Art, and Posters.
- `#experience`: Work history cards (Fiverr Level 1 Seller), Stats, Course sales banner, Brand marquee, Why Choose Me, and Services Provided.
- `#certificates`: Certificates & Awards grid.
- `#contact`: Contact info cards and interactive message form.
