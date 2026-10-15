const port = process.argv[2] || '9222';
const url = process.argv[3] || 'http://localhost:5500/index.html';
const W = parseInt(process.argv[4] || '390', 10);
const H = parseInt(process.argv[5] || '844', 10);
const mobile = process.argv[6] !== 'desktop';

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  const send = (method, params) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise(r => ws.addEventListener('open', r));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send('Page.navigate', { url });
  await sleep(4000);
  const expr = `(async () => {
    const root = document.documentElement;
    const read = () => getComputedStyle(root).getPropertyValue('--d5-chispa-bottom').trim();
    const m = document.getElementById('chispaD5');
    const ms = m ? getComputedStyle(m) : null;
    const out = { viewport: window.innerWidth + 'x' + window.innerHeight, initialVar: read(), mascotaInlineBottom: m ? m.style.bottom : null, mascotaComputedBottom: ms ? ms.bottom : null, mascotaComputedRight: ms ? ms.right : null };
    const ps = document.getElementById('playerSection');
    if (ps) {
      ps.classList.remove('hidden');
      await new Promise(r => setTimeout(r, 300));
      const bar = document.getElementById('playerBar');
      out.afterOpenVar = read();
      out.barDistanceFromBottom = Math.round(window.innerHeight - bar.getBoundingClientRect().top);
      out.mascotaBottomAfterOpen = m ? Math.round(window.innerHeight - m.getBoundingClientRect().bottom) : null;
      ps.classList.add('hidden');
      await new Promise(r => setTimeout(r, 300));
      out.afterCloseVar = read();
      out.mascotaBottomAfterClose = m ? Math.round(window.innerHeight - m.getBoundingClientRect().bottom) : null;
    }
    return JSON.stringify(out);
  })()`;
  const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  console.log(res.result && res.result.result ? res.result.result.value : JSON.stringify(res));
  ws.close();
}
main().catch(e => { console.error('ERR', e); process.exit(1); });

