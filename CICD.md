# 🔄 CI/CD Pipeline - Missi

Pipeline automatizado con AWS CodePipeline para deployment continuo con logs y rollback automático.

## 🏗️ Arquitectura del Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                         CI/CD PIPELINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SOURCE                                                       │
│     └─ CodeCommit (branch: main)                                │
│          └─ Trigger automático en push                          │
│                                                                  │
│  2. BUILD                                                        │
│     ├─ Frontend Build (CodeBuild)                               │
│     │    ├─ npm install                                         │
│     │    ├─ Crea .env con API_URL                               │
│     │    └─ npm run build                                       │
│     │                                                            │
│     └─ Backend Build (CodeBuild)                                │
│          └─ npm install                                         │
│                                                                  │
│  3. DEPLOY                                                       │
│     ├─ S3 Deploy (sube frontend a S3)                           │
│     └─ CloudFront Invalidation (limpia cache)                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Setup Inicial

### 1. Desplegar Infraestructura (incluye pipeline)

```bash
cd infrastructure
npm install
cdk bootstrap  # Solo primera vez
cdk deploy
```

**Outputs importantes:**
- `MissiRepositoryUrl`: URL del repositorio CodeCommit
- `MissiPipelineUrl`: URL de la consola del pipeline
- `WebsiteURL`: URL del sitio web
- `ApiURL`: URL de la API

### 2. Configurar Git para CodeCommit

```bash
# Opción A: Configurar credenciales de Git (recomendado)
aws codecommit credential-helper --list
git config --global credential.helper '!aws codecommit credential-helper $@'
git config --global credential.UseHttpPath true

# Opción B: Usar SSH (alternativa)
# Seguir: https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-ssh-unixes.html
```

### 3. Inicializar Repositorio Local

```bash
# Desde el root del proyecto
git init
git add .
git commit -m "Initial commit: Missi - Enfermera Virtual"

# Agregar remote de CodeCommit (usar URL del output MissiRepositoryUrl)
git remote add origin https://git-codecommit.us-east-1.amazonaws.com/v1/repos/missi

# Push inicial
git branch -M main
git push -u origin main
```

**¡El pipeline se ejecutará automáticamente!**

## 📊 Monitoreo del Pipeline

### Ver Estado del Pipeline

**Opción 1: Consola Web**
```
Abre la URL del output: MissiPipelineUrl
```

**Opción 2: AWS CLI**
```bash
aws codepipeline get-pipeline-state --name MissiDeploymentPipeline
```

### Ver Logs de Build

```bash
# Listar builds del frontend
aws codebuild list-builds-for-project --project-name MissiFrontendBuild

# Ver logs de un build específico
aws logs tail /aws/codebuild/MissiFrontendBuild --follow
```

### Etapas del Pipeline

| Stage | Duración | Descripción |
|-------|----------|-------------|
| **Source** | ~10 seg | Obtiene código de CodeCommit |
| **Build** | ~2-3 min | Compila frontend y backend |
| **DeployFrontend** | ~30 seg | Sube a S3 + invalida CloudFront |
| **Total** | **~3-4 min** | Pipeline completo |

## 🔄 Workflow de Desarrollo

### Hacer Cambios y Desplegar

```bash
# 1. Hacer cambios en el código
vim frontend/src/App.jsx

# 2. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# 3. El pipeline se ejecuta automáticamente
# Ver progreso en: MissiPipelineUrl

# 4. Esperar ~3-4 minutos

# 5. Cambios en producción!
# Abrir WebsiteURL para verificar
```

### Estados del Pipeline

```bash
# Ver estado actual
aws codepipeline get-pipeline-state --name MissiDeploymentPipeline \
  --query 'stageStates[*].[stageName,latestExecution.status]' \
  --output table
```

**Posibles estados:**
- `InProgress` - Ejecutándose
- `Succeeded` - Exitoso ✅
- `Failed` - Falló ❌
- `Stopped` - Detenido manualmente

## 🛑 Rollback Automático

### Detener Pipeline en Ejecución

```bash
aws codepipeline stop-pipeline-execution \
  --pipeline-name MissiDeploymentPipeline \
  --pipeline-execution-id <execution-id> \
  --reason "Rollback manual"
```

### Rollback a Commit Anterior

```bash
# 1. Identificar commit anterior
git log --oneline

# 2. Revertir a commit específico
git revert <commit-hash>

# 3. Push (dispara pipeline con código anterior)
git push origin main
```

### Rollback con Git Reset

```bash
# ⚠️ Usa con precaución (reescribe historia)

# 1. Reset local a commit anterior
git reset --hard <commit-hash>

# 2. Force push
git push origin main --force

# El pipeline desplegará el código antiguo
```

## 📋 BuildSpec Files

### Frontend BuildSpec

