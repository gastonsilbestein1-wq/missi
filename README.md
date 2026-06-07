# 👩‍⚕️ MISSI - Enfermera Virtual

Prueba de concepto de una enfermera virtual potenciada por IA que realiza triage médico mediante conversación por voz.

![Status](https://img.shields.io/badge/status-POC-yellow)
![AWS](https://img.shields.io/badge/AWS-Bedrock-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Descripción

Missi es una enfermera virtual argentina con personalidad cálida y amable que:
- 🎤 Interactúa por voz usando la Web Speech API del navegador (100% gratis)
- 🏥 Realiza triage médico básico (5-6 preguntas máximo)
- 📊 Simula lectura de sensores (temperatura, ritmo cardíaco, oxígeno, presión)
- 👨‍⚕️ Deriva a médico clínico para dolencias simples o a especialista para casos graves
- 🚫 Solo responde preguntas relacionadas con salud
- 🇦🇷 Habla español argentino con voz femenina cálida

## ✨ Demo

La interfaz es ultra-minimalista: solo una cara animada (ojos + boca) sobre fondo blanco. Sin botones, sin texto, completamente controlada por voz.

```
        ⚪    ⚪
       (ojos)
       
          ⌣
        (boca)
```

**Animaciones:**
- Ojos pestañean automáticamente cada 3-5 segundos
- Boca se anima cuando Missi habla
- Interfaz 100% manos libres

## 🏗️ Arquitectura

```
Usuario (Navegador)
    ↓
[Web Speech API - navegador]
  - SpeechRecognition (escucha continua)
  - SpeechSynthesis (habla)
    ↓
[React App en S3/CloudFront]
    ↓ (solo texto + sensores)
[API Gateway] → [Lambda] → [AWS Bedrock Nova Lite]
    ↑
Devuelve texto de respuesta
```

## 💰 Costos (AWS Free Tier)

| Servicio | Costo Estimado |
|----------|---------------|
| S3 + CloudFront | $0 (Free Tier) |
| Lambda | $0 (Free Tier) |
| API Gateway | $0 (Free Tier 12 meses) |
| Bedrock Nova Lite | ~$1-5/mes (pay-per-token) |
| **Total** | **~$1-5/mes** |

## 📁 Estructura del Proyecto

```
missi/
├── docs/                    # Documentación técnica
├── frontend/                # React + Vite (UI minimalista)
├── backend/                 # Lambda + Bedrock
└── infrastructure/          # AWS CDK (IaC)
```

## 🚀 Quick Start

**¿Primera vez?** Lee [QUICKSTART.md](./QUICKSTART.md) para estar listo en 10 minutos.

### Opción 1: CI/CD con CodePipeline (Recomendado para Producción)

```bash
# 1. Desplegar infraestructura (incluye pipeline)
cd infrastructure
npm install
cdk bootstrap  # Solo primera vez
cdk deploy

# 2. Configurar Git para CodeCommit
git config --global credential.helper '!aws codecommit credential-helper $@'
git config --global credential.UseHttpPath true

# 3. Push código al repositorio
git init
git add .
git commit -m "Initial commit"
git remote add origin <URL-de-CodeCommit-del-output>
git push -u origin main

# ✅ El pipeline se ejecuta automáticamente
# Ver progreso en la URL del pipeline (output del deploy)
```

**Ventajas:**
- ✅ Logs completos de cada deployment
- ✅ Rollback automático en caso de error
- ✅ Deployment automático en cada push
- ✅ Build paralelo (frontend + backend)
- ✅ Invalidación automática de CloudFront

Ver [CICD.md](./CICD.md) para detalles completos del pipeline.

### Opción 2: Deployment Manual Rápido

```bash
./deploy.sh
```

El script automáticamente:
- ✅ Instala dependencias
- ✅ Despliega infraestructura en AWS
- ✅ Configura y sube el frontend
- ✅ Te da la URL lista para usar

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas.

### Requisitos Previos

- Node.js 20+
- AWS CLI configurado
- AWS CDK: `npm install -g aws-cdk`
- Cuenta AWS activa

## 📖 Documentación

- **[QUICKSTART.md](./QUICKSTART.md)** - Guía rápida (10 minutos)
- **[CICD.md](./CICD.md)** - CI/CD Pipeline con CodePipeline
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía paso a paso para desplegar
- **[TESTING.md](./TESTING.md)** - Casos de prueba y checklist
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Cómo contribuir al proyecto
- **[docs/arquitectura.md](./docs/arquitectura.md)** - Arquitectura AWS completa
- **[docs/diseño-app.md](./docs/diseño-app.md)** - UI/UX y animaciones
- **[docs/diseño-codigo.md](./docs/diseño-codigo.md)** - Estructura del código
- **[docs/prompt-engineering.md](./docs/prompt-engineering.md)** - Prompts de Bedrock

## 🔍 Ejemplo de Uso

```
Missi: "Hola, soy Missi. ¿Cómo te sentís hoy?"

Usuario: "Me duele la cabeza"

Missi: "Poné tu dedo en el sensor y verificaré tus signos vitales"
[5 segundos de espera]
Missi: "Tu temperatura es 37.2 grados, tu ritmo cardíaco 75..."

Missi: "¿Hace cuánto te duele la cabeza?"

Usuario: "Desde esta mañana"

Missi: "¿El dolor es constante o viene y va?"

Usuario: "Constante"

Missi: "Parece ser una cefalea tensional. Tomá un ibuprofeno de 400mg
       y descansá en un lugar tranquilo. Si sigue mañana, andá al 
       médico clínico."
```

## 🛠️ Stack Tecnológico

**Frontend:**
- React 18 + Vite
- Web Speech API (nativa del navegador)
- CSS puro (sin frameworks)

**Backend:**
- AWS Lambda (Node.js 20)
- AWS Bedrock (Nova Lite)
- API Gateway

**Infrastructure:**
- AWS CDK
- S3 + CloudFront
- IAM

## 🧪 Testing

Después de desplegar, probar estos escenarios:

1. **Conversación simple** (cefalea) → Autocuidado
2. **Emergencia** (dolor de pecho) → Derivación urgente
3. **Fuera de contexto** (preguntas no médicas) → Rechazo amable

Ver [TESTING.md](./TESTING.md) para casos de prueba completos.

## 🗑️ Limpieza

Para eliminar todos los recursos de AWS:

```bash
./destroy.sh
```

O manualmente:

```bash
cd infrastructure
npm run destroy
```

## 🤝 Contribuir

Lee [CONTRIBUTING.md](./CONTRIBUTING.md) para lineamientos.

Áreas prioritarias:
- Tests unitarios
- Tests E2E
- Mejoras de accesibilidad
- Optimización de performance

## 📝 Notas Importantes

**⚠️ Este es un proyecto de prueba de concepto:**
- No reemplaza consultas médicas reales
- Diagnósticos son preliminares
- Diseñado para 1 usuario concurrente
- No hay persistencia de datos
- Solo funciona en Chrome, Edge y Safari

**🔐 Seguridad:**
- Sin autenticación de usuarios
- API pública (con throttling)
- Sin almacenamiento de datos sensibles
- No cumple HIPAA (no usar en producción médica)

## 📄 Licencia

MIT License - Ver [LICENSE](./LICENSE)

## 👥 Equipo

Proyecto de prueba de concepto

---

**¿Preguntas?** Abre un issue en GitHub
