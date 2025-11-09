# ParkinsonCheck

Sistema de informação baseado em nuvem que utiliza tecnologias de visão computacional e inteligência artificial para auxiliar na detecção e acompanhamento de sintomas da doença de Parkinson. Este projeto foi desenvolvido como parte do Trabalho de Conclusão de Curso na Universidade Federal do Paraná em Análise e Desenvolvimento de Sistemas.

## Tecnologias Utilizadas

- **Front-end:** Angular & TypeScript
- **Back-end:** FastAPI (Python)
- **Banco de Dados:** PostgreSQL
- **Ambiente:** Docker & Docker Compose

## Pré-requisitos

Para rodar este projeto, você precisará ter instalado:

- Git
- Docker
- Docker Compose

## Como Rodar o Projeto

Siga os passos abaixo para configurar o ambiente de desenvolvimento local:

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/gab-i-alves/parkinson-check
    cd parkinson-check
    ```

2.  **Crie o arquivo de ambiente do back-end:**
    Copie o arquivo de exemplo `.env.example` para criar seu próprio arquivo `.env`. O Docker Compose usará este arquivo para configurar os serviços.

    ```bash
    cp .env.example .env
    ```

    Se o comando cp não funcionar, utilize:

    ```bash
    copy .env.example .env
    ```

3.  **Inicie os serviços com Docker Compose:**
    Este comando irá construir as imagens e iniciar os contêineres do back-end e do banco de dados.

    ```bash
    docker-compose up --build -d
    ```

4.  **Instale as dependências do Front-end:**
    Em um **novo terminal**, navegue até a pasta do front-end e execute o `npm install`.

    ```bash
    cd frontend
    npm install
    ```

5.  **Inicie a aplicação Front-end:**
    Ainda no terminal da pasta `frontend`, execute:

    ```bash
    ng serve
    ```

6.  **Acesse as aplicações:**
    - **Front-end (Angular):** [http://localhost:4200](http://localhost:4200)
    - **Back-end (FastAPI Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)

## Roadmap do Produto

### Visão do Produto

Oferecer monitoramento e acompanhamento de sintomas da Doença de Parkinson através de uma plataforma digital que conecta médicos e pacientes, fornecendo ferramentas de teste acessíveis e insights baseados em dados.

---

### Release 1: Fundação e Testes de Prática

**Período:** 23 de Julho a 16 de Setembro (Aproximadamente 8 semanas)  
**Objetivo:** Permitir o cadastro inicial de pacientes e médicos, a autenticação e interação inicial com os dashboards, além de solicitar vínculos entre si.

#### Sprints

| Sprint | Data          | Foco                       | Resultado                                                                                        |
| ------ | ------------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| 1      | 23/07 a 05/08 | Estrutura e acesso inicial | Pacientes e médicos podem se cadastrar e fazer login com segurança                               |
| 2      | 06/08 a 19/08 | Conexão médico-paciente    | Pacientes e médicos podem solicitar e aprovar vínculos                                           |
| 3      | 20/08 a 02/09 | Teste de prática: Espiral  | Usuários podem realizar teste de desenho da espiral e ver o resultado imediato e não persistente |
| 4      | 03/09 a 16/09 | Teste de prática: Voz      | Usuários podem realizar um teste de análise de voz e ver o resultado imediato e não persistente  |

---

### Release 2: Funcionalidade Clínica e Análise de Dados

**Período:** 17 de Setembro a 28 de Outubro (Aproximadamente 6 semanas)  
**Objetivo:** Transformar os testes de prática em ferramentas clínicas, capacitando os médicos a monitorar a progressão dos pacientes através de dados históricos e anotações.

#### Sprints

| Sprint | Data          | Foco                           | Resultado                                                                                                                                                  |
| ------ | ------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5      | 17/09 a 30/09 | Dashboard do médico            | O médico pode ver uma lista de seus pacientes vinculados e acessar seus perfis, além da aba de análises; também é possível solicitar vínculo com pacientes |
| 6      | 01/10 a 14/10 | Implementação do teste clínico | O paciente realiza um teste clínico, os dados são analisados, salvos e o médico pode visualizar os resultados                                              |
| 7      | 15/10 a 28/10 | Histórico e feedback           | O paciente pode ver seu histórico de testes; o médico pode adicionar anotações                                                                             |

---

### Release 3: Integridade e Administração da Plataforma

**Período:** 29 de Outubro a 11 de Novembro (Aproximadamente 2 semanas)  
**Objetivo:** Garantir a confiabilidade e segurança da plataforma, implementando o controle administrativo e refinando a experiência do usuário.

#### Sprints

| Sprint | Data          | Foco                             | Resultado                                                                                                                                                          |
| ------ | ------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 8      | 29/10 a 11/11 | Ferramentas administrativas e UX | Administradores podem gerenciar usuários e aprovar o cadastro de médicos para garantir a legitimidade do sistema; melhorias na interface e estabilidade do sistema |

---

# HU001 – Autenticar no Sistema como Usuário

## História do Usuário

**Sendo** usuário  
**Quero** me autenticar no sistema com segurança  
**Para** acessar as funcionalidades de testes e monitoramento.

## Critérios de Aceitação

- Login seguro
- Redirecionamento apropriado
- Recuperação de Senha

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que já estou cadastrado no sistema  
E cliquei em "Entre no sistema"

1. **Login seguro**

   - Dado que estou na tela de login
   - Quando preencho e-mail/CPF e senha corretamente
   - Então o sistema valida meus dados e permite o acesso

2. **Redirecionamento apropriado**

   - Dado que inseri credenciais válidas
   - Quando o sistema autentica meu login
   - Então sou direcionado para minha página inicial de usuário

3. **Recuperação de Senha**
   - Dado que esqueci minha senha
   - Quando clico em "Esqueci minha senha" e informo meu e-mail
   - Então o sistema envia um link de recuperação para meu e-mail

---

# HU002 – Realizar Cadastro de Usuário

## História do Usuário

**Sendo** um novo usuário comum  
**Quero** realizar meu cadastro no sistema  
**Para** utilizar as funcionalidades de testes e monitoramento.

## Critérios de Aceitação

- Formulário específico para usuários
- Validação de dados
- Confirmação por e-mail
- Armazenamento seguro
- Conclusão do cadastro

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que não tenho cadastro  
E cliquei em "Cadastre-se como Usuário"

1. **Formulário específico para usuários**

   - Dado que estou na tela de cadastro
   - Quando preencho todos os campos obrigatórios e informo um CEP válido
   - Então o sistema preenche automaticamente os campos de endereço

2. **Validação de dados**

   - Dado que inseri meus dados pessoais
   - Quando o sistema verifica o formato e duplicidade
   - Então exibe mensagem de erro caso encontre problemas ou permite prosseguir

3. **Confirmação por e-mail**

   - Dado que concluí o preenchimento do formulário
   - Quando clico em "Cadastrar"
   - Então recebo um e-mail com link de ativação da conta

4. **Armazenamento seguro**

   - Dado que defini minha senha
   - Quando o sistema registra meu cadastro
   - Então armazena a senha de forma criptografada e protege meus dados pessoais

5. **Conclusão do cadastro**
   - Dado que cliquei no link de ativação recebido por e-mail
   - Quando o sistema confirma minha conta
   - Então sou redirecionado para a tela inicial com mensagem de boas-vindas

---

# HU003 – Praticar Teste da Espiral

## História do Usuário

**Sendo** um usuário (paciente)  
**Quero** realizar o teste da espiral em um modo de prática  
**Para** me familiarizar com o exercício e ter um feedback imediato sobre meu desempenho.

## Critérios de Aceitação

- Acesso ao teste
- Instruções claras
- Seleção do método do teste
- Execução do teste (com dois cenários possíveis)
- Análise automatizada
- Apresentação de resultados

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado no sistema  
E naveguei até a seção de testes

1. **Acesso ao teste**

   - Dado que estou na página de testes disponíveis
   - Quando clico no botão "Realizar Teste da Espiral"
   - Então o sistema me direciona para a tela de preparação do teste

2. **Instruções claras**

   - Dado que iniciei o teste da espiral
   - Quando a tela de instruções é exibida
   - Então visualizo orientações detalhadas sobre como realizar o teste corretamente

3. **Seleção do método do teste**

   - Dado que li as instruções iniciais
   - Quando avanço para a próxima etapa
   - Então o sistema me apresenta a opção de escolher entre:
     - **Teste com Webcam (digital)**
     - **Teste no Papel (manual)**

4. **Execução do teste**

   - **Cenário A: Teste Digital (com Webcam)**
     - Dado que escolhi a opção “Teste com Webcam”
     - Quando minha webcam é ativada e o modelo de espiral é exibido na tela
     - Então consigo desenhar a espiral diretamente na tela, enquanto o sistema captura meu traçado
   - **Cenário B: Teste no Papel (com Foto)**
     - Dado que escolhi a opção “Teste no Papel”
     - Quando sigo as instruções para baixar, imprimir e desenhar a espiral
     - Então o sistema me guia para uma tela onde posso fotografar e enviar meu desenho para análise

5. **Análise automatizada**

   - Dado que concluí o traçado da espiral
   - Quando finalizo o processo de envio
   - Então o sistema exibe uma tela de carregamento, indicando que está processando os dados capturados

6. **Apresentação de resultados**
   - Dado que o sistema concluiu a análise
   - Quando os resultados são processados
   - Então visualizo uma tela com:
     - Minha pontuação
     - Métricas detalhadas (tremor, precisão, etc.)
     - Comparação do meu traçado com o modelo de referência

# HU004 – Praticar Teste de Voz

## História do Usuário

**Sendo** usuário  
**Quero** praticar a realização do teste de análise de voz  
**Para** me familiarizar com o exercício e ter um feedback imediato sobre meu desempenho.

## Critérios de Aceitação

- Acesso ao teste
- Instruções de gravação
- Captura de áudio
- Análise de padrões vocais
- Apresentação de resultados

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado no sistema  
E naveguei até a seção de testes

1. **Acesso ao teste**

   - Dado que estou na página de testes disponíveis
   - Quando clico no botão "Realizar Teste de Voz"
   - Então o sistema inicia a preparação do teste

2. **Instruções de gravação**

   - Dado que iniciei o teste de voz
   - Quando a tela de instruções é exibida
   - Então visualizo orientações detalhadas sobre como realizar a gravação corretamente

3. **Captura de áudio**

   - Dado que li as instruções e cliquei em "Iniciar Gravação"
   - Quando meu microfone é ativado
   - Então consigo gravar a amostra de voz seguindo o texto sugerido

4. **Análise de padrões vocais**

   - Dado que concluí a gravação
   - Quando clico em "Finalizar Gravação"
   - Então o sistema processa automaticamente os dados de áudio capturados

5. **Apresentação de resultados**
   - Dado que o sistema concluiu a análise
   - Quando os resultados são processados
   - Então visualizo métricas vocais com explicações sobre os indicadores analisados

---

# HU006 – Visualizar Resultados Gerais

## História do Usuário

**Sendo** usuário  
**Quero** visualizar um panorama de todos os meus testes clínicos ao longo do tempo  
**Para** acompanhar a evolução do meu quadro com base nos registros oficiais.

## Critérios de Aceitação

- Painel de visão geral
- Gráficos comparativos de evolução
- Lista de histórico clínico

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado no sistema  
E realizei múltiplos testes clínicos ao longo do tempo

1. **Painel de visão geral**

   - Dado que acessei a seção "Meus Resultados"
   - Quando a página carrega
   - Então visualizo um dashboard com histórico de todos os meus testes

2. **Gráficos comparativos**

   - Dado que estou no painel de resultados
   - Quando analiso a seção de evolução temporal
   - Então vejo gráficos mostrando as tendências dos principais indicadores, populados apenas com dados de testes clínicos

3. **Lista de histórico clínico**
   - Dado que estou no painel de resultados
   - Quando observo a lista de testes
   - Então a lista exibe apenas os testes clínicos realizados em consultórios, com data e resultado principal

# HU007 – Atrelar Médico

## História do Usuário

**Sendo** usuário  
**Quero** me vincular a um médico cadastrado no sistema  
**Para** compartilhar meus resultados e obter acompanhamento profissional.

## Critérios de Aceitação

- Busca de médicos
- Solicitação de vínculo
- Gerenciamento de solicitações
- Confirmação de vínculo

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado no sistema  
E naveguei até a seção "Meus Médicos"

1. **Busca de médicos**

   - Dado que cliquei em "Adicionar Médico"
   - Quando utilizo a barra de busca com nome, especialidade ou localização
   - Então visualizo uma lista de médicos que correspondem aos critérios

2. **Solicitação de vínculo**

   - Dado que selecionei um médico da lista
   - Quando clico em "Solicitar Vínculo" e opcionalmente adiciono uma mensagem
   - Então o sistema envia a solicitação para o médico escolhido

3. **Gerenciamento de solicitações**

   - Dado que enviei uma ou mais solicitações
   - Quando acesso a aba "Solicitações"
   - Então vejo todas as minhas solicitações com seus respectivos status

4. **Confirmação de vínculo**
   - Dado que um médico aceitou minha solicitação
   - Quando recebo a notificação de aceitação
   - Então o médico aparece na minha lista de "Médicos Vinculados" e tem acesso aos meus resultados

---

# HU008 – Autenticar no Sistema como Médico

## História do Usuário

**Sendo** médico  
**Quero** me autenticar no sistema de forma segura  
**Para** acessar as funcionalidades de acompanhamento de pacientes.

## Critérios de Aceitação

- Login seguro
- Redirecionamento apropriado
- Recuperação de senha
- Verificação de status de conta

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que já estou cadastrado no sistema  
E cliquei em "Entre no sistema"

1. **Login seguro**

   - Dado que estou na tela de login
   - Quando preencho e-mail/CRM e senha corretamente
   - Então o sistema valida meus dados e permite o acesso

2. **Redirecionamento apropriado**

   - Dado que inseri credenciais válidas
   - Quando o sistema autentica meu login
   - Então sou direcionado para minha página inicial de médico

3. **Recuperação de senha**

   - Dado que esqueci minha senha
   - Quando clico em "Esqueci minha senha" e informo meu e-mail
   - Então o sistema envia um link de recuperação para meu e-mail

4. **Verificação de status de conta**
   - Dado que minha conta está pendente de aprovação
   - Quando tento fazer login
   - Então recebo uma mensagem informando o status atual de minha conta

---

# HU009 – Realizar Cadastro de Médico

## História do Usuário

**Sendo** um profissional médico  
**Quero** realizar meu cadastro especializado no sistema  
**Para** acompanhar pacientes e analisar seus resultados.

## Critérios de Aceitação

- Formulário especializado para médicos
- Validação de credenciais médicas
- Fluxo de aprovação
- Documentação comprobatória
- Notificação de status

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que não tenho cadastro  
E cliquei em "Cadastre-se como Médico"

1. **Formulário especializado para médicos**

   - Dado que estou na tela de cadastro médico
   - Quando preencho os campos básicos e os específicos (CRM, especialidade)
   - Então o sistema registra meus dados profissionais

2. **Validação de credenciais médicas**

   - Dado que informei meu CRM
   - Quando o sistema verifica sua validade
   - Então confirma a legitimidade da informação ou solicita correção

3. **Fluxo de aprovação**

   - Dado que concluí o preenchimento do formulário
   - Quando submeto o cadastro
   - Então minha conta permanece com status "pendente de aprovação"

4. **Documentação comprobatória**

   - Dado que estou na etapa de documentação
   - Quando faço upload dos documentos solicitados
   - Então o sistema aceita os arquivos e confirma o recebimento

5. **Notificação de status**
   - Dado que meu cadastro está em análise
   - Quando os administradores tomam uma decisão
   - Então recebo e-mail informando aprovação ou rejeição com justificativa

# HU010 – Visualizar Testes da Espiral dos Pacientes

## História do Usuário

**Sendo** médico  
**Quero** visualizar os resultados dos testes da espiral dos meus pacientes  
**Para** acompanhar a evolução da condição deles.

## Critérios de Aceitação

- Lista de pacientes
- Seleção de paciente
- Visualização detalhada
- Comparação de testes
- Filtros de visualização

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado como médico  
E naveguei até a seção "Meus Pacientes"

1. **Lista de pacientes**

   - Dado que acessei a área de pacientes
   - Quando a página carrega
   - Então visualizo apenas pacientes que confirmaram vínculo comigo

2. **Seleção de paciente**

   - Dado que estou visualizando a lista de pacientes
   - Quando seleciono um paciente específico
   - Então acesso o histórico de testes da espiral desse paciente

3. **Visualização detalhada**

   - Dado que selecionei um teste específico
   - Quando a página de detalhes carrega
   - Então visualizo o traçado da espiral e todas as métricas analisadas

4. **Comparação de testes**

   - Dado que marquei dois ou mais testes
   - Quando clico em "Comparar Selecionados"
   - Então visualizo os testes lado a lado com indicadores de evolução

5. **Filtros de visualização**
   - Dado que quero refinar a busca
   - Quando aplico filtros por data, resultado ou outros parâmetros
   - Então a lista de testes é atualizada conforme meus critérios

---

# HU011 – Visualizar Testes de Voz dos Pacientes

## História do Usuário

**Sendo** médico  
**Quero** visualizar os resultados dos testes de voz dos meus pacientes  
**Para** acompanhar a evolução da condição deles.

## Critérios de Aceitação

- Lista de pacientes
- Seleção de paciente
- Visualização detalhada
- Comparação de testes
- Filtros de visualização

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado como médico  
E naveguei até a seção "Meus Pacientes"

1. **Lista de pacientes**

   - Dado que acessei a área de pacientes
   - Quando a página carrega
   - Então visualizo apenas pacientes que confirmaram vínculo comigo

2. **Seleção de paciente**

   - Dado que estou visualizando a lista de pacientes
   - Quando seleciono um paciente específico
   - Então acesso o histórico de testes de voz desse paciente

3. **Visualização detalhada**

   - Dado que selecionei um teste específico
   - Quando a página de detalhes carrega
   - Então visualizo o espectrograma e todas as métricas vocais analisadas

4. **Comparação de testes**

   - Dado que marquei dois ou mais testes
   - Quando clico em "Comparar Selecionados"
   - Então visualizo os testes lado a lado com indicadores de evolução

5. **Filtros de visualização**
   - Dado que quero refinar a busca
   - Quando aplico filtros por data, resultado ou outros parâmetros
   - Então a lista de testes é atualizada conforme meus critérios

---

# HU012 – Incluir Notas em Testes

## História do Usuário

**Sendo** médico  
**Quero** adicionar observações clínicas aos testes dos meus pacientes  
**Para** registrar interpretações profissionais e orientações.

## Critérios de Aceitação

- Editor de notas
- Histórico de notas
- Categorização
- Privacidade
- Edição e exclusão

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado como médico  
E estou visualizando um teste específico de um paciente

1. **Editor de notas**

   - Dado que quero adicionar uma observação
   - Quando clico em "Adicionar Nota" e preencho o campo de texto
   - Então o sistema permite inserir e formatar minha observação clínica

2. **Histórico de notas**

   - Dado que já existem notas anteriores
   - Quando visualizo a seção de notas
   - Então vejo todas as anotações ordenadas cronologicamente

3. **Categorização**

   - Dado que estou criando ou editando uma nota
   - Quando seleciono uma categoria (Observação, Recomendação, Alerta)
   - Então a nota é marcada visualmente de acordo com a categoria

4. **Privacidade**

   - Dado que estou criando uma nota
   - Quando defino suas configurações de privacidade
   - Então a nota fica visível apenas para mim ou também para o paciente

5. **Edição e exclusão**
   - Dado que quero modificar uma nota existente
   - Quando seleciono as opções de editar ou excluir
   - Então posso alterar o conteúdo ou remover a nota com registro de alteração

# HU013 – Atrelar Paciente

## História do Usuário

**Sendo** médico  
**Quero** vincular um usuário existente como meu paciente  
**Para** acompanhar seus resultados de testes.

## Critérios de Aceitação

- Busca de usuários
- Envio de solicitação
- Gerenciamento de solicitações
- Confirmação de vínculo
- Desvincular paciente

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado como médico  
E naveguei até a seção "Gerenciar Pacientes"

1. **Busca de usuários**

   - Dado que cliquei em "Adicionar Paciente"
   - Quando realizo uma busca por nome, e-mail ou CPF
   - Então o sistema exibe usuários correspondentes

2. **Envio de solicitação**

   - Dado que selecionei um usuário da lista
   - Quando clico em "Solicitar Vínculo" e opcionalmente adiciono mensagem
   - Então o sistema envia a solicitação para o usuário escolhido

3. **Gerenciamento de solicitações**

   - Dado que enviei uma ou mais solicitações
   - Quando acesso a aba "Solicitações Enviadas"
   - Então vejo todas as minhas solicitações com seus respectivos status

4. **Confirmação de vínculo**

   - Dado que um usuário aceitou minha solicitação
   - Quando recebo a notificação de aceitação
   - Então o usuário aparece na minha lista de "Pacientes" e tenho acesso aos seus resultados

5. **Desvincular paciente**
   - Dado que desejo encerrar o vínculo com um paciente
   - Quando seleciono a opção "Desvincular" e confirmo a ação
   - Então o sistema remove o vínculo e notifica o paciente

---

# HU014 – Receber Notificações de Vínculo

## História do Usuário

**Sendo** médico  
**Quero** ser notificado sobre atividades relacionadas à gestão de vínculos  
**Para** me manter atualizado sobre minhas conexões na plataforma.

## Critérios de Aceitação

- Notificação de nova solicitação
- Notificação de aceitação de vínculo
- Centro de notificações

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou cadastrado como médico

1. **Notificação de nova solicitação**

   - Dado que um paciente me enviou uma solicitação de vínculo
   - Quando acesso a plataforma
   - Então visualizo um alerta de notificação sobre o pedido de vínculo pendente

2. **Notificação de aceitação de vínculo**

   - Dado que a minha solicitação de vínculo foi aceita por outro usuário
   - Quando acesso a plataforma
   - Então recebo uma notificação informando que o vínculo foi estabelecido com sucesso

3. **Centro de notificações**
   - Dado que cliquei no ícone de notificações
   - Quando o painel de notificações é exibido
   - Então visualizo histórico completo de notificações relacionadas a vínculo, com opção de marcá-las como lidas

---

# HU015 – Visualizar Visão Geral

## História do Usuário

**Sendo** médico  
**Quero** ter uma visão consolidada de todos os meus pacientes e seus testes  
**Para** gerenciar eficientemente minha prática clínica.

## Critérios de Aceitação

- Dashboard principal
- Lista de pacientes com status

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado como médico  
E acessei a página inicial do sistema

1. **Dashboard principal**

   - Dado que naveguei para "Visão Geral"
   - Quando a página carrega
   - Então visualizo indicadores resumidos sobre meus pacientes e testes recentes

2. **Lista de pacientes com status**
   - Dado que estou no dashboard principal
   - Quando analiso a seção "Meus Pacientes"
   - Então vejo lista com status visual de cada paciente (estável, em progressão)

---

# HU016 – Autenticar no Sistema como Administrador

## História do Usuário

**Sendo** administrador  
**Quero** me autenticar no sistema de forma segura  
**Para** gerenciar as configurações e usuários da plataforma.

## Critérios de Aceitação

- Login seguro
- Redirecionamento apropriado
- Recuperação de senha

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que já possuo credenciais administrativas  
E cliquei em "Entre no sistema"

1. **Login seguro**

   - Dado que estou na tela de login
   - Quando preencho e-mail/CPF e senha de administrador
   - Então o sistema valida meus dados e permite o acesso

2. **Redirecionamento apropriado**

   - Dado que inseri credenciais válidas
   - Quando o sistema autentica meu login
   - Então sou direcionado para o painel administrativo

3. **Recuperação de senha**
   - Dado que esqueci minha senha
   - Quando clico em "Esqueci minha senha" e informo meu e-mail
   - Então o sistema envia um link de recuperação para meu e-mail

---

# HU017 – Gerenciar Usuários

## História do Usuário

**Sendo** administrador  
**Quero** gerenciar as contas de usuários do sistema  
**Para** garantir o funcionamento adequado da plataforma.

## Critérios de Aceitação

- Lista de usuários
- Criação de usuários
- Edição de dados
- Ativação/desativação

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado como administrador  
E naveguei até "Gerenciamento de Usuários"

1. **Lista de usuários**

   - Dado que acessei a página de usuários
   - Quando aplico filtros ou busca
   - Então visualizo tabela com todos os usuários comuns correspondentes

2. **Criação de usuários**

   - Dado que cliquei em "Adicionar Usuário"
   - Quando preencho o formulário completo
   - Então o sistema cria uma nova conta de usuário no sistema

3. **Edição de dados**

   - Dado que selecionei um usuário específico
   - Quando clico em "Editar" e modifico campos permitidos
   - Então o sistema atualiza as informações com validação adequada

4. **Ativação/desativação**
   - Dado que preciso alterar o status de um usuário
   - Quando altero seu status para ativo ou inativo
   - Então o sistema aplica a mudança e registra motivo quando informado

# HU018 – Gerenciar Médicos

## História do Usuário

**Sendo** administrador  
**Quero** gerenciar as contas de médicos e suas verificações  
**Para** garantir a legitimidade dos profissionais na plataforma.

## Critérios de Aceitação

- Verificação de credenciais
- Categorização profissional
- Gerenciamento de status
- Histórico de atividades

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado como administrador  
E naveguei até "Gerenciamento de Médicos"

1. **Verificação de credenciais**

   - Dado que preciso verificar documentação profissional
   - Quando acesso a seção de documentos do médico
   - Então posso visualizar, validar e registrar decisão sobre documentos

2. **Categorização profissional**

   - Dado que um médico foi aprovado
   - Quando defino sua especialidade e nível de experiência
   - Então o sistema atualiza sua categorização para organização interna

3. **Gerenciamento de status**

   - Dado que preciso alterar o status de um médico
   - Quando modifico para ativo, inativo, em verificação ou suspenso
   - Então o sistema aplica a mudança e notifica o médico

4. **Histórico de atividades**
   - Dado que seleciono um perfil médico específico
   - Quando acesso sua aba de atividades
   - Então visualizo timeline com suas principais interações no sistema

---

# HU019 – Aprovar Cadastro de Médico

## História do Usuário

**Sendo** administrador  
**Quero** avaliar e aprovar/rejeitar solicitações de cadastro de médicos  
**Para** garantir a legitimidade dos profissionais na plataforma.

## Critérios de Aceitação

- Lista de solicitações pendentes
- Verificação de documentação
- Consulta de autenticidade
- Decisão fundamentada
- Notificação automática

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado como administrador  
E naveguei até "Solicitações de Cadastro de Médicos"

1. **Lista de solicitações pendentes**

   - Dado que acessei a página de solicitações
   - Quando a página carregar completamente
   - Então visualizar lista organizada por data de todas as solicitações pendentes

2. **Verificação de documentação**

   - Dado que selecionei uma solicitação específica
   - Quando acesso a documentação enviada pelo médico
   - Então posso visualizar, baixar e analisar cada documento submetido

3. **Consulta de autenticidade**

   - Dado que preciso verificar o registro profissional
   - Quando realizo a verificação manual dos documentos
   - Então confirmo a validade do CRM nos sistemas dos conselhos regionais

4. **Decisão fundamentada**

   - Dado que concluí a análise da solicitação
   - Quando seleciono "Aprovar" ou "Rejeitar"
   - Então registro justificativa (obrigatória para rejeição) e confirmo decisão

5. **Notificação automática**
   - Dado que tomei uma decisão sobre a solicitação
   - Quando confirmo a aprovação ou rejeição
   - Então o sistema notifica automaticamente o médico sobre o resultado

---

# HU020 – Conduzir Teste Clínico em Consultório

## História do Usuário

**Sendo** um médico  
**Quero** iniciar e conduzir um teste (espiral ou voz) para um paciente durante uma consulta  
**Para** gerar um registro clínico validado e oficial em seu histórico.

## Critérios de Aceitação

- Acesso à funcionalidade
- Início do teste clínico
- Execução assistida
- Salvamento automático no servidor
- Visualização imediata do resultado

### Detalhamento dos Critérios

**Critério de contexto:**  
Dado que estou logado como médico  
E estou na página de perfil de um paciente vinculado

1. **Acesso à funcionalidade**

   - Dado que estou visualizando os dados do paciente
   - Quando procuro pela opção de avaliação
   - Então encontro um botão claramente identificado como "Iniciar Novo Teste Clínico" ou "Conduzir Avaliação"

2. **Início do teste clínico**

   - Dado que cliquei em "Iniciar Novo Teste Clínico"
   - Quando seleciono o tipo de teste (espiral ou voz)
   - Então o sistema abre a interface de execução do teste escolhido

3. **Execução assistida**

   - Dado que a interface do teste está aberta
   - Quando o paciente realiza a tarefa no dispositivo do consultório
   - Então o sistema captura os dados (imagem ou áudio) para processamento

4. **Salvamento automático no servidor**

   - Dado que o paciente concluiu a tarefa
   - Quando o teste é finalizado
   - Então o sistema envia os dados para o servidor, processa-os e armazena o resultado de forma permanente no banco de dados, associado ao paciente e marcado como "clínico"

5. **Visualização imediata do resultado**
   - Dado que o resultado foi salvo
   - Quando sou redirecionado para o histórico do paciente
   - Então o novo teste clínico já aparece na lista de resultados, disponível para análise detalhada
