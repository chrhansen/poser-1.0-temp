

# Mobile Top Bar for Authenticated Pages

## Problem
The floating hamburger button (`fixed left-3 top-3`) overlays page content as the user scrolls, blocking text and interactive elements on mobile.

## Solution
Replace the floating hamburger button with a proper top navigation bar on mobile (`< 1024px`) in authenticated pages. This bar scrolls with the page content (not sticky), so it naturally disappears as the user scrolls down, giving full screen real estate.

## Changes

### 1. `src/components/layout/AppSidebar.tsx`
- **Remove** the `MobileMenuButton` floating button component (or keep it but stop using it).
- **Add** a new `MobileTopBar` component: a simple non-sticky bar with the hamburger icon on the left, the poser logo centered (or left-aligned next to the burger), and optionally a small action on the right.
- In the mobile branch of `AppSidebar`, instead of rendering `<MobileMenuButton />` (which is `fixed`), export/expose the mobile open state so the parent layout can render the top bar.

### 2. `src/components/layout/Layout.tsx`
- Update `AppLayout` to render the `MobileTopBar` above the main content area on mobile, inside the normal document flow (no `fixed`/`sticky` positioning), so it scrolls away.
- Structure on mobile becomes: `flex flex-col` → `MobileTopBar` → `main content`, rather than the current `flex` row with a fixed button.

### Specific implementation
- `AppLayout` renders a `<div className="flex min-h-screen">` with sidebar (desktop) + a vertical column for mobile top bar + main content.
- The mobile top bar: `<div className="flex items-center h-12 px-3 border-b lg:hidden">` containing the hamburger button and logo. No `fixed`, no `sticky` — just normal flow.
- Desktop behavior is completely unchanged (sidebar stays as-is).
- The Sheet overlay for the mobile slide-out menu remains the same.

### Files touched
- `src/components/layout/AppSidebar.tsx` — extract mobile top bar, remove fixed floating button usage
- `src/components/layout/Layout.tsx` — integrate mobile top bar into AppLayout flow

