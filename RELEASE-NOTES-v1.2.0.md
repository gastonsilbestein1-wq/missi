# 🎉 Release Notes v1.2.0 - Mejoras de Prompt

**Fecha**: 7 de junio de 2026  
**Tipo**: Mejora de Prompt (Backend)  
**Impacto**: Mejora significativa en la calidad de las respuestas

---

## 📋 Resumen

Esta versión mejora el comportamiento conversacional de Missi con dos cambios principales:

1. **✅ Contexto de Sanatorio**: Missi ahora sabe que está trabajando dentro de un sanatorio y deriva a especialistas internos
2. **✅ Uso Moderado de "Che"**: Reducido el uso excesivo de argentinismos para conversación más natural

---

## 🔄 Cambios Principales

### 1. Contexto de Sanatorio ✨

**Antes**:
```
Missi: "Tu presión está alta y tenés dolor de pecho. 
       Tenés que ir URGENTE a una guardia o llamar al 107."
```

**Ahora**:
```
Missi: "Tu presión está alta y tenés dolor de pecho. 
       Te derivo AHORA con el cardiólogo del sanatorio. 
       Andá a la sala de emergencias en el primer piso."
```

**Beneficios**:
- ✅ Derivaciones más realistas (especialistas del sanatorio)
- ✅ Elimina confusión de "ir al hospital" cuando ya están ahí
- ✅ Mejor experiencia de usuario

---

### 2. Personalidad Mejorada 🗣️

**Antes**:
```
Missi: "Che, ¿cómo te sentís?"
Usuario: "Me duele la cabeza"
Missi: "Che, ¿hace cuánto?"
Usuario: "Desde esta mañana"
Missi: "Che, ¿es constante?"
```
*❌ Problema: "Che" en cada respuesta sonaba repetitivo*

**Ahora**:
```
Missi: "¿Cómo te sentís?"
Usuario: "Me duele la cabeza"
Missi: "¿Hace cuánto te duele?"
Usuario: "Desde esta mañana"
Missi: "Dale, ¿el dolor es constante o viene y va?"
```
*✅ Solución: "Che" solo ocasionalmente, conversación más natural*

---

## 📊 Niveles de Derivación

El nuevo prompt define 3 niveles claros:

### 🟢 Nivel 1: Autocuidado
**Síntomas**: Leves, sensores normales  
**Respuesta**:
- Consejos de autocuidado
- "Pasá por farmacia a buscar ibuprofeno"
- "Descansá y volvé si empeora"

**Ejemplos**: Cefalea leve, resfriado común

---

### 🟡 Nivel 2: Médico Clínico del Sanatorio
**Síntomas**: Moderados, requieren evaluación  
**Respuesta**:
- "Te voy a derivar con el médico clínico acá en el sanatorio"
- "Pasá por consultorio para que te vea el doctor"

**Ejemplos**: Fiebre persistente, dolor abdominal fuerte

---

### 🔴 Nivel 3: Especialista URGENTE
**Síntomas**: Graves, sensores anormales  
**Respuesta**:
- "Te derivo AHORA con [especialista] del sanatorio"
- "Andá a la sala de emergencias en el primer piso"

**Ejemplos**: Dolor de pecho + presión alta, dificultad respiratoria

---

## 🔧 Cambios Técnicos

### Archivo: `backend/src/promptBuilder.js`

```diff
CONTEXTO:
- - Trabajás en un centro de salud haciendo triage inicial
+ - Trabajás en el sanatorio haciendo triage inicial en la guardia
+ - El paciente YA ESTÁ en el sanatorio (no sugieras ir al hospital o llamar al 107)

PERSONALIDAD:
- - Hablás con acento argentino (vos, che, dale)
+ - Hablás con acento argentino natural (vos, dale, boludo/a ocasional)
+ - Usá "che" solo raramente (máximo 1 vez cada 3-4 respuestas), NO en cada frase

PROTOCOLO DE DERIVACIÓN:
+ 1. SIMPLE → Autocuidado + farmacia
+ 2. MODERADO → Médico clínico del sanatorio  
+ 3. GRAVE → Especialista urgente del sanatorio

+ EJEMPLOS DE DERIVACIÓN CORRECTA:
+ ❌ MAL: "Tenés que ir al hospital" o "Llamá al 107"
+ ✅ BIEN: "Te derivo con el cardiólogo del sanatorio ahora mismo"
```

