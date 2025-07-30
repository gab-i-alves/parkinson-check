# ParkinsonCheck

Sistema de informação baseado em nuvem que utiliza tecnologias de visão computacional e inteligência artificial para auxiliar na detecção e acompanhamento de sintomas da doença de Parkinson. Este projeto foi desenvolvido como parte do Trabalho de Conclusão de Curso na Universidade Federal do Paraná em Análise e Desenvolvimento de Sistemas. 

## Tecnologias Utilizadas

* **Front-end:** Angular & TypeScript
* **Back-end:** FastAPI (Python)
* **Banco de Dados:** PostgreSQL
* **Ambiente:** Docker & Docker Compose

## Pré-requisitos

Para rodar este projeto, você precisará ter instalado:
* Git
* Docker
* Docker Compose

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

4.  **Inicie os serviços com Docker Compose:**
    Este comando irá construir as imagens e iniciar os contêineres do back-end e do banco de dados.
    ```bash
    docker-compose up --build -d
    ```

5.  **Instale as dependências do Front-end:**
    Em um **novo terminal**, navegue até a pasta do front-end e execute o `npm install`.
    ```bash
    cd frontend
    npm install
    ```

6.  **Inicie a aplicação Front-end:**
    Ainda no terminal da pasta `frontend`, execute:
    ```bash
    ng serve
    ```

7.  **Acesse as aplicações:**
    * **Front-end (Angular):** [http://localhost:4200](http://localhost:4200)
    * **Back-end (FastAPI Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)
