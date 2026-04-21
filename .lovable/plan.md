

## Plan: Embed Clips Admin Views

Add two authenticated admin views so embed widget owners can monitor and inspect clips submitted through any of their embeds.

### Routes

- `/embeds-clips` — list of all embed-submitted clips
- `/embeds-clips/:id` — detail view for a single embed clip

### View 1 — Embed clips list (`/embeds-clips`)

Standard `AppLayout` + `Section`, mirroring the existing `/clips` Dashboard.

**Header**
- Title: "Embed clips"
- Subtitle: "Clips submitted through your embed widgets."

**Filter bar**
- **Embed filter**: `Select` dropdown — "All embeds" plus one entry per partner (`name · domain`).
- **Status filter**: All / Ready / Processing / Queued / Failed.
- **Search**: input filtering by submitter email or filename.

**Table (desktop) / cards (mobile)**

Columns: `Submitter email · Embed (domain) · Submitted · Status · Outputs · →`

Whole row clickable → `/embeds-clips/:id`. Infinite scroll via IntersectionObserver, same pattern as Dashboard. Empty state: "No clips submitted yet through your embeds."

### View 2 — Embed clip detail (`/embeds-clips/:id`)

Read-only inspection page (admin is not the skier, so leaner than `/clips/:id`).

**Header**
- Back link → "All embed clips"
- Filename + status badge
- Meta line: `Submitted by {email} · via {embed name} ({domain}) · {relative time}`
- Actions: `Open public results link` (opens `/embed/results/:token` in new tab), `Copy public link`

**Body sections**
1. **Submission details** — submitter email, embed slug + domain, submitted-at, original clip length, trimmed range, file size/type.
2. **Replay outputs** — grid using existing `OutputCard` / `ReplayViewer` so the admin can play any of the three outputs inline.
3. **Summary metrics** — Edge Similarity overall, turns analyzed, turn cadence as compact read-only chips.
4. **Processing log** (collapsible) — `ProcessingStepper` showing stage progress / failure point.

For `processing` / `pending`: show `ProcessingStepper` instead of outputs. For `error`: destructive alert with failure reason and a (mock) retry button.

### Service / data layer

New `src/services/embed-clips.service.ts` (mock, `TODO_BACKEND_HOOKUP`):
- `listEmbedClips({ partnerSlug?, status?, search?, offset, limit })` → `{ data: EmbedClip[], hasMore }`
- `getEmbedClip(id)` → `EmbedClip | null`

New `EmbedClip` type in `src/lib/types.ts`:

```text
EmbedClip {
  id, partnerSlug, partnerName, partnerDomain,
  submitterEmail, filename, submittedAt,
  status, clipLength, trimStart, trimEnd,
  fileSize, fileType,
  result?: AnalysisResult
}
```

Mock data: ~25 entries spread across the 2 mock partners, mixed statuses and dates — enough to exercise filters and pagination.

### Routing & nav wiring

- Register `/embeds-clips` and `/embeds-clips/:id` in `src/App.tsx`.
- In `IntegrationsTab.tsx`: add a "View clips" link on each partner row + a "View all embed clips" button at the top of the tab.
- Auth gate stays as `TODO_BACKEND_HOOKUP`.

### Files

**New**
- `src/pages/EmbedClipsList.tsx`
- `src/pages/EmbedClipDetail.tsx`
- `src/services/embed-clips.service.ts`

**Edited**
- `src/lib/types.ts`
- `src/services/mock-data.ts`
- `src/App.tsx`
- `src/components/settings/IntegrationsTab.tsx`

### Out of scope

Real backend wiring, bulk actions, per-embed analytics charts, admin role enforcement.

