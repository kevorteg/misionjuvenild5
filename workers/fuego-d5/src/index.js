/**
 * Fuego D5 IA — Worker de Misión Juvenil D5.
 *
 * Bot informativo de la web de MJ D5. Recupera fragmentos de la base de
 * conocimiento y responde SOLO con esa información, citando siempre la página
 * de origen. No es unorientador ni un terapeuta: deriva esos casos a la página
 * de salud mental, que es el canal humano real de la organización.
 *
 * Rutas:
 *   GET  /api/health          estado del servicio
 *   POST /api/chat            { question, history[] } -> { answer, sources[] }
 *   POST /api/admin/ingest    { chunks[] } -> indexa en Vectorize (protegido)
 */

const SYSTEM = `Eres "Fuego D5 IA", el asistente informativo de Misión Juvenil D5 (MJ D5), una plataforma juvenil cristiana de Colombia.

REGLAS INQUEBALABLES:
1. Responde EXCLUSIVAMENTE con la información del CONTEXT que recibes. Si un dato no está ahí, no lo inventes. No deduzcas fechas, nombres, cifras, episodios ni enlaces.
2. Si el CONTEXT no responde la pregunta, dilo con franqueza ("No tengo esa información") y dirige a la página de contacto.
3. Eres INFORMATIVO, no asesor. NO diagnostiques, NO des consejo clínico ni psicológico, NO hagas teología, NO resumas materia ni resuelvas parciales.
4. Si el usuario menciona una crisis de salud mental (suicidio, autolesiones, pánico severo, no poder más), NO counsejees. Responde en UNA frase amable y dirige a la página de salud mental.
5. Toda respuesta factual termina con una o más líneas con el formato exacto:
   FUENTE: <url>
   Si la info viene de un documento interno sin página pública, escribe FUENTE: (general).
6. Los únicos enlaces permitidos son los que aparecen en el CONTEXT. Nunca inventes una URL.
7. Responde en español, tono cercano y juvenil, con fe pero sin sermón. Máximo 90 palabras. Sin emojis.
8. No te presentes como un humano ni como consejero. Eres Fuego D5 IA, el asistente informativo de la web.`;

// Palabras que activan el desvío a la vía humana, antes de gastar un LLM.
const CRISIS = [
  'suicid', 'suicidio', 'quitarme la vida', 'matarme', 'autolesion', 'autolesión',
  'no quiero vivir', 'no puedo mas', 'no puedo más', 'crisis', 'pánico', 'panico',
  'ansiedad extrema', 'depresion', 'depresión', 'me quiero morir', 'desespero',
  'desesperación', 'colapso', 'ataque de panico', 'ataque de pánico',
];

const CRISIS_REPLY =
  'Entiendo que estás pasando por algo muy pesado, y no estás solo. Esto es más grande ' +
  'que un chat: en Misión Juvenil D5 hay personas preparadas para escucharte. ' +
  'Escríbele hoy desde salud-mental.html y te atendemos.';

const ORIGIN_FALLBACK = '*';

function allowedOrigins(env) {
  const raw = env.ALLOWED_ORIGINS || ORIGIN_FALLBACK;
  return new Set(raw.split(',').map(s => s.trim()).filter(Boolean));
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const list = allowedOrigins(env);
  const allow = list.has(ORIGIN_FALLBACK) ? '*' : (origin && list.has(origin) ? origin : null);
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(request, env) },
  });
}

/** Vector de una sola consulta. */
async function embed(env, text) {
  const res = await env.AI.run(env.EMBED_MODEL, { text: [text] });
  const v = res?.data?.[0];
  if (!Array.isArray(v)) throw new Error('El modelo de embeddings devolvio una respuesta inesperada');
  return v;
}

async function askLLM(env, messages) {
  const run = async (model) => {
    const res = await env.AI.run(model, { messages, max_tokens: 400, temperature: 0.3 });
    return res?.response?.trim() || '';
  };
  try {
    const out = await run(env.LLM_MODEL);
    if (out) return { text: out, model: env.LLM_MODEL };
  } catch (e) {
    console.warn('LLM principal fallo, uso fallback:', e?.message);
  }
  const out = await run(env.LLM_FALLBACK);
  return { text: out, model: env.LLM_FALLBACK };
}

/** Arma el bloque de contexto y la lista de fuentes a partir de los matches. */
function buildContext(matches) {
  const blocks = [];
  const sources = [];
  matches.forEach((m, i) => {
    const meta = m.metadata || {};
    blocks.push(
      `[${i + 1}] Pagina: ${meta.title || meta.source}\n` +
      `URL: ${meta.url || '(general)'}\n` +
      `Contenido:\n${m.text}`
    );
    if (meta.url && !sources.some(s => s.url === meta.url)) {
      sources.push({ url: meta.url, title: meta.title || meta.source, channel: meta.channel });
    }
  });
  return { context: blocks.join('\n\n---\n\n'), sources };
}

