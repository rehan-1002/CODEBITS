# CODEBITS PORTAL
## Design Document

---

## 1. Design Direction

CodeBits must look like an institutional academic platform with a contemporary editorial interface.

The design must explicitly avoid:

- AI dashboard clichés
- excessive rounded cards
- floating gradient blobs
- neon cyberpunk styling
- generic glassmorphism everywhere
- random decorative 3D objects
- fake analytics panels
- excessive pill-shaped controls
- excessive animation
- emojis
- generic marketing copy
- visual elements without functional purpose

The visual language should feel intentional enough to be built in Figma by a human designer.

---

## 2. Core Visual System

### Background

```text
#0B0F0E
```

Obsidian charcoal.

### Surface

```text
#131917
```

Deep emerald-tinted slate.

### Border

```text
#1F2925
```

Subtle structural border.

### Brand

```text
#00C269
```

Primary emerald.

### Dark brand

```text
#009E52
```

### Text

```text
Primary:   #F8FAFC
Secondary: #94A3B8
```

No gradients.

Lighting effects should be produced with opacity, blur, borders, shadows, and controlled ambient elements rather than color gradients.

---

## 3. Typography

### Interface

Preferred:

- Inter
- Plus Jakarta Sans

### Technical labels

Preferred:

- JetBrains Mono
- Geist Mono

Use monospace for:

- academic scheme
- branch identifiers
- semester labels
- resource IDs
- system states
- compact metadata

Avoid using monospace for long body text.

---

## 4. Layout Principles

### Principle 1: Content first

Academic resources are the product. Decoration must never overpower resource discovery.

### Principle 2: Structural hierarchy

Use:

- spacing
- typography
- borders
- alignment
- scale

to create hierarchy before adding motion.

### Principle 3: Controlled density

The vault can be information-dense. The landing page can be spacious. They should not use the same composition.

### Principle 4: Real content only

Production screens must consume real records or verified institutional content.

---

## 5. Navbar

Sticky top navigation:

```text
CB | CodeBits by Prof. MRF              MENU   ACCESS VAULT
```

Properties:

- dark translucent surface
- backdrop blur
- bottom border
- compact height
- no oversized floating capsule

The brand monogram uses:

`public/LOGO CB.png`

---

## 6. ScrollStack Navigation

External component:

`ScrollStack`

Role:

- full-viewport navigation drawer
- stacked navigation panels
- large route labels
- smooth internal scrolling

Navigation destinations:

- MU Vault
- About & Centers
- Community Upload
- Inquiries

The component must be used as navigation infrastructure, not as a generic card carousel.

---

## 7. AnimatedThemeToggler

External component:

`AnimatedThemeToggler`

Role:

- controlled theme switching

It must not introduce gradients or unrelated visual effects.

The theme control should remain secondary to the primary Vault CTA.

---

## 8. Landing Motion Architecture

### Skiper19

Use for the primary scroll-driven SVG path.

The sequence should communicate:

```text
Problem
    ↓
Discovery
    ↓
Connection
    ↓
CodeBits
    ↓
Resources
```

The SVG path is emerald and should remain visually simple.

### TextAnimate

Use only for short interstitial statements.

Approved statements from the architecture:

```text
scattered resources?
we got you
```

The component should animate into place at deliberate scroll positions.

### ScrollFloat

Use for the final `CODEBITS` title reveal.

The title transformation:

```text
yPercent: 120 → 0
scaleY: 2.3 → 1
```

GSAP stagger:

```text
0.03
```

Animation should be scrubbed to scroll.

---

## 9. About Page

### NumberFlow

External component:

`@number-flow/react`

Use for verified institutional metrics.

Examples from the product specification:

- Candidates Placed
- Hiring Partners
- Average Package

These values must be sourced from verified production content.

### Partner Marquee

Use a restrained horizontal marquee.

Logos must be official assets and must not be fabricated.

### Faculty Accordion

Use the Tailwind Image Accordion implementation for faculty presentation.

Interaction:

```text
default → compact faculty columns
hover/focus → selected column expands
```

The expanded state reveals:

- portrait
- name
- designation
- domain

Only verified faculty records are allowed.

---

## 10. Vault Design

The Vault is the most important functional screen.

Suggested structure:

```text
RESOURCE VAULT
Mumbai University Academic Repository

[Branch] [Semester] [Category]                  [Search]

------------------------------------------------------------
RESOURCE
Subject / Branch / Semester / Scheme
Uploaded by...
                                      VIEW
------------------------------------------------------------
```

Avoid turning every filter into a large rounded pill.

Use compact bordered controls.

Resource cards should feel like catalog entries rather than SaaS feature cards.

---

## 11. Upload Design

The upload screen should resemble an academic submission form.

Structure:

```text
SUBMIT RESOURCE

Document information
Subject
Branch
Semester
Document Type

PDF
[ drop document here ]

Submission status
...
```

The upload interface should clearly communicate that student submissions are moderated.

---

## 12. Viewer Design

The document viewer should be intentionally minimal.

Recommended composition:

```text
TOP BAR
resource title | metadata | close

---------------- DOCUMENT ----------------

        canvas page
        watermark
        canvas page

--------------------------------------------

viewer controls
```

Do not surround the document with unnecessary cards.

The document should dominate the screen.

---

## 13. cbAI Design

The search dock should look like a command interface, not a chatbot.

Trigger:

`Ctrl + K`

Input:

```text
Search the academic vault...
```

Result format:

```text
3 results

Engineering Mathematics III
COMPS · SEM 3 · PYQ

VIEW
```

Avoid:

- assistant avatars
- chat bubbles
- fake typing effects
- AI sparkles
- conversational filler

The AI is a search interface.

---

## 14. Motion Rules

Motion should have a reason.

Allowed:

- route transitions
- scroll storytelling
- state changes
- counters
- focus/hover feedback
- navigation drawer movement

Avoid:

- constant floating
- perpetual background movement
- excessive parallax
- animation on every card
- delayed content that harms usability

Respect:

`prefers-reduced-motion`

---

## 15. Responsive Design

### Mobile

Priorities:

1. navigation
2. resource filters
3. document access
4. upload
5. readable typography

### Desktop

Priorities:

1. editorial composition
2. dense vault browsing
3. protected viewer
4. navigation system

---

## 16. Design QA Checklist

Before accepting a screen:

- Does it work without gradients?
- Does it still look good without animation?
- Is the primary action obvious?
- Is every visible data point real?
- Is any component present only because it looks impressive?
- Does the layout resemble an academic product rather than an AI startup template?
- Are there unnecessary rounded containers?
- Are there any emojis?
- Are there any fake records?
- Are there any generic AI phrases?
