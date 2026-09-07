# CODEBITS BRAIN

Living Engineering Memory & Architectural Source of Truth for CodeBits.
*Last Updated: 2026-09-07 | Status: Verified & Persistent*

---

## 1. Project Identity

- **Project Name**: CodeBits Portal
- **Working Identity**: CodeBits by Prof. MRF (Prof. Rohit Falake)
- **Product Name**: CodeBits Academic Vault & Institutional Portal
- **Product Purpose**: Centralized, secure, and authenticated academic repository and institutional gateway designed specifically for Mumbai University engineering students. It consolidates previous-year question papers (PYQs), notes, syllabi, and solutions into a structured, moderated catalog with high-fidelity canvas document protection, single-device session locking, and AI-assisted discovery.
- **Target Institution / Academic Context**: Mumbai University (MU) affiliated engineering colleges and students.
- **Academic Scope**: Engineering branches (COMPS, IT, EXTC, Mechanical, Civil, AIDS, AIML, etc.), Semesters 1 through 8, under the Rev-2019 'C' Scheme curriculum.
- **Target Users**:
  - Mumbai University Engineering Students (Undergraduate, FE to BE)
  - Faculty Members & Academic Mentors
  - Platform Administrators / Academic Resource Moderators (led by Prof. MRF)
  - Public & Prospective Visitors (Exploring centers, placements, and curriculum resources)
- **Current Development Phase**: `FRONTEND IMPLEMENTED / BACKEND PENDING`

---

## 2. Product Vision

Academic resources across Mumbai University colleges are historically fragmented across unindexed WhatsApp chats, personal Google Drives, Telegram channels, and ephemeral student exchanges. This unstructured distribution leads to severe problems:
1. **Poor Discoverability**: Students waste hours locating the correct syllabus, notes, or PYQ solutions for specific schemes and semesters.
2. **Duplicate & Stale Files**: Multiple inconsistent versions circulate without provenance or syllabus scheme validation (e.g., Rev-2016 Choice Based vs. Rev-2019 'C' Scheme).
3. **No Quality or Moderation Control**: Unverified notes and incorrect answer keys spread freely without peer or faculty moderation.
4. **Weak Document Ownership & Privacy**: Student contributors receive no attribution, and institutional assets are scraped or redistributed without attribution.
5. **Lack of an Institutional Presentation Layer**: High-quality academic mentorship, faculty achievements, placement records, and training centers lack a modern, unified technical presence.

CodeBits solves this by replacing ad-hoc distribution with an authoritative, curated, and protected institutional vault. The product is crafted as a **serious, dark, restrained, editorial, and technical academic platform**—deliberately eschewing flashy startup tropes and generic AI aesthetics. Motion is purposeful and communicative, typography is structural, and data integrity is paramount.

---

## 3. Users

| User Role | Identification & Auth | Permissions & Capabilities | Explicit Prohibitions & Constraints |
|---|---|---|---|
| **Public / Guest Visitor** | Unauthenticated | • View Landing page (`/`)<br>• View About & Centers page (`/about`)<br>• Browse public Vault catalog (`/vault`) metadata<br>• Submit institutional inquiries (`inquiries` table)<br>• Access public institutional metrics and faculty directory | • Cannot open or render protected documents (`/viewer/[id]`)<br>• Cannot upload academic resources (`/upload`)<br>• Cannot read stored inquiry submissions<br>• Cannot access unapproved/pending resources |
| **Student** | Authenticated via Supabase Auth (Email or Phone + Password; no OTP) | • All Public capabilities<br>• View protected PDF documents in the canvas-based DRM viewer (`/viewer/[id]`) with active dynamic personal watermark<br>• Upload resources to `/upload` (status defaults to `pending`)<br>• Track status of self-submitted resources<br>• Use cbAI natural language resource discovery (`Ctrl+K`) | • Strictly restricted to ONE concurrent active device session (enforced via Realtime `current_session_id`)<br>• Cannot view unapproved/rejected resources belonging to others<br>• Cannot moderate or publish resources directly to the live vault<br>• Cannot bypass watermarking or canvas extraction layers |
| **Administrator** | Authenticated via Supabase Auth with server-verified `role = 'admin'` | • All Student & Public capabilities<br>• Access moderation queue to inspect, approve, or reject pending submissions<br>• Direct publish resources (status immediately set to `approved`)<br>• Edit resource attribution and academic taxonomy<br>• View inquiries and platform analytics | • Cannot rely on client-asserted role; permissions must be strictly verified server-side via Supabase RLS and Service Role API checks |

---

## 4. Product Areas

### 4.1 Landing Experience (`/`)
- **Purpose**: Articulate the CodeBits mission, establish brand credibility, convey Mumbai University academic focus, and direct students seamlessly into the Vault.
- **Key Sections**:
  - Global Sticky Navigation (Monogram, title, drawer trigger, Access Vault CTA).
  - Kinetic SVG Hero Sequence (`Skiper19` scroll-scrubbed path conveying Problem → Discovery → Connection → CodeBits → Resources).
  - Interstitial contextual editorial statements (`TextAnimate` with `blurInUp` revealing statements like "scattered resources? we got you").
  - Title Climax (`ScrollFloat` character reveal of `CODEBITS` with GSAP scrub and scale transforms).
  - Prominent "Continue to Resources" call-to-action.
- **Constraints**: Absolutely no fabricated statistics, floating gradient blobs, or generic chatbot widgets.

### 4.2 About & Centers (`/about`)
- **Purpose**: Institutional credibility, placement track record, mentorship, and faculty showcase.
- **Key Sections**:
  - Institutional Key Metrics powered by `@number-flow/react` and `Skiper37` (Candidates Placed, Hiring Partners, Average CTC—sourced strictly from verified data).
  - Partner Marquee (Horizontal ticker displaying verified recruiting/institutional partner marks).
  - Faculty Showcase (`Tailwind Image Accordion` displaying authentic faculty portraits from `public/FACULTY/`, designations, and domains).
  - Center Information & Academic Mentorship Programs.
  - Institutional Inquiry Capture Form.

### 4.3 Academic Vault (`/vault`)
- **Purpose**: Core functional repository for Mumbai University academic assets.
- **Key Capabilities**:
  - Filter by Branch (COMPS, IT, EXTC, MECH, CIVIL, AIDS, etc.).
  - Filter by Semester (Sem 1 through Sem 8).
  - Filter by Category (`PYQ`, `Notes`, `Syllabus`, `Solution`).
  - Search by Subject / Course Name.
  - Catalog Cards displaying title, subject, branch, semester, scheme (Rev-2019 'C'), and verified uploader attribution.
  - Public visibility strictly constrained to records where `status = 'approved'`.
  - Realistic empty states guiding students to contribute missing assets.

### 4.4 Authentication (`/login`, registration flow)
- **Purpose**: Identity verification and single-device session establishment.
- **Mechanics**:
  - Dual-identifier login: Accepts either standard Email or 10-digit Indian Mobile number (`^[6-9]\d{9}$`).
  - Server-side email resolution for phone-based logins.
  - Password authentication via Supabase Auth without OTP friction.
  - Automatic creation/syncing of `profiles` row upon signup.
  - Issues unique `current_session_id` stored on the user's profile on every successful login.

