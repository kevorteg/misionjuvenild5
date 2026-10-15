import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9237;
const BASE = 'http://localhost:5500/';
const profile = mkdtempSync(join(tmpdir(), 'cdp-shot-'));
const out = 'C:\\Users\\Home\\AppData\\Local\\Temp\\opencode\\alert-success.png';
const out2 = 'C:\\Users\\Home\\AppData\\Local\\Temp\\opencode\\alert-confirm.png';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--window-size=460,720', 'about:blank'
], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getWs() { for (let i = 0; i < 50; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/list`); const l = await r.json(); const p = l.find(t => t.type === 'page'); if (p) return p.webSocketDebuggerUrl; } catch {} await sleep(200); } throw new Error('no CDP'); }

let id = 0, ws, pending = new Map();
function send(m, p = {}) { return new Promise((res, rej) => { const mid = ++id; pending.set(mid, { res, rej }); ws.send(JSON.stringify({ id: mid, method: m, params: p })); }); }
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); return r.result?.value; }

(async () => {
  ws = new WebSocket(await getWs());
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 460, height: 720, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: BASE + 'muro-espiritual.html' });
  await sleep(1500);

  await ev(`alert('\\u00a1Tu petici\\u00f3n ha sido colocada en el Muro Espiritual!')`);
  await sleep(500);
  let s = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(out, Buffer.from(s.data, 'base64'));

  await ev(`document.querySelector('.d5a-btn').click()`);
  await sleep(400);
  await ev(`D5Alert.confirm('\\u00bfQuieres unirte al equipo de la Misi\\u00f3n Juvenil D5?','S\\u00cd, VAMOS','A\\u00daN NO')`);
  await sleep(500);
  s = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(out2, Buffer.from(s.data, 'base64'));

  console.log('saved');
  ws.close(); chrome.kill();
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
  process.exit(0);
})().catch(e => { console.error(e); chrome.kill(); process.exit(1); });

