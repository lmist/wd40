## Layer 2: Animations & Transitions

### Priority
2

### Type
epic

### Description
Add motion to the polished still frame: theme switch fade, tab switch fade, modal scale animation, markmap D3 transitions, and elastic panel snap-back. Touches styles.css and main.ts.

### Acceptance Criteria
- Theme switch fades editor opacity smoothly (150ms)
- Tab switch cross-fades content (100ms)
- Modal scales in/out instead of appearing/disappearing instantly
- Markmap nodes animate on update (300ms D3)
- Panel snap-back has elastic spring feel
- No janky frame drops on any transition

### Labels
animation, styles, main.ts

---

## Theme Switch Editor Fade

### Priority
2

### Type
task

### Description
Add opacity fade to editor pane during theme switches in main.ts `setThemeById()` (lines 588-613):

```typescript
editorPane.style.transition = "opacity 150ms ease";
editorPane.style.opacity = "0.6";
requestAnimationFrame(() => {
  editor.dispatch({ effects: themeCompartment.reconfigure(entry.extension) });
  applyMarkmapTheme();
  updateMarkmap(editor.state.doc.toString());
  requestAnimationFrame(() => { editorPane.style.opacity = "1"; });
});
```

### Design
Two rAF calls: outer to let browser paint the opacity drop, inner to restore after theme applies. If tab is backgrounded, rAF won't fire — theme swaps without fade, which is acceptable.

### Acceptance Criteria
- Editor dips to 0.6 opacity then returns to 1 on theme switch
- No flash or layout shift during transition

### Labels
animation, main.ts

### Dependencies
blocks:layer-2-epic

---

## Tab Switch Fade

### Priority
2

### Type
task

### Description
Add opacity cross-fade when switching tabs in main.ts (lines 264-280). Same rAF pattern as theme switch: fade to 0.5, swap content, fade back. 100ms ease.

### Acceptance Criteria
- Content area fades to 0.5 opacity then returns when switching tabs
- Transition completes within 100ms
- No content flash or flicker

### Labels
animation, main.ts

### Dependencies
blocks:layer-2-epic

---

## Modal Scale Animation

### Priority
2

### Type
task

### Description
Replace `display:none` show/hide with opacity + pointer-events + transform for the vimrc modal (styles.css:520-534):

```css
.vimrc-overlay { opacity: 1; transition: opacity 200ms ease-out; }
.vimrc-overlay.hidden { opacity: 0; pointer-events: none; }
.vimrc-modal { transform: scale(1) translateY(0); transition: transform 200ms ease-out; }
.vimrc-overlay.hidden .vimrc-modal { transform: scale(0.97) translateY(4px); }
```

No JS changes needed — existing classList toggle on `.hidden` continues to work.

### Acceptance Criteria
- Modal fades in with subtle scale-up from 0.97
- Modal fades out with subtle scale-down and 4px drop
- Clicks do not pass through when modal is hidden (pointer-events: none)
- No JS changes required

### Labels
animation, styles

### Dependencies
blocks:layer-2-epic

---

## Markmap Animation Duration

### Priority
2

### Type
task

### Description
Configure markmap to use 300ms D3 transitions for node updates (main.ts:154-161):

```typescript
// In markmap options:
duration: 300

// After markmap instance created (fallback):
(mm as any).options.duration = 300;
```

### Design
Risk: markmap may ignore `duration` from `setData`. Setting it directly on the instance after creation is the fallback. On fast typing, D3 interrupts previous transition and jumps to final position — acceptable.

### Acceptance Criteria
- Markmap nodes visibly animate on content change (not instant)
- Duration is approximately 300ms
- Fast typing doesn't cause errors, only interrupted animations

### Labels
animation, main.ts

### Dependencies
blocks:layer-2-epic

---

## Debounce Increase

### Priority
2

### Type
task

### Description
Increase markmap update debounce from 50ms to 150ms in main.ts (line 197):

```typescript
debounce(…, 50)  →  debounce(…, 150)
```

This gives the 300ms D3 transitions room to complete before the next update interrupts them.

### Acceptance Criteria
- Markmap update debounce set to 150ms
- Typing at normal speed produces smooth markmap transitions rather than constant interruption

### Labels
main.ts, performance

### Dependencies
blocks:layer-2-epic

---

## Panel Resize Elastic Snap-Back

### Priority
2

### Type
task

### Description
Add rubber-band resistance and spring snap-back to panel resize in main.ts (lines 556-578):

- During drag: allow panel below 200px minimum with 0.3x rubber-band resistance
- On mouseup: animate to clamped value using `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring curve)
- Clear transition after snap-back completes (use `transitionend` listener)

### Design
Risk: if `transitionend` doesn't fire (e.g. snap value equals current), transition property stays on element, slowing future drags. Defensive: also clear on next dragstart.

### Acceptance Criteria
- Dragging below 200px shows resistance (moves slower than cursor)
- Releasing below 200px snaps back with spring bounce
- After snap-back, resize drags at full speed again (no residual transition)

### Labels
animation, main.ts, interaction

### Dependencies
blocks:layer-2-epic