### 4.5 Protected Document Viewer (`/viewer/[id]`)
- **Purpose**: Secure, distraction-free, in-browser document study environment.
- **Mechanics**:
  - Server and client auth gates ensure only authenticated users enter.
  - Document streamed/loaded securely without exposing direct static URLs or iframe embeds.
  - Document decomposed and rendered page-by-page onto HTML5 `<canvas>` elements using `pdf.js`.
  - Dynamic user-stamped watermark rendered onto canvas context: Full Name + Phone Number + CodeBits Academic License.
  - Client-side deterrence protections: Context-menu disable, text selection disable, print/save shortcut interception, focus-loss canvas obscuring.
  - Continuous background session verification: Instant eviction if concurrent login detected.

### 4.6 Community Upload (`/upload`)
- **Purpose**: Crowdsourced academic resource contribution pipeline.
- **Form Inputs**: Subject name, Branch, Semester, Document Category (`PYQ`, `Notes`, `Syllabus`, `Solution`), and PDF file.
- **Moderation Workflow**:
  - Submissions by regular students are flagged as `status = 'pending'`.
  - Submissions by verified admins are flagged as `status = 'approved'`.
  - Pending submissions are invisible in the public Vault until approved by an administrator.

### 4.7 cbAI Intelligent Discovery (`Ctrl + K` / Global Dock)
- **Purpose**: Natural-language search layer converting conversational student queries into precise database filters.
- **Mechanics**:
  - Global shortcut `Ctrl + K` or search trigger opens a minimalist terminal/dock interface (NOT a chat bubble or avatar bot).
  - Server-side route (`/api/cb-ai`) processes queries via Google Gemini API.
  - Strict structured JSON extraction: `{ branch?: string, semester?: number, subject?: string, category?: string }`.
  - Queries Supabase `resources` table with extracted parameters, returning exclusively approved records.
  - Zero-hallucination mandate: If no matching document exists in the database, returns: *"Not available or not uploaded yet. Be the first to upload!"*

### 4.8 Institutional Inquiries (`inquiries`)
- **Purpose**: Lead and inquiry capture for academic training programs and institutional partnerships.
- **Form Inputs**: Full Name, Phone Number, Email Address, Selected Program / Interest.
- **Access Control**: Public write-only; read-access restricted exclusively to administrators.

---

## 5. Complete Product Workflow

### 5.1 Resource Discovery & Protected Reading Flow
```text
Public User arrives at Landing (/)
      ↓
Navigates to /vault (or uses ScrollStack nav drawer)
      ↓
Applies Filters (Branch: COMPS, Sem: 4, Category: PYQ)
      ↓
Views Catalog of Approved Resources
      ↓
Clicks "View Resource" on a document card
      ↓
Is User Authenticated?
  ├── NO  → Redirect to /login (with return URL)
  │           ↓
  │         User registers / logs in (Email/Phone + Password)
  │           ↓
  │         New session UUID written to profiles.current_session_id
  │           ↓
  │         Redirect back to /viewer/[id]
  │
  └── YES → Fetch resource metadata & verify permissions
              ↓
            pdf.js loads PDF stream
              ↓
            HTML5 Canvas renders individual pages
              ↓
            Watermark injected (Student Name + Phone + Timestamp)
              ↓
            Realtime session watcher active; study session begins
```

### 5.2 Community Contribution & Moderation Flow
```text
Student logs in
      ↓
Navigates to /upload
      ↓
Fills metadata (Subject, Branch, Sem, Category) & attaches PDF
      ↓
Submits form → Inserted into Supabase `resources` with status='pending'
      ↓
Resource is HIDDEN from public Vault search and cbAI
      ↓
Administrator logs in → Opens Moderation Dashboard
      ↓
Admin inspects metadata & previews submitted PDF
      ↓
Decision:
  ├── REJECT → status='rejected' (Feedback logged; remains hidden)
  └── APPROVE → status='approved' (Immediately indexed in Vault & cbAI)
```

### 5.3 cbAI Natural Language Discovery Flow
```text
Student presses [Ctrl + K]
      ↓
Types: "sem 3 comps maths 3 pyq solution"
      ↓
Client POST to /api/cb-ai
      ↓
Server sends query + taxonomy rules to Google Gemini API
      ↓
Gemini extracts structured parameters:
  {
    "branch": "Computer Engineering",
    "semester": 3,
    "subject": "Applied Mathematics III",
    "category": "solution"
  }
      ↓
Server queries Supabase:
  SELECT * FROM resources 
  WHERE status = 'approved' 
    AND semester = 3 
    AND (branch ILIKE '%comps%' OR branch ILIKE '%computer%')
    AND category = 'solution'
      ↓
Records Found?
  ├── YES → Returns verified cards directly in the search dock
  └── NO  → Returns exact message:
            "Not available or not uploaded yet. Be the first to upload!"
```

### 5.4 Concurrent Device Session Guard Flow
```text
Student logs into Device A
  → profiles.current_session_id = UUID_ALPHA
  → Device A client stores UUID_ALPHA and subscribes to Realtime UPDATEs on its profile
      ↓
Student subsequently logs into Device B
  → profiles.current_session_id updated to UUID_BETA
      ↓
Supabase Realtime pushes row update event to Device A
      ↓
Device A detects: stored UUID_ALPHA != received UUID_BETA
      ↓
Device A triggers emergency eviction:
  1. Destroys active Canvas / PDF render memory
  2. Calls supabase.auth.signOut()
  3. Clears local session cache
  4. Redirects to /login?reason=concurrent_device
      ↓
UI shows notice: "You were logged out because your account was accessed from another device."
```

---

## 6. Route Map

| Route | Route Type | Access Tier | Status | Planned Key Components | Dependencies / Services | Critical Constraints |
|---|---|---|---|---|---|---|
| `/` | Page (Public) | Public | `PLANNED` | `Navbar`, `Skiper19Scroll`, `TextAnimate`, `ScrollFloatTitle`, `ScrollStackNav` | GSAP, Framer Motion, Lenis, Next.js | No gradients, no emojis, no fake stats. Monogram uses `public/LOGO CB.png`. |
| `/about` | Page (Public) | Public | `PLANNED` | `Navbar`, `Skiper37Stats`, `FacultyAccordion`, `MarqueeBanner`, Inquiry Form | `@number-flow/react`, `public/FACULTY/`, Supabase `inquiries` | Real faculty portraits only; no mock metrics. |
| `/vault` | Page (Public) | Public | `PLANNED` | `Navbar`, `ResourceFilters`, `ResourceGrid`, `ResourceCard`, `CbAiDrawer` | Supabase Client, Next.js App Router | Only `status = 'approved'` shown. No fake cards. Monospace metadata tags. |
| `/login` | Page (Auth) | Public / Unauth | `PLANNED` | `LoginForm`, `RegisterForm`, `AnimatedThemeToggler` | Supabase Auth, Next.js Server Actions | Supports Email or Indian Phone (`^[6-9]\d{9}$`). No OTP. Sets `current_session_id`. |
| `/viewer/[id]` | Page (Protected) | Authenticated | `PLANNED` | `ProtectedCanvasViewer`, `WatermarkLayer`, `SessionGuard` | `pdf.js`, HTML5 Canvas, Supabase Realtime | No iframe embed. Dynamic user watermark. Context menu & shortcut deterrence. Instant eviction on concurrent session. |
| `/upload` | Page (Protected) | Authenticated | `PLANNED` | `ResourceUploadForm`, `SessionGuard` | Supabase Storage, Supabase DB | Regular student uploads enter as `pending`. Admin uploads enter as `approved`. |
| `/admin/moderation` | Page (Protected) | Admin Only | `PLANNED` | `ModerationQueue`, `ReviewCard` | Supabase Server Client, RLS | Strict server-side role check (`role === 'admin'`). |
| `/api/cb-ai` | API Route | Public / Auth | `PLANNED` | Route Handler (`route.ts`) | Google Gemini API (`@google/genai` or REST), Supabase DB | Secret API key strictly on server. Outputs structured JSON. Zero hallucinations. |

