# 📂 Estructura del Proyecto Missi

Guía visual completa de la organización del proyecto.

## 🌳 Árbol de Directorios

```
missi/
│
├── 📄 README.md                    # Documentación principal
├── 📄 LICENSE                      # Licencia MIT
├── 📄 .gitignore                   # Archivos ignorados por Git
├── 📄 .env.example                 # Template de variables de entorno
│
├── 🚀 deploy.sh                    # Script de deployment automatizado
├── 🗑️  destroy.sh                  # Script para eliminar recursos AWS
├── 🔧 init-git.sh                  # Script para inicializar Git
│
├── 📚 DEPLOYMENT.md                # Guía detallada de deployment
├── 🧪 TESTING.md                   # Casos de prueba y checklist
├── 🤝 CONTRIBUTING.md              # Guía para contribuidores
│
├── 📖 docs/                        # Documentación técnica
│   ├── arquitectura.md             # Diagrama AWS + decisiones
│   ├── diseño-app.md               # UI/UX + animaciones
│   ├── diseño-codigo.md            # Código completo + patrones
│   └── prompt-engineering.md       # Prompts de Bedrock + ejemplos
│
├── 💻 frontend/                    # React + Vite + Web Speech API
│   ├── package.json                # Dependencias: React 18, Vite
│   ├── vite.config.js              # Configuración de Vite
│   ├── index.html                  # HTML principal
│   ├── .env.example                # Template API URL
│   ├── README.md                   # Documentación frontend
│   │
│   └── src/
│       ├── main.jsx                # Entry point
│       ├── App.jsx                 # Componente raíz
│       │
│       ├── components/
│       │   └── MissiFace.jsx       # Cara animada (ojos + boca)
│       │
│       ├── services/
│       │   ├── speechService.js          # Web Speech API wrapper
│       │   ├── apiService.js             # Cliente HTTP
│       │   ├── sensorSimulator.js        # Generador de sensores
│       │   └── conversationManager.js    # Estado de conversación
│       │
│       └── styles/
│           └── App.css             # Estilos + animaciones
│
├── ⚡ backend/                     # Lambda + Bedrock
│   ├── package.json                # Dependencias: AWS SDK
│   ├── README.md                   # Documentación backend
│   │
│   └── src/
│       ├── handler.js              # Lambda entry point
│       ├── bedrockService.js       # Cliente de Bedrock
│       └── promptBuilder.js        # Construcción de prompts
│
└── 🏗️  infrastructure/              # AWS CDK (IaC)
    ├── package.json                # Dependencias: CDK
    ├── cdk.json                    # Configuración CDK
    ├── README.md                   # Documentación infrastructure
    │
    └── lib/
        └── missi-stack.js          # Stack completo AWS
```

## 📦 Dependencias por Módulo

### Frontend
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}
```

### Backend
```json
{
  "dependencies": {
    "@aws-sdk/client-bedrock-runtime": "^3.600.0"
  }
}
```

### Infrastructure
```json
{
  "devDependencies": {
    "aws-cdk": "^2.150.0",
    "aws-cdk-lib": "^2.150.0",
    "constructs": "^10.3.0"
  }
}
```

## 🎯 Archivos Clave

### Configuración

| Archivo | Propósito |
|---------|-----------|
| `frontend/vite.config.js` | Configuración de build de Vite |
| `frontend/.env` | API URL del backend (se crea en deployment) |
| `infrastructure/cdk.json` | Configuración de AWS CDK |
| `.gitignore` | Archivos ignorados (node_modules, .env, dist, etc) |

### Scripts

| Script | Comando | Descripción |
|--------|---------|-------------|
| `deploy.sh` | `./deploy.sh` | Deployment automatizado completo |
| `destroy.sh` | `./destroy.sh` | Elimina todos los recursos de AWS |
| `init-git.sh` | `./init-git.sh` | Inicializa repositorio Git |

### Código Principal

| Archivo | Responsabilidad |
|---------|-----------------|
| `frontend/src/App.jsx` | Componente raíz, orquesta la app |
| `frontend/src/components/MissiFace.jsx` | Renderiza y anima la cara |
| `frontend/src/services/speechService.js` | Web Speech API (escucha + habla) |
| `frontend/src/services/conversationManager.js` | Lógica de estados de conversación |
| `backend/src/handler.js` | Lambda entry point |
| `backend/src/bedrockService.js` | Cliente de AWS Bedrock |
| `backend/src/promptBuilder.js` | Construye prompts dinámicos |
| `infrastructure/lib/missi-stack.js` | Define recursos AWS (S3, Lambda, etc) |

### Documentación

| Documento | Contenido |
|-----------|-----------|
| `README.md` | Overview + quick start |
| `DEPLOYMENT.md` | Guía paso a paso de deployment |
| `TESTING.md` | Casos de prueba y checklist |
| `CONTRIBUTING.md` | Guía para contribuidores |
| `docs/arquitectura.md` | Diagrama AWS + costos + decisiones |
| `docs/diseño-app.md` | UI/UX + animaciones + flujo |
| `docs/diseño-codigo.md` | Código completo funcional |
| `docs/prompt-engineering.md` | Prompts + ejemplos conversaciones |

## 🔄 Flujo de Datos

```
Usuario (navegador)
    ↓
[Web Speech API] → Transcribe voz a texto
    ↓
[frontend/src/services/conversationManager.js]
    ↓
