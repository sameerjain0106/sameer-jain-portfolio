# Sameer Jain — Portfolio

Next.js 14 (App Router) + TypeScript + Tailwind CSS portfolio, built to
showcase ML/quant research projects with real methodology, results, and
visualizations — no invented metrics.

---

## 1. Run it locally

Requires Node.js 18.18+ (Node 20 LTS recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000. Before deploying, run `npm run build` locally.
Google Fonts require an internet connection during a clean build, which your
machine and Vercel's build servers normally have.

---

## 2. What to edit

Most personal/profile content is centralized in **`data/site.ts`**.
That file now contains the homepage profile, links, stats, skills, and
academic details:

| What | File | Field |
|---|---|---|
| GitHub URL | `data/site.ts` | `links.github` |
| LinkedIn URL | `data/site.ts` | `links.linkedin` |
| Resume | `data/site.ts` | `links.resume` (the supplied PDF is already at `public/resume.pdf`) |
| Email | `data/site.ts` | `links.email` |
| Education details (GPA, coursework, honors) | `data/site.ts` | `education` array |
| Project GitHub URL | `data/projects.ts` | `githubUrl` field on the project object |
| Collaborator names | `data/projects.ts` | `collaborators` array — I inferred "Sami" and "Diya Mannacherry" from file paths in your uploaded notebooks; confirm spelling/preferred credit |
| Deployed domain (for SEO) | `app/robots.ts` and `app/sitemap.ts` | `BASE_URL` / `sitemap` |

To add a **new project**, add another object to the `projects` array in
`data/projects.ts` — the homepage grid, filtering, and
`/projects/[slug]` page all pick it up automatically. No other file
needs to change.

---

## 3. Included portfolio assets

- `public/resume.pdf` — the supplied resume, wired to every Resume link
- Brain Tumor MRI project charts and result images
- Animated ML feature-flow visualization in the homepage hero

**Project-results update:** the K-Means clustering and anomaly detection results are no
longer placeholders — both were rerun against the real dataset with the
underlying bugs fixed (a variable-collision bug that had silently
destroyed the clustering evaluation's ground-truth labels, and a
train/test leak in the anomaly detector). Real results are now live on
the site:
- Clustering: **ARI = 1.0, purity = 1.0 (603/603)** — a formally
  confirmed perfect separation, not just a visual/manual check.
- Anomaly detection: **50% accuracy** on a proper held-out split — a
  real, honestly-reported result that's meaningfully weaker than the
  original (leaky) evaluation would have shown.

See the separate `Brain_Cancer_finalized` package for the full notebooks,
scripts, and analysis behind these numbers, including a README explaining
every change made and why.

---

## 4. Deploying to Vercel

1. Push this repository to GitHub (see below).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Next.js — no config changes needed. Click **Deploy**.
4. Every push to `main` auto-deploys.

### Pushing to GitHub for the first time

```bash
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

---

## 5. Dependencies

Production: `next`, `react`, `react-dom`, `recharts` (for the results
bar chart).
Dev: `typescript`, `tailwindcss`, `autoprefixer`, `postcss`, ESLint +
Next.js config, and type definitions. Nothing beyond what's needed —
no UI kit, no animation library beyond native CSS/canvas.

---

## 6. Project structure

```
app/
  layout.tsx          Root layout — fonts, metadata, Navbar/Footer shell
  globals.css          Base styles, focus rings, grid background, reduced-motion handling
  page.tsx              Homepage (Hero, Selected Work, combined Profile section)
  not-found.tsx         Custom 404
  robots.ts / sitemap.ts  SEO metadata routes
  projects/
    page.tsx             Full project index with filtering
    [slug]/page.tsx       Reusable project detail template

components/
  Navbar.tsx, Footer.tsx
  Hero.tsx                          Wide 16:9 hero with text, CTAs, stats, and ML visual
  MLVisualization.tsx               Animated SVG/CSS feature-flow / inference visual
  ProfileSection.tsx                Side-by-side technical profile + academic background
  PageBackground.tsx                Fixed, full-page, scroll-persistent market-chart animation (mounted once in app/layout.tsx)
  ProjectCard.tsx, ProjectExplorer.tsx   Project grid + category filter
  ApproachTabs.tsx                 Tab switcher between a project's methodological approaches
  MethodologyPipeline.tsx          Expandable pipeline steps (used for anomaly detection)
  ResultsChart.tsx                 Recharts bar chart for model comparison
  ImageGallery.tsx                 Captioned image grid for visualizations
  StatusBadge.tsx                  "Results available" / "methodology only" indicator
  TechnicalMetric.tsx, TechPill.tsx, SectionHeading.tsx   Small reusable UI primitives

data/
  site.ts        Profile info, links, stats, skills, and education
  projects.ts     All project content — single source of truth

lib/
  types.ts        Shared TypeScript types for site/project data

public/
  favicon.svg
  resume.pdf
  projects/brain-tumor-mri/
    images/       Real chart/confusion-matrix images extracted from your notebooks
    results/metrics.json   Raw metrics for reference/reproducibility
```

---

## 7. Design notes

- Dark-first, near-black base (`#0A0C10`) with a signal-cyan accent
  (`#4DD8C4`) and a secondary muted amber (`#D9A45B`) used sparingly for
  in-progress/caveat states.
- Type system: Space Grotesk (display), IBM Plex Sans (body), IBM Plex
  Mono (labels, data, metrics).
- The background animation (`PageBackground.tsx`) is mounted once in the
  root layout, not scoped to the hero — it's `position: fixed`, so it
  stays in place and covers the full viewport as you scroll through every
  page. It draws three layered, smoothly-curved market-chart-style lines
  (with a soft area fill beneath each, like a real price chart) at
  different heights and scroll speeds, plus sparse glowing markers at
  local peaks/troughs. Section backgrounds were made transparent (only
  borders remain) so the animation shows through between content blocks;
  cards and panels stay opaque for readability. Respects
  `prefers-reduced-motion`.
- The homepage is intentionally wider (`site-shell`, up to 1680px) so it
  fills 16:9 displays without leaving large dead margins. Technical profile
  and academic background share one two-column section, while contact is a
  single compact footer row.
- The hero's ML visual is a real animation (moving feature packet, flowing
  edges, pulsing nodes, cycling synthetic readout), built with SVG/CSS plus a
  tiny React timer rather than a heavy animation library. It respects
  `prefers-reduced-motion`.
- Numbered pipeline steps are only used for the anomaly detection section,
  where the stages are a real, ordered pipeline — not as a decorative device
  elsewhere on the site.
