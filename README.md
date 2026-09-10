# CodeBits — Academic Resource Platform

Production frontend repository for the CodeBits Academic Portal, engineered specifically for Mumbai University under the Rev-2019 'C' Scheme.

## Project Architecture
- **Application Directory:** `./codebits`
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (Obsidian & Emerald custom tokens)
- **Motion & Physics:** Framer Motion, Lenis Smooth Scroll, GSAP
- **Components:** Magic UI, 21st.dev, Lucide Icons

---

## Quick Start & Local Setup

1. **Enter directory:**
   ```bash
   cd codebits
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production build:**
   ```bash
   npm run build
   ```

---

## Deployment Configuration (Vercel / Cloudflare / Render)

When connecting this repository to automated deployment platforms:

- **Root Directory:** Set to `codebits`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Node.js Version:** `18.x` or `20.x`
