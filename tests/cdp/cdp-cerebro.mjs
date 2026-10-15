import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9233;
const BASE = 'http://localhost:5500/';
const profile = mkdtempSync(join(tmpdir(), 'cdp-cb-'));

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
  return new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
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
  for (let i = 0; i < 40; i++) {
    const t = await ev('typeof window.ChispaD5');
    if (t.value === 'object') break;
    await sleep(200);
  }
  await sleep(400);
}

const wsUrl = await getWs();
ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
ws.onmessage = (evt) => {
  const msg = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.data.toString());
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id); pending.delete(msg.id);
    if (msg.error) p.rej(new Error(JSON.stringify(msg.error))); else p.res(msg.result);
  } else if (msg.method === 'Page.loadEventFired') {
    loadWaiters.splice(0).forEach(fn => fn());
  } else if (msg.method === 'Runtime.exceptionThrown') {
    errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
  } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    errors.push('console.error: ' + msg.params.args.map(a => a.value || a.description).join(' '));
  }
};
await send('Runtime.enable');
await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });

const results = [];
function check(name, ok, detail) { results.push({ name, ok, detail }); }

// ---- A) quienes-somos: llegada + page + voice off ----
await nav(BASE + 'quienes-somos.html');
let r = await ev(`window.ChispaD5 && window.ChispaD5.page`);
check('ChispaD5.page', r.value === 'quienes-somos', r.value);
r = await ev(`window.ChispaD5.voice()`);
check('TTS default off (voice() false)', r.value === false, r.value);
r = await ev(`!!document.getElementById('chispaD5')`);
check('mascota presente', r.value === true, r.value);
await sleep(11000);
r = await ev(`(function(){var b=document.querySelector('#chispaD5 .chispa-bubble');return b?{hidden:b.hidden,text:b.querySelector('span').textContent}:null;})()`);
check('llegada qui\u00e9nes-somos', r.value && !r.value.hidden && /conoc|historia|D5|gusta/i.test(r.value.text), JSON.stringify(r.value));

// ---- B) podcast: reacci\u00f3n a evento + prioridad ----
await nav(BASE + 'podcast.html');
r = await ev(`(function(){window.dispatchEvent(new CustomEvent('d5:podcast',{detail:{action:'play'}}));var b=document.querySelector('#chispaD5 .chispa-bubble span');return b?b.textContent:null;})()`);
check('reacci\u00f3n d5:podcast play', /escuch|fuego|atenci\u00f3n|o\u00eddo/i.test(r.value || ''), r.value);
await sleep(400);
await sleep(1500);
r = await ev(`(function(){window.ChispaD5.say('VERSO ALTO',9000,4);window.dispatchEvent(new CustomEvent('d5:podcast',{detail:{action:'ended'}}));var b=document.querySelector('#chispaD5 .chispa-bubble span');return b.textContent;})()`);
check('vers\u00edculo no interrumpido (prio 4>3)', r.value === 'VERSO ALTO', r.value);

// ---- C) video ----
await nav(BASE + 'index.html');
r = await ev(`(function(){window.dispatchEvent(new CustomEvent('d5:video',{detail:{action:'open'}}));var b=document.querySelector('#chispaD5 .chispa-bubble span');return b?b.textContent:null;})()`);
check('reacci\u00f3n d5:video open', /video|pongamos|pantalla|modelo/i.test(r.value || ''), r.value);

// ---- D) FAQ toggle ----
await nav(BASE + 'preguntas-frecuentes.html');
r = await ev(`(function(){var s=document.querySelector('details summary');if(!s)return 'no-summary';s.click();return true;})()`);
await sleep(500);
r = await ev(`(function(){var b=document.querySelector('#chispaD5 .chispa-bubble span');return b?b.textContent:null;})()`);
check('reacci\u00f3n FAQ abrir', /pregunta|cl\u00e1sica|preguntes|gusta/i.test(r.value || ''), r.value);

// ---- E) filtro (click category) ----
await nav(BASE + 'podcast.html');
await sleep(8000);
r = await ev(`(function(){var c=document.querySelector('.category-btn');if(!c)return 'no-btn';c.click();var b=document.querySelector('#chispaD5 .chispa-bubble span');return b?b.textContent:null;})()`);
check('reacci\u00f3n filtro', /tem\u00e1tica|tema|elecci\u00f3n/i.test(r.value || ''), r.value);

// ---- resumen ----
console.log('\n=== RESULTADOS ===');
let fail = 0;
for (const t of results) { console.log((t.ok ? 'PASS ' : 'FAIL ') + t.name + (t.ok ? '' : '  -> ' + t.detail)); if (!t.ok) fail++; }
console.log('\nErrores JS: ' + errors.length);
errors.slice(0, 12).forEach(e => console.log('  ! ' + e));
console.log('\nTOTAL: ' + (results.length - fail) + '/' + results.length);

ws.close();
chrome.kill();
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(fail || errors.length ? 1 : 0);

