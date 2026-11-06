# Tarefa: corrigir orientações duplicadas de confirmação de cadastro

## Objetivo
Remover a indicação desatualizada de que o SMTP ainda precisa ser configurado e reduzir avisos repetidos no formulário de cadastro.

## Contexto
O SMTP personalizado do Supabase foi ativado com Gmail. Após enviar um cadastro com confirmação de e-mail habilitada, a resposta do cliente não confirma que a mensagem chegou à caixa postal. A interface mostrava duas mensagens sobre o mesmo fluxo e dizia que o serviço de envio ainda precisava ser configurado, mesmo sem erro retornado pelo Supabase.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `index.html`
- `supabase-app.js`
- `service-worker.js`
- `tests/auth.test.js`
- `docs/tasks/2026-11-06-signup-smtp-copy.md`

## Arquivos que não devem ser modificados
- Segredos, dados de usuários, configuração do Supabase ou Render.
- Migrações, autenticação e políticas de segurança.

## Critérios de aceitação
- [x] A mensagem após cadastro orienta a verificar caixa de entrada e spam sem afirmar que o e-mail chegou.
- [x] A mensagem não diz que o SMTP está pendente quando o Supabase não retornou erro.
- [x] A nota permanente informa apenas que a confirmação usa link, evitando repetir as mesmas instruções.
- [x] A versão do cache da PWA é atualizada para entregar a cópia nova em aparelhos instalados.

## Testes obrigatórios
- Executar `node --test tests/auth.test.js`.
- Não criar conta real nem repetir envio de e-mail durante a validação.

## Resultado esperado
A pessoa recebe uma orientação curta e correta após o cadastro, e mensagens explícitas de erro continuam sendo mostradas quando o Supabase retorna um erro real.

## Relatório final do agente
- Resumo: removi a alegação de que o SMTP está pendente na resposta de cadastro sem erro, deixei as orientações em duas mensagens curtas e atualizei o cache da PWA.
- Arquivos alterados: `index.html`, `supabase-app.js`, `service-worker.js`, `tests/auth.test.js` e este arquivo.
- Testes/comandos executados e resultados: `node --test tests/auth.test.js` passou (7/7); `git diff --check` passou.
- Limitações ou riscos: a entrega de e-mail ainda precisa ser confirmada com uma conta de teste; o painel Supabase não garante recebimento na caixa postal.
- Branch/pull request: `codex/fix-signup-smtp-copy`; alterações locais, sem envio ao GitHub.

## Revisão do outro agente
- Comentários: não solicitada.
- Problemas encontrados: SMTP pessoal pode ter entrega menos confiável; aviso já é exibido no Supabase.
- Aprovação para revisão do usuário: pendente
