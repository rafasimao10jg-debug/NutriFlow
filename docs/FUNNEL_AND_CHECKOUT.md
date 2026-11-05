# Funil e checkout do NutriFlow

## Objetivo

Preparar um caminho simples entre o anúncio, o primeiro contato com o app e a compra do plano. O checkout permanece desativado até o responsável definir preço, cobrança e itens incluídos.

## Funil proposto

1. **Anúncio Meta:** comunicar organização de ideias e registros de refeições. Não mencionar condições pessoais, peso ou resultados de saúde.
2. **Página de apresentação:** explicar o que o NutriFlow faz hoje, mostrar telas reais e oferecer dois caminhos claros: experimentar a demonstração ou conhecer a oferta paga.
3. **Demonstração:** permitir explorar o app sem cartão e explicar que os dados ficam naquele navegador.
4. **Oferta:** mostrar preço total, frequência de cobrança, o que está incluído, limites da IA, cancelamento e suporte antes de abrir o checkout.
5. **Checkout hospedado:** enviar para a página segura do provedor escolhido. Não guardar cartão no NutriFlow.
6. **Confirmação de pagamento:** receber o webhook assinado do provedor, validar o evento e ativar o acesso de forma idempotente.
7. **Acesso à conta:** vincular a compra à conta do NutriFlow e mostrar confirmação, plano ativo e instruções de cancelamento.

## Integração necessária

- Página pública de oferta e planos.
- Sessão de checkout criada no servidor; valor e produto validados no servidor, nunca aceitos do navegador.
- Webhook com validação de assinatura, proteção contra repetição e registro do identificador da transação.
- Estado de assinatura/acesso associado à conta do Supabase com RLS. A chave `service_role` permanece apenas no servidor.
- Telas de sucesso, pagamento pendente/falhou e cancelamento.
- Processo de suporte, reembolso e cancelamento compatível com as condições da oferta.

## Medição inicial

Usar UTMs e contagens agregadas próprias para visitas, cadastro, checkout iniciado, compra e primeiro uso. Não enviar nomes de refeições, perguntas à IA, preferências alimentares ou progresso do Flow para Meta. Só adicionar Pixel/Conversions API depois de revisar a classificação do domínio e as regras aplicáveis.

## Bloqueios para ativar cobrança

- Provedor: a definir.
- Preço e frequência: a definir.
- Benefícios incluídos e limites do plano: a definir.
- Política de cancelamento, reembolso e suporte: a definir.
- Conta de teste do provedor e credenciais de sandbox: não configuradas.
- Termos, Política de Privacidade e exclusão de conta: pendentes.

Não usar preço fictício, botão de pagamento de demonstração ou promessa de recurso ainda não validado. Depois de definir a oferta, implementar primeiro em sandbox e validar pagamento aprovado, recusado, pendente, webhook repetido, cancelamento e liberação de acesso antes de publicar.
