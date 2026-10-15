import WebSocket from 'ws';
const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const page = list.find(t => t.type === 'page' && t.url.includes('localhost:8899')) || list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
await new Promise(r => ws.on('open', r));
let id = 0; const pend = new Map(); let errs = [];
ws.on('message', raw => { const m = JSON.parse(raw);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description) || m.params.exceptionDetails.text); });
const send = (m, p = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  const x = r.result?.exceptionDetails; if (x) return 'EXC: ' + ((x.exception && x.exception.description) || x.text); return r.result?.result?.value; };
const wait = ms => new Promise(r => setTimeout(r, ms));
await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Page.bringToFront');

const paginas = ['index.html', 'podcast.html', 'muro-espiritual.html', 'universidades.html'];
const erroresDe = l => l.filter(e => /tailwind/i.test(String(e))).length;

// ---- A) CDN disponible
console.log('--- A) CDN disponible ---');
let fallos = 0;
for (const u of paginas) {
  errs = [];
  await send('Page.navigate', { url: `http://localhost:8899/${u}?cdn=ok` });
  for (let i = 0; i < 40; i++) { await wait(400); if (await ev('!!document.getElementById("chispaD5")') === true) break; }
  await wait(900);
  const cfg = await ev('!!(window.tailwind && window.tailwind.config && window.tailwind.config.theme && window.tailwind.config.theme.extend && window.tailwind.config.theme.extend.colors)');
  const marca = await ev(`!!(window.tailwind && window.tailwind.config && (window.tailwind.config.theme.extend.colors['primary-container']||'')==='#449bd1')`);
  const ok = cfg === true && marca === true && errs.length === 0;
  if (!ok) fallos++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${u.padEnd(24)} config=${cfg} color-marca=${marca} erroresJS=${errs.length}`);
}

// ---- B) CDN bloqueado: no debe haber ReferenceError
console.log('--- B) CDN bloqueado (debe fallar sin ReferenceError) ---');
await send('Network.setBlockedURLs', { urls: ['*cdn.tailwindcss.com*'] });
for (const u of ['index.html', 'contacto.html']) {
  errs = [];
  await send('Page.navigate', { url: `http://localhost:8899/${u}?cdn=ko` });
  for (let i = 0; i < 40; i++) { await wait(400); if (await ev('!!document.getElementById("chispaD5")') === true) break; }
  await wait(900);
  const twErr = erroresDe(errs);
  const tw = await ev('typeof window.tailwind');
  const ok = twErr === 0;
  if (!ok) fallos++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${u.padEnd(24)} window.tailwind=${tw} errores-tailwind=${twErr} (otros: ${errs.length - twErr})`);
}
await send('Network.setBlockedURLs', { urls: [] });

console.log(`\n${fallos === 0 ? 'TODO OK' : fallos + ' FALLAS'}`);
ws.close(); process.exit(fallos ? 1 : 0);