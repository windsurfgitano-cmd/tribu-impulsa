# Plan de Reinicio Firestore + Datos Obligatorios

> Objetivo: dejar Firestore como única fuente de verdad, reiniciar la base con seguridad y garantizar que todos los perfiles cumplan con los datos mínimos antes de habilitar funciones críticas.

---

## 1. Respaldo previo (ya ejecutado)

1. **Snapshot local**: `Compress-Archive` → `TribuImpulsa_RESPALDOVIP.zip`.
2. **Branch Git**: `RESPALDOVIP` con el estado actual del repo.
3. **Opcional**: exportar colecciones actuales desde Firestore (usando consola o `gcloud firestore export`) para histórico.

> Nota: No avanzar con limpieza hasta tener confirmación de que el zip y el branch están verificados.

---

## 2. Procedimiento de reinicio

1. **Preparar script de limpieza** (basado en `services/seedFirestore.ts`):
   - Usar Firebase Admin SDK (Node) para conectarse con credenciales de servicio.
   - Borrar colecciones: `users`, `memberships`, `notifications`, `payment_history`, `assignments`, `reports`, `system_stats`, `config`.
   - Mantener logs en consola y opcionalmente escribir un registro (`/reuniones/limpieza-log.md`).

2. **Sembrar base mínima**:
   - Usuario admin (`admin@tribuimpulsa.cl`) con contraseña segura + documento `config/admin`.
   - Datos de sistema (`config/app`) con defaults (precio membresía, WhatsApp soporte, etc.).
   - Opcional: crear 2–3 usuarios demo para QA interno (nunca más de eso).

3. **Validar**:
   - Ejecutar script de verificación que cuente documentos por colección y confirme que sólo existe la semilla.
   - Probar login admin y confirmar que no hay datos residuales en la UI.

> Todo el proceso debe quedar documentado (fecha, responsable, comandos utilizados).

---

## 3. Campos obligatorios de perfil (perfil “completo”)

Estos campos deben estar presentes y validados antes de permitir acceso a módulos clave (matches 10+10, directorio, etc.):

| Categoría | Campo | Notas |
| --- | --- | --- |
| Identidad | `name`, `email`, `phone` | Email verificado via Auth. |
| Emprendimiento | `companyName`, `bio`, `businessDescription`, `category` | Bio >= 140 caracteres sugeridos. |
| Presencia digital | `instagram` (o canal principal), `website` u otro canal | Al menos un canal válido. |
| Ubicación | `city`, `scope`, `comuna` (si scope = LOCAL), `selectedRegions` (si scope = REGIONAL) | Usar catálogo `REGIONS`. |
| Afinidad | `affinity` | Debe provenir de catálogo oficial. |
| Visual | `avatarUrl` (auto-generado si no sube), `companyLogoUrl` opcional. |
| Métricas | `revenue`, `followers` (pueden ser rangos). |
| Estado | `status = active`, `onboardingComplete = true`, `termsAccepted = true`. |

**Validación adicional**:
- `instagram` debe comenzar con `@` o URL válida.
- `phone` en formato internacional `+56...`.
- `bio` y `businessDescription` sin placeholders (“Lorem ipsum”, etc.).

En frontend, antes de guardar se debe hacer submit hacia Firestore; sólo después se guarda cache local.

---

## 4. Flujo recomendado post-reinicio

1. **Habilitar nuevo onboarding**: todos los usuarios deben crear perfil desde cero con los campos obligatorios.
2. **Bloquear módulos**:
   - Directorio y Matches → sólo para perfiles completos y membresía activa (trial o pago).
   - Admin panel → ver sólo la lista de usuarios con estado `pending` para aprobar manualmente si falta algo.
3. **Monitoreo**:
   - Registrar en `system_stats/profilesCompleted` la cuenta de perfiles completos.
   - Emitir anuncios globales cada 50 nuevos perfiles hasta llegar a 1.000 (para habilitar Tribu 10+10).

---

## 5. Herramientas y scripts involucrados

| Script | Ubicación | Acciones |
| --- | --- | --- |
| `seedFirestore.ts` | `services/seedFirestore.ts` (o mover a `scripts/`) | Adaptar para usar Admin SDK y soportar argumentos `--wipe`, `--seed`. |
| `scripts/reset-firestore.ts` (nuevo) | `scripts/` | 1) backup opcional, 2) wipe, 3) re-seed, 4) reporte. |
| Cloud backups | Consola Firebase / `gcloud` | Exportar colecciones antes del wipe (opcional). |

---

## 6. Checklist antes de producción

- [ ] Zip + branch de respaldo confirmados.
- [ ] Script de limpieza probado en entorno de staging (o colección de test).
- [ ] Semilla mínima creada y documentada.
- [ ] Validaciones de perfil obligatorio activas (front + back).
- [ ] Barra de progreso 1.000 usuarios conectada a `system_stats`.
- [ ] Plan de comunicación para los hitos (cada 50 perfiles).

---

Con este plan evitamos inconsistencias, garantizamos datos completos y dejamos Firestore como única fuente de verdad antes de relanzar los módulos críticos. Aprobado el documento, procedemos a implementar los scripts y validaciones.	
