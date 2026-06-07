# 💻 Diseño del Código - Missi

## Estructura de Directorios

```
missi/
├── README.md
├── .gitignore
├── docs/
│   ├── arquitectura.md
│   ├── diseño-app.md
│   ├── diseño-codigo.md
│   └── prompt-engineering.md
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx                      # Entry point
│       ├── App.jsx                       # Root component
│       ├── components/
│       │   └── MissiFace.jsx             # Cara animada
│       ├── services/
│       │   ├── speechService.js          # Web Speech API wrapper
│       │   ├── apiService.js             # HTTP client
│       │   ├── sensorSimulator.js        # Genera sensores
│       │   └── conversationManager.js    # Estado conversación
│       └── styles/
│           └── App.css                   # Estilos + animaciones
│
├── backend/
│   ├── package.json
│   └── src/
│       ├── handler.js                    # Lambda entry point
│       ├── bedrockService.js             # AWS Bedrock client
│       ├── promptBuilder.js              # Construye prompt dinámico
│       └── conversationState.js          # Valida estado
│
└── infrastructure/
    ├── package.json
    ├── cdk.json
    └── lib/
        └── missi-stack.js                # AWS CDK stack
```

---

## Frontend (React + Vite)

### 1. `package.json`

```json
{
  "name": "missi-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0"
  }
}
```

### 2. `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
});
```

### 3. `index.html`

```html
<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Missi - Enfermera Virtual</title>
  <meta name="description" content="Enfermera virtual argentina para triage médico">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

### 4. `src/main.jsx`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 5. `src/App.jsx`

```javascript
import React, { useEffect, useState } from 'react';
import MissiFace from './components/MissiFace';
import ConversationManager from './services/conversationManager';
import SpeechService from './services/speechService';

function App() {
  const [estado, setEstado] = useState('INICIAL');
  const [conversationManager] = useState(() => new ConversationManager());
  const [speechService] = useState(() => new SpeechService());

  useEffect(() => {
    // Verifica soporte de navegador
    if (!speechService.isSupported()) {
      alert('Tu navegador no es compatible. Usá Chrome, Edge o Safari');
      return;
    }

    // Inicia conversación
    conversationManager.iniciar(speechService);
    
    // Limpieza
    return () => {
      conversationManager.detener();
      speechService.detener();
    };
  }, []);

  return (
    <div className="app">
      <MissiFace 
        hablando={estado === 'HABLANDO'}
        escuchando={estado === 'ESCUCHANDO'}
      />
    </div>
  );
}

export default App;
```

### 6. `src/components/MissiFace.jsx`

```javascript
import React, { useEffect, useRef } from 'react';

function MissiFace({ hablando, escuchando }) {
  const ojoIzqRef = useRef(null);
  const ojoDeRef = useRef(null);
  const bocaRef = useRef(null);
  const intervalRef = useRef(null);

  // Pestañeo aleatorio
  useEffect(() => {
    const pestañear = () => {
      [ojoIzqRef, ojoDeRef].forEach(ref => {
        ref.current?.classList.add('cerrado');
      });
      
      setTimeout(() => {
        [ojoIzqRef, ojoDeRef].forEach(ref => {
          ref.current?.classList.remove('cerrado');
        });
      }, 150);
    };

    intervalRef.current = setInterval(() => {
      pestañear();
    }, Math.random() * 2000 + 3000); // 3-5 seg

    return () => clearInterval(intervalRef.current);
  }, []);

  // Animación de boca al hablar
  useEffect(() => {
    if (hablando) {
      bocaRef.current?.classList.add('hablando');
    } else {
      bocaRef.current?.classList.remove('hablando');
    }
  }, [hablando]);

  return (
    <div className="missi-face">
      <div className="ojos">
        <div ref={ojoIzqRef} className="ojo"></div>
        <div ref={ojoDeRef} className="ojo"></div>
      </div>
      <div ref={bocaRef} className="boca"></div>
    </div>
  );
}

export default MissiFace;
```

### 7. `src/services/speechService.js`

