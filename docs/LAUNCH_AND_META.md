# Plano de lançamento e Meta — NutriFlow

Atualizado em 4 de novembro de 2026. Este plano é um rascunho operacional, não uma autorização para publicar anúncios ou investir orçamento.

## Estado do produto

O app tem página pública, demonstração de registros, tema claro/escuro e sequência para liberar o Flow. O assistente agora chama a API da OpenAI pelo servidor Node, com a chave lida de `OPENAI_API_KEY` no ambiente, limite temporário por endereço e aviso de privacidade no chat. Há um Blueprint preparado para Render, mas nenhum serviço público foi criado e a IA ainda não foi validada em produção. Cadastro, login, confirmação de senha e recuperação pelo Supabase precisam de validação ponta a ponta.

**Posicionamento que o produto atual sustenta:** NutriFlow ajuda adultos a organizar ideias e registros de refeições no próprio ritmo. O Flow é uma companhia visual liberada após cinco dias seguidos de registro.

**Não anunciar como disponível ainda:** recomendações de IA até a chamada real no Replit ser confirmada, planejamento semanal completo, cálculo de calorias/nutrientes, resultados de peso ou benefício clínico. O assistente oferece ideias gerais, não aconselhamento clínico.

## Oferta paga — definição pendente

O primeiro lançamento será uma oferta paga. O preço, condições, cobrança, período de acesso e itens incluídos ainda serão informados pelo responsável pelo produto; não publicar anúncio de venda nem ativar checkout antes dessa definição.

**Promessa provisória, sujeita à validação do produto:** Mais clareza para organizar refeições e ideias do dia a dia, com apoio de um assistente de IA. Só usar essa promessa depois que o modelo real estiver integrado e testado, com limites e aviso claros de que não substitui nutricionista ou profissional de saúde.

**Preço e condições:** aguardando definição do responsável. Não inventar valores, descontos, garantia, renovação ou período de teste.

**O que existe hoje:** registro por data, histórico simples, tema claro/escuro, guia dentro do app e sequência para liberar o Flow. A demonstração salva os dados no navegador. Cadastro e sincronização Supabase precisam de validação real antes de prometer esses recursos como confiáveis em uma oferta paga.

### Texto de anúncio — rascunho para oferta paga

**Texto principal:**

Rascunho para usar somente depois de validar a chamada de IA publicada e definir a oferta: Organize suas ideias de refeições, registre o que quer guardar e conte com um assistente de IA para apoiar sua rotina. Conheça o NutriFlow.

**Título:** Mais clareza para organizar refeições

**Botão:** Saiba mais

**Roteiro vertical de 15 segundos:**

1. Mostrar a tela inicial: “Quer guardar uma ideia de refeição?”
2. Registrar uma ideia e mostrar a lista por data.
3. Mostrar o progresso do Flow: “Cinco dias seguidos liberam o Flow.”
4. Encerrar com: “NutriFlow. Organize no seu ritmo.”

Mostrar apenas recursos reais e testados. Não simular resposta de IA, plano alimentar, cobrança ou sincronização. Este roteiro só pode ser publicado depois de confirmar uma chamada real de IA no endereço público e definir a oferta paga.

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
| P0 | Criar serviço no Render a partir de `render.yaml`, configurar a chave diretamente nos Secrets e confirmar endereço público estável | Blueprint pronto; depende de conectar a conta GitHub ao Render e preencher o segredo |
| P0 | Executar/confirmar a migration no Supabase; testar cadastro, confirmação, login, recuperação e sincronização com contas de teste | Não verificado |
| P0 | Publicar Termos e Política de Privacidade com responsável, dados coletados, retenção, contato e exclusão de conta | Não existe no app |
| P0 | Configurar `OPENAI_API_KEY` nos Secrets do Render e validar uma resposta real, limites de uso, erros e custo | Código integrado; falta serviço publicado, segredo no Render e teste real |
| P1 | Decidir se o beta inclui somente registros ou também um planejador semanal; a tela atual não separa planos de registros | Funcionalidade parcial |
| P1 | Revisar navegação por teclado, leitores de tela, contraste, erros de rede e telas pequenas | Revisão incompleta |
| P1 | Criar roteiro de suporte e resposta a falhas de login/sincronização | Pendente |
| P0 | Definir preço, condições, o que está incluído e como cobrar; implementar e validar checkout/assinatura antes de vender | Aguardando informações do responsável; não há cobrança implementada |
| P1 | Definir limites de uso da IA e estimar custo por pessoa pagante para calcular margem e CAC máximo | Pendente da integração e do preço |
| P2 | Revisar no Events Manager se a Meta permite qualquer evento não sensível para este domínio; manter dados de refeições fora da medição | Pendente |

## Critério para escalar

Não escalar com base apenas em clique ou cadastro. Como a primeira oferta será paga, definir o evento de ativação e medir compra concluída, primeiro uso e retorno, respeitando privacidade. Calcular CAC máximo somente depois de definir preço, taxas, custos de IA, suporte, reembolso e margem. Não aumentar orçamento até checkout, IA, autenticação e experiência de ponta a ponta estarem validados.
