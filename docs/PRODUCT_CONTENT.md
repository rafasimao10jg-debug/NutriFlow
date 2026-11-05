# Conteúdo do produto — NutriFlow AI

Este documento reúne a proposta de conteúdo e os textos iniciais do MVP. Ele orienta a escrita e os fluxos do produto; decisões de layout, identidade visual, cores, tipografia e composição ficam para a etapa de design.

## Proposta de produto

**NutriFlow AI ajuda pessoas adultas a organizar a alimentação do dia a dia com mais clareza, constância e autonomia.** O produto transforma registros e preferências da pessoa em sugestões práticas, mantendo a pessoa no controle das escolhas.

### Público inicial proposto

Adultos que querem planejar refeições e criar uma rotina alimentar mais organizada, sem precisar começar com contagem detalhada de calorias. Essa hipótese deve ser validada antes de expandir para necessidades clínicas, menores de idade ou planos nutricionais terapêuticos.

### Promessa e limites

- Ajudar a planejar e registrar refeições.
- Facilitar a retomada da rotina com metas escolhidas pela própria pessoa.
- Oferecer sugestões gerais e explicáveis, quando a funcionalidade de IA estiver disponível.
- Não diagnosticar, tratar doenças, substituir nutricionista ou prescrever dieta clínica.
- Não afirmar que uma refeição é “boa”, “ruim”, “limpa”, “proibida” ou que causa emagrecimento.

## Voz e escrita

- Escreva em português brasileiro natural, com frases curtas e instruções concretas.
- Use um tom acolhedor, adulto e sem julgamento. Reconheça progresso sem cobrar perfeição.
- Prefira “registrar”, “organizar”, “experimentar” e “retomar” a “compensar”, “falhar” ou “jacar”.
- Evite promessas de resultado, linguagem de culpa, urgência artificial e comparações entre pessoas.
- Explique por que a aplicação pede cada dado e deixe campos opcionais claramente identificados.
- Não invente valores nutricionais, porções, recomendações clínicas ou resultados de IA.

## Conteúdo inicial por fluxo

### Apresentação

**Título:** Sua rotina alimentar, com mais clareza.<br>
**Texto:** Planeje refeições, registre o que faz sentido para você e acompanhe sua constância em um só lugar. Sem cobrança por perfeição.<br>
**Ação principal:** Começar minha rotina<br>
**Ação secundária:** Já tenho uma conta

### Cadastro

**Título:** Crie seu espaço no NutriFlow<br>
**Texto:** Salve suas preferências e continue de onde parou.<br>
**Campos:** Nome de exibição, e-mail, senha, confirmar senha.<br>
**Ação:** Criar conta<br>
**Link:** Já tem conta? Entrar<br>
**Ajuda de senha:** Use pelo menos 8 caracteres. Não reutilize uma senha importante de outro serviço.<br>
**Consentimento:** Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade. Os links precisam existir antes de ativar o cadastro público.

### Login e recuperação

**Login — título:** Que bom ter você de volta.<br>
**Texto:** Entre para continuar sua rotina.<br>
**Campos:** E-mail, senha.<br>
**Ação:** Entrar<br>
**Link:** Esqueci minha senha<br>
**Recuperação — título:** Vamos ajudar você a entrar.<br>
**Texto:** Informe o e-mail da sua conta. Se ela existir, enviaremos instruções para redefinir a senha.<br>
**Ação:** Enviar instruções<br>
**Confirmação:** Se houver uma conta associada a esse e-mail, você receberá uma mensagem em instantes.

### Primeiros passos

**Título:** Vamos deixar o NutriFlow com a sua cara.<br>
**Texto:** Estas respostas ajudam a organizar sua experiência. Você pode pular esta etapa e mudar suas escolhas depois.

1. **O que você quer organizar primeiro?** Planejar minhas refeições; registrar o que comi; criar mais constância; explorar sugestões.
2. **Como é sua rotina?** Horários mais previsíveis; horários variáveis; prefiro não responder.
3. **Como prefere começar?** Com ideias simples; planejando alguns dias; registrando uma refeição por vez.
4. **Preferências alimentares (opcional):** Sem preferência; vegetariana; vegana; outra preferência (campo livre opcional).

**Ações:** Continuar · Fazer isso depois<br>
**Privacidade:** Use apenas informações que você deseja salvar. Não inclua dados médicos ou informações de outras pessoas no campo livre.

### Início

**Saudação:** Oi, {nome}. Vamos no seu ritmo.<br>
**Resumo:** Aqui está o que você escolheu acompanhar hoje.<br>
**Ações:** Planejar refeições · Registrar refeição · Ver meu progresso<br>
**Cartão sem registros:** Seu dia começa quando você quiser. Registre uma refeição ou monte um plano simples.<br>
**Cartão com registros:** Você já registrou {quantidade} {refeição/refeições} hoje. Cada registro ajuda a deixar seu histórico mais útil.

### Planejamento e registro de refeições

**Planejamento — título:** O que você quer deixar encaminhado?<br>
**Texto:** Monte um plano flexível. Você pode trocar ou remover qualquer item depois.<br>
**Campos:** Dia; refeição; nome da refeição ou ideia; observação opcional.<br>
**Ações:** Salvar no plano · Adicionar outra refeição · Limpar dia<br>
**Confirmação:** Plano atualizado. Você pode mudar isso a qualquer momento.

