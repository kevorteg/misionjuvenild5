const port = process.argv[2] || '9228';
const base = process.argv[3] || 'http://localhost:5500';
const inject = `(function(){try{localStorage.setItem('mjd5-tour-v1','1');localStorage.setItem('mjd5-tips-v1','[]');localStorage.setItem('mjd5-roam','false');}catch(e){}})();`;
async function main(){
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const page = list.find(t=>t.type==='page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id=0; const pending=new Map(); const errors=[];
  ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data); if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);} if(m.method==='Runtime.exceptionThrown')errors.push((m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description)||m.params.exceptionDetails.text);});
  const send=(method,params)=>new Promise(res=>{const i=++id;pending.set(i,res);ws.send(JSON.stringify({id:i,method,params}));});
  await new Promise(r=>ws.addEventListener('open',r));
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const ev=async(e)=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true}); if(r.result&&r.result.exceptionDetails)return {error:r.result.exceptionDetails.text}; return r.result&&r.result.result?r.result.result.value:r;};
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:inject});
  await send('Page.navigate',{url:base+'/index.html'});await sleep(4500);
  console.log('href:', await ev('location.href'));
  console.log('title:', await ev('document.title'));
  console.log('trigger?', await ev('!!document.getElementById("chispaTrigger")'));
  console.log('iconLinks:', await ev('document.querySelectorAll(\'link[rel="icon"],link[rel="apple-touch-icon"]\').length'));

  const fav = await ev(`(async function(){
    var out=[];
    var links=[].slice.call(document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]'));
    for (var i=0;i<links.length;i++){
      var href=links[i].getAttribute('href');
      var r=await new Promise(function(res){var im=new Image();im.onload=function(){res({href:href,w:im.naturalWidth,h:im.naturalHeight});};im.onerror=function(){res({href:href,err:true});};im.src=href;});
      if(href && href.indexOf('.svg')>=0 && !r.err){
        try{var c=document.createElement('canvas');c.width=64;c.height=64;var x=c.getContext('2d');x.drawImage(await new Promise(function(res){var im=new Image();im.onload=function(){res(im)};im.src=href;}),0,0,64,64);var d=x.getImageData(0,0,64,64).data;var nz=0;for(var k=3;k<d.length;k+=4){if(d[k]>10)nz++;}r.opaque=nz;}catch(e){r.canvasErr=String(e);}
      }
      out.push(r);
    }
    return JSON.stringify(out);
  })()`);
  console.log('=== FAVICONS ===');
  console.log(fav);

  const wa = await ev(`(function(){
    try {
      var opened=[];
      window.open=function(u,t,f){opened.push((u||'').slice(0,60));return null;};
      var t=document.getElementById('chispaTrigger');
      t.click();
      var menu=document.querySelector('#chispaD5 .chispa-menu');
      var openAfterTrigger=menu?menu.classList.contains('is-open'):null;
      var wa=document.querySelector('#chispaD5 [data-act="wa"]');
      var waText=wa?wa.textContent.trim():null;
      if(wa) wa.click();
      return JSON.stringify({openAfterTrigger:openAfterTrigger,waText:waText,opened:opened,menuOpenAfter:menu?menu.classList.contains('is-open'):null});
    } catch(e){ return JSON.stringify({err:String(e),stack:String(e&&e.stack||'').slice(0,400)}); }
  })()`);
  console.log('=== WHATSAPP ===');
  console.log(wa);
  console.log('ERRORES JS:', errors.length?errors:'ninguno');
  ws.close();
}
main().catch(e=>{console.error('ERR',e);process.exit(1);});

