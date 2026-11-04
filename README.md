# NutriFlow AI

Aplicação web em português para registrar refeições e ideias, acompanhar a sequência do pet Flow e organizar a rotina alimentar. O projeto está em fase de protótipo/MVP.

## Como está hoje

- Interface responsiva com tema claro e escuro.
- Cadastro, login por e-mail e senha e recuperação de senha pelo Supabase Auth.
- Registro de refeições e ideias, com salvamento local na demonstração e sincronização com o Supabase quando a pessoa entra na conta.
- Indicadores de histórico e sequência de 5 dias para liberar o Flow.
- Assistente conectado à OpenAI pelo servidor Node. A chave é lida da variável `OPENAI_API_KEY` no servidor e nunca vai ao navegador.
- Página pública de apresentação com atalhos para demonstração, cadastro e login.

## Tecnologias

- HTML, CSS e JavaScript sem framework, servidos por um servidor Node.js integrado à API da OpenAI.
- Supabase JS v2 carregado pelo CDN.
- Supabase Auth e Postgres com Row Level Security (RLS).
- Replit inicia `server.js` pela porta 5000; o endpoint `/api/assistant` aplica validação, limite de frequência e timeout.

## Executar

Use Node.js 20 ou superior. Para rodar localmente, execute `node server.js` (não precisa instalar dependências). No Replit, o comando de execução usa `npm start`; crie lá um segredo chamado exatamente `OPENAI_API_KEY`. Para ativar a IA localmente, configure essa variável no ambiente antes de iniciar; não coloque a chave em arquivos versionados. Sem ela, a aplicação abre e o assistente informa que não está configurado.

## Supabase

Consulte [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). A migration em `supabase/migrations/` cria as tabelas e políticas de acesso. O arquivo `supabase/config.example.js` contém apenas a URL e a chave publicável do cliente; nunca coloque uma chave `service_role` ou outra chave secreta no navegador ou no Git.

## Limites conhecidos antes de lançar

- A IA real depende de configurar `OPENAI_API_KEY` nos Secrets do ambiente publicado e confirmar uma chamada real nesse ambiente. A validação local não usou nem revelou credencial.
- O limite de frequência do assistente é mantido em memória por instância; para oferta paga com tráfego, adotar cotas por conta e proteção de abuso compartilhada entre instâncias.
- A pergunta digitada no assistente é enviada à OpenAI para gerar uma resposta; o app orienta a pessoa a não incluir dados pessoais ou de saúde. Atualizar a Política de Privacidade para explicar o fornecedor e o tratamento antes de abrir ao público.
- O fluxo de refeições registra itens por data; um planejador semanal completo ainda precisa ser construído.
- Login, cadastro, recuperação e sincronização precisam de validação ponta a ponta com contas de teste.
- O app ainda precisa de política de privacidade e termos, processo de exclusão de conta, acessibilidade revisada e uma publicação estável.
- Checkout e cobrança da oferta paga ainda não estão implementados.
- Não há suíte automatizada de testes, lint ou build configurados.

Use apenas informações fictícias na demonstração local. O produto ajuda a organizar registros; não oferece diagnóstico, tratamento ou prescrição nutricional.

## Colaboração

Leia [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) e [docs/AI_COLLABORATION.md](docs/AI_COLLABORATION.md) antes de alterar o projeto.

Para os bloqueios de lançamento, rascunho de oferta e preparação da primeira campanha, consulte [docs/LAUNCH_AND_META.md](docs/LAUNCH_AND_META.md).
