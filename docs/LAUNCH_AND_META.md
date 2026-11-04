# Plano de lançamento e Meta — NutriFlow

Atualizado em 4 de novembro de 2026. Este plano é um rascunho operacional, não uma autorização para publicar anúncios ou investir orçamento.

## Estado do produto

O app já tem uma página pública de apresentação e uma demonstração navegável para registrar refeições e ideias, ver histórico, alternar tema e acompanhar os dias para liberar o Flow. O assistente aparece na navegação, mas suas respostas são guiadas; não há IA conectada. Cadastro, login, confirmação de senha e recuperação de senha pelo Supabase existem no código, mas ainda precisam de validação ponta a ponta. A prévia do Replit ainda não contém a branch `codex/flow-name-assistant`.

**Posicionamento que o produto atual sustenta:** NutriFlow ajuda adultos a organizar ideias e registros de refeições no próprio ritmo. O Flow é uma companhia visual liberada após cinco dias seguidos de registro.

**Não anunciar como disponível:** planejamento semanal completo, recomendações de IA, cálculo de calorias/nutrientes, resultados de peso ou benefício clínico.

## Oferta provisória para beta

**Promessa:** Mais clareza para organizar refeições e ideias do dia a dia.

**O que a pessoa recebe hoje:** registro por data, histórico simples, tema claro/escuro, guia dentro do app e sequência para liberar o Flow. A demonstração salva os dados no navegador. A conta Supabase precisa passar por teste real antes de prometer sincronização em anúncio.

**Preço e modelo comercial:** ainda não definidos. Não criar anúncio de venda, teste grátis, desconto ou assinatura até decidir preço, cobrança e o que será gratuito.

### Texto de anúncio — rascunho de beta

**Texto principal:**

Organize suas ideias de refeições em um só lugar. Registre o que quer guardar, consulte seu histórico e acompanhe sua sequência no seu ritmo. Conheça o NutriFlow.

**Título:** Mais clareza para organizar refeições

**Botão:** Saiba mais

**Roteiro vertical de 15 segundos:**

1. Mostrar a tela inicial: “Quer guardar uma ideia de refeição?”
2. Registrar uma ideia e mostrar a lista por data.
3. Mostrar o progresso do Flow: “Cinco dias seguidos liberam o Flow.”
4. Encerrar com: “NutriFlow. Organize no seu ritmo.”

Mostrar a interface real do app. Não simular uma resposta de IA, um plano alimentar ou uma sincronização que ainda não tenha sido validada.

## Primeira rodada de campanha

1. Corrigir os bloqueios de lançamento abaixo e definir a oferta e o destino final do anúncio.
2. Começar com uma campanha de teste pequena, para público adulto e amplo no Brasil. Não segmentar por condição de saúde, peso ou dados alimentares.
3. Comparar duas peças: uma sobre organização de registros e outra sobre o Flow e a constância. Mudar uma hipótese por rodada para entender qual mensagem traz cadastros que realmente usam o app.
4. Acompanhar visitas à página, início e conclusão de cadastro, primeiro registro salvo e retorno ao app. Use UTMs e métricas agregadas próprias.
5. Só aumentar o orçamento quando cadastro, primeiro uso e retorno estiverem funcionando e o custo por pessoa ativada couber na margem definida para a oferta.

Não instalar Pixel nem enviar eventos da área autenticada, nomes de refeições, preferências alimentares ou progresso para a Meta. A recomendação conservadora é não enviar dados que possam revelar ou se basear em informações de saúde através do Pixel, Conversions API ou outros Business Tools; confira a classificação do domínio e os termos atuais da Meta antes de adicionar qualquer medição externa. [Termos dos Business Tools da Meta](https://www.facebook.com/legal/technology_terms)

Na criação do anúncio, evitar texto que afirme ou sugira que a pessoa tem uma condição, peso ou hábito específico. Não usar vergonha corporal, pressão ou promessas de resultado. A Meta avalia anúncios conforme seus padrões de publicidade, incluindo atributos pessoais e saúde/aparência. [Padrões de Publicidade da Meta](https://transparency.meta.com/policies/ad-standards/)

## Bloqueios antes de investir em tráfego

| Prioridade | Pendência | Estado |
| --- | --- | --- |
| P0 | Integrar a branch `codex/flow-name-assistant` ao projeto que alimenta o Replit e confirmar um endereço público estável | Pendente; a página pública está só na branch |
| P0 | Executar/confirmar a migration no Supabase; testar cadastro, confirmação, login, recuperação e sincronização com contas de teste | Não verificado |
| P0 | Publicar Termos e Política de Privacidade com responsável, dados coletados, retenção, contato e exclusão de conta | Não existe no app |
| P0 | Decidir se o beta será sem IA real ou aguardar o backend e a chave privada configurados nos Secrets do Replit | Pendente; nenhuma chave foi criada |
| P1 | Decidir se o beta inclui somente registros ou também um planejador semanal; a tela atual não separa planos de registros | Funcionalidade parcial |
| P1 | Revisar navegação por teclado, leitores de tela, contraste, erros de rede e telas pequenas | Revisão incompleta |
| P1 | Criar roteiro de suporte e resposta a falhas de login/sincronização | Pendente |
| P2 | Definir preço, forma de cobrança, limites do plano e meta de custo de aquisição | Decisão do negócio pendente |
| P2 | Revisar no Events Manager se a Meta permite qualquer evento não sensível para este domínio; manter dados de refeições fora da medição | Pendente |

## Critério para escalar

Não escalar com base apenas em clique ou cadastro. Primeiro definir o que significa uma pessoa ativada — proposta inicial: concluir cadastro e salvar o primeiro registro — e acompanhar se ela volta a usar o produto. O limite de CAC precisa ser calculado depois que preço, custo de atendimento e modelo comercial forem definidos. Se o beta ainda não cobrar, priorizar aprendizado de ativação e retenção, sem tratar cadastro como receita.
