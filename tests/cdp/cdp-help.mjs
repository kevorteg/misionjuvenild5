const PORT=9222;
const list=await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
let t=list.find(t=>t.type==='page'&&t.url.includes('localhost:8899'))||list.find(t=>t.type==='page');
const ws=new WebSocket(t.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
let id=0; const p=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&p.has(m.id)){p.get(m.id)(m);p.delete(m.id);}};
const send=(m2,pr={})=>new Promise(r=>{const i=++id;p.set(i,r);ws.send(JSON.stringify({id:i,method:m2,params:pr}));});
const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});
  if(r.result?.exceptionDetails)return{__err:r.result.exceptionDetails.exception?.description||r.result.exceptionDetails.text};
  return r.result?.result?.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.enable'); await send('Runtime.enable'); await send('Page.bringToFront');
let F=0; const check=(n,ok,d)=>{ if(!ok)F++; console.log((ok?'PASS  ':'FAIL  ')+n+(d!==undefined?'  '+d:'')); };
// Espera real: hasta que Chispa exista y la URL sea la pedida.
const go=async u=>{ await send('Page.navigate',{url:'http://localhost:8899/'+u});
  for(let i=0;i<60;i++){ await wait(400);
    const r=await ev(`(location.pathname.endsWith(${JSON.stringify('/'+u)})&&!!document.getElementById('chispaD5'))?1:0`);
    if(r===1){ await ev(`localStorage.setItem('mjd5-tour-v1','1')`); await wait(200); return true; } }
  return false; };
const call=()=>ev(`(()=>{const b=document.querySelector('#chispaD5 .chispa-bubble');return b&&!b.hidden?b.querySelector('span').textContent:'';})()`);
const limpiar=async()=>{ await ev(`(()=>{const b=document.querySelector('#chispaD5 .chispa-bubble');if(b){b.hidden=true;b.querySelector('span').textContent='';}})()`); await wait(120); };
// Tecla ANTES de enfocar: asi se parece a alguien que escribe y despues cambia de campo.
const hint=async(sel,valor,teclea)=>{ await limpiar();
  await ev(`(()=>{if(${teclea})document.dispatchEvent(new KeyboardEvent('keydown',{key:'a',bubbles:true}));
    const el=document.querySelector(${JSON.stringify(sel)});el.focus();if(valor!==null)el.value=${JSON.stringify(valor)};
    el.dispatchEvent(new FocusEvent('focusin',{bubbles:true}));})()`);
  await wait(650); return await call(); };

// ---- 1. pasos declarativos
check('la home carga', (await go('index.html'))===true);
const decl=await ev(`[...document.querySelectorAll('[data-chispa-tour]')].map(x=>x.id)`);
check('index declara 4 pasos', Array.isArray(decl)&&decl.length===4, JSON.stringify(decl));
await ev(`ChispaD5.tour()`); await wait(1000);
const s1=await ev(`(()=>{const t=document.getElementById('d5Tour'),h=document.getElementById('d5Tour-hole');if(!t||!h)return null;
  const r=h.getBoundingClientRect();return{activo:!t.hidden,pasos:t.querySelectorAll('#d5Tour-dots i').length,
  titulo:t.querySelector('h3').textContent.slice(0,20),disp:h.style.display,h:Math.round(r.height)};})()`);
