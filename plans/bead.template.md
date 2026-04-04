// parseMarkdownFile parses a markdown file and extracts issue templates.
// Expected format:
//
//	## Issue Title
//	Description text...
//
//	### Priority
//	2
//
//	### Type
//	feature
//
//	### Description
//	Detailed description...
//
//	### Design
//	Design notes...
//
//	### Acceptance Criteria
//	- Criterion 1
//	- Criterion 2
//
//	### Assignee
//	username
//
//	### Labels
//	label1, label2
//
//	### Dependencies
//	bd-10, bd-20
//
// markdownParseState holds state for parsing markdown files
