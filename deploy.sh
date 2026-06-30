#!/bin/bash

# Script de deployment manual simplificado para Missi
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deployment de Missi..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
API_URL="https://iu1da7t3rl.execute-api.us-east-1.amazonaws.com/prod/"
BUCKET_NAME="missistack-missifrontend081edd7f-xfxgrpcd1nau"
DISTRIBUTION_ID="E2Q8UMVZ2X9CXK"
LAMBDA_NAME=$(aws lambda list-functions --query "Functions[?starts_with(FunctionName, 'MissiStack-MissiBackend')].FunctionName" --output text)

# Paso 1: Deploy Backend (si hay cambios)
if [ "$1" == "backend" ] || [ "$1" == "all" ]; then
    echo -e "${BLUE}[1/4]${NC} Desplegando Backend..."
    cd backend/src
    zip -q -r /tmp/lambda-code.zip .
    aws lambda update-function-code \
        --function-name $LAMBDA_NAME \
        --zip-file fileb:///tmp/lambda-code.zip \
        --query 'LastModified' \
        --output text > /dev/null
    echo -e "${GREEN}✅ Backend desplegado${NC}"
    cd ../..
    echo ""
fi

# Paso 2: Deploy Frontend
if [ "$1" == "frontend" ] || [ "$1" == "all" ] || [ -z "$1" ]; then
    echo -e "${BLUE}[2/4]${NC} Desplegando Frontend..."
    
    # Configurar .env
    echo "VITE_API_URL=$API_URL" > frontend/.env
    
    # Build
    cd frontend
    npm run build > /dev/null 2>&1
    
    # Upload a S3
    aws s3 sync dist/ s3://$BUCKET_NAME/ --delete --quiet
    echo -e "${GREEN}✅ Frontend desplegado${NC}"
    cd ..
    echo ""
    
    # Paso 3: Invalidar CloudFront
    echo -e "${BLUE}[3/4]${NC} Invalidando caché de CloudFront..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    echo -e "${GREEN}✅ Invalidación creada: $INVALIDATION_ID${NC}"
    echo ""
fi

# Paso 4: Deploy Infrastructure (solo si hay cambios de CDK)
if [ "$1" == "infra" ] || [ "$1" == "all" ]; then
    echo -e "${BLUE}[4/4]${NC} Desplegando Infraestructura..."
    cd infrastructure
    npx cdk deploy --require-approval never --outputs-file ./outputs.json
    echo -e "${GREEN}✅ Infraestructura desplegada${NC}"
    cd ..
    echo ""
fi

# Resumen
echo "=========================================="
echo -e "${GREEN}🎉 ¡Deployment completado!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}🌐 Website URL:${NC}"
echo "   https://d1xdn827gmq2ao.cloudfront.net"
echo ""
echo -e "${BLUE}🔌 API URL:${NC}"
echo "   $API_URL"
echo ""
echo -e "${YELLOW}⚠️  Nota:${NC} CloudFront puede tardar 1-2 minutos en propagar cambios"
echo ""
echo "=========================================="
echo ""
echo -e "${BLUE}Uso:${NC}"
echo "  ./deploy.sh           # Deploy solo frontend"
echo "  ./deploy.sh frontend  # Deploy solo frontend"
echo "  ./deploy.sh backend   # Deploy solo backend"
echo "  ./deploy.sh infra     # Deploy solo infrastructure"
echo "  ./deploy.sh all       # Deploy todo"
echo ""

