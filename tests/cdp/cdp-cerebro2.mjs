import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9234;
const BASE = 'http://localhost:5500/';
const profile = mkdtempSync(join(tmpdir(), 'cdp-cb2-'));

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
async function reset() { await ev(`window.ChispaD5 && window.ChispaD5.reset && window.ChispaD5.reset()`); }
function bubbleExpr() { return `(function(){var b=document.querySelector('#chispaD5 .chispa-bubble');return b?{hidden:b.hidden,text:b.querySelector('span').textContent}:null;})()`; }

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

// ---- A) quienes-somos: page/voice/mascota + llegada ----
await nav(BASE + 'quienes-somos.html');
let r = await ev(`window.ChispaD5 && window.ChispaD5.page`);
check('ChispaD5.page', r.value === 'quienes-somos', r.value);
r = await ev(`window.ChispaD5.voice()`);
check('TTS default off', r.value === false, r.value);
r = await ev(`!!document.getElementById('chispaD5')`);
check('mascota presente', r.value === true, r.value);
r = await ev(`sessionStorage.getItem('mjd5-greet')`);
check('saludo marcado en sesi\u00f3n', r.value === '1', r.value);
await sleep(11000);
r = await ev(bubbleExpr());
check('llegada qui\u00e9nes-somos', r.value && /conoc|historia|D5|empezamos|volvamos|estamos/i.test(r.value.text), JSON.stringify(r.value));

// ---- B) podcast: reacci\u00f3n solo al primer play ----
await nav(BASE + 'podcast.html');
await reset();
// el saludo no debe repetirse en una p\u00e1gina nueva
r = await ev(bubbleExpr());
check('saludo no se repite entre p\u00e1ginas', !(r.value && /Soy Chispa, tu gu\u00eda/.test(r.value.text)), JSON.stringify(r.value));
r = await ev(`(function(){window.dispatchEvent(new CustomEvent('d5:podcast',{detail:{action:'play'}}));var b=document.querySelector('#chispaD5 .chispa-bubble span');return b?b.textContent:null;})()`);
check('reacci\u00f3n primer play', /episodio|espero|acompa|audio/i.test(r.value || ''), r.value);
const firstText = r.value;
await reset();
r = await ev(`(function(){window.dispatchEvent(new CustomEvent('d5:podcast',{detail:{action:'pause'}}));var b=document.querySelector('#chispaD5 .chispa-bubble span');return b?b.textContent:null;})()`);
check('silencio en pausa', r.value === firstText || !/paus|espero/i.test(r.value || ''), r.value);

// ---- C) prioridad: vers\u00edculo (4) no se interrumpe por acci\u00f3n (3) ----
await reset();
r = await ev(`(function(){window.ChispaD5.say('VERSO ALTO',9000,4);window.dispatchEvent(new CustomEvent('d5:video',{detail:{action:'open'}}));var b=document.querySelector('#chispaD5 .chispa-bubble span');return b.textContent;})()`);
check('vers\u00edculo no interrumpido (4>3)', r.value === 'VERSO ALTO', r.value);

// ---- D) video ----
await reset();
await ev(`document.querySelector('#chispaD5 .chispa-bubble').hidden = true`);
r = await ev(`(function(){window.dispatchEvent(new CustomEvent('d5:video',{detail:{action:'open'}}));var b=document.querySelector('#chispaD5 .chispa-bubble span');return b?b.textContent:null;})()`);
check('reacci\u00f3n video', /video|pongamos|pantalla|aqu\u00ed lo veo/i.test(r.value || ''), r.value);

// ---- E) FAQ ----
await nav(BASE + 'preguntas-frecuentes.html');
await reset();
r = await ev(`(function(){var s=document.querySelector('details summary');if(!s)return 'no-summary';s.click();return true;})()`);
await sleep(500);
r = await ev(bubbleExpr());
check('reacci\u00f3n FAQ', r.value && /pregunta|cl\u00e1sica|preguntes/i.test(r.value.text), JSON.stringify(r.value));

// ---- F) limitador contextual (25 s / 2 por min) ----
await reset();
await ev(`document.querySelector('#chispaD5 .chispa-bubble').hidden = true`);
await ev(`window.dispatchEvent(new CustomEvent('d5:video',{detail:{action:'open'}}))`);
await sleep(900);
await ev(`document.querySelector('#chispaD5 .chispa-bubble').hidden = true`);
await ev(`window.dispatchEvent(new CustomEvent('d5:video',{detail:{action:'close'}}))`);
await sleep(300);
r = await ev(`document.querySelector('#chispaD5 .chispa-bubble').hidden`);
check('limitador bloquea 2\u00aa reacci\u00f3n <25s', r.value === true, r.value);

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

