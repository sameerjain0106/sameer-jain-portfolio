# Sameer Jain — Portfolio

A Next.js 15.5.29 App Router portfolio with React 19, TypeScript, and
Tailwind CSS. The homepage is a spatial portfolio with five rooms:

| Room | Direct link |
|---|---|
| Entrance | `/` |
| Brain Tumor MRI | `/?room=mri` |
| ETF Return Prediction | `/?room=etf` |
| About Sameer | `/?room=profile` |
| Contact & Links | `/?room=contact` |

Hold the pointer at an available edge to preview the destination and travel,
or click/tap its label. The Map button jumps directly to a room; keyboard
users can open it with **Shift+M**. Each room scrolls vertically. Content
reveals and the MRI research illustration follow scroll position in both
directions. The MRI pipeline illustrates the recorded research process.

Reduced-motion and no-JavaScript modes keep the content readable with static
fallbacks. **Map → Pause idle animations** pauses the ambient motion and
sculptures and remembers the preference. The entrance portrait has its own
visibility and playback handling.

The project index is at `/projects`. Full case studies remain available at
`/projects/brain-tumor-mri-classification` and
`/projects/systematic-etf-research`.

## Local development

Use Node.js 20 or newer and the committed lockfile:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Validate changes with:

```sh
npm run lint
npm run build
```

Fonts are self-hosted in `public/fonts`, with licenses in
`public/fonts/licenses`; builds do not need to fetch Google Fonts.

## Content and sharing

| What to edit | Source |
|---|---|
| Profile, email, social links, education, skills, SEO defaults | `data/site.ts` |
| Room names, colors, layout, and URL helpers | `data/spatialRooms.ts` |
| MRI methodology, results, limitations, and collaborators | `data/projects.ts` |
| ETF case study and figure references | `data/etfResearch.ts` |
| Published ETF research summary and saved signal | `public/projects/systematic-etf-research/data/` |
| Resume download | `public/resume.pdf` |
| Resume source | `resume/resume.tex` |
| Room-specific titles and descriptions | `app/page.tsx` |
| Shared metadata helpers and preview image references | `lib/metadata.ts` |
| Static social preview cards | `public/share/` |

Room URLs receive their own server-rendered title, description, canonical
link, Open Graph image, and Twitter card. The two full case studies use the
matching project preview and their own canonical paths. The entrance and
unrecognized room values canonicalize to `/`. Preview cards are static
1200×630 PNGs made from the existing brand palette, self-hosted fonts, and
published project/portrait assets; they add no runtime image-generation
dependency. The older `public/og.png` is retained.

The metadata base uses `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`,
with `https://musteermain.vercel.app` as the local fallback. If the production
domain changes, also update the explicit domain in `app/robots.ts` and
`app/sitemap.ts`.

Adding a detailed project in `data/projects.ts` makes it available to the
project index and reusable `/projects/[slug]` template. A new spatial room
also needs explicit room content, navigation registration, and metadata;
the homepage is not an automatic project grid.

## Research assets

The MRI case study includes the recorded supervised classification,
clustering, and anomaly detection results, original chart images, and
`public/projects/brain-tumor-mri/results/metrics.json`. Methodological
limitations belong alongside the results; the website does not rerun the
experiments or perform medical inference. The separate
`Brain_Cancer_finalized` research package holds the underlying notebooks
and analysis.

The ETF case study includes the Phase 7 publication figures, compact
canonical result export, and saved paper-signal snapshot. The website reads
these committed exports; it does not update market data, refit a model, or
resolve a pending signal. The case study documents the sealed historical
confirmation, economic comparison, and limitations.

## Implementation map

```text
app/
  layout.tsx                    Fonts, default metadata, shared page frame
  page.tsx                      Spatial homepage and room metadata
  fonts.css / globals.css       Self-hosted fonts and global styles
  projects/page.tsx             Project index
  projects/[slug]/page.tsx      Reusable detailed case study
  projects/systematic-etf-research/page.tsx
  robots.ts / sitemap.ts        Search metadata routes

components/
  SpatialWorld.tsx              Room navigation, map, transitions, history
  SpatialEntrance.tsx           Entrance and project previews
  EntrancePortrait.tsx          Current v6 portrait loop and fallback
  MriScrollJourney.tsx          MRI scroll narrative
  SpatialEtfRoom.tsx            ETF narrative and evidence
  ProfileScrollRoom.tsx         About Sameer
  ContactScrollRoom.tsx         Contact and links
  SiteFrame.tsx                 Spatial/page shell selection
  ApproachTabs.tsx              Detailed MRI approach tabs
  SystematicEtfResearchCaseStudy.tsx

data/
  site.ts / spatialRooms.ts / projects.ts / etfResearch.ts

lib/
  metadata.ts                   Shared social cards and canonical metadata
  types.ts                      Shared research and project types
  useScrollChoreography.ts      Room-local scroll handling
  useAmbientMotion.ts           Ambient-motion preference and activity
  useRoomSmoothScroll.ts        Room-local smooth scrolling

public/
  share/                        Current static social cards
  fonts/                        Self-hosted fonts and licenses
  images/                       Portrait posters and video iterations
  projects/                     Published figures and research exports
  resume.pdf
```

Animation and visualization dependencies include GSAP, Lenis, and Recharts.
Other effects use native CSS, SVG, canvas, and WebGL. The spatial homepage
uses lilac, cobalt, pale yellow, coral, and mint with Bricolage Grotesque
display type and IBM Plex body/label type. The case-study routes retain
their existing page presentation.

## Deployment and recovery

Production: [musteermain.vercel.app](https://musteermain.vercel.app).
The existing Vercel connection deploys pushes to `main`. Review the local
validation results before pushing a production change.

The pre-refinement version is preserved by Git tag
`portfolio-before-refinements-20261117` at commit `6b4f039`. To inspect that
snapshot without changing the current working copy:

```sh
git worktree add ../sameer-jain-portfolio-before-refinements portfolio-before-refinements-20261117
```

Earlier homepage components such as `Hero.tsx`, `ProfileSection.tsx`,
`PageBackground.tsx`, and `MLVisualization.tsx`, along with the v2–v5
portrait media, are archive candidates retained in Git for a later cleanup
decision. They are not the current spatial homepage. This refinement keeps
the historical files and recovery snapshot available; it does not delete
earlier designs or research assets.
