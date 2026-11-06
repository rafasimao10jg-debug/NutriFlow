# Tarefa: esclarecer primeiro acesso e erros de e-mail

## Objetivo
Deixar claro para uma pessoa nova que precisa criar uma conta antes de entrar e explicar de forma acionável quando o provedor de autenticação bloqueia o envio do e-mail.

## Contexto
O usuário relata que tentou acessar com o e-mail antes de criar conta e entendeu a resposta como falta de permissão. O formulário de login tinha apenas uma chamada discreta para cadastro. O cadastro, reenvio e recuperação também usavam mensagens genéricas para erros do remetente padrão do Supabase, embora o projeto ainda precise de SMTP próprio para aceitar endereços fora da equipe.

Na revisão seguinte do Supabase, o cadastro por e-mail e a confirmação estavam ativos, mas **Enable custom SMTP** estava desligado. Os logs mostraram uma tentativa de cadastro repetido concluída com HTTP 200 e não uma nova confirmação; a conta correspondente já estava confirmada. A confirmação do NutriFlow é por link, não por código numérico.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `index.html`
- `supabase-app.js`
- `service-worker.js`
- `docs/SUPABASE_SETUP.md`
- `docs/tasks/2026-11-05-account-signup-guidance.md`

## Arquivos que não devem ser modificados
- Segredos, dados de usuários, configuração de produção no Render ou Supabase Dashboard.
- Migrações e configuração de cobrança.

## Critérios de aceitação
- [x] Login explica que a primeira pessoa precisa criar conta; o atalho leva ao formulário e reaproveita o e-mail digitado.
- [x] Tentativa de login inválida orienta novos usuários a criar conta sem afirmar se o endereço já está cadastrado.
- [x] Cadastro, reenvio e recuperação diferenciam bloqueio do remetente padrão e excesso de envios.
- [x] Quando o Auth não confirma que um link foi enviado, a interface não afirma que o e-mail foi enviado; orienta entrar/recuperar senha e explica que a confirmação usa link.
- [x] A tela de cadastro informa que SMTP próprio está pendente para destinatários fora da equipe e não incentiva tentativas repetidas.
- [x] Documentação informa que SMTP próprio é necessário para e-mails externos à equipe e que o remetente padrão tem limite baixo.
- [x] A revisão da interface invalida a versão anterior do cache da PWA.

## Testes obrigatórios
- Não executados nesta tarefa; o usuário não pediu testes. Uma confirmação real por e-mail exige um SMTP configurado e não deve ser repetida para evitar consumir a cota.

## Resultado esperado
O app ajuda quem ainda não tem conta a começar pelo cadastro e identifica claramente quando o problema está na configuração de envio de e-mail do projeto.

## Relatório final do agente
- Resumo: além de orientar primeiro acesso e erros de envio, a interface explica que a confirmação é por link e não declara que enviou um e-mail quando o Supabase não confirma esse envio.
- Arquivos alterados: `index.html`, `supabase-app.js`, `service-worker.js`, `docs/SUPABASE_SETUP.md` e este arquivo.
- Testes/comandos executados e resultados: `node --check supabase-app.js`, `node --check service-worker.js` e `git diff --check` passaram. Nenhum cadastro ou e-mail real foi testado.
- Limitações ou riscos: SMTP próprio continua desligado no Supabase e precisa ser configurado para entregar mensagens a pessoas fora da equipe; o app não consegue alterar isso sem credenciais do provedor.
- Branch/pull request: `codex/account-signup-guidance`; PR pendente.

## Revisão do outro agente
- Comentários: não solicitada.
- Problemas encontrados: pendente.
- Aprovação para revisão do usuário: pendente.
