# 🚀 Guía de Deployment - Missi

Guía paso a paso para desplegar Missi en AWS.

## Pre-requisitos

✅ Node.js 20 o superior instalado
✅ AWS CLI instalado y configurado
✅ Cuenta de AWS activa
✅ Permisos administrativos en AWS
✅ AWS CDK instalado: `npm install -g aws-cdk`

## Paso 1: Verificar Configuración de AWS

```bash
# Verificar que AWS CLI esté configurado
aws sts get-caller-identity

# Deberías ver tu account ID y user/role
```

Si no está configurado:
```bash
aws configure
# AWS Access Key ID: tu-access-key
# AWS Secret Access Key: tu-secret-key
# Default region name: us-east-1
# Default output format: json
```

## Paso 2: Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Infrastructure
cd ../infrastructure
npm install
```

## Paso 3: Bootstrap AWS CDK (Solo Primera Vez)

```bash
cd infrastructure
cdk bootstrap

# Esto crea los recursos necesarios para CDK en tu cuenta
```

## Paso 4: Desplegar Infraestructura

```bash
cd infrastructure
npm run deploy

# Confirma cuando te pregunte: "Do you wish to deploy these changes (y/n)?"
# Escribe: y
```

⏱️ Este paso toma 5-10 minutos.

Al finalizar, verás algo como:

```
Outputs:
MissiStack.WebsiteURL = https://d111111abcdef8.cloudfront.net
MissiStack.ApiURL = https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/
MissiStack.BucketName = missistack-missifrontend12345-abcdefgh
MissiStack.DistributionId = E1234ABCD5678
```

**🔴 IMPORTANTE: Guardar estos valores, los necesitarás más adelante.**

## Paso 5: Configurar Frontend con API URL

```bash
cd ../frontend

# Crear archivo .env
cp .env.example .env

# Editar .env y pegar tu ApiURL del paso anterior
# VITE_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

Usando tu editor favorito:
```bash
nano .env
# o
code .env
# o
vim .env
```

## Paso 6: Build del Frontend

```bash
cd frontend
npm run build

# Esto genera los archivos optimizados en /dist
```

## Paso 7: Subir Frontend a S3

Reemplaza `YOUR-BUCKET-NAME` con el `BucketName` del Paso 4:

```bash
aws s3 sync dist/ s3://YOUR-BUCKET-NAME/ --delete
```

Ejemplo:
```bash
aws s3 sync dist/ s3://missistack-missifrontend12345-abcdefgh/ --delete
```

## Paso 8: Invalidar Caché de CloudFront

Reemplaza `YOUR-DISTRIBUTION-ID` con el `DistributionId` del Paso 4:

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --paths "/*"
```

Ejemplo:
```bash
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD5678 \
  --paths "/*"
```

## Paso 9: ¡Probar la Aplicación!

1. Abre Chrome, Edge o Safari
2. Navega a la `WebsiteURL` del Paso 4
3. Acepta los permisos del micrófono
4. ¡Habla con Missi!

---

## 🎯 Checklist de Verificación

Después del deployment, verifica:

- [ ] Frontend carga en la WebsiteURL
- [ ] Se solicitan permisos de micrófono
- [ ] Missi dice "Hola, soy Missi. ¿Cómo te sentís hoy?"
- [ ] Puedes hablar y Missi transcribe correctamente
- [ ] Missi responde con voz
- [ ] La conversación fluye naturalmente
- [ ] Los sensores se leen correctamente

---

## 🔧 Troubleshooting

### Error: "Tu navegador no es compatible"
**Solución**: Usar Chrome, Edge o Safari (Firefox no soporta Web Speech API completa)

### Error: "No puedo escucharte"
**Solución**: 
- Verificar permisos de micrófono en el navegador
- En Chrome: Configuración → Privacidad y seguridad → Configuración de sitios → Micrófono

### Error: "Perdí la conexión"
**Solución**:
```bash
# 1. Verificar que la API esté corriendo
aws apigateway get-rest-apis

