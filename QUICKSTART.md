# ⚡ Quick Start - Missi

Guía rápida para tener Missi funcionando en menos de 10 minutos.

## ✅ Pre-requisitos (5 minutos)

```bash
# 1. Verificar Node.js
node --version  # Debe ser v20 o superior

# 2. Verificar AWS CLI
aws --version

# 3. Configurar AWS CLI (si no está configurado)
aws configure
# AWS Access Key ID: [tu-key]
# AWS Secret Access Key: [tu-secret]
# Default region: us-east-1
# Default output format: json

# 4. Instalar CDK globalmente
npm install -g aws-cdk

# 5. Verificar
cdk --version
```

## 🚀 Deployment (5 minutos)

```bash
# Opción 1: Script automatizado (RECOMENDADO)
./deploy.sh

# Opción 2: Manual
cd infrastructure
npm install
cdk bootstrap  # Solo primera vez
cdk deploy --require-approval never
# ... seguir pasos en DEPLOYMENT.md
```

## 🎉 Listo!

Al finalizar, el script mostrará:

```
========================================
🎉 ¡Deployment completado!
========================================

📊 Información del deployment:

🌐 Website URL:
   https://d111111abcdef8.cloudfront.net

🔌 API URL:
   https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/

📦 S3 Bucket:
   missistack-missifrontend12345-abcdefgh

☁️  CloudFront Distribution:
   E1234ABCD5678

========================================
```

## 🧪 Probar la App

1. Abre la **Website URL** en Chrome, Edge o Safari
2. Acepta los permisos de micrófono
3. Escucha el saludo: "Hola, soy Missi. ¿Cómo te sentís hoy?"
4. Habla: "Me duele la cabeza"
5. ¡Disfruta la conversación!

## 📋 Escenarios de Prueba

### 1. Dolor de cabeza simple
```
Tú: "Me duele la cabeza"
Missi: [pide sensores, hace 5-6 preguntas]
Missi: "Parece cefalea tensional. Tomá ibuprofeno..."
```

### 2. Emergencia (dolor de pecho)
```
Tú: "Me duele el pecho y me cuesta respirar"
Missi: [pide sensores, hace 2-3 preguntas]
Missi: "Esto puede ser grave. Tenés que ir URGENTE a una guardia..."
```

### 3. Fuera de contexto
```
Tú: "¿Qué hora es?"
Missi: "Soy enfermera virtual, solo puedo ayudarte con temas de salud"
```

## 🔍 Ver Logs en Tiempo Real

```bash
# Terminal 1: Ver logs de Lambda
aws logs tail /aws/lambda/MissiStack-MissiBackend --follow

# Terminal 2: Usar la app en el navegador
```

## 🛠️ Troubleshooting

### "Tu navegador no es compatible"
**Solución**: Usar Chrome, Edge o Safari

### "No puedo escucharte"
**Solución**: 
1. Click en el candado en la barra de direcciones
2. Permisos → Micrófono → Permitir
3. Recargar página

### "Perdí la conexión"
**Solución**:
```bash
# Ver logs de Lambda para detalles
aws logs tail /aws/lambda/MissiStack-MissiBackend --follow
```

### Lambda no puede acceder a Bedrock
**Solución**:
```bash
# Verificar permisos IAM
aws iam list-role-policies --role-name MissiStack-MissiBackendRole-xxx
```

## 🔄 Actualizar la App

### Backend (código Lambda)
```bash
# 1. Editar archivos en backend/src/
# 2. Re-desplegar
cd infrastructure
npm run deploy
```

### Frontend (UI o lógica del navegador)
```bash
# 1. Editar archivos en frontend/src/
# 2. Rebuild y upload
cd frontend
npm run build
aws s3 sync dist/ s3://TU-BUCKET-NAME/ --delete
aws cloudfront create-invalidation --distribution-id TU-DIST-ID --paths "/*"
```

## 🗑️ Limpieza

```bash
# Eliminar todos los recursos de AWS
./destroy.sh

# Confirmar escribiendo: ELIMINAR
```

## 💰 Costos

| Servicio | Free Tier | Costo Real |
|----------|-----------|------------|
| S3, CloudFront, Lambda, API Gateway | Sí | $0/mes |
| Bedrock Nova Lite | No | $1-5/mes |
| **TOTAL** | | **$1-5/mes** |

## 📚 Documentación Completa

- **Quick Start**: Este archivo (estás aquí)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Guía detallada paso a paso
- **[TESTING.md](./TESTING.md)**: Casos de prueba completos
- **[PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)**: Estructura del código
- **[docs/](./docs/)**: Arquitectura, diseño, prompts

## 🤝 Soporte

### Ver logs
```bash
aws logs tail /aws/lambda/MissiStack-MissiBackend --follow
```

### Ver recursos desplegados
```bash
aws cloudformation describe-stacks --stack-name MissiStack
```

### Estado de Bedrock
```bash
aws bedrock list-foundation-models --region us-east-1
```

## 🎯 Próximos Pasos

Después de un deployment exitoso:

1. ✅ Probar los 3 escenarios de prueba
2. 📊 Revisar logs en CloudWatch
3. 💰 Monitorear costos en Cost Explorer
4. 🎨 Personalizar prompts en `backend/src/promptBuilder.js`
5. 🔧 Ajustar animaciones en `frontend/src/styles/App.css`

## 🚨 Importante

⚠️ **Esto es una prueba de concepto**:
- No usar en producción médica
- No almacena datos
- Solo 1 usuario concurrente
- Sin autenticación

## 📞 Ayuda

¿Problemas? Lee la documentación completa:

1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Si falla el deployment
2. **[TESTING.md](./TESTING.md)** - Para probar funcionalidad
3. **[docs/arquitectura.md](./docs/arquitectura.md)** - Entender la arquitectura

---

**¡Listo para empezar!** Ejecuta `./deploy.sh` y en 10 minutos tendrás a Missi funcionando. 🚀
