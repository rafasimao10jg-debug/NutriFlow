# Funil e checkout do NutriFlow

## Objetivo

Preparar um caminho simples entre o anúncio, o primeiro contato com o app e a compra. A oferta definida até agora tem duas partes: acesso base por pagamento único e uso ampliado da IA por assinatura mensal. O checkout permanece desativado até o responsável definir valores, limites e itens do acesso base.

## Funil proposto

1. **Anúncio Meta:** comunicar organização de ideias e registros de refeições. Não mencionar condições pessoais, peso ou resultados de saúde.
2. **Página de apresentação:** explicar o que o NutriFlow faz hoje, mostrar telas reais e oferecer dois caminhos claros: experimentar a demonstração ou conhecer a oferta paga.
3. **Demonstração:** permitir explorar o app sem cartão e explicar que os dados ficam naquele navegador.
4. **Oferta:** separar claramente o acesso base, pago uma vez, da assinatura mensal que libera a IA. Mostrar preço, frequência, limite da IA no acesso base, cancelamento e suporte antes de abrir cada checkout.
5. **Checkout hospedado Mercado Pago:** criar um checkout para a compra única e uma assinatura recorrente para a IA. Não guardar cartão no NutriFlow.
6. **Confirmação de pagamento:** receber o webhook assinado do Mercado Pago, validar o evento e ativar/atualizar o acesso de forma idempotente.
7. **Acesso à conta:** vincular compra e assinatura à conta do NutriFlow e mostrar confirmação, acesso base, estado da IA e instruções de cancelamento.

## Integração necessária

- Página pública de oferta e planos.
- Preferência de pagamento único criada no servidor; valor e produto definidos no servidor, nunca aceitos do navegador.
- Plano/assinatura mensal de IA criado no Mercado Pago e vinculado ao usuário.
- Webhooks assinados para pagamentos e assinaturas, com validação de assinatura, proteção contra repetição e registro dos identificadores de pagamento.
- Entitlements separados para `base_access` e `ai_subscription_status`, associados à conta Supabase com RLS. A chave `service_role` permanece apenas no servidor.
- Telas de sucesso, pagamento pendente/falhou e cancelamento.
- Processo de suporte, reembolso e cancelamento compatível com as condições da oferta.

## Medição inicial

Usar UTMs e contagens agregadas próprias para visitas, cadastro, checkout iniciado, compra e primeiro uso. Não enviar nomes de refeições, perguntas à IA, preferências alimentares ou progresso do Flow para Meta. Só adicionar Pixel/Conversions API depois de revisar a classificação do domínio e as regras aplicáveis.

## Bloqueios para ativar cobrança

- Provedor: Mercado Pago.
- Preço do acesso base único: a definir.
- Preço da assinatura mensal da IA: a definir.
- Itens incluídos no acesso base: a definir.
- Limite de uso da IA incluído no acesso base: a definir.
- Política de cancelamento, reembolso e suporte: a definir.
- Conta de teste do provedor e credenciais de sandbox: não configuradas.
- Termos, Política de Privacidade e exclusão de conta: pendentes.

Não usar preço fictício, botão de pagamento de demonstração ou promessa de recurso ainda não validado. Depois de definir a oferta, implementar primeiro em sandbox e validar pagamento aprovado, recusado, pendente, webhook repetido, cancelamento e liberação de acesso antes de publicar.
