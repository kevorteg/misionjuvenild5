const port = process.argv[2] || '9226';
const url = process.argv[3] || 'http://localhost:5500/index.html';
async function main() {
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  const send = (method, params) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise(r => ws.addEventListener('open', r));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const evalJS = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.result.value;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url }); await sleep(1500);
  await evalJS("localStorage.setItem('mjd5-tour-v1','false')");
  await send('Page.reload'); await sleep(4500);
  const before = await evalJS(`(() => {
    const t = document.getElementById('chispaTrigger');
    const tour = document.getElementById('d5Tour');
    return JSON.stringify({
      touchAction: getComputedStyle(t).touchAction,
      tourHidden: tour ? tour.hidden : null,
      active: document.activeElement ? (document.activeElement.id || document.activeElement.getAttribute('data-tour') || document.activeElement.tagName) : null
    });
  })()`);
  console.log('BEFORE_ESC', before);
  await evalJS("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");
  await sleep(300);
  const afterEsc = await evalJS(`(() => {
    const tour = document.getElementById('d5Tour');
    const a = document.activeElement;
    return JSON.stringify({ tourHidden: tour ? tour.hidden : null, active: a ? (a.id || a.tagName) : null });
  })()`);
  console.log('AFTER_ESC', afterEsc);
  const drag = await evalJS(`(() => {
    const t = document.getElementById('chispaTrigger');
    const m = document.getElementById('chispaD5');
    const r = t.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const bottom0 = m.style.bottom || getComputedStyle(m).bottom;
    const opts = (x, y) => ({ pointerId: 1, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
    t.dispatchEvent(new PointerEvent('pointerdown', opts(cx, cy)));
    t.dispatchEvent(new PointerEvent('pointermove', opts(cx, cy - 60)));
    t.dispatchEvent(new PointerEvent('pointerup', opts(cx, cy - 60)));
    return JSON.stringify({ bottom0: bottom0, bottom1: m.style.bottom, right1: m.style.right });
  })()`);
  console.log('DRAG', drag);
  ws.close();
}
main().catch(e => { console.error('ERR', e); process.exit(1); });

