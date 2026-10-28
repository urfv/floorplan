// Kimi integration: real HTTP/SSE through serve.mjs, with a deterministic fake Kimi JSONL process.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { shopApp, scanAndBuild, cleanup, readJson } from './helpers.mjs';

let root, server, base, token, fake;
before(async () => {
  root = shopApp();
  scanAndBuild(root);
  fake = path.join(root, 'fake-kimi.mjs');
  fs.writeFileSync(fake, `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
if (args.includes('--version')) { console.log('9.9.9'); process.exit(0); }
fs.writeFileSync(path.join(here, 'kimi-argv.json'), JSON.stringify(args));
console.log(JSON.stringify({ role: 'assistant', tool_calls: [{ function: { name: 'Read', arguments: JSON.stringify({ path: 'floorplan/.cache/kimi-ask-context.md' }) } }] }));
console.log(JSON.stringify({ role: 'assistant', content: JSON.stringify({ title: 'Shop answer', answer: 'The server handles orders.', items: [{ id: 'n:api', note: 'Server part' }], steps: [], followups: ['What handles notes?'] }) }));
console.log(JSON.stringify({ role: 'meta', type: 'session.resume_hint', session_id: 'session_test' }));
`);
  const port = 20000 + Math.floor(Math.random() * 20000);
  server = spawn(process.execPath, [path.join(root, 'floorplan', 'serve.mjs'), '--port', String(port), '--no-open', '--kimi', fake], {
    cwd: root, env: process.env, stdio: ['ignore', 'pipe', 'pipe'],
  });
  base = await new Promise((resolve, reject) => {
    let out = '';
    const timer = setTimeout(() => reject(new Error(`server didn't start: ${out}`)), 20000);
    server.stdout.on('data', (d) => { out += d; const m = /Floorplan: (http:\/\/\S+)/.exec(out); if (m) { clearTimeout(timer); resolve(m[1]); } });
    server.on('exit', (code) => reject(new Error(`server exited (${code}): ${out}`)));
  });
  token = /"token":"([0-9a-f]+)"/.exec(await (await fetch(base + '/')).text())?.[1];
});
after(async () => {
  if (server && server.exitCode === null) await new Promise((resolve) => { server.once('exit', resolve); server.kill(); });
  cleanup(root);
});

async function ask(question, session) {
  const r = await fetch(base + '/api/ask', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-floorplan-token': token }, body: JSON.stringify({ question, session }),
  });
  assert.equal(r.status, 200);
  const events = [...(await r.text()).matchAll(/event: (\w+)\ndata: (.*)\n/g)].map(([, event, data]) => ({ event, data: JSON.parse(data) }));
  return events;
}

test('health discovers the configured Kimi CLI and version', async () => {
  const r = await fetch(base + '/api/health', { headers: { 'x-floorplan-token': token } });
  assert.deepEqual(await r.json(), { cli: true, version: '9.9.9', path: fake });
});

test('the generated Kimi agent is read-only and cannot delegate', () => {
  const agent = fs.readFileSync(path.join(root, 'floorplan', '.cache', 'kimi-agent.md'), 'utf8');
  for (const tool of ['Read', 'Grep', 'Glob']) assert.match(agent, new RegExp(`  - ${tool}$`, 'm'));
  for (const tool of ['Bash', 'Write', 'Edit', 'Agent']) assert.doesNotMatch(agent, new RegExp(`  - ${tool}$`, 'm'));
  assert.match(agent, /^subagents: \[\]$/m);
  const serve = fs.readFileSync(path.join(root, 'floorplan', 'serve.mjs'), 'utf8');
  assert.doesNotMatch(serve, /new Function|\beval\s*\(|waitlist|Floorplan Cloud/i);
  assert.doesNotMatch(serve, /ComSpec|cmd\.exe|powershell/i, 'prompts must never pass through a command shell');
});

test('Kimi JSONL becomes progress and a structured SSE answer with a session', async () => {
  const events = await ask('What handles orders?');
  assert.ok(events.some((e) => e.event === 'progress' && e.data.text.includes('Reading')));
  const answer = events.find((e) => e.event === 'answer')?.data;
  assert.equal(answer.title, 'Shop answer');
  assert.equal(answer.items[0].id, 'n:api');
  assert.equal(answer.session, 'session_test');
  const args = readJson(path.join(root, 'kimi-argv.json'));
  assert.ok(args.includes('--agent-file'));
  assert.ok(args.includes('-p'));
  assert.deepEqual(args.slice(-2), ['--output-format', 'stream-json']);
  for (const flag of ['--json-schema', '--append-system-prompt', '--allowedTools', '--session']) assert.ok(!args.includes(flag), flag);
});

test('a follow-up resumes Kimi without rebinding the agent', async () => {
  const events = await ask('Tell me more', 'session_test');
  assert.equal(events.find((e) => e.event === 'answer')?.data.session, 'session_test');
  const args = readJson(path.join(root, 'kimi-argv.json'));
  const i = args.indexOf('--session');
  assert.equal(args[i + 1], 'session_test');
  assert.ok(!args.includes('--agent-file'));
});
