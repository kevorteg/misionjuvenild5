import WebSocket from "ws";
const CDP = 9222;
const wait = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const list = await (await fetch(`http://localhost:${CDP}/json/list`)).json();
  const page = list.find(t => t.type === "page" && !t.url.startsWith("chrome://"));
  if (!page) { console.log("sin pestana de prueba"); process.exit(1); }
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pending = new Map(); const errs = []; const out = [];
  ws.on("message", raw => { const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") errs.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  const send = (m, p = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  const evalJs = async e => { const r = await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true });
    const x = r.result?.exceptionDetails; if (x) return "EXC: " + (x.exception?.description || x.text); return r.result?.result?.value; };
  const check = (n, ok, d) => { const l = (ok ? "PASS  " : "FAIL  ") + n + (d !== undefined ? "  " + d : ""); out.push(l); console.log(l); };

  await new Promise(r => ws.on("open", r));
  await send("Runtime.enable"); await send("Page.enable");
  await send("Network.enable"); await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Page.bringToFront");
  await send("Page.navigate", { url: "http://localhost:8899/index.html" });
  await wait(3000);
  await evalJs(`(()=>{ localStorage.setItem('mjd5-tour-v1','1'); localStorage.setItem('mjd5-tips-v1','1'); sessionStorage.setItem('mjd5-greet','1'); return 1 })()`);
  await send("Page.reload"); await wait(3200);

  // Un punto que no sea enlace, campo, audio, la mascota, el menu ni el tour.
  const cleanPoint = async () => {
    await evalJs(`(() => { try { window.getSelection().removeAllRanges(); } catch(e){}
      const m = document.getElementById('d5CtxMenu'); if (m) m.hidden = true; return 1; })()`);
    return await evalJs(`(() => {
      const W = innerWidth, H = innerHeight, cand = [];
      for (const y of [0.3, 0.45, 0.6, 0.2]) for (const x of [0.35, 0.5, 0.65]) cand.push([Math.round(W*x), Math.round(H*y)]);
      for (const [x,y] of cand) {
        const el = document.elementFromPoint(x,y); if (!el) continue;
        if (el.closest('a, input, textarea, select, video, audio, #chispaD5, #d5CtxMenu, [contenteditable]')) continue;
        if (el.closest('#d5Tour, #d5Tip')) continue;
        return { x, y };
      }
      return { x: Math.round(W/2), y: Math.round(H/2) };
    })()`);
  };
  const rightClick = async (a, b) => {
    const p = (typeof a === 'number') ? { x: a, y: b } : (a || await cleanPoint());
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: p.x, y: p.y, button: "right", buttons: 2, clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: p.x, y: p.y, button: "right", buttons: 0, clickCount: 1 });
    await wait(260); return p;
  };
  const leftClick = async (x, y) => {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 });
    await wait(200);
  };
  const abierto = () => evalJs(`!document.getElementById('d5CtxMenu').hidden`);
  // Tras los tests de seleccion y Shift queda estado residual en el harness:
  // se reintenta con puntos limpios frescos hasta que abra (el menu abre
  // 10/10 aislado, ver diag13).
  const abrirMenu = async () => {
    for (let i = 0; i < 4; i++) {
      await rightClick();
      if (await abierto()) return true;
      await wait(200);
    }
    return await abierto();
  };
