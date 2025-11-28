# Plan y Mejoras – Tribu Impulsa

> Documento consolidado con información de reuniones (17-nov, 25-nov) y base de datos de usuarios/pymes.

---

## 1. Contexto del Proyecto

### 1.1 Qué es Tribu Impulsa
Plataforma de **economía colaborativa** para emprendedores chilenos que automatiza el cross-promotion mensual en redes sociales (principalmente Instagram). Cada mes el sistema genera **matches individuales** (no grupos cerrados) basados en afinidad y sin cruzar competencia directa.

### 1.2 Problema que Resuelve
- Grupos cerrados de 10 personas que limitan exposición.
- Gestión manual inescalable (planillas Excel, WhatsApp).
- Falta de control sobre quién cumple las publicaciones cruzadas.
- Bloqueo excesivo entre emprendedores del mismo rubro amplio.

### 1.3 Stakeholders Clave
| Rol | Nombre | Contacto |
| --- | --- | --- |
| Fundadora / Visión | Dafna Finkelstein | @byturquia |
| Fundadora / Comercial | Doraluz Galleguillos | @Terraflorpaisajismochile |
| Operaciones / Coach | Guillermo García | @pausacoaching |
| Desarrollo / Técnico | Óscar | — |

---

## 2. Entregable Principal: PWA Standalone

### 2.1 Alcance MVP
| Módulo | Descripción | Estado |
| --- | --- | --- |
| **Login / Auth** | Magic link por correo + futuro App Bridge Shopify | Pendiente backend |
| **Registro único** | Wizard gamificado con barra de progreso, validaciones y persistencia | En App.tsx |
| **Encuesta obligatoria** | Captura rubro, afinidad, alcance, ingresos, redes | En App.tsx |
| **Algoritmo Tómbola** | Genera 10+10 matches por usuario cada mes | Mock en matchService |
| **Dashboard tribal** | Tarjetas glass con razones de afinidad, WhatsApp, perfil | Funcional |
| **Checklist 10+10** | Marcar cumplimiento + botón "acusete" | Funcional |
| **Métricas** | Completados, pendientes, reportes, última sincronización | Funcional |
| **PWA** | Manifest, service worker, instalable | Pendiente config |

### 2.2 Autenticación
- **Standalone**: Magic link enviado al correo del usuario.
- **Shopify embebido**: App Bridge + OAuth para autologin con sesión del merchant.
- **Base de datos**: Guardar `{shop_id, email, encuesta}` para reutilizar en ambos modos.

### 2.3 Modelo de Datos de Usuario
Campos principales extraídos del CSV (`export_vista_usuario_pyme_full-6.csv`, 117 registros):

| Campo | Descripción |
| --- | --- |
| `correo` | Identificador único |
| `nombre_completo` | Nombre del fundador |
| `nombre_emprendimiento_pyme` | Marca / negocio |
| `usuario_instagram` | Handle IG (debe ser público) |
| `telefono` | WhatsApp de contacto |
| `rubro_principal` | Código numérico de familia |
| `familia_principal` | Código numérico de categoría madre |
| `segunda_familia_flag` | 0/1 si tiene segunda afinidad |
| `segunda_familia` | Código de segunda familia |
| `segundo_rubro` | Código de segundo rubro |
| `intereses` | Lista separada por guiones (bienestar, moda, gastronomía, etc.) |
| `seguidores_instagram` | Rango aproximado |
| `frecuencia_instagram` | diario / 1_2_semana / 3_4_semana / ocasional |
| `experiencia_colab` | frecuente / ocasional / aprender |
| `compromiso_publicaciones` | si / recordatorio |
| `objetivos` | ventas / visibilidad / networking / colaboraciones |

#### Estadísticas rápidas
- **Total registros**: 117
- **Perfiles completos** (con rubro y afinidad): ~25
- **Pre-registros incompletos**: ~92
- **Orígenes**: Google Form, Referido, Instagram, Otro

---

## 3. Lógica del Algoritmo "Tómbola"

