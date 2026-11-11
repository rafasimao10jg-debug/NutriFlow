// A publishable key pode ser usada no cliente quando todas as tabelas expostas
// têm RLS e políticas restritivas. Nunca use a secret/service_role no navegador.
window.NUTRIFLOW_SUPABASE = {
  url: 'https://zjrfzcmcwbgnpbrtkqjw.supabase.co',
  publishableKey: 'sb_publishable_-tjB1lvx9yFERbhPNG8twA_-xkdwkoV'
};

// Public frontend switches for the free static deployment.
window.NUTRIFLOW_RUNTIME = {
  billingEnabled: false,
  // The server checks budget, account, paid base access and confirmed AI subscription per user.
  photoAnalysisEnabled: false,
  apiBaseUrl: 'https://nutriflow-0yvi.onrender.com'
};