# 2. Verificar que Lambda esté activa
aws lambda get-function --function-name MissiStack-MissiBackend

# 3. Ver logs de Lambda
aws logs tail /aws/lambda/MissiStack-MissiBackend --follow
```

### Error: "Access Denied" al llamar Bedrock
**Solución**:
```bash
# Verificar permisos del rol de Lambda
aws iam get-role-policy \
  --role-name MissiStack-MissiBackendRole-xxx \
  --policy-name InlinePolicy
```

### Error: Lambda Timeout
**Solución**: Aumentar timeout en `infrastructure/lib/missi-stack.js`:
```javascript
timeout: cdk.Duration.seconds(60), // Cambiar de 30 a 60
```

Luego re-desplegar:
```bash
cd infrastructure
npm run deploy
```

### CloudFront no muestra cambios
**Solución**: Siempre invalidar caché después de actualizar:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --paths "/*"
```

---

## 🔄 Actualizar la Aplicación

### Actualizar Backend

```bash
# 1. Modificar código en /backend/src
# 2. Re-desplegar
cd infrastructure
npm run deploy
```

### Actualizar Frontend

```bash
# 1. Modificar código en /frontend/src
# 2. Build
cd frontend
npm run build

# 3. Subir a S3
aws s3 sync dist/ s3://YOUR-BUCKET-NAME/ --delete

# 4. Invalidar caché
aws cloudfront create-invalidation \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --paths "/*"
```

---

## 💰 Monitoreo de Costos

Revisar costos en AWS Cost Explorer:

```bash
# Abrir consola de AWS
open https://console.aws.amazon.com/cost-management/home
```

Servicios a monitorear:
- **Bedrock**: Costo por tokens (principal gasto)
- **Lambda**: Invocaciones y duración
- **CloudFront**: Transferencia de datos
- **S3**: Almacenamiento y requests

---

## 🗑️ Eliminar Todo (Limpieza)

Para eliminar todos los recursos y evitar costos:

```bash
cd infrastructure
npm run destroy

# Confirma con: y
```

**⚠️ ADVERTENCIA**: Esto eliminará permanentemente:
- Bucket S3 con todo el frontend
- CloudFront distribution
- Lambda function
- API Gateway
- Roles y policies de IAM

---

## 📊 Recursos Desplegados

| Recurso | Tipo | Propósito |
|---------|------|-----------|
| `MissiStack-MissiFrontend-xxx` | S3 Bucket | Aloja frontend estático |
| `MissiStack-MissiDistribution-xxx` | CloudFront | CDN global |
| `MissiStack-MissiBackend-xxx` | Lambda | Procesa conversaciones |
| `MissiStack-MissiApi-xxx` | API Gateway | REST API |
| `MissiStack-MissiBackendRole-xxx` | IAM Role | Permisos para Lambda |

---

## 🎓 Próximos Pasos

Después de un deployment exitoso:

1. **Probar diferentes escenarios** (cefalea, gripe, emergencia)
2. **Revisar logs** en CloudWatch para debugging
3. **Monitorear costos** en Cost Explorer
4. **Ajustar prompt** en `backend/src/promptBuilder.js` según necesidad
5. **A/B test** con diferentes modelos (Nova Micro vs Lite vs Claude Haiku)

---

## 📞 Soporte

Si tienes problemas:

1. Revisar logs de Lambda:
```bash
aws logs tail /aws/lambda/MissiStack-MissiBackend --follow
```

2. Verificar estado de recursos:
```bash
aws cloudformation describe-stacks --stack-name MissiStack
```

3. Consultar documentación de AWS:
- [Bedrock](https://docs.aws.amazon.com/bedrock/)
- [Lambda](https://docs.aws.amazon.com/lambda/)
- [CDK](https://docs.aws.amazon.com/cdk/)
