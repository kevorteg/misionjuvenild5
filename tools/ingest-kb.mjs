/**
 * ingest-kb.mjs — Construye la base de conocimiento de Fuego D5 IA.
 *
 * Lee las 14 páginas HTML y los documentos de texto del repo, les quita el
 * ruido (scripts, estilos, SVG, atributos) y los trocea en fragmentos cortos
 * con su URL real. El Worker los indexa en Vectorize.
 *
 * Uso:  node tools/ingest-kb.mjs
 * Sale: kb/kb.json  (chunks)  +  kb/sitemap.json  (mapa del sitio)
 *
 * Nota: se ingiere desde los archivos LOCALES a propósito. Así el sitio
 * puede publicarse donde sea sin tener que regenerar el KB, y el contenido
 * nunca depende de que haya una URL pública disponible.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KB_DIR = join(ROOT, 'kb');

/** Canales del bot. El Worker los usa para enrutar y el front para las píldoras. */
const CHANNELS = {
  podcast: { label: 'Podcast D5 Fuego', pages: ['podcast.html'] },
  campus: { label: 'Campus', pages: ['colegios.html', 'universidades.html', 'calendario.html', 'lanzamiento.html'] },
  recursos: { label: 'Recursos', pages: ['recursos.html', 'muro-espiritual.html', 'digital.html', 'salud-mental.html'] },
  uncirme: { label: 'Unirme', pages: ['contacto.html', 'quienes-somos.html', 'impacto.html', 'index.html', 'preguntas-frecuentes.html'] },
};

/** Páginas raíz que alimentan el KB. */
const HTML_PAGES = [
  'index.html', 'podcast.html', 'colegios.html', 'universidades.html',
  'calendario.html', 'lanzamiento.html', 'recursos.html',
  'muro-espiritual.html', 'digital.html', 'salud-mental.html',
  'contacto.html', 'quienes-somos.html', 'impacto.html',
  'preguntas-frecuentes.html',
];

/** Documentos de texto que dan contexto institucional. */
const DOCS = ['Mision juvenil documento.md', 'AGENTS.md', 'AUDITORIA_COMPLETA_MJD5.md', 'README.md'];

// ---------------------------------------------------------------- limpieza

/**
 * Elimina el primer elemento que coincida con una clase, con su contenido.
 * Se usa para quitar contenedores de navegación que se repiten en cada página.
 */
function removeByClass(html, className) {
  const re = new RegExp(`<(\\w+)[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/\\1>`, 'gi');
  let prev;
  do { prev = html; html = html.replace(re, ' '); } while (html !== prev);
  return html;
}

/** Quita todo lo que no es contenido legible para el visitante. */
function stripNoise(html) {
  return html
    // La navegación se describe mejor en el sitemap que como fragmentos.
    .replace(/<header\b[\s\S]*?<\/header>/gi, ' ')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')
    // Iconos Material Symbols: su "texto" es solo el nombre del glifo.
    .replace(/<span[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>[\s\S]*?<\/span>/gi, ' ')
    .replace(/<i\b[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>[\s\S]*?<\/i>/gi, ' ')
    .replace(/<span[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<head\b[\s\S]*?<\/head>/gi, ' ');
}

/**
 * Convierte HTML en texto, conservando el orden de lectura y marcando los
 * encabezados como '## ' para que el fragmento conserve su jerarquía.
 */
function htmlToText(html) {
  return stripNoise(html)
    .replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<\/(p|div|section|article|tr|footer|header|nav|ul|ol|table)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, d) => String.fromCharCode(d))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n').map(l => l.trim()).join('\n')
    .trim();
}

/**
 * Quita el bloque de contacto que precede al primer encabezado en algunas
 * páginas (correo, WhatsApp, "Síguenos"). No aporta contenido al bot.
 */
function trimContactPreamble(text) {
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const l = lines[i].trim();
    const isNoise = !l || l.includes('@') ||
      /^(whatsapp|s[ií]guenos|cont[aá]ctanos|inicio|email|tel[eé]fono)\b/i.test(l);
    if (!isNoise) break;
    i++;
  }
  return lines.slice(i).join('\n').trim();
}