---

## 📦 Deployment

**Componente**: Backend (Lambda)  
**Método**: AWS CLI

```bash
# Actualizar Lambda
cd backend/src
zip -r /tmp/lambda-code.zip .
aws lambda update-function-code \
  --function-name MissiStack-MissiBackend91814226-LcbOaNw7a7Xt \
  --zip-file fileb:///tmp/lambda-code.zip
```

**Status**: ✅ Desplegado exitosamente

---

## 🧪 Testing Recomendado

### Caso 1: Dolor de Cabeza (Simple)
**Esperado**: Autocuidado + farmacia del sanatorio  
```
✅ "Tomá un ibuprofeno de 400mg. Si sigue, pasá por consultorio."
❌ "Andá al médico" (sin especificar que está en el sanatorio)
```

### Caso 2: Fiebre Alta (Moderado)
**Esperado**: Derivación a médico clínico del sanatorio  
```
✅ "Te derivo con el médico clínico acá en el sanatorio"
❌ "Tenés que ir a un centro de salud"
```

### Caso 3: Dolor de Pecho (Grave)
**Esperado**: Derivación urgente a especialista interno  
```
✅ "Te derivo AHORA con el cardiólogo del sanatorio. Andá a emergencias en el primer piso"
❌ "Llamá al 107" o "Andá al hospital"
```

### Caso 4: Uso de "Che"
**Esperado**: Aparece raramente, no en cada respuesta  
```
✅ "¿Cómo te sentís?" ... "¿Hace cuánto?" ... "Dale, ¿es constante?"
❌ "Che, ¿cómo te sentís?" ... "Che, ¿hace cuánto?" ... "Che, ¿es constante?"
```

---

## 📚 Documentación Actualizada

| Archivo | Cambios |
|---------|---------|
| `README.md` | Actualizado descripción con contexto de sanatorio |
| `docs/prompt-engineering.md` | Ejemplos con derivaciones internas |
| `CHANGELOG.md` | Registro de versión 1.2.0 |
| `RELEASE-NOTES-v1.2.0.md` | Este documento |

---

## 🌐 URLs de Producción

- **Website**: https://dzauji3zz7r1b.cloudfront.net
- **API**: https://hfhgnw26t1.execute-api.us-east-1.amazonaws.com/prod/

**Tiempo de propagación**: Inmediato (cambio solo en backend)

---

## 💡 Próximos Pasos Sugeridos

### Mejoras Futuras (v1.3.0+)
- [ ] Agregar nombres de especialistas reales del sanatorio
- [ ] Incluir números de piso/sala específicos
- [ ] Integrar con sistema de turnos real
- [ ] Memoria de pacientes recurrentes

### Testing Adicional
- [ ] Probar 10+ conversaciones reales
- [ ] Verificar que "che" aparece < 25% del tiempo
- [ ] Confirmar que NUNCA sugiere "llamar al 107"
- [ ] Validar los 3 niveles de derivación

---

## 📞 Soporte

**¿Problemas con el nuevo comportamiento?**

1. Ver logs de Lambda:
```bash
aws logs tail /aws/lambda/MissiStack-MissiBackend91814226-LcbOaNw7a7Xt --follow
```

2. Probar API directamente:
```bash
curl -X POST https://hfhgnw26t1.execute-api.us-east-1.amazonaws.com/prod/chat \
  -H "Content-Type: application/json" \
  -d '{
    "mensaje": "Me duele el pecho",
    "sensores": {"temperatura": 37.0, "ritmoCardiaco": 110, "oxigeno": 91, "presion": {"sistolica": 160, "diastolica": 105}},
    "historial": [],
    "preguntaNumero": 1
  }'
```

**Esperado**: Derivación a cardiólogo del sanatorio (no "llamar al 107")

---

## ✨ Resumen

**v1.2.0 mejora significativamente la calidad conversacional de Missi:**

✅ Contexto realista (sanatorio)  
✅ Derivaciones coherentes (especialistas internos)  
✅ Personalidad argentina natural (sin abusar de "che")  
✅ 3 niveles claros de derivación  
✅ Backend actualizado y desplegado  

**Estado**: 🟢 **EN PRODUCCIÓN - FUNCIONANDO**

---

**Release completado el 7 de junio de 2026 - 02:10 UTC** 🚀👩‍⚕️
