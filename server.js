import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAuthenticatedUser, handleBillingRequest, reserveAiUsage } from './billing.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5000);
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
  if (request.url === '/api/assistant/usage') {
    if (request.method !== 'POST') {
      response.writeHead(405, { Allow: 'POST' }).end();
      return;
    }
    if (!allowedByRateLimit(request)) {
      sendJson(response, 429, { error: 'Muitas solicitações. Aguarde um pouco e tente novamente.' });
      return;
    }
    if (process.env.BILLING_ENABLED !== 'true') {
      sendJson(response, 200, { allowed: true, quota: null });
      return;
    }
    try {
      const user = await getAuthenticatedUser(request);
      if (!user) {
        sendJson(response, 401, { error: 'Entre na sua conta para usar o assistente.' });
        return;
      }
      const quota = await reserveAiUsage(user.id);
      if (!quota?.allowed) {
        const message = quota?.reason === 'base_access_required'
          ? 'Adquira primeiro o acesso base do NutriFlow.'
          : quota?.reason === 'monthly_limit'
            ? 'Você chegou ao limite de 100 respostas deste mês.'
            : 'Você usou as 5 respostas incluídas. Assine a IA para continuar.';
        sendJson(response, 403, { error: message });
        return;
      }
      sendJson(response, 200, { allowed: true, quota });
    } catch {
      sendJson(response, 503, { error: 'Não consegui conferir o limite da sua conta agora. Tente novamente.' });
    }
    return;
  }
  if (request.url.startsWith('/api/checkout/') || request.url.startsWith('/api/mercadopago/webhook')) {
    if (request.method !== 'POST') {
      response.writeHead(405, { Allow: 'POST' }).end();
      return;
    }
    if (request.url.startsWith('/api/checkout/') && !allowedByRateLimit(request)) {
      sendJson(response, 429, { error: 'Muitas tentativas. Aguarde um pouco e tente novamente.' });
      return;
    }
    await handleBillingRequest(request, response, sendJson, readBody);
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
