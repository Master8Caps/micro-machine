# Micro Machine — Project Plan

## Project Overview

Micro Machine is an internal-first SaaS product that turns a simple product brief into a structured early-growth engine. It helps find the right avatars, test positioning, and acquire the first 100 users for micro-SaaS products.

**Primary audience (initial):** Internal micro-SaaS products built by the team.
**Future audience:** Solo founders, indie hackers, early-stage SaaS teams.

### What It Does

1. Collects a short product/market/goals brief
2. Identifies and refines target avatars (ICPs)
3. Generates social campaign angles per avatar per channel
4. Generates ad campaign angles (retargeting + cold traffic) if user opts in
5. Generates a website kit (landing page copy, welcome emails, meta descriptions, taglines) if user has a website
6. Produces channel-specific content pieces with copy-to-clipboard
7. Tracks clicks and early engagement signals via redirect links
8. (Future) Identifies winning hooks/angles/avatars and regenerates based on performance

### Architecture

- **Monorepo:** pnpm workspaces + Turborepo
- **Marketing site** (`apps/marketing`): Conversion-focused single page, deployed to `yourdomain.com`
- **App** (`apps/app`): SaaS application, deployed to `app.yourdomain.com`
- **Shared packages:** UI components, TypeScript configs, shared types

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (dark-mode-first) |
| Database | Supabase (Postgres + pgvector) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Primary LLM | Anthropic (Claude Sonnet 4) |
| Embeddings | OpenAI (deferred) |
| Hosting | Vercel (two deployments) |
| Email | Resend or Postmark (deferred) |

---

## Completed Work

### Infrastructure & Setup
- [x] Monorepo scaffolding (pnpm workspaces + Turborepo)
- [x] Root config: package.json, turbo.json, .gitignore, .npmrc, prettier
- [x] Shared packages: `@repo/config`, `@repo/ui`, `@repo/types`
- [x] Environment variables declared in turbo.json for Vercel builds
- [x] Vercel deployment (two projects — marketing + app)
- [x] Git repo on GitHub (Master8Caps/micro-machine)

### Database & Auth
- [x] Supabase project setup
- [x] Database schema — 11 tables: profiles, products, generations, avatars, campaigns, content_pieces, links, clicks, customers, subscriptions, waitlist
- [x] RLS policies on all tables (users access own data only)
- [x] Fix: Missing update policy on generations table (migration 00003)
- [x] Supabase Auth (email/password signup + login)
- [x] Protected routes via middleware (session refresh + route protection)
- [x] User roles system (admin, free, paid) — migration 00002
- [x] Content workstreams separation — migration 00004 (has_website, wants_ads, campaign categories, expanded content types)

### Marketing Site
- [x] 7-section conversion page (hero, problem, value, how-it-works, proof, CTA, footer)
- [x] Space Grotesk + Inter font setup
- [x] Dark-mode-first styling
- [x] Waitlist modal (button trigger, portal rendering, escape/backdrop dismiss)
- [x] Waitlist API endpoint + table
- [x] Blue-outlined glow cards with cursor-following radial gradient
- [x] Equal-height card grids
- [x] Blue gradient accent numbers

### App — Dashboard & Navigation
- [x] Dashboard layout with sidebar nav (route group `(dashboard)`)
- [x] SidebarNav client component with active state highlighting
- [x] Dashboard page with product count, campaign count, content count stats
- [x] Product list with StatusPill (green active, amber draft, gray archived)
- [x] Campaigns page (placeholder → real data)
- [x] Content page (placeholder → real data)
- [x] Analytics page (placeholder — "coming soon")

### App — Product Intake
- [x] 4-step intake form: product basics, goals, channels, extras
- [x] Step 4: "Do you have a website?" toggle + URL input
- [x] Step 4: "Do you want to run paid ads?" toggle + platform multi-select (Meta, Google, TikTok, LinkedIn Ads)
- [x] "Paid Ads" removed from social channels list (7 organic channels remain)