```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - cd frontend
      - npm install
  
  pre_build:
    commands:
      - echo "Creating .env file..."
      - echo "VITE_API_URL=$API_URL" > .env
  
  build:
    commands:
      - npm run build
  
artifacts:
  base-directory: frontend/dist
  files:
    - '**/*'
```

### Backend BuildSpec

```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - cd backend
      - npm install
  
  build:
    commands:
      - echo "Backend ready (no compilation needed)"
  
artifacts:
  base-directory: backend
  files:
    - 'src/**/*'
    - 'package.json'
```

## 🔍 Troubleshooting

### Build Falla en Frontend

```bash
# Ver logs detallados
aws logs tail /aws/codebuild/MissiFrontendBuild --follow

# Errores comunes:
# - npm install falla → Verificar package.json
# - Vite build falla → Verificar sintaxis de React
# - .env no se crea → Verificar BuildSpec
```

### Build Falla en Backend

```bash
aws logs tail /aws/codebuild/MissiBackendBuild --follow

# Errores comunes:
# - Dependencias faltantes → Verificar package.json
# - Sintaxis error → Verificar handler.js
```

### Deploy a S3 Falla

```bash
# Verificar permisos del pipeline
aws iam get-role-policy \
  --role-name MissiPipeline-Role-xxx \
  --policy-name InlinePolicy
```

### CloudFront No Actualiza

```bash
# Verificar estado de invalidación
aws cloudfront list-invalidations \
  --distribution-id <DISTRIBUTION-ID>

# Forzar invalidación manual
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION-ID> \
  --paths "/*"
```

## 📊 Métricas y Alertas

### CloudWatch Metrics

```bash
# Éxito/falla de builds
aws cloudwatch get-metric-statistics \
  --namespace AWS/CodeBuild \
  --metric-name SucceededBuilds \
  --dimensions Name=ProjectName,Value=MissiFrontendBuild \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### Crear Alarma para Build Failures

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name MissiBuildFailure \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --metric-name FailedBuilds \
  --namespace AWS/CodeBuild \
  --period 300 \
  --statistic Sum \
  --threshold 1 \
  --alarm-actions <SNS-TOPIC-ARN>
```

## 🔐 Seguridad

### Permisos del Pipeline

El pipeline tiene permisos para:
- ✅ Leer de CodeCommit
- ✅ Ejecutar CodeBuild
- ✅ Escribir a S3
- ✅ Invalidar CloudFront
- ❌ NO tiene acceso a otros recursos

### Secrets Management

Para variables sensibles (API keys, etc):

```bash
# Almacenar en Systems Manager Parameter Store
aws ssm put-parameter \
  --name /missi/api-key \
  --value "secret-value" \
  --type SecureString

# Usar en BuildSpec
# environment:
#   parameter-store:
#     API_KEY: /missi/api-key
```

## 📈 Optimizaciones

### Cache de Dependencias

Agregar cache a BuildSpec para acelerar builds:

```yaml
cache:
  paths:
    - 'frontend/node_modules/**/*'
    - 'backend/node_modules/**/*'
```

### Builds Paralelos

Los builds de frontend y backend ya corren en paralelo:
- Tiempo sin paralelizar: ~5 min
- Tiempo con paralelo: ~3 min
- **Ahorro: 40%**

### Deployment Incremental

El pipeline solo despliega archivos modificados a S3 (ya implementado).

## 🎯 Best Practices

1. **Commits pequeños y frecuentes** - Facilita rollback
2. **Mensajes descriptivos** - `feat:`, `fix:`, `docs:`
3. **No hacer push directo a main** - Usar branches + merge
4. **Testing local primero** - `npm run build` antes de push
5. **Monitorear pipeline** - Verificar que termine exitoso

## 📞 Soporte

### Ver Ejecuciones del Pipeline

```bash
aws codepipeline list-pipeline-executions \
  --pipeline-name MissiDeploymentPipeline \
  --max-results 10
```

### Ver Detalles de Ejecución

```bash
aws codepipeline get-pipeline-execution \
  --pipeline-name MissiDeploymentPipeline \
  --pipeline-execution-id <execution-id>
```

### Reintentar Stage Fallido

Desde la consola web:
1. Ir a MissiPipelineUrl
2. Click en el stage fallido
3. Click "Retry"

## 📚 Referencias

- [AWS CodePipeline Docs](https://docs.aws.amazon.com/codepipeline/)
- [AWS CodeBuild Docs](https://docs.aws.amazon.com/codebuild/)
- [AWS CodeCommit Docs](https://docs.aws.amazon.com/codecommit/)
- [CDK Pipeline Construct](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.pipelines-readme.html)

---

**¡Listo!** Ahora tenés CI/CD completo con logs y rollback automático. 🚀
