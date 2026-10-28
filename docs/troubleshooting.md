# Troubleshooting

### The Ask bar says it needs the Kimi Code CLI
Install [Kimi Code](https://www.kimi.com/code/docs/en/), sign in with `kimi login`, then run `node floorplan/serve.mjs` from the codebase root. Opening `index.html` directly provides only the offline map, without Ask or generated flows.

### The CLI is installed but isn't found
`serve.mjs` looks for `kimi` on your PATH and in `~/.local/bin`. If it lives somewhere else:

```bash
node floorplan/serve.mjs --kimi /path/to/kimi
```

### Ask says you aren't signed in
Run `kimi login` in a terminal and try again. To select another configured model, start the server with `--model <alias>`.

### `node` isn't recognized
Install [Node.js](https://nodejs.org) 18 or newer, then start a new Kimi session so it picks up the updated PATH.

### The skill doesn't show up
Run `/plugins list` to check that Floorplan is installed and enabled, then `/reload` or start a new session. `/plugins info floorplan` shows manifest diagnostics. Plain requests like "make me a floorplan" work automatically; the explicit form is `/skill:floorplan:floorplan`.

### The map looks out of date
Ask Kimi to "update the floorplan". An open tab reloads when the update finishes.

### The map is blank, or stuck on "Laying out"
Rebuild the map. Current maps embed the layout engine and fonts and work offline; maps made by upstream versions before 0.1.3 may still load old external resources until rebuilt.

### A connection is missing
Floorplan uses static pattern matching, so it can miss requests whose address exists only in settings. Ask Kimi to add the connection; it is recorded in `architecture.json` and kept on updates.

### A file is in the wrong part, or under "Unassigned"
Ask Kimi to move it, or edit `paths` in `floorplan/architecture.json` and request an update.

### "floorplan/ already exists here and isn't a map"
Your project has its own folder called `floorplan`, which Floorplan won't overwrite. Rename it, or ask Kimi to build elsewhere; scan and build accept `--out <folder>`.

### `git status` shows files under `floorplan/`
They were committed before Floorplan started ignoring the folder. Untrack them while keeping the files:

```bash
git rm -r --cached floorplan
```

### Port 4378 is in use
Nothing to do. The server chooses the next free port; use the URL it prints.

### Stopping the background server

```bash
node floorplan/serve.mjs --stop
```

It also stops two hours after the last tab closes.

### Still stuck?
[Open an issue](https://github.com/urfv/floorplan/issues/new/choose) with what you asked, what happened and the output Kimi showed. Leave out private code and secrets.
