/* cdp-chat.mjs — Acceso al chat de Chispa
   Verifica que la gente pueda llegar a Fuego D5 IA desde la mascota,
   que el menu contextual lo ofrezca en escritorio, que no aparezca donde
   no debe, y que la pagina del chat tenga Chispa. */

const CDP = 'http://127.0.0.1:9222';

async function target() {
  const r = await fetch(`${CDP}/json/list`);
  const list = await r.json();
  let t = list.find((x) => x.type === 'page' && /^http:\/\/127\.0\.0\.1:5500\//.test(x.url));
  if (!t) {
    t = await fetch(`${CDP}/json/new?http://127.0.0.1:5500/index.html`, { method: 'PUT' })
      .then((r) => r.json());
  }
  return t;
}

function conn(t) {
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let id = 0;
  const pend = new Map();
  const logs = [];
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') {
      logs.push('EXCEPTION: ' + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text));
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      logs.push('CONSOLE ERROR: ' + m.params.args.map((a) => a.value ?? a.description).join(' '));
    }
  });
  const open = new Promise((r) => ws.addEventListener('open', r));
  const send = (method, params = {}) =>
    new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  return { open, send, logs, close: () => ws.close() };
}

async function main() {
  const t = await target();
  const c = conn(t);
  await c.open;
  await c.send('Runtime.enable');
  await c.send('Page.enable');

  let pass = 0, fail = 0;
  const check = (name, ok, extra = '') => {
    if (ok) { pass++; console.log(`  OK  ${name}`); }
    else { fail++; console.log(`  FALLA  ${name} ${extra}`); }
  };

  async function goto(url) {
    await c.send('Page.navigate', { url });
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 250));
      const st = await c.send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
      if (st.result?.result?.value === 'complete') break;
    }
    await new Promise((r) => setTimeout(r, 1200));
    c.logs.length = 0;
  }

  async function ev(expression) {
    const r = await c.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
    return r.result?.result?.value;
  }

  console.log('\n=== 1. Menu de Chispa: acceso al chat en paginas normales ===');
  for (const pag of ['index.html', 'quienes-somos.html', 'podcast.html', 'recursos.html']) {
    await goto(`http://127.0.0.1:5500/${pag}`);
    const r = await ev(`(() => {
      const a = document.querySelector('#chispaD5 .chispa-menu a[data-act="chat"]');
      const items = document.querySelectorAll('#chispaD5 .chispa-menu > *').length;
      return { hay: !!a, href: a && a.getAttribute('href'), texto: a && a.textContent.trim(), primero: !!(a && a === document.querySelector('#chispaD5 .chispa-menu').firstElementChild), items };
    })()`);
    check(`${pag}: existe "Pregúntale a Chispa"`, r.hay);
    check(`${pag}: apunta a fuego-d5.html`, r.href === 'fuego-d5.html', `-> ${r.href}`);
    check(`${pag}: es el primer item del menu`, r.primero);
    check(`${pag}: menu con ${r.items} items (no desbordado)`, r.items === 8, `-> ${r.items}`);
    check(`${pag}: sin errores de JS`, c.logs.length === 0, c.logs.join(' | '));
  }

  console.log('\n=== 2. El menu abre y el item es alcanzable ===');
  await goto('http://127.0.0.1:5500/index.html');
  // El menu se posiciona tras un rAF: hay que dejar que el layout asiente.
  await ev(`document.getElementById('chispaTrigger').click(); true`);
  await new Promise((r) => setTimeout(r, 700));
  const abre = await ev(`(() => {
    const m = document.querySelector('#chispaD5 .chispa-menu');
    const a = m.querySelector('a[data-act="chat"]');
    const r = a.getBoundingClientRect();
    const mr = m.getBoundingClientRect();
    return { abierto: m.classList.contains('is-open'), visible: r.width > 0 && r.height > 0,
             arriba: mr.top >= 0, abajo: mr.bottom <= window.innerHeight,
             w: Math.round(r.width), h: Math.round(r.height),
             menuAlto: Math.round(mr.height), desborde: m.scrollHeight > m.clientHeight + 1 };
  })()`);
  check('el menu se abre al tocar Chispa', abre.abierto);
  check('el item es visible', abre.visible);
  check('el menu cabe en pantalla (arriba >= 0)', abre.arriba, `top=${abre.arriba}`);
  check('el menu cabe en pantalla (abajo <= alto)', abre.abajo);
  check('el menu no desborda su propia caja', !abre.desborde);
  console.log(`       item: ${abre.w}x${abre.h}, menu: ${abre.menuAlto}px de alto`);

  console.log('\n=== 3. Menu contextual (clic derecho, escritorio) ===');
  const ctx = await ev(`(() => {
    const e = new MouseEvent('contextmenu', { bubbles: true, clientX: 200, clientY: 200 });
    document.body.dispatchEvent(e);
    const m = document.getElementById('d5CtxMenu');
    if (!m || m.hidden) return { existe: false };
    const a = m.querySelector('a[data-accion="chat"]');
    const r = m.getBoundingClientRect();
    return { existe: true, hay: !!a, href: a && a.getAttribute('href'), items: m.querySelectorAll('[data-accion]').length,
             visible: r.width > 0, arriba: r.top >= 0, abajo: r.bottom <= window.innerHeight };
  })()`);
  check('el menu contextual se abre', ctx.existe);
  check('el menu contextual ofrece el chat', ctx.hay);
  check('el enlace del menu contextual es fuego-d5.html', ctx.href === 'fuego-d5.html');
  check('el menu contextual cabe en pantalla', ctx.arriba && ctx.abajo);
  check('el menu contextual crecio a 6 acciones', ctx.items === 6, `-> ${ctx.items}`);
  check('sin errores de JS tras abrir menus', c.logs.length === 0, c.logs.join(' | '));

  console.log('\n=== 4. Donde el chat NO debe aparecer ===');
  for (const pag of ['salud-mental.html', 'lanzamiento.html']) {
    await goto(`http://127.0.0.1:5500/${pag}`);
    const r = await ev(`(() => ({
      burbuja: !!document.querySelector('#chispaD5 .chispa-menu a[data-act="chat"]'),
      ctx: !!document.getElementById('chispaD5')
    }))()`);
    check(`${pag}: sin item de chat en el menu de Chispa`, !r.burbuja);
  }

  console.log('\n=== 5. La pagina del chat tiene Chispa (no se pierde la mascota) ===');
  await goto('http://127.0.0.1:5500/fuego-d5.html');
  const fg = await ev(`(() => ({
    chispa: !!document.getElementById('chispaD5'),
    trigger: !!document.getElementById('chispaTrigger'),
    vida: !!window.__chispaVida,
    cerebro: !!window.ChispaD5,
    pasos: document.querySelectorAll('[data-chispa-tour]').length,
    itemChat: !!document.querySelector('#chispaD5 .chispa-menu a[data-act="chat"]'),
    volver: !!document.getElementById('fuegoVolver'),
    inputChat: !!document.getElementById('fuegoInput')
  }))()`);
  check('Chispa esta presente en fuego-d5.html', fg.chispa && fg.trigger);
  check('el sistema de vida arranco', fg.vida);
  check('la API ChispaD5 esta expuesta', fg.cerebro);
  check('la pagina declara sus propios pasos de tour', fg.pasos >= 2, `-> ${fg.pasos}`);
  check('NO se ofrece el chat estando ya en el chat', !fg.itemChat);
  check('hay enlace de vuelta al sitio', fg.volver);
  check('el campo de escritura existe', fg.inputChat);
  check('sin errores de JS en la pagina del chat', c.logs.length === 0, c.logs.join(' | '));

  console.log('\n=== 6. El tour del chat realza elementos reales ===');
  // El tour espera a que la pagina se asiente (hasta ~2 s) antes de pintar el paso.
  await ev(`ChispaD5.tour(); true`);
  await new Promise((r) => setTimeout(r, 3000));
  const tour = await ev(`(() => {
    const t = document.getElementById('d5Tour');
    if (!t || t.hidden) return { abierto: false };
    const hole = document.getElementById('d5Tour-hole');
    const dots = document.getElementById('d5Tour-dots');
    return { abierto: true, hole: hole.style.display, titulo: t.querySelector('h3').textContent,
             pasos: dots ? dots.children.length : 0 };
  })()`);
  check('el tour abre en la pagina del chat', tour.abierto);
  check('el tour resalta un elemento real (hole visible)', tour.hole === 'block', `-> "${tour.hole}"`);
  check('el tour tiene pasos', tour.pasos >= 2, `-> ${tour.pasos}`);
  check('el primer paso tiene titulo', !!tour.titulo && tour.titulo.length > 3, `-> "${tour.titulo}"`);
  console.log(`       primer titulo: "${tour.titulo}"`);
  await ev(`(() => { const b = document.querySelector('#d5Tour [data-tour="next"]'); if (b) b.click(); })()`);
  await new Promise((r) => setTimeout(r, 600));
  check('sin errores de JS tras el tour', c.logs.length === 0, c.logs.join(' | '));

  console.log('\n=== 7. El tour NO miente en paginas sin pasos declarados ===');
  await goto('http://127.0.0.1:5500/salud-mental.html');
  await ev(`ChispaD5.tour(); true`);
  await new Promise((r) => setTimeout(r, 3000));
  const mentira = await ev(`(() => {
    const t = document.getElementById('d5Tour');
    const abierto = !!(t && !t.hidden);
    const card = document.getElementById('d5Tour-card');
    const titulo = card && card.querySelector('h3') ? card.querySelector('h3').textContent : '';
    const hole = document.getElementById('d5Tour-hole');
    return { abierto, titulo, hole: hole ? hole.style.display : 'n/a' };
  })()`);
  check('en salud-mental el tour NO muestra texto de la home',
    !mentira.abierto || !/unirme|un click|palabra del d5|bienvenido/i.test(mentira.titulo),
    `-> "${mentira.titulo}"`);
  check('en salud-mental el tour NO resalta un hueco inexistente',
    !mentira.abierto || mentira.hole !== 'block',
    `-> hole=${mentira.hole}`);

  console.log(`\n=== RESULTADO: ${pass} OK / ${fail} FALLA ===`);
  c.close();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(2); });