# ✅ Deployment Manual Exitoso - Missi

## 🎉 Estado Final

**Fecha**: 6 de junio de 2026  
**Método**: AWS CDK + Deployment Manual  
**Estado**: ✅ **FUNCIONANDO CORRECTAMENTE**

---

## 🌐 URLs de Producción

| Recurso | URL |
|---------|-----|
| **🎯 Website (USAR AQUÍ)** | **https://dzauji3zz7r1b.cloudfront.net** |
| **🔌 API Backend** | https://hfhgnw26t1.execute-api.us-east-1.amazonaws.com/prod/ |

---

## ✅ Tests Realizados

### API Test
```bash
curl -X POST https://hfhgnw26t1.execute-api.us-east-1.amazonaws.com/prod/chat \
  -H "Content-Type: application/json" \
  -d '{"mensaje":"Me duele la cabeza", ...}'
```

**Respuesta**:
```json
{
  "respuesta": "Che, entiendo que te duela la cabeza. ¿Tenés también alguna sensación de náusea o mareo?"
}
```

✅ **Bedrock Nova Lite funciona correctamente**  
✅ **Responde en español argentino**  
✅ **Tono empático y profesional**

---

## 🔧 Problemas Resueltos

### 1. Error "Cannot use import statement outside a module"
**Causa**: Backend usaba ES modules pero Lambda no encontraba package.json  
**Solución**: Convertir todo el backend a CommonJS (require/module.exports)

**Archivos modificados**:
- `backend/src/handler.js`
- `backend/src/bedrockService.js`
- `backend/src/promptBuilder.js`

### 2. Error de permisos Bedrock
**Causa**: Lambda no tenía permisos para invocar el modelo Nova Lite  
**Solución**: Agregar permisos wildcard para foundation models en CDK

