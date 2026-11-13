# Vantage — B2B Enterprise Data Visualization Dashboard

A UI/UX design case study delivered as a working product: a data-dense enterprise analytics report redesigned into a customizable, visual dashboard — with the research tooling, A/B-tested filter panel and Storybook-driven design system that shipped it.

> **The three outcomes this project demonstrates**
>
> | Outcome | How it is shown in this build |
> | --- | --- |
> | **−30% task execution time** — legacy tables → visual charts and customizable widgets | `Legacy view` (the 2023 report, annotated) vs `Overview` (10 drag-to-reorder, resizable, hide/show widgets with table-view twins); timed task results on the `Case study` page |
> | **−25% design QA bug tickets** — Storybook integration, pixel-perfect HTML5/CSS3 builds | `npm run storybook`: every component with controls, a11y panel and light/dark; one token file shared by product and stories; **UX Lab → Inspect mode** overlays the 8pt grid and labels each component |
> | **+22% daily feature adoption** — A/B usability testing and heat-map analysis of the filter panel | **UX Lab** switches between filter variant **A** (legacy modal) and **B** (inline panel) and renders a **click heat map** for each; results, charts and metrics on the `Case study` page |

---

## Quick start

```bash
npm install
npm run dev          # product  → http://localhost:5173
npm run storybook    # design system → http://localhost:6006
```

Other scripts: `npm run build` (type-check + production build to `dist/`), `npm run preview`, `npm run typecheck`, `npm run build-storybook`.

Requires Node 18+. Tested with Node 22, Vite 7, React 19, TypeScript 5.9, Storybook 10.

---

## What to look at (5-minute tour)

1. **Overview** — the redesigned dashboard.
   - Change the date range or a dimension filter: every widget re-renders against the same slice.
   - Hover any chart: a crosshair/tooltip lists every series. Tab to a chart and use ← → to read values by keyboard.
   - Click the **table icon** in a widget header: every chart has a table twin.
   - Drag a widget by its handle (appears on hover) or use **⋯ → Move / Size / Hide**. Open **Customize** to show, hide, resize and reorder everything, and choose which KPIs lead. Layout persists on the device.
2. **UX Lab** (top right)
   - **Filter panel variant** A ↔ B — the two arms of the A/B test, both fully functional.
   - **Click heat map** — a density overlay reconstructed per variant; watch the hot spot move from a dead-end “Filters…” button to the date presets and chips.
   - **Inspect mode** — the 8pt grid and labelled component outlines used in design QA with engineering.
   - Density and theme (light / dark / system).
3. **Accounts** — the data table done right: sticky column, inline sparklines, status badges with icons, seat-utilization bars, column visibility, density, sorting with `aria-sort`, bulk selection and CSV export of exactly what is on screen.
4. **Legacy view** — the 2023 report kept for comparison, with research annotations you can toggle.
5. **Case study** — problem, research, principles, the three solutions, A/B results, handoff process and measured results.
6. **Storybook** — Foundations (tokens, chart guidelines), primitives, inputs, overlays, charts, widgets, filter variants and full-page patterns.

---

## Design system

**Tokens** live in [`src/styles/tokens.css`](src/styles/tokens.css) and are the only place colour, type, spacing, radius, elevation and motion are defined. Light values sit on `:root`; dark mode is a *selected* set of steps on `[data-theme="dark"]` — validated against the dark surface, not an automatic inversion.

**Colour has four jobs** (see *Foundations → Chart guidelines* in Storybook):

- **Categorical** `--series-1…8` — fixed order, never cycled, validated for colour-vision deficiency in both themes (adjacent-pair ΔE ≥ 8).
- **Sequential** `--seq-100…700` — one hue, light → dark (heatmap, ordinal stages).
- **Diverging** `--div-neg` ↔ `--div-pos` — blue/red with a neutral midpoint (net ARR movement).
- **Status** `good / warning / serious / critical` — reserved, never a series, always paired with an icon and label.

**Chart primitives** ([`src/components/charts`](src/components/charts)) are hand-built SVG/HTML on top of `d3-scale`/`d3-shape`, so the mark specs are code, not convention: 2px lines, ≤24px bars rounded only at the data end, 2px surface gaps between touching marks, 2px surface rings on markers, solid hairline grids, selective direct labels, a crosshair tooltip that reads every series, keyboard navigation with a live region, and a `ChartTable` twin for every chart.

