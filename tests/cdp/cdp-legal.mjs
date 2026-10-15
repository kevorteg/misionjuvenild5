import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9238;
const BASE = 'http://localhost:5500/';
const profile = mkdtempSync(join(tmpdir(), 'cdp-legal-'));
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--window-size=1400,1000', 'about:blank'
], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function getWs() { for (let i = 0; i < 50; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/list`); const l = await r.json(); const p = l.find(t => t.type === 'page'); if (p) return p.webSocketDebuggerUrl; } catch {} await sleep(200); } throw new Error('no CDP'); }
let id = 0, ws, pending = new Map(), errors = [], waiters = [];
function send(m, p = {}) { return new Promise((res, rej) => { const mid = ++id; pending.set(mid, { res, rej }); ws.send(JSON.stringify({ id: mid, method: m, params: p })); }); }
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) return { error: r.exceptionDetails.text }; return { value: r.result?.value }; }
async function nav(u) { const l = new Promise(r => waiters.push(r)); await send('Page.navigate', { url: u }); await Promise.race([l, sleep(8000)]); await sleep(700); }
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  -> ' + x : ''}`);

(async () => {
  ws = new WebSocket(await getWs());
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text); else if (m.method === 'Page.loadEventFired') { const r = waiters.shift(); if (r) r(); } });
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable'); await send('Network.setCacheDisabled', { cacheDisabled: true });

  // --- contacto: labels + guard ---
  await nav(BASE + 'contacto.html');
  const labelTxt = await ev(`(function(){var c=document.querySelector('[data-consent]');return c?c.closest('label').textContent.replace(/\\s+/g,' ').trim():null;})()`);
  ok('contacto: casilla presente con texto', labelTxt.value && /Autorizo a Misión Juvenil D5/.test(labelTxt.value), (labelTxt.value || '').slice(0, 70));
  const link = await ev(`(function(){var a=document.querySelector('[data-consent]').closest('label').querySelector('a');return a?a.getAttribute('href'):null;})()`);
  ok('contacto: enlace a política', link.value === 'politica-de-datos.html', String(link.value));

  const guard = await ev(`(function(){
    var f=document.createElement('form');f.innerHTML='<input type="checkbox" data-consent>';
    document.body.appendChild(f);
    var e1=new Event('submit',{cancelable:true,bubbles:true});f.dispatchEvent(e1);
    var blocked=e1.defaultPrevented, modal=!!document.querySelector('.d5a-overlay');
    var bt=document.querySelector('.d5a-btn'); if(bt) bt.click();
    f.querySelector('[data-consent]').checked=true;
    var e2=new Event('submit',{cancelable:true,bubbles:true});f.dispatchEvent(e2);
    var passed=!e2.defaultPrevented; f.remove();
    return {blocked:blocked, modal:modal, passed:passed};
  })()`);
  ok('guard: bloquea sin marcar', guard.value && guard.value.blocked === true && guard.value.modal === true, JSON.stringify(guard.value));
  ok('guard: permite al marcar', guard.value && guard.value.passed === true);

  // --- politica ---
  await nav(BASE + 'politica-de-datos.html');
  const pol = await ev(`(function(){var m=document.querySelector('main');return {title:document.title, secs:m?m.querySelectorAll('section').length:0, arts:m?m.querySelectorAll('article').length:0, len:m?m.textContent.replace(/\\s+/g,' ').trim().length:0, placeholder:document.documentElement.innerHTML.indexOf('<!--MAIN-->')>=0, hasResp:/Responsable del tratamiento/.test(m?m.textContent:''), hasMenores:/Menores de edad/.test(m?m.textContent:''), hasCookies:/Cookies y almacenamiento local/.test(m?m.textContent:'')};})()`);
  ok('política: título', /Política de Tratamiento de Datos/.test(pol.value.title || ''), pol.value.title);
  ok('política: contenido presente', pol.value.len > 2000, 'len=' + pol.value.len);
  ok('política: sin placeholder MAIN', pol.value.placeholder === false);
  ok('política: secciones clave', pol.value.hasResp && pol.value.hasMenores && pol.value.hasCookies);

  // --- terminos ---
  await nav(BASE + 'terminos-de-uso.html');
  const ter = await ev(`(function(){var m=document.querySelector('main');return {title:document.title, len:m?m.textContent.replace(/\\s+/g,' ').trim().length:0, placeholder:document.documentElement.innerHTML.indexOf('<!--MAIN-->')>=0, hasReglas:/Reglas del Muro Espiritual/.test(m?m.textContent:''), hasEmergencia:/servicio de emergencia/.test(m?m.textContent:'')};})()`);
  ok('términos: título', /Términos de Uso/.test(ter.value.title || ''), ter.value.title);
  ok('términos: contenido presente', ter.value.len > 1500, 'len=' + ter.value.len);
  ok('términos: sin placeholder MAIN', ter.value.placeholder === false);
  ok('términos: secciones clave', ter.value.hasReglas && ter.value.hasEmergencia);

  // --- footer link en una página normal ---
  await nav(BASE + 'index.html');
  const fl = await ev(`(function(){var f=document.querySelector('footer');if(!f)return null;var a=f.querySelector('a[href="politica-de-datos.html"]');var b=f.querySelector('a[href="terminos-de-uso.html"]');return {p:!!a,t:!!b};})()`);
  ok('footer enlaza política y términos', fl.value && fl.value.p && fl.value.t, JSON.stringify(fl.value));

  ok('sin errores JS', errors.length === 0, errors.join(' | '));
  console.log('\n=== LEGAL / CONSENT ===');
  for (const r of out) console.log(r);
  const failed = out.filter(r => r.startsWith('FAIL')).length;
  console.log(`\n${out.length - failed}/${out.length} PASS`);
  ws.close(); chrome.kill();
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('ERROR', e); chrome.kill(); process.exit(1); });

