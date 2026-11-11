# Tarefa — análise visual aproximada de refeições

## Objetivo

Permitir que uma pessoa autenticada envie explicitamente uma foto de refeição para um modelo externo de visão receber estimativas aproximadas de alimentos, porções, calorias e macronutrientes.

## Contexto

As conversas abertas continuam no Qwen local. A foto é um fluxo separado, envia imagem comprimida e observação opcional à OpenAI e pode gerar custo variável. A pessoa precisa autorizar o envio antes do POST. O NutriFlow não deve persistir imagens ou conteúdo de refeição em logs. A análise é experimental, sujeita a erro e não é orientação clínica.

## Agente responsável

Codex

## Arquivos que podem ser modificados

- `index.html`
- `server.js`
- `.env.example`
- `render.yaml`
- `supabase/config.example.js`
- `service-worker.js`
- `README.md`
- `docs/AI_COLLABORATION.md`
- `docs/PRODUCT_CONTENT.md`
- `docs/LAUNCH_AND_META.md`
- `docs/tasks/2026-11-11-meal-photo-estimates.md`

## Arquivos que não devem ser modificados

- Credenciais ou arquivos locais ignorados pelo Git.
- Configurações de produção no painel Render/OpenAI/Supabase.
- Branches de produção por merge ou publicação.

## Critérios de aceitação

- [x] A pessoa escolhe uma foto, pode informar ingredientes/porções e precisa consentir antes do envio.
- [x] A interface informa finalidade, custo possível, destino da imagem e retenção indicada pelo provedor.
- [x] O navegador reduz e reencoda a imagem; o endpoint exige autenticação, valida conteúdo, formato e tamanho.
- [x] O segredo da OpenAI fica apenas no servidor e o recurso permanece desativado por padrão no cliente e servidor.
- [x] O endpoint valida a resposta e apresenta valores como faixas aproximadas com limitações claras.
- [x] Há limite de chamadas em memória configurável; a documentação alerta que é apenas proteção operacional e reinicia com o serviço.
- [x] Perguntas abertas de texto seguem locais; o fluxo de foto é separado.

## Testes obrigatórios

- [ ] Testes de API, interface e custo ainda precisam ser executados antes de habilitar a produção. Não usar fotos reais de usuários durante desenvolvimento.

## Resultado esperado

Experiência pronta para configuração e revisão, mas sem chamada externa até ativação explícita das flags e configuração do segredo.

## Relatório final do agente

- Resumo: fluxo de estimativa visual com consentimento e proteção server-side.
- Arquivos alterados: relacionados acima.
- Testes/comandos executados e resultados: não executados nesta tarefa.
- Limitações ou riscos: estimativas visuais podem errar; limite em memória reinicia com o processo; controlar gasto no painel OpenAI e revisar política de privacidade antes de ativar.
- Branch/pull request: `codex/local-meal-photo-analysis`; nenhum push, PR, merge ou deploy feito.

## Revisão do outro agente

- Comentários: pendente.
- Problemas encontrados: pendente.
- Aprovação para revisão do usuário: não
