# 📚 Índice Maestro de Documentación - Tribu Impulsa PWA

## 🎯 Documentación para Producción

### 📖 Documentos Principales

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [README.md](./README.md) | Visión general del proyecto y setup rápido | Todos |
| [ARQUITECTURA_PWA.md](./ARQUITECTURA_PWA.md) | Arquitectura completa de la aplicación (100+ páginas) | Desarrolladores |
| [ARQUITECTURA_VISUAL.md](./ARQUITECTURA_VISUAL.md) | 15 diagramas Mermaid del sistema | Desarrolladores, Product Managers |
| [GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md) | Guía completa de deployment y DevOps | DevOps, Desarrolladores |
| [CHANGELOG.md](./CHANGELOG.md) | Historial de versiones y cambios | Todos |

### 🔒 Documentos de Seguridad

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [GUIA_REORGANIZACION_SEGURIDAD.md](./GUIA_REORGANIZACION_SEGURIDAD.md) | Reorganización de archivos sensibles | DevOps, Team Leads |
| [.gitignore](./.gitignore) | Archivos bloqueados en Git | Desarrolladores |
| [env.example](./env.example) | Plantilla de variables de entorno | Desarrolladores |

### 📝 Documentos de Diseño y Mapeo

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [MAPEO_DISEÑO_ORIGINAL.md](./MAPEO_DISEÑO_ORIGINAL.md) | Referencia del diseño Monday.com | Diseñadores, Desarrolladores |
| [RESUMEN_RESTAURACION_DISEÑO.md](./RESUMEN_RESTAURACION_DISEÑO.md) | Resumen de la restauración del diseño | Team |

### 📋 Otros Documentos Públicos

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| Términos y Condiciones | Documento legal de T&C | `public/terminosycondiciones.md` |
| Política de Privacidad | Documento legal de privacidad | `public/politicasdeprivacidad.md` |
| Guía de Pruebas v0.9.1 | Checklist de testing | `public/GUIA_PRUEBAS_v0.9.1.md` |
| Instrucciones PDFs | Cómo usar docs en PDF | `public/INSTRUCCIONES_PDFS.md` |

---

## 🔐 Documentación Privada (INTERNO/)

**⚠️ IMPORTANTE:** Esta documentación NO debe subirse a GitHub

### Estructura de INTERNO/

```
INTERNO/
├── README_INTERNO.md           ← Índice de archivos privados
├── reuniones/                  ← Transcripciones de reuniones
├── backups/                    ← Respaldos de código
│   ├── respaldo-1/
│   ├── respaldo-newUX/
│   └── otros-backups/
├── credenciales/               ← Claves y credenciales
│   ├── firebase-admin-key.json
│   ├── .env.production
│   └── api-keys.txt
├── scripts-admin/              ← Scripts de administración
│   ├── reset-total-sistema.html
│   ├── cleanup-auth-orphans.html
│   ├── cleanup-duplicates-manual.html
│   └── cleanup-master.html
├── docs-internos/              ← Documentación privada
│   ├── CREDENCIALES_GUIA.md
│   ├── whoiam.md
│   ├── elevatorpitch.md
│   └── metadata.json
└── transcripciones/            ← PDFs de reuniones
    ├── TRANSCRIPCION_REUNION_PRE-ENTREGA.pdf
    └── Resumen_Ejecutivo_Reunion_Pre-Entrega.pdf
```

---

## 🗂️ Estructura del Código Fuente

### Frontend

