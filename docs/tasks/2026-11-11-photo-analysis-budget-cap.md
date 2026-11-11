# Tarefa — limite mensal de custo para análise por foto

## Objetivo
Aplicar um teto operacional persistente à análise de prato por foto, dentro do limite mensal de R$ 10 informado pelo responsável, e alinhar a disponibilidade do botão com a configuração privada do servidor.

## Contexto
A análise usa `gpt-6-luna`, uma foto comprimida a no máximo 1280 px e uma resposta limitada a 600 tokens. Reservamos US$ 0,001 por solicitação como margem conservadora. O teto de 800 solicitações mensais reserva no máximo US$ 0,80 no fluxo NutriFlow; a conta OpenAI precisa continuar dedicada a este app para que outros usos não consumam o mesmo orçamento. O limite fica no Supabase para sobreviver a reinícios do Render.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `server.js`
- `photo-budget.js`
- `tests/photo-budget.test.js`
- `.env.example`
- `render.yaml`
- `index.html`
- `service-worker.js`
- `README.md`
- `docs/SUPABASE_SETUP.md`
- `supabase/config.example.js`
- `supabase/migrations/202611110001_photo_analysis_monthly_budget.sql`
- `docs/tasks/2026-11-11-photo-analysis-budget-cap.md`

## Arquivos que não devem ser modificados
- Credenciais e dados reais de usuários.
- O valor de `OPENAI_API_KEY` ou qualquer outro segredo.
- Compra de créditos, ativação de cobrança ou ativação da análise em produção.

## Critérios de aceitação
- [x] Cota mensal global atômica e persistente; falha fechada se migration/segredo não estiverem prontos.
- [x] Limite superior no código e no banco de 800 solicitações/mês.
- [x] Reserva da cota ocorre antes de enviar foto à OpenAI e não é devolvida em erro, evitando repetição para ultrapassar o teto.
- [x] Cliente consulta um endpoint público sem segredos e permanece desativado enquanto o servidor estiver desligado ou sem cota.
- [x] Modelo/limites usados pelo cálculo ficam travados nos valores documentados.
- [x] Nenhuma chamada paga ou imagem real durante a validação.

## Testes obrigatórios
- [x] `node --test` (10 passaram; `npm` não está disponível no PATH deste ambiente, então o runner foi chamado diretamente).
- [x] `git diff --check`
- [x] Teste HTTP local de `/api/runtime-config` com o recurso desligado: HTTP 200, `{ "photoAnalysisEnabled": false, "reason": "not_ready" }`.
- [x] Migration aplicada somente no projeto Supabase `nutriflow-restore-test`: resultado visível “Success. No rows returned”.

## Resultado esperado
Recurso desligado por padrão, com limite persistente de até US$ 0,80 de reserva mensal para este endpoint, sujeito a variação cambial e de preços. A plataforma OpenAI pode exceder ligeiramente um limite rígido durante a propagação; não comprar créditos nem ligar o recurso nesta tarefa.

## Relatório final do agente
- Resumo: adicionado teto global mensal persistente de 800 análises e estado efetivo do recurso; a foto continua desativada por padrão.
- Arquivos alterados: `server.js`, `photo-budget.js`, `tests/photo-budget.test.js`, `.env.example`, `render.yaml`, `index.html`, `service-worker.js`, `README.md`, `docs/SUPABASE_SETUP.md`, `supabase/config.example.js`, `supabase/migrations/202611110001_photo_analysis_monthly_budget.sql` e este relatório.
- Testes/comandos executados e resultados: `node --test` (10 passaram); `node --check server.js` e `node --check photo-budget.js` passaram; análise de sintaxe dos scripts inline passou; smoke test HTTP local passou com recurso desligado; `git diff --check` passou; migration executada apenas no projeto Supabase de teste.
- Limitações ou riscos: limite aplica-se somente a chamadas do NutriFlow; a chave não deve ser reutilizada em outros aplicativos. A conta OpenAI atual mostrava saldo sem créditos e sem limite de gasto disponível.
- Branch/pull request: branch `codex/photo-analysis-budget-cap`; PR #17 aberto para revisão, ainda sem merge.

## Revisão do outro agente
- Comentários: revisão estática local concluída; não houve revisão independente por outro agente nesta execução.
- Problemas encontrados: nenhum bloqueio no diff; a ativação em produção continua dependente de chave válida, saldo e limite no provedor.
- Aprovação para revisão do usuário: sim
