# Preparação de produção — hospedagem e backups

Atualizado em 6 de novembro de 2026. Este documento registra a situação conferida nos painéis e os requisitos para passar do teste interno a um lançamento pago. Nenhum plano ou configuração foi alterado.

## Situação conferida

- **Render:** serviço `nutriflow` ativo no plano Free. O painel avisa que o serviço pode adormecer e atrasar a primeira solicitação. A página de discos informa que discos persistentes não estão disponíveis nesse plano.
- **Supabase:** projeto NutriFlow com status Healthy, compute Nano e plano Free. A página **Database → Backups → Scheduled backups** mostra **No backups** e informa que o plano Free não inclui backups do projeto.
- **Persistência no app:** o servidor Node serve arquivos e APIs; os registros de perfil/refeições e estado de cobrança são mantidos no Supabase. O `localStorage` do navegador é cache auxiliar e não substitui backup. Não usar o sistema de arquivos do Render como armazenamento de dados de clientes.
- **Cobrança:** `BILLING_ENABLED=false` no `render.yaml`. O código de checkout existe, mas precisa de credenciais, teste sandbox, webhook e validação real antes de cobrar.

## O que fazer enquanto o projeto continuar gratuito

Adequado apenas para desenvolvimento e piloto controlado, sem prometer disponibilidade ou recuperação automática dos dados:

1. Antes de cada alteração destrutiva ou migração do banco, exportar esquema e dados com o Supabase CLI e guardar a cópia em local privado fora do Render e do repositório.
2. Nunca colocar senha do banco, URL com senha, chave `service_role` ou arquivo de backup no Git, no app ou no chat.
3. Registrar a data, o commit/migração correspondente e o local seguro da cópia.
4. Fazer um teste de restauração em um projeto de desenvolvimento antes de depender do procedimento.
5. Se forem usados arquivos no Supabase Storage, exportar esses objetos separadamente: o backup do Postgres cobre metadados, não os arquivos armazenados.
6. Usar somente dados fictícios durante a preparação pública e informar a equipe de que o primeiro acesso ao Render gratuito pode ser lento.

A documentação do Supabase recomenda exportações manuais com `supabase db dump` para projetos Free. Um dump lógico requer o CLI, Docker e uma conexão segura ao banco. O procedimento não é automático; conferir o escopo e testar a restauração antes de tratá-lo como plano de recuperação.

## Portão antes de guardar dados reais ou aceitar compradores

- [ ] Escolher e revisar o custo do plano de hospedagem antes de ativar serviços pagos.
- [ ] Migrar o Render para um plano que não adormeça antes de abrir tráfego pago. O app não precisa de disco persistente no Render para os registros do usuário; os dados canônicos ficam no Supabase.
- [ ] Ativar backup automático do Supabase (Pro inclui backups diários com retenção de até sete dias) ou manter exportações manuais frequentes e verificadas se a decisão for continuar no Free.
- [ ] Guardar uma cópia independente das informações essenciais e fazer uma restauração de ensaio em um projeto separado.
- [ ] Definir responsável por alertas de falha, recuperação de conta e suporte. Não usar a cópia local do navegador como cópia de segurança.
- [ ] Confirmar RLS em todas as tabelas de usuário e testar isolamento com duas contas diferentes.
- [ ] Publicar política de privacidade, termos, canal de suporte e processo de exclusão de conta antes de abrir cadastro público. Refeições, objetivos e dados relacionados à saúde exigem cuidado especial com finalidade, acesso e retenção.

O Supabase Free pode pausar projetos com pouca atividade e não inclui backup diário. O Render Free adormece após inatividade e não é indicado pelo Render para aplicações de produção. Portanto, planos gratuitos são aceitáveis para protótipo, mas não atendem ao padrão de disponibilidade e recuperação que devemos prometer a compradores.

## Sequência de lançamento

1. **Piloto interno:** manter cobrança desligada, usar dados fictícios, verificar cadastro, confirmação de e-mail, recuperação de senha e sincronização.
2. **Preparar recuperação:** decidir planos, gerar uma exportação privada do banco e testar restauração; revisar RLS e exclusão de conta.
3. **Preparar operação:** eliminar o cold start do Render, configurar monitoramento/alertas e documentar suporte.
4. **Preparar venda:** validar Pix no sandbox, assinatura, webhooks idempotentes, cancelamento, estorno e liberação de acesso somente após pagamento confirmado.
5. **Beta pago pequeno:** acompanhar erros e pagamentos, confirmar backup/recuperação e testar suporte antes de investir em anúncios.
6. **Escalar:** só ampliar Meta após medir cadastro concluído, compra, primeiro uso, retorno, reembolso e margem; manter dados de refeições fora de ferramentas de publicidade.

## Referências

- [Render: planos gratuitos e limitações](https://render.com/docs/free)
- [Supabase: backups do banco](https://supabase.com/docs/guides/platform/backups)
- [Supabase: backup e restauração com CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [Supabase: checklist de produção](https://supabase.com/docs/guides/deployment/going-into-prod)
