# Tarefa: calendário mensal e remoção da faixa da IA

## Objetivo
Remover a faixa destacada na tela do assistente e trocar a navegação semanal por um calendário mensal fácil de entender e usar em telas pequenas.

## Contexto
A pessoa apontou a faixa amarela de requisitos do modelo como excesso visual e pediu outra melhoria no calendário. A versão anterior mostrava somente sete dias, sem uma visão do mês.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `index.html`
- `README.md`
- `service-worker.js`
- `docs/tasks/2026-11-05-month-calendar.md`

## Arquivos que não devem ser modificados
- Segredos, configuração de cobrança e credenciais de terceiros.

## Critérios de aceitação
- [x] A faixa amarela `.assistant-demo` não aparece mais na tela do assistente.
- [x] A visão mensal exibe cabeçalho do mês, dias da semana, seis linhas de datas e navegação anterior/próximo.
- [x] A pessoa pode selecionar datas, retornar a hoje e ver a contagem de registros por dia e na data selecionada.
- [x] Datas de outros meses ficam visíveis e podem ser selecionadas.
- [x] O texto essencial para ativar a IA permanece em estilo discreto antes do download.
- [x] O cache PWA é atualizado para a nova interface.

## Testes obrigatórios
- Verificação estática de sintaxe e diff; teste visual no celular após o PR.

## Resultado esperado
Uma agenda mensal responsiva que destaca a seleção e os dias com registros, sem a faixa amarela da IA.

## Relatório final do agente
- Resumo: faixa amarela removida e calendário mensal implementado; aguardando revisão visual e integração.
- Arquivos alterados: `index.html`, `README.md`, `service-worker.js`, este arquivo.
- Testes/comandos executados e resultados: `git diff --check` sem erros; sintaxe do script inline, `server.js`, `billing.js`, `supabase-app.js` e `service-worker.js` verificada. Ainda falta a inspeção visual no celular.
- Limitações ou riscos: a conferência visual ainda depende do aparelho do usuário.
- Branch/pull request: `codex/month-calendar-and-remove-assistant-notice`; PR pendente.

## Revisão do outro agente
- Comentários: pendente.
- Problemas encontrados: pendente.
- Aprovação para revisão do usuário: pendente.
