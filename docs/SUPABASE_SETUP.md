# Configuração do Supabase

O app usa Supabase Auth e Postgres para contas e registros de refeições. A migration cria `profiles` e `meal_entries`, ativa RLS e limita cada operação ao usuário autenticado.

## Preparar o projeto

1. Crie um projeto no Supabase.
2. No SQL Editor, execute em ordem `supabase/migrations/202611040001_nutriflow_mvp.sql` e `supabase/migrations/202611040002_billing.sql`.
3. Se for preparar análise de foto, execute também `supabase/migrations/202611110001_photo_analysis_monthly_budget.sql`. Ela grava somente mês e contador global, sem imagens, observações ou IDs de usuário; o acesso direto fica revogado para `anon` e `authenticated`, e só o servidor pode consumir a cota.
4. O app carrega `supabase/config.example.js`, que já contém a URL e a publishable key deste projeto.
5. Em **Authentication → URL Configuration**, defina **Site URL** como `https://nutriflow-0yvi.onrender.com` e adicione esse mesmo endereço à lista **Redirect URLs**. O cadastro e a recuperação redirecionam para `location.origin`; para testar no Replit ou localmente, adicione também a origem exata desse ambiente.
6. Em **Authentication → Providers → Email**, habilite cadastro por e-mail e confirmação de e-mail. Depois de confirmar o link, a pessoa volta ao app e entra com a senha escolhida.
7. Antes de aceitar cadastros de pessoas fora da equipe do projeto, configure um servidor de e-mail próprio em **Authentication → SMTP Settings**. O remetente padrão do Supabase é apenas para testes: ele só envia para e-mails da equipe da organização e, segundo a documentação atual, permite 2 e-mails de autenticação por hora por projeto. Sem SMTP próprio, o Supabase pode retornar `email_address_not_authorized`; repetir o cadastro não libera o endereço e pode atingir o limite de envio. Depois de configurar SMTP e os templates, teste uma confirmação e uma recuperação de senha com um endereço que não seja da equipe.
8. Inicie o app com `npm start` no Replit ou em Node.js 20+ local (não use `file://`). O assistente local requer HTTPS e um navegador com WebGPU; não configure chave de API de modelo.

Antes de publicar cadastro aberto, publique os Termos de Uso e a Política de Privacidade e informe como pedir exclusão de conta. SMTP próprio é requisito para permitir confirmações e recuperações de pessoas fora da equipe; o remetente padrão não atende cadastro público.

## Backups e produção

O projeto verificado está no plano Free e não tem backups agendados. Antes de guardar dados reais, escolha entre configurar backups automáticos em um plano pago ou exportar manualmente com o Supabase CLI, manter a cópia em local privado externo e testar a restauração em outro projeto. Exporte arquivos do Storage separadamente se o app passar a armazená-los. Consulte [Preparação de produção — hospedagem e backups](PRODUCTION_READINESS.md) para a sequência completa.

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

Para análise de fotos, mantenha `PHOTO_ANALYSIS_ENABLED=false` até a migration acima estar aplicada, a chave OpenAI privada estar válida e a cota mensal estar conferida. O app reserva no máximo 800 chamadas por mês para este endpoint, usando GPT-6 Luna e uma margem de US$ 0,001 por chamada. O limite vale apenas para este servidor; mantenha a chave exclusiva do NutriFlow. A ativação depende também de saldo de API disponível e de aviso/consentimento de privacidade.

O acesso base usa pagamento Pix direto, que retorna QR Code e código copia e cola. A assinatura só inicia com o ID do plano Pix configurado. Ative no Mercado Pago notificações de pagamento, atualização de assinatura e fatura autorizada. O acesso é liberado por uma notificação válida após consultar o recurso no Mercado Pago; o retorno do navegador não libera acesso. As respostas da IA são limitadas no banco: 5 no acesso base e até 100 por mês na assinatura ativa.

## Escopo atual

Autenticação usa e-mail e senha. Os dados de perfil e refeições só podem ser acessados pelo dono da conta. OAuth social, exclusão de conta e publicação ainda não estão ativadas. O assistente roda localmente pelo WebLLM; o texto das perguntas não é enviado ao servidor Node. Com a cobrança ativada, há uma chamada separada que valida a sessão e consome a cota, sem enviar a pergunta.
