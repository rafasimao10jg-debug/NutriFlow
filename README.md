# NutriFlow AI

Aplicação web em português para registrar refeições e ideias, acompanhar a sequência do pet Flow e organizar a rotina alimentar. O projeto está em fase de protótipo/MVP.

## Como está hoje

- Interface responsiva com tema claro e escuro.
- Cadastro, confirmação de e-mail, login e recuperação de senha pelo Supabase Auth. É necessário entrar para usar o app.
- Registro de refeições e ideias associados à conta, com cache local por usuário e sincronização com o Supabase.
- Sugestão diária de refeição que pode ser salva na agenda mensal, com indicação de registros por dia e acesso rápido à data de hoje.
- Indicadores de histórico e sequência de 5 dias para liberar o Flow.
- Resumo automático da última semana completa, com dias e registros anotados. O resumo não dá nota nem avalia qualidade nutricional. Uma frase opcional usa a IA local e conta como uma resposta da cota.
- Assistente com sugestões comuns predefinidas para respostas rápidas e modelo local opcional com WebLLM/WebGPU e Qwen2.5-0.5B para perguntas abertas. Perguntas abertas continuam locais. A análise de foto é uma função separada: somente após login, consentimento explícito e ativação do recurso, a foto comprimida e a observação opcional são enviadas à API da OpenAI para estimar alimentos, porções e faixas aproximadas de calorias e macros. O NutriFlow não persiste as fotos; configure a chave somente no servidor e confira o aviso de retenção do provedor na interface.
- Página pública de apresentação com atalhos para criar conta e entrar; não há acesso de demonstração.
- PWA instalável no Android e iPhone, com ícone NutriFlow, atalho no perfil e cache da tela principal.

## Tecnologias

- HTML, CSS e JavaScript sem framework, servidos por um servidor Node.js. O WebLLM é carregado sob demanda pelo navegador.
- Supabase JS v2 carregado pelo CDN.
- Supabase Auth e Postgres com Row Level Security (RLS).
- Replit inicia `server.js` pela porta 5000. Existe um endpoint separado para análise de fotos com visão, desligado por padrão; ele não altera a inferência local das conversas de texto.

## Executar

Use Node.js 20 ou superior. Para rodar localmente, execute `node server.js` (não precisa instalar dependências). No Replit, o comando de execução usa `npm start`. A análise de fotos permanece desligada até que `PHOTO_ANALYSIS_ENABLED=true`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e as migrations de cota e assinatura estejam prontos no servidor. A foto só é aceita após acesso base e uma cobrança Pix da assinatura mensal de IA aprovada pelo webhook; a cota paga é conferida atomicamente no servidor. A interface lê o estado por usuário em `/api/assistant/photo-access`; se o pagamento ou a cota não puderem ser conferidos, a função fica desligada. Não coloque chaves secretas em arquivos públicos. As perguntas abertas de texto continuam locais: abra o app por HTTPS em um navegador com WebGPU e toque em **Ativar IA neste dispositivo**. O app usa Qwen2.5-0.5B quantizado; a configuração q4f16 pede cerca de 945 MB de memória gráfica e limita o contexto a 2.048 tokens. Os arquivos ainda têm cerca de 290 MB para baixar. O uso depende do hardware e pode consumir memória e bateria.

Para executar os testes de cadastro e sessão simulados, rode `npm test`. Eles não criam usuários reais.

## Publicar sem Replit

O arquivo `render.yaml` prepara um Web Service do Render conectado à branch `codex/flow-name-assistant`. O servidor não precisa de chave de IA para as perguntas de texto, mas a análise de fotos depende da `OPENAI_API_KEY` privada. O Blueprint está no plano grátis para teste; o plano grátis não é adequado para produção e pode levar cerca de um minuto para acordar após inatividade. O endpoint de fotos reserva a cota no Supabase antes da chamada externa: até 800 solicitações/mês, com uma reserva conservadora de US$ 0,001 por solicitação (US$ 0,80/mês); o limite diário adicional é operacional e reinicia quando o Render reinicia. Esse limite vale somente para chamadas feitas pelo NutriFlow e não substitui um limite rígido no projeto OpenAI, cuja propagação pode permitir pequeno excedente. Mantenha a chave exclusiva para este app e configure o controle rígido do provedor antes de ativar a variável `PHOTO_ANALYSIS_ENABLED`.

