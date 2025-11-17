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
