## Layer 4: Chrome & Details

### Priority
1

### Type
epic

### Description
Polish chrome elements: tab bar physical tab appearance, divider grab affordance, and statusbar text alignment. styles.css only. Implement after Layer 1.

### Acceptance Criteria
- Active tab visually connects to editor pane (no gap)
- Divider widens and highlights on hover/drag
- 3+ tabs don't overflow the tab bar
- Statusbar file name aligns cleanly

### Labels
styles, chrome, polish

---

## Tab Bar Physical Tabs

### Priority
1

### Type
task

### Description
Restyle tab bar buttons to look like physical tabs that lift off the bar. Exact changes (styles.css:81-98):

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
  padding-top: 6px;  /* grows upward 2px */
}
```

### Acceptance Criteria
- Active tab background matches editor pane background (no visible seam)
- Inactive tabs sit 2px below active tab
- Button height stays ≤24px to prevent 28px overflow with 3+ tabs

### Labels
styles, chrome

### Dependencies
blocks:layer-4-epic

---

## Divider Grab Affordance

### Priority
1

### Type
task

### Description
Add hover/drag visual feedback to the panel resize divider. Exact changes (styles.css:144-163):

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
The negative margin compensates for width expansion so surrounding panels don't shift. Test at various split widths.

### Acceptance Criteria
- Divider shows accent color on hover and while dragging
- Divider widens to 3px on hover, returns to default on mouseout
- No layout shift in editor or mindmap pane during hover

### Labels
styles, chrome, interaction

### Dependencies
blocks:layer-4-epic

---

## Statusbar Line Height

### Priority
2

### Type
task

### Description
Add `line-height: 1` to `#file-name` in styles.css (around lines 246-248) to prevent text from being clipped or misaligned vertically.

### Acceptance Criteria
- File name text vertically centered and not clipped
- No change to statusbar height

### Labels
styles, chrome

### Dependencies
blocks:layer-4-epic
