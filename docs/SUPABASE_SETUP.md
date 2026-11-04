# Configuração do Supabase

O app usa Supabase Auth e Postgres para contas e registros de refeições. A migration cria `profiles` e `meal_entries`, ativa RLS e limita cada operação ao usuário autenticado.

## Preparar o projeto

1. Crie um projeto no Supabase.
2. No SQL Editor, execute `supabase/migrations/202611040001_nutriflow_mvp.sql`.
3. O app carrega `supabase/config.example.js`, que já contém a URL e a publishable key deste projeto.
4. No Dashboard, habilite confirmação de e-mail e ajuste o URL de redirecionamento para o endereço do app no Replit.
5. Abra `index.html` por um servidor local ou Replit (não por `file://`).

Uma publishable key pode aparecer no cliente; a secret/service_role key nunca pode. Não coloque dados médicos ou outros dados sensíveis neste MVP.

## Escopo atual

Autenticação usa e-mail e senha. Os dados de perfil e refeições só podem ser acessados pelo dono da conta. Sugestões de IA, OAuth social, exclusão de conta e publicação ainda não estão ativadas.
