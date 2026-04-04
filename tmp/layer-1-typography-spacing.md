## Layer 1: Typography & Spacing

First pass of the visual refinement — align all spacing to a 4px grid and fix heading marker legibility. styles.css only, no JS changes.

### Priority
1

### Type
epic

### Labels
visual, spacing, typography

### Acceptance Criteria
- All spacing values in styles.css land on 4px grid
- Heading markers H3-H6 are legible at 11px minimum
- DevTools audit confirms no off-grid values in tab bar, toolbar, statusbar, resize badge, heading markers, vimrc modal
- Visual verification via `pnpm tauri dev`

---

## 4px grid alignment pass

Align all spacing values to a 4px grid across tab bar, toolbar, statusbar, resize badge, heading markers, and vimrc modal.

### Priority
1

### Type
task

### Description
Apply the following changes in styles.css:

- Line 73: gap 2px -> 4px (tab bar)
- Line 72: padding left 78px -> 80px (traffic light offset)
- Line 88: padding 2px 10px -> 4px 8px (tab buttons)
- Line 184: gap 2px -> 4px (toolbar)
- Line 226: padding 0 14px -> 0 16px (statusbar)
- Line 227: gap 10px -> 12px (statusbar)
- Line 123: padding 1px 8px -> 2px 8px (resize badge)
- Line 299: margin-right 6px -> 8px (heading markers)
- Line 307: padding 2px 6px -> 2px 8px (H1 marker)
- Line 314: padding 2px 5px -> 2px 8px (H2 marker)
- Line 551: padding 14px 18px -> 16px 20px (vimrc header)
- Line 585: padding 14px 18px -> 16px 20px (vimrc editor)
- Line 602: padding 12px 18px -> 12px 20px (vimrc footer)

### Design
Pure CSS changes. No layout reflows expected — all adjustments are 1-2px nudges. Traffic light offset 78->80 keeps macOS buttons aligned.

### Acceptance Criteria
- All listed values updated to 4px-grid-aligned equivalents
- Tab bar, toolbar, statusbar, resize badge, vimrc modal all visually consistent
- No overflow or clipping regressions

### Labels
visual, spacing

### Dependencies
blocks:layer-1-typography-spacing

---

## Heading marker minimum font size floor

Set 11px minimum font size for H3-H6 heading markers, preserving hierarchy via opacity.

### Priority
1

### Type
task

### Description
In styles.css, update heading marker font sizes:

- H3 (line 320): 9px -> 11px, padding 1px 4px -> 2px 4px
- H4 (line 328): 8px -> 11px, padding 1px 4px -> 2px 4px
- H5 (line 336): 8px -> 11px, padding 1px 3px -> 2px 4px
- H6 (line 343): 7px -> 11px, padding 1px 3px -> 2px 4px

Add opacity values to preserve visual hierarchy:
- H4: opacity 0.7
- H5: opacity 0.5
- H6: opacity 0.4

### Design
11px is the legibility floor for the marker badges. Hierarchy is maintained through opacity rather than size, which is more accessible and still visually distinct.

### Acceptance Criteria
- H3-H6 markers all render at 11px minimum
- Hierarchy still visually distinguishable via opacity graduation
- Markers remain compact and don't break line height

### Labels
visual, typography, accessibility

### Dependencies
blocks:layer-1-typography-spacing
