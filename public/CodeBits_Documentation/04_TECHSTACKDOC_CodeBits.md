# CODEBITS PORTAL
## Technical Stack & External Component Specification

---

## 1. Stack Overview

```text
Frontend
  Next.js App Router
  React
  TypeScript
  Tailwind CSS

Motion / Interaction
  Framer Motion
  GSAP
  Lenis
  ScrollStack
  Skiper19
  ScrollFloat
  TextAnimate
  Skiper37
  @number-flow/react
  Tailwind Image Accordion
  AnimatedThemeToggler

Backend
  Next.js API Routes / Server Actions
  Supabase
  PostgreSQL
  Supabase Realtime

Authentication
  Supabase Auth

Documents
  pdf.js
  HTML5 Canvas

AI
  Google Gemini API

Assets / Typography
  Inter or Plus Jakarta Sans
  JetBrains Mono or Geist Mono
```

---

## 2. Next.js

### Role

Application framework.

Use:

- App Router
- route groups
- server components by default
- client components only where interaction is required
- API routes for server-side integrations
- server-side Supabase clients

Next.js owns routing and application composition.

---

## 3. React

Use React for:

- interactive filters
- viewer state
- authentication forms
- upload workflow
- navigation drawer
- motion components
- AI search dock

Do not convert the entire application into unnecessary client components.

---

## 4. TypeScript

TypeScript should define shared domain types.

Recommended core types:

```ts
UserRole
DocumentCategory
ModerationStatus
Resource
Profile
Inquiry
ResourceFilters
CbAiQuery
```

Avoid `any` in application-domain code.

---

## 5. Tailwind CSS

Tailwind owns:

- layout
- spacing
- responsive breakpoints
- typography utilities
- borders
- surfaces
- state styling

Core tokens:

```text
background: #0B0F0E
surface:    #131917
border:     #1F2925
brand:      #00C269
text:       #F8FAFC
muted:      #94A3B8
```

Do not introduce gradient utilities.

---

## 6. Framer Motion

Use for:

- route transitions
- local component entrance
- navigation interactions
- small UI state transitions

Do not use Framer Motion for the GSAP-controlled scroll sequences.

---

## 7. GSAP + ScrollTrigger

Use GSAP for:

- ScrollFloat
- character-level CODEBITS reveal
- scroll-scrubbed typography

GSAP should own the timeline when a component is explicitly designed around GSAP.

Do not have Framer Motion and GSAP fight over the same transform property.

---

## 8. Lenis

Use Lenis as the smooth-scroll foundation for the ScrollStack navigation experience.

Lenis should have one controlled lifecycle.

Avoid creating independent Lenis instances in multiple components.

---

## 9. ScrollStack

Purpose:

Full-screen stacked routing drawer.

Usage:

```text
Navbar trigger
    ↓
ScrollStack
    ├── Vault
    ├── About
    ├── Upload
    └── Inquiries
```

It is navigation, not a generic content presentation mechanism.

---

## 10. Skiper19

Purpose:

Landing-page SVG kinetic path.

Responsibilities:

- read scroll progress
- map progress to SVG path length
- trigger visual sections at defined scroll positions

The component should be isolated:

`components/sections/Skiper19Scroll.tsx`

---

## 11. TextAnimate

Purpose:

Short scroll-triggered editorial statements.

Use:

`blurInUp`

Do not use it for entire paragraphs.

---

## 12. ScrollFloat

Purpose:

Final CodeBits character reveal.

GSAP handles:

- stagger
- scrub
- vertical displacement
- scale normalization

Keep this animation isolated from the rest of the page.

---

## 13. Skiper37 + @number-flow/react

Purpose:

About-page institutional metrics.

NumberFlow provides animated numeric transitions.

Important:

The component does not provide the data.

Data must come from a real source.

---

## 14. Tailwind Image Accordion

Purpose:

Faculty showcase.

Use responsive expanding columns.

Required source:

`public/faculty/`

