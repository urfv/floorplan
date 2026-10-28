# Contributing to Floorplan

Thanks for helping. Bug reports, ideas and pull requests are welcome.

## Reporting a bug

[Open an issue](https://github.com/urfv/floorplan/issues/new/choose) and include:
- what you asked Kimi, and what happened;
- the output Kimi showed, especially lines starting with `✗` or `!`;
- your project's languages and frameworks, and whether it's one repo or several;
- your OS, Node and Kimi Code versions.

**Please don't paste private code, secrets, or screenshots of a private map.** Security problems go through [SECURITY.md](SECURITY.md), not public issues.

## Suggesting a feature

Open an issue describing what you were trying to do and what got in the way. Ideas that make the map clearer for non-engineers are especially welcome.

## Pull requests

1. Read [Developing Floorplan](docs/development.md) for the layout and local testing.
2. Branch from `main` as `fix/<short-name>` or `feat/<short-name>` and link the issue.
3. Keep changes focused: no dependencies, plain language, no secret values, generic examples.
4. Try the change on at least one real project. Add a regression sample for detection fixes.
5. Update `CHANGELOG.md` if people will notice the change.
6. Before opening the PR, run `npm test` and check a local installation with `/plugins info floorplan`.

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