const etiqueta = i => evalJs(`(()=>{ const b=document.querySelector('#d5CtxMenu [data-accion=${JSON.stringify(i)}]'); return b?b.textContent.trim():''; })()`);

  // ---- 1. Abre con clic derecho
  const s1 = await evalJs(`(()=>{ const m=document.getElementById('d5CtxMenu'); return { existe: !!m, visible: !!(m&&!m.hidden) }; })()`);
  if (!s1.existe) { console.log("el menu no se inyecto"); process.exit(1); }
  await rightClick();
  check("el menú existe y abre con clic derecho", await abierto());

  // ---- 2. Orden de los items
  const orden = await evalJs(`[...document.querySelectorAll('#d5CtxMenu [data-accion]')].map(b=>b.getAttribute('data-accion')).join(',')`);
  check("orden: chat, verso, tour, wa, copiar, sonido", orden === "chat,verso,tour,wa,copiar,sonido", " " + orden);

  // ---- 3. No aparece "Chispa presenta"
  const hayPresenta = await evalJs(`!!document.getElementById('d5CtxMenu').textContent.match(/presenta/i)`);
  check('NO aparece "Chispa presenta"', hayPresenta === false);

  // ---- 4. Pie con la firma
  const pie = await evalJs(`(()=>{ const p=document.querySelector('#d5CtxMenu .d5ctx-pie'); if(!p) return null;
    const fs=parseFloat(getComputedStyle(p).fontSize), col=getComputedStyle(p).color, r=p.getBoundingClientRect();
    return { txt: p.textContent.trim(), fs, col, h: Math.round(r.height), llama: !!p.querySelector('svg, .material-symbols-rounded, img') }; })()`);
  check("el pie lleva la firma con la llama", /Hecho con fuego por el D5/i.test(pie.txt) && pie.llama, JSON.stringify(pie));
  check("el pie es discreto (texto <= 10px, gris)", pie.fs <= 10 && pie.h < 32, `${pie.fs}px / ${pie.col} / ${pie.h}px`);

  // ---- 5. Sonido alterna el estado real
  await evalJs(`document.querySelector('#d5CtxMenu [data-accion="sonido"]').click()`);
  const trasSonido = await evalJs(`({ on: ChispaD5.soundOn(), lbl: (document.querySelector('#d5CtxMenu [data-accion="sonido"]')||{}).textContent, cerrado: document.getElementById('d5CtxMenu').hidden })`);
  await rightClick();
  const lbl2 = await etiqueta("sonido");
  check("el ítem de sonido alterna el estado real", trasSonido.on === false && /silenciad/i.test(lbl2), JSON.stringify({ ...trasSonido, lblAlReabrir: lbl2 }));
  await rightClick();
  await evalJs(`document.querySelector('#d5CtxMenu [data-accion="sonido"]').click()`);
  const restaurado = await evalJs(`ChispaD5.soundOn()`);
  check("el sonido se puede volver a activar", restaurado === true);
  check("el menú se cierra tras ejecutar", (await abierto()) === false);

  // ---- 6. Versiculo del dia
  await rightClick();
  await evalJs(`document.querySelector('#d5CtxMenu [data-accion="verso"]').click()`);
  await wait(400);
  const verso = await evalJs(`(()=>{ const b=document.querySelector('.chispa-bubble'); return { txt: b?b.textContent.trim():'', cerrado: document.getElementById('d5CtxMenu').hidden }; })()`);
  check('"Versículo del día" hace hablar a Chispa', verso.txt.length > 10 && verso.cerrado === true, JSON.stringify(verso));

  // ---- 7. Copiar el enlace: confirma y NO cierra
  await rightClick();
  await evalJs(`document.querySelector('#d5CtxMenu [data-accion="copiar"]').click()`);
  await wait(250);
  const copiado = await evalJs(`({ abierto: !document.getElementById('d5CtxMenu').hidden, lbl: (document.querySelector('#d5CtxMenu [data-accion="copiar"]')||{}).textContent })`);
  check('"Copiar el enlace" da confirmación y mantiene el menú abierto', copiado.abierto === true && /copiado/i.test(copiado.lbl || ""), JSON.stringify(copiado));
  await evalJs(`(()=>{ const m=document.getElementById('d5CtxMenu'); m.hidden=true; return 1; })()`);

  // ---- 8. No invade campos ni texto seleccionado
  const selInput = await evalJs(`(()=>{ const i=document.querySelector('input[type="email"], input[type="text"], textarea'); if(!i) return 'sin campo';
    const r=i.getBoundingClientRect(); i.focus();
    const ev=new MouseEvent('contextmenu',{bubbles:true,clientX:r.left+5,clientY:r.top+5});
    i.dispatchEvent(ev); return ev.defaultPrevented; })()`);
  check("NO invade un campo de texto", selInput === false, "defaultPrevented=" + selInput);
  const selText = await evalJs(`(()=>{ const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n,t=null;
    while(n=w.nextNode()){ if(n.textContent.trim().length>120){ t=n; break; } }
    if(!t) return 0; const r=document.createRange(); r.selectNodeContents(t);
    const s=getSelection(); s.removeAllRanges(); s.addRange(r); return s.toString().length; })()`);
  const sobreSel = await evalJs(`(()=>{ const el=document.elementFromPoint(innerWidth*0.5, innerHeight*0.35) || document.body;
    const ev=new MouseEvent('contextmenu',{bubbles:true,clientX:innerWidth*0.5,clientY:innerHeight*0.35});
    el.dispatchEvent(ev); const p = ev.defaultPrevented;
    getSelection().removeAllRanges(); return p; })()`);
  check("NO invade texto seleccionado", sobreSel === false, "sel=" + selText);

  // ---- 9. Shift deja el menu nativo
  const prevented = await evalJs(`(()=>{ const el=document.getElementById('un-click') || document.body;
    const ev=new MouseEvent('contextmenu',{bubbles:true,clientX:200,clientY:200,shiftKey:true});
    el.dispatchEvent(ev); return ev.defaultPrevented; })()`);
  check("Shift+clic derecho deja el menú nativo", prevented === false, "defaultPrevented=" + prevented);

  // ---- 10. Escape, clic fuera y scroll cierran
  const ab = await abrirMenu();
  const trasEsc = await (async () => { await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`); return abierto(); })();
  await rightClick(); await leftClick(400, 400);
  const trasClick = await abierto();
  await rightClick();
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 700, y: 500, deltaX: 0, deltaY: 240 });
  await wait(350);
  const trasScroll = await abierto();
  check("abre", ab === true, "ab=" + ab);
  check("Escape lo cierra", trasEsc === false);
  check("un clic fuera lo cierra", trasClick === false);
  check("el scroll lo cierra", trasScroll === false);

  // ---- 11. Se ancla dentro de la ventana en los bordes
  await rightClick(5, 5);
  const s11 = await evalJs(`(()=>{ const m=document.getElementById('d5CtxMenu'); return { l: parseInt(m.style.left), t: parseInt(m.style.top), w: m.offsetWidth }; })()`);
  check("se ancla dentro de la ventana en la esquina", s11.l >= 8 && s11.t >= 8 && s11.w > 0, JSON.stringify(s11));
  await evalJs(`document.getElementById('d5CtxMenu').hidden = true`);

  // ---- 12. No se inyecta donde no hay Chispa
  // Ya todas las paginas tienen Chispa (fuego-d5.html la recibio), asi que la
  // guarda se comprueba bloqueando el script que la crea.
  await send("Network.enable");
  await send("Network.setBlockedURLs", { urls: ["*experiencia-d5.js*"] });
  await send("Page.navigate", { url: "http://localhost:8899/salud-mental.html" });
  await wait(3000);
  const s12 = await evalJs(`({ menu: !!document.getElementById('d5CtxMenu'), chispa: !!document.getElementById('chispaD5') })`);
  check("no se inyecta donde no hay Chispa", s12.menu === false && s12.chispa === false, JSON.stringify(s12));
  await send("Network.setBlockedURLs", { urls: [] });

  // ---- 13. El chat no se ofrece en las paginas donde no debe
  await send("Page.navigate", { url: "http://localhost:8899/salud-mental.html" });
  await wait(3000);
  const s13 = await evalJs(`(()=>{ const m=document.getElementById('d5CtxMenu'); if(!m) return {sinMenu:true};
    document.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,clientX:200,clientY:200}));
    const mm=document.getElementById('d5CtxMenu');
    return { chatEnMenu: !!document.querySelector('#chispaD5 .chispa-menu a[data-act="chat"]'),
             chatEnCtx: !!mm.querySelector('[data-accion="chat"]') }; })()`);
  check("salud-mental no ofrece el chat ni en el menu ni en el contexto",
    s13.chatEnMenu === false && s13.chatEnCtx === false, JSON.stringify(s13));

  console.log(out.join("\n"));
  console.log("\nerrores JS: " + (errs.length ? errs.join("\n") : "0"));
  const f = out.filter(l => l.startsWith("FAIL")).length;
  console.log(`\n${out.length - f}/${out.length} OK`);
  ws.close(); process.exit(f ? 1 : 0);
}
main().catch(e => { console.error("FALLO:", e.message); process.exit(1); });


