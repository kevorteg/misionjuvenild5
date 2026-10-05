/**
 * shot-chispa-poses.mjs — Exporta cada pose de Chispa a PNG para Photoshop.
 *
 * Monta una hoja de contactos con todas las poses sobre la hoja real (usa el
 * CSS que ya inyecta experiencia-d5.js), así lo que se ve en el PNG es
 * exactamente lo que se ve en el sitio.
 *
 * Uso:
 *   node tools/shot-chispa-poses.mjs [baseUrl] [puertoCDP]
 *   node tools/shot-chispa-poses.mjs http://localhost:8899 9222
 *
 * Requiere un Chrome con --remote-debugging-port abierto.
 */
import WebSocket from 'ws';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:8899';
const CDP = process.argv[3] || '9222';
const OUT = resolve('media/chispa/poses');

const POSES = [
  { id: 'reposo', label: 'Reposo (base)' },
  { id: 'saludar', label: 'Saludar' },
  { id: 'orar', label: 'Orar' },
  { id: 'dormir', label: 'Dormir' },
  { id: 'senalar', label: 'Señalar' },
  { id: 'celebrar', label: 'Celebrar' },
  { id: 'escuchar', label: 'Escuchar' }
];

function connect(url) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(url, { perMessageDeflate: false });
    ws.on('open', () => res(ws));
    ws.on('error', rej);
  });
}

async function main() {
  const list = await (await fetch(`http://localhost:${CDP}/json/list`)).json();
  const target = list.find(t => t.type === 'page');
  if (!target) throw new Error('No hay ninguna pestaña en Chrome.');
  const ws = await connect(target.webSocketDebuggerUrl);

  let id = 0;
  const pending = new Map();
  ws.on('message', raw => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  const send = (method, params = {}) => new Promise(r => {
    const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params }));
  });
  const evalJs = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    const ex = r.result?.exceptionDetails;
    if (ex) throw new Error(ex.text + ' :: ' + (ex.exception?.description || '').split('\n')[0]);
    return r.result?.result?.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: BASE + '/index.html' });
  await new Promise(r => setTimeout(r, 3200));

  // El SVG real del sitio: es la única fuente de verdad del arte.
  const svg = await evalJs(`(document.querySelector('#chispaTrigger svg')||{}).outerHTML || ''`);
  if (!svg) throw new Error('No se encontró a Chispa en ' + BASE + '/index.html');

  await evalJs(`(() => {
    const svgs = ${JSON.stringify(svg)};
    const poses = ${JSON.stringify(POSES)};
    const d = document.createElement('div');
    d.id = 'd5shot';
    d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#ffffff;'
      + 'display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:28px;'
      + "font-family:'Nunito Sans',sans-serif";
    d.innerHTML = poses.map(p =>
      '<div style="border:2px solid #E5E5E5;padding:14px;text-align:center">'
      + '<div class="p-' + p.id + '" style="display:inline-block;width:190px;height:190px">'
      + svgs.replace('width="72" height="72"', 'width="190" height="190"')
      + '</div>'
      + '<div style="font-size:11px;font-weight:800;letter-spacing:.08em;'
      + 'text-transform:uppercase;color:#4E575F;margin-top:8px">' + p.label + '</div>'
      + '</div>'
    ).join('');
    document.body.appendChild(d);
    document.documentElement.style.setProperty('border-radius', '0', 'important');
    return d.children.length;
  })()`);

  await new Promise(r => setTimeout(r, 900)); // dejar asentar las transiciones

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1180, height: 760, deviceScaleFactor: 2, mobile: false
  });
  await new Promise(r => setTimeout(r, 400));

  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  mkdirSync(OUT, { recursive: true });
  const file = resolve(OUT, 'chispa-poses-contact-sheet.png');
  writeFileSync(file, Buffer.from(shot.result.data, 'base64'));

  // SVG sueltos por pose, para abrir en Photoshop/Illustrator.
  mkdirSync(resolve(OUT, 'svg'), { recursive: true });
  for (const p of POSES) {
    const one = await evalJs(`(() => {
      const s = document.querySelector('.p-${p.id} svg').cloneNode(true);
      s.setAttribute('width', '512'); s.setAttribute('height', '512');
      return new XMLSerializer().serializeToString(s);
    })()`);
    writeFileSync(resolve(OUT, 'svg', `chispa-${p.id}.svg`), one, 'utf8');
  }

  console.log('OK  ' + POSES.length + ' poses exportadas');
  console.log('    ' + file);
  console.log('    ' + resolve(OUT, 'svg') + '/*.svg');
  ws.close();
  process.exit(0);
}

main().catch(e => { console.error('FALLO:', e.message); process.exit(1); });