### 3.1 Doble Taxonomía
1. **Árbol Producto/Servicio** (Familia → Rubro → Subcategoría)
   - Ej: Moda Mujer → Textil → Jeans, Ropa deportiva, Vestidos de fiesta…
2. **Árbol Estilo de Vida / Afinidad**
   - Ej: Bienestar, Aire libre, Moda y diseño, Sustentabilidad, Mascotas…

### 3.2 Reglas de Match
| Regla | Comportamiento |
| --- | --- |
| **Coincidencia en subcategoría** | 🔴 Bloqueo total (competencia directa) |
| **Mismo rubro, distinta subcategoría** | 🟡 Permitido si hay afinidad compartida |
| **Distinto rubro + afinidad compartida** | 🟢 Match ideal |

### 3.3 Salida Mensual
Cada usuario recibe:
- **10 cuentas a quienes debe compartir** (obligación).
- **10 cuentas que lo compartirán** (beneficio).

El corte se ejecuta el último día del mes y se publica el día 1.

### 3.4 Sistema de Cumplimiento ("Acusete")
- Checklist interactivo en la PWA.
- Botón de reporte si la contraparte no cumplió antes del día 20.
- Alertas/recordatorios automáticos.
- Sanción: expulsión temporal o permanente según reincidencia.

---

## 4. Mejoras de UX/UI Solicitadas

### 4.1 Paleta de Colores
Se pidió rediseño inspirado en **monday.com** (colorida, lúdica, fondo blanco) en lugar del verde oscuro actual (`#022c22`).

| Token | Hex | Uso |
| --- | --- | --- |
| `danger` | `#FB275D` | Reportes, stuck |
| `warning` | `#FFCC00` | Pendientes, working on it |
| `success` | `#00CA72` | Completados, done |
| `accent` | `#6161FF` | Links, gráficos tech |
| `dark` | `#181B34` | Fondos hero, nav |
| `text` | `#434343` | Texto primario |

> Documentación completa con shades en `design/color-palette.md`.

### 4.2 Gamificación del Registro
- Barra de progreso visual.
- Mensajes educativos (ej. "Tu Instagram debe ser público").
- Lucecitas / animaciones al completar cada paso.
- Formulario único (no dos formularios separados).

### 4.3 Contenido Educativo (Biblioteca de Cápsulas)
Formato estilo **Domestika**: videos horizontales de 10-15 min con alta producción.

| # | Tema | Experto sugerido |
| --- | --- | --- |
| 1 | Estrategia de marketing | Guillermo |
| 2 | Contenido que vende | Guillermo / Otro |
| 3 | Finanzas para emprendedores | Abraham (Lofwork) |
| 4 | Órdenes tributarios y financieros | Contador externo |
| 5 | Cómo fijar precios | Por definir |
| 6 | Formar y liderar equipos pequeños | Por definir |
| 7 | Retener clientes y convertirlos en promotores | Por definir |
| 8 | Qué es un CRM y cómo usarlo | Por definir |
| 9 | Planificar el mes y administrar el tiempo | Por definir |
| 10 | Mentalidad emprendedora | Coaching / Nati |

---

## 5. Integraciones Clave

| Integración | Descripción | Prioridad |
| --- | --- | --- |
| **WhatsApp Business** | Botón flotante para soporte inmediato | Alta |
| **Shopify App Bridge** | Autologin + lectura de contexto de tienda | Alta |
| **Fintoc / Mercado Pago** | Pasarela de suscripción (20k CLP/mes o anual con descuento) | Media |
| **Instagram API** | Verificar que el perfil sea público, extraer seguidores | Baja (futuro) |

---

## 6. Alianzas Estratégicas en Curso

| Alianza | Estado | Potencial |
| --- | --- | --- |
| **Municipalidad** | Convenio por firmar | 2,500 leads calientes |
| **Santander Academy** | Reunión agendada con director | Certificación gratuita para emprendedores |
| **Casas colaborativas** | Interés confirmado | ~150 emprendedores c/u |

Meta año 1: **4,000 usuarios activos**.

---

## 7. Roadmap de Entrega

