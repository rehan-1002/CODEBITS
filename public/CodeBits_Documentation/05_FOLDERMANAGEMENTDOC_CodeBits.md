# CODEBITS PORTAL
## Folder Management & Engineering Organization Document

---

## 1. Recommended Tree

```text
codebits/
│
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── viewer/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── upload/
│   │       └── page.tsx
│   │
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── vault/
│   │       └── page.tsx
│   │
│   ├── api/
│   │   └── cb-ai/
│   │       └── route.ts
│   │
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ai/
│   │   └── CbAiDrawer.tsx
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   │
│   ├── drm/
│   │   ├── ProtectedCanvasViewer.tsx
│   │   └── WatermarkLayer.ts
│   │
│   ├── navigation/
│   │   ├── Navbar.tsx
│   │   └── ScrollStackNav.tsx
│   │
│   ├── resources/
│   │   ├── ResourceCard.tsx
│   │   ├── ResourceFilters.tsx
│   │   └── ResourceGrid.tsx
│   │
│   ├── upload/
│   │   └── ResourceUploadForm.tsx
│   │
│   ├── sections/
│   │   ├── FacultyAccordion.tsx
│   │   ├── MarqueeBanner.tsx
│   │   ├── Skiper19Scroll.tsx
│   │   ├── Skiper37Stats.tsx
│   │   └── ScrollFloatTitle.tsx
│   │
│   └── ui/
│       └── ...
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
│   ├── LOGO CB.png
│   ├── faculty/
│   └── partners/
│
├── supabase/
│   ├── migrations/
│   └── seed/
│
├── docs/
│   ├── PRD.md
│   ├── FRD.md
│   ├── DESIGNDOC.md
│   ├── TECHSTACKDOC.md
│   └── FOLDERMANAGEMENTDOC.md
│
├── .env.local
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 2. Folder Responsibilities

### app/

Owns:

- routes
- route layouts
- route-level server/client boundaries
- API endpoints

Do not place generic reusable UI here.

### components/

Owns reusable UI and feature components.

Feature-specific components should remain close to their domain.

### hooks/

Owns reusable React hooks.

Example:

`useSessionGuard`

### lib/

Owns:

- API clients
- database helpers
- validation
- external-service wrappers

Do not put visual components here.

### types/

Owns shared TypeScript contracts.

### public/

Owns static assets.

Examples:

- logo
- faculty photos
- partner logos

Do not store database-generated resources here.

### supabase/

Owns database migrations and optional local-development seed tooling.

Production must not depend on hard-coded fake resource data.

### docs/

Owns product and engineering documentation.

---

## 3. Component Placement Rules

A component belongs in `components/sections` when it represents a page section.

A component belongs in a feature folder when it represents a reusable domain feature.

Examples:

```text
ResourceCard.tsx
→ components/resources/

ProtectedCanvasViewer.tsx
→ components/drm/

CbAiDrawer.tsx
→ components/ai/
```

Do not create a giant `components/Everything.tsx`.

---

## 4. Naming Rules

Use PascalCase for React components:

```text
ResourceCard.tsx
ProtectedCanvasViewer.tsx
```

Use camelCase for utility files:

```text
validation.ts
resources.ts
```

Use route conventions required by Next.js:

```text
page.tsx
layout.tsx
route.ts
```

---

## 5. Data Ownership

### UI

May hold:

- selected filter
- open/closed state
- animation state
- temporary form state

### Database

Owns:

- resources
- user profiles
- moderation status
- uploader information
- inquiries

### Server

Owns:

- secret API keys
- privileged authorization
- phone-to-email resolution
- administrative operations
- AI API calls

---

## 6. No Mock Data Policy

Production code must not contain fake resources such as:

```ts
const resources = [
  {
    title: "Engineering Mathematics III",
    uploader: "John Doe"
  }
]
```

If the database is empty, render the real empty state.

Development fixtures, if ever required, must be explicitly isolated under:

```text
supabase/seed/
```

and must never be silently loaded into production.

---

## 7. Asset Management

### Logo

```text
public/LOGO CB.png
```

### Faculty

```text
public/faculty/
```

### Partners

```text
public/partners/
```

Assets must have meaningful filenames.

Avoid:

```text
img1.png
finalfinal2.png
newlogoREAL.png
```

Prefer:

```text
prof-mrf.png
axis-bank.svg
hdfc-bank.svg
```

---

## 8. Environment Management

`.env.local` is local-only.

`.env.example` contains variable names without secrets.

Example:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

Never commit `.env.local`.

---

## 9. Git Management

Recommended branches:

```text
main
develop
feature/auth
feature/vault
feature/viewer
feature/upload
feature/cb-ai
feature/design
```

Commit examples:

```text
feat: implement dual identifier authentication
feat: add protected canvas viewer
fix: enforce approved resource visibility
refactor: isolate session guard
style: refine vault catalog layout
docs: update architecture specification
```

Avoid:

```text
changes
final
final2
latest
working
```

---

## 10. Documentation Rule

When an architectural decision changes, update the relevant documentation.

Minimum documentation chain:

```text
Requirement changed
       ↓
PRD / FRD
       ↓
Design or architecture change
       ↓
Implementation
       ↓
Folder / technical documentation
```

The repository should never contain documentation describing an architecture that no longer exists.

---

## 11. Dependency Rule

Before adding a package, determine:

1. what problem it solves
2. whether an existing package already solves it
3. whether it increases bundle size
4. whether it conflicts with existing motion/state ownership
5. whether it is necessary in production

The presence of a component library is not a reason to use every component in it.

---

## 12. Motion Ownership

```text
Framer Motion
→ local UI transitions

GSAP / ScrollTrigger
→ scroll-driven typography

Lenis
→ smooth scrolling

ScrollStack
→ navigation drawer

Skiper components
→ designated page interactions
```

Never create multiple competing implementations of the same animation.

---

## 13. Security Ownership

```text
Supabase Auth
→ identity

RLS
→ database authorization

Server routes
→ privileged operations

Realtime
→ concurrent session detection

pdf.js + Canvas
→ controlled presentation

Watermark
→ user attribution / deterrence
```

No single client-side technique should be described as complete DRM.

---

## 14. Development Order

```text
1. Project foundation
2. Supabase schema + migrations
3. Authentication
4. Session guard
5. Vault data flow
6. Upload + moderation
7. Protected viewer
8. Public landing
9. About
10. cbAI
11. polish + responsive QA
12. security review
13. deployment
```

Build the functional system before polishing animation.

---

## 15. Definition of Done

A feature is considered complete only when:

- TypeScript passes
- lint passes
- production build passes
- database permissions are verified
- loading state exists
- empty state exists
- error state exists
- mobile layout works
- accessibility basics work
- no mock data is used
- no secrets are exposed
- documentation matches implementation
