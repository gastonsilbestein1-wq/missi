# 🧪 Testing Guide - Missi

Guía para probar Missi después del deployment.

## Test Cases

### 1. Test de Navegador

**Navegadores soportados:**
- ✅ Chrome 80+
- ✅ Edge 80+
- ✅ Safari 14+
- ❌ Firefox (Web Speech API limitada)

**Pasos:**
1. Abrir WebsiteURL en cada navegador
2. Verificar que se soliciten permisos de micrófono
3. Verificar que Missi salude automáticamente

**Resultado esperado**: Saludo en todos los navegadores soportados

---

### 2. Test de Conversación Simple (Cefalea)

**Escenario**: Dolor de cabeza simple

**Pasos:**
1. Missi: "Hola, soy Missi. ¿Cómo te sentís hoy?"
2. Usuario: "Me duele la cabeza"
3. Missi: "Poné tu dedo en el sensor..."
4. [5 segundos de espera]
5. Missi lee sensores simulados
6. Continuar conversación respondiendo preguntas (4-5 preguntas más)

**Sensores esperados:**
- Temperatura: 36.0-38.5°C
- Ritmo: 60-110 bpm
- Oxígeno: 92-100%
- Presión: 110-150 / 70-95 mmHg

**Resultado esperado**: 
- Diagnóstico preliminar (ej: "Parece cefalea tensional")
- Recomendación de autocuidado o visita a médico clínico

---

### 3. Test de Emergencia (Dolor de Pecho)

**Escenario**: Posible infarto

**Pasos:**
1. Missi: "Hola, soy Missi. ¿Cómo te sentís hoy?"
2. Usuario: "Me duele el pecho y me cuesta respirar"
3. Missi pide sensores y los lee
4. Usuario responde 2-3 preguntas sobre el dolor

**Resultado esperado**:
- Derivación URGENTE a especialista (cardiólogo)
- Mención de gravedad ("muy grave", "urgente", "llamar al 107")
- Conversación termina en 2-3 preguntas (no 6)

---

### 4. Test Fuera de Contexto

**Escenario**: Pregunta no relacionada con salud

**Pasos:**
1. Missi: "Hola, soy Missi. ¿Cómo te sentís hoy?"
2. Usuario: "¿Qué hora es?"

**Resultado esperado**:
- Missi: "Soy enfermera virtual, solo puedo ayudarte con temas de salud"
- Redirige al contexto médico

---

### 5. Test de Animaciones

**Elementos a verificar:**

**Ojos:**
- [ ] Pestañean aleatoriamente cada 3-5 segundos
- [ ] Son círculos celestes cuando están abiertos
- [ ] Son líneas horizontales cuando están cerrados
- [ ] Transición suave (150ms)

**Boca:**
- [ ] Sonrisa por defecto (arco hacia abajo)
- [ ] Animación ondulante al hablar
- [ ] Se sincroniza con el audio
- [ ] Vuelve a sonreír al terminar de hablar

---

### 6. Test de Audio

**Web Speech Recognition:**
- [ ] Inicia automáticamente después del saludo
- [ ] Detecta pausas en el habla del usuario
- [ ] Transcribe correctamente español argentino
- [ ] Se reinicia automáticamente después de cada respuesta

**Web Speech Synthesis:**
- [ ] Usa voz femenina si está disponible
- [ ] Velocidad natural (rate: 0.9)
- [ ] Pitch ligeramente alto (1.1)
- [ ] Se escucha claro y sin cortes

---

### 7. Test de Errores

**Sin micrófono:**
1. Denegar permisos de micrófono
2. Recargar página

**Resultado esperado**:
- Cara triste (ojos + boca invertida)
- Mensaje: "No puedo escucharte. Verificá los permisos del micrófono"

**Sin conexión:**
1. Durante conversación, desconectar internet
2. Hablar con Missi

**Resultado esperado**:
- Mensaje: "Perdí la conexión. Intentá de nuevo en unos segundos"
- Cara triste

