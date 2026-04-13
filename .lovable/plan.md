

## Plan: Email Template Preview Page

### What
Create a dev-only preview page at `/dev/email-previews` that renders three key end-user email templates inline using `dangerouslySetInnerHTML`, with placeholder values filled in. This mirrors the existing `/dev/embed-widget` pattern.

### Templates to preview
1. **auth_verification_code** — the OTP code email
2. **direct_clip_finished_user** — "Your clip is ready" with CTA button
3. **embed_clip_confirmation** — "Confirm your clip" with CTA button

These cover the three main layout types users will see: code display, action button, and confirmation flow.

### Implementation

**Create `src/pages/EmailTemplatePreview.tsx`**
- A simple React page with a gray background
- Contains three sections, each rendering one email template as raw HTML via `dangerouslySetInnerHTML`
- Template HTML is stored as string constants with `{variable}` placeholders replaced with sample values (e.g., `{code}` → `847291`, `{clip_id}` → `clip_abc123`)
- Each section has a small label above it identifying the template

**Update `src/App.tsx`**
- Add route: `/dev/email-previews` → `<EmailTemplatePreview />`
- Lazy import, same pattern as `EmbedWidgetPreview`

### Technical notes
- The HTML strings will be extracted from the existing `poser-emails.html` file — templates #1, #5, and #10
- No new dependencies needed
- Preview-only; not linked in navigation