### App — Marketing Brain Generation
- [x] Anthropic Claude Sonnet 4 integration (real, not mocked)
- [x] Structured JSON output — avatars, social campaigns, ad campaigns (conditional), website kit (conditional)
- [x] Avatars saved to DB with ICPs, pain points, channels
- [x] Social campaigns saved with category='social'
- [x] Ad campaigns saved with category='ad' (retargeting + cold traffic angles)
- [x] Website kit saved as content_pieces (landing page copy, 3 welcome emails, meta description, 3 taglines)
- [x] Brain results page with regenerate functionality
- [x] Fix: Brain page reloads data from DB after first-time generation

### App — Brain Page UI
- [x] Three distinct sections: Target Avatars, Social Campaigns, Ad Campaigns, Website Kit
- [x] Ad Campaigns and Website Kit sections conditionally shown based on product settings
- [x] Colored channel pills (LinkedIn blue, X gray, Reddit orange, etc.)
- [x] TypePill with distinct indigo styling (Text Post, Image Post, Thread, Video Hook, etc.)
- [x] Sorted channels A-Z
- [x] Active/Archived status pill + archive/reactivate toggle (admin only)
- [x] Regenerate brain button (admin only)

### App — Content Generation
- [x] Per-campaign content generation (2-3 pieces per campaign via Claude)
- [x] Bulk "Generate All" for social and ad campaigns separately
- [x] Content-type-specific prompts (LinkedIn posts, tweets, threads, video hooks, scripts, image prompts, landing pages, emails, ad copy)
- [x] Inline content preview on brain page (expandable)
- [x] Copy-to-clipboard with "Copied!" feedback

### App — Campaigns Page
- [x] Social / Ads tab bar (Ads tab shown only when ad campaigns exist)
- [x] Product and channel/platform filter dropdowns
- [x] Campaign count display
- [x] Slide-over panel on click (instead of navigating to brain page)
- [x] Panel shows: campaign details, generate/regenerate button (admin), content pieces (compact, click-to-expand)

### App — Content Page
- [x] Category filter: All / Social / Ads / Website
- [x] Product filter dropdown
- [x] Type filter dropdown (all content types including website kit types)
- [x] Status filter dropdown
- [x] Content count display
- [x] Product name prominent on each card
- [x] Campaign angle as subtitle
- [x] Expandable body preview (line-clamp-3)
- [x] Copy-to-clipboard on each piece

### App — Role-Based Access
- [x] `getUserWithRole()` in server/auth.ts
- [x] UserContext React context providing `{ email, role }` to all client components
- [x] Dashboard layout wraps children in UserProvider
- [x] Generate/regenerate buttons: admin only (brain page, campaign panel)
- [x] Archive/reactivate, regenerate brain: admin only
- [x] Status dropdown (StatusSelect): available to all users
- [x] Non-admin users see "Generated" badge instead of regenerate buttons

### App — UI Components
- [x] `ChannelPill` — platform-colored (LinkedIn, X, Reddit, Product Hunt, Indie Hackers, Email, Blog, Meta, Google, TikTok, LinkedIn Ads)
- [x] `TypePill` — indigo tint, format-specific labels (Text Post, Thread, Video Hook, Image Post, Landing Page, Email Sequence, Meta Description, Tagline, etc.)
- [x] `StatusPill` — active/published (emerald), draft (amber), archived (zinc), ready (blue)
- [x] `StatusSelect` — colored dropdown that looks like a pill but is selectable
- [x] `CopyButton` — clipboard icon with green checkmark feedback
- [x] `GlowCard` — cursor-following radial gradient glow (marketing site)

---

## Things to Test Now

1. **New product with website + ads** — Create a product, enable website and ads on step 4, generate brain. Verify:
   - Social campaigns section populates with varied content types
   - Ad campaigns section populates with retargeting + cold traffic angles
   - Website kit section populates (landing page, emails, meta desc, taglines)
   - All three sections load immediately (not empty on first generation)
2. **New product WITHOUT website/ads** — Create a product with only social channels. Verify:
   - Only social campaigns section shows
   - Ad campaigns and website kit sections are hidden