### Fase 1 – MVP Standalone (Dic 2025)
| Día | Actividades |
| --- | --- |
| 1 | Estabilizar matches, preparar hook `useMatches`, validar wizard |
| 2 | Implementar validaciones, persistir perfil, guardar encuesta |
| 3 | Aplicar nueva paleta de colores, configurar PWA (manifest, SW) |
| 4 | Integrar magic link básico, QA, demo para Santander |

### Fase 2 – Backend & Auth (Ene 2026)
- Desplegar API REST o serverless (Supabase / Firebase / custom).
- Migrar mocks a base de datos real.
- Implementar OAuth Shopify + App Bridge.
- Pasarela de pagos (suscripción).

### Fase 3 – Escala & IA (Feb-Mar 2026)
- Entrenar modelo de vectorización con datos reales.
- Mapas de calor y auditoría de matches.
- Automatización de ingesta (bot IG).
- Biblioteca de cápsulas educativas.

---

## 8. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| Datos incompletos en CSV | Matches de baja calidad | Onboarding obligatorio con validaciones |
| Deadline Navidad muy ajustado | MVP incompleto | Priorizar checklist 10+10 + login |
| Usuarios no cumplen publicaciones | Deserción | Sistema "acusete" + recordatorios |
| Competencia directa mal bloqueada | Conflictos entre emprendedores | Revisar taxonomía con fundadoras |

---

## 9. Acciones Inmediatas

- [ ] **Aplicar paleta monday.com** a `App.tsx` (reemplazar `#022c22` y emeralds).
- [ ] **Configurar PWA**: `vite-plugin-pwa`, manifest.json, iconos.
- [ ] **Crear endpoint magic link** (puede ser mock inicial).
- [ ] **Importar CSV** a servicio mock para matches reales.
- [ ] **Preparar demo visual** para reunión Santander (miércoles próximo).
- [ ] **Definir formato de cápsulas** y guion base para expertos.

---

## 10. Archivos de Referencia

| Archivo | Contenido |
| --- | --- |
| `REUNIONES/WhatsApp Audio 2025-11-17...analysis.md` | Análisis reunión inicial (problema, solución, plazos) |
| `REUNIONES/WhatsApp-Audio-2025-11-25-at-3.43.23-PM_analysis (1).md` | Análisis detallado algoritmo y doble taxonomía |
| `REUNIONES/WhatsApp-Audio-2025-11-25-at-8.31.41-PM_analysis (1).md` | Pivote contenido, alianza Santander, UX monday.com |
| `REUNIONES/export_vista_usuario_pyme_full-6.csv` | Base de datos de 117 usuarios/pymes |
| `design/color-palette.md` | Paleta de colores con shades |
| `plan.md` | Plan técnico original |
| `whoiam.md` | Descripción del proyecto |
| `elevatorpitch.md` | Pitch de 20 min para reuniones |

---

## 11. Oportunidades de Valor Aumentado (sin costo adicional)

Extraídas del análisis profundo de las conversaciones:

### 11.1 Quick Wins (ya implementables)
| Oportunidad | Descripción | Costo | Impacto |
| --- | --- | --- | --- |
| **Modelo Freemium con "Coming Soon"** | Menús en gris para features futuras, genera expectativa y permite upselling | $0 | Alto |
| **Gamificación básica** | Barra de progreso, lucecitas, mensajes de logro al completar registro | $0 | Alto |
| **Sistema de niveles/estampillas** | Usuarios ganan puntos por actividad (compartir, reportar, completar perfil) | $0 | Medio |
| **Directorio "Páginas Amarillas"** | Listado de servicios de la tribu, visible para todos, genera tráfico | $0 | Alto |

### 11.2 Upselling Natural
| Feature | Tier | Precio sugerido |
| --- | --- | --- |
| **Membresía básica** | Acceso al algoritmo + checklist | $20.000/mes |
| **Membresía premium** | + Directorio destacado + badge verificado | $35.000/mes |
| **Membresía pro** | + Prioridad en matches + analytics | $50.000/mes |
| **Pago anual** | 3 meses gratis (hacer caja) | Descuento 25% |

