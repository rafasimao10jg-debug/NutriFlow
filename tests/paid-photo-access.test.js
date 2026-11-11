import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getAiPhotoEntitlement, releasePaidPhotoAiUsage, reservePaidPhotoAiUsage } from '../billing.js';

const migration = await readFile(new URL('../supabase/migrations/202611110002_paid_ai_photo_gate.sql', import.meta.url), 'utf8');

const originalEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
const originalFetch = globalThis.fetch;

function restore() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  globalThis.fetch = originalFetch;
}

function configureStorage(responseBody) {
  process.env.SUPABASE_URL = 'https://project.example.supabase.co/';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-secret-for-test';
  globalThis.fetch = async () => ({ ok: true, json: async () => responseBody });
}

test('não libera foto para assinatura autorizada sem pagamento aprovado', async () => {
  configureStorage([{ base_access: true, ai_subscription_active: true, ai_subscription_paid_at: null }]);
  assert.deepEqual(await getAiPhotoEntitlement('user-123'), { baseAccess: true, paidAiSubscription: false });
  restore();
});

test('libera elegibilidade somente com acesso base, assinatura ativa e pagamento registrado', async () => {
  configureStorage([{ base_access: true, ai_subscription_active: true, ai_subscription_paid_at: '2026-11-11T12:00:00Z' }]);
  assert.deepEqual(await getAiPhotoEntitlement('user-123'), { baseAccess: true, paidAiSubscription: true });
  restore();
});

test('sem acesso base ou com assinatura cancelada não libera análise de foto', async () => {
  configureStorage([{ base_access: false, ai_subscription_active: false, ai_subscription_paid_at: null }]);
  assert.deepEqual(await getAiPhotoEntitlement('user-123'), { baseAccess: false, paidAiSubscription: false });
  restore();
});

test('consome e devolve a cota de foto exclusivamente pelos RPCs pagos', async () => {
  process.env.SUPABASE_URL = 'https://project.example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-secret-for-test';
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => ({ allowed: true, plan: 'ai_monthly', remaining: 99 }) };
  };

  const result = await reservePaidPhotoAiUsage('user-123');
  await releasePaidPhotoAiUsage('user-123');
  assert.equal(result.plan, 'ai_monthly');
  assert.equal(requests[0].url, 'https://project.example.supabase.co/rest/v1/rpc/nf_consume_paid_photo_ai_quota');
  assert.equal(requests[1].url, 'https://project.example.supabase.co/rest/v1/rpc/nf_release_paid_photo_ai_quota');
  assert.deepEqual(JSON.parse(requests[0].options.body), { p_user_id: 'user-123' });
  assert.equal(requests[0].options.headers.Authorization, 'Bearer server-secret-for-test');
  restore();
});

test('falha fechada se a migration de pagamento ainda não estiver aplicada', async () => {
  process.env.SUPABASE_URL = 'https://project.example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-secret-for-test';
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'column not found' }) });
  await assert.rejects(getAiPhotoEntitlement('user-123'), /BILLING_STORAGE_FAILED/);
  restore();
});

test('a migration exige pagamento registrado para as cotas mensais de texto e foto', () => {
  assert.match(migration, /if entitlement\.ai_subscription_active and entitlement\.ai_subscription_paid_at is not null/);
  assert.match(migration, /if not entitlement\.ai_subscription_active or entitlement\.ai_subscription_paid_at is null/);
  assert.match(migration, /case when active then now\(\) else existing\.ai_subscription_paid_at end/);
});