For production, faculty metadata should be stored separately from presentation logic rather than hard-coded into animation components.

---

## 15. AnimatedThemeToggler

Purpose:

Theme switching.

It should be placed in the global navigation utility area.

It must not dictate the overall visual language.

---

## 16. Supabase

Supabase provides:

- PostgreSQL
- Auth
- Realtime
- storage/integration layer as required

Database tables:

```text
profiles
resources
inquiries
```

RLS is mandatory.

---

## 17. PostgreSQL

The database is the source of truth for:

- user roles
- resource metadata
- moderation state
- uploader attribution
- inquiry records
- session identifiers

The frontend must never be considered an authority for authorization.

---

## 18. Supabase Auth

Use password authentication.

Registration:

```text
name
email
phone
password
```

Login:

```text
email OR phone
password
```

Phone is an application-level identifier mapped to the authentication email.

---

## 19. Supabase Realtime

Use Realtime to observe profile changes.

Session flow:

```text
Device A
  session = A

Device B logs in
  session = B
  ↓
profiles.current_session_id = B
  ↓
Realtime UPDATE
  ↓
Device A detects mismatch
  ↓
signOut()
  ↓
viewer unmounted
  ↓
login?reason=concurrent_device
```

---

## 20. pdf.js

Purpose:

Render PDFs without embedding the browser's native PDF viewer.

Flow:

```text
authorized resource
       ↓
protected document retrieval
       ↓
pdf.js
       ↓
page render
       ↓
HTML5 Canvas
       ↓
watermark
       ↓
viewer
```

The implementation should not place a raw `.pdf` URL in an iframe.

---

## 21. HTML5 Canvas

Canvas provides the document presentation layer.

Each page can be rendered independently.

Watermark rendering is applied to the canvas context.

The viewer should clean up:

- PDF document instances
- page render tasks
- canvas resources
- event listeners

when the component unmounts.

---

## 22. Google Gemini API

Gemini is used by:

`/api/cb-ai`

Pipeline:

```text
User query
   ↓
API route
   ↓
Gemini
   ↓
structured query
   ↓
validation
   ↓
database query
   ↓
approved resources
   ↓
results
```

The API key must remain server-side.

The AI must never be trusted to decide authorization.

---

## 23. AI Output Contract

Conceptual output:

```ts
type CbAiQuery = {
  branch?: string
  semester?: number
  subject?: string
  category?: "pyq" | "notes" | "syllabus" | "solution"
}
```

The server validates the output before using it.

---

## 24. External Component Ownership

| Component | Owner | Responsibility |
|---|---|---|
| ScrollStack | navigation | full-screen routing drawer |
| Lenis | scrolling | smooth scrolling |
| Skiper19 | landing | SVG scroll path |
| TextAnimate | landing | short editorial reveal |
| ScrollFloat | landing | CODEBITS title reveal |
| Skiper37 | about | metric section |
| @number-flow/react | about | numeric transitions |
| Tailwind Image Accordion | about | faculty interaction |
| AnimatedThemeToggler | global | theme switching |
| Framer Motion | general | local UI motion |
| GSAP | landing | timeline/scroll typography |
| pdf.js | viewer | PDF rendering |
| Supabase Realtime | security | concurrent-session invalidation |
| Gemini | search | natural-language query interpretation |

---

## 25. Environment Variables

Never hard-code secrets.

Expected configuration includes:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
```

The service role key and Gemini key must never reach client-side bundles.

---

## 26. Deployment

Recommended:

```text
GitHub
   ↓
Vercel
   ↓
Next.js application

Supabase
   ├── Auth
   ├── PostgreSQL
   └── Realtime
```

Secrets belong in deployment environment configuration.

---

## 27. Performance Rules

- server components by default
- lazy-load heavy viewer dependencies
- isolate animation components
- avoid duplicate scroll engines
- avoid rendering every PDF page simultaneously for large documents
- clean up subscriptions
- avoid unnecessary global state
- optimize faculty images
- do not load heavy animation libraries on routes that do not use them
