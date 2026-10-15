import WebSocket from 'ws';

const CDP_PORT = 9222;

async function main() {
  const base = `http://localhost:${CDP_PORT}`;
  const list = await (await fetch(`${base}/json/list`)).json();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pending = new Map(); const logs = []; const errors = [];
  ws.on('message', raw => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.consoleAPICalled') logs.push(m.params.args.map(a => a.value ?? a.description).join(' '));
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || ''));
  });
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    const ex = r.result?.exceptionDetails;
    if (ex) throw new Error(ex.text + ' :: ' + (ex.exception?.description || '').split('\n')[0]);
    return r.result?.result?.value;
  };
  await new Promise(r => ws.on('open', r));
  await send('Runtime.enable'); await send('Page.enable'); await send('Console.enable');

  const out = [];
  const check = (name, cond, extra = '') => { out.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); return cond; };

  async function load(url) {
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 2600));
  }

    // ---- 1. Home: la capa de poses existe y no rompe el parpadeo
  await load('http://localhost:8899/index.html');
  const s1 = await evalJs(`(() => {
    const svg = document.querySelector('#chispaTrigger svg');
    const pose = svg && svg.querySelector('.chispa-pose');
    const eyes = svg && svg.querySelector('.chispa-eyes');
    const closed = svg && svg.querySelector('.chispa-eyes-closed');
    return {
      hasSvg: !!svg, hasPose: !!pose,
      poseParentIsBody: pose ? pose.parentElement.classList.contains('chispa-body') : false,
      flickerInsidePose: !!(pose && pose.querySelector('.chispa-flicker')),
      eyesInsidePose: !!(pose && pose.querySelector('.chispa-eyes')),
      closedExists: !!closed,
      closedHidden: closed ? getComputedStyle(closed).display === 'none' : null,
      eyesVisible: eyes ? getComputedStyle(eyes).display !== 'none' : null,
      eyesStillAnimating: eyes ? getComputedStyle(eyes).animationName : null,
      bodyStillAnimating: svg ? getComputedStyle(svg.querySelector('.chispa-body')).animationName : null,
      poses: window.ChispaD5 ? window.ChispaD5.poses() : null
    };
  })()`);
  check('capa .chispa-pose dentro de .chispa-body', s1.poseParentIsBody, JSON.stringify(s1.poses));
  check('flicker y ojos viven dentro de la capa de pose', s1.flickerInsidePose && s1.eyesInsidePose);
  check('ojos cerrados existen y arrancan ocultos', s1.closedExists && s1.closedHidden === true);
  check('ojos abiertos visibles por defecto', s1.eyesVisible === true);
  check('parpadeo NO se rompió', s1.eyesStillAnimating === 'chispaBlink', s1.eyesStillAnimating);
  check('respiración NO se rompió', s1.bodyStillAnimating === 'chispaBreath', s1.bodyStillAnimating);

    // ---- 2. API de poses
  const s2 = await evalJs(`(() => {
    const C = window.ChispaD5, el = document.getElementById('chispaD5');
    const r = {};
    C.pose('orar');
    r.orar = { cls: el.classList.contains('p-orar'), cur: C.currentPose(),
               eyes: getComputedStyle(el.querySelector('.chispa-eyes')).display,
               closed: getComputedStyle(el.querySelector('.chispa-eyes-closed')).display };
    C.pose('celebrar');
    r.cel = { cls: el.classList.contains('p-celebrar'), orarGone: !el.classList.contains('p-orar'),
              mouth: getComputedStyle(el.querySelector('.chispa-mouth-happy')).display };
    C.pose('dormir');
    r.drm = { cls: el.classList.contains('p-dormir'), z: getComputedStyle(el.querySelector('.chispa-zzz')).display };
    C.clearPose();
    r.clr = { drm: el.classList.contains('p-dormir'), cur: C.currentPose() };
    return r;
  })()`);
  check('pose orar: ojos se cierran', s2.orar.cls && s2.orar.eyes === 'none' && s2.orar.closed !== 'none', JSON.stringify(s2.orar));
  check('pose celebrar: mouth feliz y sustituye a orar', s2.cel.cls && s2.cel.orarGone && s2.cel.mouth !== 'none');
  check('pose dormir: muestra la "z"', s2.drm.cls && s2.drm.z !== 'none', s2.drm.z);
  check('clearPose limpia todo', s2.clr.drm === false && s2.clr.cur === '');

    // ---- 3. La pose expires sola (poses con duración)
  const s3 = await evalJs(`(() => {
    const C = window.ChispaD5, el = document.getElementById('chispaD5');
    C.pose('saludar', 250);
    const ahora = el.classList.contains('p-saludar');
    return new Promise(res => setTimeout(() => res({ ahora, despues: el.classList.contains('p-saludar') }), 700));
  })()`);
  check('pose con duración se quita sola', s3.ahora === true && s3.despues === false, JSON.stringify(s3));

    // ---- 4. d5:pray: brillo + serenidad, sin encadenar
  const s4 = await evalJs(`(() => {
    const C = window.ChispaD5, el = document.getElementById('chispaD5');
    window.dispatchEvent(new CustomEvent('d5:pray'));
    const a = { orar: el.classList.contains('p-orar'), halo: el.classList.contains('is-oracomun'),
                haloOpacity: getComputedStyle(el.querySelector('.chispa-halo')).opacity,
                cur: C.currentPose() };
    window.dispatchEvent(new CustomEvent('d5:pray'));
    window.dispatchEvent(new CustomEvent('d5:pray'));
    const b = { jump: el.classList.contains('is-jump') };
    return new Promise(res => setTimeout(() => {
      res({ a, b, tras: { celebrar: el.classList.contains('p-celebrar'),
                           orando: el.classList.contains('p-orar'), jump: el.classList.contains('is-jump') } });
    }, 3100));
  })()`);
  check('d5:pray → pose orar + halo encendido', s4.a.orar && s4.a.halo, JSON.stringify(s4.a));
  check('d5:pray es sereno: SIN salto', s4.b.jump === false);
  check('d5:pray: no se encadena con clicks seguidos', s4.a.cur === 'orar');
  check('tras orar viene un celebrar discreto (sin brinco)', s4.tras.celebrar === true && s4.tras.jump === false, JSON.stringify(s4.tras));

    // ---- 5. Sleep pose limpia is-oracomun
  const s5 = await evalJs(`(() => {
    const el = document.getElementById('chispaD5');
    return { halo: el.classList.contains('is-oracomun') };
  })()`);
  check('el halo se apaga al terminar', s5.halo === false, JSON.stringify(s5));

  console.log(out.join('\n'));
  console.log('\n--- console ---');
  console.log(logs.slice(0, 12).join('\n') || '(vacío)');
  console.log('\n--- errores JS ---');
  console.log(errors.length ? errors.join('\n') : '0 errores');
  const fails = out.filter(l => l.startsWith('FAIL')).length;
  console.log(`\n${out.length - fails}/${out.length} OK`);
  ws.close();
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('FALLO:', e.message); process.exit(1); });


