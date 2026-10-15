const port = process.argv[2] || '9228';
const inject = `(function(){try{localStorage.setItem('mjd5-tour-v1','1');localStorage.setItem('mjd5-tips-v1','[]');localStorage.setItem('mjd5-roam','false');}catch(e){}})();`;
const fileUrl = 'file:///C:/Users/Home/Desktop/PROYECTOS/Misi%C3%B3n%20juvenil%20web/index.html';
const httpUrl = 'http://localhost:5500/index.html';
async function main(){
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const page = list.find(t=>t.type==='page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id=0; const pending=new Map(); const errors=[]; const windowOpens=[];
  ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data); if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);} if(m.method==='Runtime.exceptionThrown')errors.push((m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description)||m.params.exceptionDetails.text); if(m.method==='Page.windowOpen')windowOpens.push(m.params.url);});
  const send=(method,params)=>new Promise(res=>{const i=++id;pending.set(i,res);ws.send(JSON.stringify({id:i,method,params}));});
  await new Promise(r=>ws.addEventListener('open',r));
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const ev=async(e)=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true}); if(r.result&&r.result.exceptionDetails)return {error:r.result.exceptionDetails.text}; return r.result&&r.result.result?r.result.result.value:r;};
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:inject});

  const iconCheck = `(async function(){
    var out=[];
    var links=[].slice.call(document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]'));
    for (var i=0;i<links.length;i++){
      var href=links[i].getAttribute('href');
      var abs=links[i].href;
      var r=await new Promise(function(res){var im=new Image();im.onload=function(){res({href:href,w:im.naturalWidth,h:im.naturalHeight});};im.onerror=function(){res({href:href,err:true,abs:abs});};im.src=abs;});
      out.push(r);
    }
    return JSON.stringify(out);
  })()`;

  await send('Page.navigate',{url:fileUrl}); await sleep(3500);
  console.log('FILE href:', await ev('location.href'));
  console.log('FILE favicons:', await ev(iconCheck));

  await send('Page.navigate',{url:httpUrl}); await sleep(3500);
  console.log('HTTP favicons:', await ev(iconCheck));

  const wa = await ev(`(function(){
    try{
      var t=document.getElementById('chispaTrigger'); t.click();
      var menu=document.querySelector('#chispaD5 .chispa-menu');
      var a=document.querySelector('#chispaD5 a[data-act="wa"]');
      var info={tag:a?a.tagName:null,href:a?a.getAttribute('href'):null,target:a?a.getAttribute('target'):null};
      if(a) a.click();
      info.menuOpenAfter=menu?menu.classList.contains('is-open'):null;
      return JSON.stringify(info);
    }catch(e){return JSON.stringify({err:String(e)});}
  })()`);
  await sleep(700);
  console.log('WA:', wa);
  console.log('windowOpen events:', windowOpens);
  console.log('ERRORES JS:', errors.length?errors:'ninguno');
  ws.close();
}
main().catch(e=>{console.error('ERR',e);process.exit(1);});

