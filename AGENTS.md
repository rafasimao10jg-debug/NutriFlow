# AGENTS.md

## Projeto

NutriFlow AI é o nome do produto deste repositório. O escopo funcional, o público-alvo e os requisitos de saúde ainda não foram especificados; confirme-os nos documentos do projeto antes de implementar funcionalidades. Não invente aconselhamento nutricional, alegações médicas, integrações ou fluxos do produto.

## Stack e arquitetura

A stack ainda não foi definida. Antes de escolher ferramentas, inspecione os requisitos e converse com o usuário se a decisão afetar arquitetura, custo, hospedagem ou dados. Registre as escolhas aqui e no README antes de introduzir dependências.

Mantenha responsabilidades separadas, componentes e módulos pequenos, interfaces claras e validação nas fronteiras. Evite duplicar lógica e não introduza infraestrutura sem necessidade demonstrada.

## Padrões de código

- Siga os padrões já estabelecidos nos arquivos e ferramentas do repositório.
- Use nomes claros e consistentes com o idioma e convenções da stack escolhida.
- Prefira mudanças focadas e compatíveis com o comportamento existente.
- Documente decisões arquiteturais que afetem mais de uma parte do sistema.

## Design e acessibilidade

- Priorize interfaces responsivas, legíveis e consistentes.
- Garanta navegação por teclado, foco visível, rótulos acessíveis e contraste adequado.
- Não apresente resultados gerados por IA como diagnóstico ou recomendação clínica sem requisitos, validação e salvaguardas aprovados.

## Segurança e dados

- Nunca inclua credenciais, tokens, dados pessoais ou dados de saúde em código, logs, commits ou exemplos.
- Leia segredos somente de variáveis de ambiente no servidor e mantenha arquivos locais de ambiente fora do Git.
- Colete e retenha apenas os dados necessários ao requisito aprovado.
- Valide entradas não confiáveis e trate erros sem revelar dados ou detalhes internos.
- Antes de adicionar um fornecedor de IA, identifique quais dados serão enviados, finalidade, retenção e controles de privacidade. Não envie dados reais de usuários durante desenvolvimento ou testes.

## Integrações de IA

- Encapsule chamadas de modelo atrás de módulos bem definidos.
- Valide e trate a saída do modelo como entrada não confiável; não a execute nem a use como autorização.
- Defina limites, tratamento de falhas e comportamento quando o modelo estiver indisponível.
- Não invente credenciais nem registre valores secretos em `.env.example`.
- Assistente NutriFlow usa WebLLM no navegador com inferência local por WebGPU; perguntas não devem ir ao servidor nem a um provedor de modelos. Não adicionar fallback remoto automático ou integração que gere cobrança sem autorização explícita.
- Só iniciar o download do modelo depois de ação explícita da pessoa; informar espaço, memória, bateria, uso de dados e compatibilidade antes de ativar.

## Testes e validação

- Siga os comandos de validação existentes; quando a stack for definida, documente comandos de teste, lint e build.
- Adicione ou atualize testes para mudanças comportamentais e casos de erro.
- Não declare uma validação como concluída sem executá-la e relatar o resultado.

## Colaboração entre agentes

- Codex e Claude Code devem ler este arquivo antes de alterar o projeto. `CLAUDE.md` aponta para estas instruções para evitar divergência.
- Para cada tarefa, use uma branch própria e o modelo em `docs/AI_TASK_TEMPLATE.md`.
- Coordene previamente qualquer sobreposição de arquivos; dois agentes não devem editar os mesmos arquivos ao mesmo tempo.
- Mantenha mudanças pequenas, revise o diff e reporte arquivos alterados, validações executadas e limitações.
- Integre por pull request após revisão e aprovação do usuário. Não faça push, merge ou publicação sem autorização apropriada.
