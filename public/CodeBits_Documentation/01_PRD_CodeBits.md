# CODEBITS PORTAL
## Product Requirements Document (PRD)

**Product:** CodeBits Academic Vault & Institutional Portal  
**Working identity:** CodeBits by Prof. MRF  
**Primary audience:** Mumbai University engineering students  
**Academic scope:** Engineering branches, Semesters 1–8, Rev-2019 C Scheme

---

## 1. Product Vision

CodeBits is a centralized academic resource platform for Mumbai University engineering students. It provides controlled access to previous-year question papers, notes, syllabi, and solutions while also acting as an institutional information and community contribution portal.

The product must feel like a serious academic system, not a generic AI-generated SaaS landing page.

The experience should be dark, restrained, editorial, technical, and highly usable. Motion exists to communicate hierarchy and navigation, not to decorate every section.

---

## 2. Problem

Academic resources are commonly distributed through disconnected WhatsApp groups, drives, personal chats, and student-to-student sharing. This creates:

- poor discoverability
- duplicate files
- unclear source attribution
- difficulty finding resources by branch, semester, and subject
- no moderation layer for community uploads
- weak document ownership and access control
- no institutional presentation layer

CodeBits consolidates these workflows into one system.

---

## 3. Goals

### Primary goals

1. Provide a searchable academic repository.
2. Organize resources by branch, semester, subject, category, and academic scheme.
3. Require account identification before protected resource access.
4. Allow students to contribute resources.
5. Require moderation for student submissions.
6. Allow administrators to publish institutional resources immediately.
7. Provide a protected browser document-reading experience.
8. Enforce one active authenticated device per account.
9. Provide natural-language resource discovery through cbAI.
10. Present institutional information, faculty, centers, and placement records.

### Secondary goals

- make resource discovery faster than browsing folders
- make upload provenance visible
- make the platform usable on desktop and mobile
- maintain a consistent design language across public and protected routes

---

## 4. Non-Goals

The first release does not attempt to become:

- a complete Learning Management System
- an online examination platform
- a payment platform
- a chat application
- a video-learning platform
- an unrestricted public file-hosting service
- an OTP-based identity verification system

---

## 5. Users

### Student

Can:

- register
- log in with email or phone
- browse approved resources
- view protected documents
- upload academic resources
- track their own submissions
- use cbAI search

### Administrator

Can:

- access the moderation workflow
- publish resources
- approve or reject student submissions
- manage institutional resource attribution
- monitor resource activity

---

## 6. Core Product Areas

### 6.1 Landing

Route: `/`

Purpose:

- explain the platform
- establish CodeBits identity
- direct students to resources
- communicate institutional credibility

Required experience:

- Hero
- kinetic SVG path sequence
- contextual text interruptions
- CodeBits title reveal
- CB mark
- Continue to Resources CTA

No fabricated statistics may be inserted. Institutional numbers must come from an approved source or an administrator-controlled data source.

### 6.2 About

Route: `/about`

Contains:

- institutional metrics
- partner logos
- team/faculty presentation
- center information
- contact actions

All displayed institutional claims must originate from verified content.

### 6.3 Vault

Route: `/vault`

Filters:

- Branch
- Semester
- Category

Categories:

- PYQ
- Notes
- Syllabus
- Solution

Every resource card must expose:

- title
- subject
- branch
- semester
- academic scheme
- uploader attribution

Only approved resources are publicly discoverable.

### 6.4 Authentication

Routes:

- `/login`
- registration flow

Registration collects:

- full name
- email
- Indian mobile number
- password

No OTP is required.

Login accepts:

- email
- phone

### 6.5 Viewer

Route:

`/viewer/[id]`

The protected viewer:

- checks authenticated access
- resolves the resource
- obtains the document through a protected application flow
- renders PDF pages through pdf.js
- draws pages onto canvas
- stamps user-specific information
- does not expose the document through an iframe

### 6.6 Community Upload

Route:

`/upload`

Fields:

- subject
- branch
- semester
- document type
- PDF

Admin upload:

`approved`

Student upload:

`pending`

Student submissions appear publicly only after approval.

### 6.7 cbAI

Shortcut:

`Ctrl + K`

The agent accepts natural language such as:

`3rd sem COMPS maths PYQ`

The server-side AI layer extracts structured search parameters and queries the database.

If nothing matches:

`Not available or not uploaded yet. Be the first to upload!`

The AI must never fabricate a resource.

---

## 7. Product Rules

1. No mock resources.
2. No fake student names.
3. No placeholder institutional statistics in production.
4. No fabricated faculty information.
5. No fabricated partner logos.
6. No fake download counts.
7. AI may interpret a request, but database records determine availability.
8. Unapproved resources must not appear in public search results.
9. Student resources must retain uploader attribution.
10. Only one active authenticated session may remain valid per account.
11. Authentication is required before protected resource viewing/downloading.
12. Security controls must not be presented as an absolute guarantee against screenshots or recording.

---

## 8. Success Criteria

### Discovery

A student should be able to locate an approved resource using branch, semester, category, or cbAI.

### Contribution

A student should be able to submit a PDF without administrator access.

### Moderation

An administrator should be able to approve or reject pending submissions.

### Security

A second login should invalidate the previous active application session.

### Viewer

An authorized user should see a personalized document viewer without an iframe-based PDF viewer.

### Experience

The interface should remain readable and functional without animation.

---

## 9. Release Priority

### P0

- authentication
- profiles
- resources
- RLS
- vault filtering
- protected viewer
- uploads
- moderation
- session guard

### P1

- cbAI
- about page
- institutional metrics
- partner presentation
- faculty presentation

### P2

- advanced analytics
- additional search refinement
- richer admin controls
- operational reporting

---

## 10. Acceptance Principle

A feature is not complete because its UI exists. It is complete when the UI, database state, authorization rules, error handling, loading state, empty state, and real data flow all work together.
