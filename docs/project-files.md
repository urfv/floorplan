# What's in your project

Floorplan writes only inside the `floorplan/` folder. It does not create or modify `AGENTS.md`, `.kimi-code/`, Claude files, `.gitignore` or `.git/info/exclude`.

## The `floorplan/` folder

| File | What it is | Edit it? |
|---|---|---|
| `index.html` | The map: one self-contained offline page | No. Rebuilt every time |
| `graph.json` | Everything the map shows, as data | No |
| `graph-query.mjs` | Shared map lookups and response schemas | No |
| `architecture.json` | Parts, outside services, extra connections, flows and tour | **Yes** |
| `descriptions/*.json` | Names and descriptions for files and endpoints | **Yes** |
| `recent-work.json` | What was just worked on, and why | Rarely. Kimi writes it |
| `custom-flows.json` | Flows requested from the map | Only to delete one |
| `serve.mjs` | Serves the map and answers through Kimi Code | No |
| `query.mjs` | Command-line map lookups | No |
| `.cache/` | Scans, worksheets, read-only agent context and server state | No. Safe to delete |
| `.gitignore` | Keeps this whole folder out of git | No |

### Editing names and structure

Your edits to `architecture.json` and `descriptions/` are kept on every update. You can rename parts, reword descriptions, move files between `paths` patterns, add missed connections, pin file notes, or edit flows and the tour. You can also ask Kimi to do it.

The formats are in [`skills/floorplan/references/schema.md`](../skills/floorplan/references/schema.md), with naming guidance in [`writing-descriptions.md`](../skills/floorplan/references/writing-descriptions.md).

## Staying out of git

`floorplan/` contains its own `.gitignore` that ignores everything in the folder, including itself. Your project's ignore files and local git exclude are not changed. The map is personal to each clone; teammates who install Floorplan make their own.

If you committed a `floorplan/` folder before, ignoring it doesn't untrack those files. The build prints the command to untrack them while keeping them on disk:

```bash
git rm -r --cached floorplan
```
