(() => {
  const cfg = window.NUTRIFLOW_SUPABASE;
  if (!cfg?.url || !cfg?.publishableKey || !window.supabase?.createClient) return;
  const client = window.supabase.createClient(cfg.url, cfg.publishableKey, { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } });
  let activeUser = null;
  const key = () => `nutriflow.meals.${activeUser?.id || 'demo'}`;
  window.loginWithSupabase = async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) return showToast('Informe seu e-mail e sua senha.');
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) showToast('Não foi possível entrar. Confira seus dados e tente novamente.');
  };
  window.registerWithSupabase = async () => {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    if (!name || !email || password.length < 8) return showToast('Preencha nome, e-mail e senha com pelo menos 8 caracteres.');
    const { data, error } = await client.auth.signUp({ email, password, options: { data: { display_name: name }, emailRedirectTo: location.origin } });
    if (error) return showToast('Não foi possível criar a conta. Confira os campos e tente novamente.');
    if (!data.session) showToast('Confira seu e-mail para confirmar a conta.');
  };
  window.recoverSupabasePassword = async () => {
    const email = document.getElementById('login-email').value.trim();
    if (!email) return showToast('Informe seu e-mail para receber as instruções.');
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
    showToast(error ? 'Não foi possível enviar as instruções agora.' : 'Se houver uma conta, você receberá instruções por e-mail.');
  };
  window.readMeals = () => { try { return JSON.parse(localStorage.getItem(key()) || '[]'); } catch { return []; } };
  window.saveMeals = (items) => {
    try { localStorage.setItem(key(), JSON.stringify(items)); } catch { showToast('Não foi possível salvar neste navegador.'); return false; }
    if (activeUser && items.length) {
      const rows = items.map(m => ({ id: m.id, user_id: activeUser.id, entry_type: m.entry_type || 'log', meal_kind: m.kind, name: m.name, entry_date: m.date, notes: m.notes || '' }));
      client.from('meal_entries').upsert(rows, { onConflict: 'id' }).then(({ error }) => showToast(error ? 'Salvo no dispositivo; falhou a sincronização.' : 'Registro sincronizado.'));
    }
    return true;
  };
  window.deleteMeal = async id => {
    if (activeUser) { const { error } = await client.from('meal_entries').delete().eq('id', id).eq('user_id', activeUser.id); if (error) return showToast('Não foi possível remover o registro.'); }
    const next = readMeals().filter(m => m.id !== id); try { localStorage.setItem(key(), JSON.stringify(next)); } catch {}
    renderMeals(); showToast('Registro removido.');
  };
  const load = async user => {
    activeUser = user; if (!user) return;
    const { data, error } = await client.from('meal_entries').select('id,entry_type,meal_kind,name,entry_date,notes').eq('user_id', user.id).order('entry_date', { ascending: false });
    if (error) return showToast('Não foi possível carregar seus registros.');
    const items = (data || []).map(r => ({ id:r.id, kind:r.meal_kind, name:r.name, date:r.entry_date, notes:r.notes, entry_type:r.entry_type }));
    try { localStorage.setItem(key(), JSON.stringify(items)); } catch {}
    const profile = await client.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
    document.querySelectorAll('.profile-name').forEach(e => e.textContent = profile.data?.display_name || user.user_metadata?.display_name || 'Seu espaço');
    const accountState = document.getElementById('account-state'); if (accountState) accountState.textContent = 'Conta sincronizada';
    const notice = document.getElementById('storage-notice'); if (notice) notice.textContent = 'Seus registros estão associados à sua conta e protegidos por políticas de acesso. Use somente as informações que deseja salvar.';
    renderMeals(); goTo('dash'); showToast('Você entrou na sua conta.');
  };
  window.signOutNutriFlow = async () => { const { error } = await client.auth.signOut(); if (error) return showToast('Não foi possível sair da conta.'); activeUser = null; goTo('login'); };
  window.clearDemoData = async () => {
    if (!confirm('Apagar seus registros salvos? Esta ação remove os registros da sua conta e deste navegador.')) return;
    if (activeUser) {
      const { error } = await client.from('meal_entries').delete().eq('user_id', activeUser.id);
      if (error) return showToast('Não foi possível apagar os registros.');
    }
    try { localStorage.removeItem(key()); localStorage.removeItem('nutriflow.demo.meals'); } catch {}
    renderMeals(); showToast('Registros apagados.');
  };
  client.auth.onAuthStateChange((_event, session) => { if (session?.user) setTimeout(() => load(session.user), 0); else activeUser = null; });
  client.auth.getSession().then(({ data }) => { if (data.session?.user) load(data.session.user); });
})();
