# Security policy

## Reporting a vulnerability

Please report security problems privately through GitHub: open the repository's **Security** tab and choose **Report a vulnerability**. Don't open a public issue.

Helpful details:
- what the problem is, and what someone could do with it;
- steps to reproduce it;
- your Floorplan version (see `kimi.plugin.json`).

You'll get a reply within a few days. Once a fix is out, you'll be credited unless you'd rather not be.

## Scope

In scope:
- the map's local server (`serve.mjs`);
- anything that could leak secrets or source code;
- writes outside the project's `floorplan/` folder;
- the read-only Kimi agent gaining shell or file-writing capabilities.

Out of scope: vulnerabilities in Kimi Code itself, which should be reported to Moonshot AI through the official channels.

## Supported versions

Only the latest release gets security fixes.
