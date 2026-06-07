# Missi Backend

Lambda function que procesa las conversaciones usando AWS Bedrock (Nova Lite).

## Requisitos

- Node.js 20+
- AWS CLI configurado
- Permisos de IAM para Bedrock

## Instalación

```bash
npm install
```

## Desarrollo Local

Para probar localmente, puedes usar AWS SAM o crear un archivo de test:

```bash
# Test manual
node test.js
```

## Estructura

```
src/
├── handler.js           # Lambda entry point
├── bedrockService.js    # Cliente de Bedrock
└── promptBuilder.js     # Construcción del prompt
```

## Variables de Entorno

Configuradas por Lambda automáticamente:

- `AWS_REGION`: Región de AWS (default: us-east-1)
- `NODE_ENV`: Ambiente (production)

## Permisos IAM Requeridos

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/us.amazon.nova-lite-v1:0"
      ]
    }
  ]
}
```

## Deployment

El deployment se maneja desde `/infrastructure` usando CDK.

## API Contract

### POST /chat

**Request:**
```json
{
  "mensaje": "Me duele la cabeza",
  "sensores": {
    "temperatura": 37.2,
    "ritmoCardiaco": 75,
    "oxigeno": 98,
    "presion": {
      "sistolica": 120,
      "diastolica": 80
    }
  },
  "historial": [
    { "rol": "usuario", "texto": "Me duele la cabeza" }
  ],
  "preguntaNumero": 1
}
```

**Response:**
```json
{
  "respuesta": "¿Hace cuánto te duele la cabeza?"
}
```

**Error Response:**
```json
{
  "error": "Error interno del servidor",
  "mensaje": "Detalles del error"
}
```

## Modelo de IA

- **Modelo**: Amazon Nova Lite (us.amazon.nova-lite-v1:0)
- **Costo**: ~$0.00006 por 1K tokens input, $0.00024 por 1K tokens output
- **Max Tokens**: 300
- **Temperature**: 0.7
- **Top P**: 0.9

## Logging

Los logs se envían automáticamente a CloudWatch Logs.

Ver logs:
```bash
aws logs tail /aws/lambda/MissiBackend --follow
```

## Troubleshooting

### "Access Denied" al llamar Bedrock
- Verificar permisos IAM del rol de Lambda
- Verificar que el modelo esté disponible en la región

### "Timeout"
- Aumentar timeout de Lambda (actual: 30 seg)
- Verificar conectividad a Bedrock

### "Model not found"
- Verificar que Nova Lite esté disponible en us-east-1
- Alternativamente, cambiar a otro modelo compatible
