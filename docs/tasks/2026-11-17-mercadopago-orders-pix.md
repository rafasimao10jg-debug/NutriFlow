# Tarefa — preparar o checkout Pix com Orders

## Objetivo

Adaptar o pagamento único do NutriFlow para a Orders API do Mercado Pago e manter a confirmação de acesso vinculada ao webhook assinado.

## Contexto

A aplicação de teste `NutriFlow Checkout` foi criada no Mercado Pago com Checkout Transparente e API de Orders. A tela confirma que está no ambiente de teste. O checkout atual do produto usa a API antiga de Payments e precisa corresponder à API selecionada na aplicação.

## Agente responsável

Codex

## Arquivos que podem ser modificados

- `billing.js`
- `docs/FUNNEL_AND_CHECKOUT.md`
- `docs/tasks/2026-11-17-mercadopago-orders-pix.md`

## Arquivos que não devem ser modificados

- Credenciais e secrets do Mercado Pago, Render ou Supabase.
- Migrações e dados do Supabase.
- Ativação de cobrança real (`BILLING_ENABLED` deve permanecer desativado).

## Critérios de aceitação

- [x] O acesso base cria uma order automática com valor fixo de R$ 29,90 e Pix (`id=pix`, `type=bank_transfer`).
- [x] A resposta mostra QR Code e código copia e cola obtidos da transação da order.
- [x] O acesso só é liberado pelo webhook autenticado quando order e pagamento Pix estão aprovados, no valor e moeda esperados e vinculados à referência interna.
- [x] A chave de idempotência continua ligada à ordem interna do NutriFlow.
- [x] Nenhum token/secret foi lido, copiado ou registrado pelo agente; a cobrança continua desativada.

## Testes obrigatórios

- Não enviar pagamento nem dados pessoais reais durante o desenvolvimento.
- Executar checagem de sintaxe e revisão do diff. A validação ponta a ponta fica pendente até configurar o token e webhook de teste no Render.

## Resultado esperado

Checkout de acesso base pronto para validação em sandbox, com confirmação segura por webhook `order`.

## Relatório final do agente

- Resumo: checkout base adaptado para gerar Pix pela Orders API e confirmar a compra por webhook `order` assinado.
- Arquivos alterados: `billing.js`, `docs/FUNNEL_AND_CHECKOUT.md` e este relatório.
- Testes/comandos executados e resultados: `node --check billing.js` e `git diff --check` passaram. Nenhum pagamento real ou teste ponta a ponta foi executado.
- Limitações ou riscos: falta configurar token de teste, webhook e plano de assinatura Pix no Mercado Pago/Render e validar em sandbox. Cobrança permanece desativada.
- Branch/pull request: `codex/mercadopago-orders-pix`; PR não criado, aguardando autorização de publicação.

## Revisão do outro agente

- Comentários: não solicitada.
- Problemas encontrados: pendente.
- Aprovação para revisão do usuário: pendente.

## Referências técnicas

- [Pix com Orders API](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/websites/pix)
- [Notificações de Orders](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/notifications)
