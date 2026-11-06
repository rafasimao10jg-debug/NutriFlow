# Tarefa: preparar a prontidão de produção do NutriFlow

## Objetivo
Registrar o estado real de hospedagem e backups e criar uma sequência verificável para avançar do teste interno ao lançamento pago.

## Contexto
O usuário quer preparar o app para compradores e usuários. Os painéis foram conferidos: o Render está no plano Free e informa que o serviço pode adormecer; o projeto Supabase está Healthy no plano Free/Nano e a página de backups informa que não há backups agendados. O usuário autorizou continuar o trabalho, mas não autorizou assumir custos ou alterar planos.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `README.md`
- `docs/LAUNCH_AND_META.md`
- `docs/SUPABASE_SETUP.md`
- `docs/PRODUCTION_READINESS.md`
- `docs/tasks/2026-11-06-production-readiness.md`

## Arquivos que não devem ser modificados
- Código de autenticação, pagamentos ou migrations.
- Segredos, dados de usuário e configurações de produção do Render/Supabase.
- Plano, faturamento ou estado do serviço em provedores externos.

## Critérios de aceitação
- [x] Documentar o estado observado de Render e Supabase, incluindo ausência de backups no plano atual.
- [x] Explicar a diferença entre dados persistidos no Supabase, cache local do navegador e armazenamento efêmero do Render.
- [x] Definir um caminho para permanecer em teste gratuito e outro portão para produção paga.
- [x] Incluir sequência de backup, armazenamento seguro e ensaio de restauração.
- [x] Ligar o plano de produção ao README e ao plano de lançamento.

## Testes obrigatórios
- Nenhum teste de aplicação: a tarefa altera apenas documentação.
- Revisar diff e executar `git diff --check`.

## Resultado esperado
Uma checklist realista que não trate Render Free ou Supabase Free sem backup como hospedagem pronta para clientes pagantes.

## Relatório final do agente
- Resumo: registrei os planos e limitações observados no Render e Supabase e escrevi um portão de produção com backup manual/automático, teste de restauração e ordem de lançamento. Corrigi no README a descrição do checkout para refletir que as rotas existem mas a cobrança está desligada.
- Arquivos alterados: `README.md`, `docs/LAUNCH_AND_META.md`, `docs/SUPABASE_SETUP.md`, `docs/PRODUCTION_READINESS.md` e este arquivo.
- Testes/comandos executados e resultados: tarefa somente documental; nenhum teste de aplicação foi executado. `git diff --check` passou; o Git exibiu apenas avisos de conversão LF/CRLF do ambiente Windows.
- Limitações ou riscos: não foi feita exportação do banco nem teste de restauração; exigem acesso seguro à conexão do banco e ambiente separado. Não foram alterados planos, pois isso gera custos. A cobrança continua desligada e sem teste sandbox.
- Branch/pull request: branch `codex/production-readiness-plan`, publicada no GitHub; PR aberto: https://github.com/rafasimao10jg-debug/NutriFlow/pull/14.

## Revisão do outro agente
- Comentários: não solicitada.
- Problemas encontrados: pendente.
- Aprovação para revisão do usuário: pendente
