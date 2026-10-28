// The local server listens only on this machine; every API requires the map's per-start header token.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { shopApp, scanAndBuild, cleanup } from './helpers.mjs';

let root, server, base, token;
before(async () => {
  root = shopApp();
  scanAndBuild(root);
  const port = 20000 + Math.floor(Math.random() * 20000);
  server = spawn(process.execPath, [path.join(root, 'floorplan', 'serve.mjs'), '--port', String(port), '--no-open'], {
    cwd: root, env: { ...process.env, FLOORPLAN_KIMI: path.join(root, 'no-such-cli') }, stdio: ['ignore', 'pipe', 'pipe'],
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

const api = (p, { headers = {}, ...opts } = {}) => fetch(base + p, { ...opts, headers: { 'content-type': 'application/json', ...headers } });

test('it listens on 127.0.0.1 only', () => {
  assert.match(base, /^http:\/\/127\.0\.0\.1:\d+$/);
});

test('the page it serves carries a fresh token', () => {
  assert.match(token || '', /^[0-9a-f]{32}$/);
});

test('API calls without the token are refused', async () => {
  assert.equal((await api('/api/flows')).status, 403);
  assert.equal((await api('/api/ask', { method: 'POST', body: '{"question":"hi"}' })).status, 403);
  assert.equal((await api('/api/flows', { headers: { 'x-floorplan-token': 'wrong' } })).status, 403);
});

test('API calls with the token from another website are refused', async () => {
  const r = await api('/api/flows', { headers: { 'x-floorplan-token': token, origin: 'https://evil.example' } });
  assert.equal(r.status, 403);
});

test('API calls with the token from the map itself work', async () => {
  const r = await api('/api/flows', { headers: { 'x-floorplan-token': token } });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { flows: [] });
});

test('SSE accepts only the header token, never a query token', async () => {
  assert.equal((await api('/api/events?token=' + token)).status, 403);
  const ctl = new AbortController();
  const r = await api('/api/events', { headers: { 'x-floorplan-token': token }, signal: ctl.signal });
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /text\/event-stream/);
  ctl.abort();
});

test('the removed waitlist API stays removed', async () => {
  const r = await api('/api/cloud/prompt', { headers: { 'x-floorplan-token': token } });
  assert.equal(r.status, 404);
});

test('files outside the map folder are never served', async () => {
  fs.mkdirSync(path.join(root, 'floorplan-old'));
  fs.writeFileSync(path.join(root, 'floorplan-old', 'notes.txt'), 'private notes');
  for (const p of ['/../shop-api/config.js', '/%2e%2e/shop-api/config.js', '/..%2fshop-api%2fconfig.js', '/..%2ffloorplan-old%2fnotes.txt']) {
    const r = await fetch(base + p);
    const body = await r.text();
    assert.equal(r.status, 404, p);
    assert.ok(!body.includes('DB_PASSWORD') && !body.includes('private notes'), `${p} -> ${r.status}`);
  }
  assert.equal((await fetch(base + '/graph.json')).status, 200);
});

test('a symlink cannot escape the map folder', { skip: process.platform === 'win32' }, async () => {
  fs.symlinkSync(path.join(root, 'shop-api', 'config.js'), path.join(root, 'floorplan', 'escape.txt'));
  const r = await fetch(base + '/escape.txt');
  assert.equal(r.status, 404);
  assert.ok(!(await r.text()).includes('DB_PASSWORD'));
});

test('a malformed address gets an error, and the server keeps running', async () => {
  assert.equal((await fetch(base + '/%E0%A4%A')).status, 400);
  assert.equal((await fetch(base + '/')).status, 200);
});

test('the served map contains no query-token EventSource or Cloud card', async () => {
  const html = await (await fetch(base + '/')).text();
  assert.doesNotMatch(html, /EventSource|api\/events\?token|cloud-card|Floorplan Cloud/);
});
