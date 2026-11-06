import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const appSource = await readFile(new URL('../supabase-app.js', import.meta.url), 'utf8');
const htmlSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function makeElement(id) {
  return {
    id,
    value: '',
    textContent: '',
    hidden: false,
    disabled: false,
    dataset: {},
    listeners: {},
    checkValidity: () => true,
    addEventListener(type, listener) { this.listeners[type] = listener; },
    setAttribute() {},
    removeAttribute() {},
  };
}

function bootAuth({ configured = true, signUp, signIn, resend } = {}) {
  const storage = new Map();
  const elements = new Map();
  const getElement = id => {
    if (!elements.has(id)) elements.set(id, makeElement(id));
    return elements.get(id);
  };
  [
    'login-form', 'login-email', 'login-password', 'login-submit', 'login-feedback', 'login-resend',
    'signup-form', 'signup-name', 'signup-email', 'signup-password', 'signup-password-confirm',
    'signup-submit', 'signup-feedback', 'signup-resend', 'sync-status-home',
  ].forEach(getElement);
  const client = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange() {},
      signUp: signUp || (async () => ({ data: { user: { id: 'test-user' }, session: null }, error: null })),
      signInWithPassword: signIn || (async () => ({ data: { session: null }, error: null })),
      resend: resend || (async () => ({ error: null })),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null } }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select() { return this; },
      eq() { return this; },
      order: async () => ({ data: [], error: null }),
      upsert: async () => ({ error: null }),
      delete() { return this; },
      maybeSingle: async () => ({ data: null, error: null }),
    }),
  };
  const window = {
    NUTRIFLOW_SUPABASE: configured ? { url: 'https://project.supabase.co', publishableKey: 'public-test-key' } : null,
    supabase: configured ? { createClient: () => client } : undefined,
    addEventListener() {},
  };
  const localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
  };
  const context = {
    window,
    document: { getElementById: getElement, querySelectorAll: () => [], querySelector: () => null },
    location: { hash: '', origin: 'https://nutriflow-0yvi.onrender.com', pathname: '/' },
    localStorage,
    sessionStorage: localStorage,
    navigator: { onLine: true },
    history: { replaceState() {} },
    confirm: () => false,
    goTo() {},
    renderMeals() {},
    showToast() {},
    setTimeout,
    clearTimeout,
    fetch: async () => ({ ok: true, json: async () => ({}) }),
  };
  vm.runInNewContext(appSource, context, { filename: 'supabase-app.js' });
  return { window, elements, storage };
}

test('sem Supabase, não libera sessão nem salva registros anônimos', async () => {
  const { window, elements, storage } = bootAuth({ configured: false });
  assert.equal(window.isNutriFlowAccountActive(), false);
  assert.equal(window.readMeals().length, 0);
  assert.equal(window.saveMeals([{ id: 'x', name: 'Teste', date: '2026-01-01' }]), false);
  await window.registerWithSupabase();
  assert.match(elements.get('signup-feedback').textContent, /serviço de contas não carregou/i);
  assert.equal(storage.size, 0);
});

test('com Supabase carregado mas sem sessão, salvar exige login', () => {
  const { window, elements, storage } = bootAuth();
  assert.equal(window.isNutriFlowAccountActive(), false);
  assert.equal(window.saveMeals([{ id: 'x', name: 'Teste', date: '2026-01-01' }]), false);
  assert.match(elements.get('login-feedback').textContent, /entre ou crie uma conta/i);
  assert.equal(storage.size, 0);
});

test('cadastro valida a confirmação da senha sem chamar Supabase', async () => {
  let called = false;
  const { window, elements } = bootAuth({ signUp: async () => { called = true; return { data: {}, error: null }; } });
  elements.get('signup-name').value = 'Rafa';
  elements.get('signup-email').value = 'rafa@example.com';
  elements.get('signup-password').value = 'senha-segura';
  elements.get('signup-password-confirm').value = 'outra-senha';
  await window.registerWithSupabase();
  assert.equal(called, false);
  assert.match(elements.get('signup-feedback').textContent, /senhas não correspondem/i);
});

test('cadastro envia nome, senha e redirect; não promete envio nem oferece reenvio repetido', async () => {
  let signupArgs;
  const { window, elements } = bootAuth({
    signUp: async args => { signupArgs = args; return { data: { user: { id: 'test-user' }, session: null }, error: null }; },
  });
  elements.get('signup-name').value = 'Rafa';
  elements.get('signup-email').value = 'rafa@example.com';
  elements.get('signup-password').value = 'senha-segura';
  elements.get('signup-password-confirm').value = 'senha-segura';
  await window.registerWithSupabase();
  assert.equal(signupArgs.email, 'rafa@example.com');
  assert.equal(signupArgs.password, 'senha-segura');
  assert.equal(signupArgs.options.data.display_name, 'Rafa');
  assert.equal(signupArgs.options.emailRedirectTo, 'https://nutriflow-0yvi.onrender.com');
  assert.equal(elements.get('signup-resend').hidden, true);
  assert.match(elements.get('signup-feedback').textContent, /não consigo confirmar que um link foi enviado/i);
  assert.match(elements.get('signup-feedback').textContent, /link, não por código/i);
  assert.match(elements.get('signup-feedback').textContent, /evitar bloqueio por excesso de tentativas/i);
});

test('cadastro explica quando o Supabase bloqueia e-mail externo sem SMTP próprio', async () => {
  const { window, elements } = bootAuth({
    signUp: async () => ({ data: { user: null, session: null }, error: { code: 'email_address_not_authorized' } }),
  });
  elements.get('signup-name').value = 'Pessoa de teste';
  elements.get('signup-email').value = 'teste@cliente.example';
  elements.get('signup-password').value = 'senha-segura';
  elements.get('signup-password-confirm').value = 'senha-segura';
  await window.registerWithSupabase();
  assert.match(elements.get('signup-feedback').textContent, /precisa ser configurado pela equipe do NutriFlow/i);
  assert.match(elements.get('signup-feedback').textContent, /não fique repetindo/i);
});

test('login informa quando falta confirmar o e-mail', async () => {
  let resendArgs;
  const { window, elements } = bootAuth({
    signIn: async () => ({ data: { session: null }, error: { code: 'email_not_confirmed' } }),
    resend: async args => { resendArgs = args; return { error: null }; },
  });
  elements.get('login-email').value = 'rafa@example.com';
  elements.get('login-password').value = 'senha-segura';
  await window.loginWithSupabase();
  assert.match(elements.get('login-feedback').textContent, /confirme seu e-mail/i);
  assert.equal(elements.get('login-resend').hidden, false);
  assert.equal(elements.get('login-submit').disabled, false);
  await window.resendLoginConfirmation();
  assert.equal(resendArgs.type, 'signup');
  assert.equal(resendArgs.email, 'rafa@example.com');
  assert.match(elements.get('login-feedback').textContent, /novo link/i);
});

test('a tela pública não oferece a demonstração sem conta', () => {
  assert.doesNotMatch(htmlSource, /Experimentar demonstração|Explorar demonstração|goToDash/);
  assert.match(htmlSource, /id="signup-form"/);
  assert.match(htmlSource, /id="login-form"/);
  assert.match(htmlSource, /if\(name==='dash'&&!window\.isNutriFlowAccountActive\?\.\(\)\)/);
  assert.match(htmlSource, /if\(!window\.isNutriFlowAccountActive\?\.\(\)\)/);
  assert.match(htmlSource, /function readMeals\(\)\{return \[\]\}/);
});