```javascript
class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.onTranscript = null;
  }

  isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  iniciarEscucha(onTranscript) {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'es-AR';
    this.onTranscript = onTranscript;

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (this.onTranscript) {
        this.onTranscript(transcript);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start(); // Reinicia automáticamente
      }
    };

    this.isListening = true;
    this.recognition.start();
  }

  hablar(texto, onEnd) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-AR';
    utterance.rate = 0.9; // Velocidad natural
    utterance.pitch = 1.1; // Voz femenina
    
    // Busca voz femenina en español
    const voices = this.synthesis.getVoices();
    const vozFemenina = voices.find(v => 
      v.lang.includes('es') && v.name.toLowerCase().includes('female')
    ) || voices.find(v => v.lang.includes('es'));
    
    if (vozFemenina) {
      utterance.voice = vozFemenina;
    }

    utterance.onend = onEnd;
    
    // Pausa escucha mientras habla
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }

    this.synthesis.speak(utterance);
  }

  reanudarEscucha() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();
    }
  }

  detener() {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
    this.synthesis.cancel();
  }
}

export default SpeechService;
```

### 8. `src/services/apiService.js`

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://api.missi.com';

class ApiService {
  async enviarMensaje(mensaje, sensores, historial, preguntaNumero) {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensaje,
          sensores,
          historial,
          preguntaNumero
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.respuesta;
    } catch (error) {
      console.error('Error al comunicarse con el backend:', error);
      throw error;
    }
  }
}

export default ApiService;
```

### 9. `src/services/sensorSimulator.js`

```javascript
function random(min, max, decimales = 0) {
  const valor = Math.random() * (max - min) + min;
  return decimales > 0 ? parseFloat(valor.toFixed(decimales)) : Math.round(valor);
}

function generarSensores() {
  return {
    temperatura: random(36.0, 38.5, 1),
    ritmoCardiaco: random(60, 110),
    oxigeno: random(92, 100),
    presion: {
      sistolica: random(110, 150),
      diastolica: random(70, 95)
    }
  };
}

export { generarSensores };
```

### 10. `src/services/conversationManager.js`

```javascript
import ApiService from './apiService';
import { generarSensores } from './sensorSimulator';

const ESTADOS = {
  INICIAL: 'INICIAL',
  PIDIENDO_SENSORES: 'PIDIENDO_SENSORES',
  LEYENDO_SENSORES: 'LEYENDO_SENSORES',
  DIAGNOSTICANDO: 'DIAGNOSTICANDO',
  FINALIZANDO: 'FINALIZANDO'
};

class ConversationManager {
  constructor() {
    this.apiService = new ApiService();
    this.estado = ESTADOS.INICIAL;
    this.preguntaNumero = 0;
    this.sensores = null;
    this.historial = [];
    this.speechService = null;
  }

  iniciar(speechService) {
    this.speechService = speechService;
    
    // Saludo inicial
    setTimeout(() => {
      this.speechService.hablar(
        'Hola, soy Missi. ¿Cómo te sentís hoy?',
        () => {
          this.estado = ESTADOS.PIDIENDO_SENSORES;
          this.speechService.iniciarEscucha((transcript) => {
            this.procesarMensaje(transcript);
          });
        }
      );
    }, 500);
  }

  async procesarMensaje(mensaje) {
    this.historial.push({ rol: 'usuario', texto: mensaje });

    // Primera respuesta: pedir sensores
    if (this.estado === ESTADOS.PIDIENDO_SENSORES) {
      this.speechService.hablar(
        'Poné tu dedo en el sensor y verificaré tus signos vitales',
        () => {
          // Espera 5 segundos
          setTimeout(() => {
            this.sensores = generarSensores();
            this.leerSensores();
          }, 5000);
        }
      );
      this.estado = ESTADOS.LEYENDO_SENSORES;
      return;
    }

    // Envía al backend
    if (this.estado === ESTADOS.DIAGNOSTICANDO || this.estado === ESTADOS.LEYENDO_SENSORES) {
      this.preguntaNumero++;
      
      try {
        const respuesta = await this.apiService.enviarMensaje(
          mensaje,
          this.sensores,
          this.historial,
          this.preguntaNumero
        );

        this.historial.push({ rol: 'missi', texto: respuesta });
        
        this.speechService.hablar(respuesta, () => {
          if (this.preguntaNumero >= 6) {
            this.estado = ESTADOS.FINALIZANDO;
            // Opcional: reiniciar después de 10 seg
          } else {
            this.speechService.reanudarEscucha();
          }
        });

        if (this.estado === ESTADOS.LEYENDO_SENSORES) {
          this.estado = ESTADOS.DIAGNOSTICANDO;
        }
      } catch (error) {
        this.speechService.hablar(
          'Perdí la conexión. Intentá de nuevo en unos segundos',
          () => this.speechService.reanudarEscucha()
        );
      }
    }
  }

