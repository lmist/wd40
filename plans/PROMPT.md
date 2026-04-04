## Prompt: Decompose Engineering Plan into Beads

You are converting an [engineering plan](./engineering.md) strictly into beads-compliant markdown. Follow these rules exactly:

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

### Template
There is a template in `./bead.template.md` which you are expected to follow for each work item you will produce.

### Decomposition Rules
1. **Identify epics first** - Large features become `type: epic`
2. **Break into tasks** - Each epic gets children who themselves might be other epics or simply, leaves that are tasks / bugs
3. **Break into subtasks and subsubtasks** as needed
3. **Set priorities** - Critical paths get 0-1, nice-to-have gets 2-3
4. **Add dependencies** - Use `blocks:bd-id` for hard dependencies
5. **Include acceptance criteria** - Every task needs testable outcomes

### Example Output

(1)
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

(2)
```markdown
## Implement OAuth2 endpoints

### Priority
1

### Type
feature

### Description
Build /auth/oauth/{provider} and /auth/callback endpoints.

### Dependencies
blocks:design
```

(3)
```markdown
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

Now decompose the provided engineering plan following these rules exactly. As you know, beads does not allow beyond a depth of three, starting from zero.
---
