## Custom Markmap Link Shapes

### Priority
3

### Type
task

### Description
Investigate contributing a `linkShape` option to markmap-view upstream, or fork with custom bezier curve generation. Current curves are functional but mechanical. Organic curves would make the mindmap feel more hand-drawn.

markmap-view uses d3-hierarchy's `linkHorizontal` internally. Replacing this with custom bezier parameters (or a custom path generator) could produce softer, more organic branch curves.

### Design
Depends on Layer 3 completing first — verify whether spacing adjustments alone resolve the mechanical feel before investing in custom curves. If spacing fixes it, this may be deprioritized further.

Two approaches:
1. Upstream contribution: propose `linkShape` option to markmap-view maintainers
2. Fork: maintain a patched version with custom bezier generation

### Acceptance Criteria
- Branch links use custom bezier curves that feel organic/hand-drawn
- OR: investigation concludes spacing alone is sufficient and issue is closed with rationale

### Labels
mindmap, research, backlog

---

## Test Infrastructure

### Priority
3

### Type
task

### Description
Add vitest + basic tests for theme lookup functions and Rust parser functions. The Rust parser is the most complex code in the project with zero test coverage — a wrong parse tree produces a broken mindmap with no error surfaced.

Coverage targets:
- `getThemeById()` — theme lookup by ID
- `applyChromeColors()` — CSS custom property application
- Rust `parse_markdown` — markdown to tree structure
- Rust `parse_list` — list parsing

### Design
Rust tests: use Rust's built-in test framework (`#[cfg(test)]`). TypeScript tests: vitest with jsdom for DOM-touching functions.

### Acceptance Criteria
- `pnpm test` runs and passes
- `getThemeById` and `applyChromeColors` have unit tests covering happy path + missing theme
- Rust `parse_markdown` and `parse_list` have tests covering basic markdown structures
- CI runs tests on push

### Labels
testing, rust, vitest, backlog
