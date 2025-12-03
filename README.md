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
- Node.js (v18+)
- Angular CLI (`npm install -g @angular/cli`)

## Como Rodar o Projeto

Siga os passos abaixo para configurar o ambiente de desenvolvimento local:

### 1. Clone o repositório

```bash
git clone https://github.com/gab-i-alves/parkinson-check
cd parkinson-check
```

### 2. Configure os arquivos de ambiente

O projeto requer **dois** arquivos `.env`:

**2.1. Arquivo `.env` na raiz do projeto** (para Docker Compose e banco de dados):

```bash
cp .env.example .env
```

Conteúdo padrão:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=parkinson_check
```

**2.2. Arquivo `.env` na pasta backend** (para a aplicação FastAPI):

```bash
cp backend/.env.example backend/.env
```

Revise o arquivo `backend/.env` e altere a `SECRET_KEY` para um valor seguro.

### 3. Inicie os serviços com Docker Compose

Este comando irá construir as imagens e iniciar os contêineres do back-end, banco de dados e classificadores de ML.

```bash
docker-compose up --build -d
```

### 4. Instale as dependências do Front-end

Em um **novo terminal**, navegue até a pasta do front-end e execute o `npm install`.

```bash
cd frontend
npm install
```

### 5. Inicie a aplicação Front-end

Ainda no terminal da pasta `frontend`, execute:

```bash
ng serve
```

### 6. Acesse as aplicações

- **Front-end (Angular):** [http://localhost:4200](http://localhost:4200)
- **Back-end (FastAPI Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)

## Estrutura do Projeto

```
parkinson-check/
├── backend/           # API FastAPI
├── frontend/          # Aplicação Angular
├── models/            # Serviços de ML (classificadores)
│   ├── spiral-classifier/
│   └── voice-classifier/
├── scripts/           # Scripts SQL de inicialização
├── docker-compose.yml
└── .env.example
```

## Comandos Úteis

```bash
# Parar todos os containers
docker-compose down

# Ver logs do backend
docker-compose logs -f backend

# Reiniciar apenas o backend
docker-compose restart backend

# Rebuild de um serviço específico
docker-compose up --build -d backend
```
