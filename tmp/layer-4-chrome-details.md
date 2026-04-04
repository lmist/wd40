## Layer 4: Chrome & Details

Second pass — polish chrome elements: physical tab appearance, divider grab affordance, statusbar fix. styles.css only.

### Priority
1

### Type
epic

### Labels
visual, chrome, polish

### Dependencies
blocks:layer-1-typography-spacing

### Acceptance Criteria
- Active tab visually connects to editor pane
- Divider widens on hover with smooth transition
- Statusbar file name vertically centered
- No overflow with 3+ tabs open
- Visual verification via `pnpm tauri dev`

---

## Tab bar physical tab styling

Restyle tabs to look like physical tabs that connect to the editor pane below.

### Priority
1

### Type
task

### Description
Update styles.css (lines 81-98):

```css
#tab-bar button {
  border-radius: 6px 6px 0 0;  /* was: 4px */
  padding: 4px 12px;
  margin-top: 2px;
}
#tab-bar button.active {
  background: var(--bg-editor);  /* was: var(--accent-dim) */
  color: var(--fg);
  margin-top: 0;
  padding-top: 6px;             /* grows upward 2px */
}
```

### Design
Active tab grows 2px upward and uses editor background color, creating visual continuity between tab and content. Inactive tabs sit 2px lower. Keep button height <= 24px to avoid 28px overflow.

### Acceptance Criteria
- Active tab background matches editor pane
- Active tab appears to "grow" from the editor
- No overflow with 3+ tabs
- Tab bar total height stays within 28px budget

### Labels
visual, chrome, tabs

### Dependencies
blocks:layer-4-chrome-details

---

## Divider grab affordance

Add hover/drag visual feedback to the panel divider.

### Priority
1

### Type
task

### Description
Update styles.css (lines 144-163):

```css
#divider {
  transition: background 0.2s ease, width 0.15s ease;
}
#divider:hover, #divider.dragging {
  background: var(--accent);
  width: 3px;
  margin: 0 -1px;  /* prevent layout shift */
}
```

### Design
Negative margin compensates for the width increase so adjacent panels don't shift. Transition easing keeps the expansion smooth.

### Acceptance Criteria
- Divider widens to 3px on hover
- No layout shift when divider expands
- Accent color visible on all 3 themes
- Works during active drag (`.dragging` class)

### Labels
visual, chrome, interaction

### Dependencies
blocks:layer-4-chrome-details

---

## Statusbar file name vertical alignment

Add line-height: 1 to #file-name for proper vertical centering.

### Priority
2

### Type
task

### Description
In styles.css (lines 246-248), add `line-height: 1` to the `#file-name` selector.

### Acceptance Criteria
- File name text vertically centered in statusbar
- No clipping of descenders

### Labels
visual, chrome

### Dependencies
blocks:layer-4-chrome-details
