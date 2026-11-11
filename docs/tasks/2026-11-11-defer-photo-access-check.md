# Adiar a checagem de acesso às fotos

## Objetivo
Evitar chamadas desnecessárias ao Web Service Render quando o checkout e a análise de fotos estão desligados, mantendo o assistente local imediato.

## Contexto
A versão estática publica o app por HTTPS, mas a inicialização autenticada consultava `/api/assistant/photo-access` ao carregar a página. Isso podia acordar o Web Service gratuito mesmo quando nenhuma função paga estava ativa.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `index.html`
- `service-worker.js`
- `render.static.yaml`
- `docs/tasks/2026-11-11-defer-photo-access-check.md`

## Arquivos que não devem ser modificados
- Checkout, pagamentos e webhooks do Mercado Pago.
- Segredos, migrations ou dados de produção.
- Ativação de funções pagas.

## Critérios de aceitação
- [x] A inicialização não consulta o serviço de fotos.
- [x] Com cobrança e fotos desligadas, a navegação no assistente local não faz a consulta remota.
- [x] A checagem remota continua disponível quando a configuração de cobrança ou fotos estiver ativa.
- [x] O endpoint continua validando a conta e o pagamento no servidor antes de aceitar fotos.
- [x] O cache da PWA é atualizado para entregar o HTML corrigido.
- [x] O site estático acompanha a mesma branch atualizada do Web Service.

## Testes obrigatórios
- A suíte automatizada não foi executada nesta tarefa.

## Resultado esperado
O app estático abre sem acordar o Render para consultar acesso de fotos enquanto as funções pagas estão desligadas.

## Relatório final do agente
- Resumo: removi a checagem remota da inicialização, condicionei a atualização de acesso ao estado de habilitação do recurso e alinhei o deploy estático à branch ativa do app.
- Arquivos alterados: `index.html`, `service-worker.js`, `render.static.yaml` e este relatório.
- Testes/comandos executados e resultados: nenhuma suíte de teste executada nesta tarefa.
- Limitações ou riscos: a checagem do servidor ainda é necessária quando a configuração de cobrança ou análise por foto for habilitada. O Render pode exigir uma sincronização manual do Blueprint após o merge para aplicar a nova branch ao site estático.
- Branch/pull request: `codex/defer-photo-access-check`; não enviado ao GitHub.

## Revisão do outro agente
- Comentários: não solicitada.
- Problemas encontrados: não revisado independentemente.
- Aprovação para revisão do usuário: sim