/** Titulo legible de la pagina (para el sitemap y la cabecera del fragmento). */
function pageTitle(html, fallback) {
  const m = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (m) return m[1].trim().replace(/\s*[|\-–]\s*Misi[oó]n Juvenil D5\s*$/i, '').trim();
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return htmlToText(h1[1]).slice(0, 90) || fallback;
  return fallback;
}

// ---------------------------------------------------------------- troceado

/**
 * Trocea por encabezados: cada fragmento arranca en un '#' y termina en el
 * siguiente del mismo nivel o superior. Asi cada chunk responde a una
 * pregunta concreta en vez de mezclar secciones.
 */
function chunkByHeadings(text, { maxChars = 1100, minChars = 120 } = {}) {
  const lines = text.split('\n');
  const chunks = [];
  let buf = [];
  let head = null;

  const flush = () => {
    const body = buf.join('\n').trim();
    if (body.length >= minChars) chunks.push({ heading: head, body });
    buf = [];
  };

  for (const line of lines) {
    if (/^#{1,4}\s/.test(line)) {
      flush();
      head = line.replace(/^#+\s*/, '').trim();
      buf.push(line);
    } else {
      buf.push(line);
      if (buf.join('\n').length >= maxChars) flush();
    }
  }
  flush();

  // Un texto sin encabezados (p.ej. un .md corto) se trocea por parrafos.
  if (!chunks.length) {
    const paras = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    let acc = [];
    for (const p of paras) {
      acc.push(p);
      if (acc.join('\n\n').length >= maxChars) { chunks.push({ heading: null, body: acc.join('\n\n') }); acc = []; }
    }
    if (acc.join('').trim()) chunks.push({ heading: null, body: acc.join('\n\n') });
  }
  return chunks;
}

// ---------------------------------------------------------------- principal

async function buildPage(file) {
  const raw = await readFile(join(ROOT, file), 'utf8');
  let body = removeByClass(raw, 'mobile-bottom-nav');
  const text = trimContactPreamble(htmlToText(body));
  if (!text) return { chunks: [], title: file };

  const title = pageTitle(raw, file);
  const channel = Object.entries(CHANNELS)
    .find(([, c]) => c.pages.includes(file))?.[0] ?? 'uncirme';

  const chunks = chunkByHeadings(text).map((c, i) => ({
    id: `${file}#${i}`,
    source: file,
    url: file,
    channel,
    title,
    heading: c.heading,
    text: c.heading ? `${c.heading}\n${c.body}` : c.body,
  }));

  return { chunks, title, channel };
}

async function buildDoc(file) {
  const raw = await readFile(join(ROOT, file), 'utf8');
  const text = raw.replace(/```[\s\S]*?```/g, ' ').replace(/[ \t]+/g, ' ').trim();
  const chunks = chunkByHeadings(text).map((c, i) => ({
    id: `${file}#${i}`,
    source: file,
    url: null,
    channel: 'uncirme',
    title: file,
    heading: c.heading,
    text: c.heading ? `${c.heading}\n${c.body}` : c.body,
  }));
  return { chunks, title: file };
}

const all = [];
const sitemap = [];

for (const file of HTML_PAGES) {
  const { chunks, title, channel } = await buildPage(file);
  all.push(...chunks);
  sitemap.push({ file, title, channel, chunks: chunks.length });
  console.log(`  ${file.padEnd(28)} ${String(chunks.length).padStart(3)} chunks  [${channel}]  ${title.slice(0, 44)}`);
}

for (const file of DOCS) {
  const { chunks } = await buildDoc(file);
  all.push(...chunks);
  console.log(`  ${file.padEnd(28)} ${String(chunks.length).padStart(3)} chunks  [doc]`);
}

await mkdir(KB_DIR, { recursive: true });
await writeFile(join(KB_DIR, 'kb.json'), JSON.stringify(all, null, 1), 'utf8');
await writeFile(join(KB_DIR, 'sitemap.json'), JSON.stringify(sitemap, null, 1), 'utf8');

const withUrl = all.filter(c => c.url).length;
const chars = all.reduce((n, c) => n + c.text.length, 0);
console.log(`\n  TOTAL: ${all.length} chunks (${withUrl} con URL) · ${chars.toLocaleString('es-CO')} caracteres`);
console.log(`  -> ${join(KB_DIR, 'kb.json')}`);