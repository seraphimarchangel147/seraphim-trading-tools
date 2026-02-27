# Obsidian CLI Integration for Legion
# Adapts v0.2.2 CLI to match upgrade spec capabilities

## Available Commands (v0.2.2)
- search → Fuzzy search notes
- search-content → Full-text search
- print → Read note contents
- create → Create new note
- daily → Create/open daily note
- frontmatter → View/modify frontmatter
- open → Open note in Obsidian
- move/rename → Move notes
- delete → Delete notes

## Missing from upgrade spec
- vault search/query (semantic) → Use search-content
- note read/get → Use print
- note append → Not available (use create + manual append)
- graph/backlinks/links → Not available
- vault daily (read existing) → Use print on daily note

## Adaptation Strategy
1. Use search-content for semantic search
2. Use print for reading notes
3. Use create for new notes (manual append via file operations)
4. Use daily for daily note creation/access
5. For backlinks/graph: Use grep/ag on vault directory

## Vault Path
/home/usapcool/serphim obsidian vault

## Key Files Structure
- 00 - Index/Master Index.md
- 01 - MOCs/*.md
- 02 - Domains/*/
- 03 - Primitives/*/
- 04 - Explorations/*/
- YYYY-MM-DD.md (daily notes)