```
src/
├── App.tsx                     ← Componente principal
├── index.tsx                   ← Entry point
├── index.css                   ← Estilos globales
├── types.ts                    ← Definiciones TypeScript
│
├── components/                 ← Componentes reutilizables
│   ├── auth/                   ← Componentes de autenticación
│   ├── layout/                 ← Layout y navegación
│   ├── common/                 ← Componentes comunes
│   ├── profile/                ← Componentes de perfil
│   └── routing/                ← Protección de rutas
│
├── screens/                    ← Pantallas principales
│   ├── auth/                   ← Login, Registro
│   ├── dashboard/              ← Dashboard
│   ├── profile/                ← Perfiles
│   ├── activity/               ← Actividad
│   ├── directory/              ← Directorio
│   ├── tribe/                  ← Mi Tribu
│   ├── benefits/               ← Beneficios
│   ├── membership/             ← Membresía
│   └── loading/                ← Pantallas de carga
│
├── services/                   ← Lógica de negocio
│   ├── authService.ts          ← Autenticación
│   ├── databaseService.ts      ← CRUD localStorage
│   ├── firebaseService.ts      ← Integración Firebase
│   ├── realUsersData.ts        ← Gestión de usuarios
│   ├── matchService.ts         ← Algoritmo de matching
│   ├── tribeService.ts         ← Lógica de Tribu
│   └── membershipCache.ts      ← Cache de membresías
│
├── contexts/                   ← React Contexts
│   └── AuthContext.tsx         ← Context de autenticación
│
├── hooks/                      ← Custom Hooks
│   ├── useAuth.ts              ← Hook de auth
│   ├── useFirebaseAuth.ts      ← Hook Firebase
│   ├── useTribe.ts             ← Hook de Tribu
│   └── useProfilesProgress.ts  ← Hook de progreso Rally
│
├── constants/                  ← Constantes y opciones
│   ├── categories.ts           ← Categorías de negocio
│   ├── affinities.ts           ← Tipos de afinidad
│   ├── geography.ts            ← Regiones y comunas Chile
│   └── beneficios.ts           ← Lista de beneficios
│
└── utils/                      ← Utilidades
    ├── storage.ts              ← Helpers de localStorage
    ├── validation.ts           ← Validaciones
    └── selectOptions.ts        ← Opciones de formularios
```

### Backend (APIs Serverless)

```
api/
├── health.ts                   ← Health check endpoint
├── create-preference.ts        ← Crear preferencia MercadoPago
├── create-subscription.ts      ← Crear suscripción
├── mercadopago-webhook.ts      ← Webhook de pagos
└── process-subscriptions.ts    ← Procesamiento de suscripciones
```

### Assets Públicos

```
public/
├── icons/                      ← Iconos PWA (varios tamaños)
├── newtribuloading.mp4         ← Video de carga
├── tribuvideo.mp4              ← Video alternativo
├── NuevoLogo.png               ← Logo con transparencia
├── tribulogo.png               ← Logo alternativo
├── favicon.png                 ← Favicon
├── manifest.json               ← PWA manifest
├── sw.js                       ← Service Worker
├── firebase-messaging-sw.js    ← Service Worker FCM
├── terminosycondiciones.md     ← T&C
└── politicasdeprivacidad.md    ← Política de privacidad
```

---

## 🎓 Guías de Aprendizaje

### Para Nuevos Desarrolladores

1. **Día 1-2:** Lectura de documentación
   - [README.md](./README.md) - Visión general
   - [ARQUITECTURA_PWA.md](./ARQUITECTURA_PWA.md) - Arquitectura completa
   - [MAPEO_DISEÑO_ORIGINAL.md](./MAPEO_DISEÑO_ORIGINAL.md) - Diseño

2. **Día 3-5:** Setup y exploración
   - Clonar repositorio
   - Configurar `.env` con [env.example](./env.example)
   - Correr app en local
   - Explorar código fuente
   - Leer [CHANGELOG.md](./CHANGELOG.md)

3. **Semana 2:** Desarrollo
   - Crear feature branch
   - Implementar pequeña feature
   - Hacer PR
   - Leer [GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md)

### Para Product Managers