```javascript
resources: [
  `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-lite-v1:0`,
  `arn:aws:bedrock:*::foundation-model/*`
]
```

### 3. Modelo ID incorrecto
**Causa**: Usaba `us.amazon.nova-lite-v1:0` en lugar de `amazon.nova-lite-v1:0`  
**Solución**: Corregir MODEL_ID en bedrockService.js

### 4. Conversación se detiene después de leer sensores ✅ NUEVO
**Causa**: Después de leer los sensores, Missi no hacía automáticamente la primera pregunta diagnóstica  
**Solución**: Modificar `leerSensores()` para que llame al backend inmediatamente después de leer los sensores

**Comportamiento anterior**:
1. Usuario dice síntoma → Missi pide sensores
2. Missi lee sensores → **Se queda esperando sin hacer nada**
3. Usuario habla → Missi responde "Perdí la conexión"

**Comportamiento nuevo**:
1. Usuario dice síntoma → Missi pide sensores
2. Missi lee sensores → **Automáticamente hace la primera pregunta diagnóstica**
3. Usuario responde → Missi hace siguiente pregunta
4. Continúa conversación fluida hasta 5-6 preguntas

**Archivo modificado**: `frontend/src/services/conversationManager.js`

---

## 📦 Recursos Desplegados

| Recurso AWS | ID/Nombre |
|-------------|-----------|
| **S3 Bucket** | missistack-missifrontend081edd7f-sqglaufxsx4u |
| **CloudFront Distribution** | E17MSYUHBCY3OL |
| **Lambda Function** | MissiStack-MissiBackend91814226-LcbOaNw7a7Xt |
| **API Gateway** | hfhgnw26t1 |
| **CloudFormation Stack** | MissiStack |

---

## 🚀 Workflow de Deployment Manual

### 1. Modificar Código

```bash
# Editar frontend
vim frontend/src/App.jsx

# Editar backend
vim backend/src/handler.js
```

### 2. Deploy Frontend

```bash
cd frontend

# Configurar API URL
echo "VITE_API_URL=https://hfhgnw26t1.execute-api.us-east-1.amazonaws.com/prod/" > .env

# Build
npm run build

# Upload a S3
aws s3 sync dist/ s3://missistack-missifrontend081edd7f-sqglaufxsx4u/ --delete

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id E17MSYUHBCY3OL --paths "/*"
```

### 3. Deploy Backend

```bash
cd backend/src

# Crear ZIP
zip -r /tmp/lambda-code.zip .

# Actualizar Lambda
aws lambda update-function-code \
  --function-name MissiStack-MissiBackend91814226-LcbOaNw7a7Xt \
  --zip-file fileb:///tmp/lambda-code.zip
```

### 4. Deploy Infrastructure

```bash
cd infrastructure

# Deploy cambios de CDK
npx cdk deploy
```

---

## 🧪 Cómo Probar la Aplicación

### 1. Abrir en Navegador

**URL**: https://dzauji3zz7r1b.cloudfront.net

**Navegadores soportados**:
- ✅ Chrome 80+
- ✅ Edge 80+
- ✅ Safari 14+
- ❌ Firefox (Web Speech API limitada)

### 2. Aceptar Permisos

- El navegador pedirá permiso para el micrófono
- Click en "Permitir"

### 3. Interactuar

**Missi dirá**: "Hola, soy Missi. ¿Cómo te sentís hoy?"

**Escenarios de prueba**:

**A) Dolor de cabeza simple**
```
Tú: "Me duele la cabeza"
Missi: [Pide sensores]
Missi: [Lee sensores simulados]
Missi: "¿Tenés también alguna sensación de náusea o mareo?"
... [5-6 preguntas]
Missi: "Parece cefalea tensional. Tomá ibuprofeno..."
```

**B) Gripe**
```
Tú: "Tengo fiebre y me duele el cuerpo"
Missi: [Proceso completo]
Missi: "Parece un cuadro gripal. Quedate en casa..."
```

**C) Emergencia**
```
Tú: "Me duele el pecho y me cuesta respirar"
Missi: [Proceso más corto - 2-3 preguntas]
Missi: "Esto puede ser grave. Tenés que ir URGENTE..."
```

---

## 📊 Costos

| Servicio | Costo Mensual |
|----------|---------------|
| S3 | $0 (Free Tier) |
| CloudFront | $0 (Free Tier) |
| Lambda | $0 (Free Tier) |
| API Gateway | $0 (Free Tier) |
| **Bedrock Nova Lite** | **$1-5** |
| **TOTAL** | **$1-5/mes** |

### Monitorear Costos

```bash
# Abrir Cost Explorer
open https://console.aws.amazon.com/cost-management/home

# Ver uso de Bedrock
aws bedrock list-foundation-models --region us-east-1
```

---

## 🔍 Debugging

### Ver Logs de Lambda

```bash
# Logs en tiempo real
aws logs tail /aws/lambda/MissiStack-MissiBackend91814226-LcbOaNw7a7Xt --follow

# Últimos 10 minutos
aws logs tail /aws/lambda/MissiStack-MissiBackend91814226-LcbOaNw7a7Xt --since 10m
```

### Probar API Directamente

```bash
curl -X POST https://hfhgnw26t1.execute-api.us-east-1.amazonaws.com/prod/chat \
  -H "Content-Type: application/json" \
  -d '{
    "mensaje": "Hola",
    "sensores": {
      "temperatura": 37.0,
      "ritmoCardiaco": 75,
      "oxigeno": 98,
      "presion": {"sistolica": 120, "diastolica": 80}
    },
    "historial": [],
    "preguntaNumero": 1
  }'
```

### Ver Estado de CloudFront

```bash
# Ver distribution
aws cloudfront get-distribution --id E17MSYUHBCY3OL

# Ver invalidations
aws cloudfront list-invalidations --distribution-id E17MSYUHBCY3OL
```

---

## 🛠️ Troubleshooting Común

### "Perdí la conexión"

1. **Ver logs de Lambda**:
```bash
aws logs tail /aws/lambda/MissiStack-MissiBackend91814226-LcbOaNw7a7Xt --follow
```

2. **Probar API directamente** (comando de arriba)

3. **Verificar permisos Bedrock**:
```bash
aws iam get-role-policy \
  --role-name MissiStack-MissiBackendServiceRole68DC08C5-fQF74OdOP3XF \
  --policy-name MissiBackendServiceRoleDefaultPolicy79C42E25
```

### Frontend no carga

1. **Invalidar CloudFront**:
```bash
aws cloudfront create-invalidation --distribution-id E17MSYUHBCY3OL --paths "/*"
```

2. **Verificar archivos en S3**:
```bash
aws s3 ls s3://missistack-missifrontend081edd7f-sqglaufxsx4u/
```

3. **Verificar .env tiene API_URL correcta**

### Micrófono no funciona

1. Verificar permisos del navegador
2. Solo funciona en Chrome, Edge, Safari
3. Debe ser HTTPS (CloudFront lo provee automáticamente)

---

## 🗑️ Eliminar Todo

```bash
# Eliminar stack completo
cd infrastructure
npx cdk destroy

# Confirmar: y
```

**Esto eliminará**:
- Bucket S3 y contenido
- CloudFront distribution
- Lambda function
- API Gateway
- Todos los roles IAM

**Costo después de eliminar**: $0/mes

---

## 📚 Documentación

- [README.md](./README.md) - Documentación principal
- [QUICKSTART.md](./QUICKSTART.md) - Guía rápida
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía detallada
- [TESTING.md](./TESTING.md) - Casos de prueba
- [docs/arquitectura.md](./docs/arquitectura.md) - Arquitectura completa

---

## ✨ Resumen

✅ **Frontend desplegado** en S3 + CloudFront  
✅ **Backend funcionando** con Lambda + Bedrock  
✅ **API probada** y respondiendo correctamente  
✅ **Bedrock Nova Lite** configurado y funcionando  
✅ **Español argentino** con acento correcto  
✅ **Costos mínimos** ($1-5/mes)  
✅ **Sin CI/CD** - Deployment manual simple  

---

## 🎯 ¡A PROBAR!

**Abre**: https://dzauji3zz7r1b.cloudfront.net

**Habla con Missi** y prueba los diferentes escenarios.

**¿Problemas?** Revisa los logs con los comandos de arriba.

---

**Deployment completado exitosamente el 6 de junio de 2026** 🚀👩‍⚕️