**Registro — título:** Registrar refeição<br>
**Texto:** Anote o que quiser guardar no seu histórico. Não precisa ser perfeito nem completo.<br>
**Campos:** Refeição; data e horário; descrição; observação opcional.<br>
**Ações:** Salvar registro · Cancelar<br>
**Confirmação:** Registro salvo.<br>
**Edição:** Registro atualizado.<br>
**Exclusão:** Registro removido do seu histórico.

O primeiro MVP pode guardar descrições livres e horários. Não estime calorias ou nutrientes sem uma fonte identificada, método validado e revisão do escopo.

### Progresso

**Título:** Seu progresso, do seu jeito.<br>
**Texto:** Seus registros ficam no histórico. A sequência do pet recomeça se passar um dia sem registro.<br>
**Indicadores propostos:** refeições registradas; dias em que você usou o app; planos criados e concluídos.<br>
**Vazio:** Seu histórico começa com o primeiro registro.<br>
**Privacidade:** Somente você pode ver este histórico na sua conta.

Não use rankings, culpa, metas automáticas de peso ou alertas para compensar refeições. Explique a regra da sequência do pet com clareza e sem julgamento.

### Assistente NutriFlow (modo de demonstração)

**Apresentação:** Posso ajudar com ideias gerais para organizar refeições e explorar opções. Você decide o que combina com sua rotina.<br>
**Sugestões de pergunta:** Me ajude a organizar refeições para amanhã; sugira opções com os ingredientes que tenho; adapte uma ideia à minha preferência alimentar.<br>
**Aviso contextual:** As respostas são sugestões gerais e podem conter erros. Para orientação individual ou uma condição de saúde, converse com um nutricionista ou profissional de saúde.

O assistente usa um modelo local por WebLLM/WebGPU. Após a ativação explícita e o primeiro download, a pergunta é processada no dispositivo e não é enviada ao servidor NutriFlow nem a uma API de geração. A biblioteca e os arquivos do modelo são baixados de serviços externos. O servidor recebe somente a sessão e uma chamada sem o texto da pergunta para conferir os limites de uso; explique isso na Política de Privacidade. Informar necessidade de internet no primeiro uso, espaço, memória, bateria e compatibilidade; não iniciar o download até a pessoa ativar. O assistente oferece ideias gerais de organização; não deve fornecer diagnóstico, tratamento, prescrição clínica, orientação para urgências ou garantir segurança em alergias. Se o assunto envolver doença, gravidez, transtorno alimentar, criança, medicamento ou outra decisão clínica, explique o limite e recomende procurar profissional qualificado. Não invente nutrientes, fontes ou credenciais profissionais.

## Mensagens de estado

### Companheiro de jornada

O app oferece o Flow como companhia visual. Um dia conta quando há pelo menos um registro com a data de hoje; vários registros no mesmo dia contam como um. Datas futuras não contam. Cinco dias seguidos liberam o pet. Se passar um dia sem registro antes de liberar, a sequência volta ao zero. Depois de liberado, o Flow permanece com a pessoa, mesmo que a sequência pare. A sequência não se relaciona a calorias, peso ou qualidade da alimentação. O pet não avalia escolhas nem substitui apoio profissional.

### Guia rápido dentro do app

O botão “Como usar o app” na tela inicial e o botão “?” no topo abrem o guia. Ele explica como anotar uma refeição, como funciona a sequência do pet e onde os dados ficam salvos. O botão “Abrir Refeições” do guia leva direto à lista de refeições.

| Situação | Texto |
| --- | --- |
| Salvando | Salvando suas alterações… |
| Salvo | Tudo salvo. |
| Sem conexão | Você está sem conexão. Suas alterações ainda não foram sincronizadas. |
| Erro ao salvar | Não foi possível salvar agora. Tente novamente. |
| Sessão encerrada | Sua sessão terminou. Entre novamente para continuar. |
| Campo obrigatório | Preencha este campo para continuar. |
| E-mail inválido | Confira o formato do seu e-mail. |
| Senhas diferentes | As senhas não correspondem. |
| Falha de login | Não foi possível entrar com esses dados. Confira e tente de novo. |
| Erro inesperado | Algo não saiu como esperado. Tente novamente em instantes. |

## Requisitos de conteúdo para o primeiro MVP

- Oferecer cadastro, login, recuperação de senha e saída da conta com mensagens claras.
- Permitir que a pessoa escolha preferências básicas e altere ou remova essas escolhas.
- Salvar planos, registros e progresso associados à conta; mostrar quando o salvamento ainda não sincronizou.
- Explicar o que será salvo e como pedir exclusão da conta e dos dados antes do lançamento.
- Permitir navegação em tema claro e escuro sem alterar o significado ou contraste dos textos.
- Tratar IA como etapa posterior à definição de fornecedor, dados enviados, retenção, custos e controles de privacidade.

## Questões para validar antes de ampliar o escopo

- O público é apenas adulto? Em quais países e idiomas o produto será lançado?
- O objetivo principal é organização de refeições, acompanhamento, educação nutricional ou outra coisa?
- O MVP precisa calcular calorias/macros ou basta planejar e registrar refeições?
- Quais dados são realmente necessários e por quanto tempo serão guardados?
- A IA será parte do primeiro lançamento? Quais dados poderá receber e quais assuntos deve recusar?
- Qual serviço fará autenticação e armazenamento seguro entre dispositivos?

Essas decisões afetam privacidade, segurança, arquitetura, custo e o conteúdo apresentado. Não assuma respostas por conta própria.