1. **Documentos clave:**
   - [ARQUITECTURA_VISUAL.md](./ARQUITECTURA_VISUAL.md) - Diagramas visuales
   - [CHANGELOG.md](./CHANGELOG.md) - Historial de features
   - Roadmap en [CHANGELOG.md#unreleased](./CHANGELOG.md#unreleased)

2. **Métricas y Analytics:**
   - Dashboard en Vercel
   - Firebase Analytics
   - Google Analytics

### Para DevOps

1. **Documentos esenciales:**
   - [GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md) - Deployment
   - [GUIA_REORGANIZACION_SEGURIDAD.md](./GUIA_REORGANIZACION_SEGURIDAD.md) - Seguridad
   - [env.example](./env.example) - Variables de entorno

2. **Accesos requeridos:**
   - GitHub (repositorio)
   - Vercel (hosting)
   - Firebase (backend)
   - Stripe/MercadoPago (pagos)

---

## 📊 Diagramas Disponibles

Todos en [ARQUITECTURA_VISUAL.md](./ARQUITECTURA_VISUAL.md):

1. **Arquitectura de Alto Nivel** - Vista general del sistema
2. **Estructura de Carpetas** - Organización del proyecto
3. **Flujo de Datos Completo** - Sincronización entre capas
4. **Diagrama de Componentes** - Relaciones entre componentes React
5. **Modelo de Datos Firestore** - Esquema de base de datos
6. **Flujo de Autenticación** - Login y permisos
7. **Flujo de Usuario** - Journey map completo
8. **Ciclo de Vida de Datos** - Estado y persistencia
9. **Algoritmo de Matching** - Lógica de compatibilidad
10. **Sistema de Diseño** - Colores y componentes
11. **Métricas y Analytics** - Tracking de eventos
12. **Pipeline de Despliegue** - CI/CD
13. **Stack Tecnológico** - Mapa mental de tecnologías
14. **Roadmap** - Timeline de features
15. **Arquitectura de Red** - Infraestructura

---

## 🔍 Buscar en la Documentación

### Por Tema

**Autenticación:**
- [ARQUITECTURA_PWA.md#1️⃣-login-screen](./ARQUITECTURA_PWA.md#1️⃣-login-screen)
- [ARQUITECTURA_VISUAL.md#6-flujo-de-autenticación](./ARQUITECTURA_VISUAL.md#6-flujo-de-autenticación)
- `services/authService.ts`

**Firebase:**
- [GUIA_DESPLIEGUE.md#5-configuración-de-firebase](./GUIA_DESPLIEGUE.md#5-configuración-de-firebase)
- `services/firebaseService.ts`
- `firestore.rules`

**Matching:**
- [ARQUITECTURA_VISUAL.md#9-algoritmo-de-matching](./ARQUITECTURA_VISUAL.md#9-algoritmo-de-matching)
- `services/matchService.ts`

**Mi Tribu:**
- [ARQUITECTURA_PWA.md#9️⃣-mi-tribu](./ARQUITECTURA_PWA.md#9️⃣-mi-tribu)
- `services/tribeService.ts`
- `screens/tribe/TribeAssignmentsView.tsx`

**Seguridad:**
- [GUIA_REORGANIZACION_SEGURIDAD.md](./GUIA_REORGANIZACION_SEGURIDAD.md)
- [.gitignore](./.gitignore)

**Deployment:**
- [GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md)
- `vercel.json`

---

## 🆘 Troubleshooting

### Problema: No encuentro dónde está X feature

1. Buscar en [ARQUITECTURA_PWA.md](./ARQUITECTURA_PWA.md)
2. Revisar [ARQUITECTURA_VISUAL.md](./ARQUITECTURA_VISUAL.md) diagramas
3. Grep en el código: `grep -r "nombre-de-feature" src/`

### Problema: No sé cómo hacer deploy

1. Leer [GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md) completa
2. Seguir checklist al final del documento
3. Verificar variables de entorno con [env.example](./env.example)

### Problema: Errores de credenciales

1. Verificar `.env` existe y tiene valores
2. Comparar con [env.example](./env.example)
3. En producción, verificar variables en Vercel

### Problema: Cambios no se reflejan en producción

1. Verificar build exitoso en Vercel
2. Limpiar cache del navegador (Ctrl+Shift+R)
3. Verificar que los cambios están en rama `main`

---

## 📞 Contactos

### Equipo

- **Product Manager:** Dafna Finkelstein
- **CEO:** Doraluz
- **Lead Developer:** [Tu nombre]

### Soporte Técnico

- **GitHub Issues:** [Repo Issues](https://github.com/tu-usuario/tribu-impulsa/issues)
- **Email:** soporte@tribuimpulsa.cl
- **Discord:** (Si existe)

### Servicios Externos

- **Vercel Support:** https://vercel.com/support
- **Firebase Support:** https://firebase.google.com/support
- **Stripe Support:** https://support.stripe.com

---

## 🔄 Mantener Documentación Actualizada

### Al agregar nueva feature:

1. ✅ Actualizar [CHANGELOG.md](./CHANGELOG.md)
2. ✅ Agregar sección en [ARQUITECTURA_PWA.md](./ARQUITECTURA_PWA.md)
3. ✅ Crear diagrama en [ARQUITECTURA_VISUAL.md](./ARQUITECTURA_VISUAL.md) (si aplica)
4. ✅ Actualizar este índice si es necesario

### Al hacer deploy:

1. ✅ Actualizar versión en [CHANGELOG.md](./CHANGELOG.md)
2. ✅ Tag en Git: `git tag v0.9.1`
3. ✅ Push tags: `git push --tags`

### Cada mes:

1. ✅ Revisar y actualizar toda la documentación
2. ✅ Verificar que links funcionan
3. ✅ Actualizar capturas de pantalla (si aplica)
4. ✅ Rotar credenciales (si es necesario)

---

**Documento creado:** Diciembre 2024  
**Versión:** v0.9.1  
**Última actualización:** 25 Dic 2024  
**Mantenido por:** Team Tribu Impulsa

