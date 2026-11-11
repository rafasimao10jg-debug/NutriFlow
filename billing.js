import { createHmac, timingSafeEqual } from 'node:crypto';

const BASE_PRICE = 29.90;
const AI_MONTHLY_PRICE = 14.90;
const CURRENCY = 'BRL';

function env() {
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
  return { url, publishableKey, serviceKey, appUrl, mpToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '', webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '', pixAiPlanId: process.env.MERCADOPAGO_PIX_AI_PLAN_ID || '' };
}

function configured({ url, publishableKey, serviceKey, appUrl, mpToken, webhookSecret }, needsWebhook = false) {
  return Boolean(url && publishableKey && serviceKey && appUrl && mpToken && (!needsWebhook || webhookSecret));
}

async function supabaseRequest(path, { method = 'GET', token, body, prefer } = {}) {
  const { url, serviceKey } = env();
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error('BILLING_STORAGE_FAILED');
  return payload;
}

async function requireUser(request) {
  const { url, publishableKey } = env();
  const authorization = request.headers.authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match || !url || !publishableKey) return null;
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${match[1]}` },
  });
  if (!response.ok) return null;
  const user = await response.json().catch(() => null);
  return typeof user?.id === 'string' && typeof user?.email === 'string' ? user : null;
}

async function mercadoPago(path, { method = 'GET', body, idempotencyKey } = {}) {
  const { mpToken } = env();
  const headers = { Authorization: `Bearer ${mpToken}`, 'Content-Type': 'application/json' };
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error('MERCADOPAGO_REQUEST_FAILED');
    error.status = response.status;
    throw error;
  }
  return payload;
}

function publicUrl(path) {
  const { appUrl } = env();
  const base = new URL(appUrl);
  if (base.protocol !== 'https:') throw new Error('INVALID_APP_URL');
  return new URL(path, base).toString();
}

function isMercadoPagoUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return ['mercadopago.com', 'mercadopago.com.br'].some(domain => host === domain || host.endsWith(`.${domain}`));
  } catch { return false; }
}

async function createBaseCheckout(request, response, sendJson) {
  const user = await requireUser(request);
  if (!user) return sendJson(response, 401, { error: 'Entre na sua conta para continuar.' });
  const entitlements = await supabaseRequest(`nf_entitlements?select=base_access&user_id=eq.${user.id}&limit=1`);
  if (Array.isArray(entitlements) && entitlements[0]?.base_access) {
    return sendJson(response, 409, { error: 'Sua conta já tem acesso ao NutriFlow.' });
  }
  const rows = await supabaseRequest('nf_billing_orders?select=id', {
    method: 'POST',
    body: { user_id: user.id, product_id: 'base_access', amount: BASE_PRICE, currency: CURRENCY },
    prefer: 'return=representation',
  });
  const order = Array.isArray(rows) ? rows[0] : null;
  if (!order?.id) throw new Error('BILLING_ORDER_CREATE_FAILED');

  try {
    const payment = await mercadoPago('/v1/payments', {
      method: 'POST',
      idempotencyKey: order.id,
      body: {
        transaction_amount: BASE_PRICE,
        description: 'NutriFlow — acesso base e 5 respostas de IA incluídas',
        payment_method_id: 'pix',
        payer: { email: user.email },
        external_reference: order.id,
        notification_url: publicUrl('/api/mercadopago/webhook'),
      },
    });
    const pix = payment?.point_of_interaction?.transaction_data;
    if (payment?.payment_method_id !== 'pix' || typeof payment?.id !== 'number' || !pix?.qr_code || !pix?.qr_code_base64) {
      throw new Error('INVALID_PIX_PAYMENT');
    }
    await supabaseRequest(`nf_billing_orders?id=eq.${order.id}`, {
      method: 'PATCH', body: { provider_payment_id: String(payment.id) },
    }).catch(() => {});
    return sendJson(response, 200, { paymentId: String(payment.id), qrCode: pix.qr_code, qrImageBase64: pix.qr_code_base64, expiresAt: payment.date_of_expiration || null });
  } catch (error) { throw error; }
}

async function createAiSubscription(request, response, sendJson) {
  const { pixAiPlanId } = env();
  if (!pixAiPlanId) return sendJson(response, 503, { error: 'A assinatura mensal via Pix ainda está sendo configurada.' });
  const user = await requireUser(request);
  if (!user) return sendJson(response, 401, { error: 'Entre na sua conta para continuar.' });
  const entitlements = await supabaseRequest(`nf_entitlements?select=base_access&user_id=eq.${user.id}&limit=1`);
  if (!Array.isArray(entitlements) || !entitlements[0]?.base_access) {
    return sendJson(response, 403, { error: 'Adquira primeiro o acesso base do NutriFlow.' });
  }
  const existing = await supabaseRequest(`nf_ai_subscriptions?select=id&user_id=eq.${user.id}&status=in.(pending,authorized)&limit=1`);
  if (Array.isArray(existing) && existing.length) {
    return sendJson(response, 409, { error: 'Sua assinatura já está em andamento ou ativa. Entre em contato com o suporte para gerenciá-la.' });
  }
  const rows = await supabaseRequest('nf_ai_subscriptions?select=id', {
    method: 'POST',
    body: { user_id: user.id },
    prefer: 'return=representation',
  });
  const subscription = Array.isArray(rows) ? rows[0] : null;
  if (!subscription?.id) throw new Error('BILLING_SUBSCRIPTION_CREATE_FAILED');

  try {
    const created = await mercadoPago('/preapproval', {
      method: 'POST',
      body: {
        preapproval_plan_id: pixAiPlanId,
        external_reference: subscription.id,
        payer_email: user.email,
        back_url: publicUrl('/?subscription=returned'),
        notification_url: publicUrl('/api/mercadopago/webhook'),
      },
    });
    if (!isMercadoPagoUrl(created?.init_point) || typeof created?.id !== 'string') throw new Error('INVALID_SUBSCRIPTION_URL');
    await supabaseRequest(`nf_ai_subscriptions?id=eq.${subscription.id}`, {
      method: 'PATCH', body: { provider_subscription_id: created.id },
    });
    return sendJson(response, 200, { checkoutUrl: created.init_point });
  } catch (error) { throw error; }
}

function verifyWebhookSignature(request, dataId) {
  const { webhookSecret } = env();
  const signature = request.headers['x-signature'];
  const requestId = request.headers['x-request-id'];
  if (!webhookSecret || typeof signature !== 'string' || typeof requestId !== 'string') return false;
  const fields = Object.fromEntries(signature.split(',').map(part => part.trim().split('=', 2)));
  if (!fields.ts || !fields.v1 || !dataId) return false;
  const normalizedId = String(dataId).toLowerCase();
  const manifest = `id:${normalizedId};request-id:${requestId};ts:${fields.ts};`;
  const expected = createHmac('sha256', webhookSecret).update(manifest).digest();
  let supplied;
  try { supplied = Buffer.from(fields.v1, 'hex'); } catch { return false; }
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

async function handleWebhook(request, response, sendJson, readBody) {
  const { webhookSecret } = env();
  if (!webhookSecret) return sendJson(response, 503, { error: 'Webhook ainda não configurado.' });
  let body;
  try { body = await readBody(request); } catch { return sendJson(response, 400, { error: 'Notificação inválida.' }); }
  const url = new URL(request.url, 'http://localhost');
  const dataId = url.searchParams.get('data.id') || body?.data?.id;
  const topic = url.searchParams.get('type') || body?.type;
  if (!verifyWebhookSignature(request, dataId)) return sendJson(response, 401, { error: 'Assinatura inválida.' });

  try {
    if (topic === 'payment') {
      const payment = await mercadoPago(`/v1/payments/${encodeURIComponent(dataId)}`);
      const orderId = payment?.external_reference;
      const isApproved = payment?.status === 'approved'
        && payment?.payment_method_id === 'pix'
        && payment?.currency_id === CURRENCY
        && Math.abs(Number(payment?.transaction_amount) - BASE_PRICE) < 0.001
        && typeof orderId === 'string'
        && /^[0-9a-f-]{36}$/i.test(orderId);
      if (isApproved) {
        const orders = await supabaseRequest(`nf_billing_orders?select=id&status=eq.pending&id=eq.${orderId}&limit=1`);
        if (Array.isArray(orders) && orders.length) {
          const result = await supabaseRequest('rpc/nf_apply_base_payment', {
            method: 'POST', body: { p_order_id: orderId, p_payment_id: String(payment.id) },
          });
          if (result !== true) throw new Error('PAYMENT_NOT_APPLIED');
        }
      }
    } else if (topic === 'subscription_preapproval' || topic === 'preapproval') {
      const subscription = await mercadoPago(`/preapproval/${encodeURIComponent(dataId)}`);
      const externalId = subscription?.external_reference;
      const billingMatches = matchesAiPlan(subscription);
      const status = subscription?.status === 'authorized' && !billingMatches
        ? 'pending'
        : ['authorized', 'paused', 'cancelled'].includes(subscription?.status) ? subscription.status : 'pending';
      if (typeof externalId === 'string') {
        const result = await supabaseRequest('rpc/nf_update_ai_subscription', {
          method: 'POST', body: { p_subscription_id: externalId, p_provider_id: String(subscription.id), p_status: status },
        });
        if (result !== true) throw new Error('SUBSCRIPTION_NOT_APPLIED');
      }
    } else if (topic === 'subscription_authorized_payment') {
      const invoice = await mercadoPago(`/authorized_payments/${encodeURIComponent(dataId)}`);
      const providerSubscriptionId = invoice?.preapproval_id;
      let active = false;
      const paymentId = invoice?.payment?.id;
      if (typeof providerSubscriptionId === 'string'
          && Number(invoice?.transaction_amount) === AI_MONTHLY_PRICE
          && invoice?.currency_id === CURRENCY
          && paymentId) {
        const payment = await mercadoPago(`/v1/payments/${encodeURIComponent(paymentId)}`);
        active = payment?.status === 'approved'
          && payment?.payment_method_id === 'pix'
          && payment?.currency_id === CURRENCY
          && Math.abs(Number(payment?.transaction_amount) - AI_MONTHLY_PRICE) < 0.001;
      }
      if (typeof providerSubscriptionId === 'string') {
        const subscriptions = await supabaseRequest(`nf_ai_subscriptions?select=id&provider_subscription_id=eq.${encodeURIComponent(providerSubscriptionId)}&limit=1`);
        const subscriptionId = Array.isArray(subscriptions) ? subscriptions[0]?.id : null;
        if (subscriptionId) {
          if (active) {
            const providerSubscription = await mercadoPago(`/preapproval/${encodeURIComponent(providerSubscriptionId)}`);
            if (providerSubscription?.status === 'authorized' && matchesAiPlan(providerSubscription)) {
              const updated = await supabaseRequest('rpc/nf_update_ai_subscription', {
                method: 'POST', body: { p_subscription_id: subscriptionId, p_provider_id: providerSubscriptionId, p_status: 'authorized' },
              });
              if (updated !== true) throw new Error('SUBSCRIPTION_NOT_APPLIED');
            } else {
              active = false;
            }
          }
          const result = await supabaseRequest('rpc/nf_set_ai_subscription_active', {
            method: 'POST', body: { p_subscription_id: subscriptionId, p_active: active },
          });
          if (result !== true) throw new Error('SUBSCRIPTION_PAYMENT_NOT_APPLIED');
        }
      }
    }
    return sendJson(response, 200, { received: true });
  } catch {
    return sendJson(response, 500, { error: 'Não foi possível processar a notificação agora.' });
  }
}

export async function handleBillingRequest(request, response, sendJson, readBody) {
  const config = env();
  if (process.env.BILLING_ENABLED !== 'true' || !configured(config, true)) {
    return sendJson(response, 503, { error: 'Checkout ainda não está configurado.' });
  }
  if (request.method === 'POST' && request.url === '/api/checkout/base') {
    try { return await createBaseCheckout(request, response, sendJson); }
    catch {
      return sendJson(response, 502, { error: 'Não consegui iniciar o checkout. Tente novamente mais tarde.' });
    }
  }
  if (request.method === 'POST' && request.url === '/api/checkout/ai') {
    try { return await createAiSubscription(request, response, sendJson); }
    catch {
      return sendJson(response, 502, { error: 'Não consegui iniciar a assinatura. Tente novamente mais tarde.' });
    }
  }
  if (request.method === 'POST' && request.url.startsWith('/api/mercadopago/webhook')) {
    return handleWebhook(request, response, sendJson, readBody);
  }
  return sendJson(response, 404, { error: 'Not found' });
}

function matchesAiPlan(subscription) {
  const recurring = subscription?.auto_recurring || {};
  return Number(recurring.transaction_amount) === AI_MONTHLY_PRICE
    && recurring.currency_id === CURRENCY
    && Number(recurring.frequency) === 1
    && recurring.frequency_type === 'months'
    && subscription?.payment_method_id === 'pix'
    && subscription?.preapproval_plan_id === env().pixAiPlanId;
}

export async function getAiPhotoEntitlement(userId) {
  const rows = await supabaseRequest(
    `nf_entitlements?select=base_access,ai_subscription_active,ai_subscription_paid_at&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  const entitlement = Array.isArray(rows) ? rows[0] : null;
  const paidAt = typeof entitlement?.ai_subscription_paid_at === 'string'
    && Number.isFinite(Date.parse(entitlement.ai_subscription_paid_at));
  return {
    baseAccess: entitlement?.base_access === true,
    paidAiSubscription: entitlement?.ai_subscription_active === true && paidAt,
  };
}

export async function reserveAiUsage(userId) {
  const result = await supabaseRequest('rpc/nf_consume_ai_quota', {
    method: 'POST', body: { p_user_id: userId },
  });
  return result;
}

export async function releaseAiUsage(userId) {
  await supabaseRequest('rpc/nf_release_ai_quota', { method: 'POST', body: { p_user_id: userId } });
}

export async function reservePaidPhotoAiUsage(userId) {
  return supabaseRequest('rpc/nf_consume_paid_photo_ai_quota', {
    method: 'POST', body: { p_user_id: userId },
  });
}

export async function releasePaidPhotoAiUsage(userId) {
  await supabaseRequest('rpc/nf_release_paid_photo_ai_quota', { method: 'POST', body: { p_user_id: userId } });
}

export async function getAuthenticatedUser(request) {
  return requireUser(request);
}
