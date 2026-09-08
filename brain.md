# CODEBITS BRAIN

Living Engineering Memory & Architectural Source of Truth for CodeBits.
*Last Updated: 2026-09-08 | Status: Verified & Persistent*

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
  - Global Sticky Navigation (Monogram, title, Circular Ripple View Transition theme toggler, and Triple-Dashed Stacked Navigation Drawer trigger revealing 5 animated deck cards: `01 Home Page`, `02 Academic Vault`, `03 About Us & Faculty`, `04 Community Upload`, `05 Login`).
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
- **Key Capabilities & Modern Component Architecture**:
  - **Aceternity GooeyInput Search**: Smooth organic liquid morph input (`@aceternity/gooey-input-demo` / `components/ui/gooey-input.tsx`) providing unified subject and course title search dock.
  - **Animated Filter Dropdown (`DropdownMenu04`)**: Physics-spring animated hierarchical selector with instant filtering, keyboard navigation, and syllabus descriptions for Semesters 1 through 8 (`components/ui/animated-filter-dropdown.tsx`).
  - **Hover Button System (`hover-button-1` by @erikvalencia1)**: High-interaction animated kinetic pill buttons (`components/ui/hover-button.tsx`) implemented across all Branch filters (`ALL`, `COMPS`, `IT`, `AI-DS`, `EXTC`, `MECH`, `CIVIL`), Category filters (`All Types`, `Question Papers (PYQ)`, `Lecture Notes`, `Syllabus`, `Verified Solutions`), and Reset controls. Features sliding text transitions, dynamic arrow reveals (`ArrowRight`), and expanding radial kinetic ripple fills tailored to CodeBits' obsidian-emerald aesthetic.
  - **Anti-Metal CTA Button (`anti-metal-button` by @smammar100)**: Premium industrial metal button (`components/ui/anti-metal-button.tsx`) for "SUBMIT A PAPER" CTA leading to `/upload`. Fully theme-adaptive across light mode (crisp silver-white metallic with dark label) and dark mode (deep obsidian metallic gradient with light label), featuring cascading dot-wave chevron animations (`bd-dot-wave`), and an emerald accent slab that smoothly slides across the button on hover.
  - **SkewCards Kinetic Document Cards**: Dynamic interactive cards (`components/resources/ResourceCard.tsx`) featuring 15° skewed multi-tier gradient panels (crisp + diffuse glow) that straighten (`skew-x-0`) on hover, floating glassmorphic blurred blobs with continuous floating physics (`animate-blob`), and a smooth glass card body shifting left with fully theme-adaptive light and dark surfaces, high-contrast typography, branch badges, and a crisp "STUDY" CTA button.
  - **Public Visibility**: Strictly constrained to records where `status = 'approved'`.
  - **Realistic Empty States**: Guiding students to contribute missing assets without friction.

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
| Project Living Memory (`brain.md`) | `VERIFIED` | Persistent project memory maintained; Iteration 11 logged. |
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

---

### Iteration 5: Finalised the landing page

#### Date
2026-09-08

#### Objective
Finalize the CodeBits landing page and kinetic navigation architecture with the true React Bits `ScrollStack` Lenis engine, `VerticalCutRevealChars` centered hero headline animation, custom triple-dashed stacked menu trigger, dual-theme responsiveness, and removal of all extraneous header tabs and HUD buttons.

#### Implemented
1. **Vertical Cut Reveal Headline Engine (`codebits/components/ui/m-vertical-cut-reveal-2.tsx`)**:
   - Implemented center-outward staggered vertical cut reveals with smooth upward slide (`y: 110% -> 0%`) and CodeBits emerald `#00C269` micro-accent cut wipe lines.
   - Centered both vertically and horizontally in the initial hero viewport (`min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center`) with pure character indexing and line-wrap balancing.
2. **Kinetic SVG Scroll Engine (`codebits/components/sections/Skiper19.tsx`)**:
   - Continuous multi-screen scroll path engine with `#00C269` dynamic animated stroke following scroll progress.
   - Clean storytelling text pockets: *"scattered resources?"* and *"we got you."* (no HUD boxes or unneeded clutter).
   - Climax `ScrollFloat` with GSAP character scrub and isometric monogram `/LOGO CB.png`.
   - Theme-adaptive background path stroke adapting automatically between light and dark modes.
