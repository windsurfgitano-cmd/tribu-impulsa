# Manual de Buenas Prácticas: PWA con Vibe Coding - 2025

**Última actualización:** 20 de diciembre de 2025

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [¿Qué es Vibe Coding?](#qué-es-vibe-coding)
3. [¿Qué es una PWA?](#qué-es-una-pwa)
4. [Arquitectura Fundamental](#arquitectura-fundamental)
5. [Pro Tips y Mejores Prácticas](#pro-tips-y-mejores-prácticas)
6. [Stack Tecnológico Recomendado](#stack-tecnológico-recomendado)
7. [Guía de Desarrollo Paso a Paso](#guía-de-desarrollo-paso-a-paso)
8. [Debugging y Testing](#debugging-y-testing)
9. [Deployment y Optimización](#deployment-y-optimización)
10. [Checklist Final](#checklist-final)

---

## Introducción

Este manual es una guía práctica y completa para desarrolladores que desean construir **Progressive Web Apps (PWA)** utilizando la metodología de **Vibe Coding** con herramientas basadas en IA. El objetivo es proporcionar recomendaciones accionables, pro tips y mejores prácticas validadas para diciembre de 2025.

### ¿A quién está dirigido este manual?

- Desarrolladores full-stack
- Emprendedores tech que construyen SaaS
- Equipos de desarrollo ágil
- Desarrolladores con experiencia en JavaScript/TypeScript

---

## ¿Qué es Vibe Coding?

**Vibe Coding** es un estilo de programación emergente que utiliza herramientas de IA para generar código funcional a partir de instrucciones en **lenguaje natural**. En lugar de escribir código línea por línea, describes el objetivo que quieres lograr y la IA genera el código.

### Ciclos de Vibe Coding

#### 1. **Ciclo Bajo (Code Refinement)**
- Crear y perfeccionar fragmentos de código específicos
- Iteraciones rápidas con feedback conversacional
- Duración típica: minutos a horas

#### 2. **Ciclo Alto (App Lifecycle)**
- Pasar de idea a aplicación implementada
- Incluye concepto, desarrollo y despliegue
- Duración típica: días a semanas

### Herramientas de Vibe Coding (2025)

| Herramienta | Caso de Uso | Nivel de Código |
|-------------|-----------|-----------------|
| **Google AI Studio** | Prototipos rápidos | Sin código |
| **Firebase Studio** | Apps full-stack | Bajo código |
| **Windsurf / Cursor** | Proyectos existentes | Asistencia IA |
| **Lovable** | Apps completas | Sin código |
| **v0 (Vercel)** | Componentes React | Bajo código |

---

## ¿Qué es una PWA?

Una **Progressive Web App** es una aplicación web que funciona como una app nativa pero mantiene la accesibilidad y alcance de la web. Debe cumplir tres características fundamentales:

1. **Progressive**: Funciona en cualquier navegador, mejorando donde sea posible
2. **Confiable**: Funciona offline y en conexiones lentas
3. **Atractiva**: Sensación de app nativa con notificaciones push

### Ventajas de PWA

✅ Una única codebase (sin iOS/Android separado)
✅ Instalable desde el navegador (sin app store)
✅ Funciona offline con service workers
✅ SEO-friendly (indexable por buscadores)
✅ Actualizaciones sin fricción
✅ Menor costo de desarrollo y mantenimiento

---

## Arquitectura Fundamental

### Componentes Esenciales

```
┌─────────────────────────────────────────┐
│         PWA Architecture                │
├─────────────────────────────────────────┤
│ 1. Web App Manifest (manifest.json)     │
│ 2. Service Worker (sw.js)               │
│ 3. HTTPS (requerido)                    │
│ 4. Responsive Design                    │
│ 5. Offline Strategy (caching)           │
│ 6. Push Notifications (opcional)        │
│ 7. Background Sync (opcional)           │
└─────────────────────────────────────────┘
```

### 1. Web App Manifest

El manifest es un archivo JSON que define cómo se ve y comporta tu PWA en el dispositivo.

**Archivo: `manifest.json`**

```json
{
  "name": "Mi App Increíble",
  "short_name": "MyApp",
  "description": "Una app PWA con vibe coding",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#1976d2",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "screenshots": [
    {
      "src": "screenshots/screenshot1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

**Requisitos mínimos para Chromium (Chrome, Edge, Samsung Internet):**

- `name` o `short_name`
- `icons`: debe incluir 192px y 512px
- `start_url`
- `display` o `display_override`
- `prefer_related_applications`: debe ser `false`

### 2. Service Worker

El service worker es un **JavaScript worker** que corre en background, interceptando requests y manejando caching.

**Archivo: `service-worker.js`** (básico)

```javascript
// Instalación
const CACHE_NAME = 'pwa-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activación - limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch - responder desde cache o red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback para offline
        return caches.match('/offline.html');
      })
  );
});
```

### 3. Registro del Service Worker

**Archivo: `index.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1976d2">
  <link rel="manifest" href="manifest.json">
  <title>Mi PWA</title>
</head>
<body>
  <script>
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => console.log('SW registrado:', reg))
        .catch((err) => console.error('Error SW:', err));
    }
  </script>
</body>
</html>
```

### 4. Estrategias de Caching con Service Workers

| Estrategia | Comportamiento | Caso de Uso |
|-----------|---|---|
| **Cache First** | Busca en cache → Red | Activos estáticos (CSS, JS, imágenes) |
| **Network First** | Busca en red → Cache | Contenido dinámico (API calls) |
| **Stale-While-Revalidate** | Sirve cache + actualiza | Datos que pueden estar un poco desactualizados |
| **Cache Only** | Solo cache | Recursos que nunca cambian |
| **Network Only** | Solo red | Contenido que siempre debe ser fresco |

#### Ejemplo: Cache First (con Workbox)

```javascript
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({cacheName: 'images'})
);
```

#### Ejemplo: Network First (con Workbox)

```javascript
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new NetworkFirst({cacheName: 'api'})
);
```

---

## Pro Tips y Mejores Prácticas

### 🎯 Tip #1: Domina el Arte de los Prompts

La calidad de tu código depende de la calidad de tus prompts. Aquí está la diferencia:

**❌ MAL:**
```
"Crea un formulario de login"
```

**✅ BIEN:**
```
"Crea un formulario de login responsive con los siguientes campos:
- Email (validación de email)
- Password (mínimo 8 caracteres)
- Checkbox 'Recuérdame'
- Botón submit
- Link 'Olvidé mi contraseña'

