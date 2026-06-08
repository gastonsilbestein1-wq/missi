# 📝 Changelog - Missi

Historial de cambios del proyecto Missi.

---

## [2.0.0] - 2026-06-07

### 🎨 Rediseño Completo de la Cara - Versión Final
- **Boca perfectamente posicionada**: Radio 500px, 40% visible, posición optimizada
- **Ojos sobre la boca**: z-index con ojos adelante y boca atrás creando profundidad
- **Puntas redondeadas perfectas**: Círculos separados 100% visibles posicionados con precisión
- **Animación mejorada**: Escala vertical (scaleY) que achata la boca naturalmente
- **Espaciado optimizado**: Gap 0 con posiciones ajustadas pixel a pixel

### 🔧 Cambios Técnicos Desktop
- Gap missi-face: 240px → 0
- Ojos: translateY(65px) para posicionarlos sobre la boca
- Boca: 500px diámetro, clip-path 60% (muestra 40%), translateY(-80px)
- Puntas redondeadas: Elementos separados en JSX (no pseudo-elementos)
  - Tamaño: 40.5px
  - Posiciones: left 5.25px, right 5.75px
  - z-index: 10 (100% visibles)
- Animación: Contenedor completo con scaleY(1) → scaleY(0.2)
- Duration: 0.15s ease-in-out

### 📐 Arquitectura Nueva
```
.boca-container (se anima)
  ├── .boca (arco del círculo)
  ├── .boca-punta-izq (círculo cap izquierdo)
  └── .boca-punta-der (círculo cap derecho)
```

### 🎭 Resultado Visual
- Cara balanceada con profundidad (ojos adelante, boca atrás)
- Sonrisa ancha y natural con puntas perfectamente redondeadas
- Animación fluida y visible que simula habla real

### 📁 Archivos Modificados
- `frontend/src/components/MissiFace.jsx` - Estructura JSX con boca-container
- `frontend/src/styles/App.css` - Rediseño completo de posiciones y animación
- `CHANGELOG.md`

---

## [1.8.0] - 2026-06-07

### 🎨 Sonrisa Ancha y Animación Simplificada
- **Diámetro aumentado**: 200px → 800px (4x más ancha)
- **Arco más sutil**: Muestra solo 30% inferior (70% superior cortado)
- **Animación simplificada**: Vibración vertical suave (eliminado círculo cerrado)
- **Puntas redondeadas**: Mantenidas con pseudo-elementos

### 🔧 Cambios Técnicos
- Boca: 800px x 800px (diámetro grande)
- Clip-path: `inset(70% 0 0 0)` para mostrar solo 30% inferior
- Animación: Vibración de 0 a 8px vertical
- Duración: 0.15s (más rápida y natural)

### 🎭 Efecto Visual
Sonrisa ancha y sutil que vibra suavemente al hablar

### 📁 Archivos Modificados
- `frontend/src/styles/App.css`
- `CHANGELOG.md`

---

## [1.7.0] - 2026-06-07