3. **React Bits Lenis ScrollStack Engine (`codebits/components/ui/ScrollStack.tsx`)**:
   - Created the complete Lenis smooth-scroll card stacking engine with `ScrollStackItem` and `transform-gpu`.
   - Physics-driven card transforms: `translate3d`, `scale`, rotation, and depth-based progressive card blur (`blur(blurAmount * depth)`).
   - Pinned card stack mechanics (`isPinned = scrollTop >= pinStart && scrollTop <= pinEnd`) with transform caching.
4. **Stacked Navigation System & Triple-Dashed Icon (`codebits/components/navigation/ScrollStackNav.tsx`)**:
   - Implemented dedicated SVG `TripleDashedIcon` (three horizontal dashed bars: `strokeDasharray="3.5 2.5"`) on the trigger button.
   - Fullscreen drawer mounts the Lenis `ScrollStack` containing all platform destination cards (*MU Academic Vault*, *Faculty & Centers*, *Community Upload*, *Protected Canvas DRM*).
5. **Minimal Navigation Header (`codebits/components/navigation/Navbar.tsx`)**:
   - Removed the standalone "Access Vault" button and extra navigation tabs from the top bar.
   - Standardized `AnimatedThemeToggler` directly adjacent to the triple-dashed `ScrollStackNav` menu trigger.
6. **Dual-Theme Responsiveness**:
   - Connected CSS design tokens (`var(--bg-base)`, `var(--surface-base)`, `var(--border-subtle)`, `var(--text-primary)`, `var(--brand-primary)`) across `page.tsx`, `Skiper19.tsx`, `Navbar.tsx`, `ScrollStackNav.tsx`, `GlobalShell.tsx`, and `about/page.tsx`.
   - Seamlessly toggles between Obsidian/Emerald Dark (`#0B0F0E`) and Crisp Institutional Light (`#F8FAFC`).

#### Files Changed
- `codebits/components/ui/m-vertical-cut-reveal-2.tsx` (Created)
- `codebits/components/ui/ScrollStack.tsx` (Created)
- `codebits/components/ui/text-animate.tsx` (Created)
- `codebits/components/ui/HeroShutterText.tsx` (Created)
- `codebits/registry/magicui/animated-theme-toggler.tsx` (Created)
- `codebits/lib/utils.ts` (Created)
- `codebits/components/navigation/Navbar.tsx` (Updated)
- `codebits/components/navigation/ScrollStackNav.tsx` (Updated)
- `codebits/components/sections/Skiper19.tsx` (Updated)
- `codebits/components/sections/ScrollFloat.tsx` (Updated)
- `codebits/components/providers/GlobalShell.tsx` (Updated)
- `codebits/app/page.tsx` (Updated)
- `codebits/app/about/page.tsx` (Updated)
- `brain.md` (Updated)

#### Verification
- Next.js 16 (Turbopack) production build passed cleanly (`npm run build` exited with code 0).
- HTTP 200 responses verified on `http://localhost:3000/`.
- Verified smooth Lenis card stacking physics and dual-theme responsiveness.

---

### Iteration 6: Navigation System Display & Stacking Physics Fix

#### Date
2026-09-08

#### Objective
Resolve the issue where the stacked navigation system was blank/not displaying page cards upon clicking the triple-dashed menu icon, establish flawless React Bits card stacking & popping physics, prevent global scroll hijacking, and ensure all 6 platform pages alternate smoothly with dual-theme responsiveness.

#### Root Causes Identified & Resolved
1. **Off-Screen Negative Translation on Mount**:
   - Initial layout measurement in `ScrollStack.tsx` evaluated `endElementTop` before paint, resulting in a negative `pinEnd` value (`-350px`).
   - At `scrollTop = 0`, the calculation `scrollTop > pinEnd` triggered, pushing all card positions into negative Y values (`-350px`, `-600px`, `-1000px`), rendering them invisible above the viewport.
   - *Fix*: Replaced dynamic `pinEnd` calculation with cached initial un-transformed offsets (`initialTopsRef`). Guaranteed that cards before their pinning threshold (`scrollTop < pinStart`) have `translateY = 0`, and when pinned have `translateY = scrollTop - pinStart >= 0`, entirely eliminating negative coordinates.