Estilos: Usar Tailwind CSS, colores primarios azul (#1976d2) 
y blanco de fondo. El formulario debe centrado en la pantalla 
y verse bien en mobile (340px) y desktop (1200px). 
Incluir validación en tiempo real."
```

### 🎨 Tip #2: Crea un "Knowledge File"

Antes de empezar, crea un archivo de contexto que incluya:

```markdown
# Knowledge File - Mi PWA

## Visión General
- Objetivo: [Tu propósito]
- Usuario: [Descripción del usuario]
- Problemas que resuelve: [Lista]

## Especificación de Datos

### Usuarios
- ID (UUID)
- Email (único)
- Password (hash)
- Nombre completo
- Avatar URL
- Fecha creación
- Última sesión

### Tareas
- ID (UUID)
- User ID (FK)
- Título
- Descripción
- Completada (boolean)
- Prioridad (1-5)
- Fecha vencimiento
- Etiquetas (array)

## Stack Técnico
- Frontend: React 18 + TypeScript
- Estilos: Tailwind CSS
- Estado: Zustand
- API: REST con fetch
- BD: Firebase Firestore
- Almacenamiento: IndexedDB para offline

## Restricciones Técnicas
- Responsive (mobile-first)
- Español (es-ES)
- WCAG 2.2 Level AA accesibility
- Offline-first cuando sea posible
- Max bundle size: 150KB (gzip)

## Wireframe / Estructura Visual
[Aquí puedes incluir fotos o diagramas]

## Arquitectura
- Pages
- Components
- Services (API calls)
- Utils (helpers)
- Hooks (custom)
- Types (TypeScript)
```

### 📝 Tip #3: Ve Poco a Poco (Enfoque Incremental)

**Orden recomendado de desarrollo:**

1. **Fase 1: UI Base**
   - Layout principal
   - Navegación
   - Componentes estáticos

2. **Fase 2: Interactividad**
   - Estados locales
   - Formularios
   - Validaciones

3. **Fase 3: Backend**
   - API integration
   - Autenticación
   - Base de datos

4. **Fase 4: PWA Features**
   - Service worker
   - Offline support
   - Caching strategies

5. **Fase 5: Polish**
   - Performance
   - Accesibilidad
   - Responsive refinement

❌ **NO HAGAS ESTO:**
> "Crea una app completa con autenticación, base de datos, offline, push notifications y analytics"

✅ **HAZ ESTO:**
> "Crea un formulario de login con email y password"
> *[Una vez funcione]* → "Integra Firebase authentication"
> *[Una vez funcione]* → "Agrega un dashboard con datos del usuario"

### 🖼️ Tip #4: Wireframes y Diagramas

Las imágenes comunican 1000 palabras. Usa herramientas como:

- Figma (wireframes)
- Excalidraw (diagramas rápidos)
- Screenshots con anotaciones

**Herramienta útil**: Captura de pantalla + Paint/Markup con flechas y círculos

La IA entiende MUCHO mejor cuando proporciona contexto visual.

### 🧨 Tip #5: Especifica tu Estructura de Datos

Esto es **CRÍTICO**. Los modelos de IA funcionan mejor con datos bien definidos.

**EJEMPLO PARA UN APP DE GASTOS:**

```
Estructura de Datos

USUARIO:
- id: UUID
- email: string (único)
- nombre: string
- moneda_defecto: enum (USD, CLP, EUR)
- fecha_creacion: timestamp

GASTO:
- id: UUID
- usuario_id: FK a USUARIO
- cantidad: number (positivo)
- categoría: enum (comida, transporte, vivienda, etc)
- descripción: string
- fecha: date
- pagado: boolean
- etiquetas: array[string]

CATEGORÍA PRESUPUESTO:
- id: UUID
- usuario_id: FK
- categoría: string
- monto_limite: number
- periodo: enum (mensual, semanal)
```

Con esta info, la IA genera sistemas correctos la primera vez.

### 🔄 Tip #6: Analiza los Diffs (Diferencias)

Siempre revisa qué cambió. Las diferencias (diffs) te muestran exactamente qué hizo la IA.

```
Líneas rojas = eliminado
Líneas verdes = agregado
```

Estudia los cambios. Muchas veces los problemas están en el diff.

### 🔐 Tip #7: Bloquea Archivos que Funcionan

Usa esta instrucción antes de hacer cambios:

```
"No toques los archivos: utils/auth.ts, services/api.ts, 
tipos/user.types.ts"
```

O usa la función "lock files" si la herramienta la soporta (Lovable, v0).

### 🧪 Tip #8: Siempre Revisa y Valida

**REGLA DE ORO:**

```
NO CONFÍES CIEGAMENTE EN LA IA
↓
Revisa los cambios
↓
Cuestiona el razonamiento
↓
Ejecuta pruebas
↓
Acepta en pequeños bloques
```

**Cuando algo no tiene sentido:**

1. Pregunta a la IA: "¿Por qué hiciste X de esta manera?"
2. Pide que lo explique en detalle
3. Si no tiene sentido, revierte y prueba otra aproximación

### 🚀 Tip #9: Conoce Cuándo Empezar de Cero

A veces, empezar de cero es **más rápido** que arreglare un contexto corrupto.

**Señales para reiniciar:**

- La IA está en bucles infinitos
- El contexto se siente "pesado" y lento
- Los cambios están rotando sin progreso (después de 3-4 intentos)
- La IA perdió el hilo de la conversación

**Cómo reiniciar:**

1. Guarda el código funcionante
2. Revierte todos los cambios
3. Abre una sesión nueva
4. Empieza con tu Knowledge File
5. Continúa desde donde dejaste

Con la IA, reiniciar != perder horas. Probablemente llegarás más rápido.

### 📊 Tip #10: Documenta Mientras Construyes

No dejes la documentación para el final. Documenta conforme avanzas:

```javascript
/**
 * Obtiene todos los gastos del usuario
 * 
 * @param {string} usuarioId - ID del usuario
 * @param {Object} opciones - Opciones de filtrado
 * @param {string} opciones.categoria - Filtrar por categoría
 * @param {Date} opciones.desde - Fecha inicio
 * 
 * @returns {Promise<Gasto[]>} Array de gastos
 * @throws {Error} Si el usuario no existe
 */
async function obtenerGastos(usuarioId, opciones = {}) {
  // ...
}
```

---

## Stack Tecnológico Recomendado

### Frontend Frameworks (2025)

#### React 18+
- ✅ Mejor ecosistema
- ✅ Más empleos y recursos
- ✅ Adecuado para apps complejas
- ❌ Bundle más grande
- **Recomendado para:** Equipos grandes, productos complejos

#### Vue 3
- ✅ Curva de aprendizaje suave
- ✅ Documentación excelente
- ✅ Rendimiento competitivo
- ❌ Ecosistema más pequeño
- **Recomendado para:** Startups, equipos pequeños, prototipado rápido

#### Svelte 5
- ✅ Mejor rendimiento (zero-runtime)
- ✅ Bundle más pequeño
- ✅ Código más limpio
- ❌ Ecosistema emergente
- **Recomendado para:** PWA con focus en performance, dispositivos low-end

### Recomendación para PWA + Vibe Coding

**MEJOR OPCIÓN:** Svelte 5 + SvelteKit
- Compilación en build-time
- Cero runtime framework
- Excelente para PWA
- Código conciso (menos para que la IA genere)
- Bundle size pequeño

### Librerías Esenciales

| Librería | Propósito | Alternativas |
|----------|-----------|--------------|
| **Workbox** | Service workers | Manual SW |
| **Zustand** | State management | Redux, Pinia, Jotai |
| **TypeScript** | Type safety | JavaScript vanilla |
| **Tailwind CSS** | Estilos | Bootstrap, CSS-in-JS |
| **Firebase** | Backend-as-a-Service | Supabase, AWS Amplify |
| **SWR / TanStack Query** | Data fetching | Axios + manual cache |

### Base de Datos

**Para MVP/Startup:**
- **Firebase Firestore** (realtime, offline-first)
- **Supabase** (PostgreSQL, más control)

**Para Producción:**
- **PostgreSQL** + **Node.js/Python** backend
- **MongoDB** (si necesitas flexibilidad schema)

### Almacenamiento Local (Offline)

| Opción | Capacidad | Uso | Ventajas |
|--------|-----------|-----|----------|
| **localStorage** | 5-10MB | Simple key-value | Sincrónico, fácil |
| **IndexedDB** | 50MB+ | Datos complejos | Async, queries, service worker |
| **Cache API** | 500MB+ | Archivos | Específico para service workers |

**Recomendación:** IndexedDB para datos app + Cache API para assets

---

## Guía de Desarrollo Paso a Paso

### Paso 1: Definir Requisitos y Crear Knowledge File

```markdown
# PRD: Mi PWA

## Objetivo
Crear una app de gestión de tareas offline-first

## Features MVP
1. Crear tareas
2. Marcar como completadas
3. Eliminar tareas
4. Persistencia local (offline)
5. Sincronizar cuando hay conexión

## Datos Principales
- ID
- Título
- Completada
- Fecha creación

## UI
- Header simple
- Lista de tareas
- Formulario de input
```

### Paso 2: Elegir Stack y Herramienta

Para este manual, usaremos:

```
Frontend: React 18 + TypeScript
Estilos: Tailwind CSS
Estado: Zustand
Storage: IndexedDB (idb-keyval)
PWA: Workbox + Vite
Hosting: Netlify o Vercel
```

### Paso 3: Crear Proyecto Base

Si usas **Lovable** o **v0**:

```
"Crea una app React con TypeScript que sea una lista de 
tareas. Incluir:

- Header con título 'Mi Lista'
- Input para agregar tareas (con botón)
- Lista de tareas con:
  * Checkbox para completar
  * Botón delete
  * Estilos con Tailwind CSS
- Responsive design (mobile-first)
- Guardar tareas en localStorage

Use Zustand para estado. 
Colores: Azul (#1976d2) y blanco."
```

Si usas **desarrollo local** con Vite:

```bash
npm create vite@latest mi-pwa -- --template react-ts
cd mi-pwa
npm install zustand idb-keyval
npm install -D workbox-cli
npm install -D tailwindcss postcss autoprefixer
```

### Paso 4: Implementar Service Worker y PWA

Con **Workbox**:

```bash
npx workbox wizard --inDir dist --outDir dist
```

Genera el `service-worker.js` automáticamente.

### Paso 5: Testing y Validación

```javascript
// test.spec.ts
import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza lista de tareas', () => {
  render(<App />);
  expect(screen.getByRole('heading')).toHaveTextContent('Mi Lista');
});
```

### Paso 6: Deploy y Monitoreo

```bash
# Build
npm run build

