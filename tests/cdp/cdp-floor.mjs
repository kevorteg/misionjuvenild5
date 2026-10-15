const port = process.argv[2] || '9227';
const base = process.argv[3] || 'http://localhost:5500';
const inject = `(function(){try{localStorage.setItem('mjd5-tour-v1','1');localStorage.setItem('mjd5-tips-v1','1');localStorage.setItem('mjd5-roam','false');}catch(e){}var o=window.matchMedia?window.matchMedia.bind(window):null;window.matchMedia=function(q){if(q.indexOf('pointer:coarse')>=0)return{matches:true,media:q,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},onchange:null};return o?o(q):{matches:false,media:q,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},onchange:null};};})();`;
async function main(){
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const page = list.find(t=>t.type==='page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id=0; const pending=new Map();
  ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data); if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}});
  const send=(method,params)=>new Promise(res=>{const i=++id;pending.set(i,res);ws.send(JSON.stringify({id:i,method,params}));});
  await new Promise(r=>ws.addEventListener('open',r));
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true});return r.result&&r.result.result?r.result.result.value:r;};
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:inject});
  await send('Page.navigate',{url:base+'/index.html'});await sleep(4500);
  const bottom=`document.getElementById('chispaD5')?document.getElementById('chispaD5').style.bottom:null`;
  const b0=await ev(bottom);
  const opened=await ev(`(function(){var ps=document.getElementById('playerSection');if(!ps)return 'NO_PLAYER';ps.classList.remove('hidden');return true;})()`);
  await sleep(900);
  const b1=await ev(bottom);
  const barTop=await ev(`(function(){var b=document.getElementById('playerBar');return b?b.getBoundingClientRect().top:null;})()`);
  await ev(`(function(){var ps=document.getElementById('playerSection');if(ps)ps.classList.add('hidden');return true;})()`);
  await sleep(900);
  const b2=await ev(bottom);
  console.log('open:',opened,'| bottom inicial:',b0,'| con reproductor:',b1,'| playerBar.top:',barTop,'| al cerrar:',b2);
  console.log('Chispa sube con el reproductor:', parseFloat(b1)>parseFloat(b0)+20, '| vuelve abajo:', Math.abs(parseFloat(b2)-parseFloat(b0))<3);
  ws.close();
}
main().catch(e=>{console.error('ERR',e);process.exit(1);});

