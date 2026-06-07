#!/bin/bash

# Script para inicializar el repositorio Git
# Uso: ./init-git.sh

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}🔧 Inicializando repositorio Git...${NC}"
echo ""

# Inicializar Git
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git inicializado${NC}"
else
    echo -e "${GREEN}✅ Git ya está inicializado${NC}"
fi

# Agregar todos los archivos
echo ""
echo -e "${BLUE}📦 Agregando archivos...${NC}"
git add .

# Primer commit
echo ""
echo -e "${BLUE}📝 Creando commit inicial...${NC}"
git commit -m "Initial commit: Missi - Enfermera Virtual

- Frontend: React + Vite con Web Speech API
- Backend: Lambda + Bedrock Nova Lite
- Infrastructure: AWS CDK
- Documentación completa
- Scripts de deployment automatizados"

echo ""
echo -e "${GREEN}✅ Repositorio Git listo${NC}"
echo ""
echo "=========================================="
echo -e "${BLUE}Próximos pasos:${NC}"
echo ""
echo "1. Crear repositorio en GitHub/GitLab/Bitbucket"
echo ""
echo "2. Agregar remote:"
echo "   git remote add origin <url-del-repo>"
echo ""
echo "3. Push inicial:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "=========================================="
echo ""
