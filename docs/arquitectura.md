# 🏗️ Arquitectura de Missi

## Diagrama de Arquitectura AWS

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO (NAVEGADOR)                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Web Speech API (Nativo del Navegador)                 │    │
│  │  • SpeechRecognition (es-AR) - Escucha continua        │    │
│  │  • SpeechSynthesis (es-AR, voz femenina) - Habla      │    │
│  └────────────────────────────────────────────────────────┘    │
│                          ↓ ↑                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  React SPA (Vite)                                       │    │
│  │  • MissiFace Component (animación cara)                │    │
│  │  • Conversation Manager (estados)                      │    │
│  │  • Sensor Simulator (datos simulados)                  │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────┘
                                │ HTTPS
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Amazon CloudFront (CDN)                                  │  │
│  │  • Distribución global                                    │  │
│  │  • HTTPS automático                                       │  │
│  │  • Cache de assets estáticos                             │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Amazon S3 (Static Website Hosting)                       │  │
│  │  • index.html, JS, CSS                                    │  │
│  │  • Versionado habilitado                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Amazon API Gateway (REST API)                            │  │
│  │  • Endpoint: POST /chat                                   │  │
│  │  • CORS habilitado                                        │  │
│  │  • Throttling: 10 req/seg                                 │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AWS Lambda (Node.js 20.x)                                │  │
│  │  • Handler: procesarConversacion                          │  │
│  │  • Timeout: 30 segundos                                   │  │
│  │  • Memory: 512 MB                                         │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Amazon Bedrock                                           │  │
│  │  • Modelo: Nova Lite                                      │  │
│  │  • Region: us-east-1                                      │  │
│  │  • Inference Profile                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Carga Inicial
```
1. Usuario accede a CloudFront URL
2. CloudFront sirve index.html desde S3
3. Navegador carga React SPA
4. Missi dice: "Hola, soy Missi. ¿Cómo te sentís hoy?"
5. Web Speech API inicia escucha continua
```

### 2. Interacción de Voz
```
Usuario habla → SpeechRecognition (local) → Texto transcrito
                                              ↓
Frontend genera sensores simulados (solo 1ra vez)
                                              ↓
POST /chat {
  mensaje: "Me duele la cabeza",
  sensores: {
    temperatura: 37.2,
    ritmoCardiaco: 75,
    oxigeno: 98,
    presion: {sistolica: 120, diastolica: 80}
  },
  historial: [...],
  preguntaNumero: 1
}
                                              ↓
API Gateway → Lambda → Bedrock (Nova Lite)
                                              ↓
Respuesta: "¿Hace cuánto te duele?"
                                              ↓
Frontend recibe texto → SpeechSynthesis (local) → Audio
```

### 3. Gestión de Estado
```
Estado de Conversación:
- INICIAL: Saludo
- PIDIENDO_SENSORES: "Poné tu dedo..."
- LEYENDO_SENSORES: Espera 5seg + lee datos
- DIAGNOSTICANDO: Preguntas 1-6
- FINALIZANDO: Diagnóstico final

Variables:
- preguntaNumero: 0-6
- sensoresLeidos: boolean
- historialChat: array
- sensores: object (se genera 1 vez)
```

## Componentes Clave

### Frontend (React)
| Componente | Responsabilidad |
|------------|-----------------|
| `App.jsx` | Componente raíz, inicializa conversación |
| `MissiFace.jsx` | Renderiza y anima la cara (ojos + boca) |
| `speechService.js` | Wrapper de Web Speech API |
| `apiService.js` | Cliente HTTP para Lambda |
| `sensorSimulator.js` | Genera datos de sensores realistas |
| `conversationManager.js` | Máquina de estados de conversación |

### Backend (Lambda)
| Módulo | Responsabilidad |
|--------|-----------------|
| `handler.js` | Entry point, maneja request/response |
| `bedrockService.js` | Cliente de AWS Bedrock SDK |
| `promptBuilder.js` | Construye prompt dinámico con contexto |
| `conversationState.js` | Valida y gestiona estado de conversación |

### Infrastructure (CDK)
| Stack | Recursos |
|-------|----------|
| `missi-stack.js` | S3 Bucket, CloudFront, API Gateway, Lambda, IAM Roles |

## Seguridad

### Frontend
- Servido por HTTPS (CloudFront)
- No almacena datos sensibles
- Sin autenticación (prueba de concepto)

### Backend
- API Gateway con throttling (10 req/seg)
- Lambda con permisos mínimos (Bedrock invoke only)
- Sin logs de datos médicos (HIPAA compliance)

### Datos
- Sin persistencia (stateless)
- Sensores simulados (no hay datos reales)
- Conversación no se almacena

## Escalabilidad

**Actual (Prueba de Concepto):**
- 1 usuario concurrente
- Sin caché
- Sin base de datos

**Futuro (Producción):**
- API Gateway: hasta 10,000 req/seg
- Lambda: auto-scaling
- CloudFront: CDN global
- DynamoDB: para historial de conversaciones

## Costos Estimados

| Servicio | Free Tier | Uso PoC | Costo Mensual |
|----------|-----------|---------|---------------|
| S3 | 5GB, 20K GET | 100MB, 100 req | $0 |
| CloudFront | 1TB, 10M req | Mínimo | $0 |
| API Gateway | 1M req (12 meses) | 100 req | $0 |
| Lambda | 1M req, 400K GB-seg | 100 req | $0 |
| **Bedrock Nova Lite** | N/A | ~10 sesiones | **$1-5** |

**Total: $1-5/mes** (solo tokens de IA)

## Alternativas Evaluadas

### Voz
| Opción | Pro | Contra | Decisión |
|--------|-----|--------|----------|
| Web Speech API | Gratis, sin latencia | Solo Chrome/Edge/Safari | ✅ Seleccionado |
| Amazon Polly + Transcribe | Mayor compatibilidad | $4-10/mes | ❌ Rechazado |

### Modelo IA
| Opción | Costo (1K tokens) | Pro | Contra | Decisión |
|--------|-------------------|-----|--------|----------|
| Nova Micro | $0.000035/$0.00014 | Más barato | Respuestas básicas | ⚠️ Backup |
| **Nova Lite** | $0.00006/$0.00024 | Balance precio/calidad | - | ✅ Seleccionado |
| Claude Haiku 3.5 | $0.0008/$0.004 | Mejor conversación | 10x más caro | ⚠️ A/B test futuro |

## Limitaciones Conocidas

1. **Navegador**: Solo funciona en Chrome, Edge, Safari (Web Speech API)
2. **Idioma**: Español argentino puede no estar disponible en todos los navegadores
3. **Conectividad**: Requiere conexión a internet estable
4. **Precisión médica**: Diagnósticos son preliminares, no reemplazan médicos reales
5. **Usuarios**: Diseñado para 1 usuario (PoC), no para múltiples concurrentes

## Próximos Pasos (Post-PoC)

- [ ] Autenticación con Amazon Cognito
- [ ] Persistencia de conversaciones en DynamoDB
- [ ] Métricas con CloudWatch
- [ ] A/B testing de modelos (Nova vs Claude)
- [ ] Soporte multi-idioma
- [ ] Mobile app (React Native)
