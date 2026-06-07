# Missi Frontend

Interfaz web de la enfermera virtual Missi usando React + Vite.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Configuración

Copiar `.env.example` a `.env` y configurar la URL de la API:

```bash
cp .env.example .env
```

Editar `.env`:
```
VITE_API_URL=https://tu-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
```

## Desarrollo Local

```bash
npm run dev
```

Abre http://localhost:5173

## Build para Producción

```bash
npm run build
```

Los archivos estáticos se generan en `/dist`

## Despliegue a S3

Después del build, copiar los archivos a S3:

```bash
aws s3 sync dist/ s3://tu-bucket-missi/ --delete
```

Invalidar caché de CloudFront:

```bash
aws cloudfront create-invalidation --distribution-id TU_DISTRIBUTION_ID --paths "/*"
```

## Estructura

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Componente raíz
├── components/
│   └── MissiFace.jsx           # Cara animada
├── services/
│   ├── speechService.js        # Web Speech API
│   ├── apiService.js           # Cliente HTTP
│   ├── sensorSimulator.js      # Generador de sensores
│   └── conversationManager.js  # Lógica de conversación
└── styles/
    └── App.css                 # Estilos globales
```

## Navegadores Soportados

- Chrome 80+
- Edge 80+
- Safari 14+

**Nota**: Web Speech API solo funciona en estos navegadores.

## Troubleshooting

### "Tu navegador no es compatible"
- Usar Chrome, Edge o Safari
- Firefox no soporta Web Speech API completa

### "No puedo escucharte"
- Verificar permisos de micrófono en el navegador
- Verificar que no haya otra app usando el micrófono

### "Perdí la conexión"
- Verificar que la API Gateway esté corriendo
- Revisar la variable `VITE_API_URL` en `.env`
- Verificar CORS en API Gateway
