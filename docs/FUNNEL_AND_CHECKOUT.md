# Funil e checkout do NutriFlow

## Objetivo

Preparar um caminho simples entre o anúncio, o primeiro contato com o app e a compra. A oferta aprovada tem duas partes: acesso base por pagamento único de R$ 29,90 e uso ampliado da IA por assinatura mensal de R$ 14,90, limitada a 100 respostas por mês civil (reinicia no dia 1). O acesso base inclui 5 respostas da IA no total.

## Funil proposto

1. **Anúncio Meta:** comunicar organização de ideias e registros de refeições. Não mencionar condições pessoais, peso ou resultados de saúde.
2. **Página de apresentação:** explicar o que o NutriFlow faz hoje, mostrar telas reais e oferecer dois caminhos claros: experimentar a demonstração ou conhecer a oferta paga.
3. **Demonstração:** permitir explorar o app sem cartão e explicar que os dados ficam naquele navegador.
4. **Oferta:** separar claramente o acesso base, pago uma vez, da assinatura mensal que libera a IA. Mostrar preço, frequência, limite da IA no acesso base, cancelamento e suporte antes de abrir cada checkout.
5. **Pagamento Mercado Pago via Pix:** gerar um Pix com QR Code e código copia e cola para a compra única; usar um plano mensal que permita somente o tipo de pagamento Pix (bank_transfer) para a IA. Não oferecer cartão, boleto ou saldo.
6. **Confirmação de pagamento:** receber o webhook assinado do Mercado Pago, validar o evento e ativar/atualizar o acesso de forma idempotente.
7. **Acesso à conta:** vincular compra e assinatura à conta do NutriFlow e mostrar confirmação, acesso base, estado da IA e instruções de cancelamento.

## Integração necessária

- Página pública de oferta e planos.
- Pagamento único criado no servidor com payment_method_id=pix, preço fixo, chave de idempotência e QR Code/código copia e cola; nunca aceitar valor enviado pelo navegador.
- Plano de assinatura mensal criado no Mercado Pago com payment_methods_allowed.payment_types=[{id: bank_transfer}] e vinculado à conta Supabase. No Brasil, bank_transfer é o tipo correspondente ao Pix.
- Webhooks assinados para pagamentos e assinaturas, com validação de assinatura, proteção contra repetição e confirmação das renovações via Pix antes de manter a IA ativa.
- Entitlements separados para `base_access` e `ai_subscription_status`, associados à conta Supabase com RLS. A chave `service_role` permanece apenas no servidor.
- Telas de sucesso, pagamento pendente/falhou e cancelamento.
- Processo de suporte, reembolso e cancelamento compatível com as condições da oferta.

## Medição inicial

Usar UTMs e contagens agregadas próprias para visitas, cadastro, checkout iniciado, compra e primeiro uso. Não enviar nomes de refeições, perguntas à IA, preferências alimentares ou progresso do Flow para Meta. Só adicionar Pixel/Conversions API depois de revisar a classificação do domínio e as regras aplicáveis.

## Bloqueios para ativar cobrança

- Provedor: Mercado Pago.
- Preço do acesso base único: R$ 29,90.
- Preço da assinatura mensal da IA: R$ 14,90 por mês.
- Acesso base: recursos de organização e registros descritos na página do produto; inclui 5 respostas da IA no total.
- Assinatura de IA: até 100 respostas por mês civil, com limite reiniciado no dia 1; não anunciar como ilimitada.
- Política de cancelamento, reembolso e suporte: a definir.
- Conta de teste do provedor e credenciais de sandbox: não configuradas.
- Termos, Política de Privacidade e exclusão de conta: pendentes.
- A integração de servidor para criar Pix, verificar Webhooks e registrar limites já está preparada no código e na migration, mas permanece desativada e ainda não foi validada em sandbox.
- O plano Pix mensal precisa ser criado no Mercado Pago e seu ID configurado em MERCADOPAGO_PIX_AI_PLAN_ID; sem ele, o endpoint de assinatura recusa iniciar a cobrança.

O Checkout Pro padrão não garante Pix exclusivo porque o Mercado Pago informa que dinheiro em conta não pode ser excluído dessa preferência. Por isso, a compra única usa a API direta de pagamentos Pix e mostra QR Code/copia e cola. A assinatura usa um plano com meio de pagamento permitido explicitamente como Pix. Validar essa configuração em sandbox antes de habilitar cobrança real. Nunca liberar acesso com base apenas na URL de retorno.

## Implementação técnica pendente

- Revisar e validar em sandbox a criação do pagamento Pix no servidor, incluindo QR Code, copia e cola, validade, idempotência e preço fixo.
- Criar o plano mensal no Mercado Pago com payment_methods_allowed.payment_types=[{id: bank_transfer}] e payment_methods=[{id: pix}]; validar em sandbox que o checkout da assinatura exibe somente Pix.
- Revisar a validação da sessão Supabase no início de checkout e a associação da transação à conta.
- Confirmar em sandbox a assinatura HMAC `x-signature` do webhook (`id:<data.id>;request-id:<x-request-id>;ts:<ts>;`), os tópicos de pagamento, assinatura e fatura autorizada, a consulta dos recursos no Mercado Pago e o processamento idempotente.
- Aplicar a migration `202611040002_billing.sql` em Supabase antes de configurar o backend; os dados de cobrança e uso ficam em tabelas privadas com RLS, e `service_role` é usada somente no servidor.
- A rota de IA passa a contabilizar 5 respostas totais no acesso base e 100 por mês civil na assinatura somente quando `BILLING_ENABLED=true`; validar os limites e falhas do modelo antes de ativar.
- Guardar credenciais como secrets no Render: token de acesso Mercado Pago, segredo de webhook, URL e chaves de servidor Supabase. Nunca incluir secrets no frontend, repositório ou chat.
- Manter o checkout indisponível até aplicar a migração, configurar secrets e concluir os cenários de sandbox.
