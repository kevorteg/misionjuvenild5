const port = process.argv[2] || '9227';
const base = process.argv[3] || 'http://localhost:5500';

const inject = `(function(){
  try { localStorage.setItem('mjd5-tour-v1','1'); localStorage.setItem('mjd5-tips-v1','1'); } catch(e){}
  var P = new URLSearchParams(location.search);
  function stub(q,v){ return { matches:v, media:q, addListener:function(){}, removeListener:function(){}, addEventListener:function(){}, removeEventListener:function(){}, onchange:null }; }
  var o = window.matchMedia ? window.matchMedia.bind(window) : null;
  window.matchMedia = function(q){
    if (P.has('coarse') && q.indexOf('pointer:coarse') >= 0) return stub(q, true);
    if (P.has('fine') && q.indexOf('pointer:coarse') >= 0) return stub(q, false);
    if (P.has('rm') && q.indexOf('prefers-reduced-motion') >= 0) return stub(q, true);
    return o ? o(q) : stub(q, false);
  };
})();`;

const inspect = `(function(){
  var m = document.getElementById('chispaD5');
  var menu = m ? m.querySelector('.chispa-menu') : null;
  var btns = menu ? Array.prototype.slice.call(menu.querySelectorAll('[data-act]')).map(function(b){return b.getAttribute('data-act');}) : [];
  var t = document.getElementById('chispaTrigger');
  return JSON.stringify({
    vida: !!window.__chispaVida,
    roam: localStorage.getItem('mjd5-roam'),
    display: m ? getComputedStyle(m).display : null,
    bottom: m ? m.style.bottom : null,
    pos: m ? (m.style.left + '|' + m.style.right) : null,
    scale: t ? t.style.scale : null,
    btns: btns
  });
})()`;

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = new Map(); const errors = [];
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errors.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description) || m.params.exceptionDetails.text);
  });
  const send = (method, params) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise(r => ws.addEventListener('open', r));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.result && r.result.exceptionDetails) return { error: r.result.exceptionDetails.text };
    return r.result && r.result.result ? r.result.result.value : r;
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: inject });

  async function nav(q, wait) {
    await send('Page.navigate', { url: base + '/index.html' + q });
    await sleep(wait || 4500);
  }

  // 1) Escritorio por defecto: roam ON + movimiento real
  await evalJs("localStorage.removeItem('mjd5-roam'); true");
  await nav('?fine=1');
  const p1 = await evalJs("document.getElementById('chispaD5').style.left + '|' + document.getElementById('chispaD5').style.right + '|' + document.getElementById('chispaD5').style.bottom");
  await sleep(10000);
  const p2 = await evalJs("document.getElementById('chispaD5').style.left + '|' + document.getElementById('chispaD5').style.right + '|' + document.getElementById('chispaD5').style.bottom");
  console.log('=== 1) Desktop default (roam ON) ===');
  console.log('pos t=4.5s:', p1);
  console.log('pos t=14.5s:', p2, '=> cambio:', p1 !== p2);
  console.log(await evalJs(inspect));

  // 2) Roam persistido OFF
  await evalJs("localStorage.setItem('mjd5-roam','false'); true");
  await nav('?fine=1');
  console.log('=== 2) Roam persistido OFF ===');
  console.log(await evalJs(inspect));

  // 3) Celular (pointer:coarse): default OFF + "Ven aquí"
  await evalJs("localStorage.removeItem('mjd5-roam'); true");
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await nav('?coarse=1');
  console.log('=== 3) Celular (pointer:coarse) default ===');
  console.log(await evalJs(inspect));

  // 4) Reduced motion: sin botones de movimiento
  await evalJs("localStorage.removeItem('mjd5-roam'); true");
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await nav('?fine=1&rm=1');
  console.log('=== 4) prefers-reduced-motion ===');
  console.log(await evalJs(inspect));

  // 5) Pausa al escribir: lanzar vuelo, enfocar campo y comprobar congelado
  await evalJs("localStorage.removeItem('mjd5-roam'); true");
  const pos = "document.getElementById('chispaD5').style.left + '|' + document.getElementById('chispaD5').style.right + '|' + document.getElementById('chispaD5').style.bottom";
  await send('Page.navigate', { url: base + '/muro-espiritual.html?fine=1' });
  await sleep(4500);
  await evalJs("document.body.dispatchEvent(new MouseEvent('dblclick',{clientX:220,clientY:320,bubbles:true})); true");
  await sleep(300);
  const field = await evalJs("(function(){var ta=document.querySelector('textarea,input');if(!ta)return 'NO_FIELD';ta.focus();return ta.tagName;})()");
  const a = await evalJs(pos);
  await sleep(1200);
  const b = await evalJs(pos);
  await evalJs("(function(){if(document.activeElement)document.activeElement.blur();return true;})()");
  await sleep(1400);
  const c = await evalJs(pos);
  console.log('=== 5) Pausa al escribir (muro) ===');
  console.log('campo:', field, '| enfocado', a, '->', b, '| pausado:', a === b, '| tras blur:', c, '| vuelve a moverse:', b !== c);

  console.log('ERRORES JS:', errors.length ? errors : 'ninguno');
  ws.close();
}
main().catch(e => { console.error('ERR', e); process.exit(1); });