---

## 7. Current Development Phase

```text
===================================================================
CURRENT PHASE: FRONTEND PLANNING / FRONTEND NOT YET IMPLEMENTED
===================================================================
```
- The repository is currently in its initial structural inception.
- Documentation and architecture have been thoroughly imported and verified.
- Core brand and faculty visual assets are present on disk under `public/`.
- No application code, Next.js scaffolding, or packages have been installed yet.

---

## 8. Implementation Status

| Feature / Artifact | Status | Notes & Verification |
|---|---|---|
| Project Architecture Docs | `VERIFIED` | 5 Markdown documents verified in `public/CodeBits_Documentation/`. |
| Project Living Memory (`brain.md`) | `VERIFIED` | Persistent project memory maintained; Iteration 2 logged. |
| Brand Asset (`LOGO CB.png`) | `VERIFIED` | Present at `codebits/public/LOGO CB.png` & root `public/`. |
| Faculty Portraits (`public/FACULTY/`) | `VERIFIED` | 8 WebP images present in `codebits/public/FACULTY/` and `faculty/`. |
| Partner Assets (`public/partners/`) | `PLANNED` | Directory and assets not yet present on disk. |
| Next.js Scaffold & Config | `IMPLEMENTED` | Next.js 16 (Turbopack, TypeScript, Tailwind v4). |
| Tailwind CSS & Design Tokens | `IMPLEMENTED` | Obsidian/Emerald tokens, dark & light mode, anti-gradient rule in `globals.css`. |
| Global Shell & Navigation | `IMPLEMENTED` | `Navbar` with brand monogram, `ScrollStackNav` drawer, `Footer`, `AnimatedThemeToggler`. |
| Landing Motion Engine (GSAP/Lenis/Skiper) | `IMPLEMENTED` | `Skiper19Scroll` kinetic path, `TextAnimate` reveal, `ScrollFloatTitle` GSAP climax. |
| Institutional About & Faculty | `IMPLEMENTED` | `Skiper37Stats` with NumberFlow transitions, `FacultyAccordion`, `InquiryForm`. |
| Vault Catalog & Filtering | `IMPLEMENTED` | `ResourceFiltersBar`, `ResourceGrid`, `ResourceCard`, authentic empty state. |
| Authentication UI | `IMPLEMENTED` | `LoginForm` (dual email/phone), `RegisterForm`, single active session notice. |
| Community Upload UI | `IMPLEMENTED` | `ResourceUploadForm` with PDF dropzone and moderation lifecycle preview. |
| Protected Canvas PDF Viewer | `IMPLEMENTED` | `ProtectedCanvasViewer` with HTML5 canvas, forensic watermark, deterrence listeners. |
| cbAI Command Search Dock | `IMPLEMENTED` | `CbAiDrawer` (`Ctrl+K`), structured parameter compiler, zero-hallucination fallback. |
| Supabase Auth & Session Guard (Backend) | `PLANNED` | Frontend interfaces ready; backend database integration pending. |
| Database Schema & RLS (Backend) | `PLANNED` | SQL structures defined in documentation; migrations pending. |

---

## 9. Design System

CodeBits adopts an **institutional, dark, editorial, technical, and restrained aesthetic**. It mimics a high-precision academic instrument or an archival terminal rather than a commercial SaaS app.

### 9.1 Color Tokens
```css
/* Core Color Tokens */
--bg-base:        #0B0F0E; /* Obsidian Charcoal: primary background */
--surface-base:   #131917; /* Deep Emerald-tinted Slate: cards, panels, drawers */
--border-subtle:  #1F2925; /* Structural Border: muted dividers, card outlines */
--brand-primary:  #00C269; /* Primary Emerald: accents, active states, key CTAs */
--brand-dark:     #009E52; /* Dark Emerald: hover states, subdued brand elements */
--text-primary:   #F8FAFC; /* Slate 50: high contrast headings and primary copy */
--text-secondary: #94A3B8; /* Slate 400: secondary copy, descriptive notes */
--text-muted:     #64748B; /* Slate 500: timestamps, disabled states */
```

### 9.2 Absolute Anti-Gradient Rule
- **No linear or radial color gradients** on backgrounds, text, buttons, or borders.
- Depth and hierarchy are achieved exclusively through:
  - Solid surface elevations (`#0B0F0E` vs. `#131917`)
  - Crisp structural borders (`#1F2925`)
  - Subtle opacity variations
  - Controlled box shadows and backdrop blur filters

### 9.3 Typography System
- **Interface / Body Type**: `Inter` or `Plus Jakarta Sans`
  - High legibility, neutral geometry, excellent hinting for technical interfaces.
- **Technical / Metadata Type**: `JetBrains Mono` or `Geist Mono`
  - Used strictly for: Academic Scheme (`Rev-2019 'C'`), Branch tags (`COMPS`, `EXTC`), Semester badges (`SEM-IV`), Document hashes/IDs, System status badges, Watermarks, and Filter counts.
  - Never use monospace for long prose or continuous body paragraphs.

### 9.4 Surface & Border Principles
- Containers and cards must use subtle rounded corners (`rounded-lg` / `8px` or `rounded-md` / `6px`).
- Never use bubbly, oversized rounded corners (`rounded-3xl` or pill-shaped cards) for content panels.
- Every container has an explicit border (`1px solid #1F2925`).

### 9.5 Navigation & Motion Philosophy
- Motion is strictly functional and informative (illustrating hierarchy, transitions, and scroll progression).
- Must adhere strictly to `prefers-reduced-motion` media queries. The interface must remain 100% accessible and visually stable with zero animation enabled.

---

## 10. Non-Negotiable Design Rules

To preserve institutional integrity and prevent degradation into generic "AI slop," the following rules are **permanently non-negotiable**:

1. **NO Gradients**: Absolutely no CSS gradients on cards, backgrounds, or text.
2. **NO Emojis**: Emojis are strictly banned in UI copy, labels, buttons, cards, and system notifications. Use clean SVG icons (Lucide/Heroicons) where necessary.
3. **NO Fake Statistics**: Never insert placeholder numbers like "10,000+ Students", "99% Success Rate", or "50,000+ Downloads". Display only verified data or empty states.
4. **NO Fake Faculty**: Only real faculty portraits and profiles located in `public/FACULTY/` may be rendered.
5. **NO Fake Academic Resources / Mock Data**: Never seed or hardcode fake mock resources like "Sample Math Notes by John Doe". An empty vault displays the real empty state with an upload invitation.
6. **NO Generic AI Dashboard Aesthetic**: Avoid purple/cyan glows, excessive blur glassmorphism, floating cards with colored drop-shadows, and neon cyberpunk borders.
7. **NO Unnecessary Glowing Blobs**: Do not use ambient colored blurred blurbs behind sections.
8. **NO Random 3D Elements**: No Spline scenes, floating 3D geometric shapes, or decorative 3D icons.
9. **NO Meaningless Animations**: Avoid infinite floating badges, continuous pulsing effects, or animations attached to static data cards.
10. **NO Generic AI Sparkles**: Never use star/sparkle icons to brand cbAI.
11. **NO Chatbot-Style cbAI Interface**: cbAI is a high-speed search dock / command palette (`Ctrl + K`), NOT a conversational bot with avatars and chat bubbles.
12. **NO Fabricated Institutional Claims**: Never invent partner logos, university accreditations, or training claims.

