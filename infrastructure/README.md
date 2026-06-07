# Missi Infrastructure

Infraestructura como código (IaC) usando AWS CDK para desplegar Missi.

## Recursos Creados

- **S3 Bucket**: Aloja el frontend estático
- **CloudFront Distribution**: CDN para distribución global
- **Lambda Function**: Procesa conversaciones con Bedrock
- **API Gateway**: REST API para el backend
- **IAM Roles**: Permisos para Lambda acceder a Bedrock

## Requisitos

- Node.js 20+
- AWS CLI configurado
- Cuenta de AWS con permisos administrativos
- AWS CDK instalado globalmente: `npm install -g aws-cdk`

## Configuración Inicial

1. Instalar dependencias:
```bash
npm install
```

2. Bootstrap CDK (solo primera vez por cuenta/región):
```bash
cdk bootstrap
```

## Deployment

### 1. Desplegar infraestructura

```bash
npm run deploy
```

Esto creará todos los recursos en AWS. Al finalizar, mostrará los outputs:

```
Outputs:
MissiStack.WebsiteURL = https://d111111abcdef8.cloudfront.net
MissiStack.ApiURL = https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/
MissiStack.BucketName = missistack-missifrontend12345-abcdefgh
MissiStack.DistributionId = E1234ABCD5678
```

### 2. Configurar frontend con la API URL

Copiar `.env.example` a `.env` en `/frontend`:

```bash
cd ../frontend
cp .env.example .env
```

Editar `.env` con la `ApiURL` del output:
```
VITE_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

### 3. Build y deployment del frontend

```bash
cd ../frontend
npm install
npm run build
```

Subir a S3 (reemplazar con tu bucket name del output):

```bash
aws s3 sync dist/ s3://missistack-missifrontend12345-abcdefgh/ --delete
```

Invalidar caché de CloudFront (reemplazar con tu distribution ID):

```bash
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD5678 \
  --paths "/*"
```

### 4. Acceder a la aplicación

Abre la `WebsiteURL` en Chrome, Edge o Safari.

## Comandos Útiles

```bash
# Ver diferencias antes de desplegar
npm run diff

# Sintetizar template de CloudFormation
npm run synth

# Destruir toda la infraestructura
npm run destroy
```

## Costos Estimados

| Servicio | Free Tier | Costo Mensual |
|----------|-----------|---------------|
| S3 | 5GB storage, 20K GET | $0 |
| CloudFront | 1TB transfer, 10M requests | $0 |
| Lambda | 1M requests, 400K GB-seg | $0 |
| API Gateway | 1M requests (12 meses) | $0 |
| Bedrock Nova Lite | Pay-per-token | $1-5 |
| **Total** | | **$1-5/mes** |

## Troubleshooting

### "Unable to resolve AWS account"
```bash
aws configure
# Ingresa tus credenciales
```

### "Policy contains a statement with one or more invalid principals"
Verificar que el rol de Lambda tenga permisos correctos para Bedrock.

### "Bootstrap required"
```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Lambda no puede acceder a Bedrock
Verificar que:
1. El modelo Nova Lite esté disponible en la región
2. El rol de Lambda tenga permisos `bedrock:InvokeModel`
3. La región en el código coincida con el deployment

### CloudFront no actualiza después del deploy
Invalidar el caché:
```bash
aws cloudfront create-invalidation \
  --distribution-id TU_DISTRIBUTION_ID \
  --paths "/*"
```

## Actualizaciones

Para actualizar código del backend:

```bash
# 1. Modificar código en /backend/src
# 2. Re-desplegar
npm run deploy
```

Para actualizar frontend:

```bash
cd ../frontend
npm run build
aws s3 sync dist/ s3://TU-BUCKET-NAME/ --delete
aws cloudfront create-invalidation --distribution-id TU_DIST_ID --paths "/*"
```

## Seguridad

- S3 bucket es público (solo lectura) para servir frontend
- API Gateway tiene throttling (10 req/seg)
- Lambda tiene timeout de 30 seg
- Permisos IAM siguen principio de mínimo privilegio
- CORS habilitado para todas las origins (PoC - ajustar en producción)

## Limpieza

Para eliminar todos los recursos y evitar costos:

```bash
npm run destroy
```

**Advertencia**: Esto eliminará permanentemente:
- Bucket S3 y su contenido
- CloudFront distribution
- Lambda function
- API Gateway
- Roles y policies de IAM

## Próximos Pasos (Producción)

- [ ] Custom domain con Route 53
- [ ] HTTPS con ACM certificate
- [ ] Autenticación con Cognito
- [ ] WAF para protección DDoS
- [ ] CloudWatch Alarms para monitoreo
- [ ] DynamoDB para persistencia
- [ ] Backup y disaster recovery