check('el tour usa los pasos declarados', !!s1&&s1.activo===true&&s1.pasos===4, JSON.stringify(s1));
check('el foco ilumina el elemento real', !!s1&&s1.disp==='block'&&s1.h>20, s1?('disp='+s1.disp+' h='+s1.h):'sin tour');
await ev(`document.querySelector('[data-tour="next"]').click()`); await wait(1500);
const s2=await ev(`document.getElementById('d5Tour').querySelector('h3').textContent.slice(0,20)`);
check('avanza al segundo paso declarado', /Palabra/.test(s2||''), JSON.stringify(s2));
await ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`); await wait(400);
check('Escape lo cierra', (await ev(`document.getElementById('d5Tour').hidden`))===true);

// ---- 2. cada pagina usa sus propios pasos
   check('contacto carga', (await go('contacto.html'))===true);
   await ev(`ChispaD5.tour()`); await wait(1600);
   const fb=await ev(`(()=>{const t=document.getElementById('d5Tour');return t?{n:t.querySelectorAll('#d5Tour-dots i').length,oculto:t.hidden,titulo:(document.getElementById('d5Tour-card')||{}).querySelector?(document.getElementById('d5Tour-card').querySelector('h3')||{}).textContent:''}:null;})()`);
   check('contacto usa sus 2 pasos declarados', !!fb&&fb.n===2, JSON.stringify(fb));
   check('el primer paso es el suyo, no el de la home',
     !!fb&&/Hablemos/.test(fb.titulo||''), JSON.stringify(fb&&fb.titulo));
   await ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`); await wait(300);

   // ---- 2b. una pagina sin pasos declarados NO inventa los de la home
   check('podcast carga', (await go('podcast.html'))===true);
   const sin=await ev(`document.querySelectorAll('[data-chispa-tour]').length`);
   check('podcast no declara pasos propios', sin===0, `-> ${sin}`);
   await ev(`ChispaD5.tour()`); await wait(1600);
   const nb=await ev(`(()=>{const t=document.getElementById('d5Tour');const c=document.getElementById('d5Tour-card');
     const h=document.getElementById('d5Tour-hole');
     return {n:t?t.querySelectorAll('#d5Tour-dots i').length:0,oculto:t?t.hidden:true,
             titulo:c?(c.querySelector('h3')||{}).textContent||'':'',hole:h?h.style.display:'n/a'};})()`);
   check('sin declarar no sale con los pasos de la home',
     nb.oculto===true||(nb.n===0&&!/unirme|un click|palabra del d5/i.test(nb.titulo||'')), JSON.stringify(nb));
   check('sin declarar no resalta un hueco inexistente',
     nb.oculto===true||nb.hole!=='block', JSON.stringify(nb));

// ---- 3. el consejo suena al enfocar
check('muro carga', (await go('muro-espiritual.html'))===true);
const h1=await hint('#petition-text',null,false);
check('susurra el consejo al enfocar', /nadie va a leer tu nombre/.test(h1), JSON.stringify(h1));

// ---- 4. no lee lo escrito: pagina limpia para saltar el cooldown
check('muro recarga', (await go('muro-espiritual.html'))===true);
const h2=await hint('#input-author','me llamo juanita y mi papa esta malo',false);
check('NO lee lo que el usuario escribio', h2!==''&&/deja el nombre en blanco/.test(h2), JSON.stringify(h2));
check('no se filtra el texto del campo', !/juanita|papa|malo/i.test(h2), JSON.stringify(h2));

// ---- 5. una vez por campo
const h3=await hint('#petition-text',null,false);
check('no repite el consejo en el mismo campo', h3==='', JSON.stringify(h3));

// ---- 6. se calla si esta escribiendo
check('contacto carga', (await go('contacto.html'))===true);
const h4=await hint('[name=message]','hola',true);
check('se calla si el usuario esta escribiendo', h4==='', JSON.stringify(h4));

// ---- 7. no pisa un versiculo en curso
check('recursos carga', (await go('recursos.html'))===true);
await ev(`ChispaD5.verse()`); await wait(600);
const v=await call();
await limpiar();
const h5=await hint('#newsletterEmail',null,false);
check('el versiculo sigue en su sitio', typeof v==='string'&&v.length>25, JSON.stringify(v).slice(0,70));
check('el consejo no pisa el versiculo', !/bolet[ií]n|Suscr[ií]bate/.test(h5), JSON.stringify(h5).slice(0,70));

console.log(`\n${F===0?'TODO OK':F+' FALLAS'}`);
ws.close(); process.exit(F?1:0);

