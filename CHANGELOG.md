# 📝 Changelog - Tribu Impulsa PWA

Todos los cambios notables del proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Planificado para v1.0.0
- Chat directo entre usuarios
- Video llamadas 1:1
- Panel de analytics mejorado
- Más beneficios en Club Bienestar
- App móvil nativa (iOS/Android)

---

## [0.9.1] - 2024-12-25

### 🔒 Seguridad
- **CRÍTICO:** Reorganización completa de archivos sensibles
- Actualización de `.gitignore` para proteger credenciales
- Creación de carpeta `INTERNO/` para archivos privados
- Documentación de seguridad y recuperación de desastres
- Guía de regeneración de credenciales comprometidas

### 📚 Documentación
- Creación de `ARQUITECTURA_PWA.md` (100+ páginas)
- Creación de `ARQUITECTURA_VISUAL.md` con 15 diagramas Mermaid
- Creación de `GUIA_DESPLIEGUE.md` completa
- Creación de `GUIA_REORGANIZACION_SEGURIDAD.md`
- Creación de `env.example` como plantilla
- Creación de este `CHANGELOG.md`

### 🐛 Fixes
- Fix: Login con emails existentes ahora funciona correctamente
- Fix: Búsqueda case-insensitive en Firebase
- Fix: Validación geográfica para NACIONAL/REGIONAL/LOCAL
- Fix: Auto-formateo de campos (Instagram @, teléfono +569, website https://)
- Fix: Onboarding solo aparece una vez por usuario
- Fix: Logout limpia correctamente toda la sesión
- Fix: Sincronización completa Firebase Auth + Firestore

### ✨ Mejoras
- Mejora: Contador Rally en tiempo real con listener Firebase
- Mejora: Emails ahora son únicos (validación en registro)
- Mejora: Botón secreto de reset protegido con contraseña
- Mejora: Optimización para iPhone 14 Pro Max (safe areas, DPI)
- Mejora: Mobile debugging con Eruda integrado
- Mejora: Limpieza automática de duplicados y perfiles incompletos

---

## [0.9.0] - 2024-12-20

### ✨ Nuevas Funcionalidades
- Sistema Rally 1000 completamente funcional
- Mi Tribu con asignación automática de 8 emprendedores
- Rotación mensual de Tribu (cada 1° de mes)
- Sistema de tareas y puntos para Mi Tribu
- Match Analysis con IA (Azure OpenAI + fallback local)
- Club Bienestar con beneficios exclusivos
- Membresía Trial ($1 por 7 días)
- Integración completa con Stripe/MercadoPago
- Notificaciones push con Firebase Cloud Messaging

### 🎨 UI/UX
- Diseño Monday.com restaurado completamente
- Bottom navigation con 6 tabs (incluye Mi Tribu)
- Animaciones de carga con video personalizado
- Cards con glass morphism y elevación
- Paleta de colores moderna (#6161FF primary)
- Safe areas para iPhone con Dynamic Island
- PWA optimizada para instalación

### 🏗️ Arquitectura
- Modularización completa del código
- Separación en screens/ components/ services/
- Sistema offline-first con localStorage
- Sincronización bidireccional con Firestore
- Service Worker para cache y offline
- React Router v6 con rutas protegidas

### 🔧 Técnico
- React 18 con TypeScript
- Vite como bundler
- Tailwind CSS v4
- Firebase Auth + Firestore + FCM
- Vercel hosting
- GitHub Actions CI/CD

---

## [0.8.0] - 2024-12-10

### ✨ Nuevas Funcionalidades
- Registro de usuarios con perfil completo
- Login con email/password
- Validación geográfica (Nacional/Regional/Local)
- Sistema de categorías y afinidades
- Perfiles básicos con bio y redes sociales
- Directory para explorar usuarios
- Activity feed con notificaciones
- Estado de membresía (Free/Trial/Premium)

### 🐛 Fixes
- Fix: Validación de campos en registro
- Fix: Persistencia de sesión
- Fix: Carga de usuarios desde Firebase

---

## [0.7.0] - 2024-12-01

### ✨ Nuevas Funcionalidades
- Integración inicial con Firebase
- Autenticación básica
- Base de datos Firestore
- Estructura de proyecto inicial

### 🏗️ Arquitectura
- Setup inicial con Vite + React
- Configuración de TypeScript
- Configuración de Tailwind CSS
- Estructura de carpetas básica

---

## [0.6.0] - 2024-11-20

### 📚 Planificación
- Definición de MVP
- Diseño de flujos de usuario
- Wireframes básicos
- Especificación de features

---

## [0.5.0] - 2024-11-10

### 🎯 Concepto
- Idea inicial: Red de emprendedores
- Rally de 1000 perfiles
- Sistema de matching
- Gamificación con Mi Tribu

---

## Tipos de Cambios

- **Added** (✨): Nuevas funcionalidades
- **Changed** (🔄): Cambios en funcionalidades existentes
- **Deprecated** (⚠️): Funcionalidades que se eliminarán
- **Removed** (🗑️): Funcionalidades eliminadas
- **Fixed** (🐛): Corrección de bugs
- **Security** (🔒): Cambios de seguridad

---

## Versionado

Este proyecto usa [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

MAJOR: Cambios incompatibles en la API
MINOR: Nuevas funcionalidades compatibles
PATCH: Correcciones de bugs compatibles
```

Ejemplos:
- `0.9.0` → `0.9.1`: Bug fixes
- `0.9.1` → `0.10.0`: Nuevas features
- `0.10.0` → `1.0.0`: Lanzamiento oficial

---

## Links

- [Repositorio GitHub](https://github.com/tu-usuario/tribu-impulsa)
- [Sitio en Producción](https://www.tribuimpulsa.cl)
- [Documentación](./README.md)
- [Guía de Contribución](./CONTRIBUTING.md)

---

**Última actualización:** 25 Diciembre 2024

