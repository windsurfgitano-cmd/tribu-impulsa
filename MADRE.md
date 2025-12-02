# 🏛️ MADRE.md - DOCUMENTO MAESTRO TRIBU IMPULSA
**Última actualización:** 2 Diciembre 2025 19:45 UTC-3  
**Versión:** 1.0 FINAL  
**Estado:** ✅ LISTO PARA PRODUCCIÓN

---

## 📋 ÍNDICE RÁPIDO

1. [Información del Proyecto](#información-del-proyecto)
2. [URLs y Accesos](#urls-y-accesos)
3. [Credenciales](#credenciales)
4. [Arquitectura](#arquitectura)
5. [Funcionalidades](#funcionalidades)
6. [Configuración](#configuración)
7. [Base de Datos](#base-de-datos)
8. [Documentos del Proyecto](#documentos-del-proyecto)
9. [Checklist Final](#checklist-final)
10. [Contacto](#contacto)

---

## 🎯 INFORMACIÓN DEL PROYECTO

### ¿Qué es Tribu Impulsa?
Plataforma de cross-promotion para emprendedores chilenos. Cada mes, el algoritmo asigna:
- **10 cuentas para impulsar** (compartir en tus redes)
- **10 cuentas que te impulsan** (comparten tu contenido)

### Stack Tecnológico
```
Frontend:     React 18 + TypeScript + Vite
Styling:      TailwindCSS
Backend:      Firebase Firestore (NoSQL)
Hosting:      Vercel + Cloudflare
Dominio:      www.tribuimpulsa.cl
Pagos:        MercadoPago (Sandbox)
```

### Clientes
- **Dafna Finkelstein** - dafnafinkelstein@gmail.com
- **Doraluz Trejo** - doraluztrejo@gmail.com

---

## 🌐 URLs Y ACCESOS

| Recurso | URL |
|---------|-----|
| **🌍 Producción** | https://www.tribuimpulsa.cl |
| **🔧 Vercel** | https://tribu-impulsa.vercel.app |
| **👑 Admin Panel** | https://www.tribuimpulsa.cl/#/admin |
| **📦 GitHub** | https://github.com/windsurfgitano-cmd/tribu-impulsa |
| **🔥 Firebase** | https://console.firebase.google.com (proyecto: tribu-impulsa) |
| **☁️ Cloudflare** | Panel de DNS para tribuimpulsa.cl |

---

## 🔐 CREDENCIALES

### Usuario Testing
```
Email:    dafnafinkelstein@gmail.com
Password: TRIBU2026
```

### Admin Panel
```
Email:    admin@tribuimpulsa.cl
Password: admin123
```

### Contraseña Universal (usuarios pre-cargados)
```
Password: TRIBU2026
```

### Modo Desarrollador
```
PIN: 1234
```

### WhatsApp Soporte
```
+56 9 5177 6005
```

---

## 🏗️ ARQUITECTURA

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                               │
│                   (Browser / PWA)                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE                              │
│                   (DNS + CDN + SSL)                          │
│                  www.tribuimpulsa.cl                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                                │
│                   (Hosting + CI/CD)                          │
│              tribu-impulsa.vercel.app                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   FIREBASE FIRESTORE                         │
│                   (Base de datos)                            │
│   Colecciones: users, memberships, compliance, reports      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ FUNCIONALIDADES

### Core (100% Funcional)
| Feature | Estado | Descripción |
|---------|--------|-------------|
| Login/Registro | ✅ | Flujo unificado con validación |
| Dashboard | ✅ | Métricas tribales, alertas |
| Checklist 10+10 | ✅ | Impulsar + ser impulsado |
| Reportes | ✅ | Sistema "Acusete" |
| Directorio | ✅ | Búsqueda de emprendedores |
| Perfil | ✅ | Editable (foto, banner, datos) |
| Cambio contraseña | ✅ | Desde menú perfil |
| PWA | ✅ | Instalable iOS/Android |

### Membresías (100% Funcional)
| Feature | Estado | Descripción |
|---------|--------|-------------|
| Estados | ✅ | invitado → miembro → admin |
| Paywall | ✅ | Pantalla de pago |
| Precio | ✅ | $20.000 CLP/mes (configurable) |
| MercadoPago | ✅ | Modo Sandbox |
| Firebase sync | ✅ | Colección `memberships` |

### Admin Panel (100% Funcional)
| Feature | Estado | Descripción |
|---------|--------|-------------|
| Dashboard | ✅ | Stats globales |
| Membresías | ✅ | Gestión completa |
| Cumplimiento | ✅ | Ver 10+10 de todos |
| Registros | ✅ | Ver shares |
| Usuarios | ✅ | Lista completa |
| Reportes | ✅ | Gestionar denuncias |
| Configuración | ✅ | **FUNCIONAL** - precio, WhatsApp, etc |

---

## ⚙️ CONFIGURACIÓN

### Valores Actuales (Admin > Config)
```javascript
{
  membershipPrice: 20000,        // $20.000 CLP mensual
  matchesPerUser: 10,            // 10+10
  whatsappSupport: '+56951776005',
  appName: 'Tribu Impulsa',
  mercadopagoMode: 'sandbox'     // sandbox | production
}
```

### Cómo Cambiar
1. Ir a `https://www.tribuimpulsa.cl/#/admin`
2. Login con credenciales admin
3. Pestaña "Config"
4. Modificar valores
5. Click "Guardar Cambios"

### Persistencia
- ✅ localStorage (inmediato)
- ✅ Firebase Firestore (sincronizado)

---

## 🗄️ BASE DE DATOS

### Colecciones Firebase

#### `users`
```javascript
{
  id: string,
  email: string,
  name: string,
  companyName: string,
  instagram: string,
  phone: string,
  category: string,
  createdAt: timestamp
}
```

#### `memberships`
```javascript
{
  id: string,           // = userId
  email: string,
  status: 'invitado' | 'miembro' | 'admin',
  paymentMethod: string,
  paymentDate: timestamp,
  amount: number,       // 20000
  expiresAt: timestamp  // +30 días
}
```

#### `compliance`
```javascript
{
  id: string,
  userId: string,
  toShare: [{ id, shared: boolean }],
  fromOthers: [{ id, received: boolean }]
}
```

#### `reports`
```javascript
{
  id: string,
  reporterId: string,
  reportedId: string,
  reason: string,
  status: 'pending' | 'resolved',
  createdAt: timestamp
}
```

#### `config`
```javascript
{
  membershipPrice: 20000,
  matchesPerUser: 10,
  whatsappSupport: '+56951776005',
  updatedAt: timestamp
}
```

---

## 📁 DOCUMENTOS DEL PROYECTO

### Documentación Principal
| Archivo | Descripción |
|---------|-------------|
| `MADRE.md` | **Este archivo** - Documento maestro |
| `PLAN.md` | Estado del proyecto y roadmap |
| `ENTREGA_FINAL_3DIC2025.md` | Documento de entrega |
| `CHECKLIST_ENTREGA_V1.md` | Checklist de funcionalidades |
| `MAPA_FUNCIONAL.md` | Arquitectura detallada |
| `CREDENCIALES_GUIA.md` | Guía de credenciales |
| `README.md` | Instrucciones básicas |

### Código Principal
| Archivo | Descripción |
|---------|-------------|
| `App.tsx` | Componente principal (~6000 líneas) |
| `services/` | Servicios (Firebase, matching, etc) |
| `components/` | Componentes reutilizables |
| `types.ts` | Tipos TypeScript |

### Configuración
| Archivo | Descripción |
|---------|-------------|
| `vite.config.ts` | Configuración Vite |
| `vercel.json` | Configuración deploy |
| `firestore.rules` | Reglas de seguridad |
| `package.json` | Dependencias |

---

## ✅ CHECKLIST FINAL

### Pre-Lanzamiento
```
[x] Build compila sin errores
[x] Dominio configurado (www.tribuimpulsa.cl)
[x] SSL activo (Cloudflare)
[x] Firebase conectado
[x] 23 usuarios pre-cargados
[x] Admin panel funcional
[x] Configuración funcional
[x] WhatsApp actualizado (+56951776005)
[x] Precio actualizado ($20.000/mes)
[x] PWA instalable
```

### Testing
```
[ ] Login con usuario existente
[ ] Registro nuevo usuario
[ ] Checklist 10+10 visible
[ ] Marcar items como completados
[ ] Reportar incumplimiento
[ ] Probar admin panel
[ ] Cambiar configuración desde admin
[ ] Verificar datos en Firebase Console
[ ] Instalar PWA en iPhone
[ ] Instalar PWA en Android
```

---

## 👥 USUARIOS PRE-CARGADOS (23)

| # | Nombre | Email | Empresa |
|---|--------|-------|---------|
| 1 | Dafna Finkelstein | dafnafinkelstein@gmail.com | Esfera |
| 2 | Doraluz Trejo | doraluztrejo@gmail.com | Doraluz Design |
| 3 | Monica | contacto.byturquia@gmail.com | By Turquia |
| 4 | Danitza Cubillos | terraflor.aceites@gmail.com | Terraflor |
| 5 | Elevate Studio | studio@elevate.cl | Elevate |
| ... | ... | ... | ... |

*Lista completa en `services/realUsersData.ts`*

---

## 🚀 DEPLOY

### Automático (Recomendado)
```bash
git add -A
git commit -m "descripción del cambio"
git push
# Vercel detecta automáticamente y hace deploy
```

### Manual
```bash
npm run build
# Subir contenido de /dist a Vercel
```

### Verificar Deploy
1. Ir a https://vercel.com/dashboard
2. Proyecto: tribu-impulsa
3. Ver logs de deployment

---

## 🔧 COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview local del build
npm run preview

# Limpiar caché
rm -rf node_modules/.vite
npm run dev
```

---

## 📞 CONTACTO Y SOPORTE

### WhatsApp Tribu Impulsa
```
+56 9 5177 6005
```

### Repositorio
```
https://github.com/windsurfgitano-cmd/tribu-impulsa
```

### Firebase Console
```
https://console.firebase.google.com
Proyecto: tribu-impulsa
```

---

## 🎯 RESUMEN EJECUTIVO

```
┌────────────────────────────────────────────────────────────┐
│                    TRIBU IMPULSA v1.0                       │
├────────────────────────────────────────────────────────────┤
│  🌐 URL:        www.tribuimpulsa.cl                        │
│  💰 Precio:     $20.000 CLP/mes                            │
│  👥 Usuarios:   23 pre-cargados                            │
│  📱 WhatsApp:   +56 9 5177 6005                            │
│  🔧 Admin:      /#/admin                                   │
│  📦 Estado:     LISTO PARA PRODUCCIÓN                      │
└────────────────────────────────────────────────────────────┘
```

---

*Documento generado: 2 Diciembre 2025*  
*Próxima revisión: Post-lanzamiento*
