# Configuração do Supabase

O app usa Supabase Auth e Postgres para contas e registros de refeições. A migration cria `profiles` e `meal_entries`, ativa RLS e limita cada operação ao usuário autenticado.

## Preparar o projeto

1. Crie um projeto no Supabase.
2. No SQL Editor, execute em ordem `supabase/migrations/202611040001_nutriflow_mvp.sql` e `supabase/migrations/202611040002_billing.sql`.
3. O app carrega `supabase/config.example.js`, que já contém a URL e a publishable key deste projeto.
4. Em **Authentication → URL Configuration**, defina **Site URL** como `https://nutriflow-0yvi.onrender.com` e adicione esse mesmo endereço à lista **Redirect URLs**. O cadastro e a recuperação redirecionam para `location.origin`; para testar no Replit ou localmente, adicione também a origem exata desse ambiente.
5. Em **Authentication → Providers → Email**, habilite cadastro por e-mail e confirmação de e-mail. Depois de confirmar o link, a pessoa volta ao app e entra com a senha escolhida.
6. Inicie o app com `npm start` no Replit ou em Node.js 20+ local (não use `file://`). O assistente local requer HTTPS e um navegador com WebGPU; não configure chave de API de modelo.

Antes de publicar cadastro aberto, publique os Termos de Uso e a Política de Privacidade e informe como pedir exclusão de conta. Para envio confiável de e-mails em produção, configure SMTP próprio no Supabase; limites do serviço padrão podem afetar confirmações e recuperações.

Uma publishable key pode aparecer no cliente; a secret/service_role key nunca pode. Não coloque dados médicos ou outros dados sensíveis neste MVP.

## Billing — ainda desativado

A migration `202611040002_billing.sql` prepara pedidos, assinaturas, permissões e contadores de uso. O servidor só libera as rotas de checkout e a contagem paga da IA quando `BILLING_ENABLED=true` e todas as chaves necessárias estiverem configuradas. Mantenha esse valor como `false` até concluir a validação em sandbox.

No Render, os seguintes valores devem ser configurados como Environment Variables/Secrets do serviço, nunca no código público:

- `APP_URL`: URL HTTPS pública do serviço.
- `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`: configuração do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: chave secreta de servidor do Supabase.
- `MERCADOPAGO_ACCESS_TOKEN`: token de teste durante a validação; trocar por credencial de produção só após aprovação do fluxo.
- `MERCADOPAGO_WEBHOOK_SECRET`: segredo de assinatura de Webhooks do Mercado Pago.
- `MERCADOPAGO_PIX_AI_PLAN_ID`: ID do plano mensal criado com somente Pix autorizado (`payment_types: bank_transfer` e `payment_methods: pix`).
- `BILLING_ENABLED=false` até revisar termos, cancelamento, suporte e todos os cenários de sandbox.

O acesso base usa pagamento Pix direto, que retorna QR Code e código copia e cola. A assinatura só inicia com o ID do plano Pix configurado. Ative no Mercado Pago notificações de pagamento, atualização de assinatura e fatura autorizada. O acesso é liberado por uma notificação válida após consultar o recurso no Mercado Pago; o retorno do navegador não libera acesso. As respostas da IA são limitadas no banco: 5 no acesso base e até 100 por mês na assinatura ativa.

## Escopo atual

Autenticação usa e-mail e senha. Os dados de perfil e refeições só podem ser acessados pelo dono da conta. OAuth social, exclusão de conta e publicação ainda não estão ativadas. O assistente roda localmente pelo WebLLM; o texto das perguntas não é enviado ao servidor Node. Com a cobrança ativada, há uma chamada separada que valida a sessão e consome a cota, sem enviar a pergunta.