2. **Global Lenis Event Interception (Scroll Lockout)**:
   - The global `SmoothScroll` instance running on `window` was intercepting `wheel` events over the drawer modal and calling `e.preventDefault()`, preventing inner scrolling.
   - *Fix*: Placed `data-lenis-prevent="true"` on the fullscreen modal overlay `<motion.div>`, the deck wrapper, and the `scrollerRef` container, isolating inner scroll events and enabling instant, smooth scrolling.
3. **Flexbox Child Height Collapse**:
   - The deck wrapper inside `motion.div` had `flex-1 overflow-hidden` without `min-h-0`, causing potential container height collapse in flex layout.
   - *Fix*: Added `min-h-0 h-full relative` to ensure the scroll container has exact, non-zero dimensions.
4. **Card Stacking & Un-Stacking Physics**:
   - Implemented progressive scale down (`Math.max(0.75, 1 - stackedAbove * itemScale)`) and backdrop blur (`Math.min(12, stackedAbove * blurAmount)`) calculated dynamically as cards stack on top.
   - When scrolling down, cards lock into place at the stack threshold. When scrolling up, cards smoothly pop off in reverse.
5. **Theme Color Harmony & Conflicting Classes**:
   - Cleaned up conflicting CSS classes in `ScrollStackNav.tsx`. Alternating primary (`#00C269` / `#10241B` dark / `#ECFDF5` light) and secondary (`#131917` dark / `#FFFFFF` light) styles now render cleanly across dark and light themes without conflicting cascade rules.
   - All 6 platform destinations (*MU Academic Vault*, *Faculty & Centers*, *Community Upload*, *Student Portal Login*, *Protected Canvas DRM*, *CodeBits Home Gateway*) are present in the deck.

#### Files Changed
- `codebits/components/ui/ScrollStack.tsx` (Updated)
- `codebits/components/navigation/ScrollStackNav.tsx` (Updated)
- `brain.md` (Updated)

#### Verification
- Next.js 16 (Turbopack) production build passed with 0 errors (`npm run build`).
- HTTP 200 responses verified on `/`, `/vault`, `/about`, `/upload`, `/login`.
- Dev server responding with HTTP 200 on `http://localhost:3000/`.

---

### Iteration 7: Cinematic Stacked Navigation Animation & 3D Physics Upgrade

#### Date
2026-09-08

#### Objective
Elevate the CodeBits Stacked Navigation System (`ScrollStackNav.tsx` and `ScrollStack.tsx`) into a high-end cinematic experience with physics-driven 3D card stacking, dynamic depth shadows and dimming, staggered entrance cascade, active deck tracking, floating quick-jump rail, and keyboard accessibility.

#### Enhancements Implemented
1. **Kinetic Triple-Dashed Trigger**:
   - `TripleDashedIcon` equipped with micro-animated horizontal lines that subtly shift on hover.
   - Added subtle emerald halo and click scale response (`active:scale-95`).
2. **Staggered Card Deck Entrance**:
   - Integrated Framer Motion staggered entrance cascade (`initial={{ opacity: 0, y: 55, scale: 0.94 }}`, `animate={{ opacity: 1, y: 0, scale: 1 }}`) with custom ease curve (`[0.16, 1, 0.3, 1]`) and 50ms stagger delays across all 6 deck cards.
3. **Enhanced 3D Stacking Physics & Depth Lighting**:
   - Dynamic perspective tilting (`perspective(1200px) rotateX(...)`) as cards enter and rest in the stack.
   - Dynamic depth dimming (`brightness` down to 0.65) and elevation shadow (`box-shadow: 0 ${shadowY}px ${shadowBlur}px rgba(0,0,0, ${shadowOpacity})`) dynamically scaled with the number of cards stacked on top.
   - Ultra-smooth progressive scale decay (`Math.max(0.76, 1 - stackedAbove * 0.04)`) and progressive backdrop blur (`Math.min(8, stackedAbove * 2.8)`).
4. **Active Deck Tracking & Floating Quick Jump Rail**:
   - Live pinned card calculation feeding `onActiveCardChange` to display real-time deck position (`CARD 01 OF 06`).
   - Floating navigation rail on larger viewports with interactive numbered pills and hover tooltips for direct jumping to any card in the deck.
5. **Keyboard & Accessibility Controls**:
   - Added native `ArrowUp` / `ArrowDown`, `PageUp` / `PageDown`, and `Home` smooth glide navigation between cards.
   - Global `Escape` key shortcut to smoothly close the drawer.
