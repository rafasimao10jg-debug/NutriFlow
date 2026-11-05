# NutriFlow AI

Aplicação web em português para registrar refeições e ideias, acompanhar a sequência do pet Flow e organizar a rotina alimentar. O projeto está em fase de protótipo/MVP.

## Como está hoje

- Interface responsiva com tema claro e escuro.
- Cadastro, login por e-mail e senha e recuperação de senha pelo Supabase Auth.
- Registro de refeições e ideias, com salvamento local na demonstração e sincronização com o Supabase quando a pessoa entra na conta.
- Sugestão diária de refeição que pode ser salva na agenda mensal, com indicação de registros por dia e acesso rápido à data de hoje.
- Indicadores de histórico e sequência de 5 dias para liberar o Flow.
- Resumo automático da última semana completa, com dias e registros anotados. O resumo não dá nota nem avalia qualidade nutricional. Uma frase opcional usa a IA local e conta como uma resposta da cota.
- Assistente com sugestões comuns predefinidas para respostas rápidas e modelo local opcional com WebLLM/WebGPU e Qwen2.5-0.5B para perguntas abertas. O texto das perguntas e as descrições das refeições não são enviados ao servidor NutriFlow nem a uma API paga. Quando a pessoa pede uma frase semanal ou usa uma pergunta aberta, o servidor recebe somente a sessão e uma solicitação vazia para verificar a cota.
- Página pública de apresentação com atalhos para demonstração, cadastro e login.
- PWA instalável no Android e iPhone, com ícone NutriFlow, atalho no perfil e cache da tela principal.

## Tecnologias

- HTML, CSS e JavaScript sem framework, servidos por um servidor Node.js. O WebLLM é carregado sob demanda pelo navegador.
- Supabase JS v2 carregado pelo CDN.
- Supabase Auth e Postgres com Row Level Security (RLS).
- Replit inicia `server.js` pela porta 5000; o assistente não possui endpoint de geração no servidor.

## Executar

Use Node.js 20 ou superior. Para rodar localmente, execute `node server.js` (não precisa instalar dependências). No Replit, o comando de execução usa `npm start`. Não configure `OPENAI_API_KEY`: o servidor não chama a OpenAI. Para usar a IA local, abra o app por HTTPS em um navegador com WebGPU e toque em **Ativar IA neste dispositivo**. O app usa Qwen2.5-0.5B quantizado; a configuração q4f16 pede cerca de 945 MB de memória gráfica e limita o contexto a 2.048 tokens. Os arquivos ainda têm cerca de 290 MB para baixar. O uso depende do hardware e pode consumir memória e bateria.

## Publicar sem Replit

O arquivo `render.yaml` prepara um Web Service do Render conectado à branch `codex/flow-name-assistant`. O servidor não precisa de chave de API de IA. O Blueprint está no plano grátis para teste; o plano grátis não é adequado para produção e pode levar cerca de um minuto para acordar após inatividade. Escolha um plano pago só depois de revisar o custo atual e antes de anunciar para clientes.

## Instalar no celular

Abra o endereço HTTPS público do NutriFlow. No Android, use o menu do Chrome e escolha **Instalar app** ou **Adicionar à tela inicial**. No iPhone, abra no Safari, toque em **Compartilhar** e escolha **Adicionar à Tela de Início**. O app instalado é um PWA; não é um APK nem um aplicativo publicado na Play Store/App Store.

## Supabase

Consulte [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). A migration em `supabase/migrations/` cria as tabelas e políticas de acesso. O arquivo `supabase/config.example.js` contém apenas a URL e a chave publicável do cliente; nunca coloque uma chave `service_role` ou outra chave secreta no navegador ou no Git.

## Limites conhecidos antes de lançar

- A IA local depende de WebGPU e hardware compatível; precisa baixar o modelo no primeiro uso. Respostas abertas ainda podem conter erros; as ideias comuns usam opções predefinidas e o resumo semanal conta somente registros. Ainda é necessário validar o download, a geração e o consumo no Android real do usuário.
- O modelo e a biblioteca são baixados de serviços externos no primeiro uso; as perguntas são processadas localmente. O servidor pode receber a sessão e uma solicitação sem o texto para conferir limites. A Política de Privacidade deve explicar esses fluxos e o armazenamento local antes da abertura ao público.
- O fluxo de refeições registra itens por data; um planejador semanal completo ainda precisa ser construído.
- Login, cadastro, recuperação e sincronização precisam de validação ponta a ponta com contas de teste.
- O app ainda precisa de política de privacidade e termos, processo de exclusão de conta, acessibilidade revisada e uma publicação estável.
- Checkout e cobrança da oferta paga ainda não estão implementados.
- Não há suíte automatizada de testes, lint ou build configurados.

Use apenas informações fictícias na demonstração local. O produto ajuda a organizar registros; não oferece diagnóstico, tratamento ou prescrição nutricional.

## Colaboração

Leia [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) e [docs/AI_COLLABORATION.md](docs/AI_COLLABORATION.md) antes de alterar o projeto.

Para os bloqueios de lançamento, rascunho de oferta e preparação da primeira campanha, consulte [docs/LAUNCH_AND_META.md](docs/LAUNCH_AND_META.md).