3. **Content generation** — Click "Generate Content" on a social campaign, verify 2-3 pieces appear with copy buttons
4. **Bulk generation** — Click "Generate All Social Content", verify all campaigns get content
5. **Campaigns page** — Verify Social/Ads tabs work, filters scope correctly, slide-over panel opens
6. **Content page** — Verify category filter (Social/Ads/Website), product filter, type filter all work
7. **Role gating** — As admin, verify generate/regenerate buttons show. Change role to 'free' in Supabase → verify buttons hidden, "Generated" badges shown instead
8. **Existing products** — Verify old products still work (social campaigns display, no errors from missing category column)

---

## What's Next

### Immediate (High Priority)
- [ ] Stripe integration — billing, subscription plans, webhook handler
- [ ] Usage limits by role (free: X products/generations, paid: unlimited)
- [ ] Analytics page — click tracking dashboard (currently placeholder)

### Short Term
- [ ] Connect redirect endpoint to database (replace console logging with real click tracking)
- [ ] Link generation with automatic UTMs per content piece
- [ ] Content calendar view (weekly view of what to post and where)
- [ ] "Mark as posted" tracking on content pieces
- [ ] Performance scoring model (by avatar, angle, channel)
- [ ] Weekly performance summary / digest

### Medium Term
- [ ] Self-learning algorithm — feed winning patterns back into content generation
- [ ] Regeneration logic based on top-performing content
- [ ] pgvector embeddings for semantic content similarity
- [ ] Assisted posting workflow (copy + reminders)
- [ ] Weekly digest emails (Resend/Postmark integration)

### Polish / UX
- [ ] Dashboard: filter to show/hide archived products
- [ ] Brain page: edit avatars inline (refine pain points, channels)
- [ ] Content page: bulk status change (select multiple → mark as published)
- [ ] Website kit: structured editing (edit headline, benefits individually instead of raw text)
- [ ] Onboarding flow for new users (guided product creation)
- [ ] Mobile responsive improvements

---

## Database Migrations

| # | File | Description | Status |
|---|---|---|---|
| 00001 | `00001_initial_schema.sql` | Core schema — 10 tables | Applied |
| 00002 | `00002_add_roles_and_waitlist.sql` | User roles + waitlist table | Applied |
| 00003 | `00003_add_generations_update_policy.sql` | Fix: RLS update policy on generations | Applied |
| 00004 | `00004_content_workstreams.sql` | Content workstreams — has_website, wants_ads, campaign categories, expanded content types | Applied |

---

## Key Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-02-10 | Project name: Micro Machine | Working name locked |
| 2026-02-10 | Monorepo with pnpm + Turborepo | Single repo, two Vercel deployments, shared packages |
| 2026-02-10 | Next.js 15 App Router for both apps | Unified stack, server components, API routes |
| 2026-02-10 | Tailwind dark-mode-first | Matches product aesthetic, simpler than toggle |
| 2026-02-10 | Space Grotesk + Inter fonts | Confident headings, clean body text |
| 2026-02-10 | Supabase for DB + Auth | Postgres + Auth + Storage in one service |
| 2026-02-10 | Anthropic as primary LLM, OpenAI for embeddings | Best generation quality + best embedding ecosystem |
| 2026-02-10 | Marketing site = waitlist, App = auth | Marketing captures interest, app handles login/signup |
| 2026-02-10 | User roles: admin / free / paid | Build with roles from the start, only admins use initially |
| 2026-02-10 | Waitlist modal via createPortal | CSS transform on ancestor breaks fixed positioning |
| 2026-02-10 | X/Twitter pill = neutral gray | Blue looked too similar to LinkedIn |
| 2026-02-10 | Content workstreams separation | Social posts (daily), ads (separate strategy), website copy (one-time) are fundamentally different |
| 2026-02-10 | Paid Ads removed from channels → own toggle | Ads are a separate paid strategy, not an organic channel |
| 2026-02-10 | Email stays as social channel | Newsletters/outreach are ongoing; email sequences are website kit deliverables |
| 2026-02-10 | Ad strategy: retargeting + cold traffic | Reuse best social angles for retargeting, dedicated angles for cold traffic |
| 2026-02-10 | Website kit: full kit | Landing page, 3 welcome emails, meta description, 3 taglines |
| 2026-02-10 | Archive only, no delete | CASCADE deletes would destroy all generated content permanently |
| 2026-02-10 | Status management available to all users | Changing content status (draft/ready/published) is not admin-only |
