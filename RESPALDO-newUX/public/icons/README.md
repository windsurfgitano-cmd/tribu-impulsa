# Iconos PWA

Para que la PWA funcione correctamente en iPhone y Android, necesitas crear los siguientes iconos:

## Tamaños requeridos

| Archivo | Tamaño | Uso |
| --- | --- | --- |
| `icon-72.png` | 72x72 | Android legacy |
| `icon-96.png` | 96x96 | Android legacy |
| `icon-128.png` | 128x128 | Chrome Web Store |
| `icon-144.png` | 144x144 | Windows |
| `icon-152.png` | 152x152 | iOS |
| `icon-192.png` | 192x192 | Android, iOS |
| `icon-384.png` | 384x384 | Android |
| `icon-512.png` | 512x512 | Android, splash |

## Cómo crear los iconos

1. **Usa el logo de Tribu Impulsa** (`tribulogo.PNG`)
2. **Herramientas recomendadas**:
   - [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - Figma / Photoshop

3. **Requisitos**:
   - Fondo sólido (no transparente para iOS)
   - Icono centrado con margen
   - PNG format

## Splash Screens para iOS

Crear en `public/splash/`:
- `splash-640x1136.png` (iPhone 5)
- `splash-750x1334.png` (iPhone 6/7/8)
- `splash-1242x2208.png` (iPhone 6+/7+/8+)
- `splash-1125x2436.png` (iPhone X/XS)

## Probar PWA en iPhone

1. Abre Safari en tu iPhone
2. Navega a la URL de la app (necesita HTTPS)
3. Toca el botón "Compartir" (cuadrado con flecha)
4. Selecciona "Añadir a pantalla de inicio"
5. La app se instalará con el icono y nombre configurados

## Verificar instalación

- La app debe abrirse en modo standalone (sin barra de Safari)
- El splash screen debe aparecer al iniciar
- El icono debe verse correctamente en la pantalla de inicio
