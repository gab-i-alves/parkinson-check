#!/bin/bash

# ============================================
# Script de Deploy dos Serviços no Railway
# ============================================
# Este script ajuda a criar os serviços com a configuração correta

echo "🚂 Railway Services Deployment Helper"
echo "======================================"
echo ""

# Verificar Railway CLI
if ! command -v railway &> /dev/null
then
    echo "❌ Railway CLI não instalado!"
    echo "Instale: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI encontrado"
echo ""

# Verificar login
if ! railway whoami &> /dev/null
then
    echo "❌ Faça login: railway login"
    exit 1
fi

echo "✅ Logado no Railway"
echo ""

# Menu
echo "Qual serviço você quer criar?"
echo ""
echo "1) Spiral Classifier"
echo "2) Voice Classifier"
echo "3) Backend"
echo "4) Frontend"
echo "5) Todos os serviços (automatizado)"
echo ""
read -p "Escolha (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📦 Criando Spiral Classifier..."
        echo ""
        echo "IMPORTANTE: Execute estes comandos manualmente no Railway:"
        echo ""
        echo "  railway up --service spiral-classifier --rootdir models/spiral-classifier"
        echo ""
        ;;
    2)
        echo ""
        echo "📦 Criando Voice Classifier..."
        echo ""
        echo "IMPORTANTE: Execute estes comandos manualmente no Railway:"
        echo ""
        echo "  railway up --service voice-classifier --rootdir models/voice-classifier"
        echo ""
        ;;
    3)
        echo ""
        echo "📦 Criando Backend..."
        echo ""
        echo "IMPORTANTE: Execute estes comandos manualmente no Railway:"
        echo ""
        echo "  railway up --service backend --rootdir backend"
        echo ""
        echo "Depois configure as variáveis de ambiente!"
        ;;
    4)
        echo ""
        echo "📦 Criando Frontend..."
        echo ""
        echo "IMPORTANTE: Execute estes comandos manualmente no Railway:"
        echo ""
        echo "  railway up --service frontend --rootdir frontend"
        echo ""
        ;;
    5)
        echo ""
        echo "❌ Deploy automático não está disponível via CLI Railway"
        echo ""
        echo "Use a interface web para criar os serviços com Root Directory correto."
        echo ""
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "💡 DICA: Se o comando railway up não funcionar,"
echo "   use a interface web e configure Root Directory manualmente."
echo ""
