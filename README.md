# NutriFlow AI

Aplicação web em português para registrar refeições e ideias, acompanhar a sequência do pet Flow e organizar a rotina alimentar. O projeto está em fase de protótipo/MVP.

## Como está hoje

- Interface responsiva com tema claro e escuro.
- Cadastro, login por e-mail e senha e recuperação de senha pelo Supabase Auth.
- Registro de refeições e ideias, com salvamento local na demonstração e sincronização com o Supabase quando a pessoa entra na conta.
- Indicadores de histórico e sequência de 5 dias para liberar o Flow.
- Assistente visível na navegação. No momento, ele usa respostas guiadas de demonstração; **não há modelo de IA conectado**.

## Tecnologias

- HTML, CSS e JavaScript sem framework.
- Supabase JS v2 carregado pelo CDN.
- Supabase Auth e Postgres com Row Level Security (RLS).
- Replit configurado para servir a aplicação pela porta 5000.

## Executar

Abra o projeto no Replit e inicie a aplicação. Para rodar localmente, sirva a pasta na porta 5000 com qualquer servidor HTTP estático. Não abra `index.html` usando `file://`, pois o login e os módulos precisam de um servidor.

## Supabase

Consulte [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). A migration em `supabase/migrations/` cria as tabelas e políticas de acesso. O arquivo `supabase/config.example.js` contém apenas a URL e a chave publicável do cliente; nunca coloque uma chave `service_role` ou outra chave secreta no navegador ou no Git.

## Limites conhecidos antes de lançar

- O assistente ainda não usa uma IA real.
- O fluxo de refeições registra itens por data; um planejador semanal completo ainda precisa ser construído.
- Login, cadastro, recuperação e sincronização precisam de validação ponta a ponta com contas de teste.
- O app ainda precisa de política de privacidade e termos, processo de exclusão de conta, acessibilidade revisada e uma publicação estável.
- Não há suíte automatizada de testes, lint ou build configurados.

Use apenas informações fictícias na demonstração local. O produto ajuda a organizar registros; não oferece diagnóstico, tratamento ou prescrição nutricional.

## Colaboração

Leia [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) e [docs/AI_COLLABORATION.md](docs/AI_COLLABORATION.md) antes de alterar o projeto.
