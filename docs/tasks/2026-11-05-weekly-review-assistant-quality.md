# Resumo semanal e confiabilidade do assistente

## Objetivo
Disponibilizar toda semana um resumo claro da rotina registrada e melhorar a confiabilidade e velocidade das respostas locais do assistente.

## Contexto
O modelo local pequeno pode recusar pedidos cotidianos de ideias de refeições ou produzir respostas inconsistentes. O NutriFlow só guarda descrições livres de refeições; não tem dados validados para avaliar qualidade nutricional nem se apresentar como nutricionista.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `index.html`
- `service-worker.js`
- `README.md`
- `docs/PRODUCT_CONTENT.md`
- `docs/tasks/2026-11-05-weekly-review-assistant-quality.md`

## Arquivos que não devem ser modificados
- Segredos e credenciais.
- Rotas e regras de cobrança existentes.
- Migrações e dados do Supabase.

## Critérios de aceitação
- [x] A tela inicial e Progresso mostram o resumo da última semana completa, de segunda a domingo, com datas, dias ativos e registros válidos.
- [x] O resumo não dá nota nem faz inferências sobre a qualidade da alimentação; exclui planos futuros.
- [x] A pessoa pode pedir uma frase motivacional ao modelo local; é uma ação explícita e conta como uma resposta da cota atual.
- [x] Só números agregados são fornecidos ao modelo local; nenhuma refeição ou pergunta é enviada ao servidor.
- [x] Se a IA não estiver ativa ou falhar, o resumo continua útil com uma frase segura de reserva.
- [x] Pedidos gerais por ideias de pratos têm respostas locais imediatas; pedidos clínicos recebem orientação fixa de segurança.
- [x] Perguntas abertas continuam usando WebLLM local, com instruções mais curtas, temperatura menor e sem segunda tentativa lenta.
- [x] O cache do PWA é atualizado.

## Testes obrigatórios
- [x] Verificação estática de sintaxe e diff; não há suíte automatizada configurada no projeto.
- [ ] Revisão visual e funcional no celular após integração.

## Resultado esperado
Resumo semanal visível dentro do app e respostas mais consistentes sem adicionar API externa nem divulgar dados de refeições.

## Relatório final do agente
- Resumo: resumo semanal disponível no Início e em Progresso; pedidos comuns por pratos respondem com opções predefinidas; IA aberta com geração mais conservadora e salvaguardas de saída.
- Arquivos alterados: `index.html`, `service-worker.js`, `README.md`, `docs/PRODUCT_CONTENT.md`, este arquivo.
- Testes/comandos executados e resultados: `node --check` do JavaScript inline passou; `git diff --check` passou. Não há testes automatizados configurados.
- Limitações ou riscos: IA aberta ainda pode errar por causa do modelo local pequeno; revisão visual/funcional em celular físico ainda não foi feita. A frase de IA é opcional, exige ativação explícita e usa uma resposta da cota por semana.
- Branch/pull request: `codex/weekly-review-and-assistant-quality`.

## Revisão do outro agente
- Comentários: pendente.
- Problemas encontrados: pendente.
- Aprovação para revisão do usuário: pendente.