  leerSensores() {
    const texto = `
      Tu temperatura es ${this.sensores.temperatura} grados,
      tu ritmo cardíaco ${this.sensores.ritmoCardiaco} latidos por minuto,
      tu oxígeno en sangre ${this.sensores.oxigeno} por ciento,
      y tu presión ${this.sensores.presion.sistolica} sobre ${this.sensores.presion.diastolica}.
    `;
    
    this.historial.push({ rol: 'missi', texto });
    
    this.speechService.hablar(texto, () => {
      this.speechService.reanudarEscucha();
    });
  }

  detener() {
    if (this.speechService) {
      this.speechService.detener();
    }
  }
}

export default ConversationManager;
```

### 11. `src/styles/App.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #FFFFFF;
  overflow: hidden;
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.missi-face {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
}

.ojos {
  display: flex;
  gap: 80px;
}

.ojo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #87CEEB;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.ojo.cerrado {
  height: 8px;
  border-radius: 4px;
  background: #1E90FF;
}

.boca {
  width: 100px;
  height: 50px;
  border-bottom: 4px solid #1E90FF;
  border-radius: 0 0 50px 50px;
  transition: transform 0.1s ease;
}

.boca.hablando {
  animation: hablar 0.3s infinite alternate;
}

@keyframes hablar {
  0% { transform: scaleY(0.8); }
  50% { transform: scaleY(1.2); }
  100% { transform: scaleY(0.8); }
}

/* Responsive */
@media (max-width: 768px) {
  .ojos {
    gap: 60px;
  }
  
  .ojo {
    width: 60px;
    height: 60px;
  }
  
  .boca {
    width: 75px;
    height: 40px;
  }
}
```

---

## Backend (Lambda + Bedrock)

### 1. `package.json`

```json
{
  "name": "missi-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "echo \"No tests yet\""
  },
  "dependencies": {
    "@aws-sdk/client-bedrock-runtime": "^3.600.0"
  }
}
```

### 2. `src/handler.js`

```javascript
import { procesarConversacion } from './bedrockService.js';

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { mensaje, sensores, historial, preguntaNumero } = body;

    // Validación
    if (!mensaje || !sensores || !historial || preguntaNumero === undefined) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Datos incompletos' })
      };
    }

    // Procesa con Bedrock
    const respuesta = await procesarConversacion(
      mensaje,
      sensores,
      historial,
      preguntaNumero
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ respuesta })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
```

### 3. `src/bedrockService.js`

```javascript
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { construirPrompt } from './promptBuilder.js';

const client = new BedrockRuntimeClient({ region: 'us-east-1' });
const MODEL_ID = 'amazon.nova-lite-v1:0';

export async function procesarConversacion(mensaje, sensores, historial, preguntaNumero) {
  const prompt = construirPrompt(mensaje, sensores, historial, preguntaNumero);

  const command = new ConverseCommand({
    modelId: MODEL_ID,
    messages: [
      {
        role: 'user',
        content: [{ text: prompt }]
      }
    ],
    inferenceConfig: {
      maxTokens: 300,
      temperature: 0.7,
      topP: 0.9
    }
  });

  const response = await client.send(command);
  const respuesta = response.output.message.content[0].text;

  return respuesta;
}
```

### 4. `src/promptBuilder.js`

```javascript
export function construirPrompt(mensaje, sensores, historial, preguntaNumero) {
  const historialTexto = historial
    .map(h => `${h.rol === 'usuario' ? 'Paciente' : 'Missi'}: ${h.texto}`)
    .join('\n');

  return `
Sos Missi, una enfermera virtual argentina con personalidad cálida y amable.

CONTEXTO:
- Trabajás en un centro de salud haciendo triage inicial
- Tenés acceso a sensores: temperatura, ritmo cardíaco, oxígeno, presión
- Solo respondés preguntas relacionadas con salud
- Podés hacer máximo 5-6 preguntas por paciente
- Ya tomaste los signos vitales AL INICIO (no los vuelvas a pedir)

PERSONALIDAD:
- Hablás con acento argentino (vos, che, dale)
- Sos empática pero profesional
- Voz tranquila y cálida
- Usás lenguaje simple, no técnico
- Oraciones cortas y claras (máximo 2 líneas)

PROTOCOLO:
1. Hacé preguntas específicas sobre síntomas
2. Profundizá según respuestas
3. Al llegar a pregunta 5-6, da diagnóstico final:
   - SIMPLE → Diagnóstico preliminar + recomendar médico clínico o consejos caseros
   - GRAVE → Derivación URGENTE a especialista específico

RESTRICCIONES:
- NO respondas preguntas fuera de salud (respondé: "Soy enfermera virtual, solo puedo ayudarte con temas de salud")
- NO des diagnósticos definitivos (siempre "preliminar" o "parece ser")
- SÍ sé empática y contenedora

DATOS DEL PACIENTE:
Temperatura: ${sensores.temperatura}°C
Ritmo Cardíaco: ${sensores.ritmoCardiaco} bpm
Oxígeno: ${sensores.oxigeno}%
Presión: ${sensores.presion.sistolica}/${sensores.presion.diastolica} mmHg

Pregunta actual: ${preguntaNumero}/6

HISTORIAL:
${historialTexto}
Paciente: ${mensaje}

Respondé de forma natural y concisa (máximo 2 oraciones).
`;
}
```

---

## Infrastructure (AWS CDK)

### 1. `package.json`

```json
{
  "name": "missi-infrastructure",
  "version": "1.0.0",
  "scripts": {
    "cdk": "cdk",
    "deploy": "cdk deploy",
    "diff": "cdk diff",
    "synth": "cdk synth"
  },
  "devDependencies": {
    "aws-cdk": "^2.150.0",
    "aws-cdk-lib": "^2.150.0",
    "constructs": "^10.3.0"
  }
}
```

### 2. `cdk.json`

```json
{
  "app": "node lib/missi-stack.js"
}
```

### 3. `lib/missi-stack.js`

```javascript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

