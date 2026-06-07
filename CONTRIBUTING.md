# 🤝 Contribuir a Missi

Gracias por tu interés en contribuir al proyecto Missi.

## Desarrollo Local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend correrá en http://localhost:5173

**Nota**: Para probar completamente, necesitas el backend corriendo o desplegado en AWS.

### Backend (Desarrollo Local)

Para probar Lambda localmente, usa AWS SAM:

```bash
cd backend
sam local start-api
```

O crea un archivo de test:

```javascript
// test.js
import { handler } from './src/handler.js';

const event = {
  body: JSON.stringify({
    mensaje: 'Me duele la cabeza',
    sensores: {
      temperatura: 37.2,
      ritmoCardiaco: 75,
      oxigeno: 98,
      presion: { sistolica: 120, diastolica: 80 }
    },
    historial: [],
    preguntaNumero: 1
  })
};

handler(event).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
```

### Estructura del Código

```
missi/
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── services/     # Lógica de negocio
│   │   └── styles/       # CSS
│
├── backend/          # Lambda + Bedrock
│   └── src/
│       ├── handler.js        # Entry point
│       ├── bedrockService.js # Cliente Bedrock
│       └── promptBuilder.js  # Construcción de prompts
│
├── infrastructure/   # AWS CDK
│   └── lib/
│       └── missi-stack.js    # Definición de recursos
│
└── docs/            # Documentación
```

## Guía de Estilo

### JavaScript/JSX

- Usar ES6+ features
- Preferir `const` sobre `let`
- Usar arrow functions
- Componentes funcionales con hooks
- Nombres descriptivos para variables y funciones

### CSS

- Mobile-first approach
- Usar CSS moderno (flexbox, grid)
- Evitar !important
- Animaciones suaves (respecting `prefers-reduced-motion`)

### Commits

Formato de mensajes:

```
tipo(scope): descripción corta

Descripción larga si es necesario
```

Tipos:
- `feat`: Nueva funcionalidad
- `fix`: Bug fix
- `docs`: Cambios en documentación
- `style`: Formateo, espacios, etc
- `refactor`: Refactorización de código
- `test`: Agregar tests
- `chore`: Tareas de mantenimiento

Ejemplos:
```
feat(frontend): agregar animación de pestañeo
fix(backend): corregir timeout en llamadas a Bedrock
docs(readme): actualizar guía de deployment
```

## Testing

### Frontend

```bash
cd frontend
npm test
```

### Backend

```bash
cd backend
npm test
```

## Pull Requests

1. Fork del repositorio
2. Crear branch con nombre descriptivo: `feature/nueva-funcionalidad`
3. Hacer commits con mensajes claros
4. Push a tu fork
5. Crear Pull Request con descripción detallada

## Áreas para Contribuir

### Alta Prioridad
- [ ] Tests unitarios para frontend
- [ ] Tests unitarios para backend
- [ ] Tests de integración
- [ ] Mejoras de accesibilidad
- [ ] Optimización de performance

### Media Prioridad
- [ ] Soporte multi-idioma
- [ ] Autenticación de usuarios
- [ ] Persistencia de conversaciones
- [ ] Métricas y analytics
- [ ] A/B testing de modelos

### Baja Prioridad
- [ ] Avatar 3D
- [ ] Modo oscuro
- [ ] PWA support
- [ ] Mobile app (React Native)

## Reporte de Bugs

Usa GitHub Issues con el template:

```markdown
**Descripción del bug**
Descripción clara del problema

**Pasos para reproducir**
1. Ir a '...'
2. Hacer click en '...'
3. Ver error

**Comportamiento esperado**
Qué debería pasar

**Screenshots**
Si aplica

**Entorno**
- Navegador: Chrome 120
- OS: macOS 14
- Versión de Missi: 1.0.0
```

## Preguntas

Si tienes preguntas, abre un Issue con la etiqueta `question`.

## Licencia

Al contribuir, aceptas que tu código estará bajo la misma licencia del proyecto.