---

## 11. External Components

Every external library and component specified by the CodeBits architecture has a dedicated, non-overlapping role:

| Component / Library | Origin / Spec | Purpose & Responsibility | Target Placement | Expected Behavior | Installation Status | Implementation Status |
|---|---|---|---|---|---|---|
| **ScrollStack** | UI Component Spec | Full-viewport stacked navigation drawer | `components/navigation/ScrollStackNav.tsx` | Stacked card panels overlaying the screen upon menu toggle; smooth routing triggers | Not Installed | `PLANNED` |
| **Lenis** | `@studio-freight/lenis` / `lenis` | Global smooth-scroll foundation | App Root / `globals.css` / Navigation wrapper | Unified virtual scroll smoothing; synchronized with ScrollTrigger | Not Installed | `PLANNED` |
| **Skiper19** | Custom Section Spec | Landing-page kinetic SVG scroll path | `components/sections/Skiper19Scroll.tsx` | Emerald SVG stroke drawing locked to scroll position, bridging narrative steps | Not Installed | `PLANNED` |
| **TextAnimate** | Motion Spec | Editorial interstitial statement reveal | `components/sections/TextAnimate.tsx` | Character/word `blurInUp` scroll reveals ("scattered resources? we got you") | Not Installed | `PLANNED` |
| **ScrollFloat** | Motion / GSAP Spec | CodeBits climactic title character reveal | `components/sections/ScrollFloatTitle.tsx` | Character-by-character scrubbed stagger (`yPercent: 120→0`, `scaleY: 2.3→1`) | Not Installed | `PLANNED` |
| **GSAP & ScrollTrigger** | `gsap` | High-precision scroll-linked timeline sequences | Landing & Title Reveal | Scrubbed typographic reveals; character-level animations | Not Installed | `PLANNED` |
| **Skiper37** | Custom Section Spec | Institutional statistics presentation | `components/sections/Skiper37Stats.tsx` | Clean, high-density metric grid on `/about` | Not Installed | `PLANNED` |
| **@number-flow/react** | `@number-flow/react` | Smooth numeric digit transitions | `components/sections/Skiper37Stats.tsx` | Morphing digits when institutional metrics load or update | Not Installed | `PLANNED` |
| **Tailwind Image Accordion** | Interactive Spec | Faculty directory interactive accordion | `components/sections/FacultyAccordion.tsx` | Responsive expanding horizontal columns on hover/focus revealing faculty details | Not Installed | `PLANNED` |
| **AnimatedThemeToggler** | Global UI Spec | Dark/system theme toggle utility | Navigation Utility Bar | Clean icon morphing transition for theme switching without color flashes | Not Installed | `PLANNED` |
| **Framer Motion** | `framer-motion` | Component-level UI transitions | Global / Modals / Drawers / Filters | Route enters, modal popovers, drawer open/close, tab switching | Not Installed | `PLANNED` |
| **pdf.js** | `pdfjs-dist` | In-memory PDF decompression & page rendering | `components/drm/ProtectedCanvasViewer.tsx` | Renders PDF pages directly to HTML5 canvas; prevents native PDF iframe exposure | Not Installed | `PLANNED` |
| **Supabase Client & Auth** | `@supabase/supabase-js`, `@supabase/ssr` | Identity, DB queries, Realtime subscriptions | `lib/supabase/` | SSR-compatible cookie auth, DB access, session locking | Not Installed | `PLANNED` |
| **Google Gemini API** | `@google/genai` or REST | Semantic search query parameter extraction | `app/api/cb-ai/route.ts` | Interprets user natural language into structured SQL filter parameters | Not Installed | `PLANNED` |

---

## 12. Component Ownership

To prevent animation and state libraries from competing over the same DOM elements, ownership boundaries are strictly demarcated:

```text
GSAP + ScrollTrigger
  └── OWNS: Landing hero scroll timeline, ScrollFloat typography, character stagger scrub.
      (Framer Motion must NEVER animate ScrollFloat elements).

Framer Motion
  └── OWNS: Local UI state transitions, drawer entrances, modal popups, filter tab sliding.
      (GSAP must NEVER animate generic UI drawers or buttons).

Lenis
  └── OWNS: Window-level smooth scrolling.
      (Must have exactly ONE instance initialized globally and linked to ScrollTrigger.update).

ScrollStack
  └── OWNS: Fullscreen navigation overlay drawer.

Skiper19
  └── OWNS: Landing SVG kinetic path element exclusively.

Tailwind Image Accordion
  └── OWNS: Faculty grid flex-expansion exclusively via Tailwind transition utilities.

pdf.js + HTML5 Canvas
  └── OWNS: Document presentation layer and watermark rendering.
```

---

## 13. Asset Inventory

### 13.1 Verified Existing Assets
- **`public/LOGO CB.png`**:
  - Size: 955,868 bytes
  - Role: Official CodeBits primary monogram and brand identifier.
  - Usage: Primary sticky navigation, viewer header, metadata attribution.
  - Constraint: **Must never be replaced** with AI-generated logos, random SVG placeholders, or plain text.
- **`public/FACULTY/`** (Directory name uppercase on disk):
  - 8 Authentic Faculty WebP portraits:
    1. `Prof. Bharat Acharya.webp` (28,918 bytes)
    2. `Prof. Om Baviskar.webp` (28,542 bytes)
    3. `Prof. Prashant Patil.webp` (28,478 bytes)
    4. `Prof. Rohit Falake (M.R.F).webp` (26,966 bytes) — Lead Mentor / Founder
    5. `Prof. Sameer Velenkar.webp` (16,168 bytes)
    6. `Prof. Sunil Jadhav.webp` (21,790 bytes)
    7. `Prof. Sunil Nagare.webp` (29,162 bytes)
    8. `Prof. Vineet Kutty.webp` (26,088 bytes)
  - Constraint: Must be consumed directly in the `FacultyAccordion` component. No fictitious faculty may be added.

### 13.2 Planned Assets (Documented but Not Yet in Repo)
- `public/partners/`: Folder intended for hiring partner SVGs/logos (e.g., tech recruiters, partner companies). Currently missing from disk.

---

## 14. Data Architecture

The persistence model is built on Supabase (PostgreSQL) with strict Row Level Security (RLS).

### 14.1 `profiles`
Tracks authenticated user details, assigned permissions, and active session tokens.
- `id`: `uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- `full_name`: `text NOT NULL`
- `email`: `text UNIQUE NOT NULL`
- `phone`: `text UNIQUE NOT NULL` (Matches `^[6-9]\d{9}$`)
- `role`: `text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin'))`
- `current_session_id`: `uuid NULL` (Rotated on every login; monitored via Realtime)
- `created_at`: `timestamptz DEFAULT now()`
- `updated_at`: `timestamptz DEFAULT now()`

