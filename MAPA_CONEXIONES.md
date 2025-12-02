# 🔗 MAPA DE CONEXIONES - TRIBU IMPULSA
**Última actualización:** 2 Diciembre 2025

---

## 📊 FLUJO DE DATOS DE MEMBRESÍAS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ADMIN PANEL                                    │
│                    (/#/admin > Membresías)                               │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  MembershipAdminTab                                                 │ │
│  │  - Carga datos desde Firebase (fuente de verdad)                   │ │
│  │  - Sincroniza a localStorage automáticamente                       │ │
│  │  - Muestra stats: miembros, invitados, ingresos                    │ │
│  │  - Usa getAppConfig().membershipPrice para cálculos                │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              │                                           │
│                              ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  changeMembershipStatus(userId, 'miembro' | 'invitado' | 'admin')  │ │
│  │                                                                     │ │
│  │  1. localStorage.setItem(`membership_status_${userId}`, status)    │ │
│  │  2. localStorage.setItem(`membership_payment_${userId}`, {...})    │ │
│  │     O localStorage.removeItem (si se revoca)                       │ │
│  │  3. Firebase: setDoc(db, 'memberships', userId, {...})             │ │
│  │  4. setMemberships(prev => {...}) // UI inmediata                  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ SINCRONIZACIÓN
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        FIREBASE FIRESTORE                                │
│                    (Colección: memberships)                              │
│                                                                          │
│  Documento: {userId}                                                     │
│  {                                                                       │
│    id: string,                                                           │
│    email: string,                                                        │
│    status: 'invitado' | 'miembro' | 'admin',                            │
│    paymentMethod: string | null,                                         │
│    paymentDate: timestamp | null,                                        │
│    amount: number | null,        // Usa getAppConfig().membershipPrice  │
│    expiresAt: timestamp | null,  // +30 días desde pago                 │
│    updatedBy: 'admin' | 'user',                                         │
│    updatedAt: timestamp                                                  │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ LECTURA AL CARGAR
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        PERFIL USUARIO                                    │
│                  (MembershipSection component)                           │
│                                                                          │
│  1. Lee localStorage primero (cache rápido)                              │
│  2. Consulta Firebase (fuente de verdad)                                │
│  3. Si Firebase tiene datos → sincroniza a localStorage                 │
│  4. Muestra estado actualizado                                          │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Si status = 'miembro' o 'admin':                                   │ │
│  │  - Muestra "Miembro Activo" / "Administrador"                       │ │
│  │  - Fecha de pago, método, monto, vencimiento                        │ │
│  │  - Advertencia si vence en < 30 días                                │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Si status = 'invitado':                                            │ │
│  │  - Muestra "Invitado"                                               │ │
│  │  - Botón "Activar Membresía - $XX.XXX/mes"                          │ │
│  │  - Precio viene de getAppConfig().membershipPrice                   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ FLUJO DE CONFIGURACIÓN

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       ADMIN > CONFIG                                     │
│                   (AdminSettingsTab)                                     │
│                                                                          │
│  Campos:                                                                 │
│  - membershipPrice: 20000 (CLP mensual)                                 │
│  - matchesPerUser: 10 (algoritmo 10+10)                                 │
│  - whatsappSupport: '+56951776005'                                      │
│  - appName: 'Tribu Impulsa'                                             │
│  - mercadopagoMode: 'sandbox' | 'production'                            │
│                                                                          │
│  Al guardar:                                                             │
│  1. localStorage.setItem('tribu_admin_config', JSON.stringify(config))  │
│  2. Firebase: setDoc(db, 'config', 'app_settings', config)              │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     getAppConfig()                                       │
│            (Función global en App.tsx)                                   │
│                                                                          │
│  Lee localStorage.getItem('tribu_admin_config')                         │
│  Devuelve configuración con valores por defecto si no existe            │
│                                                                          │
│  Usado en:                                                               │
│  ├── MembershipScreen → Precio de pago                                  │
│  ├── MembershipSection → Precio en botón "Activar Membresía"            │
│  ├── MembershipAdminTab → Cálculo de ingresos                           │
│  ├── AdminSettingsTab → Valores iniciales del formulario                │
│  └── WhatsAppFloat → Número de WhatsApp                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💳 FLUJO DE PAGO

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PANTALLA DE PAGO                                     │
│                   (MembershipScreen)                                     │
│                                                                          │
│  1. Lee precio: getAppConfig().membershipPrice                          │
│  2. Muestra: "$20.000/mes"                                              │
│  3. Usuario selecciona método (MercadoPago simulado)                    │
│  4. Al "pagar":                                                          │
│     a. localStorage.setItem(`membership_status_${userId}`, 'miembro')   │
│     b. localStorage.setItem(`membership_payment_${userId}`, {           │
│          method: 'mercadopago_sandbox',                                 │
│          amount: PRICE,  // de getAppConfig()                           │
│          date: now,                                                      │
│          expiresAt: now + 30 días                                       │
│        })                                                                │
│     c. Firebase: setDoc(db, 'memberships', userId, {...})               │
│  5. Redirige a /searching → /dashboard                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 SINCRONIZACIÓN BIDIRECCIONAL

### Admin → Usuario
```
Admin cambia status de "Mad Support" a "invitado"
    │
    ├── 1. localStorage actualizado inmediatamente
    │
    ├── 2. Firebase actualizado (status: 'invitado', amount: null, etc)
    │
    └── 3. Cuando Mad Support abre su perfil:
           - MembershipSection lee Firebase
           - Sobrescribe localStorage
           - Muestra "Invitado" con botón para activar
```

### Usuario → Admin
```
Usuario paga membresía
    │
    ├── 1. localStorage actualizado
    │
    ├── 2. Firebase actualizado
    │
    └── 3. Cuando Admin abre panel de membresías:
           - MembershipAdminTab lee Firebase
           - Muestra nuevo miembro activo
           - Ingresos actualizados
```

---

## 📱 LUGARES DONDE SE USA EL PRECIO

| Componente | Uso | Fuente |
|------------|-----|--------|
| `MembershipScreen` | Mostrar precio de pago | `getAppConfig().membershipPrice` |
| `MembershipSection` | Botón "Activar Membresía - $X/mes" | `getAppConfig().membershipPrice` |
| `MembershipAdminTab` | Cálculo de ingresos totales | `getAppConfig().membershipPrice` |
| `AdminSettingsTab` | Campo de configuración | localStorage |
| Firebase | Guardado en membresía | Valor al momento del pago |

---

## 🔥 COLECCIONES FIREBASE

| Colección | Documento | Propósito |
|-----------|-----------|-----------|
| `users` | `{userId}` | Datos del usuario |
| `memberships` | `{userId}` | Estado de membresía |
| `compliance` | `{date}_{userId}` | Cumplimiento 10+10 |
| `reports` | `{timestamp}_{reporterId}` | Reportes "Acusete" |
| `config` | `app_settings` | Configuración global |

---

## ✅ VERIFICACIÓN DE CONEXIONES

```
[x] Admin cambia membresía → Firebase actualizado
[x] Admin cambia membresía → localStorage actualizado
[x] Admin cambia membresía → UI actualizada inmediatamente
[x] Usuario abre perfil → Lee Firebase (fuente de verdad)
[x] Usuario abre perfil → Sincroniza a localStorage
[x] Revocar membresía → Limpia datos de pago
[x] Precio viene de configuración → No hardcodeado
[x] WhatsApp viene de configuración → No hardcodeado
```

---

*Documento generado: 2 Diciembre 2025*
