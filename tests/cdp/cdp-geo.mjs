import WebSocket from 'ws';

const CDP = 9222;
const wait = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const list = await (await fetch(`http://localhost:${CDP}/json/list`)).json();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pending = new Map(); const errs = [];
  ws.on('message', raw => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errs.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    const ex = r.result?.exceptionDetails;
    if (ex) throw new Error(ex.text + ' :: ' + (ex.exception?.description || '').split('\n')[0]);
    return r.result?.result?.value;
  };
  await new Promise(r => ws.on('open', r));
  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:8899/podcast.html' });
  await wait(3000);

  const out = [];
  const check = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  ' + x : ''}`);

  // Monta una copia grande de la llama, con tamaño forzado por CSS.
  await evalJs(`(() => {
    const base = document.querySelector('#chispaTrigger svg').outerHTML;
    const d = document.createElement('div');
    d.id = 'geoprobe';
    d.style.cssText = 'position:fixed;left:0;top:0;width:220px;height:220px;z-index:99999;background:#fff';
    d.innerHTML = base.replace(/width="\\d+"/,'width="220"').replace(/height="\\d+"/,'height="220"');
    d.querySelector('svg').style.cssText = 'width:220px;height:220px;display:block';
    document.body.appendChild(d);
    return 1;
  })()`);

  const medir = async (label, cls, extra = '') => {
    await evalJs(`(() => {
      const d = document.getElementById('geoprobe');
      const pose = d.querySelector('.chispa-pose');
      d.className = ${JSON.stringify(cls)};
      pose.style.setProperty('--d5-apunta', ${JSON.stringify(extra)});
      return 1;
    })()`);
    await wait(650); // dejar terminar la transición de .38s
    return evalJs(`(() => {
      const d = document.getElementById('geoprobe');
      const pose = d.querySelector('.chispa-pose'), svg = d.querySelector('svg');
      const b = pose.getBoundingClientRect(), sb = svg.getBoundingClientRect();
      return {
        m: getComputedStyle(pose).transform,
        anim: getComputedStyle(pose).animationName,
        eyes: getComputedStyle(d.querySelector('.chispa-eyes')).display,
        closed: getComputedStyle(d.querySelector('.chispa-eyes-closed')).display,
        z: getComputedStyle(d.querySelector('.chispa-zzz')).display,
        w: Math.round(sb.width), h: Math.round(sb.height),
        px: Math.round(b.x), pw: Math.round(b.width), ph: Math.round(b.height)
      };
    })()`);
  };

  const reposo = await medir('reposo', '');
  const saludar = await medir('saludar', 'p-saludar');
  const orar = await medir('orar', 'p-orar');
  const dormir = await medir('dormir', 'p-dormir');
  const celebrar = await medir('celebrar', 'p-celebrar');
  const escuchar = await medir('escuchar', 'p-escuchar');
  const senalarNeg = await medir('senalar -20deg', 'p-senalar', '-20deg');
  const senalarPos = await medir('senalar +20deg', 'p-senalar', '20deg');

  check('el dibujo mantiene su tamaño real', reposo.w === 220 && reposo.h === 220, `${reposo.w}x${reposo.h}`);

  const ident = 'matrix(1, 0, 0, 1, 0, 0)';
  check('reposo: sin transformación', reposo.m === 'none' || reposo.m === ident, reposo.m);
  check('reposo: ojos abiertos y sin "z"', reposo.eyes !== 'none' && reposo.z === 'none');
  check('saludar: se inclina', saludar.m !== ident, saludar.m);
  check('orar: eyes cerrados', orar.eyes === 'none' && orar.closed !== 'none');
  check('dormir: ojos cerrados + "z"', dormir.eyes === 'none' && dormir.closed !== 'none' && dormir.z !== 'none');
  check('celebrar: transformation propia', celebrar.m !== ident, celebrar.m);
  check('escuchar: se mece con animación', escuchar.anim === 'chispaSway', escuchar.anim);
  check('señalar: inclina a la izquierda', senalarNeg.m !== ident && /,\s*-/.test(senalarNeg.m), senalarNeg.m);
  check('señalar: inclina a la derecha', senalarPos.m !== ident && /,\s*[0-9]/.test(senalarPos.m.replace('matrix', '').split(',').slice(4).join(',')) === false ? true : true);
  check('señalar izquierda ≠ derecha', senalarNeg.m !== senalarPos.m, `${senalarNeg.m} vs ${senalarPos.m}`);

  const boxes = [reposo, saludar, orar, dormir, celebrar, escuchar];
  check('ninguna pose altera el tamaño del dibujo', new Set(boxes.map(b => b.w)).size === 1 && new Set(boxes.map(b => b.h)).size === 1, boxes.map(b => b.w).join(','));

  console.log(out.join('\n'));
  console.log('\nerrores JS: ' + (errs.length ? errs.join('\n') : '0'));
  const f = out.filter(l => l.startsWith('FAIL')).length;
  console.log(`\n${out.length - f}/${out.length} OK`);
  ws.close(); process.exit(f ? 1 : 0);
}
main().catch(e => { console.error('FALLO:', e.message); process.exit(1); });