6. **Cinematic Backdrop & Visual Polish**:
   - Ambient emerald radial glows and subtle vignette (`blur-[140px]`).
   - Glassmorphic top bar with keyboard shortcut guide badges.
7. **Document.body Portal Mounting (`createPortal`)**:
   - Mounted the fullscreen modal overlay directly to `document.body` via `createPortal`. This resolved the issue where `<header className="... backdrop-blur-md h-16">` created a CSS containing block for `position: fixed`, which previously trapped the modal inside the 64px header and clipped the scroll deck.

#### Files Changed
- `codebits/components/ui/ScrollStack.tsx` (Updated)
- `codebits/components/navigation/ScrollStackNav.tsx` (Updated)
- `brain.md` (Updated)

#### Verification
- Next.js 16 (Turbopack) production build passed with 0 errors (`npm run build`).
- HTTP 200 verified on `http://localhost:3000/`.

---

### Iteration 8: Full-Stage Hero Card Deck & Complete Cross-Page Theme Synchronization

#### Date
2026-09-08

#### Objective
Transform the stacked navigation cards into expansive, full-stage hero cards that sequentially stack and replace one another upon scrolling (`min-h-[580px]`), ensure 100% theme consistency across all pages (`/`, `/about`, `/vault`, `/upload`, `/login`) and inside the navigation deck, and eliminate flash of incorrect theme on initial page loads.

#### Root Causes Identified & Resolved
1. **Tailwind CSS v4 Dark Variant Disconnect**:
   - In Tailwind v4, the `dark:` selector by default evaluates `@media (prefers-color-scheme: dark)` rather than class or data attributes unless declared explicitly.
   - *Fix*: Added `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *, .dark, .dark *));` to `globals.css`, ensuring `dark:` classes respond to `data-theme="light"` and `data-theme="dark"`.
2. **Flash of Default Dark Theme on Navigation**:
   - Next.js server-rendered HTML had hardcoded `data-theme="dark"` in `layout.tsx`, causing pages to flash dark or stay dark before client-side hydration.
   - *Fix*: Injected an inline theme script in `<head>` inside `layout.tsx` that reads `localStorage.getItem('codebits-theme')` synchronously before paint and sets `data-theme` and `.light` / `.dark` classes immediately.
3. **Hardcoded Dark Styles in Secondary Pages**:
   - `/about/page.tsx` contained hardcoded `text-white` and `bg-[#131917]` values that remained dark in light mode.
   - *Fix*: Refactored all text and surface classes in `about/page.tsx` to use design tokens (`var(--surface-base)`, `var(--text-primary)`, `var(--border-subtle)`, `var(--text-secondary)`, `var(--brand-primary)`).
4. **Small Card Presentation in Navigation Deck**:
   - Cards were previously restricted to `min-h-[280px]`, causing multiple cards to appear crammed into the viewport at once.
   - *Fix*: Expanded each card to a full-stage hero card (`min-h-[480px] sm:min-h-[540px] md:min-h-[580px]`), with large category tags, giant typography (`text-5xl md:text-6xl`), detailed descriptions, feature badge rows, and prominent destination action buttons (`ctaText`). Configured `itemDistance=90` so that only one big card dominates the viewport, with successive cards smoothly gliding up and locking into the stack one at a time.
5. **Drawer Theme Synchronization (`useTheme`)**:
   - Connected `ScrollStackNav.tsx` directly to `useTheme()`. In light mode, the deck renders crisp white surfaces with emerald accents (`#009E52`), subtle borders, and soft shadows; in dark mode, it renders obsidian-emerald glass surfaces with glowing highlights.

#### Files Changed
- `codebits/app/globals.css` (Updated)
- `codebits/app/layout.tsx` (Updated)
- `codebits/app/about/page.tsx` (Updated)
- `codebits/components/navigation/ScrollStackNav.tsx` (Updated)
- `brain.md` (Updated)

#### Verification
- Next.js 16 (Turbopack) production build passed with 0 errors (`npm run build`).
- Prerendered 8/8 routes cleanly.
- HTTP 200 verified on `http://localhost:3000/`.

---

### Iteration 9: Translucent Frosted Glass Overlay & 4 Core Destination Cards

