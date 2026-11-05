(() => {
  const cfg = window.NUTRIFLOW_SUPABASE;
  if (!cfg?.url || !cfg?.publishableKey || !window.supabase?.createClient) return;

  const client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
  });
  const demoKey = 'nutriflow.demo.meals';
  const legacyDemoKey = 'nutriflow.meals.demo';
  let activeUser = null;
  let passwordRecovery = location.hash.includes('type=recovery');
  let currentLoad = 0;

  const setSyncStatus = value => {
    const status = document.getElementById('sync-status-home');
    if (status) status.textContent = value;
  };
  const accountKey = userId => userId ? `nutriflow.meals.${userId}` : demoKey;
  const pendingKey = userId => `nutriflow.pending.${userId}`;
  const getPendingIds = userId => {
    try {
      const value = JSON.parse(localStorage.getItem(pendingKey(userId)) || '[]');
      return new Set(Array.isArray(value) ? value.filter(id => typeof id === 'string') : []);
    } catch { return new Set(); }
  };
  const savePendingIds = (userId, ids) => {
    try {
      if (ids.size) localStorage.setItem(pendingKey(userId), JSON.stringify([...ids]));
      else localStorage.removeItem(pendingKey(userId));
    } catch {}
  };
  const readLocal = storageKey => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(value) ? value.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.date === 'string') : [];
    } catch { return []; }
  };
  const toRow = (meal, userId) => ({
    id: meal.id,
    user_id: userId,
    entry_type: meal.entry_type === 'plan' ? 'plan' : 'log',
    meal_kind: String(meal.kind || 'Outra').slice(0, 40),
    name: meal.name.trim().slice(0, 120),
    entry_date: meal.date,
    notes: String(meal.notes || '').slice(0, 500),
  });
  const fromRow = row => ({
    id: row.id, kind: row.meal_kind, name: row.name, date: row.entry_date,
    notes: row.notes || '', entry_type: row.entry_type,
  });

  window.getNutriFlowUserId = () => activeUser?.id || null;
  window.isNutriFlowAccountActive = () => Boolean(activeUser);

  window.loginWithSupabase = async () => {
    const emailInput = document.getElementById('login-email');
    const email = emailInput.value.trim();
    const password = document.getElementById('login-password').value;
    if (!emailInput.checkValidity()) return showToast('Confira o formato do seu e-mail.');
    if (!password) return showToast('Informe sua senha.');
    try {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) showToast('Não foi possível entrar. Confira seus dados e tente novamente.');
    } catch { showToast('Não foi possível conectar agora. Verifique a internet e tente novamente.'); }
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
    try {
      const { data, error } = await client.auth.signUp({ email, password, options: { data: { display_name: name }, emailRedirectTo: location.origin } });
      if (error) return showToast('Não foi possível criar a conta. Confira os campos e tente novamente.');
      if (!data.session) showToast('Conta criada. Confira seu e-mail para confirmar o cadastro.');
    } catch { showToast('Não foi possível conectar agora. Verifique a internet e tente novamente.'); }
  };

  window.recoverSupabasePassword = async () => {
    const emailInput = document.getElementById('login-email');
    const email = emailInput.value.trim();
    if (!emailInput.checkValidity()) return showToast('Confira o formato do seu e-mail.');
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
      showToast(error ? 'Não foi possível enviar as instruções agora.' : 'Se houver uma conta, você receberá instruções por e-mail.');
    } catch { showToast('Não foi possível conectar agora. Tente novamente mais tarde.'); }
  };

  window.saveNewPassword = async () => {
    const password = document.getElementById('reset-password').value;
    const confirmation = document.getElementById('reset-password-confirm').value;
    if (password.length < 8) return showToast('A senha precisa ter pelo menos 8 caracteres.');
    if (password !== confirmation) return showToast('As senhas não correspondem.');
    try {
      const { error } = await client.auth.updateUser({ password });
      if (error) return showToast('Não foi possível atualizar a senha. Abra novamente o link de recuperação e tente outra vez.');
      passwordRecovery = false;
      history.replaceState(null, '', location.pathname);
      const { data } = await client.auth.getUser();
      if (data.user) await load(data.user);
      showToast('Senha atualizada.');
    } catch { showToast('Não foi possível conectar agora. Abra novamente o link e tente outra vez.'); }
  };

  window.readMeals = () => {
    if (activeUser) return readLocal(accountKey(activeUser.id));
    const merged = new Map([...readLocal(demoKey), ...readLocal(legacyDemoKey)].map(item => [item.id, item]));
    return [...merged.values()];
  };
  window.saveMeals = items => {
    const user = activeUser;
    const storageKey = accountKey(user?.id);
    const previousItems = window.readMeals();
    try { localStorage.setItem(storageKey, JSON.stringify(items)); }
    catch { showToast('O armazenamento deste dispositivo está cheio. Libere espaço e tente novamente.'); return false; }
    if (!user) { try { localStorage.removeItem(legacyDemoKey); } catch {} }
    const previousById = new Map(previousItems.map(item => [item.id, JSON.stringify(item)]));
    const changedItems = items.filter(item => previousById.get(item.id) !== JSON.stringify(item));
    if (user && changedItems.length) {
      const pendingIds = getPendingIds(user.id);
      changedItems.forEach(item => pendingIds.add(item.id));
      savePendingIds(user.id, pendingIds);
      setSyncStatus('Sincronizando');
      client.from('meal_entries').upsert(changedItems.map(item => toRow(item, user.id)), { onConflict: 'id' })
        .then(({ error }) => {
          if (activeUser?.id !== user.id) return;
          if (error) { setSyncStatus('Pendente'); showToast('Salvo neste dispositivo. A sincronização está pendente; tente novamente mais tarde.'); }
          else {
            const latestPending = getPendingIds(user.id);
            changedItems.forEach(item => latestPending.delete(item.id));
            savePendingIds(user.id, latestPending);
            setSyncStatus('Atualizado');
          }
        })
        .catch(() => {
          if (activeUser?.id === user.id) { setSyncStatus('Pendente'); showToast('Salvo neste dispositivo. A sincronização está pendente; tente novamente mais tarde.'); }
        });
    }
    return true;
  };

  const retryPendingSync = async () => {
    const user = activeUser;
    if (!user || !navigator.onLine) return;
    const pendingIds = getPendingIds(user.id);
    const items = readLocal(accountKey(user.id)).filter(item => pendingIds.has(item.id));
    if (!items.length) { setSyncStatus('Atualizado'); return; }
    setSyncStatus('Sincronizando');
    try {
      const { error } = await client.from('meal_entries').upsert(items.map(item => toRow(item, user.id)), { onConflict: 'id' });
      if (activeUser?.id !== user.id) return;
      if (error) { setSyncStatus('Pendente'); return; }
      items.forEach(item => pendingIds.delete(item.id));
      savePendingIds(user.id, pendingIds);
      setSyncStatus('Atualizado');
      const accountState = document.getElementById('account-state');
      if (accountState) accountState.textContent = 'Conta sincronizada';
    } catch {
      if (activeUser?.id === user.id) setSyncStatus('Pendente');
    }
  };

  window.deleteMeal = async id => {
    const user = activeUser;
    if (user) {
      try {
        const { error } = await client.from('meal_entries').delete().eq('id', id).eq('user_id', user.id);
        if (error) return showToast('Não foi possível remover o registro. Tente novamente.');
      } catch { return showToast('Sem conexão. O registro continua salvo; tente remover novamente quando voltar à internet.'); }
    }
    const storageKey = accountKey(user?.id);
    const currentItems = user ? readLocal(storageKey) : window.readMeals();
    const next = currentItems.filter(meal => meal.id !== id);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { return showToast('Não foi possível atualizar os dados neste dispositivo.'); }
    if (!user) { try { localStorage.removeItem(legacyDemoKey); } catch {} }
    if (user) {
      const pendingIds = getPendingIds(user.id);
      pendingIds.delete(id);
      savePendingIds(user.id, pendingIds);
    }
    if (user && activeUser?.id === user.id) setSyncStatus('Atualizado');
    renderMeals();
    showToast('Registro removido.');
  };

  const load = async user => {
    if (!user) return;
    activeUser = user;
    const loadId = ++currentLoad;
    setSyncStatus('Carregando');
    let result;
    try {
      result = await client.from('meal_entries')
        .select('id,entry_type,meal_kind,name,entry_date,notes')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });
    } catch {
      if (loadId === currentLoad) {
        setSyncStatus('Pendente');
        renderMeals();
        goTo('dash');
        showToast('Sem conexão. Mostrando os registros salvos neste dispositivo.');
      }
      return;
    }
    if (loadId !== currentLoad) return;
    if (result.error) {
      setSyncStatus('Pendente');
      renderMeals();
      goTo('dash');
      return showToast('Não foi possível sincronizar agora. Mostrando os registros salvos neste dispositivo.');
    }

    let remoteItems = (result.data || []).map(fromRow);
    const localKey = accountKey(user.id);
    const cachedItems = readLocal(localKey);
    const pendingIds = getPendingIds(user.id);
    const remoteIds = new Set(remoteItems.map(item => item.id));
    remoteIds.forEach(id => pendingIds.delete(id));
    savePendingIds(user.id, pendingIds);
    const pendingItems = cachedItems.filter(item => pendingIds.has(item.id) && !remoteIds.has(item.id));

    // Offer a one-time, explicit transfer of demo records to this account.
    const demoItems = [...new Map([...readLocal(demoKey), ...readLocal(legacyDemoKey)].map(item => [item.id, item])).values()];
    let transferDemo = false;
    let transferAsked = false;
    try { transferAsked = sessionStorage.getItem(`nutriflow.demo-transfer.${user.id}`) === '1'; } catch {}
    if (demoItems.length && !transferAsked) {
      transferDemo = confirm(`Encontramos ${demoItems.length} registro(s) da demonstração neste navegador. Deseja copiá-los para a conta ${user.email || 'conectada'}?`);
      try { sessionStorage.setItem(`nutriflow.demo-transfer.${user.id}`, '1'); } catch {}
    }
    const importItems = transferDemo ? demoItems.filter(item => !remoteIds.has(item.id) && !pendingItems.some(pending => pending.id === item.id)) : [];
    const syncItems = [...pendingItems, ...importItems];
    let syncFailed = false;
    if (syncItems.length) {
      try {
        const { error } = await client.from('meal_entries').upsert(syncItems.map(item => toRow(item, user.id)), { onConflict: 'id' });
        syncFailed = Boolean(error);
      } catch { syncFailed = true; }
      if (loadId !== currentLoad) return;
      if (!syncFailed) {
        remoteItems = [...remoteItems, ...syncItems];
        syncItems.forEach(item => pendingIds.delete(item.id));
        savePendingIds(user.id, pendingIds);
      }
    }

    const merged = [...remoteItems];
    const mergedIds = new Set(merged.map(item => item.id));
    for (const item of [...pendingItems, ...(syncFailed ? importItems : [])]) {
      if (!mergedIds.has(item.id)) { merged.push(item); mergedIds.add(item.id); }
    }
    try { localStorage.setItem(localKey, JSON.stringify(merged)); } catch {}
    if (transferDemo && !syncFailed) {
      try { localStorage.removeItem(demoKey); localStorage.removeItem(legacyDemoKey); localStorage.removeItem('nutriflow.pet.unlocked.demo'); } catch {}
    }

    let profile = { data: null };
    try { profile = await client.from('profiles').select('display_name').eq('id', user.id).maybeSingle(); } catch {}
    if (loadId !== currentLoad) return;
    document.querySelectorAll('.profile-name').forEach(element => {
      element.textContent = profile.data?.display_name || user.user_metadata?.display_name || 'Seu espaço';
    });
    const accountState = document.getElementById('account-state');
    if (accountState) accountState.textContent = syncFailed ? 'Sincronização pendente' : 'Conta sincronizada';
    setSyncStatus(syncFailed ? 'Pendente' : 'Atualizado');
    const notice = document.getElementById('storage-notice');
    if (notice) notice.textContent = 'Seus registros estão associados à sua conta e protegidos por políticas de acesso. Use somente as informações que deseja salvar.';
    const profileNotice = document.getElementById('profile-storage-notice');
    if (profileNotice) profileNotice.textContent = 'Seus registros ficam salvos na sua conta e você pode acessá-los ao entrar novamente.';
    const dataTitle = document.getElementById('data-settings-title');
    if (dataTitle) dataTitle.textContent = 'Dados da sua conta';
    const deleteLabel = document.getElementById('clear-data-label');
    if (deleteLabel) deleteLabel.textContent = 'Apagar todos os meus registros';
    renderMeals();
    goTo('dash');
    showToast(syncFailed ? 'Sua conta abriu. Alguns registros ainda aguardam sincronização.' : 'Você entrou na sua conta.');
  };

  window.signOutNutriFlow = async () => {
    try {
      const { error } = await client.auth.signOut();
      if (error) return showToast('Não foi possível sair da conta.');
      currentLoad++;
      activeUser = null;
      setSyncStatus('Local');
      goTo('login');
    } catch { showToast('Não foi possível sair agora. Tente novamente.'); }
  };

  window.clearDemoData = async () => {
    if (!confirm(activeUser ? 'Apagar todos os seus registros da conta e deste dispositivo? Esta ação não pode ser desfeita.' : 'Apagar todos os registros desta demonstração neste dispositivo?')) return;
    const user = activeUser;
    if (user) {
      try {
        const { error } = await client.from('meal_entries').delete().eq('user_id', user.id);
        if (error) return showToast('Não foi possível apagar os registros da conta. Tente novamente.');
      } catch { return showToast('Sem conexão. Seus registros não foram apagados. Tente novamente mais tarde.'); }
    }
    try {
      localStorage.removeItem(accountKey(user?.id));
      localStorage.removeItem(`nutriflow.pet.unlocked.${user?.id || 'demo'}`);
      if (!user) { localStorage.removeItem(demoKey); localStorage.removeItem(legacyDemoKey); localStorage.removeItem('nutriflow.pet.unlocked.demo'); }
    } catch { return showToast('Não foi possível apagar os dados deste dispositivo.'); }
    setSyncStatus(user ? 'Atualizado' : 'Local');
    renderMeals();
    showToast('Registros apagados.');
  };

  client.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') { passwordRecovery = true; goTo('reset'); return; }
    if (session?.user) {
      if (passwordRecovery) goTo('reset');
      else if (activeUser?.id !== session.user.id) setTimeout(() => load(session.user), 0);
    } else {
      currentLoad++;
      activeUser = null;
    }
  });
  client.auth.getSession().then(({ data, error }) => {
    if (error) { setSyncStatus('Offline'); return; }
    if (data.session?.user) {
      if (passwordRecovery) goTo('reset');
      else if (activeUser?.id !== data.session.user.id) load(data.session.user);
    }
  }).catch(() => setSyncStatus('Offline'));
  window.addEventListener('online', retryPendingSync);
})();
