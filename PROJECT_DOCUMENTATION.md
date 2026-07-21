# Comprehensive Master Project Documentation: Md. Mohsin Personal Portfolio v2

---

## 1. Executive Summary & Project Purpose

This project is a high-performance, single-page personal portfolio application and self-service content management system built for **Md. Mohsin**, a Computer Science & Engineering (CSE) student at Daffodil International University (DIU) and a Level 1 Graphic Designer (5-Star rated on Fiverr).

The site bridges two complementary core identities:
1. **Technical Software Engineering** (C++, Java, Python, Android Studio, Qt Framework, Django/AI).
2. **Creative Media & Graphic Design** (High-CTR YouTube Thumbnails, Facebook Covers, YouTube Channel Art, Poster Design, Motion Graphics, Branding).

---

## 2. Architecture & Tech Stack

### Frontend Stack
- **HTML5**: Semantic single-page architecture (`index.html`) with 9 main section anchors (`#hero`, `#about`, `#testimonials`, `#education`, `#projects`, `#design-work`, `#experience`, `#certificates`, `#contact`).
- **CSS3 (Vanilla)**: Design system based on CSS Custom Properties (`:root`), Flexbox, CSS Grid, custom `@keyframes` drift animations, backdrop-filter navigation, smooth scrolling, and tactile SVG noise overlays.
- **JavaScript (Vanilla ES6)**: Asynchronous data fetching (`content.json`), dynamic DOM rendering (`renderSite`), `IntersectionObserver` active link highlighting, scroll-reveal transitions, marquee pause-on-hover, and desktop hero spotlight tracking.
- **Third-Party CDNs**: Phosphor Icons (`<script src="https://unpkg.com/@phosphor-icons/web"></script>`) and Google Fonts (`Space Grotesk`, weights 300–700).

### Backend & API Stack (`/server`)
- **Node.js & Express**: Entrypoint `server/server.js` serving static assets (`index.html`, `/admin`, `/images`, `content.json`) and API endpoints.
- **Authentication & Security**:
  - `bcrypt`: Password hash verification against `ADMIN_PASSWORD_HASH` in `server/.env`.
  - `jsonwebtoken`: Short-lived (4h) JWT session tokens stored in `httpOnly`, `SameSite=Strict` cookies.
  - `express-rate-limit`: Rate-limiting `POST /api/login` (max 5 attempts per 15 mins per IP).
  - `cookie-parser`: Secure HTTP-only cookie parsing middleware (`requireAuth.js`).
- **File Upload Engine**: `multer` middleware accepting image uploads (`.jpg`, `.png`, `.webp`) up to 5MB, saving directly to `/images/` with collision-safe filenames.

---

## 3. Directory & File Inventory

```
Mohsin-main/
│
├── index.html                 # Main public single-page application (all 9 sections)
├── content.json               # Single source of truth for all editable site text & image paths
├── style.css                  # Central stylesheet (Crimson Mood Mode palette, micro-interactions, animations)
├── script.js                  # Public JS: dynamic DOM renderer, smooth scrolling, scroll observer
├── favicon.png                # Site icon (970 KB PNG)
├── PROJECT_DOCUMENTATION.md   # Master project documentation file
├── MIGRATION_NOTES.md          # Architectural decisions & migration notes
│
├── education.html             # HTML 301 redirect stub forwarding to index.html#education
├── portfolio.html             # HTML 301 redirect stub forwarding to index.html#projects
├── experiences.html           # HTML 301 redirect stub forwarding to index.html#experience
├── contact.html               # HTML 301 redirect stub forwarding to index.html#contact
│
├── admin/                     # Self-service admin portal
│   ├── index.html             # Dual-view single page app (Login View vs. Dashboard View)
│   ├── admin.css              # Minimal functional admin stylesheet
│   └── admin.js               # Client engine: auth status check, form rendering, instant upload & save
│
├── server/                    # Node/Express backend
│   ├── server.js              # Express app entrypoint & 301 redirect handler
│   ├── package.json           # Backend package manifest
│   ├── .env.example           # Environment template
│   ├── .env                   # Active server environment (ADMIN_PASSWORD_HASH, JWT_SECRET, PORT)
│   ├── middleware/
│   │   └── requireAuth.js     # JWT cookie authentication middleware
│   ├── routes/
│   │   ├── auth.js            # POST /api/login, POST /api/logout, GET /api/status
│   │   ├── content.js         # GET /api/content, PUT /api/content
│   │   └── upload.js          # POST /api/upload (Multer)
│   └── scripts/
│       └── generate-password-hash.js # Bcrypt hash generator tool
│
└── images/                    # Asset directory (37 portfolio image showcase files)
```

---

## 4. Visual Design System & Color Palette

The site utilizes the **"Crimson Mood Mode"** design system — a layered, warm plum-tinted dark background with the signature Neon Crimson Red accent and subtle gold for ratings.

