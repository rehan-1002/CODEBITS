# CODEBITS PORTAL
## Functional Requirements Document (FRD)

---

## 1. Functional Architecture

```text
PUBLIC
  /
  ├── Landing
  ├── /about
  └── /vault

AUTH
  └── /login

PROTECTED
  ├── /viewer/[id]
  └── /upload

SERVER
  └── /api/cb-ai

DATABASE
  ├── profiles
  ├── resources
  └── inquiries

REALTIME
  └── profile session changes
```

---

## 2. Authentication Requirements

### FR-AUTH-01 Registration

The system shall accept:

- full name
- email
- phone
- password

Phone validation:

```text
^[6-9]\d{9}$
```

Email confirmation is disabled according to the current architecture.

The application must create a corresponding profile record after successful account creation.

### FR-AUTH-02 Login

The login input shall accept either:

- email
- phone

If phone is provided, the server-side authentication workflow resolves the corresponding email before calling password authentication.

### FR-AUTH-03 Session Identifier

Every successful login shall generate a new random session identifier.

The identifier is stored in:

`profiles.current_session_id`

### FR-AUTH-04 Concurrent Session Eviction

A client shall subscribe to profile changes.

When the stored session identifier differs from the local authenticated session identifier:

1. sign out
2. stop protected document rendering
3. redirect to the login route
4. expose a concurrent-device reason

---

## 3. Vault Requirements

### FR-VAULT-01 Resource Listing

Only resources with:

`status = approved`

shall be publicly returned.

### FR-VAULT-02 Filtering

The vault shall support client-side filtering by:

- branch
- semester
- category

### FR-VAULT-03 Resource Card

Each card shall display:

- title
- subject
- branch
- semester
- scheme
- category
- uploader attribution

### FR-VAULT-04 Empty State

When no approved record matches:

- explain that no matching resource exists
- provide a path toward upload
- do not create a fabricated result

---

## 4. Protected Viewer Requirements

### FR-VIEW-01 Authorization

Viewer access must verify authentication before rendering the document.

### FR-VIEW-02 Resource Resolution

The application shall resolve the resource by database identifier.

### FR-VIEW-03 PDF Rendering

pdf.js shall render individual pages into HTML canvas elements.

### FR-VIEW-04 Watermark

The rendered document shall contain a repeating watermark containing the authenticated user's:

- full name
- phone number

plus the licensing label.

### FR-VIEW-05 Viewer Protection

The UI may implement:

- context-menu suppression
- selection suppression
- common keyboard shortcut interception
- focus-loss visual obscuring

These are deterrence mechanisms, not cryptographic DRM.

---

## 5. Upload Requirements

### FR-UPLOAD-01 Authentication

Only authenticated users may submit resources.

### FR-UPLOAD-02 Metadata

Required fields:

- subject
- branch
- semester
- category
- PDF

### FR-UPLOAD-03 Admin Submission

Admin submissions shall enter the catalog as:

`approved`

### FR-UPLOAD-04 Student Submission

Student submissions shall enter as:

`pending`

### FR-UPLOAD-05 Public Visibility

Pending and rejected resources must not appear in the public vault.

---

## 6. Moderation Requirements

The moderation interface shall allow an authorized administrator to:

- view pending resources
- inspect metadata
- approve
- reject

The application must not trust a client-provided role field for authorization. Server-side authorization must determine administrative permissions.

---

## 7. cbAI Requirements

### FR-AI-01 Input

The search interface accepts natural-language text.

### FR-AI-02 Processing

The server route sends the request to the Gemini API.

### FR-AI-03 Structured Output

The AI should resolve the request into constrained fields such as:

```text
branch
semester
subject
category
```

### FR-AI-04 Database Authority

The AI cannot create or invent resource records.

### FR-AI-05 Result

Returned resources must come from the database and respect approval status.

### FR-AI-06 Failure

If parsing fails, the system must return a useful search fallback rather than hallucinating an answer.

---

## 8. Inquiry Requirements

The inquiry form accepts:

- name
- phone
- email
- program

A new record is inserted into `inquiries`.

Public users may submit an inquiry, but they must not receive unrestricted read access to inquiry records.

---

## 9. Database Functional Requirements

### profiles

Purpose:

- application profile
- role
- phone identifier
- active session identifier

### resources

Purpose:

- resource catalog
- uploader attribution
- moderation state
- metadata
- activity count

### inquiries

Purpose:

- institutional lead/contact capture

---

## 10. RLS Requirements

Required policies include:

### Profiles

A user may read/update their own profile.

### Resources

Public users may read approved resources.

Authenticated users may insert resources only where their authenticated ID equals `uploader_id`.

Administrative operations require explicit server-side role authorization.

### Inquiries

Public users may insert inquiries.

Public users must not read all inquiries.

---

## 11. Error States

Every data-dependent component requires:

- loading state
- empty state
- error state
- success state

The interface must not silently render fake content when an API or database request fails.

---

## 12. Accessibility Requirements

- keyboard-accessible navigation
- visible focus states
- semantic buttons
- semantic links
- readable contrast
- reduced-motion support
- functional core workflows without animation
- form validation messages associated with their inputs

---

## 13. Responsive Requirements

Supported layouts:

- mobile
- tablet
- desktop

The resource vault must remain usable on narrow screens.

The protected viewer must adapt to device dimensions without relying on desktop-only interactions.

---

## 14. Security Functional Boundary

Client-side controls can discourage casual copying but cannot guarantee prevention of:

- screenshots
- external cameras
- operating-system capture
- browser instrumentation
- determined extraction

The system should therefore combine:

- authentication
- authorization
- controlled document delivery
- watermarking
- session enforcement
- moderation
- logging
