# Tarefa: dica diária e calendário mais claro

## Objetivo
Adicionar uma inspiração de refeição diária guardável, simplificar o texto de preparação da IA e tornar a agenda semanal mais clara no celular.

## Contexto
A tela inicial não oferecia sugestões de refeição quando a IA estivesse desativada. A agenda mostrava apenas uma faixa de dias e era difícil identificar a data escolhida e os registros por dia. A preparação da IA também exibia uma frase de privacidade que o produto não deseja mostrar nesse aviso.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `index.html`
- `docs/PRODUCT_CONTENT.md`
- `docs/tasks/2026-11-05-daily-meal-calendar.md`

## Arquivos que não devem ser modificados
- Segredos, configuração de cobrança e credenciais de terceiros.

## Critérios de aceitação
- [x] A página inicial mostra uma ideia de refeição que muda conforme o dia e pode ser guardada nas refeições.
- [x] A ação de guardar evita criar uma cópia idêntica da dica no mesmo dia.
- [x] O calendário explica a semana selecionada, permite voltar para hoje e mostra a data escolhida e a quantidade de registros.
- [x] O aviso da IA informa download e requisitos do aparelho sem mencionar a frase de privacidade removida.
- [x] As sugestões usam linguagem geral, sem alegações de saúde ou valores nutricionais.

## Testes obrigatórios
- Não executados nesta tarefa.

## Resultado esperado
A tela inicial tem uma sugestão útil mesmo sem IA; a agenda permite localizar a semana e entender rapidamente o que foi anotado em cada data.

## Relatório final do agente
- Resumo: implementado em `index.html` e documentado no conteúdo do produto.
- Arquivos alterados: `index.html`, `docs/PRODUCT_CONTENT.md`, este arquivo.
- Testes/comandos executados e resultados: `git diff --check` sem erros; a sintaxe do script principal inline e de `server.js`, `billing.js`, `supabase-app.js` e `service-worker.js` foi verificada. Não há suíte de testes automatizada configurada. O fluxo visual ainda precisa de conferência no celular do usuário.
- Limitações ou riscos: a dica diária é uma seleção local fixa de sete opções, não uma geração personalizada por IA.
- Branch/pull request: `codex/daily-meal-calendar-polish`; PR pendente.

## Revisão do outro agente
- Comentários: pendente.
- Problemas encontrados: pendente.
- Aprovação para revisão do usuário: pendente.
