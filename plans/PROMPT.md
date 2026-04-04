## Prompt: Decompose Engineering Plan into Beads

You are converting an engineering plan into beads-compliant markdown. Follow these rules exactly:

### Output Format
Use `## Issue Title` for each issue. Text between title and first `###` becomes the description. Use these `###` sections (case-insensitive):

- `### Priority` - 0-4 (0=critical, 2=medium, 4=backlog)
- `### Type` - bug, feature, task, epic, chore
- `### Description` - Override inline description
- `### Design` - Design notes
- `### Acceptance Criteria` - Bullet list or text
- `### Assignee` - Username
- `### Labels` - Comma-separated
- `### Dependencies` - Comma-separated IDs or `type:id` format

```md

```

### Decomposition Rules
1. **Identify epics first** - Large features become `type: epic`
2. **Break into tasks** - Each epic gets child tasks
3. **Set priorities** - Critical paths get 0-1, nice-to-have gets 2-3
4. **Add dependencies** - Use `blocks:bd-id` for hard dependencies
5. **Include acceptance criteria** - Every task needs testable outcomes

### Example Output

```markdown
## Implement OAuth2 authentication

### Priority
1

### Type
epic

### Description
Add OAuth2 authentication with support for Google, GitHub, and Microsoft providers.

### Acceptance Criteria
- Users can authenticate with OAuth2
- Token refresh works automatically
- Session management is secure

### Labels
auth, security

## Design OAuth2 flow

### Priority
1

### Type
task

### Description
Create technical design document for OAuth2 implementation.

### Design
Use Authorization Code Flow with PKCE. Store tokens in HTTP-only cookies.

### Dependencies
blocks:epic

## Implement OAuth2 endpoints

### Priority
1

### Type
feature

### Description
Build /auth/oauth/{provider} and /auth/callback endpoints.

### Dependencies
blocks:design

## Write OAuth2 integration tests

### Priority
2

### Type
task

### Description
End-to-end tests for complete OAuth2 flow.

### Dependencies
blocks:implement
```

### For Complex Plans
If the plan has many dependencies, use graph JSON instead:
```bash
bd create --graph plan.json
```

Now decompose the provided engineering plan following these rules exactly.

---

## Notes

This prompt embodies Steve's direct, rule-based approach seen throughout the beads codebase. It references the exact markdown format specification from `cmd/bd/markdown.go` [1](#2-0)  and the section processing logic [2](#2-1) . The prompt also includes the graph JSON alternative which Steve recommends for dependency-rich plans [3](#2-2) .

Wiki pages you might want to explore:
- [Onboarding for AI Agents (steveyegge/beads)](/wiki/steveyegge/beads#2.4)
- [AI Tool Integrations (steveyegge/beads)](/wiki/steveyegge/beads#8.4)

### Citations