### 🎨 Rediseño Completo de Boca - Semicírculo Perfecto
- **Forma geométrica perfecta**: Semicírculo (mitad inferior de circunferencia) 200px diámetro
- **Puntas redondeadas**: Pseudo-elementos (::before, ::after) para caps circulares
- **Animación mejorada**: Semicírculo se cierra en círculo completo relleno
- **Círculo relleno**: Al hablar, el círculo se rellena de color azul (#1E90FF)

### 🔧 Cambios Técnicos
- Boca: 200px x 200px circular, border-top transparente = semicírculo
- Grosor: 40px uniforme
- Puntas: Círculos de 40px en cada extremo para redondear caps
- Animación:
  - Estado 0%: Semicírculo hueco (border transparente arriba)
  - Estado 100%: Círculo completo relleno (background + border)

### 🎭 Efecto Visual
Semicírculo perfecto → Círculo relleno (simula boca cerrada → abierta)

### 📁 Archivos Modificados
- `frontend/src/styles/App.css`
- `CHANGELOG.md`

---

## [1.6.0] - 2026-06-07

### 🎨 Animación de Habla Mejorada
- **Puntas redondeadas**: Clip-path reducido (240→220px) para puntas más suaves sin terminar en punta
- **Animación dramática**: Transición de sonrisa a círculo (boca abierta) al hablar
- **Más fluida**: Duración 0.25s con ease-in-out para movimiento natural
- **Forma dinámica**: Cambia border-radius y clip-path durante la animación

### 🔧 Cambios Técnicos
- Animación @keyframes completamente rediseñada:
  - Estado 0%: Sonrisa (border-radius 400px, ellipse 220x140)
  - Estado 100%: Boca abierta circular (border-radius 50%, ellipse 160x100)
- Timing: 0.3s → 0.25s con ease-in-out
- Eliminada animación antigua de scaleY

### 🎭 Efecto Visual
De sonrisa feliz → boca abierta circular (simulando habla natural)

### 📁 Archivos Modificados
- `frontend/src/styles/App.css`
- `CHANGELOG.md`

---

## [1.5.1] - 2026-06-07

### 🎨 Refinamiento de Sonrisa
- **Puntas redondeadas**: Bordes de la sonrisa más suaves y orgánicos
- **Curvatura mejorada**: Forma elíptica más natural (sin parte recta en el fondo)
- **Radio aumentado**: border-radius 300→400px para curvatura más suave
- **Clip-path elíptico**: Aplicado para forma más orgánica y redondeada

### 🔧 Cambios Técnicos
- Altura de boca: 120→180px (más espacio para curvatura)
- Border-radius: 300→400px (más redondeado)
- Agregado clip-path con ellipse para forma orgánica
- Puntas completamente redondeadas sin esquinas

### 📁 Archivos Modificados
- `frontend/src/styles/App.css`
- `CHANGELOG.md`

---

## [1.5.0] - 2026-06-07

### 🎨 Ajustes Finales de Expresividad
- **Ojos 20% más chicos**: Reducidos de 240x320px a 192x256px (mantienen posición)
- **Sonrisa más feliz**: Boca con más curvatura (radio 300px, altura 120px)
- **Expresión mejorada**: Balance visual más amigable y expresivo

### 🔧 Cambios Técnicos
- Ojos: width 240→192px, height 320→256px (reducción del 20%)
- Boca: height 40→120px, border-radius 240→300px (sonrisa más pronunciada)
- Posición de ojos mantenida (gaps sin cambios)
- Responsive actualizado con proporciones correctas

### 📁 Archivos Modificados
- `frontend/src/styles/App.css`
- `CHANGELOG.md`

---

## [1.4.0] - 2026-06-07

### 🎨 Refinamiento Visual Final
- **Todo del mismo color**: Ojos y boca ahora usan el mismo azul medio (#1E90FF) para apariencia unificada
- **Boca como sonrisa**: Vuelta a forma de sonrisa curva pero con grosor uniforme (40px)
- **Tamaño 4x original**: Duplicado nuevamente el tamaño (4x respecto a v1.0.0)
  - Ojos: 240px x 320px (antes 120px x 160px)
  - Boca: 480px ancho con borde de 40px (antes 240px con 20px)
  - Gaps: 320px entre ojos, 240px ojos-boca

### 🔧 Cambios Técnicos
- Color unificado: Todo #1E90FF (eliminado #87CEEB celeste claro)
- Boca: Cambio de barra sólida a border con forma de sonrisa
- Grosor uniforme: 40px en toda la circunferencia de la sonrisa

### 📁 Archivos Modificados
- `frontend/src/styles/App.css`
- `CHANGELOG.md`

---

## [1.3.0] - 2026-06-07

### 🎨 Rediseño Visual Completo
- **Tamaño doble**: Toda la cara (ojos, boca, espaciado) es 2x más grande
- **Ojos ovalados verticales**: Forma ovalada (120x160px) más expresiva, en lugar de círculos
- **Boca recta y gruesa**: Boca horizontal ancha (240px) con grosor uniforme (20px), eliminando curva
- **Diseño más moderno**: Apariencia más grande y clara para mejor visibilidad

### 🔧 Cambios Técnicos
- `frontend/src/styles/App.css`:
  - Ojos: 80px → 120px ancho, 80px → 160px alto (ovalados)
  - Boca: 100px → 240px ancho, borde curved → barra sólida 20px
  - Gap entre ojos: 80px → 160px
  - Gap ojos-boca: 60px → 120px
  - Responsive: Actualizado para mantener proporciones

### 📁 Archivos Modificados
- `frontend/src/styles/App.css`
- `README.md`
- `CHANGELOG.md`

---

## [1.2.1] - 2026-06-07

### 🐛 Correcciones Críticas
- **Eliminado "che" completamente**: Instrucción explícita para NUNCA usar "che"
- **Eliminado "Missi:" en respuestas**: Missi ya no dice su nombre antes de responder
- **Historial mejorado**: Cambiado "Missi:" por "Enfermera:" en el contexto para evitar confusión

### 🔧 Cambios Técnicos
- Múltiples restricciones agregadas en el prompt para evitar "che"
- Formato de respuesta explícito con ejemplos correcto/incorrecto
- Recordatorios finales antes de cada respuesta

### 📁 Archivos Modificados
- `backend/src/promptBuilder.js`
- `CHANGELOG.md`

---

## [1.2.0] - 2026-06-07

### ✨ Mejoras del Prompt
- **Contexto actualizado**: Missi ahora trabaja en un sanatorio (no en centro de salud externo)
- **Derivaciones internas**: Las sugerencias ahora son a especialistas dentro del mismo sanatorio, no "ir al hospital" o "llamar al 107"
- **Personalidad ajustada**: Uso moderado de "che" (máximo 1 vez cada 3-4 respuestas) para evitar repetición excesiva

### 🔧 Cambios en Prompts
- **backend/src/promptBuilder.js**:
  - Aclarado que el paciente YA ESTÁ en el sanatorio
  - Agregados ejemplos de derivación correcta vs incorrecta
  - Restricción explícita: NO sugerir ir al hospital o llamar emergencias
  - Tres niveles de derivación: Simple (autocuidado), Moderada (médico clínico), Grave (especialista urgente)

### 📚 Documentación Actualizada
- `README.md`: Reflejado contexto de sanatorio
- `docs/prompt-engineering.md`: Ejemplos actualizados con derivaciones internas
- `CHANGELOG.md`: Este registro de cambios

### 📁 Archivos Modificados
- `backend/src/promptBuilder.js`
- `README.md`
- `docs/prompt-engineering.md`
- `CHANGELOG.md`

---

## [1.1.0] - 2026-06-07

### 🐛 Corregido
- **Conversación se detenía después de leer sensores**: Después de que Missi leía los signos vitales, la conversación se quedaba en silencio y no hacía la primera pregunta diagnóstica. Los usuarios tenían que hablar nuevamente y recibían el error "Perdí la conexión".

### ✨ Mejoras
- **Flujo conversacional automático**: Ahora Missi automáticamente hace la primera pregunta diagnóstica inmediatamente después de leer los sensores, sin esperar input adicional del usuario.
- **Mejor manejo de estados**: Simplificado el flujo de estados para prevenir condiciones de carrera.

### 🔧 Cambios Técnicos
- `frontend/src/services/conversationManager.js`:
  - Convertido `leerSensores()` a función async
  - Agregado llamado automático al backend después de leer sensores
  - Simplificado la lógica de estado para solo procesar mensajes en `DIAGNOSTICANDO`
  - Agregado detención explícita del speech service al finalizar

### 📁 Archivos Modificados
- `frontend/src/services/conversationManager.js`
- `DEPLOYMENT-FINAL.md` (documentación actualizada)
- `CHANGELOG.md` (nuevo archivo)

---

## [1.0.0] - 2026-06-06

### 🎉 Lanzamiento Inicial
- **Deployment exitoso** de Missi en AWS
- **Frontend**: React + Vite desplegado en S3 + CloudFront
- **Backend**: Lambda + Bedrock Nova Lite
- **Infrastructure**: AWS CDK con deployment manual

### ✨ Características
- Interacción 100% por voz (Web Speech API)
- Triage médico básico (5-6 preguntas)
- Simulación de sensores (temperatura, ritmo cardíaco, oxígeno, presión)
- Personalidad argentina cálida y empática
- Interfaz minimalista (solo cara animada)

### 🐛 Corregido (Pre-lanzamiento)
1. **ES Modules en Lambda**: Convertido todo el backend a CommonJS
2. **Permisos Bedrock**: Agregados permisos wildcard para foundation models
3. **Model ID incorrecto**: Cambiado a `amazon.nova-lite-v1:0`

### 🌐 URLs de Producción
- **Website**: https://dzauji3zz7r1b.cloudfront.net
- **API**: https://hfhgnw26t1.execute-api.us-east-1.amazonaws.com/prod/

### 💰 Costos
- **Estimado**: $1-5/mes (solo Bedrock Nova Lite)
- Todos los demás servicios en Free Tier

---

## Formato de Versiones

Este proyecto usa [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambios incompatibles de API
- **MINOR**: Nuevas funcionalidades retrocompatibles
- **PATCH**: Correcciones de bugs retrocompatibles

### Categorías de Cambios
- **🎉 Lanzamiento**: Release importante
- **✨ Mejoras**: Nueva funcionalidad o mejora
- **🐛 Corregido**: Bug fix
- **🔧 Cambios Técnicos**: Cambios internos sin impacto visible
- **📚 Documentación**: Solo cambios en documentación
- **🔒 Seguridad**: Fixes de seguridad
- **⚠️ Breaking**: Cambios que rompen compatibilidad
- **📁 Archivos**: Lista de archivos modificados

---

**Última actualización**: 7 de junio de 2026