#### Date
2026-09-08

#### Objective
Ensure clicking the navigation trigger keeps the user on their current page while softly blurring the background with a translucent frosted glass backdrop (`backdrop-blur-2xl`), animates the deck upward over the blurred page, allows clicking outside to dismiss, and restricts the deck exclusively to the 4 requested platform destinations: **HOME PAGE**, **ACADEMIC VAULT**, **COMMUNITY UPLOAD**, and **LOGIN**.

#### Enhancements Implemented
1. **Translucent Frosted Backdrop Overlay**:
   - Replaced opaque `/98` solid backgrounds with translucent glass overlay (`bg-slate-950/40` in light mode, `bg-black/75` in dark mode) paired with `backdrop-blur-2xl`.
   - The user clearly sees their current page softly blurred in the background rather than feeling like they were navigated away to a separate page.
   - Added clickable backdrop area allowing the user to click anywhere outside the cards to immediately dismiss the deck.
2. **Upward Deck Slide Animation**:
   - The card deck container now smoothly slides upward over the blurred page upon trigger (`initial={{ opacity: 0, y: 70 }}`, `animate={{ opacity: 1, y: 0 }}`) with custom cubic-bezier easing (`[0.16, 1, 0.3, 1]`).
3. **4-Card Core Navigation Deck**:
   - Pruned extraneous cards and curated the exact 4 destinations requested:
     1. **`01` HOME PAGE**: CodeBits Home Gateway (`/`)
     2. **`02` ACADEMIC VAULT**: MU Academic Vault (`/vault`)
     3. **`03` COMMUNITY UPLOAD**: Community Upload Pipeline (`/upload`)
     4. **`04` LOGIN**: Student Portal Login (`/login`)
4. **Synchronized Quick-Jump Rail & Counter**:
   - Active deck counter updated to `CARD 01 / 04`.
   - Floating quick-jump rail updated with 4 interactive numbered pills (`01` through `04`) with hover tooltips and instant smooth scrolling.

#### Files Changed
- `codebits/components/navigation/ScrollStackNav.tsx` (Updated)
- `brain.md` (Updated)

#### Verification
- Next.js 16 (Turbopack) production build passed with 0 errors (`npm run build`).
- Prerendered 8/8 routes cleanly.
- HTTP 200 verified on `http://localhost:3000/`.

---

### Iteration 10: Minimalist Close Cross Alignment & Clean Typography Cards

#### Date
2026-09-08

#### Objective
Remove the top header bar entirely, position the close cross `[X]` button at the identical coordinates as the navbar menu trigger for instant closing without cursor movement, remove all extraneous badges/chips/tags from cards, and present purely the bold main heading and a concise 1-line description per card.

