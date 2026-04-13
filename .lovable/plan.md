

## Email Template Design Plan

### Overview
Design a unified HTML/CSS email template system for all 14 Poser emails. Since these will be used in a Ruby on Rails backend (not React), the output will be plain HTML with inline CSS, compatible with all major email clients.

### Template Architecture

**One base layout, four content variations:**

1. **Verification Code** — large centered code display (email #1)
2. **Action Email** — heading + message + green CTA button (emails #3, #5, #6, #10, #11)
3. **Notification** — heading + message + optional metadata table + optional button (emails #4, #7, #8, #9, #12, #13, #14)
4. **Simple Notice** — heading + message, no button (emails #2, #12-failed)

Ops emails use the exact same template as their user-facing counterpart — distinguished only by subject line prefix `[Ops]` and an optional metadata block (user email, clip ID) inserted into the body.

### Brand Styling (matching the Poser app theme)

| Token | Value |
|---|---|
| Primary (buttons, accents) | `#039e6a` (HSL 161 93% 30%) |
| Primary hover | `#028055` |
| Text color | `#171717` (foreground) |
| Muted text | `#666666` |
| Background | `#ffffff` (email body always white) |
| Card/container bg | `#fafafa` |
| Border | `#d4d4d4` |
| Font | `'Work Sans', Arial, Helvetica, sans-serif` |
| Border radius | `8px` (buttons), `12px` (cards) |
| Max width | `520px` |

### Shared Base Structure (all emails)

```text
+------------------------------------------+
|  [Poser Logo]  poser                     |  <- header, left-aligned
+------------------------------------------+
|                                          |
|  [Content area — varies by type]         |
|                                          |
+------------------------------------------+
|  © 2026 Poser · poser.pro               |  <- footer, centered, muted
+------------------------------------------+
```

- Clean, minimal layout — no heavy borders or colored header bars
- Logo rendered as a small inline image (hosted URL) + "poser" wordmark
- Generous vertical padding (40px top/bottom in content area)
- Footer: copyright + link to poser.pro, small muted text

### Content Variations

**1. Verification Code (#1)**
- Heading: "Your verification code"
- Large mono-spaced code in a light gray rounded box: `{code}`
- Subtext: "This code expires in 10 minutes."
- Dismissal: "If you didn't request this, ignore this email."

**2. Action Email (#3, #5, #6, #10, #11)**
- Heading (e.g., "Your clip is ready" / "Confirm your new email")
- Brief message paragraph
- Full-width primary green CTA button
- Dismissal line

**3. Notification with metadata (#4, #7, #8, #9, #13, #14)**
- Same as action email but adds a small metadata table before the button:
  - Key-value pairs like "User Email: {email}", "Clip ID: {clip_id}"
  - Styled as `font-family: monospace` in a light gray box
- Button is optional (present when there's a link to view)

**4. Simple Notice (#2, #12)**
- Heading + message only, no button, no metadata box

### Implementation Plan

I will create a single HTML page at `src/email-templates/poser-emails.html` containing all template variants as clearly labeled sections. Each section is a standalone, copy-pasteable HTML email template with fully inlined CSS. This gives your coding agent a single reference file to extract from.

**Files to create:**
- `src/email-templates/poser-emails.html` — all 14 email templates in one file, each in a clearly commented section with template variable placeholders in `{braces}`

**What will NOT be included:**
- No React/TypeScript code
- No build tooling
- No email sending logic

### Template List (grouped by content type)

| # | Template Key | Type | Has Button | Has Metadata |
|---|---|---|---|---|
| 1 | auth_verification_code | Code | No | No |
| 2 | ops_new_user_signup | Notice | No | Yes |
| 3 | account_email_change_confirmation | Action | Yes | No |
| 4 | ops_clip_started | Notification | No (link) | Yes |
| 5 | direct_clip_finished_user | Action | Yes | No |
| 6 | direct_clip_failed_user | Action | Yes | No |
| 7 | ops_direct_clip_finished | Notification | Yes | Yes |
| 8 | ops_direct_clip_failed | Notification | Yes | Yes |
| 9 | contact_form_ops | Notification | No | Yes |
| 10 | embed_clip_confirmation | Action | Yes | No |
| 11 | embed_results_ready_user | Action | Yes | No |
| 12 | embed_analysis_failed_user | Notice | No | No |
| 13 | ops_embed_results_ready | Notification | Yes | Yes |
| 14 | ops_embed_analysis_failed | Notification | No | Yes |

