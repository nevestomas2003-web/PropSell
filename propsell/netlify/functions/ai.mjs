// Backend da IA do PropSell. A chave nunca chega ao navegador.
// No Netlify, ANTHROPIC_API_KEY e ANTHROPIC_BASE_URL são injetadas pelo AI Gateway.
// Se definires a tua própria ANTHROPIC_API_KEY nas variáveis do site, é essa que é usada.

const MODEL = process.env.AI_MODEL || 'claude-sonnet-5';
const MAX_IMAGES = 20;
const MAX_PROMPT = 20000;
const MAX_B64 = 1_500_000; // por imagem, já reduzida no cliente

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'metodo', message: 'Use POST.' }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'pedido', message: 'Pedido inválido.' }, 400); }

  const prompt = String(body.prompt || '');
  const wantJson = body.json === true;
  const images = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES) : [];
  if (!prompt || prompt.length > MAX_PROMPT) return json({ error: 'pedido', message: 'Prompt em falta ou demasiado longo.' }, 400);

  const content = [];
  for (const im of images) {
    if (!im || !/^image\/(jpeg|png|webp|gif)$/.test(im.media_type || '') || typeof im.data !== 'string' || im.data.length > MAX_B64) {
      return json({ error: 'pedido', message: 'Imagem inválida ou demasiado grande.' }, 400);
    }
    content.push({ type: 'image', source: { type: 'base64', media_type: im.media_type, data: im.data } });
  }
  content.push({ type: 'text', text: prompt });

  const base = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: 'indisponivel', message: 'IA não configurada no servidor.' }, 503);

  let r;
  try {
    r = await fetch(`${base}/v1/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: wantJson
          ? 'Responde exclusivamente com um único objeto JSON válido, sem texto antes ou depois e sem blocos de código.'
          : undefined,
        messages: [{ role: 'user', content }],
      }),
    });
  } catch (e) {
    return json({ error: 'rede', message: 'Não foi possível contactar o modelo.' }, 502);
  }

  if (r.status === 429) return json({ error: 'limite', message: 'Limite de pedidos atingido. Tente daqui a pouco.' }, 429);
  if (r.status === 402) return json({ error: 'creditos', message: 'Sem créditos de IA.' }, 402);
  if (!r.ok) return json({ error: 'modelo', message: `Erro do modelo (${r.status}).` }, 502);

  const data = await r.json();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  return json({ text });
};

export const config = { path: '/api/ai', method: 'POST' };
