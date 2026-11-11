# Tarefa — melhorar a experiência da análise por foto

## Objetivo
Dar à análise de prato por foto uma interface mais clara e atraente, explicando o que a pessoa recebe e como interpretar os valores estimados.

## Contexto
A função já identifica itens visíveis e mostra intervalos de calorias e macronutrientes. A interface atual tem pouca hierarquia e não prepara bem a pessoa para o fluxo nem para as incertezas de uma leitura por imagem.

## Agente responsável
Codex

## Arquivos que podem ser modificados
- `index.html`
- `service-worker.js`
- `docs/tasks/2026-11-11-photo-meal-experience.md`

## Arquivos que não devem ser modificados
- Endpoints e modelo do servidor.
- Checkout, pagamentos ou webhooks do Mercado Pago.
- Segredos, dados ou configurações do Supabase.

## Critérios de aceitação
- [x] A pessoa entende antes do envio o que a análise entrega e como tirar uma foto útil.
- [x] Calorias, porções e macros aparecem como faixas aproximadas, sem prometer exatidão nem fazer avaliação clínica.
- [x] Consentimento explícito, destino da foto e informação de retenção do provedor continuam claros.
- [x] A interface define ajustes para telas pequenas e para os temas claro e escuro.
- [x] O service worker usa a versão v17 para disponibilizar a mudança aos usuários.

## Testes obrigatórios
- [x] Revisar o diff e executar `git diff --check`; a suíte automatizada não foi executada.
- [ ] Inspecionar visualmente a foto com uma sessão habilitada; fica para o usuário conferir no celular, sem enviar nenhuma foto durante o desenvolvimento.

## Resultado esperado
Um fluxo de foto com aparência mais completa, expectativas honestas e leitura mais fácil dos intervalos nutricionais.

## Relatório final do agente
- Resumo: reorganizei o fluxo da foto e a apresentação das faixas nutricionais, com expectativas claras e sem promessa de precisão.
- Arquivos alterados: `index.html`, `service-worker.js` e este relatório.
- Testes/comandos executados e resultados: `git diff --check` e geração do site estático passaram; nenhuma suíte automatizada foi executada.
- Limitações ou riscos: os cálculos do modelo não foram recalibrados nem validados com refeições pesadas; a conferência visual numa sessão com o recurso ativo e num celular continua pendente.
- Branch/pull request: branch `codex/photo-meal-experience`; pull request será enviado para revisão do usuário.

## Revisão do outro agente
- Comentários: não solicitada.
- Problemas encontrados: não revisado independentemente.
- Aprovação para revisão do usuário: sim
