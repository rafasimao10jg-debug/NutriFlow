# Exigir conta e remover o modo demonstração

## Objetivo
Tornar cadastro e login por Supabase Auth o caminho necessário para acessar o app, remover o modo demonstração da interface e deixar o cadastro compreensível, acessível e recuperável quando a confirmação por e-mail estiver ativa.

## Contexto
O protótipo permite abrir o painel e gravar refeições sem uma conta, e o cadastro está escondido entre textos de demonstração. O app já usa Supabase Auth e Postgres com RLS; a interface deve exigir sessão real antes de abrir telas e salvar registros.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `index.html`
- `supabase-app.js`
- `service-worker.js`
- `README.md`
- `docs/PRODUCT_CONTENT.md`
- `docs/SUPABASE_SETUP.md`
- `docs/LAUNCH_AND_META.md`
- `docs/tasks/2026-11-05-require-account-remove-demo.md`
- `package.json`
- `tests/auth.test.js`

## Arquivos que não devem ser modificados
- Segredos e credenciais.
- Migrações existentes e regras de cobrança.
- Configuração de produção no Render ou Supabase Dashboard.

## Critérios de aceitação
- [x] Não há caminho de demonstração ou gravação anônima na interface.
- [x] Painel, navegação e salvamento de refeições exigem uma sessão autenticada.
- [x] Cadastro, login, confirmação e reenvio de confirmação apresentam estados claros e acessíveis.
- [x] Dados locais antigos sem conta só são transferidos com consentimento explícito.
- [x] Falha do SDK/configuração do Supabase é apresentada claramente e não abre o painel.
- [x] URLs de confirmação e recuperação estão documentadas para o domínio público atual.
- [x] Cache da PWA atualizado para expor a nova tela de conta.

## Testes obrigatórios
- [ ] `node --test tests/auth.test.js` com cliente Supabase simulado; não executado nesta revisão.
- [x] Verificação de sintaxe JavaScript e `git diff --check`.
- [ ] Cadastro ponta a ponta com confirmação real por e-mail ainda requer conta de teste do usuário.

## Resultado esperado
Uma pessoa pode criar a conta e confirmar o e-mail, entrar, salvar registros associados à própria conta e voltar depois para sincronizá-los. O app não oferece demonstração sem conta.

## Relatório final do agente
- Resumo: removida a demonstração sem conta; o cadastro exige sessão para acessar o painel e inclui estado de confirmação e reenvio do e-mail.
- Arquivos alterados: `index.html`, `supabase-app.js`, `service-worker.js`, `package.json`, `README.md`, documentação Supabase, produto e lançamento, testes e este arquivo.
- Verificações executadas e resultados: `node --check supabase-app.js`, `node --check server.js`, leitura sintática do `package.json` e `git diff --check` passaram. A suíte `node --test tests/auth.test.js` e o cadastro real ainda precisam ser executados.
- Limitações ou riscos: confirmação de e-mail depende de o domínio Render estar autorizado em Supabase Auth URL Configuration e de envio de e-mail ativo. Auth remoto informa cadastro habilitado e confirmação exigida; nenhum usuário real foi criado durante a validação. Termos, política de privacidade e exclusão de conta continuam pendentes para lançamento público.
- Branch/pull request: `codex/account-required-remove-demo`.

## Revisão do outro agente
- Comentários: não disponível nesta tarefa.
- Problemas encontrados:
- Aprovação para revisão do usuário: sim/não
