# Motion Replay Beta — UI Content Swap Plan

## Summary

Reframe Poser from a scoring/coaching app to a "Motion Replay Beta" product. This is a content/copy swap across 3 existing pages (Landing, Dashboard, Results) plus updates to mock data, types, and shared components. No new routes or layouts needed.

## Technical approach

### 1. Update types and mock data

`**src/lib/types.ts**` — Add replay output types:

```ts
export type ReplayOutputType = "follow_cam" | "follow_cam_skeleton" | "original_skeleton";

export interface ReplayOutput {
  type: ReplayOutputType;
  label: string;
  description: string;
  url?: string;       // video or model URL
  available: boolean;
}
```

Add `replayOutputs?: ReplayOutput[]` and `filename?: string` to `AnalysisResult`.

`**src/services/mock-data.ts**` — Add mock replay outputs to each complete result. Add filenames. Remove `skiRank` and `biggestLimiter` from mock data (set to undefined) so no fake scores appear.

### 2. Landing page (`src/pages/Landing.tsx`)

- **Hero**: Change headline to "See your skiing from new angles." Update subheadline and helper text per spec. Replace CTA labels to "Try demo replay" / "Upload my clip".
- **Hero media**: Replace stock photo with a card showing 4 output pills (Follow Cam, Follow Cam + Skeleton, Original + Skeleton, 3D Model) and a mock preview area using the existing `ModelViewer` compact mode and placeholder video thumbnails.
- **Upload section**: Update heading to "Try Poser Motion Replay in under a minute", tab labels to "Try demo replay" / "Use my clip", demo card copy updated.
- **How it works**: Rewrite 3 steps per spec. Add a "Coming soon" strip below with muted chips for SkiRank, Per-turn analysis, Balance, Pressure, Edging, Steering.
- **Feedback section**: Replace coaching-oriented cards with replay-oriented ones (Follow Cam replay, Skeleton overlay, 3D body model).
- **Use cases section**: Keep structure, update copy to replay-oriented messaging.
- **Bottom CTA**: Update to replay language.

### 3. Dashboard (`src/pages/Dashboard.tsx`)

- **Title area**: Change "Dashboard" to "Your Replays" with a "Motion Replay Beta" badge.
- **Table columns**: Replace SkiRank/Insight columns with Clip (filename), Status (badge: Processing/Ready/Failed), Outputs (chips: Replay, Skeleton, 3D).
- **Mobile cards**: Same content swap — show filename, status badge, output chips.
- **Empty state**: "Upload a clip to generate your first replay."
- **Remove**: All `skiRank`, `biggestLimiter`, limiter labels references.

### 4. Recent clips sidebar (`src/components/layout/RecentAnalysesList.tsx`)

- Show filename instead of score. Add small output indicator chips. Remove `edgeSimilarity` display.

### 5. Results page (`src/pages/Results.tsx`)

- **Header** (`ResultsHeader.tsx`): Show filename, add "Motion Replay Beta" badge. Add slim info banner: "You're viewing Poser's visual replay outputs. SkiRank, per-turn scoring, and technique feedback are coming soon."
- **Complete state**: Replace entire score-based layout with:
  - **Large media viewer card** with segmented tab control (Follow Cam / Follow Cam + Skeleton / Original + Skeleton / 3D Model). Only show tabs for available outputs. Default to most compelling. Use video element for video outputs, `ModelViewer` for 3D.
  - **Output cards grid** below viewer (reuse card grid pattern from theme cards). Each card: title, description, thumbnail/icon, "Open" button, "Download" if applicable. Selected card highlighted.
- **Side nav** (`ThemeNav.tsx`): Replace Balance/Pressure/Edging/Steering with Overview, Outputs, 3D Model, Coming Soon.
- **Mobile pills** (`ThemePills.tsx`): Same replacement.
- **"What you're seeing" section**: Replaces "What stood out" — explains the replay outputs.
- **"Coming soon" section**: Compact muted chips for SkiRank, Per-turn breakdown, Balance, Pressure, Edging, Steering.
- **Bottom actions**: Keep Delete, rename Support to "Give feedback". Add "Notify me when SkiRank beta launches" CTA.
- **Remove**: `OverviewSection`, `ThemeDetail`, `SubmetricDetail` imports (no longer rendered). Remove all score/theme navigation logic.

### 6. Processing states (`src/pages/Results.tsx`)

- Replace generic "Analyzing clip..." with a stepper showing: Uploading clip → Tracking skier → Estimating pose → Rendering replay → Preparing 3D model. Use a small vertical stepper or progress card.

### 7. Files to create

- `src/components/results/ReplayViewer.tsx` — Main tabbed media viewer for replay outputs
- `src/components/results/OutputCard.tsx` — Individual output card (title, description, icon, actions)
- `src/components/results/ComingSoonStrip.tsx` — Reusable compact "coming soon" chip strip
- `src/components/results/ProcessingStepper.tsx` — Pipeline step visualization

### 8. Files to modify

- `src/lib/types.ts` — Add replay types
- `src/services/mock-data.ts` — Add replay outputs, filenames, remove scores
- `src/pages/Landing.tsx` — Full copy rewrite
- `src/pages/Dashboard.tsx` — Column/card swap
- `src/pages/Results.tsx` — Complete state rewrite
- `src/components/results/ResultsHeader.tsx` — Add badge, banner, filename
- `src/components/results/ThemeNav.tsx` — Replace nav items
- `src/components/results/ThemePills.tsx` — Replace pills
- `src/components/layout/RecentAnalysesList.tsx` — Remove scores, add outputs

### 9. Files NOT modified

- Layout system, sidebar, footer, header, auth, upload flow, settings, pricing — all stay as-is.
- `OverviewSection.tsx`, `ThemeDetail.tsx`, `SubmetricDetail.tsx` — kept in codebase but no longer imported on Results page.