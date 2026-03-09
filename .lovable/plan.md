

# Results Page Redesign — Implementation Plan

## Summary

Replace the current flat metric-list Results page with a 3-level progressive-disclosure coaching UI: Overview → Theme Detail → Submetric Detail, with evidence tabs (Highlights, Turns, 3D, Trace) inside each submetric.

## What changes

### 1. Types update (`src/lib/types.ts`)
- Rename `"rotary"` to `"steering"` in `SkiLimiter`
- Add theme/submetric score interfaces for the new data model:

```text
ThemeScores { balance, pressure, edging, steering } — each with score + summary + submetrics[]
SubmetricScore { name, score, interpretation, whatItIs, whyItMatters, whatYoursLookedLike, whatToTry }
```

- Add these to `AnalysisResult` (optional, with mock fallback)

### 2. Mock data (`src/services/mock-data.ts`, `src/services/mock-metrics.ts`)
- Add mock theme scores and submetric data to `res_1` and `res_5`
- Rename `"rotary"` → `"steering"` in existing mock data
- Add mock "key moments" data (weakest turn, best turn, representative)

### 3. New component files

Split the monolithic Results page into focused components under `src/components/results/`:

| File | Purpose |
|------|---------|
| `ResultsHeader.tsx` | Back button, title, date/clip metadata, SkiRank badge, share/download |
| `OverviewSection.tsx` | SkiRank hero card, "Why" card, "Next focus" card, 4 theme cards, key moments |
| `ThemeDetail.tsx` | Theme summary block + submetric chips/cards |
| `SubmetricDetail.tsx` | What/Why/Yours/Try text blocks + evidence tabs |
| `EvidenceTabs.tsx` | Highlights / Turns / 3D / Trace tab container |
| `HighlightsTab.tsx` | 2-3 evidence cards (weakest, best, representative) |
| `TurnsTab.tsx` | Per-turn bar chart (reuse existing BarChart code) |
| `TraceTab.tsx` | Normalized turn-phase or full-run timeline chart |
| `ThemeNav.tsx` | Desktop sidebar nav (Overview + 4 themes with nested submetrics) |
| `ThemePills.tsx` | Mobile horizontal scrollable pill row |

### 4. Main page rewrite (`src/pages/Results.tsx`)

**State:**
- `activeView`: `"overview" | "balance" | "pressure" | "edging" | "steering"`
- `activeSubmetric`: string | null
- `activeEvidence`: `"highlights" | "turns" | "3d" | "trace"` (default: highlights)
- `selectedTurn`: string | null (syncs across views)

**Layout:**
- Mobile: vertical stack — header → overview/theme content. Horizontal pill row for theme nav, submetric chips below when theme selected.
- Desktop: left sidebar (ThemeNav) + main content area.

**Flow:**
- Default: Overview (SkiRank hero, why card, next focus, 4 theme cards, key moments)
- Tap theme card → sets `activeView`, auto-selects first submetric
- Tap submetric → shows detail with evidence tabs defaulting to Highlights
- Tap key moment / turn bar → sets `selectedTurn`, syncs evidence views

**Keep:** pending/processing/error states, delete/support dialogs, polling logic. Move video player + ModelViewer into 3D evidence tab only.

### 5. Theme/submetric mapping (hardcoded for now)

```text
Balance:    Fore-aft Balance, Center Over Feet, Transition Stability
Pressure:   Early Pressure, Outside Ski Pressure, Pressure Build
Edging:     Early Edging, Edge Match, Peak Edge Angle
Steering:   Counter, Turn Rhythm, Steering Symmetry
```

### 6. Dashboard rename
- Update `src/pages/Dashboard.tsx`: replace `"rotary"` label with `"Steering"` in `limiterLabels`

## What stays the same
- AppLayout shell, sidebar navigation
- Non-complete result states (pending, processing, error)
- Delete/support dialogs
- Recharts for charts
- Existing warm/orange color tokens
- ModelViewer component (moved into 3D evidence tab)

## File count
~12 files modified or created. The current 548-line Results.tsx will be split into ~10 focused components.