---

### 8. Test de Performance

**Métricas a medir:**

| Métrica | Objetivo | Crítico |
|---------|----------|---------|
| Carga inicial | < 2 seg | < 3 seg |
| Tiempo hasta primer audio | < 1 seg | < 2 seg |
| Respuesta de API | < 1 seg | < 2 seg |
| Síntesis de voz | < 500ms | < 1 seg |

**Herramientas:**
- Chrome DevTools > Network
- Chrome DevTools > Performance
- Lighthouse

---

### 9. Test Responsive

**Viewports a probar:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Verificar:**
- Tamaño de cara se ajusta
- Animaciones funcionan en todos los tamaños
- No hay scroll horizontal

---

### 10. Test de Backend

**Ver logs de Lambda:**
```bash
aws logs tail /aws/lambda/MissiStack-MissiBackend --follow
```

**Durante una conversación, verificar:**
- [ ] Requests llegan a Lambda
- [ ] Prompt se construye correctamente
- [ ] Bedrock responde sin errores
- [ ] Tokens consumidos son razonables (<500 por request)

**Logs esperados:**
```
Event recibido: {...}
Procesando conversación: {...}
Enviando a Bedrock con modelo: us.amazon.nova-lite-v1:0
Respuesta de Bedrock: "¿Hace cuánto te duele la cabeza?"
Tokens usados - Input: 250, Output: 15
```

---

## Checklist de Deployment

Después de cada deployment, ejecutar:

- [ ] Test 1: Navegador
- [ ] Test 2: Conversación simple
- [ ] Test 3: Emergencia
- [ ] Test 4: Fuera de contexto
- [ ] Test 5: Animaciones
- [ ] Test 6: Audio
- [ ] Test 7: Errores
- [ ] Test 8: Performance
- [ ] Test 9: Responsive
- [ ] Test 10: Backend

---

## Test Automation (Futuro)

### Frontend (Jest + React Testing Library)

```javascript
// MissiFace.test.jsx
import { render, screen } from '@testing-library/react';
import MissiFace from './MissiFace';

test('renderiza cara con ojos y boca', () => {
  render(<MissiFace hablando={false} escuchando={false} error={false} />);
  const ojos = screen.getAllByClassName('ojo');
  expect(ojos).toHaveLength(2);
});
```

### Backend (Jest)

```javascript
// handler.test.js
import { handler } from './handler';

test('valida entrada requerida', async () => {
  const event = { body: '{}' };
  const response = await handler(event);
  expect(response.statusCode).toBe(400);
});
```

### E2E (Playwright)

```javascript
// e2e.spec.js
import { test, expect } from '@playwright/test';

test('conversación completa', async ({ page }) => {
  await page.goto('https://tu-cloudfront-url.com');
  
  // Acepta permisos de micrófono
  await page.context().grantPermissions(['microphone']);
  
  // Espera saludo
  await expect(page.locator('.missi-face')).toBeVisible();
  
  // Simula habla del usuario
  // ... resto del test
});
```

---

## Monitoreo en Producción

### CloudWatch Metrics

```bash
# Ver invocaciones de Lambda
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=MissiStack-MissiBackend \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### X-Ray (Opcional)

Habilitar tracing en Lambda para ver latencias:

```javascript
// En missi-stack.js
tracing: lambda.Tracing.ACTIVE
```

---

## Reporte de Issues

Si encuentras un bug durante testing, reporta con:

1. **Test case**: Cuál de los tests de arriba falló
2. **Pasos**: Cómo reproducir
3. **Esperado vs. Actual**: Qué debería pasar vs. qué pasó
4. **Logs**: Incluir logs de Lambda si aplica
5. **Screenshot/Video**: Si es un problema visual

---

## Costos de Testing

Testing con ~50 interacciones:
- Bedrock tokens: ~$0.05
- Lambda invocations: $0 (Free Tier)
- API Gateway: $0 (Free Tier)

**Total**: < $0.10 por sesión de testing completa