**Accessibility**: focus-visible rings everywhere, roving tab index in segmented controls/tabs/menus, focus trap and Escape in drawers/modals/popovers, `aria-sort` on table headers, status never colour-alone, reduced-motion support, skip link, and dark mode that meets 3:1 on every mark.

---

## Project structure

```
src/
  styles/        tokens.css · base.css           design tokens & global styles
  lib/           format · dates · random · hooks  utilities (seeded RNG, number/date formatting)
  data/          types · generate · queries       120 accounts / 150 opportunities, every widget query, filters & ranges
                 caseStudy.ts                     research & outcome figures, heat-map hotspots
  state/         Preferences · Filters · Layout · Lab   providers (persisted to localStorage)
  components/
    ui/          Button, IconButton, Tooltip, Popover, Menu, Select/MultiSelect, DateRangePicker,
                 Chip, Badge/HealthBadge, Card, Switch, SegmentedControl, Tabs, Drawer, Modal,
                 Avatar, EmptyState, Kbd, Toast, Checkbox, DataTable
    charts/      LineChart, BarChart, HBarChart, Heatmap, SegmentedBar, Meter, Sparkline, Dumbbell,
                 ChartTooltip, Legend, ChartTable
    widgets/     StatTile, WidgetFrame, WidgetGrid (dnd-kit), CustomizeDrawer, registry + 10 widgets
    filters/     FilterBar (variant B) · LegacyFilterBar (variant A)
    layout/      AppShell, Sidebar, Topbar, UxLabMenu, HeatmapOverlay, PageHeader
  pages/         DashboardPage · AccountsPage · LegacyPage · CaseStudyPage
  stories/       Storybook stories + MDX (Introduction, Design tokens, Chart guidelines)
.storybook/      Storybook 10 config (react-vite, docs, a11y, themes)
```

---

## Decisions worth knowing

- **Deterministic data.** Everything derives from a seeded generator frozen at *Nov 12, 2026*, so screenshots, stories and numbers are reproducible. ARR is modelled as contract events (new / expansion / contraction / churn), so trends, movements and retention all reconcile.
- **One filter row scopes everything.** Filters live in context; widgets are pure functions of that slice. The pipeline widget is the one deliberate snapshot (open deals as of today) and says so in its subtitle.
- **Drag-and-drop without layout shift.** Widgets vary in span, so reordering uses draggable + droppable targets with a drop highlight rather than animated sortable transforms. Keyboard users reorder via the widget menu or the Customize drawer.
- **The legacy variant is real.** Variant A is not a mock-up: it is a working modal with single-select dropdowns and an Apply step, so the A/B comparison and the heat map are testable in the same build.
- **Synthetic figures, honest framing.** Accounts, sessions and research numbers are illustrative and shaped to match the reported outcomes; the case study says so.

---

## Tech

React 19 · TypeScript 5.9 · Vite 7 · CSS Modules + custom properties · d3-scale / d3-shape · @dnd-kit · @floating-ui · lucide-react · Inter Variable (self-hosted) · Storybook 10 (react-vite, addon-docs, addon-a11y, addon-themes).

No UI framework and no charting library: the components and charts are the portfolio piece.

## Personal workspace flows

- **My work** (`/work`) prioritizes account health, upcoming renewals, followed accounts and personal follow-ups. These signals cover the full illustrative portfolio as of November 12, 2026.
- Open an account to review its charts, follow it, save a private note or create a dated follow-up. Complete and reopen follow-ups from My work.
- Recent account tabs are limited to eight and can be closed. The account directory preserves search, status, sort and pagination in its URL; account detail tabs and revenue ranges are also addressable.
- Bulk owner assignment updates the directory, account details and quick search. Ctrl/Cmd+K opens account search; arrow keys select a result and Enter opens it.
- Workspace changes persist in this browser's localStorage. They are not shared across users, synchronized with a CRM or sent as notifications. Storage failures display a session-only warning.

Validation: `npm run build` and `npm run test:e2e`. Browser tests use an installed Microsoft Edge via Playwright and cover directory return context, owner assignment, notes/follow-up persistence, completion/reopening, search, recent tabs, compact icon alignment and mobile navigation. Screenshots and failure traces are written to the ignored `test-results/` directory.
