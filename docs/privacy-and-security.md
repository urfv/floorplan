# Privacy and security

## What runs where

| Part | Where it runs | What it sends |
|---|---|---|
| Scan, build, updates | your computer (Node.js) | nothing |
| Writing names and descriptions | Kimi, through your Kimi Code session | files Kimi reads, as in any Kimi Code task |
| The map | your browser | nothing; layout engine and fonts are embedded |
| The map server (`serve.mjs`) | your computer, on `127.0.0.1` only | nothing on its own |
| Asking questions | a local `kimi -p` session with your account | your question and files the read-only agent chooses to read |

Floorplan has no analytics, telemetry, hosted waitlist, upsell or install scripts. It has no runtime package dependencies. Floorplan itself makes no outside requests; network access associated with answers is performed by Kimi Code under your own account and configuration.

The layout engine ([elkjs](https://github.com/kieler/elkjs) 0.9.3, EPL-2.0) and fonts (Inter and JetBrains Mono, SIL Open Font License) are bundled in `skills/floorplan/assets/vendor/` with their licenses and embedded into every map.

## The local server

- It listens on `127.0.0.1` only, so other machines on your network can't connect.
- Every start creates a random token, which only the served map page receives.
- Every API requires `x-floorplan-token`, including the live-reload SSE stream. The browser uses `fetch` for that stream, so tokens never appear in URLs, query strings or browser history.
- API requests from another origin are refused.
- Static paths are decoded, resolved canonically and checked with `path.relative`. Existing files are also checked with `realpath`, preventing sibling-prefix and symlink escapes. Malformed addresses get an error without stopping the server.
- Questions run Kimi with a custom agent whose only tools are `Read`, `Grep` and `Glob`. It has no `Bash`, `Write`, `Edit` or subagent access.
- The server stops two hours after the last tab closes, or immediately with `node floorplan/serve.mjs --stop`.

## Project files

Builds write only inside `floorplan/`. Floorplan does not inject instructions into `AGENTS.md`, `.kimi-code/`, Claude files or git ignore configuration. The map folder ignores itself and is not committed.

## Secrets

The Health check looks for passwords, API keys and private keys in code, and for `.env` files that would be committed. Findings contain only the file, line, kind and a masked hint. Secret values are never stored in the map or printed by Floorplan, and Kimi is instructed not to repeat them.

This is a helpful first pass, not a security audit.

## Reporting a vulnerability

Please report security problems privately as described in [SECURITY.md](../SECURITY.md), rather than in a public issue.
