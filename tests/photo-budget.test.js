import assert from 'node:assert/strict';
import test from 'node:test';
import { photoBudgetIsConfigured, photoMonthlyBudgetAvailable, reservePhotoMonthlyBudget } from '../photo-budget.js';

const originalEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  PHOTO_ANALYSIS_MONTHLY_LIMIT: process.env.PHOTO_ANALYSIS_MONTHLY_LIMIT,
};
const originalFetch = globalThis.fetch;

function restoreEnv() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  globalThis.fetch = originalFetch;
}

test('cota mensal falha fechada quando a credencial de servidor não está configurada', async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  globalThis.fetch = async () => { throw new Error('fetch não deveria ser chamado'); };
  assert.equal(photoBudgetIsConfigured(), false);
  await assert.rejects(reservePhotoMonthlyBudget, /PHOTO_BUDGET_NOT_CONFIGURED/);
  restoreEnv();
});

test('reserva a cota mensal pelo RPC sem expor o segredo na resposta', async () => {
  process.env.SUPABASE_URL = 'https://project.example.supabase.co/';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-server-secret';
  process.env.PHOTO_ANALYSIS_MONTHLY_LIMIT = '600';
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => true };
  };

  assert.equal(await reservePhotoMonthlyBudget(), true);
  assert.equal(request.url, 'https://project.example.supabase.co/rest/v1/rpc/nf_reserve_photo_analysis_monthly_quota');
  assert.equal(request.options.headers.Authorization, 'Bearer test-server-secret');
  assert.deepEqual(JSON.parse(request.options.body), { p_limit: 600 });
  restoreEnv();
});

test('recusa a análise quando a cota mensal já terminou', async () => {
  process.env.SUPABASE_URL = 'https://project.example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-server-secret';
  process.env.PHOTO_ANALYSIS_MONTHLY_LIMIT = '800';
  globalThis.fetch = async () => ({ ok: true, json: async () => false });
  assert.equal(await photoMonthlyBudgetAvailable(), false);
  restoreEnv();
});