### 14.2 `resources`
The core academic catalog containing all Mumbai University assets.
- `id`: `uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- `title`: `text NOT NULL`
- `subject`: `text NOT NULL`
- `branch`: `text NOT NULL` (e.g., `'Computer Engineering'`, `'Information Technology'`)
- `semester`: `smallint NOT NULL CHECK (semester BETWEEN 1 AND 8)`
- `scheme`: `text NOT NULL DEFAULT 'Rev-2019 C Scheme'`
- `category`: `text NOT NULL CHECK (category IN ('pyq', 'notes', 'syllabus', 'solution'))`
- `file_url`: `text NOT NULL` (Supabase Storage path in a private bucket)
- `file_size`: `bigint NULL`
- `page_count`: `integer NULL`
- `uploader_id`: `uuid NOT NULL REFERENCES profiles(id)`
- `status`: `text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))`
- `view_count`: `integer DEFAULT 0`
- `created_at`: `timestamptz DEFAULT now()`
- `updated_at`: `timestamptz DEFAULT now()`

### 14.3 `inquiries`
Institutional contact and prospective student interest capture.
- `id`: `uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- `name`: `text NOT NULL`
- `email`: `text NOT NULL`
- `phone`: `text NOT NULL`
- `program`: `text NOT NULL`
- `message`: `text NULL`
- `created_at`: `timestamptz DEFAULT now()`

### 14.4 Row Level Security (RLS) Policies
1. **`profiles`**:
   - `SELECT`: Users can read their own profile; Admins can read all profiles.
   - `UPDATE`: Users can update their own profile; Admins can update any profile.
2. **`resources`**:
   - `SELECT`: Public can read where `status = 'approved'`. Authenticated users can additionally read their own submissions (`uploader_id = auth.uid()`). Admins can read all.
   - `INSERT`: Authenticated users can insert rows provided `uploader_id = auth.uid()` and `status = 'pending'`. Admins can insert with `status = 'approved'`.
   - `UPDATE` / `DELETE`: Admins only.
3. **`inquiries`**:
   - `INSERT`: Public (anon) and authenticated users can insert.
   - `SELECT`: Admins only (anon users cannot read inquiry records).

---

## 15. Authentication Architecture

CodeBits utilizes **Supabase Auth** tailored to Indian university student demographics:

1. **Dual Login Identifiers**:
   - Students may log in using their **Email Address** OR their **10-Digit Indian Phone Number**.
   - Because Supabase Auth natively authenticates against email, phone-based login executes through a server-side resolver:
     ```text
     Client submits Phone + Password
               ↓
     Server Action queries profiles table by phone
               ↓
     Resolves associated email address
               ↓
     Calls supabase.auth.signInWithPassword({ email, password })
     ```
2. **Registration Contract**:
   - Fields: Full Name, Email Address, 10-Digit Indian Mobile Number (`^[6-9]\d{9}$`), Password.
   - Email confirmation is explicitly disabled in initial specs to avoid delivery friction.
   - Profile creation is synchronized immediately via a database trigger or post-signup server action.
3. **No OTP Friction**:
   - To prevent SMS gateway delivery delays during exam rushes, OTP verification is excluded from this phase.
4. **Session Identifier Lifecycle**:
   - Upon every successful login, a cryptographic UUID is generated (`crypto.randomUUID()`).
   - This UUID is saved into `profiles.current_session_id` and cached in the client's memory/cookies.

---

## 16. Security Architecture

### 16.1 Single-Device Active Session Enforcement
CodeBits enforces a strict 1-account-1-device policy to prevent account sharing across campus:
1. When a student logs into Device B, a new `current_session_id` is written to their `profiles` record.
2. Device A maintains an active Supabase Realtime channel listening to updates on its own `profiles` row.
3. Upon receiving the update, Device A detects a mismatch between its local session ID and the remote `current_session_id`.
4. Device A instantly tears down the Canvas viewer, signs out, and redirects to:
   `/login?reason=concurrent_device`
5. A user-friendly message notifies the student: *"You were logged out because this account was accessed from another device."*

### 16.2 Protected Canvas PDF Viewer (Document Deterrence)
To protect academic intellectual property without degrading student usability:
- **No Direct PDF Exposure**: The browser's native PDF reader and `<iframe>` tags are strictly prohibited.
- **Canvas Decomposition**: `pdf.js` loads the PDF binary into memory and rasterizes pages directly to an HTML5 `<canvas>` element.
- **Dynamic Forensic Watermarking**: A canvas overlay stamps:
  - Student's Full Name
  - Student's Phone Number
  - Timestamp & CodeBits Licensing Stamp
- **Client Deterrence Controls**:
  - `contextmenu` events suppressed on the viewer container.
  - CSS user-select disabled (`user-select: none`).
  - Keyboard shortcuts for Print (`Ctrl+P` / `Cmd+P`) and Save (`Ctrl+S` / `Cmd+S`) intercepted.
  - Window blur detection: When the window loses focus, the canvas is masked.
- **Security Honesty Principle**: These mechanisms are documented as *deterrence controls*. The system never claims to provide unbreakable DRM against screen capture or external cameras.

---

## 17. cbAI Architecture

### 17.1 Role & Operation
cbAI is an intelligent, low-latency search assistant invoked via `Ctrl + K` or a dedicated search dock:
- It uses the Google Gemini API to translate natural language into structured academic taxonomy.
- Example user prompt: *"comps 4th sem applied maths pyq 2023"*
- Target structured JSON extraction:
  ```json
  {
    "branch": "Computer Engineering",
    "semester": 4,
    "subject": "Applied Mathematics IV",
    "category": "pyq"
  }
  ```

### 17.2 Zero-Hallucination Mandate
- Gemini **never** provides resource contents, links, or answers directly.
- The structured parameters are validated by the server and run against the Supabase `resources` table.
- If no matching resource exists in the database, the system must return:
  > *"Not available or not uploaded yet. Be the first to upload!"*
- The AI must never invent, summarize, or fabricate non-existent exam papers or solutions.

---

## 18. Intended Folder Structure

Based on `05_FOLDERMANAGEMENTDOC_CodeBits.md`, the planned architecture is organized as:

```text
codebits/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── viewer/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── upload/
│   │       └── page.tsx
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── vault/
│   │       └── page.tsx
│   ├── api/
│   │   └── cb-ai/
│   │       └── route.ts
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ai/
│   │   └── CbAiDrawer.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── drm/
│   │   ├── ProtectedCanvasViewer.tsx
│   │   └── WatermarkLayer.ts
│   ├── navigation/
│   │   ├── Navbar.tsx
│   │   └── ScrollStackNav.tsx
│   ├── resources/
│   │   ├── ResourceCard.tsx
│   │   ├── ResourceFilters.tsx
│   │   └── ResourceGrid.tsx
│   ├── upload/
│   │   └── ResourceUploadForm.tsx
│   ├── sections/
│   │   ├── FacultyAccordion.tsx
│   │   ├── MarqueeBanner.tsx
│   │   ├── Skiper19Scroll.tsx
│   │   ├── Skiper37Stats.tsx
│   │   └── ScrollFloatTitle.tsx
│   └── ui/
│
├── hooks/
│   └── useSessionGuard.ts
│
├── lib/
│   ├── gemini.ts
│   ├── validation.ts
│   ├── resources.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
│
├── types/
│   ├── auth.ts
│   ├── resources.ts
│   ├── inquiries.ts
│   └── ai.ts
│
├── public/
│   ├── CodeBits_Documentation/  [EXISTING]
│   ├── FACULTY/                 [EXISTING - uppercase on disk]
│   ├── LOGO CB.png              [EXISTING]
│   └── partners/                [PLANNED]
│
├── supabase/
│   ├── migrations/
│   └── seed/
│
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── brain.md                     [LIVING PROJECT MEMORY]
```