export class MissiStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // S3 Bucket para frontend
    const websiteBucket = new s3.Bucket(this, 'MissiFrontend', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'MissiDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket)
      }
    });

    // Lambda para backend
    const backendLambda = new lambda.Function(this, 'MissiBackend', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('../backend/src'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        NODE_ENV: 'production'
      }
    });

    // Permisos para Bedrock
    backendLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*']
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'MissiApi', {
      restApiName: 'Missi API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    const chatResource = api.root.addResource('chat');
    chatResource.addMethod('POST', new apigateway.LambdaIntegration(backendLambda));

    // Outputs
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: distribution.distributionDomainName
    });

    new cdk.CfnOutput(this, 'ApiURL', {
      value: api.url
    });
  }
}

const app = new cdk.App();
new MissiStack(app, 'MissiStack');
```

---

## Patrones de Diseño Utilizados

| Patrón | Dónde | Por qué |
|--------|-------|---------|
| **Service Layer** | `speechService.js`, `apiService.js` | Encapsula lógica de negocio |
| **State Machine** | `conversationManager.js` | Maneja estados de conversación |
| **Singleton** | Servicios en `App.jsx` | Una instancia por sesión |
| **Factory** | `sensorSimulator.js` | Genera datos de sensores |
| **Observer** | Web Speech API callbacks | Reacción a eventos de voz |

---

## Mejores Prácticas Implementadas

### Frontend
- ✅ Componentes funcionales con hooks
- ✅ Separación de lógica y presentación
- ✅ Manejo de errores en servicios
- ✅ Limpieza de recursos en `useEffect`
- ✅ CSS sin dependencias externas

### Backend
- ✅ Validación de entrada
- ✅ Manejo de errores
- ✅ CORS habilitado
- ✅ Timeouts configurados
- ✅ Logs estructurados

### Infrastructure
- ✅ Infrastructure as Code (CDK)
- ✅ Principle of Least Privilege (IAM)
- ✅ Versionado de código
- ✅ Outputs para integración

---

## Testing (Futuro)

### Frontend
```javascript
// speechService.test.js
describe('SpeechService', () => {
  test('detecta soporte de navegador', () => {
    const service = new SpeechService();
    expect(service.isSupported()).toBe(true);
  });
});
```

### Backend
```javascript
// handler.test.js
describe('Lambda Handler', () => {
  test('valida entrada requerida', async () => {
    const event = { body: '{}' };
    const response = await handler(event);
    expect(response.statusCode).toBe(400);
  });
});
```

---

## Variables de Entorno

### Frontend (`.env`)
```
VITE_API_URL=https://xxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### Backend (Lambda)
```
NODE_ENV=production
AWS_REGION=us-east-1
```

---

## Comandos de Desarrollo

### Frontend
```bash
cd frontend
npm install
npm run dev          # Desarrollo local
npm run build        # Build para producción
```

### Backend
```bash
cd backend
npm install
# Testing local con SAM o LocalStack
```

### Infrastructure
```bash
cd infrastructure
npm install
npm run synth        # Genera CloudFormation
npm run deploy       # Despliega a AWS
```
