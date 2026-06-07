#!/bin/bash

# Script para eliminar todos los recursos de AWS
# Uso: ./destroy.sh

set -e

# Colores
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo ""
echo -e "${RED}⚠️  ADVERTENCIA${NC}"
echo "=========================================="
echo "Este script eliminará PERMANENTEMENTE:"
echo "  - Bucket S3 y todo su contenido"
echo "  - CloudFront distribution"
echo "  - Lambda function"
echo "  - API Gateway"
echo "  - Roles y policies de IAM"
echo ""
echo "Esta acción NO se puede deshacer."
echo "=========================================="
echo ""

read -p "¿Estás seguro? (escribe 'ELIMINAR' para confirmar): " confirm

if [ "$confirm" != "ELIMINAR" ]; then
    echo ""
    echo -e "${GREEN}✅ Operación cancelada${NC}"
    echo ""
    exit 0
fi

echo ""
echo -e "${YELLOW}🗑️  Eliminando recursos...${NC}"
echo ""

cd infrastructure
cdk destroy --force
cd ..

echo ""
echo -e "${GREEN}✅ Todos los recursos han sido eliminados${NC}"
echo ""
echo "Recursos eliminados:"
echo "  ✓ S3 Bucket"
echo "  ✓ CloudFront Distribution"
echo "  ✓ Lambda Function"
echo "  ✓ API Gateway"
echo "  ✓ IAM Roles y Policies"
echo ""
echo "Para verificar, visita:"
echo "  https://console.aws.amazon.com/cloudformation/"
echo ""