---

## 19. Current Repository State

- **Root Directory**: `c:\Users\ASUS HN116WS\OneDrive\Desktop\CODEBITS`
- **Git Status**:
  - Branch `main` tracking `origin/main` (`https://github.com/rehan-1002/CODEBITS.git`).
  - Working tree clean.
  - Pushed initial production frontend commit: `feat: complete CodeBits production frontend architecture and design system`.
- **Repository Structure**:
  - `codebits/`: Full Next.js 16 application (App Router, Tailwind v4, TypeScript, components, types).
  - `public/`: Brand identity asset `LOGO CB.png`, `FACULTY/*.webp`, and 5 specification documents in `CodeBits_Documentation/`.
  - `brain.md`: Persistent engineering memory and source of truth.

---

## 20. Completed Work

- [x] Initialized Git repository.
- [x] Placed official brand identity asset: `public/LOGO CB.png`.
- [x] Placed authentic faculty portraits: `public/FACULTY/*.webp`.
- [x] Placed 5 core specification documents in `public/CodeBits_Documentation/`.
- [x] Completed deep repository reconnaissance across all files, git status, and directory trees.
- [x] Created `brain.md` living project memory with complete product, architecture, design, and security understanding.

---

## 21. Current Work

- Completing Phase 0: Architecture Reconnaissance, Constraint Verification, and Brain Memory Creation.
- Maintaining read-only discipline (zero application code written).

---

## 22. Pending Work

1. **Phase 1: Project Scaffolding & Configuration**
   - Initialize Next.js 14+ (App Router, TypeScript, Tailwind CSS, ESLint).
   - Configure Tailwind with Obsidian/Emerald design tokens (no gradients).
   - Configure Google Fonts (`Inter` / `JetBrains Mono`).
   - Create `.env.example` with required environment variable keys.
2. **Phase 2: Database & Backend Initialization**
   - Author Supabase SQL schema migrations (`profiles`, `resources`, `inquiries`).
   - Implement RLS policies and trigger functions.
   - Create Supabase SSR client utilities (`lib/supabase/client.ts`, `server.ts`).
3. **Phase 3: Core Authentication & Session Guard**
   - Implement login & registration with dual phone/email support.
   - Implement Realtime concurrent-session invalidation hook (`useSessionGuard`).
4. **Phase 4: Academic Vault & Resource Querying**
   - Build `/vault` catalog with branch, semester, and category filters.
   - Implement empty states and uploader attribution cards.
5. **Phase 5: Protected Canvas PDF Viewer**
   - Integrate `pdf.js` page rendering to HTML5 canvas.
   - Implement dynamic forensic watermarking and deterrent listeners.
6. **Phase 6: Community Upload & Moderation**
   - Build `/upload` form with file validation.
   - Build administrator moderation queue (`/admin/moderation`).
7. **Phase 7: Public Landing & About Pages**
   - Implement Navigation with `ScrollStackNav` and `public/LOGO CB.png`.
   - Implement `Skiper19Scroll` kinetic SVG hero.
   - Implement `ScrollFloatTitle` with GSAP character scrub.
   - Implement `/about` with `Skiper37Stats`, `@number-flow/react`, and `FacultyAccordion`.
8. **Phase 8: cbAI Natural Language Search Dock**
   - Build `/api/cb-ai` route handler with Google Gemini structured parameter extraction.
   - Build `Ctrl + K` global command dock.

---

## 23. Blocked Work

- *None currently.* Ready to proceed to framework scaffolding once authorized by the user.

---

## 24. Known Issues & Watch-outs

1. **Faculty Folder Casing**:
   - The directory is named `FACULTY` (all caps) on disk in Windows, whereas the documentation references `public/faculty/`. On case-sensitive hosting environments (e.g., Vercel / Linux), this will cause 404 image errors unless standardized or properly mapped.
2. **Partner Assets**:
   - `public/partners/` directory does not exist yet. The About page marquee must gracefully handle or omit partner logos until official SVG assets are supplied.
3. **Dual-Identifier Auth**:
   - Supabase Auth requires an email address. The phone-to-email mapping lookup must be securely executed via a server-side action with appropriate rate-limiting.
4. **`pdf.js` Canvas Rendering Performance**:
   - Very large PDF documents must render pages lazily (virtualized or on-demand) to avoid browser canvas memory exhaustion.

---

## 25. Architectural Decisions

1. **ADR-001: Strict Read-Only Protocol for Phase 0**
   - *Decision*: Strictly refrain from writing code or scaffolding packages until the entire architecture is committed to `brain.md`.
2. **ADR-002: Rejection of CSS Gradients & AI Visual Slop**
   - *Decision*: Enforce solid obsidian/emerald surfaces with crisp 1px structural borders and no gradient fills or decorative blobs.
3. **ADR-003: No-OTP Authentication for Initial Release**
   - *Decision*: Rely on direct phone/email + password authentication to prevent SMS gateway latency and failures during exam periods.
4. **ADR-004: Canvas-Based Document Deterrence vs. Heavy DRM**
   - *Decision*: Deconstruct PDFs onto HTML5 canvas with dynamic user watermarking rather than claiming impenetrable DRM, maintaining high rendering speed and privacy.
5. **ADR-005: Gemini Extraction as a Database Parameter Compiler**
   - *Decision*: Google Gemini is strictly used to parse natural language into structured JSON filters. It never accesses raw documents or produces freeform text answers.

---

## 26. Important Constraints

- **Framework**: Next.js App Router (React Server Components by default; client components isolated to interactive leaves).
- **Styling**: Tailwind CSS with custom theme tokens. Vanilla CSS for complex animations. No Tailwind gradients.
- **Node/OS Environment**: Windows operating system with PowerShell shell conventions.
- **Security Secrets**: `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` must never be exposed to the client bundle or prefixed with `NEXT_PUBLIC_`.
- **Database Rules**: All public queries must filter by `status = 'approved'`.
- **No Mock Production Data**: Under no circumstances should fake documents, fake student names, or fake metrics be deployed.

---

## 27. Do Not Break

1. **`public/LOGO CB.png`**: The authentic brand monogram. Do not delete, rename, or replace with placeholder icons.
2. **`public/FACULTY/*.webp`**: Real faculty photos. Do not replace with generic stock avatars or AI-generated faces.
3. **The 1-Session Rule**: Never bypass or disable the Realtime session verification in the protected viewer.
4. **The Zero-Hallucination Fallback**: Never let cbAI respond with conversational text when a resource is not in the database; always return the exact documented fallback copy.
5. **Separation of Motion Libraries**: Keep GSAP bound to scroll timelines, Lenis to smooth scrolling, and Framer Motion to component state transitions.

---

## 28. Next Recommended Actions

When authorized by the user to begin backend implementation:
1. **Supabase Database Schema & Migrations**:
   - Write SQL migrations for `profiles`, `resources`, and `inquiries` tables with check constraints and Rev-2019 'C' Scheme rules.
   - Configure PostgreSQL Row Level Security (RLS) policies for student, public, and admin tiers.
2. **Supabase Client & Auth SSR**:
   - Set up `@supabase/ssr` server and client utilities (`lib/supabase/client.ts`, `server.ts`).
   - Implement dual-identifier phone-to-email resolver server action for login.
   - Implement Realtime subscription hook `useSessionGuard` for concurrent-device session invalidation.
