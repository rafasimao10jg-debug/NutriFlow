import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5000);
const model = process.env.OPENAI_MODEL || 'gpt-6-luna';
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_ADDRESS = 10;
const MAX_REQUESTS_PER_DAY = 100;
const requestLog = new Map();
let requestDay = new Date().toISOString().slice(0, 10);
let dailyRequests = 0;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

function allowedByRateLimit(request) {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== requestDay) { requestDay = today; dailyRequests = 0; }
  if (dailyRequests >= MAX_REQUESTS_PER_DAY) return false;

  const forwarded = request.headers['x-forwarded-for'];
  const address = (typeof forwarded === 'string' ? forwarded.split(',')[0] : request.socket.remoteAddress) || 'unknown';
  const now = Date.now();
  const recent = (requestLog.get(address) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_ADDRESS) {
    requestLog.set(address, recent);
    return false;
  }
  recent.push(now);
  requestLog.set(address, recent);
  dailyRequests += 1;
  for (const [key, timestamps] of requestLog) {
    const active = timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);
    if (active.length) requestLog.set(key, active);
    else requestLog.delete(key);
  }
  return true;
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 4096) throw new Error('BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function askOpenAI(question) {
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 25_000);
  try {
    const result = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: abort.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        store: false,
        reasoning: { effort: 'none' },
        max_output_tokens: 250,
        instructions: [
          'Você é o assistente de organização alimentar do NutriFlow. Responda em português brasileiro, com linguagem simples, cordial e objetiva.',
          'Ajude com ideias gerais de refeições e organização. Não diagnostique, não prescreva dietas, não calcule necessidades clínicas e não prometa resultados de saúde ou peso.',
          'Não solicite dados pessoais. Se a pergunta envolver doença, gravidez, transtorno alimentar, alergia grave, criança, medicamento ou orientação clínica, explique brevemente que a pessoa deve procurar nutricionista ou profissional de saúde qualificado e ofereça apenas ajuda geral segura.',
          'Não afirme que uma refeição é segura para alergias ou condições individuais. Sugira conferir rótulos e buscar orientação profissional quando relevante.',
          'Faça sugestões acessíveis e flexíveis, sem julgamento, vergonha ou linguagem restritiva. Se faltar contexto, pergunte uma coisa simples.',
        ].join(' '),
        input: question,
      }),
    });
    const payload = await result.json().catch(() => ({}));
    if (!result.ok) {
      const error = new Error('OPENAI_REQUEST_FAILED');
      error.status = result.status;
      const errorCode = payload?.error?.code;
      error.code = typeof errorCode === 'string' && /^[a-z0-9_-]{1,60}$/i.test(errorCode)
        ? errorCode
        : 'unknown';
      throw error;
    }
    const answer = Array.isArray(payload.output)
      ? payload.output
          .filter((item) => item.type === 'message')
          .flatMap((item) => Array.isArray(item.content) ? item.content : [])
          .filter((item) => item.type === 'output_text' && typeof item.text === 'string')
          .map((item) => item.text)
          .join('\n')
          .trim()
      : '';
    if (!answer) throw new Error('EMPTY_MODEL_RESPONSE');
    return answer.slice(0, 5000);
  } finally {
    clearTimeout(timeout);
  }
}

async function serveStatic(request, response) {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const requested = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = path.resolve(root, `.${requested}`);
  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== path.join(root, 'index.html')) {
    response.writeHead(404).end('Not found');
    return;
  }
  try {
    if (!(await stat(filePath)).isFile()) throw new Error('NOT_FILE');
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
}

const server = createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/assistant') {
    if (!process.env.OPENAI_API_KEY) {
      sendJson(response, 503, { error: 'O assistente ainda não está configurado neste ambiente.' });
      return;
    }
    if (!allowedByRateLimit(request)) {
      sendJson(response, 429, { error: 'O limite de uso do assistente foi atingido. Tente novamente mais tarde.' });
      return;
    }
    try {
      const body = await readBody(request);
      const question = typeof body.question === 'string' ? body.question.trim() : '';
      if (!question || question.length > 500) {
        sendJson(response, 400, { error: 'Escreva uma pergunta de até 500 caracteres.' });
        return;
      }
      const answer = await askOpenAI(question);
      sendJson(response, 200, { answer });
    } catch (error) {
      if (error.message === 'BODY_TOO_LARGE') {
        sendJson(response, 413, { error: 'A mensagem ficou grande demais. Envie uma pergunta mais curta.' });
      } else if (error.name === 'AbortError') {
        sendJson(response, 504, { error: 'O assistente demorou para responder. Tente novamente.' });
      } else if (error.status === 401) {
        console.error('OpenAI request rejected: status=401 code=' + (error.code || 'unknown'));
        sendJson(response, 503, { error: 'A chave da OpenAI configurada no servidor não foi aceita. Confira o valor de OPENAI_API_KEY nos Secrets do Render.' });
      } else if (error.status === 403) {
        console.error('OpenAI request rejected: status=403 code=' + (error.code || 'unknown'));
        sendJson(response, 503, { error: 'A conta da OpenAI não autorizou esta solicitação. Confira o acesso à API e o modelo configurado.' });
      } else if (error.status === 404) {
        console.error('OpenAI request rejected: status=404 code=' + (error.code || 'unknown'));
        sendJson(response, 503, { error: 'O modelo configurado não está disponível para esta conta. Confira OPENAI_MODEL nos Secrets do Render.' });
      } else if (error.status === 429) {
        console.error('OpenAI request limited: status=429 code=' + (error.code || 'unknown'));
        const quotaMessage = error.code === 'insufficient_quota'
          ? 'A conta da API OpenAI está sem saldo disponível ou atingiu seu limite. Confira Billing e Limits na OpenAI Platform.'
          : 'O limite de solicitações da API foi atingido. Aguarde um pouco e tente novamente.';
        sendJson(response, 503, { error: quotaMessage });
      } else {
        console.error('OpenAI request failed: status=' + (error.status || 'network') + ' code=' + (error.code || 'unknown'));
        sendJson(response, 502, { error: 'Não consegui gerar uma resposta agora. Tente novamente em instantes.' });
      }
    }
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD, POST' }).end();
    return;
  }
  await serveStatic(request, response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`NutriFlow listening on port ${port}`);
});
