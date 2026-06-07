# 🎨 Diseño de la Aplicación - Missi

## UI/UX - Interfaz Minimalista

### Pantalla Única

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│          ⚪    ⚪                   │
│         (ojo)  (ojo)                │
│                                     │
│             ⌣                       │
│          (boca)                     │
│                                     │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

**Colores:**
- Fondo: `#FFFFFF` (blanco puro)
- Ojos: `#87CEEB` (sky blue / celeste)
- Boca: `#1E90FF` (dodger blue / azul)
- Sin bordes, sin sombras, sin decoraciones

**Elementos:**
- ✅ 2 ojos (círculos celestes)
- ✅ 1 boca (línea/curva azul)
- ❌ Sin botones
- ❌ Sin texto visible
- ❌ Sin indicadores
- ❌ Sin controles

## Animaciones

### 1. Ojos (Pestañeo)

**Estados:**
```css
/* Ojos Abiertos (default) */
.ojo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #87CEEB;
}

/* Ojos Cerrados (pestañeo) */
.ojo.cerrado {
  width: 80px;
  height: 8px;
  border-radius: 4px;
  background: #1E90FF;
}
```

**Comportamiento:**
- Pestañeo aleatorio cada 3-5 segundos
- Duración: 150ms
- Transición suave con `cubic-bezier(0.4, 0, 0.2, 1)`

**Lógica:**
```javascript
function pestañear() {
  ojos.classList.add('cerrado');
  setTimeout(() => {
    ojos.classList.remove('cerrado');
  }, 150);
}

// Pestañeo aleatorio
setInterval(() => {
  pestañear();
}, random(3000, 5000));
```

### 2. Boca (Estados)

**Estados:**
```css
/* Sonriendo (default) */
.boca.sonriente {
  width: 100px;
  height: 50px;
  border-bottom: 4px solid #1E90FF;
  border-radius: 0 0 50px 50px;
}

/* Hablando (animación) */
.boca.hablando {
  animation: hablar 0.3s infinite alternate;
}

@keyframes hablar {
  0% { transform: scaleY(0.8); }
  50% { transform: scaleY(1.2); }
  100% { transform: scaleY(0.8); }
}
```

**Comportamiento:**
- **Reposo**: Sonrisa suave (arco hacia abajo)
- **Hablando**: Animación ondulante sincronizada con audio
- **Escuchando**: Sonrisa (igual que reposo)

**Lógica:**
```javascript
// Cuando empieza a hablar
function iniciarAnimacionBoca() {
  boca.classList.add('hablando');
}

// Cuando termina de hablar
function detenerAnimacionBoca() {
  boca.classList.remove('hablando');
  boca.classList.add('sonriente');
}
```

## Flujo de Interacción Completo

### Secuencia Visual

```
┌──────────────────────────────────────────────────────────────┐
│ FASE 1: CARGA                                                 │
├──────────────────────────────────────────────────────────────┤
│ • Página carga                                                │
│ • Cara aparece (ojos abiertos ⚪ ⚪, boca sonriente ⌣)       │
│ • 500ms de silencio                                           │
│ • Missi dice: "Hola, soy Missi. ¿Cómo te sentís hoy?"       │
│   └─> Boca se anima mientras habla                           │
│ • Inicia escucha automática                                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ FASE 2: ESCUCHANDO                                            │
├──────────────────────────────────────────────────────────────┤
│ • Ojos abiertos (atenta)                                      │
│ • Boca sonriente (reposo)                                     │
│ • Pestañeos aleatorios cada 3-5 seg                           │
│ • Usuario habla: "Me duele la cabeza"                         │
│ • Al detectar pausa → procesa                                 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ FASE 3: TOMANDO SENSORES (SOLO 1 VEZ)                        │
├──────────────────────────────────────────────────────────────┤
│ • Missi: "Poné tu dedo en el sensor..."                      │
│   └─> Boca se anima                                           │
│ • Espera 5 segundos (boca vuelve a sonreír)                  │
│ • Missi: "Tu temperatura es 37.2°C, tu ritmo cardíaco 75..." │
│   └─> Boca se anima leyendo cada valor                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ FASE 4: CONVERSACIÓN (5-6 PREGUNTAS)                         │
├──────────────────────────────────────────────────────────────┤
│ • Ciclo: Missi pregunta → Usuario responde → Missi pregunta  │
│ • Boca se anima al hablar                                     │
│ • Ojos pestañean aleatoriamente                               │
│ • Sin indicadores visuales de estado                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ FASE 5: DIAGNÓSTICO FINAL                                     │
├──────────────────────────────────────────────────────────────┤
│ • Missi da diagnóstico + derivación                          │
│ • Ejemplo: "Parece cefalea tensional. Tomá ibuprofeno..."    │
│ • Conversación termina                                        │
│ • [Opcional] Reinicia después de 10 seg                      │
└──────────────────────────────────────────────────────────────┘
```

## Responsive Design

### Desktop (1024px+)
```
Cara: 400px x 400px
Ojos: 80px diámetro, separados 120px
Boca: 100px ancho
```

