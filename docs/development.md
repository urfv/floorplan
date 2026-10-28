# Developing Floorplan

## Repo layout

```
kimi.plugin.json       native Kimi Code plugin manifest
skills/floorplan/
  SKILL.md             the workflow Kimi follows
  references/          formats and style guides Kimi reads while working
    schema.md                architecture.json and recent-work.json
    choosing-boundaries.md   how to carve a codebase into a good map
    writing-descriptions.md  plain-language names and descriptions
  scripts/             Node.js, no dependencies; Kimi runs these
    status.mjs     is there a map, and how stale is it
    scan.mjs       repos, files, imports, endpoints, requests → .cache/scan.json
    build.mjs      validate, connect, Health, screens → graph + map + ESM helpers
    describe.mjs   worksheets for naming files and endpoints
    refresh.mjs    incremental update
    recent.mjs     facts for marking recent work
    open.mjs       start or reuse the map server and open the browser
    lib/           extraction, import resolution, route matching, Health, screens
  assets/
    viewer.html    the map template
    ui/            viewer extensions: glossary, Health, recent work, screens, tour
    graph-query.js shared lookups and response schemas
    serve.mjs      copied into each project's floorplan/ folder
    query-cli.mjs  becomes floorplan/query.mjs
    logo.png, favicon.png
    vendor/        bundled layout engine and fonts, with licenses
tests/                 regression tests and sample projects
docs/                  these guides
```

## Try your working copy

Install the local directory from inside Kimi Code:

```text
/plugins install /path/to/floorplan
/reload
```

Kimi copies local installations into its managed plugin directory, so reinstall after edits. `/plugins info floorplan` shows manifest diagnostics.

The scripts also run directly, which is fastest while developing:

```bash
node skills/floorplan/scripts/scan.mjs /path/to/project
node skills/floorplan/scripts/build.mjs /path/to/project
node skills/floorplan/scripts/open.mjs /path/to/project
```

`build.mjs` needs a `floorplan/architecture.json`, so run the skill once or write a small one by hand ([schema](../skills/floorplan/references/schema.md)).

## Tests

```bash
npm test
```

The tests use Node's built-in runner with nothing to install. GitHub runs them on every push and pull request on Linux and Windows with Node 18, 20 and 22, and on macOS weekly and on demand.

| File | What it checks |
|---|---|
| `parsing.test.mjs` | imports, endpoints, web requests and doc comments |
| `helpers-lib.test.mjs` | globs, file types, flags and fallback names |
| `secrets.test.mjs` | secret detection, masking and placeholders |
| `health.test.mjs` | endpoint protection detection |
| `sample-app.test.mjs` | a complete two-repo map, privacy, offline assets and updates |
| `serve.test.mjs` | loopback serving, header auth, path containment and SSE |
| `kimi.test.mjs` | Kimi argv, read-only agent, JSONL streaming and sessions |
| `release.test.mjs` | manifest, README and changelog version agreement |

Sample projects are created in a temp folder and removed afterwards. Secret-looking values are assembled at runtime so none are committed. When fixing a detection bug, add a sample that fails without the fix.

## Extending the viewer

Files in `skills/floorplan/assets/ui/` are inlined into every map in name order. They use `window.Floorplan` for graph lookups, navigation, panels, dialogs, storage and events. `20-health.js` and `25-recent.js` are useful examples.

## Guidelines

- **No dependencies.** Scripts must run anywhere Node 18+ does, with nothing to install.
- **Plain language first.** Map text should make sense to an app's owner.
- **Never store or print secret values.** Health records locations and masked hints only.
- **Read-only Ask.** The generated Kimi agent must never gain shell, file-writing or delegation tools.
- **No project injection.** Builds write only inside `floorplan/`.
- **Keep examples generic.** Don't describe real private projects in code, comments, docs or prompts.

## Maintaining

### Branches and commits

- `main` is always releasable. Each change gets its own branch and a merge commit (`git merge --no-ff`).
- Name branches by their purpose: `fix/…`, `feat/…`, `docs/…`, `chore/…`.
- Commit messages start with an imperative summary and explain why in the body.
- Keep contributors' commits and authorship. Delete branches after merging.

### Versions and the changelog

Versions follow semantic versioning. Before 1.0, use patch releases for fixes and minor releases for features or changes to what users install or run. Users only receive an update when the version changes. Every noticeable change gets a plain-language entry at the top of `CHANGELOG.md`.

### Releasing

1. On an up-to-date `main`, run `npm test` and install the local plugin to check `/plugins info floorplan` diagnostics.
2. Bump `version` in `kimi.plugin.json` and the version badge in `README.md`.
3. Rename the unreleased changelog heading to `## X.Y.Z (YYYY-MM-DD)`.
4. Commit as `Floorplan X.Y.Z: <headline>` and push `main`.
5. Create and push tag `floorplan--vX.Y.Z`, then publish a GitHub release with that version's changelog.
6. Reply on affected issues and pull requests with the release and update instructions.
