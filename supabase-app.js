(() => {
  const cfg = window.NUTRIFLOW_SUPABASE;
  if (!cfg?.url || !cfg?.publishableKey || !window.supabase?.createClient) return;
  const client = window.supabase.createClient(cfg.url, cfg.publishableKey, { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } });
  let activeUser = null;
  let passwordRecovery = location.hash.includes('type=recovery');
  const setSyncStatus = value => { const status = document.getElementById('sync-status-home'); if (status) status.textContent = value; };
  const key = () => `nutriflow.meals.${activeUser?.id || 'demo'}`;
  window.getNutriFlowUserId = () => activeUser?.id || null;
  window.isNutriFlowAccountActive = () => Boolean(activeUser);
  window.loginWithSupabase = async () => {
    const emailInput = document.getElementById('login-email');
    const email = emailInput.value.trim();
    const password = document.getElementById('login-password').value;
    if (!emailInput.checkValidity()) return showToast('Confira o formato do seu e-mail.');
    if (!password) return showToast('Informe sua senha.');
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) showToast('Não foi possível entrar. Confira seus dados e tente novamente.');
  };
  window.registerWithSupabase = async () => {
    const name = document.getElementById('signup-name').value.trim();
    const emailInput = document.getElementById('signup-email');
    const email = emailInput.value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmation = document.getElementById('signup-password-confirm').value;
    if (!name) return showToast('Informe como podemos chamar você.');
    if (!emailInput.checkValidity()) return showToast('Confira o formato do seu e-mail.');
    if (password.length < 8) return showToast('Sua senha precisa ter pelo menos 8 caracteres.');
    if (password !== confirmation) return showToast('As senhas não correspondem.');
    const { data, error } = await client.auth.signUp({ email, password, options: { data: { display_name: name }, emailRedirectTo: location.origin } });
    if (error) return showToast('Não foi possível criar a conta. Confira os campos e tente novamente.');
    if (!data.session) showToast('Confira seu e-mail para confirmar a conta.');
  };
  window.recoverSupabasePassword = async () => {
    const emailInput = document.getElementById('login-email');
    const email = emailInput.value.trim();
    if (!emailInput.checkValidity()) return showToast('Confira o formato do seu e-mail.');
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
    showToast(error ? 'Não foi possível enviar as instruções agora.' : 'Se houver uma conta, você receberá instruções por e-mail.');
  };
  window.saveNewPassword = async () => {
    const password = document.getElementById('reset-password').value;
    const confirmation = document.getElementById('reset-password-confirm').value;
    if (password.length < 8) return showToast('A senha precisa ter pelo menos 8 caracteres.');
    if (password !== confirmation) return showToast('As senhas não correspondem.');
    const { error } = await client.auth.updateUser({ password });
    if (error) return showToast('Não foi possível atualizar a senha. Abra novamente o link de recuperação e tente outra vez.');
    passwordRecovery = false;
    history.replaceState(null, '', location.pathname);
    const { data } = await client.auth.getUser();
    if (data.user) await load(data.user);
    showToast('Senha atualizada.');
  };
  window.readMeals = () => { try { return JSON.parse(localStorage.getItem(key()) || '[]'); } catch { return []; } };
  window.saveMeals = (items) => {
    try { localStorage.setItem(key(), JSON.stringify(items)); } catch { showToast('Não foi possível salvar neste navegador.'); return false; }
    if (activeUser && items.length) {
      setSyncStatus('Sincronizando');
      const rows = items.map(m => ({ id: m.id, user_id: activeUser.id, entry_type: m.entry_type || 'log', meal_kind: m.kind, name: m.name, entry_date: m.date, notes: m.notes || '' }));
      client.from('meal_entries').upsert(rows, { onConflict: 'id' }).then(({ error }) => {
        if (error) { setSyncStatus('Pendente'); showToast('Salvo neste dispositivo. A sincronização falhou; tente novamente mais tarde.'); }
        else { setSyncStatus('Atualizado'); showToast('Registro salvo e sincronizado.'); }
      }).catch(() => { setSyncStatus('Pendente'); showToast('Salvo neste dispositivo. A sincronização falhou; tente novamente mais tarde.'); });
    }
    return true;
  };
  window.deleteMeal = async id => {
    if (activeUser) { const { error } = await client.from('meal_entries').delete().eq('id', id).eq('user_id', activeUser.id); if (error) return showToast('Não foi possível remover o registro.'); }
    const next = readMeals().filter(m => m.id !== id); try { localStorage.setItem(key(), JSON.stringify(next)); } catch {}
    setSyncStatus(activeUser ? 'Atualizado' : 'Local'); renderMeals(); showToast('Registro removido.');
  };
  const load = async user => {
    activeUser = user; if (!user) return;
    const { data, error } = await client.from('meal_entries').select('id,entry_type,meal_kind,name,entry_date,notes').eq('user_id', user.id).order('entry_date', { ascending: false });
    if (error) { setSyncStatus('Erro'); return showToast('Não foi possível carregar seus registros.'); }
    const remoteItems = (data || []).map(r => ({ id:r.id, kind:r.meal_kind, name:r.name, date:r.entry_date, notes:r.notes, entry_type:r.entry_type }));
    // Preserve locally cached entries if a previous sync failed, then retry them.
    let cachedItems = [];
    try { cachedItems = JSON.parse(localStorage.getItem(key()) || '[]'); } catch {}
    const remoteIds = new Set(remoteItems.map(item => item.id));
    const pendingItems = cachedItems.filter(item => !remoteIds.has(item.id));
    const items = [...remoteItems, ...pendingItems];
    let pendingSyncFailed = false;
    if (pendingItems.length) {
      const rows = pendingItems.map(m => ({ id: m.id, user_id: user.id, entry_type: m.entry_type || 'log', meal_kind: m.kind, name: m.name, entry_date: m.date, notes: m.notes || '' }));
      const { error: syncError } = await client.from('meal_entries').upsert(rows, { onConflict: 'id' });
      pendingSyncFailed = Boolean(syncError);
    }
    try { localStorage.setItem(key(), JSON.stringify(items)); } catch {}
    const profile = await client.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
    document.querySelectorAll('.profile-name').forEach(e => e.textContent = profile.data?.display_name || user.user_metadata?.display_name || 'Seu espaço');
    const accountState = document.getElementById('account-state'); if (accountState) accountState.textContent = pendingSyncFailed ? 'Sincronização pendente' : 'Conta sincronizada';
    setSyncStatus(pendingSyncFailed ? 'Pendente' : 'Atualizado');
    const notice = document.getElementById('storage-notice'); if (notice) notice.textContent = 'Seus registros estão associados à sua conta e protegidos por políticas de acesso. Use somente as informações que deseja salvar.';
    const profileNotice = document.getElementById('profile-storage-notice'); if (profileNotice) profileNotice.textContent = 'Seus registros ficam salvos na sua conta e você pode acessá-los ao entrar novamente.';
    const deleteLabel = document.querySelector('.settings-group .sg-label[style*="--rose"]'); if (deleteLabel) deleteLabel.textContent = 'Apagar meus registros';
    renderMeals(); goTo('dash'); showToast('Você entrou na sua conta.');
    if (pendingSyncFailed) showToast('Alguns registros ficaram neste dispositivo e ainda não sincronizaram.');
  };
  window.signOutNutriFlow = async () => { const { error } = await client.auth.signOut(); if (error) return showToast('Não foi possível sair da conta.'); activeUser = null; setSyncStatus('Local'); goTo('login'); };
  window.clearDemoData = async () => {
    if (!confirm('Apagar seus registros salvos? Esta ação remove os registros da sua conta e deste navegador.')) return;
    if (activeUser) {
      const { error } = await client.from('meal_entries').delete().eq('user_id', activeUser.id);
      if (error) return showToast('Não foi possível apagar os registros.');
    }
    try { localStorage.removeItem(key()); localStorage.removeItem(`nutriflow.pet.unlocked.${activeUser?.id || 'demo'}`); localStorage.removeItem('nutriflow.demo.meals'); localStorage.removeItem('nutriflow.pet.unlocked.demo'); } catch {}
    setSyncStatus(activeUser ? 'Atualizado' : 'Local'); renderMeals(); showToast('Registros apagados.');
  };
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') { passwordRecovery = true; goTo('reset'); return; }
    if (session?.user) { if (passwordRecovery) goTo('reset'); else setTimeout(() => load(session.user), 0); }
    else activeUser = null;
  });
  client.auth.getSession().then(({ data }) => { if (data.session?.user) { if (passwordRecovery) goTo('reset'); else load(data.session.user); } });
})();
