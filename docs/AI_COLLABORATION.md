# Colaboração entre Codex e Claude Code

## Fluxo por tarefa

1. O usuário define o objetivo, contexto, arquivos permitidos e critérios de aceitação usando `docs/AI_TASK_TEMPLATE.md`.
2. O agente designado lê `AGENTS.md`, `CLAUDE.md` quando aplicável e a documentação relevante.
3. O agente confirma o escopo, cria uma branch própria a partir da branch principal atualizada e registra os arquivos que pretende alterar.
4. O agente implementa somente a tarefa atribuída e evita arquivos reservados a outro agente.
5. O agente executa os testes, lint e build disponíveis e registra os comandos e resultados. Se ainda não houver aplicação ou scripts, registra isso claramente.
6. O agente revisa o diff, verifica que não incluiu segredos e apresenta resumo, arquivos alterados, validações e riscos conhecidos.
7. O outro agente revisa a branch ou pull request e reporta problemas sem editar os mesmos arquivos simultaneamente.
8. O usuário decide se aprova a integração. O merge ocorre por pull request após aprovação.

## Divisão e coordenação

### Dados enviados para análise visual de refeições

Perguntas abertas continuam no modelo local WebLLM. A análise de foto é uma ação separada e só pode enviar uma imagem depois que a pessoa selecionar a foto, marcar o consentimento e iniciar a análise. O navegador a redimensiona e reencoda para remover metadados comuns; o endpoint exige autenticação, valida o formato/tamanho e não registra nem persiste a imagem. A foto e a nota opcional são enviadas à OpenAI, que pode reter logs de segurança conforme a política do provedor. Mantenha a função desligada até política de privacidade, chave server-side, controles de gasto, quota e domínio permitido estarem configurados. Trate toda estimativa como aproximada, não clínica, e nunca envie fotos de usuários durante desenvolvimento.

- Prefira separar tarefas por diretórios ou arquivos com limites claros.
- Antes de iniciar, compare os arquivos permitidos das tarefas ativas. Se houver sobreposição, combine a ordem ou nomeie um único responsável por esses arquivos.
- Não use uma única pasta de trabalho compartilhada para edições concorrentes. Cada agente usa checkout/branch próprio.

## Git worktrees para tarefas paralelas

A partir do checkout principal, atualizado e limpo, crie branches e worktrees separados:

```bash
git fetch origin
git worktree add ../NutriFlow-AI-codex -b codex/nome-da-tarefa origin/main
git worktree add ../NutriFlow-AI-claude -b claude/nome-da-tarefa origin/main
```

Cada agente trabalha somente em sua pasta. Para ver worktrees ativos:

```bash
git worktree list
```

Após integrar ou abandonar uma tarefa, confirme que não há alterações necessárias na worktree antes de removê-la:

```bash
git worktree remove ../NutriFlow-AI-codex
git worktree remove ../NutriFlow-AI-claude
```

Se a branch padrão não for `main`, substitua `origin/main` pela branch padrão real. Não remova worktrees com trabalho não salvo.

## Integração

Publique a branch e abra um pull request somente quando autorizado. A revisão deve conferir critérios de aceitação, diff, testes e possíveis conflitos. O usuário aprova o merge; agentes não fazem merge para a branch principal por conta própria.