3. **Google Gemini Server Route (`/api/cb-ai`)**:
   - Connect `@google/genai` on server-side with structured JSON output schema matching `CbAiQuery`.
   - Wire database filter queries with the zero-hallucination fallback.
4. **Supabase Storage Integration**:
   - Set up private storage bucket for verified PDFs with authenticated signed URL generation for the protected canvas viewer.

---

## 29. Iteration History

### Iteration 1

#### Date
2026-09-07

#### Objective
Execute the CodeBits Brain & Project Understanding Protocol. Perform deep filesystem reconnaissance, inspect existing documentation, verify physical assets, and create the comprehensive, living `brain.md` project memory.

#### Implemented
- Comprehensive inspection of all repository directories and Git tracking state.
- Full verification of all 5 architecture documents in `public/CodeBits_Documentation/`.
- Verification of official brand asset `public/LOGO CB.png` (955 KB) and 8 authentic faculty portraits in `public/FACULTY/`.
- Creation of `brain.md` containing all 29 mandatory sections, capturing complete product workflows, data schemas, security architectures, anti-AI-slop rules, component ownership matrices, and development phases.

#### Files Changed
- `brain.md` (Created)

#### Components Added/Changed
- None (Phase 0 is strictly Read-Only).

#### Architecture Changes
- Confirmed documented architecture and established `brain.md` as the permanent source of truth.

#### Design Changes
- Codified non-negotiable anti-slop rules: zero gradients, no emojis, no fake metrics/faculty/resources, and dark obsidian/emerald palette.

#### Dependencies Added/Removed
- None.

#### Assets Added/Changed
- Verified `public/LOGO CB.png`.
- Verified `public/FACULTY/*.webp` (8 files).
- Identified missing `public/partners/`.

#### Problems Encountered
- Case discrepancy noted: `public/FACULTY/` is capitalized on disk, whereas documentation specifies `public/faculty/`.
- Active IDE buffer showed `lib/supabase/server.ts`, but verification proved this file does not exist on disk yet.

#### Decisions Made
- Established `FRONTEND PLANNING / FRONTEND NOT YET IMPLEMENTED` as the verified current phase.
- Enforced strict read-only boundary with zero application code written.

#### Remaining Work
- Everything in Phases 1 through 8 (Framework scaffolding, Supabase integration, Auth, Vault, Viewer, Upload, Landing, cbAI).

#### Next Recommended Action
- Await user approval and prompt to commence Phase 1 (Scaffolding & Configuration).

---

### Iteration 2

#### Date
2026-09-07

#### Objective
Execute the Frontend Engineering & Design Execution Protocol. Build the complete, production-quality frontend system for CodeBits with dark obsidian/emerald aesthetic, true light mode, full component ownership, and zero AI-slop or fake data.

#### Implemented
- Scaffolded Next.js 16 (App Router, TypeScript, Tailwind CSS v4, Turbopack).
- Established global semantic tokens in `app/globals.css`:
  - Dark Mode: Obsidian `#0B0F0E`, Deep Emerald Slate `#131917`, Border `#1F2925`, Brand `#00C269`.
  - Light Mode: Slate 50 `#F8FAFC`, Surface `#FFFFFF`, Border `#E2E8F0`, Accent `#009E52`.
  - Strict anti-gradient enforcement (no CSS gradients).
- Created shared domain type contracts in `types/` (`auth.ts`, `resources.ts`, `inquiries.ts`, `ai.ts`).
- Created Theme System: `ThemeProvider` and `AnimatedThemeToggler` (Framer Motion icon morphing).
- Created Smooth Scroll System: `SmoothScroll` provider powered by `lenis` with `prefers-reduced-motion` compliance.
- Built Global Shell & Navigation:
  - `Navbar`: Displays authentic `public/LOGO CB.png`, "CodeBits by Prof. MRF", quick search dock trigger, theme toggle, and Access Vault CTA.
  - `ScrollStackNav`: Full-screen stacked overlay navigation drawer with route cards (`/vault`, `/about`, `/upload`, `/login`).
  - `Footer`: Comprehensive institutional footer with academic scheme statements and attribution.
- Built Landing Page (`/`):
  - Hero with mission: *"Let us build the bridge between your career and dream"*.
  - `TextAnimate`: Interstitial word reveal ("scattered resources? we got you").
  - `Skiper19Scroll`: Kinetic vertical SVG path tracking scroll progress across Problem, Discovery, Connection, CodeBits, and Resources.
  - `ScrollFloatTitle`: Scrubbed character-by-character climactic reveal of `CODEBITS` with GSAP ScrollTrigger.
- Built About Page (`/about`):
  - `Skiper37Stats`: Institutional metrics using `@number-flow/react` for smooth numeric digit transitions.
  - `FacultyAccordion`: Tailwind Image Accordion displaying all 8 authentic faculty portraits from `public/FACULTY/` with responsive desktop accordion and mobile card layout.
  - Institutional training centers and `InquiryForm` with Indian phone validation.
- Built Academic Vault (`/vault`):
  - `ResourceFiltersBar`: Filters by Branch (COMPS, IT, AI-DS, EXTC, MECH, CIVIL), Semester (1–8), and Category (PYQ, Notes, Syllabus, Solution).
  - `ResourceGrid` & `ResourceCard`: High information density with Rev-2019 'C' Scheme badges and uploader attribution.
  - Authentic empty state when 0 approved resources match (zero mock data).
- Built Authentication (`/login`):
  - `LoginForm`: Dual-identifier support (Email OR 10-digit Indian Mobile `^[6-9]\d{9}$`) + Password. Zero OTP/social auth.
  - `RegisterForm`: Full student registration fields.
  - Single active session notice & `?reason=concurrent_device` alert handler.
- Built Community Upload (`/upload`):
  - `ResourceUploadForm`: Academic submission form with drag-and-drop PDF dropzone.
  - Moderation lifecycle preview explaining Submitted → Pending → Approved states.
- Built Protected Document Viewer (`/viewer/[id]`):
  - `ProtectedCanvasViewer`: HTML5 canvas rasterization shell (no iframes).
  - Dynamic user forensic watermark (`[STUDENT NAME] • +91 [PHONE NUMBER] • LICENSED COPY`).
  - Client-side deterrence controls: Context menu suppression, print/save shortcut interception, and window blur masking.
- Built cbAI Intelligent Command Dock:
  - `CbAiDrawer`: Modal command palette triggered via `Ctrl + K`.
  - Natural-language query compiler decomposing prompt into structured taxonomy.
  - Strict zero-hallucination fallback: *"Not available or not uploaded yet. Be the first to upload!"*.

