# Tarefa — melhorar a coerência das estimativas por foto

## Objetivo

Reduzir respostas com valores internamente contraditórios entre porção, macronutrientes e calorias na análise experimental de pratos.

## Contexto

A estimativa vem de um modelo visual e não pode confirmar peso, preparo ou ingredientes que não aparecem na imagem. A foto, por si só, não dá uma escala confiável para medir a porção. A interface deve continuar apresentando faixas aproximadas, nunca resultados clínicos ou medições.

## Agente responsável

Codex

## Arquivos que podem ser modificados

- `server.js`
- `docs/tasks/2026-11-12-photo-estimate-coherence.md`

## Arquivos que não devem ser modificados

- Chaves, segredos, limites de custo ou configuração de produção.
- Checkout, pagamentos ou webhooks do Mercado Pago.
- Configuração e dados do Supabase.
- Outros fluxos de IA ou arquivos da interface da tarefa anterior.

## Critérios de aceitação

- [x] O prompt pede que a estimativa seja feita para a porção estimada, sem misturar valores por 100 g.
- [x] O modelo é instruído a checar a coerência aproximada de calorias com macros e a deixar itens vazios quando não puder estimar com coerência.
- [x] O servidor rejeita faixas materialmente incompatíveis entre massa de macros, porção estimada e energia, tolerando variação de fatores alimentares.
- [x] Resultados com itens sempre trazem uma incerteza explícita.
- [x] Não foram adicionados fornecedores, chaves, armazenamento de imagens ou chamadas externas novas.

## Testes obrigatórios

- Nenhuma foto real de usuário foi enviada durante o desenvolvimento.
- A suíte automatizada não foi executada; foram feitas checagem de sintaxe, compilação estática e revisão de diff.

## Resultado esperado

Menos resultados que se contradizem numericamente, mantendo uma apresentação transparente sobre os limites de uma estimativa baseada apenas em imagem.

## Relatório final do agente

- Resumo: instruções da análise e validação server-side agora verificam a coerência aproximada de porção, macros e calorias.
- Arquivos alterados: `server.js` e este relatório.
- Testes/comandos executados e resultados: `node --check server.js`, `git diff --check` e `node scripts/build-static.mjs` passaram; a suíte automatizada não foi executada.
- Limitações ou riscos: coerência matemática não prova exatidão nutricional. A validação exige comparação com refeições identificadas e pesadas antes de divulgar o recurso como confiável.
- Branch/pull request: `codex/photo-estimate-quality`; PR #21 aberto contra a branch do PR #20, aguardando revisão.

## Referências técnicas

- O USDA FoodData Central documenta fatores Atwater gerais de 4, 9 e 4 kcal/g para proteína, gordura e carboidratos e ressalta fatores específicos por alimento: <https://fdc.nal.usda.gov/Foundation_Foods_Documentation/>.
- Um estudo sobre estimativa de porções em imagens descreve a reconstrução de volume a partir de uma imagem como um problema que requer informação visual adicional: <https://pmc.ncbi.nlm.nih.gov/articles/PMC3254118/>.

## Revisão do outro agente

- Comentários: não solicitada.
- Problemas encontrados: pendente.
- Aprovação para revisão do usuário: sim
