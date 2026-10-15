import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9236;
const BASE = 'http://localhost:5500/';
const profile = mkdtempSync(join(tmpdir(), 'cdp-alert-'));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--window-size=1400,1000', 'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getWs() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error('no CDP');
}

let id = 0, ws, pending = new Map();
const errors = [];
const loadWaiters = [];
function send(method, params = {}) {
  return new Promise((res, rej) => { const mid = ++id; pending.set(mid, { res, rej }); ws.send(JSON.stringify({ id: mid, method, params })); });
}
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) return { error: r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || '') };
  return { value: r.result.value };
}
async function nav(url) {
  const loaded = new Promise(res => loadWaiters.push(res));
  await send('Page.navigate', { url });
  await Promise.race([loaded, sleep(8000)]);
  await sleep(600);
}

const results = [];
const ok = (n, c, extra = '') => { results.push(`${c ? 'PASS' : 'FAIL'}  ${n}${extra ? '  -> ' + extra : ''}`); };

(async () => {
  const wsUrl = await getWs();
  ws = new WebSocket(wsUrl);
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error');
    else if (m.method === 'Page.loadEventFired') { const r = loadWaiters.shift(); if (r) r(); }
  });
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });

  await nav(BASE + 'muro-espiritual.html');

  const t = await ev('typeof window.D5Alert');
  ok('D5Alert definido', t.value === 'function', String(t.value));

  const overridden = await ev('window.alert !== (window.origAlert) && typeof window.alert === "function"');
  ok('window.alert sobreescrito', overridden.value === true);

  const before = await ev('!!document.querySelector(".d5a-overlay")');
  ok('sin overlay antes', before.value === false);

  await ev(`alert('\\u00a1Tu petici\\u00f3n ha sido colocada en el Muro Espiritual!')`);
  await sleep(400);

  const box = await ev(`(function(){var o=document.querySelector('.d5a-overlay');if(!o)return null;var c=o.querySelector('.d5a-card');return {msg:o.querySelector('[data-msg]').textContent,title:o.querySelector('[data-title]').textContent,btn:o.querySelector('[data-ok]').textContent,color:getComputedStyle(o.querySelector('.d5a-top')).backgroundColor,radius:getComputedStyle(c).borderRadius};})()`);
  ok('overlay creado', !!box.value, JSON.stringify(box.value));
  ok('mensaje correcto', box.value && /colocada en el Muro/.test(box.value.msg));
  ok('tipo success (naranja)', box.value && box.value.color === 'rgb(245, 134, 52)', box.value && box.value.color);
  ok('esquinas cuadradas', box.value && box.value.radius === '0px', box.value && box.value.radius);

  const visible = await ev(`getComputedStyle(document.querySelector('.d5a-overlay')).opacity`);
  ok('overlay visible', visible.value === '1', String(visible.value));

  await ev(`document.querySelector('.d5a-btn').click()`);
  await sleep(400);
  const after = await ev('!!document.querySelector(".d5a-overlay")');
  ok('overlay se cierra', after.value === false);

  const conf = await ev(`(function(){var p=D5Alert.confirm('Te vas a unir, ¿seguro?','SÍ, VAMOS','AÚN NO');document.querySelector('[data-cancel]').click();return p;})()`);
  await sleep(200);
  ok('confirm devuelve false al cancelar', conf.value === false, String(conf.value));

  ok('sin errores JS', errors.length === 0, errors.join(' | '));

  console.log('\n=== RESULTADOS d5-alert ===');
  for (const r of results) console.log(r);
  const failed = results.filter(r => r.startsWith('FAIL')).length;
  console.log(`\n${results.length - failed}/${results.length} PASS`);

  ws.close(); chrome.kill();
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('ERROR', e); chrome.kill(); process.exit(1); });

