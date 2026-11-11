# Tarefa — liberar análise por foto somente após pagamento

## Objetivo
Exigir acesso base e uma cobrança Pix mensal da assinatura de IA confirmada antes de enviar uma foto para análise.

## Contexto
A análise de fotos usa uma API paga. O acesso base inclui somente cinco respostas de texto; ele não pode habilitar chamadas de visão. O clique de autorização da assinatura do Mercado Pago não prova que a primeira cobrança foi aprovada.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `billing.js`
- `server.js`
- `index.html`
- `supabase-app.js`
- `service-worker.js`
- `supabase/config.example.js`
- `supabase/migrations/202611110002_paid_ai_photo_gate.sql`
- `tests/paid-photo-access.test.js`
- `README.md`
- `docs/SUPABASE_SETUP.md`
- `docs/tasks/2026-11-11-paid-photo-access.md`

## Arquivos que não devem ser modificados
- Credenciais e dados reais de usuários.
- Chaves OpenAI, Mercado Pago ou Supabase.
- Ativação de cobrança ou da análise por foto em produção.
- Migrações já aplicadas.

## Critérios de aceitação
- [x] A cota de IA incluída no acesso base não autoriza análise de foto.
- [x] A interface consulta autorização por usuário e oferece o plano correto, sem confiar em estado do navegador para o servidor.
- [x] O endpoint nega contas sem acesso base, assinatura sem pagamento confirmado ou configuração incompleta antes da chamada ao provedor.
- [x] A cota paga de 100 respostas é consumida atomicamente com a verificação da assinatura.
- [x] Autorização da assinatura no Mercado Pago não ativa a data de pagamento; webhook de cobrança aprovada ativa o acesso.
- [x] Não foram enviadas fotos nem feitas chamadas pagas durante a validação.

## Testes obrigatórios
- [x] `node --test`
- [x] `node --check server.js`
- [x] `node --check billing.js`
- [x] Análise de sintaxe do JavaScript inline de `index.html`.
- [x] `git diff --check`

## Resultado esperado
Fotos indisponíveis para plano base, assinatura pendente, cobrança não confirmada, assinatura suspensa/cancelada ou erro na conferência. Após confirmação do Pix e aplicação da migration, a pessoa recebe acesso até o limite mensal.

## Relatório final do agente
- Resumo: foto condicionada a acesso base e assinatura IA com pagamento Pix aprovado; autorização do plano não basta.
- Arquivos alterados: `billing.js`, `server.js`, `index.html`, `supabase-app.js`, `service-worker.js`, `supabase/config.example.js`, `supabase/migrations/202611110002_paid_ai_photo_gate.sql`, `tests/paid-photo-access.test.js`, `README.md`, `docs/SUPABASE_SETUP.md` e este relatório.
- Testes/comandos executados e resultados: `node --test` (16 passaram); `node --check server.js`, `node --check billing.js`, `node --check photo-budget.js`, `node --check service-worker.js`, parse de 2 scripts inline do HTML e `git diff --check` passaram.
- Limitações ou riscos: a migration precisa ser aplicada no projeto de produção após revisão; foto segue desligada por padrão. Entitlements antigos sem data de pagamento confirmado não são convertidos automaticamente; o webhook precisa registrar uma cobrança aprovada.
- Branch/pull request: extensão do PR #17 na branch `codex/photo-analysis-budget-cap`; commit `cf22182`.

## Revisão do outro agente
- Comentários: não solicitada.
- Problemas encontrados: nenhum nos testes locais; a migration SQL não foi aplicada em produção.
- Aprovação para revisão do usuário: sim
