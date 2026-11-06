# NutriFlow static frontend sem espera de inicialização

## Objetivo
Preparar e publicar uma segunda versão gratuita do NutriFlow como Render Static Site, mantendo o Web Service Node atual intacto como opção de retorno.

## Contexto
O Web Service gratuito do Render dorme após inatividade. O frontend atual é servido pelo mesmo processo Node e mostra a tela de inicialização enquanto o serviço acorda. Login e dados de refeições usam Supabase diretamente; a IA é local, mas hoje o cliente consulta o endpoint Node apenas para conferir a cota. A cobrança segue desligada.

## Agente responsável
Codex.

## Arquivos que podem ser modificados
- `render.static.yaml`
- `index.html`
- `service-worker.js`
- `supabase/config.example.js`
- `README.md`
- `docs/PRODUCTION_READINESS.md`
- `docs/SUPABASE_SETUP.md`
- `docs/tasks/2026-11-06-static-frontend-no-cold-start.md`
- `scripts/build-static.mjs`
- `.gitignore`

## Arquivos que não devem ser modificados
- `billing.js` e rotas de pagamento
- Migrações e dados do Supabase de produção
- Credenciais e segredos

## Critérios de aceitação
- [ ] A versão estática publica apenas os arquivos necessários para o PWA.
- [ ] Com cobrança desligada, assistente local e resumo semanal não fazem chamadas ao Web Service Node.
- [ ] Checkout deixa claro que ainda não está disponível e não inicia requisição/cobrança.
- [ ] O Web Service existente e o endereço atual continuam intactos.
- [ ] O novo endereço HTTPS é instalável como PWA e usa o mesmo projeto Supabase.
- [ ] Os URLs de autenticação incluem o novo host depois que o Render fornecer o endereço.

## Testes obrigatórios
- [ ] Conferir estado do deploy estático e abrir o endereço HTTPS público.
- [ ] Não executar testes automatizados nesta tarefa.
- [ ] Fazer teste de confirmação/login e instalação no celular com o usuário após o novo URL ser permitido.

## Resultado esperado
Uma versão estática gratuita, com carregamento imediato da interface, sem apagar nem substituir o serviço atual. Checkout permanece desligado até configuração e validação em sandbox.

## Relatório final do agente
- Resumo: pacote estático separado preparado; execução final do deploy e liberação do redirect de Auth pendentes.
- Arquivos alterados: `README.md`, `index.html`, `render.static.yaml`, `scripts/build-static.mjs`, `service-worker.js`, `supabase/config.example.js`.
- Testes/comandos executados e resultados: `node scripts/build-static.mjs` gerou somente os arquivos permitidos; `git diff --check` passou. Testes automatizados não executados conforme escopo.
- Limitações ou riscos: checkout bloqueado até configuração do Mercado Pago e CORS; o novo host precisa entrar na allowlist de Auth para links de e-mail.
- Branch/pull request: `codex/free-static-front-end`.

## Revisão do outro agente
- Comentários:
- Problemas encontrados:
- Aprovação para revisão do usuário: sim/não
