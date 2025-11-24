#!/bin/bash

# ============================================
# Railway PostgreSQL Setup Script
# ============================================
# Este script ajuda a inicializar o banco de dados PostgreSQL no Railway
# Uso: ./railway_db_setup.sh

echo "🚂 Railway PostgreSQL Setup"
echo "================================"
echo ""

# Verificar se railway CLI está instalado
if ! command -v railway &> /dev/null
then
    echo "❌ Railway CLI não está instalado!"
    echo ""
    echo "Instale com um dos comandos:"
    echo "  npm install -g @railway/cli"
    echo "  ou"
    echo "  curl -fsSL https://railway.app/install.sh | sh"
    exit 1
fi

echo "✅ Railway CLI encontrado"
echo ""

# Verificar se está logado
echo "📝 Verificando login..."
if ! railway whoami &> /dev/null
then
    echo "❌ Você não está logado no Railway!"
    echo "Execute: railway login"
    exit 1
fi

echo "✅ Logado no Railway"
echo ""

# Verificar se está linkado ao projeto
echo "📝 Verificando projeto..."
if ! railway status &> /dev/null
then
    echo "❌ Você não está linkado a nenhum projeto!"
    echo "Execute: railway link"
    exit 1
fi

echo "✅ Projeto linkado"
echo ""

# Perguntar qual script executar
echo "Qual script você deseja executar?"
echo ""
echo "1) init_database.sql (Criar tabelas e estrutura)"
echo "2) populate_mock_data.sql (Popular com dados de teste)"
echo "3) Ambos (init + populate)"
echo "4) Conectar ao psql manualmente"
echo ""
read -p "Escolha uma opção (1-4): " option

case $option in
    1)
        echo ""
        echo "📦 Executando init_database.sql..."
        railway run psql $DATABASE_URL -f scripts/init_database.sql
        echo ""
        echo "✅ Script init_database.sql executado!"
        ;;
    2)
        echo ""
        echo "📦 Executando populate_mock_data.sql..."
        railway run psql $DATABASE_URL -f scripts/populate_mock_data.sql
        echo ""
        echo "✅ Script populate_mock_data.sql executado!"
        ;;
    3)
        echo ""
        echo "📦 Executando init_database.sql..."
        railway run psql $DATABASE_URL -f scripts/init_database.sql
        echo ""
        echo "📦 Executando populate_mock_data.sql..."
        railway run psql $DATABASE_URL -f scripts/populate_mock_data.sql
        echo ""
        echo "✅ Ambos os scripts executados!"
        ;;
    4)
        echo ""
        echo "🔌 Conectando ao PostgreSQL..."
        echo "Use \q para sair"
        echo ""
        railway connect postgres
        ;;
    *)
        echo "❌ Opção inválida!"
        exit 1
        ;;
esac

echo ""
echo "🎉 Concluído!"
