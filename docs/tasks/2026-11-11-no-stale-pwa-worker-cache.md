# Evitar service worker antigo no CDN do Render

## Objetivo
Fazer o navegador revalidar sempre o arquivo do service worker do NutriFlow depois de uma publicação.

## Contexto
Após o PR #18 ser integrado e publicado, o HTML público mostrou o código novo, mas `service-worker.js` ainda era servido como v13, apesar do repositório e do build conterem v16. O Render respondeu com cache compartilhado de cinco minutos para o arquivo; uma publicação limpa também não removeu a cópia antiga observada.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `render.static.yaml`
- `docs/tasks/2026-11-11-no-stale-pwa-worker-cache.md`

## Arquivos que não devem ser modificados
- Serviço Node `nutriflow`.
- Checkout, pagamentos ou webhooks do Mercado Pago.
- Segredos, dados ou configurações do Supabase.

## Critérios de aceitação
- [x] O Blueprint estático define `Cache-Control: no-cache, no-store, must-revalidate` para `/service-worker.js`.
- [ ] Após sincronizar o Blueprint e publicar, o endereço estático entrega o service worker atual.
- [ ] Confirmar no celular que a PWA atualiza após fechar e reabrir.

## Testes obrigatórios
- Não executar suíte automatizada; a mudança é configuração de cabeçalho do Render.
- Revisar diff e executar `git diff --check` antes de enviar para revisão.

## Resultado esperado
O cliente não fica preso ao service worker de uma publicação anterior por causa do cache do CDN.

## Relatório final do agente
- Resumo: adicionei uma regra específica para impedir o cache do arquivo do service worker no CDN.
- Arquivos alterados: `render.static.yaml` e este relatório.
- Testes/comandos executados e resultados: pendente da revisão final; nenhuma suíte automatizada executada.
- Limitações ou riscos: a regra só será aplicada depois de aprovada, integrada e sincronizada no Blueprint `NutriFlow Static`; a checagem no aparelho depende do usuário reabrir a PWA.
- Branch/pull request: branch `codex/no-stale-pwa-worker-cache`; ainda sem push/PR.

## Revisão do outro agente
- Comentários: não solicitada.
- Problemas encontrados: não revisado independentemente.
- Aprovação para revisão do usuário: sim