# Test offline (localmente)
npm run preview

# Deploy
# Para Netlify: conectar repo de GitHub
# Para Vercel: npx vercel
```

---

## Debugging y Testing

### Debugging con Chrome DevTools

#### 1. Abrir DevTools
```
Windows/Linux: Ctrl+Shift+I
Mac: Cmd+Option+I
```

#### 2. Application Panel
- **Manifest**: Valida que esté bien configurado
- **Service Workers**: Ve el estado (installed, activating, activated)
- **Cache Storage**: Inspecciona qué está en cache
- **IndexedDB**: Revisa datos almacenados

#### 3. Testing Offline
```
DevTools → Application → Service Workers → [checkbox] Offline
```

Ahora la app funciona sin conexión.

#### 4. Testing en Red Lenta
```
DevTools → Network → Throttling → "Slow 3G"
```

Simula conexión lenta (útil para PWA).

#### 5. Lighthouse Audit
```
DevTools → Lighthouse → Selecciona categorías:
- Performance
- Accessibility  
- Best Practices
- Progressive Web App

Click "Analyze page load"
```

Genera un reporte detallado.

### Testing Automatizado

#### Ejemplo con Vitest

```typescript
// App.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('TodoApp', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
  });

  it('debería agregar una tarea', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const input = screen.getByPlaceholderText('Nueva tarea...');
    const button = screen.getByText('Agregar');
    
    await user.type(input, 'Aprender PWA');
    await user.click(button);
    
    expect(screen.getByText('Aprender PWA')).toBeInTheDocument();
  });

  it('debería marcar tarea como completada', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(checkbox).toBeChecked();
  });
});
```

### Monitoreo en Producción

Herramientas recomendadas:

- **Sentry**: Error tracking
- **LogRocket**: Session replay + analytics
- **Google Analytics**: Métricas básicas
- **Lighthouse CI**: Monitoreo de performance

---

## Deployment y Optimización

### Optimizaciones Clave

#### 1. Code Splitting

```javascript
// En React
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));

