// Builds must not inject agent instructions or rewrite a repository's local ignore rules.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { makeProject, scanAndBuild, cleanup } from './helpers.mjs';

test('scan and build leave instruction files and .git/info/exclude untouched', () => {
  const root = makeProject({
    'index.js': 'export const answer = 42;\n',
  }, {
    repos: ['.'],
    arch: { project: { name: 'Tiny', summary: 'Tiny app.' }, nodes: [{ id: 'app', label: 'App', kind: 'service', summary: 'The app.', paths: ['**'] }] },
  });
  try {
    const exclude = execFileSync('git', ['rev-parse', '--git-path', 'info/exclude'], { cwd: root, encoding: 'utf8' }).trim();
    const file = path.resolve(root, exclude);
    const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    scanAndBuild(root);
    const after = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    assert.equal(after, before);
    for (const name of ['AGENTS.md', 'CLAUDE.md', 'CLAUDE.local.md']) assert.equal(fs.existsSync(path.join(root, name)), false);
    assert.equal(fs.existsSync(path.join(root, '.kimi-code', 'AGENTS.md')), false);
  } finally { cleanup(root); }
});