#### Files Changed
- `codebits/package.json`
- `codebits/tsconfig.json`
- `codebits/app/globals.css`
- `codebits/app/layout.tsx`
- `codebits/app/page.tsx`
- `codebits/app/about/page.tsx`
- `codebits/app/vault/page.tsx`
- `codebits/app/login/page.tsx`
- `codebits/app/upload/page.tsx`
- `codebits/app/viewer/[id]/page.tsx`
- `codebits/types/auth.ts`
- `codebits/types/resources.ts`
- `codebits/types/inquiries.ts`
- `codebits/types/ai.ts`
- `codebits/components/providers/GlobalShell.tsx`
- `codebits/components/providers/SmoothScroll.tsx`
- `codebits/components/theme/ThemeProvider.tsx`
- `codebits/components/theme/AnimatedThemeToggler.tsx`
- `codebits/components/navigation/Navbar.tsx`
- `codebits/components/navigation/ScrollStackNav.tsx`
- `codebits/components/navigation/Footer.tsx`
- `codebits/components/sections/TextAnimate.tsx`
- `codebits/components/sections/Skiper19Scroll.tsx`
- `codebits/components/sections/ScrollFloatTitle.tsx`
- `codebits/components/sections/Skiper37Stats.tsx`
- `codebits/components/sections/FacultyAccordion.tsx`
- `codebits/components/inquiries/InquiryForm.tsx`
- `codebits/components/resources/ResourceCard.tsx`
- `codebits/components/resources/ResourceFilters.tsx`
- `codebits/components/resources/ResourceGrid.tsx`
- `codebits/components/auth/LoginForm.tsx`
- `codebits/components/auth/RegisterForm.tsx`
- `codebits/components/upload/ResourceUploadForm.tsx`
- `codebits/components/drm/ProtectedCanvasViewer.tsx`
- `codebits/components/ai/CbAiDrawer.tsx`
- `brain.md`

#### Components Added/Changed
- 16 custom React components built adhering strictly to CodeBits design tokens.

#### Architecture Changes
- Initialized Next.js frontend architecture in `codebits/`, mapped assets (`LOGO CB.png`, `FACULTY/`).
- Updated project phase to `FRONTEND IMPLEMENTED / BACKEND PENDING`.

#### Design Changes
- Verified complete absence of gradients, emojis, and generic AI slop.
- Delivered primary dark obsidian/emerald theme and balanced light theme.

#### Dependencies Added/Removed
- Added: `framer-motion`, `gsap`, `lenis`, `@number-flow/react`, `lucide-react`, `clsx`, `tailwind-merge`.

#### Assets Added/Changed
- Synced `public/LOGO CB.png` into `codebits/public/`.
- Synced `public/FACULTY/*.webp` (8 portraits) into `codebits/public/FACULTY/` and `codebits/public/faculty/`.

#### Problems Encountered
- Browser subagent automation driver encountered an external 404 from Azure Edge for Playwright download. Verified all pages via dev server HTTP requests (Status 200) and Next.js production build (`npm run build` passed in 23.7s).

#### Decisions Made
- Preserved real empty states in Vault and cbAI (zero mock data rule).
- Designed backend-ready contracts across all forms and viewer interfaces.

#### Remaining Work
- Backend integration: Supabase database schema, RLS migrations, auth session guard, Gemini API route, storage bucket.

#### Next Recommended Action
- Present completed frontend to the user and await instructions for backend initialization.

---

### Iteration 3

#### Date
2026-09-07

#### Objective
Execute Master UI Refac-Directive: CodeBits Kinetic Design System. Integrate the exact foreign component implementations for Skiper19, ScrollFloat, ScrollStackNav, Skiper37Stats, and FacultyAccordion into the active application.

#### Implemented
- Created `codebits/components/sections/Skiper19.tsx`: Pinned kinetic SVG scroll path engine with multi-screen pinning across `320vh`, active emerald `#00C269` stroke tracing, and two pocket text reveals with character-level opacity and translate transforms.
- Created `codebits/components/sections/ScrollFloat.tsx`: GSAP ScrollTrigger kinetic character split & scale reveal on `CODEBITS` climactic section (`scaleY: 2.3 -> 1`, `yPercent: 120 -> 0`, stagger: 0.03).
- Refactored `codebits/components/navigation/ScrollStackNav.tsx`: Clean trigger icon `<Menu className="w-5 h-5 text-[#00C269]"/>` opening a fullscreen staggered card-deck navigation overlay with Framer Motion.
- Refactored `codebits/components/sections/Skiper37Stats.tsx`: Midnight slate card surfaces (`#131917`), 1px borders (`#1F2925`), and emerald `@number-flow/react` animated digit counters (`250+`, `15+`, `8 LPA`).
- Refactored `codebits/components/sections/FacultyAccordion.tsx`: Responsive expanding photo columns with emerald active borders (`#00C269`), connecting authentic portraits from `/faculty/`.
- Re-architected `codebits/app/page.tsx`: Integrated the full kinetic homepage flow including the hero section, pinned `Skiper19` engine, 3-column CodeBits standard grid, and GSAP `ScrollFloat` climax with centered `LOGO CB.png` monogram.
- Created `codebits/components/ui/footer-section.tsx` re-export.
- Verified Next.js 16 Turbopack production build (`next build`) and HTTP 200 responses.

#### Files Changed
- `codebits/components/sections/Skiper19.tsx`
- `codebits/components/sections/ScrollFloat.tsx`
- `codebits/components/navigation/ScrollStackNav.tsx`
- `codebits/components/sections/Skiper37Stats.tsx`
- `codebits/components/sections/FacultyAccordion.tsx`
- `codebits/app/page.tsx`
- `codebits/components/navigation/Navbar.tsx`
- `codebits/components/providers/GlobalShell.tsx`
- `codebits/components/ui/footer-section.tsx`
- `brain.md`

#### Components Added/Changed
- `Skiper19.tsx` (Added)
- `ScrollFloat.tsx` (Added)
- `ScrollStackNav.tsx` (Refactored to Card Deck)
- `Skiper37Stats.tsx` (Refactored)
- `FacultyAccordion.tsx` (Refactored)
- `app/page.tsx` (Integrated)

#### Architecture Changes
- Pinned multi-screen viewport scrolling established for Skiper19 SVG path engine.
- Character-split GSAP timeline scrub established for climax brand title.

#### Next Recommended Action
- Connect Supabase and Gemini backend services.

### Iteration 4
**Date**: September 7, 2026
**Focus**: Master Architectural Refac — Fix Broken Overlays, Viewport Collision & Learning Centers

#### What Was Built / Modified
- **`ScrollStackNav.tsx` Overlay Mounting**: Conditioned modal rendering strictly on `isOpen === true` using Framer Motion `AnimatePresence`. Initial page load now has the modal completely unmounted, preventing any viewport interception or header blocking. Added body scroll lock (`overflow: hidden`) during drawer presentation.
- **`Skiper19.tsx` Safe Viewport Container**: Added header offset bounds (`top-20`, `h-[calc(100vh-5rem)]`) and calibrated the normalized SVG trace viewBox (`viewBox="0 0 1000 1200"`). Text pockets "The Friction" (`scattered resources?`) and "The Resolution" (`we got you.`) are properly contained without clipping or colliding with the navbar.
- **`ScrollFloat.tsx` Scrub Title**: Verified clean character splitting with GSAP ScrollTrigger timeline animation and transforms (`scaleY: 2.3 -> 1`, `yPercent: 120 -> 0`, `scrub: true`).
- **`app/about/page.tsx` Directory & Learning Centers**: Resolved layout collapse with responsive expanding faculty accordion utilizing authentic WebP assets from `/faculty/`. Displayed NumberFlow metrics (`250+`, `15+`, `8 LPA`), animated marquee, and physical training centers strictly anchored to Kalyan West (Chandulal Joshi Complex) and Ulhasnagar (Hari Narayan Complex) with direct WhatsApp desk actions.
- **Unified Design Tokens**: Enforced Obsidian Charcoal (`#0B0F0E`), Deep Emerald Slate (`#131917`), CodeBits Emerald (`#00C269`), Neon Mint (`#34EE99`), and Subtle Borders (`#1F2925`).

#### Verification
- Next.js 16 (Turbopack) production build passed cleanly (`npm run build` exited with code 0).
- HTTP 200 responses verified on both `/` and `/about`.
