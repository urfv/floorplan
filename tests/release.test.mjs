// Release hygiene: the Kimi plugin manifest, README badge and changelog agree on the version.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REPO, SKILL, readJson } from './helpers.mjs';

const plugin = readJson(path.join(REPO, 'kimi.plugin.json'));
const read = (p) => fs.readFileSync(path.join(REPO, p), 'utf8');

test('the Kimi plugin version is a semantic version', () => {
  assert.match(plugin.version, /^\d+\.\d+\.\d+$/);
});

test('the Kimi manifest exposes this repository\'s skills', () => {
  assert.equal(plugin.name, 'floorplan');
  assert.equal(plugin.skills, './skills/');
  assert.match(plugin.homepage, /^https:\/\/github\.com\/urfv\/floorplan$/);
});

test('the README version badge matches kimi.plugin.json', () => {
  assert.match(read('README.md'), new RegExp(`badge/version-${plugin.version.replaceAll('.', '\\.')}-`));
});

test('the changelog has an entry for this version', () => {
  assert.match(read('CHANGELOG.md'), new RegExp(`^## ${plugin.version.replaceAll('.', '\\.')} \\(\\d{4}-\\d{2}-\\d{2}\\)$`, 'm'));
});

test('the skill uses native Kimi placeholders and every file it points to exists', () => {
  const skill = fs.readFileSync(path.join(SKILL, 'SKILL.md'), 'utf8');
  assert.match(skill, /^---\nname: floorplan\ndescription: .{50,}/);
  assert.match(skill, /\$\{KIMI_SKILL_DIR\}/);
  assert.doesNotMatch(skill, /CLAUDE_SKILL_DIR|CLAUDE\.local\.md|window\.claude/);
  for (const [, ref] of skill.matchAll(/\]\((references\/[\w.-]+\.md)/g)) assert.ok(fs.existsSync(path.join(SKILL, ref)), ref);
  for (const [, script] of skill.matchAll(/scripts\/(\w+\.mjs)/g)) assert.ok(fs.existsSync(path.join(SKILL, 'scripts', script)), script);
});