[frontend/src/services/apiService.js] → POST /chat
    ↓
[API Gateway]
    ↓
[backend/src/handler.js] → Valida request
    ↓
[backend/src/promptBuilder.js] → Construye prompt
    ↓
[backend/src/bedrockService.js] → Llama Bedrock Nova Lite
    ↓
[Response] → Texto de respuesta
    ↓
[frontend/src/services/conversationManager.js]
    ↓
[Web Speech API] → Convierte texto a voz
    ↓
Usuario escucha respuesta
```

## 🚀 Workflow de Deployment

```
1. ./deploy.sh
    ↓
2. Instala dependencias (backend + infrastructure)
    ↓
3. CDK deploy → Crea recursos AWS
    ↓
4. Obtiene outputs (API URL, Bucket, etc)
    ↓
5. Configura frontend con API URL
    ↓
6. Build frontend (npm run build)
    ↓
7. Sube dist/ a S3
    ↓
8. Invalida CloudFront cache
    ↓
9. ✅ Listo! Muestra WebsiteURL
```

## 📊 Recursos AWS Creados

| Recurso | Nombre | Costo |
|---------|--------|-------|
| S3 Bucket | `MissiStack-MissiFrontend-xxx` | $0 (Free Tier) |
| CloudFront Distribution | `MissiStack-MissiDistribution-xxx` | $0 (Free Tier) |
| Lambda Function | `MissiStack-MissiBackend-xxx` | $0 (Free Tier) |
| API Gateway | `MissiStack-MissiApi-xxx` | $0 (Free Tier 12m) |
| IAM Role | `MissiStack-MissiBackendRole-xxx` | $0 |
| **Bedrock (Nova Lite)** | Pay-per-token | **$1-5/mes** |

## 🎨 Componentes de UI

```
App.jsx
  └─ MissiFace.jsx
       ├─ .ojos
       │    ├─ .ojo (izquierdo)
       │    └─ .ojo (derecho)
       └─ .boca
```

**Estados de MissiFace:**
- `hablando={true}` → Boca se anima
- `escuchando={true}` → Ojos atentos
- `error={true}` → Cara triste

## 🔐 Variables de Entorno

### Frontend (.env)
```bash
VITE_API_URL=https://xxx.execute-api.us-east-1.amazonaws.com/prod
```

### Backend (Lambda env vars - auto-configuradas)
```bash
AWS_REGION=us-east-1
NODE_ENV=production
```

## 📝 Comandos Útiles

### Development
```bash
# Frontend local
cd frontend && npm run dev

# Ver logs de Lambda
aws logs tail /aws/lambda/MissiStack-MissiBackend --follow

# Ver stacks de CDK
cd infrastructure && cdk list
```

### Deployment
```bash
# Deployment completo
./deploy.sh

# Solo backend
cd infrastructure && npm run deploy

# Solo frontend
cd frontend && npm run build
aws s3 sync dist/ s3://BUCKET-NAME/ --delete
```

### Cleanup
```bash
# Eliminar todo
./destroy.sh

# Manual
cd infrastructure && cdk destroy
```

## 🧩 Patrones de Diseño

| Patrón | Ubicación | Propósito |
|--------|-----------|-----------|
| **Service Layer** | `frontend/src/services/` | Encapsula lógica de negocio |
| **State Machine** | `conversationManager.js` | Maneja estados de conversación |
| **Singleton** | Instancias en `App.jsx` | Una instancia por sesión |
| **Factory** | `sensorSimulator.js` | Genera datos de sensores |
| **Observer** | Web Speech callbacks | Reacción a eventos de voz |

## 🎯 Puntos de Extensión

Para agregar funcionalidades:

1. **Nuevas animaciones**: Editar `frontend/src/styles/App.css`
2. **Modificar prompt**: Editar `backend/src/promptBuilder.js`
3. **Cambiar modelo IA**: Editar `MODEL_ID` en `backend/src/bedrockService.js`
4. **Agregar recursos AWS**: Editar `infrastructure/lib/missi-stack.js`
5. **Nuevos estados de conversación**: Editar `ESTADOS` en `conversationManager.js`

## 📈 Métricas y Logs

### CloudWatch Logs
```bash
# Lambda logs
/aws/lambda/MissiStack-MissiBackend

# API Gateway logs
API-Gateway-Execution-Logs_xxx/prod
```

### CloudWatch Metrics
- Lambda: Invocations, Duration, Errors
- API Gateway: Count, Latency, 4XXError, 5XXError
- CloudFront: Requests, BytesDownloaded
- S3: BucketSizeBytes, NumberOfObjects

## 🔍 Troubleshooting

| Problema | Archivo a revisar |
|----------|-------------------|
| Frontend no carga | `frontend/.env`, CloudFront cache |
| Micrófono no funciona | `frontend/src/services/speechService.js` |
| API error | `backend/src/handler.js`, Lambda logs |
| Bedrock error | `backend/src/bedrockService.js`, IAM role |
| Deployment falla | `infrastructure/lib/missi-stack.js`, CDK outputs |

## 🎓 Recursos de Aprendizaje

- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [AWS Bedrock](https://docs.aws.amazon.com/bedrock/)
- [AWS CDK](https://docs.aws.amazon.com/cdk/)
- [React Hooks](https://react.dev/reference/react)
- [Vite](https://vitejs.dev/)

---

**Última actualización**: 6 de junio de 2026
