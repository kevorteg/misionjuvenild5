import WebSocket from "ws";
const out = [];
const check = (n, ok, d) => { out.push((ok ? "PASS  " : "FAIL  ") + n + (d ? "  " + d : "")); };

const list = await (await fetch("http://localhost:9222/json/list")).json();
const page = list.find(t => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pending = new Map(); const errs = [];
ws.on("message", raw => { const m = JSON.parse(raw);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Runtime.exceptionThrown") errs.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
const send = (m,p={}) => new Promise(r => { const i=++id; pending.set(i,r); ws.send(JSON.stringify({id:i,method:m,params:p})); });
const evalJs = async e => { const r = await send("Runtime.evaluate",{expression:e,returnByValue:true,awaitPromise:true});
  const x=r.result?.exceptionDetails; if(x) return "EXC: "+(x.exception?.description||x.text); return r.result?.result?.value; };
const wait = ms => new Promise(r => setTimeout(r, ms));
const mouse = (x,y) => send("Input.dispatchMouseEvent",{type:"mouseMoved",x,y,buttons:0});
const callar = () => evalJs(`(() => { const b = document.querySelector('.chispa-bubble'); if (b) b.hidden = true; return 1; })()`);
const tourVisible = () => evalJs(`(()=>{const t=document.getElementById('d5Tour'); return !!(t && !t.hidden);})()`);

await new Promise(r => ws.on("open", r));
await send("Runtime.enable"); await send("Page.enable");
await send("Network.enable"); await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Page.bringToFront");  // sin esto la pestana queda oculta y rAF no corre
const __url = (await evalJs('document.location.href'));
if (!/__8899/.test(__url || '')) { console.log('AVISO: pestana inesperada -> ' + __url); }
await send("Page.navigate",{url:"http://localhost:8899/index.html"});
await wait(3000);
await evalJs(`(()=>{ localStorage.setItem('mjd5-tour-v1','1'); localStorage.setItem('mjd5-tips-v1','1'); localStorage.setItem('mjd5-roam','true');
  sessionStorage.setItem('mjd5-greet','1'); sessionStorage.removeItem('mjd5-wakeSaid'); return 1 })()`);
await send("Page.reload"); await wait(3500);
await callar();

// Reloj falseable: se adelanta el tiempo sin esperar minutos de verdad.
await evalJs(`(()=>{ const real = Date.now.bind(Date); window.__offset = 0;
  window.__advance = ms => { window.__offset += ms; return window.__offset; };
  Date.now = () => real() + window.__offset; return 1 })()`);

const VACIA = { dormir:false, escuchar:false, zzz:'none', jump:false, burbuja:'' };
const estado = () => evalJs(`(() => { const m = document.getElementById('chispaD5');
  if (!m) return { PERDIDA:true, dormir:false, escuchar:false, zzz:'none', jump:false, burbuja:'' };
  const b = document.querySelector('.chispa-bubble');
  return { PERDIDA:false, dormir: m.classList.contains('p-dormir'), escuchar: m.classList.contains('p-escuchar'),
    zzz: getComputedStyle(m.querySelector('.chispa-zzz')).display,
    jump: m.classList.contains('is-jump'),
    burbuja: b && !b.hidden ? (b.textContent||'').trim() : '' }; })()`);

// Chispa solo comprueba el sueño al llegar a reposo, y la cuenta se rearma en
// el primer reposo tras cada actividad. Esta espera adelanta el reloj cada
// pocos segundos para no depender de a que ocurriera ese rearmado exacto.
const esperarDormir = async (ms) => {
  const fin = Date.now() + (ms || 45000);
  let s = await estado(), bump = Date.now();
  while (Date.now() < fin) {
    if (s.dormir) return s;
    await wait(500);
    if (Date.now() - bump > 5000) { await evalJs(`__advance(300000)`); bump = Date.now(); }
    s = await estado();
  }
  return s;
};
const esperarVigila = async (ms) => {
  const fin = Date.now() + (ms || 12000);
  let s = await estado();
  while (Date.now() < fin) { if (s.dormir) return s; await wait(500); s = await estado(); }
  return s;
};

// --- 1. Antes de 90 s no se duerme
await evalJs(`__advance(60000)`);
await wait(3500);
const s1 = await estado();
check("a los 60 s sigue despierta", !s1.dormir, JSON.stringify(s1));

// --- 2. Pasada la calma se duerme, con "z" y SIN burbuja
const s2 = await esperarDormir();
check("tras la calma se duerme", s2.dormir === true, JSON.stringify(s2));
check('la "z" sube', s2.zzz !== "none", "display=" + s2.zzz);
check("dormir NO habla", s2.burbuja === "", "burbuja=" + JSON.stringify(s2.burbuja));

// --- 3. El primer movimiento la despierta con saltito y frase
await mouse(600, 400); await wait(180);
const s3a = await estado();
check("el movimiento la despierta", s3a.dormir === false);
check("al despertar da un saltito", s3a.jump === true, "is-jump=" + s3a.jump);
await wait(600);
const s3 = await estado();
check('la 1a vez dice "Ya desperte"', /despert/i.test(s3.burbuja), "burbuja=" + JSON.stringify(s3.burbuja));

// --- 4. Segundo despertar: ya no repite la frase
const s4 = await esperarDormir();
check("vuelve a dormirse", s4.dormir === true, JSON.stringify(s4));
await mouse(650, 420); await wait(700);
const s5 = await estado();
check("la 2a vez NO repite la frase", !/despert/i.test(s5.burbuja), "burbuja=" + JSON.stringify(s5.burbuja));

// --- 5. Con podcast sonando NO duerme: se queda escuchando
await callar();
await evalJs(`window.dispatchEvent(new CustomEvent('d5:podcast',{detail:{action:'play'}}))`);
await wait(600);
check("el podcast la despierta del sueño", !(await estado()).dormir);
await evalJs(`__advance(900000)`);
await wait(8000);
const s6 = await estado();
check("con audio NO se duerme", s6.dormir === false, JSON.stringify(s6));
check("con audio se queda escuchando", s6.escuchar === true, "escuchar=" + s6.escuchar);

// --- 6. Al pausar vuelve a la normalidad
await evalJs(`window.dispatchEvent(new CustomEvent('d5:podcast',{detail:{action:'pause'}}))`);
await wait(800);
const s7 = await estado();
check("al pausar sale de escuchar", s7.escuchar === false, JSON.stringify(s7));

// --- 7. Con el tour abierto no se duerme
// Primero se la despierta: lo que se comprueba es que el tour la mantiene
// despierta, no que la saque de la cama.
await callar();
await mouse(700, 500); await wait(700);
check("despierta antes de abrir el tour", !(await estado()).dormir);
await evalJs(`(()=>{ __advance(900000); window.ChispaD5.tour(); return 1 })()`);
await wait(900);
check("el tour se abrio de verdad", await tourVisible());
const s8 = await esperarVigila(12000);
check("con el tour abierto NO duerme", s8.dormir === false, JSON.stringify(s8));

// --- 8. Al cerrar el tour vuelve a poder dormirse
await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`);
await wait(1200);
check("el tour se cerro", !(await tourVisible()));
const s9 = await esperarDormir();
check("al terminar el tour vuelve a poder dormirse", s9.dormir === true, JSON.stringify(s9));

check("la mascota nunca desaparecio", !(await estado()).PERDIDA);

console.log(out.join("\n"));
console.log("\nerrores JS: " + (errs.length ? errs.join("\n") : "0"));
const f = out.filter(l => l.startsWith("FAIL")).length;
console.log(`\n${out.length - f}/${out.length} OK`);
ws.close(); process.exit(f ? 1 : 0);