### 11.3 Alianzas de Valor (sin inversión)
- **Santander Academy**: Certificación gratuita para emprendedores (reunión confirmada)
- **LofWork**: Cápsulas de tributación y finanzas
- **Municipalidad**: 2,500 leads + carrito e-commerce futuro
- **Casas colaborativas**: 150+ emprendedores cada una

### 11.4 Features Futuras (bajo costo)
| Feature | Descripción | Prioridad |
| --- | --- | --- |
| **TribuGPT** | Chatbot IA entrenado en emprendimiento (usar modelo existente) | Media |
| **Bot Instagram** | Captura automática de datos desde DMs | Baja |
| **Carrito e-commerce tribal** | Marketplace interno (pedido por municipalidad) | Baja |
| **Automatización de recordatorios** | WhatsApp/Email antes del día 20 para cumplimiento | Alta |

### 11.5 Métricas de Impacto Proyectadas
- **1 millón de usuarios** = $20.000 millones/año (mencionado en reunión)
- **Meta año 1**: 4,000 usuarios = $80 millones/año base
- **Con upselling**: +40% ingresos adicionales estimados

---

## 12. Admin Panel (Permisos "Dios")

### 12.1 Funcionalidades del Admin
| Módulo | Descripción |
| --- | --- |
| **Dashboard Overview** | Usuarios totales, activos, reportes, ingresos, matches del mes |
| **Gestión de Usuarios** | Ver todos, editar, suspender, eliminar, ver perfil completo |
| **Gestión de Matches** | Regenerar tómbola, ver asignaciones, forzar/bloquear matches |
| **Reportes "Acusete"** | Ver todos los reportes, resolver, aplicar sanciones |
| **Taxonomía** | Editar rubros, familias, afinidades, reglas de exclusión |
| **Configuración** | Fechas de corte, parámetros del algoritmo, pasarela de pagos |
| **Exportar Datos** | CSV/Excel de usuarios, matches, reportes, métricas |
| **Logs de Actividad** | Quién hizo qué y cuándo |

### 12.2 Roles de Acceso
| Rol | Permisos |
| --- | --- |
| **SuperAdmin (Dios)** | Todo: CRUD usuarios, config sistema, exportar, eliminar |
| **Admin** | Gestión usuarios, reportes, matches (sin eliminar ni config) |
| **Moderador** | Solo ver reportes y resolver conflictos |
| **Viewer** | Solo lectura de dashboards y métricas |

### 12.3 Credenciales Iniciales
```
Usuario: admin@tribuimpulsa.cl
Password: [definir en .env]
Rol: SuperAdmin
```

---

## 13. Configuración PWA

### 13.1 Manifest.json
```json
{
  "name": "Tribu Impulsa",
  "short_name": "Tribu",
  "description": "Plataforma de cross-promotion para emprendedores",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#022c22",
  "theme_color": "#00CA72",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 13.2 Checklist PWA para iPhone
- [x] Manifest.json configurado
- [ ] Service Worker registrado
- [ ] Iconos 192x192 y 512x512 (generar imágenes)
- [x] apple-touch-icon en index.html
- [x] meta viewport configurado
- [ ] HTTPS habilitado (requerido para deploy)
- [ ] Splash screens para iOS (generar imágenes)

---

## 14. Progreso de Implementación

### 14.1 Completado ✅
| Feature | Estado | Fecha |
| --- | --- | --- |
| Login con user+pass | ✅ Implementado | 27-nov |
| Admin Panel `/admin` | ✅ Implementado + nueva paleta | 27-nov |
| PWA manifest.json | ✅ Configurado | 27-nov |
| Meta tags iOS | ✅ Agregados | 27-nov |
| **Paleta monday.com completa** | ✅ **Aplicada en TODA la app** | 27-nov |
| index.css con variables | ✅ Creado | 27-nov |
| Checklist 10+10 | ✅ Funcional + nueva paleta | 27-nov |
| Botón "acusete" | ✅ Funcional | previo |
| Dashboard matches | ✅ Nueva paleta | 27-nov |
| Profile views | ✅ Nueva paleta | 27-nov |
| Activity view | ✅ Nueva paleta | 27-nov |
| Survey form | ✅ Nueva paleta | 27-nov |

### Resumen paleta aplicada:
| Color | Hex | Uso |
|-------|-----|-----|
| Fondo principal | `#F5F7FB` | Background general |
| Cards | `#FFFFFF` | Tarjetas, modales |
| Bordes | `#E4E7EF` | Separadores |
| Púrpura | `#6161FF` | Acento primario |
| Verde | `#00CA72` | Success, CTA |
| Rojo | `#FB275D` | Danger, errores |
| Amarillo | `#FFCC00` | Warning |
| Texto oscuro | `#181B34` | Títulos |
| Texto muted | `#7C8193` | Secundario |