### Tablet (768px - 1023px)
```
Cara: 300px x 300px
Ojos: 60px diámetro, separados 90px
Boca: 75px ancho
```

### Mobile (< 768px)
```
Cara: 250px x 250px
Ojos: 50px diámetro, separados 75px
Boca: 60px ancho
```

## Accesibilidad

### Visual
- Alto contraste (celeste/azul sobre blanco)
- Sin dependencia de color para información
- Animaciones suaves (no epileptogénicas)

### Auditiva
- **Interacción principal es por voz**
- Sin alternativa visual de texto (PoC)
- Futuro: subtítulos opcionales

### Navegación
- Sin teclado/mouse requerido
- Completamente manos libres
- Voz como única interfaz

## Estados de Error

### Sin micrófono detectado
```
┌─────────────────────────────────────┐
│          ⚪    ⚪                   │
│                                     │
│             😞                      │
│        (boca triste)                │
│                                     │
│  "No puedo escucharte. Verificá    │
│   los permisos del micrófono"      │
└─────────────────────────────────────┘
```

### Error de red
```
┌─────────────────────────────────────┐
│          ⚪    ⚪                   │
│                                     │
│             😞                      │
│                                     │
│  "Perdí la conexión. Intentá       │
│   de nuevo en unos segundos"       │
└─────────────────────────────────────┘
```

### Navegador incompatible
```
┌─────────────────────────────────────┐
│          ⚪    ⚪                   │
│                                     │
│             😞                      │
│                                     │
│  "Tu navegador no es compatible.   │
│   Usá Chrome, Edge o Safari"       │
└─────────────────────────────────────┘
```

## Simulación de Sensores

### Generación de Datos

```javascript
function generarSensores() {
  return {
    temperatura: random(36.0, 38.5, 1), // 1 decimal
    ritmoCardiaco: random(60, 110),      // entero
    oxigeno: random(92, 100),            // entero
    presion: {
      sistolica: random(110, 150),       // entero
      diastolica: random(70, 95)         // entero
    }
  };
}
```

### Rangos de Valores

| Sensor | Normal | Precaución | Alerta |
|--------|--------|------------|--------|
| Temperatura | 36.0-37.5°C | 37.6-38.0°C | >38.0°C |
| Ritmo Cardíaco | 60-80 bpm | 81-100 bpm | >100 bpm |
| Oxígeno | 95-100% | 92-94% | <92% |
| Presión Sistólica | 110-130 mmHg | 131-140 mmHg | >140 mmHg |
| Presión Diastólica | 70-85 mmHg | 86-90 mmHg | >90 mmHg |

### Lectura en Voz

```javascript
function leerSensores(sensores) {
  const texto = `
    Tu temperatura es ${sensores.temperatura} grados,
    tu ritmo cardíaco ${sensores.ritmoCardiaco} latidos por minuto,
    tu oxígeno en sangre ${sensores.oxigeno} por ciento,
    y tu presión ${sensores.presion.sistolica} sobre ${sensores.presion.diastolica}.
  `;
  
  hablar(texto);
}
```

## Performance

### Métricas Objetivo

| Métrica | Objetivo | Crítico |
|---------|----------|---------|
| Carga inicial | < 2 seg | < 3 seg |
| Respuesta API | < 1 seg | < 2 seg |
| Síntesis de voz | < 500ms | < 1 seg |
| Animación FPS | 60 fps | 30 fps |

### Optimizaciones

1. **Frontend**
   - CSS inline para animaciones críticas
   - Preload de Web Speech API
   - Lazy load de componentes no críticos

2. **Audio**
   - Voz sintetizada en el navegador (sin red)
   - Buffer de audio para evitar cortes

3. **API**
   - Compresión gzip en API Gateway
   - Lambda warm-up (opcional)

## Testing Manual

### Checklist UX

- [ ] Cara se renderiza correctamente en todos los viewports
- [ ] Ojos pestañean aleatoriamente
- [ ] Boca se anima al hablar
- [ ] Micrófono se activa automáticamente
- [ ] Pausa en habla del usuario dispara procesamiento
- [ ] Sensores se leen solo 1 vez
- [ ] Máximo 6 preguntas + diagnóstico final
- [ ] Errores se muestran con cara triste + mensaje
- [ ] Audio se escucha claro y sin cortes

### Casos de Prueba

1. **Happy Path**: Dolor de cabeza simple → 5 preguntas → diagnóstico
2. **Emergencia**: Dolor de pecho → 2 preguntas → derivación urgente
3. **Fuera de contexto**: "¿Qué hora es?" → Rechazo amable
4. **Sin micrófono**: Permisos denegados → Error visual
5. **Sin red**: Desconexión → Mensaje de error

## Mejoras Futuras (Post-PoC)

- [ ] Avatar 3D con expresiones faciales
- [ ] Subtítulos en tiempo real
- [ ] Modo oscuro / alto contraste
- [ ] Animación de "pensando" (antes de responder)
- [ ] Feedback háptico en mobile
- [ ] Idiomas adicionales (inglés, portugués)
