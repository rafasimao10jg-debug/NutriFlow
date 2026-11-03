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