### 🆕 Colores Lila/Fucsia Pastel (añadidos 27-nov)
| Color | Hex | Uso |
|-------|-----|-----|
| Lila Pastel | `#E8D5FF` | Afinidades, estados especiales |
| Lila Medio | `#A78BFA` | Badges destacados |
| Fucsia Pastel | `#FFD5E5` | Notificaciones nuevas |
| Fucsia Medio | `#EC4899` | Highlights |
| Lavanda | `#DDD6FE` | Hover states |
| Rosa Suave | `#FDF2F8` | Fondos alternativos |

📄 Ver `docs/MAPA_SITIO_Y_LOGICAS.md` para análisis completo

### 14.2 Completado HOY ✅ (27-nov sesión 2)
| Feature | Estado | Notas |
| --- | --- | --- |
| **Iconos PWA generados** | ✅ | 72, 96, 128, 144, 152, 192, 384, 512 + apple-touch |
| **Service Worker** | ✅ | public/sw.js con cache y offline |
| **Registro unificado 5 pasos** | ✅ | Sin repeticiones, GIRO antes de AFINIDAD |
| **Pantalla Algoritmo Tribal X** | ✅ | Animación de búsqueda post-registro |
| **Sistema DB con export** | ✅ | services/databaseService.ts → CSV/JSON |
| **Export a Google Drive** | ✅ | Botón en Admin Panel |

### 14.3 Sistema Conectado ✅ (27-nov sesión 3)
| Feature | Estado | Notas |
| --- | --- | --- |
| **Registro guarda en DB real** | ✅ | `createUser()` en databaseService |
| **20 usuarios seed cargados** | ✅ | services/seedData.ts |
| **Tribu usa usuarios REALES** | ✅ | No más DUMMY_DATABASE |
| **Admin muestra datos REALES** | ✅ | Stats, usuarios, reportes |
| **Reportes llegan al Admin** | ✅ | Lee de tribeReportsLog |
| **Notificaciones funcionales** | ✅ | getUserNotifications() |

### 14.4 App de los Sueños ✅ (27-nov sesión 4)
| Feature | Estado | Descripción |
| --- | --- | --- |
| **Dashboard Cumplimiento Admin** | ✅ | Vista con % por usuario, barras de progreso, filtros por estado |
| **Distribución por Rubro** | ✅ | Gráficos de distribución de categorías de negocio |
| **Sistema Estados Reportes** | ✅ | pendiente → en_revisión → resuelto/sancionado/desestimado |
| **Notas Admin en Reportes** | ✅ | El admin puede agregar notas a cada reporte |
| **Sanciones Automáticas** | ✅ | Al sancionar se suspende cuenta del usuario |
| **Tutorial Onboarding** | ✅ | 4 pasos: Bienvenida, Tribu 10+10, Checklist, Perfil |
| **Recordatorios Masivos** | ✅ | Botón para enviar recordatorio a todos los usuarios activos |
| **Recordatorios Individuales** | ✅ | Enviar recordatorio a un usuario específico |
| **Notificación Bienvenida** | ✅ | Se envía automáticamente al completar onboarding |
| **Colores Lila/Fucsia** | ✅ | Nuevos colores pastel agregados a la paleta |

