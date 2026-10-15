const port = process.argv[2] || '9223';
const url = process.argv[3] || 'http://localhost:5500/index.html';
const W = parseInt(process.argv[4] || '390', 10);
const H = parseInt(process.argv[5] || '844', 10);
async function main() {
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  const send = (method, params) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise(r => ws.addEventListener('open', r));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url }); await sleep(4000);
  const expr = `(() => {
    const m = document.getElementById('chispaD5');
    const t = document.getElementById('chispaTrigger');
    const menu = document.querySelector('.chispa-menu');
    const bub = document.querySelector('.chispa-bubble');
    const cs = getComputedStyle(m);
    const r = m.getBoundingClientRect();
    const rt = t.getBoundingClientRect();
    return JSON.stringify({
      innerH: window.innerHeight,
      el: { position: cs.position, display: cs.display, bottom: cs.bottom, top: cs.top, height: cs.height, transform: cs.transform, rectTop: Math.round(r.top), rectBottom: Math.round(r.bottom), rectHeight: Math.round(r.height), offsetHeight: m.offsetHeight },
      trigger: { rectTop: Math.round(rt.top), rectBottom: Math.round(rt.bottom), rectHeight: Math.round(rt.height) },
      menuDisplay: getComputedStyle(menu).display,
      bubbleDisplay: getComputedStyle(bub).display, bubbleHidden: bub.hidden
    });
  })()`;
  const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  console.log(res.result.result.value);
  ws.close();
}
main().catch(e => { console.error('ERR', e); process.exit(1); });

