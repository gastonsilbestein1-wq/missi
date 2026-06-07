#!/bin/bash

# Script de deployment automatizado para Missi
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deployment de Missi..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paso 1: Verificar AWS CLI
echo -e "${BLUE}[1/8]${NC} Verificando AWS CLI..."
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI no está instalado${NC}"
    echo "Instalar desde: https://aws.amazon.com/cli/"
    exit 1
fi
echo -e "${GREEN}✅ AWS CLI encontrado${NC}"
echo ""

# Paso 2: Verificar CDK
echo -e "${BLUE}[2/8]${NC} Verificando AWS CDK..."
if ! command -v cdk &> /dev/null; then
    echo -e "${YELLOW}⚠️  CDK no encontrado, instalando globalmente...${NC}"
    npm install -g aws-cdk
fi
echo -e "${GREEN}✅ CDK disponible${NC}"
echo ""

# Paso 3: Instalar dependencias del backend
echo -e "${BLUE}[3/8]${NC} Instalando dependencias del backend..."
cd backend
npm install
cd ..
echo -e "${GREEN}✅ Backend listo${NC}"
echo ""

# Paso 4: Instalar dependencias de infrastructure
echo -e "${BLUE}[4/8]${NC} Instalando dependencias de infrastructure..."
cd infrastructure
npm install
cd ..
echo -e "${GREEN}✅ Infrastructure lista${NC}"
echo ""

# Paso 5: Desplegar infraestructura con CDK
echo -e "${BLUE}[5/8]${NC} Desplegando infraestructura en AWS..."
cd infrastructure
cdk deploy --require-approval never --outputs-file ../outputs.json
cd ..
echo -e "${GREEN}✅ Infraestructura desplegada${NC}"
echo ""

# Leer outputs
API_URL=$(cat outputs.json | grep -o '"ApiURL": "[^"]*' | sed 's/"ApiURL": "//')
BUCKET_NAME=$(cat outputs.json | grep -o '"BucketName": "[^"]*' | sed 's/"BucketName": "//')
DISTRIBUTION_ID=$(cat outputs.json | grep -o '"DistributionId": "[^"]*' | sed 's/"DistributionId": "//')
WEBSITE_URL=$(cat outputs.json | grep -o '"WebsiteURL": "[^"]*' | sed 's/"WebsiteURL": "//')

# Paso 6: Configurar frontend
echo -e "${BLUE}[6/8]${NC} Configurando frontend con API URL..."
cd frontend
cat > .env << EOF
VITE_API_URL=${API_URL}
EOF
echo -e "${GREEN}✅ Frontend configurado${NC}"
echo ""

# Paso 7: Build y deploy del frontend
echo -e "${BLUE}[7/8]${NC} Building frontend..."
npm install
npm run build
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

echo -e "${BLUE}[8/8]${NC} Subiendo frontend a S3..."
aws s3 sync dist/ s3://${BUCKET_NAME}/ --delete
echo -e "${GREEN}✅ Frontend subido${NC}"
echo ""

# Invalidar CloudFront cache
echo "🔄 Invalidando caché de CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*" > /dev/null 2>&1
echo -e "${GREEN}✅ Caché invalidado${NC}"
echo ""

cd ..

# Resumen
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 ¡Deployment completado!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}📊 Información del deployment:${NC}"
echo ""
echo -e "🌐 Website URL:"
echo -e "   ${GREEN}${WEBSITE_URL}${NC}"
echo ""
echo -e "🔌 API URL:"
echo -e "   ${API_URL}"
echo ""
echo -e "📦 S3 Bucket:"
echo -e "   ${BUCKET_NAME}"
echo ""
echo -e "☁️  CloudFront Distribution:"
echo -e "   ${DISTRIBUTION_ID}"
echo ""
echo "=========================================="
echo ""
echo -e "${YELLOW}⚠️  Nota:${NC} CloudFront puede tardar 5-10 minutos en propagar cambios"
echo ""
echo -e "${BLUE}Siguiente paso:${NC}"
echo "  Abre ${WEBSITE_URL} en Chrome, Edge o Safari"
echo ""
echo -e "${BLUE}Ver logs:${NC}"
echo "  aws logs tail /aws/lambda/MissiStack-MissiBackend --follow"
echo ""
echo "=========================================="
