(() => {
  const showAuthFeedback = (form, message, state = 'info') => {
    const feedback = document.getElementById(`${form}-feedback`);
    if (!feedback) return;
    feedback.textContent = message;
    feedback.dataset.state = state;
    feedback.hidden = !message;
  };
  const setButtonBusy = (id, busy, busyText, idleText) => {
    const button = document.getElementById(id);
    if (!button) return;
    button.disabled = busy;
    button.textContent = busy ? busyText : idleText;
  };
  const bindAuthForms = () => {
    document.getElementById('login-form')?.addEventListener('submit', event => {
      event.preventDefault();
      window.loginWithSupabase();
    });
    document.getElementById('signup-form')?.addEventListener('submit', event => {
      event.preventDefault();
      window.registerWithSupabase();
    });
  };
  const installUnavailableAuth = () => {
    const message = 'O serviço de contas não carregou. Confira sua conexão e atualize o app para tentar novamente.';
    window.getNutriFlowUserId = () => null;
    window.isNutriFlowAccountActive = () => false;
    window.getNutriFlowAccessToken = async () => null;
    window.readMeals = () => [];
    window.saveMeals = () => { showAuthFeedback('login', message, 'error'); goTo('login'); return false; };
    window.loginWithSupabase = async () => showAuthFeedback('login', message, 'error');
    window.registerWithSupabase = async () => showAuthFeedback('signup', message, 'error');
    window.resendSignupConfirmation = async () => showAuthFeedback('signup', message, 'error');
    window.resendLoginConfirmation = async () => showAuthFeedback('login', message, 'error');
    window.recoverSupabasePassword = async () => showAuthFeedback('login', message, 'error');
    window.saveNewPassword = async () => showAuthFeedback('login', message, 'error');
    window.signOutNutriFlow = async () => { goTo('login'); };
    window.clearAccountData = async () => showAuthFeedback('login', message, 'error');
    bindAuthForms();
  };

  const cfg = window.NUTRIFLOW_SUPABASE;
  if (!cfg?.url || !cfg?.publishableKey || !window.supabase?.createClient) {
    installUnavailableAuth();
    return;
  }

  let client;
  try {
    client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
    });
  } catch {
    installUnavailableAuth();
    return;
  }
  const legacyLocalMealKeys = ['nutriflow.demo.meals', 'nutriflow.meals.demo'];
  let activeUser = null;
  let passwordRecovery = location.hash.includes('type=recovery');
  let currentLoad = 0;

  const setSyncStatus = value => {
    const status = document.getElementById('sync-status-home');
    if (status) status.textContent = value;
  };
  const accountKey = userId => userId ? `nutriflow.meals.${userId}` : null;
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
  window.getNutriFlowAccessToken = async () => {
    try {
      const { data, error } = await client.auth.getSession();
      return error ? null : data.session?.access_token || null;
    } catch { return null; }
  };

  const resendConfirmation = async (form, buttonId) => {
    const emailInput = document.getElementById(`${form}-email`);
    const email = emailInput?.value.trim() || '';
    if (!emailInput?.checkValidity()) return showAuthFeedback(form, 'Confira o e-mail antes de pedir outro link de confirmação.', 'error');
    const button = document.getElementById(buttonId);
    if (button) button.disabled = true;
    try {
      const { error } = await client.auth.resend({ type: 'signup', email, options: { emailRedirectTo: location.origin } });
      showAuthFeedback(form, error
        ? 'Não consegui reenviar agora. Aguarde um pouco e confira o e-mail informado.'
        : 'Se este endereço puder ser confirmado, um novo link chegará em instantes. Confira também o spam.', error ? 'error' : 'success');
    } catch {
      showAuthFeedback(form, 'Não foi possível conectar para reenviar. Verifique a internet e tente novamente.', 'error');
    } finally {
      if (button) button.disabled = false;
    }
  };
  window.loginWithSupabase = async () => {
    const emailInput = document.getElementById('login-email');
    const email = emailInput.value.trim();
    const password = document.getElementById('login-password').value;
    if (!emailInput.checkValidity()) return showAuthFeedback('login', 'Confira o formato do seu e-mail.', 'error');
    if (!password) return showAuthFeedback('login', 'Digite sua senha para entrar.', 'error');
    showAuthFeedback('login', 'Conectando à sua conta…');
    setButtonBusy('login-submit', true, 'Entrando…', 'Entrar');
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        const needsConfirmation = error.code === 'email_not_confirmed';
        const message = needsConfirmation
          ? 'Confirme seu e-mail pelo link enviado antes de entrar.'
          : 'Não foi possível entrar. Confira o e-mail e a senha ou use “Esqueci minha senha”.';
        if (needsConfirmation) {
          document.getElementById('login-resend').hidden = false;
        }
        showAuthFeedback('login', message, 'error');
      } else if (!data.session) {
        showAuthFeedback('login', 'Sua sessão não foi iniciada. Confirme seu e-mail e tente novamente.', 'error');
      } else {
        document.getElementById('login-resend').hidden = true;
      }
    } catch {
      showAuthFeedback('login', 'Não foi possível conectar agora. Verifique a internet e tente novamente.', 'error');
    } finally {
      setButtonBusy('login-submit', false, '', 'Entrar');
    }
  };

  window.registerWithSupabase = async () => {
    const name = document.getElementById('signup-name').value.trim();
    const emailInput = document.getElementById('signup-email');
    const email = emailInput.value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmation = document.getElementById('signup-password-confirm').value;
    if (!name) return showAuthFeedback('signup', 'Informe como podemos chamar você.', 'error');
    if (!emailInput.checkValidity()) return showAuthFeedback('signup', 'Confira o formato do seu e-mail.', 'error');
    if (password.length < 8) return showAuthFeedback('signup', 'Sua senha precisa ter pelo menos 8 caracteres.', 'error');
    if (password !== confirmation) return showAuthFeedback('signup', 'As senhas não correspondem.', 'error');
    showAuthFeedback('signup', 'Criando sua conta…');
    document.getElementById('signup-resend').hidden = true;
    setButtonBusy('signup-submit', true, 'Criando conta…', 'Criar minha conta');
    try {
      const { data, error } = await client.auth.signUp({ email, password, options: { data: { display_name: name }, emailRedirectTo: location.origin } });
      if (error) {
        const message = error.code === 'over_email_send_rate_limit'
          ? 'Muitos pedidos de confirmação. Aguarde alguns minutos e tente novamente.'
          : error.code === 'weak_password'
            ? 'Escolha uma senha mais forte, com pelo menos 8 caracteres.'
            : 'Não foi possível criar a conta. Tente entrar ou recuperar a senha se já tiver cadastro.';
        showAuthFeedback('signup', message, 'error');
        return;
      }
      if (data.session) {
        showAuthFeedback('signup', 'Conta criada. Abrindo seu espaço…', 'success');
      } else {
        document.getElementById('signup-resend').hidden = false;
        showAuthFeedback('signup', 'Quase pronto: confira sua caixa de entrada e o spam para confirmar o e-mail. Depois, volte e entre na conta.', 'success');
      }
    } catch {
      showAuthFeedback('signup', 'Não foi possível conectar agora. Verifique a internet e tente novamente.', 'error');
    } finally {
      setButtonBusy('signup-submit', false, '', 'Criar minha conta');
    }
  };

  window.resendSignupConfirmation = async () => {
    return resendConfirmation('signup', 'signup-resend');
  };
  window.resendLoginConfirmation = async () => resendConfirmation('login', 'login-resend');

  window.recoverSupabasePassword = async () => {
    const emailInput = document.getElementById('login-email');
    const email = emailInput.value.trim();
    if (!emailInput.checkValidity()) return showAuthFeedback('login', 'Digite um e-mail válido para receber a recuperação.', 'error');
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
      showAuthFeedback('login', error ? 'Não foi possível enviar as instruções agora. Tente novamente em instantes.' : 'Se houver uma conta com esse e-mail, você receberá instruções para redefinir a senha.', error ? 'error' : 'success');
    } catch { showAuthFeedback('login', 'Não foi possível conectar agora. Tente novamente mais tarde.', 'error'); }
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
    if (!activeUser) return [];
    return readLocal(accountKey(activeUser.id));
  };
  window.saveMeals = items => {
    const user = activeUser;
    if (!user) {
      showAuthFeedback('login', 'Entre ou crie uma conta para salvar seus registros.', 'error');
      goTo('login');
      return false;
    }
    const storageKey = accountKey(user?.id);
    const previousItems = window.readMeals();
    try { localStorage.setItem(storageKey, JSON.stringify(items)); }
    catch { showToast('O armazenamento deste dispositivo está cheio. Libere espaço e tente novamente.'); return false; }
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
    if (!user) { goTo('login'); return showAuthFeedback('login', 'Entre na sua conta para gerenciar seus registros.', 'error'); }
    try {
      const { error } = await client.from('meal_entries').delete().eq('id', id).eq('user_id', user.id);
      if (error) return showToast('Não foi possível remover o registro. Tente novamente.');
    } catch { return showToast('Sem conexão. O registro continua salvo; tente remover novamente quando voltar à internet.'); }
    const storageKey = accountKey(user.id);
    const currentItems = readLocal(storageKey);
    const next = currentItems.filter(meal => meal.id !== id);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { return showToast('Não foi possível atualizar os dados neste dispositivo.'); }
    const pendingIds = getPendingIds(user.id);
    pendingIds.delete(id);
    savePendingIds(user.id, pendingIds);
    if (activeUser?.id === user.id) setSyncStatus('Atualizado');
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

    // Preserve older device-only records by offering a one-time, explicit import.
    const legacyItems = [...new Map(legacyLocalMealKeys.flatMap(readLocal).map(item => [item.id, item])).values()];
    let transferLegacy = false;
    let transferAsked = false;
    try { transferAsked = sessionStorage.getItem(`nutriflow.legacy-import.${user.id}`) === '1'; } catch {}
    if (legacyItems.length && !transferAsked) {
      transferLegacy = confirm(`Encontramos ${legacyItems.length} registro(s) salvos neste aparelho sem uma conta. Deseja copiá-los para a conta ${user.email || 'conectada'}?`);
      try { sessionStorage.setItem(`nutriflow.legacy-import.${user.id}`, '1'); } catch {}
    }
    const importItems = transferLegacy ? legacyItems.filter(item => !remoteIds.has(item.id) && !pendingItems.some(pending => pending.id === item.id)) : [];
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
      } else if (importItems.length) {
        importItems.forEach(item => pendingIds.add(item.id));
        savePendingIds(user.id, pendingIds);
      }
    }

    const merged = [...remoteItems];
    const mergedIds = new Set(merged.map(item => item.id));
    for (const item of [...pendingItems, ...(syncFailed ? importItems : [])]) {
      if (!mergedIds.has(item.id)) { merged.push(item); mergedIds.add(item.id); }
    }
    try { localStorage.setItem(localKey, JSON.stringify(merged)); } catch {}
    if (transferLegacy && !syncFailed) {
      try { legacyLocalMealKeys.forEach(key => localStorage.removeItem(key)); localStorage.removeItem('nutriflow.pet.unlocked.demo'); } catch {}
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
      renderMeals();
      setSyncStatus('Sessão encerrada');
      goTo('login');
      showAuthFeedback('login', 'Você saiu da conta. Entre novamente para continuar.', 'success');
    } catch { showToast('Não foi possível sair agora. Tente novamente.'); }
  };

  window.clearAccountData = async () => {
    const user = activeUser;
    if (!user) { goTo('login'); return showAuthFeedback('login', 'Entre na sua conta para gerenciar seus registros.', 'error'); }
    if (!confirm('Apagar todos os seus registros da conta e deste aparelho? Esta ação não pode ser desfeita.')) return;
    if (user) {
      try {
        const { error } = await client.from('meal_entries').delete().eq('user_id', user.id);
        if (error) return showToast('Não foi possível apagar os registros da conta. Tente novamente.');
      } catch { return showToast('Sem conexão. Seus registros não foram apagados. Tente novamente mais tarde.'); }
    }
    try {
      localStorage.removeItem(accountKey(user.id));
      localStorage.removeItem(`nutriflow.pet.unlocked.${user.id}`);
    } catch { return showToast('Não foi possível apagar os dados deste dispositivo.'); }
    setSyncStatus(user ? 'Atualizado' : 'Local');
    renderMeals();
    showToast('Registros apagados.');
  };

  bindAuthForms();
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') { passwordRecovery = true; goTo('reset'); return; }
    if (session?.user) {
      if (passwordRecovery) goTo('reset');
      else if (activeUser?.id !== session.user.id) setTimeout(() => load(session.user), 0);
      try {
        const pendingCheckout = sessionStorage.getItem('nutriflow.pending-checkout');
        if (pendingCheckout === 'base' || pendingCheckout === 'ai') {
          sessionStorage.removeItem('nutriflow.pending-checkout');
          setTimeout(() => window.startNutriFlowCheckout?.(pendingCheckout), 700);
        }
      } catch {}
    } else {
      const hadActiveUser = Boolean(activeUser);
      currentLoad++;
      activeUser = null;
      if (hadActiveUser) {
        renderMeals();
        goTo('login');
        showAuthFeedback('login', 'Sua sessão terminou. Entre novamente para acessar seus registros.', 'error');
      }
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