/** Saca las lineas FUENTE: que el modelo debe haber escrito. */
function parseSources(answer, retrieved) {
  const found = answer.match(/FUENTE:\s*(\S+)/gi) || [];
  const urls = found
    .map(m => m.replace(/FUENTE:\s*/i, '').trim())
    .filter(u => u && u !== '(general)' && /^[\w./-]+\.html$/i.test(u));

  const out = [];
  for (const u of urls) {
    const hit = retrieved.find(s => s.url === u);
    if (hit && !out.some(s => s.url === u)) out.push(hit);
  }
  // Si el modelo no cito nada, mostramos la pagina principal del retrieved.
  if (!out.length && retrieved.length) out.push(retrieved[0]);
  return out;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (url.pathname === '/api/health') {
      return json(request, env, {
        ok: true,
        service: 'fuego-d5',
        model: env.LLM_MODEL,
        embed: env.EMBED_MODEL,
        k: Number(env.TOP_K || 5),
      });
    }

    if (url.pathname === '/api/admin/ingest' && request.method === 'POST') {
      const token = request.headers.get('Authorization') || '';
      if (!env.INGEST_TOKEN || token !== `Bearer ${env.INGEST_TOKEN}`) {
        return json(request, env, { error: 'No autorizado' }, 401);
      }
      try {
        const { chunks } = await request.json();
        if (!Array.isArray(chunks) || !chunks.length) {
          return json(request, env, { error: 'Se esperaba { chunks: [...] } no vacio' }, 400);
        }
        let n = 0;
        // Lote pequeno: el limite por subrequest de Workers es 50.
        for (let i = 0; i < chunks.length; i += 20) {
          const batch = chunks.slice(i, i + 20);
          const vectors = await Promise.all(batch.map(c => embed(env, c.text)));
          await env.VECTORIZE.upsert(batch.map((c, j) => ({
            id: c.id,
            values: vectors[j],
            namespace: 'mjd5',
            metadata: {
              source: c.source,
              url: c.url || '',
              title: c.title || c.source,
              heading: c.heading || '',
              channel: c.channel || 'uncirme',
              // El texto SI va en metadata: es lo que buildContext() lee
              // cuando arma el CONTEXT del prompt.
              text: c.text,
            },
          })));
          n += batch.length;
        }
        return json(request, env, { ok: true, indexed: n });
      } catch (e) {
        return json(request, env, { error: String(e?.message || e) }, 500);
      }
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(request, env, { error: 'Cuerpo JSON invalido' }, 400);
      }

      const question = String(body?.question || '').trim();
      const history = Array.isArray(body?.history) ? body.history.slice(-6) : [];

      if (question.length < 3) {
        return json(request, env, { error: 'Escribe una pregunta.' }, 400);
      }
      if (question.length > 600) {
        return json(request, env, { error: 'La pregunta es demasiado larga (max 600).' }, 400);
      }

      // Desvio a la via humana: deterministico y sin costo de LLM.
      const low = question.toLowerCase();
      if (CRISIS.some(k => low.includes(k))) {
        return json(request, env, {
          answer: CRISIS_REPLY,
          sources: [{ url: 'salud-mental.html', title: 'Salud Mental', channel: 'recursos' }],
          crisis: true,
        });
      }

      try {
        const qv = await embed(env, question);
        const matches = await env.VECTORIZE.query(qv, {
          topK: Number(env.TOP_K || 5),
          namespace: 'mjd5',
          returnMetadata: 'all',
        });

        const hits = (matches?.matches || []).filter(m => m.score > 0.35);
        if (!hits.length) {
          return json(request, env, {
            answer:
              'No tengo esa informacion guardada de Misión Juvenil D5. ' +
              'Te dejo el canal oficial para que te la resuelvan directamente.',
            sources: [{ url: 'contacto.html', title: 'Contacto', channel: 'uncirme' }],
            notFound: true,
          });
        }

        const { context, sources } = buildContext(hits);
        const messages = [
          { role: 'system', content: SYSTEM },
          ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: String(h.content || '').slice(0, 800) })),
          { role: 'user', content: `CONTEXT:\n${context}\n\nPREGUNTA: ${question}` },
        ];

        const { text, model } = await askLLM(env, messages);
        if (!text) {
          return json(request, env, { error: 'El modelo no devolvio respuesta. Intenta de nuevo.' }, 502);
        }

        return json(request, env, {
          answer: text,
          sources: parseSources(text, sources),
          model,
          crisis: false,
        });
      } catch (e) {
        console.error('chat error:', e);
        return json(request, env, { error: 'Fuego D5 está teniendo problemas. Intenta en un momento.' }, 500);
      }
    }

    return json(request, env, { error: 'Ruta no encontrada' }, 404);
  },
};