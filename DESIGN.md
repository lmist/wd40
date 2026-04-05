# Design System — wd40

## Product Context
- **What this is:** A desktop outliner that renders indented text as a live mindmap
- **Who it's for:** People who think in outlines and want visual structure
- **Platform:** macOS (Tauri/WebKit)
- **Aesthetic goal:** Indistinguishable from a first-party Apple app

## Aesthetic Direction
- **Direction:** Cupertino Native
- **Decoration level:** Minimal — the interface is invisible, the content is everything
- **Mood:** Calm, precise, confident. Like opening a new Apple Note for the first time.
- **Anti-patterns:** No decorative gradients, no colored glows, no visual noise

## Typography — Apple Only
- **UI:** `-apple-system, "SF Pro Text", "SF Pro Display"` — no non-Apple fallbacks
- **Mono (editor):** `"SF Mono", "Menlo"` — the only two options
- **Mono (alternate):** `"Monaco"` — available as a picker option
- **HUD/Rounded:** `"SF Pro Rounded", -apple-system`
- **Scale (4pt grid):**
  - 10px — quaternary labels, badges
  - 11px — tertiary labels, hints, captions
  - 12px — secondary UI, statusbar file name
  - 13px — primary UI, modal titles, body
  - 13.5px — editor content
  - 14px — mindmap node text
- **Weight distribution:**
  - 400 — body text, editor content
  - 500 — tab labels, secondary UI
  - 600 — badges, section headers, modal titles, buttons

## Color — Apple HIG System Colors
- **Approach:** Restrained — one accent (system blue), semantic colors for state
- **Dark mode:**
  - Background: `#1c1c1e` (systemBackground)
  - Surface: `#2c2c2e` (secondarySystemBackground)
  - Elevated: `#3a3a3c` (tertiarySystemBackground)
  - Label: `#f5f5f7`
  - Secondary label: `#8e8e93`
  - Tertiary label: `#48484a`
  - Separator: `rgba(84, 84, 88, 0.65)`
  - Accent: `#0A84FF` (systemBlue)
- **Light mode:**
  - Background: `#f2f2f7`
  - Surface: `#ffffff`
  - Label: `#1c1c1e`
  - Secondary label: `#8e8e93`
  - Tertiary label: `#aeaeb2`
  - Separator: `rgba(60, 60, 67, 0.29)`
  - Accent: `#007AFF` (systemBlue)

## Spacing — 4pt Base Unit
Every spacing value must be a multiple of 4px (or 2px for hairlines).
- `2` — hairline gaps, micro adjustments
- `4` — icon-to-text gaps, badge padding vertical
- `8` — compact gaps, small padding, badge padding horizontal
- `12` — standard gaps, section padding
- `16` — comfortable padding, modal header/footer padding
- `20` — generous padding, modal body padding
- `24` — section padding horizontal
- `32` — group spacing
- `48` — large spacing
- `64` — XL spacing

**Banned values:** 3px, 5px, 7px, 9px, 10px (use 8 or 12), 14px (use 12 or 16)

## Border Radius Hierarchy
- `4px` — small interactive elements (tab buttons, inline badges)
- `6px` — medium elements (buttons, inputs, save buttons)
- `8px` — toolbar buttons, popovers
- `12px` — cards, modals, sheets
- `14px` — floating toolbar pill
- `999px` — capsule shapes (pills, toggles, badges, HUD)

## Motion
- **Easing:**
  - Default: `ease` (CSS built-in, close to Apple's standard curve)
  - Spring: `cubic-bezier(0.34, 1.56, 0.64, 1)` — spatial bounces (rubber band, snap-back)
  - Enter: `ease-out` — elements appearing
  - Exit: `ease-in` — elements leaving
- **Duration:**
  - Micro: `80ms` — badge color changes, opacity ticks
  - Fast: `150ms` — hover states, color transitions, small UI
  - Standard: `200ms` — theme switches, tab switches, pane transitions
  - Emphasis: `300ms` — modal open/close, markmap reflow
  - Spring: `350ms` — rubber-band snap-back (divider overshoot)

## Vibrancy Materials
- **Toolbar:** `backdrop-filter: blur(20px) saturate(1.2)` + 88% opacity background
- **Status bar:** `backdrop-filter: blur(20px) saturate(1.2)` + 85% opacity background
- **Tab bar:** `backdrop-filter: blur(20px) saturate(1.2)` + 82% opacity background
- **Modal overlay:** `backdrop-filter: blur(4px)` + `rgba(0,0,0,0.4)` scrim

## Layout
- **Tab bar height:** `38px`
- **Status bar height:** `32px`
- **Toolbar button size:** `28x28px`
- **Default editor width:** `38%`
- **Minimum pane width:** `200px`
- **Divider:** `1px` hairline, accent color on hover (3px expansion)
- **Content areas:** Flat color, no decorative gradients or glows

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-05 | Apple fonts only — no Google Fonts, no generic fallbacks | Product is macOS-only Tauri app. Non-Apple fonts break the native feel. |
| 2026-04-05 | 4pt spacing grid enforced | Apple HIG uses 4pt base unit. Ad-hoc spacing (5px, 10px) breaks rhythm. |
| 2026-04-05 | No decorative gradients on content panes | Apple content areas are flat. Decorative glows feel like web, not native. |
| 2026-04-05 | 3 monospace options only (SF Mono, Menlo, Monaco) | All Apple-native. Google Fonts loader removed entirely. |