#### Enhancements Implemented
1. **Identical Close Button Placement**:
   - Removed the top header bar containing the title pill, deck counter, and keyboard badges.
   - Positioned the `[X]` cross button inside a top container matching the navbar layout (`h-16 flex items-center justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).
   - When the user clicks the menu button to open the deck, the `[X]` close button appears at the exact same location under the cursor, enabling immediate one-click closing.
2. **Minimalist Card Redesign**:
   - Removed all category tags, feature badge chips, and bottom metadata banners from the cards.
   - Kept purely:
     - Prominent icon box (`w-14 h-14 sm:w-16 sm:h-16`)
     - Monospace card index number (`01` through `04`)
     - Bold main heading (`text-3xl sm:text-5xl md:text-6xl font-black`)
     - Clean 1-lined info text (`text-base sm:text-xl md:text-2xl`)
     - Circular directional arrow (`w-11 h-11`)
3. **Card Content Refinement**:
   - `01 Home Page`: *Curriculum roadmap, faculty milestones, and Mumbai University portal gateway.*
   - `02 Academic Vault`: *Official question papers, marking schemes, and vetted faculty solutions.*
   - `03 Community Upload`: *Contribute exam papers, solutions, and module notes for peer moderation.*
   - `04 Login`: *Secure student portal with active session protection and submission tracking.*

#### Files Changed
- `codebits/components/navigation/ScrollStackNav.tsx` (Updated)
- `brain.md` (Updated)

#### Verification
- Next.js 16 (Turbopack) production build passed with 0 errors (`npm run build`).
- Prerendered 8/8 routes cleanly.
- Dev server active and responding with HTTP 200 on `http://localhost:3000/`.

---

### Iteration 11: Viewport-Filling Hero Card Stacking

#### Date
2026-09-08

#### Objective
Ensure each card fills virtually the entire vertical viewport (`h-[72vh] min-h-[520px] max-h-[720px]`) so that only a single card is visible on screen upon opening, with subsequent cards hidden below the fold until scrolled.

#### Enhancements Implemented
1. **Full Viewport Card Height**:
   - Replaced fixed ~400px card heights with responsive viewport sizing: `h-[72vh] min-h-[520px] max-h-[720px]`.
   - Card 01 now spans from the top bar down to the bottom of the visible area as a single, commanding hero card.
2. **Spacing & Stacking Dynamics**:
   - Configured `itemDistance={120}` so Card 02 begins well below the bottom of the viewport and does not peek into view prematurely.
   - Pinned offset extended (`pinEnd = Math.max(pinStart + 2500, ...)`) and inner track padding enlarged (`pb-[70rem]`) for smooth, unhurried stacking where each card glides up and takes over the stage one by one.
3. **Typography & Proportions Scaled**:
   - Scaled icons to `w-16 h-16 sm:w-20 sm:h-20`.
   - Scaled card index numbers to `text-5xl sm:text-7xl md:text-8xl`.
   - Headings enlarged to `text-4xl sm:text-6xl md:text-7xl font-black`.
   - 1-lined info text sized to `text-lg sm:text-2xl md:text-3xl`.

#### Files Changed
- `codebits/components/navigation/ScrollStackNav.tsx` (Updated)
- `codebits/components/ui/ScrollStack.tsx` (Updated)
- `brain.md` (Updated)

#### Verification
- Dev server active and responding with HTTP 200 on `http://localhost:3000/`.
- Verified single card display with one-by-one scroll stacking.

---

### Iteration 12: Primary Color Footer & Kinetic SVG End Point Connection

#### Date
2026-09-08

#### Objective
1. Make the global footer use the brand's primary color (`var(--brand-primary)` / `#00C269`) with high-contrast typography and clean institutional hierarchy.
2. Extend the kinetic SVG scribble trail (`Skiper19`) so its end point seamlessly connects into the top of the primary footer without any floating gaps on any viewport or device resolution.

#### Enhancements Implemented
1. **Primary Brand Footer Styling**:
   - Replaced default surface background with `bg-[var(--brand-primary)]` (`#00C269` / `#009E52`).
   - Styled high-contrast text elements (`text-black`, `text-black/80`, `text-black/75`) for headings, links, legal text, and institutional metadata.
   - Restyled the CodeBits logo card with translucent backdrop and subtle borders (`bg-black/10 border-black/15`).
   - Removed the top separating border from the footer to create an uninterrupted landing canvas for the kinetic trail.
2. **Dynamic Kinetic SVG End Point Connection**:
   - Connected `LinePath` to `containerRef` (`<section>`) in `Skiper19.tsx`.
   - Created a responsive connector curve via `useEffect` and resize listeners that calculates the exact distance from the path's terminal coordinates `(303.794, 2668.89)` to the top boundary of the footer in SVG viewBox coordinate space.
   - Projected the natural tangent slope ($dx/dy \approx 0.2524$) through a smooth cubic Bézier curve down into the footer (+24 SVG units into the footer).
   - Changed section overflow from `overflow-hidden` to `overflow-x-clip` so that the stroke merges continuously into the footer without clipping or creating horizontal page scrollbars.

#### Files Changed
- `codebits/components/navigation/Footer.tsx` (Updated)
- `codebits/components/sections/Skiper19.tsx` (Updated)
- `brain.md` (Updated)

#### Verification
- Dev server active and responding with HTTP 200 on `http://localhost:3000/`.
- Hot reload compiled cleanly with zero errors.
- Verified SVG stroke connects directly into the solid primary green footer.

---

### Iteration 13: Landing Page Finalization, Kinetic Boundary Confinement & Dev Indicator Removal

#### Date
2026-09-08

#### Objective
1. Confine the kinetic SVG scroll animation (`Skiper19`) strictly to the landing section, ensuring the path finishes cleanly just at the footer threshold rather than overlapping or cutting across footer content.
2. Establish an explicit stacking context for the global footer to guarantee complete visual isolation from upper animated elements.
3. Remove the Next.js development indicator overlay icon from local dev views.
4. **Finalize and lock the Landing Page (Home Page `/`)**: Marked as fully complete and frozen ("DO NOT TOUCH").

#### Enhancements Implemented
1. **Kinetic SVG Boundary Confinement**:
   - Updated `section` in `codebits/components/sections/Skiper19.tsx` from `overflow-x-clip` to `overflow-hidden`, strictly confining all SVG paths, glows, and kinetic elements within the hero/content section.
   - Refined `LinePath` dynamic endpoint calculation: adjusted `targetY` to terminate cleanly right before the footer boundary (`Math.max(startY, distanceToBottom * scale - 12)`), accounting for stroke thickness and rounded line caps without overshooting into the footer.
   - Removed the `defaultConnector` fallback which previously forced an extra 160px tail down into the footer whenever `extraD` was empty.
2. **Elevated Footer Stacking**:
   - Added `relative z-20` to `codebits/components/navigation/Footer.tsx`, ensuring the footer establishes its own explicit stacking context over the underlying body and canvas backgrounds.
3. **Next.js Dev Indicator Clean-up**:
   - Configured `devIndicators: false` in `codebits/next.config.ts` to suppress the floating Next.js development badge in the bottom-left corner during local development.
4. **Landing Page Locked & Finalized**:
   - The landing page composition (`Navbar`, `Skiper19`, `Footer`) and all associated landing visuals have been thoroughly tested, verified, and locked. No further modifications should be made to this page.

#### Files Changed
- `codebits/components/sections/Skiper19.tsx` (Updated: section overflow set to hidden, path ending bounded)
- `codebits/components/navigation/Footer.tsx` (Updated: relative z-20 added)
- `codebits/next.config.ts` (Updated: devIndicators disabled)
- `brain.md` (Updated: Iteration 13 logged, landing page frozen)

#### Verification
- Dev server running with Turbopack on `http://localhost:3000/`.
- TypeScript validation (`npx tsc --noEmit`) passed with 0 errors.
- Verified that the kinetic scroll trail stops right before the footer and no longer cuts across footer text.

---

### Iteration 14: Academic Vault Page Finalization, SkewCards & Kinetic UI Upgrades

#### Date
2026-09-08

#### Objective
1. Finalize the Mumbai University Academic Vault page (`/vault`) with state-of-the-art interactive UI components.
2. Replace static inputs and buttons with Aceternity GooeyInput, Erik Valencia's `hover-button-1`, and Muhammad Ammar's `anti-metal-button`.
3. Apply SkewCards kinetic 3D hover physics to all catalog document cards.
4. Ensure 100% theme-adaptive fidelity across Light and Dark modes.
5. Implement circular View Transitions ripple animation for the global theme toggler.
6. Integrate the missing About Us page (`/about`) into the stacked navigation deck (`ScrollStackNav`).
7. Clean up redundant badges, overemphasized text, and the verification compliance footer banner.
8. Strictly preserve the locked Landing Page (`/`).

#### Enhancements Implemented
1. **Gooey Search Dock (`GooeyInput`)**:
   - Integrated `@aceternity/gooey-input-demo` into `codebits/components/ui/gooey-input.tsx` and placed it into the Vault top search dock.
   - Cleaned redundant copy: removed `"ACADEMIC VAULT / REV-2019 'C' SCHEME REPOSITORY"` and `"KINETIC RETRIEVAL ENGINE"`.
2. **Animated Semester Dropdown (`DropdownMenu04` / `AnimatedFilterDropdown`)**:
   - Built spring-animated hierarchical dropdown in `codebits/components/ui/animated-filter-dropdown.tsx`.
   - Removed secondary subheadings on user instruction, retaining clean main headings (`ALL SEMESTERS`, `SEMESTER 1` through `SEMESTER 8`).
3. **HoverButton System (`hover-button-1`)**:
   - Created `codebits/components/ui/hover-button.tsx` inspired by Erik Valencia's `hover-button-1`.
   - Features kinetic label slide-out (`group-hover:translate-x-12`), dynamic incoming label with `ArrowRight` icon, and expanding emerald ripple bloom.
   - Removed visible resting black dots (`scale-0 opacity-0` at rest), blooming cleanly on hover.
   - Applied across all Branch buttons (`ALL`, `COMPS`, `IT`, `AI-DS`, `EXTC`, `MECH`, `CIVIL`), Category buttons (`All Types`, `Question Papers`, `Lecture Notes`, `Syllabus`, `Verified Solutions`), and Reset button.
4. **Anti-Metal CTA Button (`anti-metal-button`)**:
   - Created `codebits/components/ui/anti-metal-button.tsx` inspired by Muhammad Ammar's `anti-metal-button`.
   - Features industrial metallic body, cascading dot-wave chevron animations (`bd-dot-wave`), and an emerald sliding slab on hover.
   - Fully theme-adaptive: silver-white metallic in light mode, deep obsidian in dark mode.
   - Wired to "SUBMIT A PAPER" CTA linking to `/upload`.
5. **SkewCards Kinetic Document Cards**:
   - Upgraded `codebits/components/resources/ResourceCard.tsx` with 15° skewed multi-tier gradient panels (sharp backdrop + radiant glow) that straighten (`skew-x-0`) on hover.
   - Added floating glassmorphic blurred blobs with continuous bobbing animation (`animate-blob`).
   - Content container shifts leftward on hover (`group-hover:left-[-14px]`) creating rich parallax depth.
   - Assigned dynamic, discipline-tailored gradient themes (COMPS, IT, AI-DS, EXTC, MECH, CIVIL).
6. **Full Theme-Adaptive Polish**:
   - Transformed `ResourceCard` into a light-frosted glass panel in light mode (`bg-white/90`) and deep glass in dark mode (`bg-[rgba(14,16,15,0.88)]`).
   - Adaptive typography, badges, and high-contrast "STUDY" action buttons.
7. **Compliance Banner Clean-up**:
   - Removed the redundant footer verification banner from `codebits/app/vault/page.tsx`.
8. **Stacked Navigation Deck Update (`ScrollStackNav`)**:
   - Added `03 About Us` (`/about`) with `GraduationCap` icon to the 3D stacked deck in `codebits/components/navigation/ScrollStackNav.tsx`.
9. **Circular View Transition Theme Wipe**:
   - Upgraded `codebits/components/theme/ThemeProvider.tsx` and `AnimatedThemeToggler.tsx` with native View Transitions API (`document.startViewTransition`) creating a circular wave expansion from the click coordinates.
   - Added `::view-transition-old(root)` and `::view-transition-new(root)` rules to `globals.css`.

#### Files Changed
- `codebits/components/ui/gooey-input.tsx` (New: Aceternity GooeyInput)
- `codebits/components/ui/dropdown-menu-04.tsx` (New: Dropdown Menu primitive)
- `codebits/components/ui/animated-filter-dropdown.tsx` (New: Spring filter dropdown)
- `codebits/components/ui/hover-button.tsx` (New: Erik Valencia hover button)
- `codebits/components/ui/anti-metal-button.tsx` (New: Anti-metal button)
- `codebits/components/ui/button.tsx` (New: UI Button primitive)
- `codebits/components/ui/input.tsx` (New: UI Input primitive)
- `codebits/components/ui/separator.tsx` (New: UI Separator primitive)
- `codebits/components/resources/ResourceCard.tsx` (Updated: SkewCards animation & theme adaptivity)
- `codebits/components/resources/ResourceFilters.tsx` (Updated: HoverButton integration, semester labels simplified)
- `codebits/components/resources/ResourceGrid.tsx` (Updated: Grid spacing & index propagation)
- `codebits/components/navigation/ScrollStackNav.tsx` (Updated: Added About Us to nav deck)
- `codebits/components/theme/ThemeProvider.tsx` (Updated: Circular View Transition engine)
- `codebits/components/theme/AnimatedThemeToggler.tsx` (Updated: Mouse event propagation)
- `codebits/app/vault/page.tsx` (Updated: GooeyInput search, AntiMetalButton CTA, removed compliance banner)
- `codebits/app/globals.css` (Updated: View Transition CSS rules)
- `brain.md` (Updated: Iteration 14 logged, Vault page finalized)

#### Verification
- Dev server running on `http://localhost:3000/`.
- TypeScript validation (`npx tsc --noEmit`) passed with 0 errors.
- SSR HTTP 200 validated across `/` and `/vault`.
- Confirmed Landing Page remains strictly untouched.