export const Router = () => (
  <Routes>
    <Route path="/dashboard" element={<Suspense fallback={<Loading />}><Dashboard /></Suspense>} />
    <Route path="/admin" element={<Suspense fallback={<Loading />}><Admin /></Suspense>} />
  </Routes>
);
```

Carga solo lo necesario cuando se necesita.

#### 2. Lazy Loading de Imágenes

```html
<img 
  src="placeholder.jpg" 
  data-src="imagen-real.jpg" 
  alt="Descripción"
  loading="lazy"
/>
```

#### 3. Optimizar Imágenes

Usar formatos modernos (WebP) con fallback:

```html
<picture>
  <source srcSet="imagen.webp" type="image/webp">
  <source srcSet="imagen.jpg" type="image/jpeg">
  <img src="imagen.jpg" alt="Descripción">
</picture>
```

#### 4. Minificación y Compresión

Con Vite (automático):

```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
}
```

#### 5. Caching Headers

Para Netlify (`_headers`):

```
/
  Cache-Control: max-age=0, must-revalidate

/assets/*
  Cache-Control: max-age=31536000, immutable

/api/*
  Cache-Control: no-cache
```

### Performance Budgets

Establece límites con `bundlebuddy.js`:

```javascript
// bundlebuddy.js
export default {
  'app.js': '150kb',
  'vendor.js': '200kb',
  'main.css': '50kb'
};
```

La CI te alertará si excedes los límites.

### Hosting Recommendations (2025)

| Plataforma | Mejor Para | Pricing |
|-----------|-----------|---------|
| **Vercel** | Next.js, apps dinámicas | Freemium ($20/user) |
| **Netlify** | Sites estáticos, JAMstack | Freemium ($19/user) |
| **Cloudflare Pages** | Performance máximo | Freemium ($200/mes) |
| **GitHub Pages** | Proyectos personales | Gratis |

**Recomendado para PWA:** Netlify o Cloudflare Pages

---

## Checklist Final

Antes de producción, valida:

### ✅ PWA Core

- [ ] `manifest.json` válido (testing con https://www.pwabuilder.com/)
- [ ] Service worker registrado y funcional
- [ ] HTTPS en producción (requerido)
- [ ] App funciona offline
- [ ] Iconos 192px y 512px
- [ ] `display: standalone` en manifest

### ✅ Performance

- [ ] Lighthouse score ≥ 90 en todos los rubros
- [ ] First Contentful Paint < 3s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.8s

### ✅ Accesibilidad

- [ ] WCAG 2.2 Level AA como mínimo
- [ ] Contraste de color ≥ 4.5:1
- [ ] Navegación por keyboard funcional
- [ ] Alt text en imágenes
- [ ] Headings jerárquicos (h1 → h2 → h3)

### ✅ Offline

- [ ] Funciona sin conexión
- [ ] Data sincroniza cuando vuelve conexión
- [ ] Mensaje claro cuando offline
- [ ] Cache strategy definida por tipo de recurso

### ✅ Seguridad

- [ ] HTTPS en todo
- [ ] Secrets no en código (variables de entorno)
- [ ] Validación en servidor (no solo cliente)
- [ ] CORS configurado correctamente
- [ ] CSP headers en producción

### ✅ Testing

- [ ] Tests unitarios > 70% coverage
- [ ] Tests de integración para flows críticos
- [ ] Testeo offline manual
- [ ] Testeo en dispositivos reales (Android + iOS)
- [ ] Testeo en redes lentas (Throttling)

### ✅ Documentation

- [ ] README con instrucciones setup
- [ ] API documentation (si hay backend)
- [ ] Guía de deployment
- [ ] Known issues / limitations
- [ ] Contributing guidelines

### ✅ Deployment

- [ ] Build size < 500KB (gzip)
- [ ] Zero downtime deploys configurado
- [ ] Rollback plan en lugar
- [ ] Monitoring en producción activo
- [ ] Error tracking (Sentry) configurado

---

## Recursos Útiles

### Herramientas

- **PWA Builder**: https://www.pwabuilder.com/
- **Workbox**: https://developers.google.com/web/tools/workbox
- **Lighthouse**: Chrome DevTools nativo
- **WAVE**: https://wave.webaim.org/ (accesibilidad)

### Documentación

- MDN PWA Guide: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- Google Developers PWA: https://developers.google.com/web/progressive-web-apps
- Service Workers: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

### Comunidades

- Stack Overflow: tag `progressive-web-apps`
- Reddit: r/webdev, r/ReactJS
- Discord: Web Development, React communities

---

## Conclusión

Las PWAs con Vibe Coding representan el **futuro del desarrollo web** en 2025. Combinan:

✨ **Velocidad de desarrollo** (IA + iteración rápida)
✨ **Experiencia de usuario** (app-like en web)
✨ **Alcance global** (distribución por URL)
✨ **Costo reducido** (una codebase)

**Recuerda los principios clave:**

1. **Prompts claros** = Mejor código
2. **Ve poco a poco** = Menos errores
3. **Especifica datos** = Mejor generación
4. **Valida siempre** = Calidad garantizada
5. **Itera rápido** = Aprende más rápido

¡A construir apps increíbles! 🚀

---

**Manual creado:** 20 de diciembre de 2025
**Versión:** 1.0
**Para actualizar:** Revisa tecnología nueva en Q1 2026
