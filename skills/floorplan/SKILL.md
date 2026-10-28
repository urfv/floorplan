---
name: floorplan
description: Draw a floorplan of an app's codebase (one repo or several side by side), an interactive node-graph map where every subsystem, module, file and HTTP route has a human-readable name and a one-line description, connected by imports and HTTP calls. Use to visualize, map, document or understand a codebase, or to update an existing floorplan.
type: prompt
whenToUse: When the user wants an architectural overview, codebase diagram, app map, onboarding guide or an updated floorplan.
---

# Floorplan

Produce `floorplan/` at the codebase root: a map of the app that someone new can read like a system diagram. Every card shows a human name and a one-line description, with the real path underneath.

- **You write:** `architecture.json` (subsystems, modules, flows) and `descriptions/*.json` (a name and description for every file and route).
- **Generated:** `graph.json`, `graph-query.mjs`, `query.mjs`, `serve.mjs` and `index.html`.

The scripts do the mechanical work: finding repos, parsing imports and routes, matching HTTP calls to endpoints, layout and rendering. Your job is deciding what things *are* and saying so plainly.

Arguments: $ARGUMENTS

Run `node ${KIMI_SKILL_DIR}/scripts/status.mjs` first and use its output to decide whether this is a refresh.

## A map already exists? Refresh it instead

If status shows an existing map, don't start over. Run:

`node ${KIMI_SKILL_DIR}/scripts/refresh.mjs <root>`

It re-scans, compares content fingerprints against the last build, carries descriptions to moved files, drops deleted entries, flags changed exports or routes, rebuilds, and prints a short NEXT list. Do only what NEXT asks: add globs for new unassigned directories, run describe.mjs for new or flagged items, and check module summaries and flows after large changes. Then mark recent work and show the map, even when nothing changed.

## Workflow (first run)

The codebase root is the argument if one was given, otherwise the current directory. It may be one repo or a folder holding several repos.

1. **Scan.**
   `node ${KIMI_SKILL_DIR}/scripts/scan.mjs <root>`
   This writes `floorplan/.cache/scan.json` and prints a summary: repos, a code tree with LOC, entrypoints, heavy import edges, HTTP matches, external packages and hosts. Work from the summary; don't read the large scan.json.

2. **Read the contract.** Read [references/schema.md](references/schema.md) and [references/choosing-boundaries.md](references/choosing-boundaries.md).

3. **Explore just enough.** Read READMEs, manifests and entrypoints, then skim 1–2 files per candidate subsystem until you can summarize each one. You're after the shape of the system, not a code review.

4. **Write `floorplan/architecture.json`.** Aim for 3–9 top-level nodes, 3–12 children under each big one, globs covering over 90% of code files, real external services, edges only for connections the scan can't see, and 1–3 flows. Every node needs a `summary`.

   **Audience.** Unless the user asks for a developer-facing map, leave `audience` unset or use `everyone`. Write project summaries, labels and descriptions in plain language; paths and technical IDs remain visible separately.

   **Tour.** Add `"tour": [{ "node": "<node id or file path>", "title": "…", "note": "…" }]`, with 3–8 stops in an order useful to a newcomer. The first guided flow is added automatically. Without a tour, one is built from summaries and the first flow.

5. **Build and fix.**
   `node ${KIMI_SKILL_DIR}/scripts/build.mjs <root>`
   It validates everything and names each problem. Fix and rebuild until clean and unassigned is under about 10%.

   **Nothing Floorplan makes is committed.** `floorplan/` ignores itself. The build writes only inside that folder: it does not modify `AGENTS.md`, `.kimi-code/`, Claude files, `.gitignore` or `.git/info/exclude`. If git already tracks map files, pass the suggested untrack command to the user rather than running it.

6. **Describe every file and route.**
   `node ${KIMI_SKILL_DIR}/scripts/describe.mjs <root>`
   Read [references/writing-descriptions.md](references/writing-descriptions.md) first. This writes one worksheet per module and a description skeleton. Worksheets contain file digests, definitions, routes and connections, enough for most entries without opening each file.

   For more than about 150 files, split worksheets across parallel subagents when available, grouped by area. Give each its own worksheet keys and description files. For smaller codebases, do it yourself. Rebuild until both file and route descriptions reach 100%.

7. **Mark recent work.**
   `node ${KIMI_SKILL_DIR}/scripts/recent.mjs <root>`
   Do this on every make and update because it replaces previous highlights. Write `floorplan/recent-work.json` in the format from [references/schema.md#recent-work](references/schema.md#recent-work): one task per user request, with a title, shortened request, summary and changed items. Every item note explains how the change serves the request in plain language. Use work from this conversation first; in a fresh session, use clearly in-flight changes. Never include secrets. Rebuild afterwards.

8. **Show it, then report.**
   `node ${KIMI_SKILL_DIR}/scripts/open.mjs <root>`
   It starts or reuses the local server and opens the map. Existing tabs reload. If you have an in-app preview, pass `--no-open` and open the printed URL there. On a remote or headless machine, tell the user to run `node floorplan/serve.mjs` locally instead.

   Report the URL and describe the architecture in 3–5 lines in the user's language, including surprising cycles, dead areas or coupling. Always mention high-severity Health items without repeating secret values. Tell the user that `architecture.json` and `descriptions/` are editable and that they can later ask to "update the floorplan". On an update, start with highlighted recent work.

## Opening the map and asking questions

The floating Ask bar answers with text plus a board of relevant cards, their connections and an optional walkthrough. Flows can also be requested in plain words.

- **Kimi Code CLI.** `floorplan/serve.mjs` runs questions through the user's `kimi` CLI with a custom agent restricted to `Read`, `Grep` and `Glob`. It cannot run shell commands, edit files or delegate. The server supplies map context and a JSON schema; Kimi can read real source files for details. `--kimi <path>` overrides CLI discovery and `--model <name>` selects a model; open.mjs passes both through.
- **Without the CLI:** `floorplan/index.html` still opens directly in a browser and everything except Ask and generated flows works offline.

Stop a background server with `node floorplan/serve.mjs --stop`.

## What else the map gives them

- **Health.** Passwords and keys in code, endpoints without sign-in checks, unused files and very large files. Each issue has **Show on map** and **Fix with Kimi**. Secret values are never stored or shown. This is a quick check, not a security audit.
- **Screens.** Detects Next.js, React Router, Vue, SvelteKit, Remix, Nuxt, Astro, Expo, Angular and TanStack screens and shows the code and services behind each.
- **Start here.** A one-minute tour using your `tour`, or an automatic fallback.
- **Plain words by default.** Filters → Show technical detail switches to developer terms and exports.
- **Custom flows.** Saved in `floorplan/custom-flows.json` and folded into every build. Treat this as user content.

## Notes

- Paths are relative to the codebase root and use forward slashes. In a multi-repo root they start with the repo folder.
- Route keys are `"METHOD /full/path"` exactly as worksheets print them.
- The map makes no outside requests: the build inlines ELK and fonts from `${KIMI_SKILL_DIR}/assets/vendor/`.
- HTTP edges are strong hints from static matching, not proof. Add important missed service links as explicit edges.
- Don't hand-edit `graph.json`, `graph-query.mjs`, `query.mjs`, `serve.mjs` or `index.html`; they're regenerated.
