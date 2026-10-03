/**
 * push-kb.mjs — Indexa kb/kb.json en el Vectorize del Worker.
 *
 * Uso:
 *   node tools/push-kb.mjs
 *   $env:WORKER_URL="https://fuego-d5.<sub>.workers.dev"
 *   $env:INGEST_TOKEN="<el mismo valor de `wrangler secret put INGEST_TOKEN`>"
 *
 * El Worker se encarga de calcular los embeddings, asi que aqui solo se le
 * mandan los fragmentos. Reindexar es idempotente: los ids son estables
 * (`pagina.html#indice`).
 */

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORKER = (process.env.WORKER_URL || '').replace(/\/$/, '');
const TOKEN = process.env.INGEST_TOKEN || '';

if (!WORKER || !TOKEN) {
  console.error('\n  Faltan variables de entorno:');
  console.error('    WORKER_URL     -> https://fuego-d5.<subdominio>.workers.dev');
  console.error('    INGEST_TOKEN   -> el valor que pusiste en `wrangler secret put INGEST_TOKEN`\n');
  process.exit(1);
}

const chunks = JSON.parse(await readFile(join(ROOT, 'kb', 'kb.json'), 'utf8'));
console.log(`  Enviando ${chunks.length} fragmentos a ${WORKER} ...`);

const res = await fetch(`${WORKER}/api/admin/ingest`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
  body: JSON.stringify({ chunks }),
});

const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error(`  ERROR ${res.status}:`, body.error || JSON.stringify(body));
  process.exit(1);
}

console.log(`  Listo. ${body.indexed} fragmentos indexados en el namespace "mjd5".`);
console.log(`  Prueba:  curl ${WORKER}/api/health`);