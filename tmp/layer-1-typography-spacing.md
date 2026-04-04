## Layer 1: Typography & Spacing

### Priority
1

### Type
epic

### Description
Apply 4px grid alignment and enforce minimum heading marker font sizes across styles.css. This is the foundation pass — polish the still frame before adding motion.

### Acceptance Criteria
- All spacing values listed in the engineering plan land on the 4px grid
- Heading markers H3–H6 render at ≥11px, hierarchy preserved via opacity
- `pnpm tauri dev` — DevTools audit shows no sub-4px gaps in tab bar, toolbar, statusbar, or vimrc panels

### Labels
styles, typography, spacing

---

## 4px Grid Alignment

### Priority
1

### Type
task

### Description
Update all spacing values in styles.css to align to the 4px grid. Exact line references from engineering plan:

- styles.css:73   gap: 2px → 4px (tab bar)
- styles.css:72   padding: 0 8px 0 78px → 0 8px 0 80px (traffic light offset)
- styles.css:88   padding: 2px 10px → 4px 8px (tab buttons)
- styles.css:184  gap: 2px → 4px (toolbar)
- styles.css:226  padding: 0 14px → 0 16px (statusbar)
- styles.css:227  gap: 10px → 12px (statusbar)
- styles.css:123  padding: 1px 8px → 2px 8px (resize badge)
- styles.css:299  margin-right: 6px → 8px (heading markers)
- styles.css:307  padding: 2px 6px → 2px 8px (H1 marker)
- styles.css:314  padding: 2px 5px → 2px 8px (H2 marker)
- styles.css:551  padding: 14px 18px → 16px 20px (vimrc header)
- styles.css:585  padding: 14px 18px → 16px 20px (vimrc editor)
- styles.css:602  padding: 12px 18px → 12px 20px (vimrc footer)

### Acceptance Criteria
- All listed properties updated to their proposed values
- No other spacing properties changed (scope: exactly these lines)

### Labels
styles, spacing

### Dependencies
blocks:layer-1-epic

---

## Heading Marker Minimum Font Size

### Priority
1

### Type
task

### Description
Enforce 11px minimum font size for H3–H6 heading markers in styles.css. Hierarchy preserved via opacity rather than shrinking type below readability.

- H3 (line 320): 9px → 11px, padding 1px 4px → 2px 4px
- H4 (line 328): 8px → 11px, padding 1px 4px → 2px 4px; opacity: 0.7
- H5 (line 336): 8px → 11px, padding 1px 3px → 2px 4px; opacity: 0.5
- H6 (line 343): 7px → 11px, padding 1px 3px → 2px 4px; opacity: 0.4

### Acceptance Criteria
- H3–H6 markers all render at 11px
- Visual hierarchy still clear through opacity stepping (0.7 / 0.5 / 0.4)
- No layout reflow — markers stay inline with heading text

### Labels
styles, typography

### Dependencies
blocks:layer-1-epic
