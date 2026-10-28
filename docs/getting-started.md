# Getting started

## What you need

- **[Kimi Code](https://www.kimi.com/code/docs/en/)** with a signed-in account.
- **[Node.js](https://nodejs.org) 18 or newer.** Check with `node --version`.
- The **Kimi Code CLI** for Ask and generated flows. The static map itself works without it.

## Install

Inside Kimi Code, run:

```text
/plugins install https://github.com/urfv/floorplan
```

Then run `/reload` or start a new session. You can check installation with `/plugins list` and diagnostics with `/plugins info floorplan`.

## Make your first map

1. **Open your project.** In a terminal, run `kimi` from the project folder. If your app is split across several repos, open the folder that contains them all so Floorplan can connect requests between them.

2. **Ask for it:**
   > Make me a floorplan of this app.

   You can also invoke `/skill:floorplan:floorplan` explicitly.

3. **Let Kimi work.** A local scan lists files, imports, endpoints and requests without using tokens. Kimi reads the important files, decides the architecture, and writes plain-language descriptions. The build checks connections, Health and screens. Large projects may be split across parallel helpers.

4. **Look around.** The map opens in your browser with a short **Start here** tour. Kimi's response summarizes the architecture and points out serious Health findings.

See [Using the map](using-the-map.md) for everything you can do.

## Keep it up to date

After you or Kimi have worked on the code, ask:

> Update the floorplan.

Floorplan re-scans and compares with the last map. Moved files keep descriptions, deleted ones disappear, and Kimi rewrites only new or changed entries. Open maps reload, and changed cards appear under **Recent work**.

## Open the map yourself

From the codebase root:

```bash
node floorplan/serve.mjs
```

This serves the map at `http://127.0.0.1:4378` (or the next free port) with Ask enabled. You can also double-click `floorplan/index.html`; everything except Ask and generated flows works offline.

The background server stops two hours after the last tab closes. Stop it sooner with:

```bash
node floorplan/serve.mjs --stop
```

## Update or remove the plugin

To update, reinstall the current repository and reload:

```text
/plugins install https://github.com/urfv/floorplan
/reload
```

To remove it, use `/plugins remove floorplan`. Delete the `floorplan/` folder from any project where you no longer want a map. No agent instruction files need cleanup because Floorplan never creates them.
