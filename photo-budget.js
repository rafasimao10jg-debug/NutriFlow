const MAX_MONTHLY_PHOTO_REQUESTS = 800;

function serviceConfig() {
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const configuredLimit = Number(process.env.PHOTO_ANALYSIS_MONTHLY_LIMIT || MAX_MONTHLY_PHOTO_REQUESTS);
  const limit = Number.isInteger(configuredLimit) && configuredLimit > 0
    ? Math.min(configuredLimit, MAX_MONTHLY_PHOTO_REQUESTS)
    : 0;
  return { url, serviceKey, limit };
}

async function callBudgetRpc(rpcName) {
  const { url, serviceKey, limit } = serviceConfig();
  if (!url || !serviceKey || !limit) throw new Error('PHOTO_BUDGET_NOT_CONFIGURED');

  const response = await fetch(`${url}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_limit: limit }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('PHOTO_BUDGET_UNAVAILABLE');
  return response.json();
}

export async function reservePhotoMonthlyBudget() {
  return (await callBudgetRpc('nf_reserve_photo_analysis_monthly_quota')) === true;
}

export async function photoMonthlyBudgetAvailable() {
  return (await callBudgetRpc('nf_photo_analysis_monthly_quota_available')) === true;
}

export function photoBudgetIsConfigured() {
  const { url, serviceKey, limit } = serviceConfig();
  return Boolean(url && serviceKey && limit);
}