O arquivo `render.static.yaml` prepara uma segunda versão como Render Static Site. Ela publica apenas os arquivos do PWA em `dist`, usa o mesmo projeto Supabase e não depende de iniciar o servidor Node para abrir a interface. A IA continua sendo processada no próprio aparelho; com a cobrança desligada, perguntas abertas e a frase semanal não chamam a API Node. O checkout está bloqueado com uma mensagem clara até sua configuração e validação. O Static Site não remove os limites gratuitos do Supabase; quando o checkout for habilitado, a API Node ainda pode levar tempo para acordar no plano Free.

Para preparar os arquivos estáticos localmente, execute `node scripts/build-static.mjs`. No Render, crie um Blueprint separado apontando para `render.static.yaml`; não substitua o Blueprint do Web Service existente.

## Instalar no celular

Abra o endereço HTTPS público do NutriFlow. No Android, use o menu do Chrome e escolha **Instalar app** ou **Adicionar à tela inicial**. No iPhone, abra no Safari, toque em **Compartilhar** e escolha **Adicionar à Tela de Início**. O app instalado é um PWA; não é um APK nem um aplicativo publicado na Play Store/App Store.

## Supabase

Consulte [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). A migration em `supabase/migrations/` cria as tabelas e políticas de acesso. O arquivo `supabase/config.example.js` contém apenas a URL e a chave publicável do cliente; nunca coloque uma chave `service_role` ou outra chave secreta no navegador ou no Git.

## Limites conhecidos antes de lançar

- A IA local depende de WebGPU e hardware compatível; precisa baixar o modelo no primeiro uso. Respostas abertas ainda podem conter erros; as ideias comuns usam opções predefinidas e o resumo semanal conta somente registros. Ainda é necessário validar o download, a geração e o consumo no Android real do usuário.
- O modelo local e sua biblioteca são baixados de serviços externos no primeiro uso; as perguntas abertas de texto são processadas localmente. Separadamente, quando a análise de foto for ativada, imagens selecionadas e notas opcionais são enviadas à OpenAI após consentimento para estimar nutrientes; a imagem não é persistida pelo NutriFlow, mas o provedor pode manter registros de segurança conforme sua política. A Política de Privacidade deve explicar esses fluxos antes da abertura ao público.
- O fluxo de refeições registra itens por data; um planejador semanal completo ainda precisa ser construído.
- Login, cadastro, recuperação e sincronização precisam de validação ponta a ponta com contas de teste.
- O app ainda precisa de política de privacidade e termos, processo de exclusão de conta, acessibilidade revisada e uma publicação estável.
- O Render e o Supabase ainda estão no plano gratuito. O painel Supabase não mostra backups agendados; antes de guardar dados reais, seguir [Preparação de produção — hospedagem e backups](docs/PRODUCTION_READINESS.md) e testar uma restauração.
- As rotas do checkout existem no servidor, mas a cobrança segue desativada e sem validação completa em sandbox.
- Há testes automatizados simulados para os fluxos de cadastro e sessão; o cadastro, a confirmação por e-mail e a sincronização ainda precisam de validação ponta a ponta com uma conta de teste.

O produto ajuda a organizar registros; não oferece diagnóstico, tratamento ou prescrição nutricional. O cadastro exige confirmação de e-mail quando essa opção estiver habilitada no Supabase.

## Colaboração

Leia [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) e [docs/AI_COLLABORATION.md](docs/AI_COLLABORATION.md) antes de alterar o projeto.

Para os bloqueios de lançamento, rascunho de oferta e preparação da primeira campanha, consulte [docs/LAUNCH_AND_META.md](docs/LAUNCH_AND_META.md).
