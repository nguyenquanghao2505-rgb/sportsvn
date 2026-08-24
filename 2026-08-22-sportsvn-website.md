# SportsVN Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first production-quality static SportsVN portal that can be published on GitHub Pages and connected to `sportsvn.com`.

**Architecture:** A dependency-free static site using HTML, CSS and JavaScript. The public UI is separated into semantic sections so the same structure can later be populated by APIs or a database without redesigning the front end.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, SVG/emoji-safe inline UI, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-22-sportsvn-website-design.md`

## Global Constraints

- GitHub Pages compatible with no server-side code.
- Use Vietnamese language throughout the public interface.
- Responsive on desktop and mobile.
- Primary visual identity is blue and white.
- Do not require npm, Node.js, PHP, or a database in Phase 1.
- Custom domain is `sportsvn.com`.

---

### Task 1: Create the public page structure

**Files:**
- Create: `index.html`

**Interfaces:**
- Produces the complete public page structure consumed by `styles.css` and `app.js`.
- Uses stable IDs/classes: `site-header`, `mobile-menu`, `hero`, `news-grid`, `sports-grid`, `events-grid`, `schedule-list`, `results-list`, `athletes-grid`, `registration`.

- [ ] **Step 1: Create semantic HTML sections**
  Include header/navigation, hero story, latest news, sports categories, tournaments, schedule, results, athletes, registration CTA, and footer.

- [ ] **Step 2: Add realistic Vietnamese sample content**
  Use SportsVN-oriented copy and sample sports/event names so the page looks complete rather than like a blank template.

- [ ] **Step 3: Link assets**
  Link `styles.css` and `app.js` and include the local `CNAME` deployment metadata separately.

- [ ] **Step 4: Validate structure**
  Open the file directly in a browser and verify all sections render without external dependencies.

---

### Task 2: Build the responsive visual system

**Files:**
- Create: `styles.css`

**Interfaces:**
- Styles all semantic sections from `index.html`.
- Defines responsive breakpoints for navigation, cards, grids, schedule rows and hero layout.

- [ ] **Step 1: Define typography, spacing and containers**
  Establish a consistent max-width, spacing scale, rounded cards and editorial hierarchy.

- [ ] **Step 2: Style the header and hero**
  Make the site immediately recognizable as a sports portal with a strong blue visual identity and prominent headline.

- [ ] **Step 3: Style content grids**
  Create responsive news, sports, event, athlete and schedule cards.

- [ ] **Step 4: Add mobile behavior**
  Collapse navigation and multi-column content at mobile widths while preserving readable tap targets.

- [ ] **Step 5: Check desktop and mobile rendering**
  Verify at approximately 1440px and 390px widths.

---

### Task 3: Add lightweight interactions

**Files:**
- Create: `app.js`

**Interfaces:**
- Mobile menu toggle.
- News/category filtering UI.
- Simple site search over visible card text.
- Current navigation state.

- [ ] **Step 1: Implement mobile menu**
  Toggle the mobile navigation without a dependency.

- [ ] **Step 2: Implement category filtering**
  Filter visible news/event cards by sport/category labels.

- [ ] **Step 3: Implement search**
  Search visible headings and summaries and show a simple no-results state.

- [ ] **Step 4: Verify interactions**
  Test menu, filter and search manually in a browser.

---

### Task 4: Configure GitHub Pages custom domain

**Files:**
- Create: `CNAME`

**Interfaces:**
- GitHub Pages reads the exact custom domain `sportsvn.com`.

- [ ] **Step 1: Write the domain**
  `sportsvn.com`

- [ ] **Step 2: Verify deployment assumptions**
  Ensure the file is at repository root and contains only the domain text.

---

### Task 5: Package and verify the site

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `app.js`
- Verify: `CNAME`

- [ ] **Step 1: Run a local static server**
  Serve the root directory and open the homepage in a browser.

- [ ] **Step 2: Check for missing local assets**
  Confirm the page does not depend on unavailable local files.

- [ ] **Step 3: Check responsive layout**
  Test desktop and mobile widths.

- [ ] **Step 4: Package the repository**
  Create a ZIP containing the repository root so it can be uploaded to GitHub.

- [ ] **Step 5: Provide GitHub upload instructions**
  Upload the site files into the existing `sportsvn` repository, enable Pages from the `main` branch, then configure DNS at the domain registrar.