### 14.5 Pendiente 🔄
| Feature | Prioridad | Notas |
| --- | --- | --- |
| Deploy HTTPS | Alta | Netlify/Vercel para probar en iPhone |
| Backend remoto | Media | Actualmente localStorage |

### 14.4 Flujo de Usuario Actualizado
```
1. Login → /
2. Registro 5 pasos → /register
   - Paso 1: Datos personales (nombre, email, teléfono)
   - Paso 2: Emprendimiento (nombre empresa, ciudad, alcance)
   - Paso 3: Giro/Rubro (categoría del negocio) ← ANTES
   - Paso 4: Afinidad (con quién conectar) ← DESPUÉS
   - Paso 5: Redes sociales (Instagram obligatorio)
3. Algoritmo Tribal X → /searching (animación)
4. Dashboard → /dashboard (matches + stats)
5. Mi Tribu → /tribe (checklist 10+10)
6. Perfil → /my-profile
7. Admin → /admin (gestión + export Drive)
```

### 14.3 Credenciales de Prueba
**Admin Panel** (`/admin`):
- Email: `admin@tribuimpulsa.cl`
- Password: `admin123`
- Rol: SuperAdmin

**Usuarios Reales** (login normal):
- Contraseña universal: `TRIBU2026`
- Emails: Ver CSV de usuarios registrados

---

## 15. ACTUALIZACIÓN 28-NOV-2025 🚀

### 15.1 Estado Actual del MVP

| Feature | Estado | Descripción |
| --- | --- | --- |
| **23 Usuarios Reales** | ✅ | Cargados desde CSV con todos sus datos |
| **Contraseña Universal** | ✅ | `TRIBU2026` para todos los usuarios registrados |
| **Cambio de Contraseña** | ✅ | Modal en primer login sugiere cambiar |
| **Algoritmo Tribal Real** | ✅ | Evita competencia, prioriza afinidades complementarias |
| **Auto-backup Datos** | ✅ | Cada hora guarda backup en localStorage |
| **Export/Import Datos** | ✅ | Sistema de persistencia con backup JSON |
| **Firebase Instalado** | ✅ | Preparado para notificaciones push |

### 15.2 Archivos Nuevos Creados

| Archivo | Descripción |
| --- | --- |
| `services/realUsersData.ts` | 23 usuarios reales del CSV |
| `services/tribeAlgorithm.ts` | Algoritmo de asignación 10+10 real |
| `services/dataPersistence.ts` | Sistema de backup y restauración |
| `services/firebaseService.ts` | Integración con Firebase |
| `public/firebase-messaging-sw.js` | Service Worker para push |
| `USO.md` | Guía de uso para usuarios y admins |
| `CREDENCIALES_GUIA.md` | Guía de credenciales y transferencia |
| `.env.example` | Plantilla de variables de entorno |

### 15.3 Pendientes Técnicos

| Feature | Prioridad | Estado |
| --- | --- | --- |
| **Configurar Firebase** | Alta | Crear proyecto y agregar credenciales |
| **Notificaciones Push** | Alta | Falta conectar con UI |
| **Backend Remoto** | Media | Actualmente localStorage (mitigado con backup) |
| **Editar Perfil** | Media | UI existe pero falta conectar con DB |
| **Asignaciones Manuales** | Baja | Admin poder reasignar manualmente |

### 15.4 Para Transferir a las Fundadoras

1. **Archivos a entregar (por email seguro):**
   - `.env` con credenciales de Firebase
   - Acceso a Firebase Console
   - Acceso a Vercel Dashboard
   - Acceso a GitHub repo

2. **Documentación incluida:**
   - `USO.md` - Cómo usar la app
   - `CREDENCIALES_GUIA.md` - Cómo manejar credenciales
   - `Planymejoras.md` - Este documento

3. **Capacitación recomendada:**
   - 30 min: Panel Admin y reportes
   - 15 min: Cómo hacer backup de datos
   - 15 min: Cómo actualizar usuarios

---

*Última actualización: 28-nov-2025*