### CSS Custom Variables (`:root` in `style.css`)
| Variable Name | Hex / Value | Usage & Psychological Rationale |
| :--- | :--- | :--- |
| `--bg-color` | `#0B0A0C` | Base warm plum-tinted dark background |
| `--bg-color-alt` | `#120D10` | Alternating section background for scroll rhythm |
| `--surface-color` | `#181315` | Dark surface color for cards, nav items & wrappers |
| `--surface-elevated` | `#211A1E` | Hover elevation for interactive cards |
| `--primary-color` | `#FF3B3B` | Neon Crimson Red signature accent (buttons, active nav, glows, logo dot) |
| `--primary-color-deep` | `#B8232A` | Secondary depth crimson for borders and pressed states |
| `--primary-glow` | `rgba(255, 59, 59, 0.18)` | Soft ambient radial glow fill |
| `--text-main` | `#F5F3F2` | Primary off-white text |
| `--text-muted` | `#A79FA1` | Warm grey body text |
| `--accent-secondary` | `#E8C15A` | Muted gold for star ratings and award highlights |
| `--error-color` | `#E85D3A` | Form validation warning color (separated from brand crimson) |
| `--font-main` | `'Space Grotesk', sans-serif` | Global typography |
| `--nav-height` | `80px` | Fixed navbar height |

### Visual Effects & Atmosphere
1. **Background Texture**: Fixed, 4% opacity SVG fractal noise overlay (`body::after`).
2. **Ambient Drift Glows (`.glow`)**: 350px radial glows with continuous 28s floating drift animation (`floatGlow`).
3. **Desktop Mouse Spotlight (`#hero-spotlight`)**: Interactive cursor spotlight tracking in the hero section.
4. **Animated Nav Link Underlines**: Center-outward scaling line (`scaleX(0)` → `scaleX(1)`).
5. **Marquee Pause-on-Hover**: Infinite marquee rows pause when hovered (`animation-play-state: paused`).

---

## 5. Section-by-Section Component Specification

1. **`#hero` (Hero Banner)**:
   - Badge: `GRAPHIC DESIGNER & CS STUDENT`.
   - Headline: `Designing Logic, Coding Creativity.` (with hover gradient shift).
   - Dual-Track CTAs: `Explore as Developer` (scrolls to `#projects`) & `Explore as Designer` (scrolls to `#design-work`).
2. **`#about` (Who I Am)**:
   - Profile Image Frame: `images/Mohsin.jpg` with hover zoom and grayscale transition.
   - Experience Badge: `3+ Years Experience`.
   - Bio Copy: Education at Daffodil International University, mastery in C++/Java/Python, key projects (*Buskoi*, *Utshobkori*, *Niramoy*), and Fiverr Level 1 5-star rating.
3. **`#testimonials` (Client Feedback)**:
   - Social proof cards (`voiceofprogress` 🇩🇪, `mipiti48` 🇺🇸, `yudula` 🇱🇰, `mildredwilli591` 🇺🇸) with gold star ratings (`#E8C15A`).
4. **`#education` (Academic Timeline)**:
   - B.Sc. in CSE (DIU, 8th Semester)
   - HSC (Milestone College, GPA 5.00/5.00)
   - SSC (Malekabanu Adarsha Bidyaniketan, GPA 4.78/5.00)
   - JSC (Green Lawn School, GPA 5.00/5.00)
5. **`#projects` (CSE Software Projects)**:
   - **Niramoy**: Featured AI Rural Telemedicine Assistant with 2-column highlight card layout and glowing badge.
   - **Buskoi**: Java/Firebase real-time university bus tracking app.
   - **Utshobkori**: C++/Qt Framework event management & budget tracking app.
6. **`#design-work` (Creative Gallery Marquees)**:
   - Row 1 & 2: High-CTR YouTube Thumbnails.
   - Row 3: Facebook Cover Design.
   - Row 4: YouTube Channel Art.
   - Row 5: Poster Design.
7. **`#experience` (Work History & Services)**:
   - Split Cards: Graphic Designing Expert (3+ yrs) & Fiverr Level 1 Seller (`designworldmn`).
   - Stats Row: `10k+ Projects`, `200+ Clients`, `50k+ Audience`.
   - Course Promo: Graphic Design Complete Course (Photoshop & Illustrator) linked to YouTube playlist.
   - Brand Logos Marquee, Why Choose Me Grid (6 cards), Services Grid (6 cards).
8. **`#certificates` (Certificates & Awards)**:
   - Parenting with Purpose (GoEdu), Setting & Achieving Goals (GoEdu), Unlock the Algorithm (DIU CPC), Art Exhibition 1st Prize.
9. **`#contact` (Contact & Message Form)**:
   - Info Cards: Phone, WhatsApp (`01841389506`), Email (`mohsin.diu.cse@gmail.com`), Uttara (Dhaka) & Gopalpur (Tangail) addresses, Social links.
   - Contact Form: Name, Email, Subject, Message with glowing focus states and error separation.

---

## 6. Self-Service Admin Panel (`/admin`)

- **Route**: `http://localhost:3000/admin` (hidden from public navigation).
- **Authentication**: Password login against `ADMIN_PASSWORD_HASH` (`admin123`).
- **Dashboard Features**:
  - Accordion section forms mapped 1:1 to `content.json`.
  - Dynamic array addition/removal for testimonials, education, projects, experience, certificates, why choose me, and services.
  - Instant file uploader (`POST /api/upload`) with live thumbnail previews.
  - Per-section `"Save Section"` and global `"Save All Changes"` actions updating `content.json` on disk.

---

## 7. Instructions for AI Agents & Developers

1. **Brand Accent Constraint**: Maintain `#FF3B3B` (Crimson Red) as the primary accent color. Use `#E8C15A` (Muted Gold) only for ratings and awards.
2. **Server Execution**: To run the backend server:
   ```bash
   cd server
   npm start
   ```
3. **Data Integrity**: Never edit HTML text directly for content updates; update `content.json` or use the `/admin` dashboard.
4. **Icons & Fonts**: Use Phosphor Icons (`<i class="ph ph-..."></i>`) and Space Grotesk font family exclusively.
