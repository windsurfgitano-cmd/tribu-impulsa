# 🔒 GUÍA DE REORGANIZACIÓN Y SEGURIDAD

## ⚠️ ACCIÓN URGENTE REQUERIDA

**ARCHIVOS CRÍTICOS EXPUESTOS EN GITHUB:**
- ✅ `.gitignore` actualizado (completado)
- ❌ Archivos sensibles aún en repositorio (REQUIERE LIMPIEZA MANUAL)

---

## 📋 PASO 1: CREAR ESTRUCTURA DE CARPETAS

### Ejecutar en terminal:

```bash
# Crear carpeta INTERNO en la raíz del proyecto
mkdir INTERNO
cd INTERNO

# Crear subcarpetas
mkdir reuniones
mkdir backups
mkdir credenciales
mkdir scripts-admin
mkdir docs-internos
mkdir transcripciones
```

### Estructura final:

```
TribuImpulsa/
│
├── [PRODUCCIÓN - SE SUBE A GITHUB]
│   ├── src/
│   ├── components/
│   ├── screens/
│   ├── services/
│   ├── public/          ← Solo assets públicos
│   ├── package.json
│   ├── README.md
│   ├── ARQUITECTURA_PWA.md
│   └── .gitignore
│
└── [INTERNO - NO SE SUBE - .gitignore lo bloquea]
    ├── reuniones/       ← Transcripciones de reuniones
    ├── backups/         ← Respaldos de código
    ├── credenciales/    ← Claves y credenciales
    ├── scripts-admin/   ← Scripts de limpieza/reset
    ├── docs-internos/   ← Documentación privada
    └── transcripciones/ ← PDFs de reuniones
```

---

## 📦 PASO 2: MOVER ARCHIVOS SENSIBLES

### Ejecutar en terminal (desde la raíz):

```bash
# ==================================================
# CREDENCIALES CRÍTICAS
# ==================================================
mv tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json INTERNO/credenciales/

# ==================================================
# REUNIONES Y TRANSCRIPCIONES
# ==================================================
mv reuniones INTERNO/reuniones-backup
mv "OTROS/Resumen Ejecutivo Reunion Pre-Entrega.pdf" INTERNO/transcripciones/
mv "OTROS/TRANSCRIPCION REUNION PRE-ENTREGA.pdf" INTERNO/transcripciones/

# Si existe carpeta REUNIONES en OTROS
mv OTROS/REUNIONES INTERNO/reuniones-otros

# ==================================================
# BACKUPS DE CÓDIGO
# ==================================================
mv OTROS/RESPALDO INTERNO/backups/respaldo-1
mv OTROS/RESPALDO-newUX INTERNO/backups/respaldo-newUX
mv OTROS/backups INTERNO/backups/otros-backups

# ==================================================
# SCRIPTS PELIGROSOS (Herramientas admin)
# ==================================================
mv public/reset-total-sistema.html INTERNO/scripts-admin/
mv public/cleanup-auth-orphans.html INTERNO/scripts-admin/
mv public/cleanup-duplicates-manual.html INTERNO/scripts-admin/
mv public/cleanup-master.html INTERNO/scripts-admin/

mv dist/reset-total-sistema.html INTERNO/scripts-admin/ 2>/dev/null || true
mv dist/cleanup-auth-orphans.html INTERNO/scripts-admin/ 2>/dev/null || true
mv dist/cleanup-duplicates-manual.html INTERNO/scripts-admin/ 2>/dev/null || true
mv dist/cleanup-master.html INTERNO/scripts-admin/ 2>/dev/null || true

# ==================================================
# DOCUMENTACIÓN PRIVADA
# ==================================================
mv OTROS/CREDENCIALES_GUIA.md INTERNO/docs-internos/
mv OTROS/whoiam.md INTERNO/docs-internos/
mv OTROS/miamorpet.md INTERNO/docs-internos/
mv OTROS/elevatorpitch.md INTERNO/docs-internos/
mv OTROS/metadata.json INTERNO/docs-internos/

# PDFs y Word sensibles
mv "Políticas de Privacidad y Protección de Datos  Tribu Impulsa.docx" INTERNO/docs-internos/
mv "Políticas de Privacidad y Protección de Datos  Tribu Impulsa.pdf" INTERNO/docs-internos/

# ==================================================
# TODA LA CARPETA OTROS (lo que quede)
# ==================================================
# Mover el resto de OTROS a INTERNO
mv OTROS INTERNO/otros-archivos
```

---

## 🗑️ PASO 3: LIMPIAR HISTORIAL DE GIT (CRÍTICO)

Los archivos sensibles ya están en el historial de Git. Debes eliminarlos completamente:

### Opción A: Usar BFG Repo-Cleaner (Recomendado)

```bash
# Instalar BFG (si no lo tienes)
# Windows: scoop install bfg
# Mac: brew install bfg
# Linux: sudo apt install bfg

# Hacer backup completo antes!
cp -r .git .git-backup

# Eliminar archivo sensible del historial
bfg --delete-files "tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json"
bfg --delete-folders "reuniones"
bfg --delete-folders "OTROS"

# Limpiar refs
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# FORZAR push (¡CUIDADO! Reescribe historial)
git push origin --force --all
```

### Opción B: Reescribir historial con git filter-repo

```bash
# Instalar git-filter-repo
pip install git-filter-repo

# Eliminar archivos del historial
git filter-repo --path tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json --invert-paths
git filter-repo --path reuniones --invert-paths
git filter-repo --path OTROS --invert-paths

# FORZAR push
git push origin --force --all
```

### Opción C: Recrear repositorio desde cero (Más seguro)

```bash
# 1. Renombrar repo actual
mv .git .git-old

# 2. Iniciar repo nuevo
git init

# 3. Agregar archivos (con nuevo .gitignore activo)
git add .

# 4. Commit inicial
git commit -m "feat: Reorganización segura - archivos sensibles removidos"

# 5. Conectar a GitHub (crear repo nuevo en GitHub primero)
git remote add origin https://github.com/tu-usuario/tribu-impulsa-seguro.git
git push -u origin main

# 6. Borrar repo viejo de GitHub
# (Hazlo manualmente desde la web de GitHub)
```

---

## 🔐 PASO 4: REGENERAR CREDENCIALES EXPUESTAS

Como las credenciales de Firebase estuvieron en GitHub, debes regenerarlas:

### Firebase Admin SDK

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `tribu-impulsa`
3. ⚙️ Configuración del proyecto → Cuentas de servicio
4. Click "Generar nueva clave privada"
5. Descarga el JSON y guárdalo en `INTERNO/credenciales/`
6. **Revocar la clave anterior** (botón "Eliminar" en la clave vieja)

### Variables de entorno en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Proyecto: `tribu-impulsa`
3. Settings → Environment Variables
4. Regenera todas las claves si es posible

---

## 📝 PASO 5: CREAR ARCHIVO .env.example

Crear un archivo de ejemplo SIN credenciales reales:

```bash
# En la raíz del proyecto
cat > .env.example << 'EOF'
# ==================================================
# TRIBU IMPULSA - Variables de Entorno
# ==================================================
# ¡NO PONGAS CREDENCIALES REALES AQUÍ!
# Este archivo es un ejemplo. Copia como .env y llena.

# Firebase Web Config
VITE_FIREBASE_API_KEY=tu-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=tribu-impulsa.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tribu-impulsa
VITE_FIREBASE_STORAGE_BUCKET=tribu-impulsa.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Cloud Messaging
VITE_FIREBASE_VAPID_KEY=tu-vapid-key-aqui

# Azure OpenAI (Opcional - para matching IA)
VITE_AZURE_OPENAI_ENDPOINT=https://tu-endpoint.openai.azure.com/
VITE_AZURE_OPENAI_KEY=tu-api-key-aqui

# MercadoPago (Para pagos)
VITE_MERCADOPAGO_PUBLIC_KEY=tu-public-key-aqui
MERCADOPAGO_ACCESS_TOKEN=tu-access-token-aqui

# Vercel (Producción)
VERCEL_PROJECT_ID=tu-project-id
VERCEL_ORG_ID=tu-org-id
EOF
```

---

## ✅ PASO 6: VERIFICAR SEGURIDAD

```bash
# Ver qué archivos están siendo trackeados
git ls-files | grep -E "(reunion|REUNION|credential|secret|backup|RESPALDO)"

# Si aparecen archivos sensibles, eliminarlos:
git rm --cached archivo-sensible.ext
git commit -m "chore: Remover archivo sensible del tracking"
```

---

## 📚 PASO 7: DOCUMENTAR PARA EL EQUIPO

Crear `INTERNO/README_INTERNO.md`:

```markdown
# 📁 CARPETA INTERNO

**¡NUNCA SUBIR ESTA CARPETA A GITHUB!**

## Contenido

- `reuniones/` - Transcripciones de reuniones con el equipo
- `backups/` - Respaldos de código y versiones anteriores
- `credenciales/` - Claves de Firebase, APIs, etc.
- `scripts-admin/` - Herramientas de administración y limpieza
- `docs-internos/` - Documentación privada del proyecto
- `transcripciones/` - PDFs de reuniones

## Seguridad

Estos archivos están protegidos por `.gitignore`.
Si necesitas compartir algo, usa:
- Email cifrado
- Drive privado
- Contraseña en 1Password/Bitwarden

## Backup

Respaldar esta carpeta en:
- Google Drive privado (cada semana)
- Disco externo (cada mes)
```

---

## 🚨 RESUMEN DE SEGURIDAD

### ✅ Archivos que SÍ van a GitHub:
- Código fuente (`/src`, `/components`, `/services`)
- Assets públicos (`/public` - solo imágenes, videos, iconos)
- Configuración (`package.json`, `tsconfig.json`, `vite.config.ts`)
- Documentación pública (`README.md`, `ARQUITECTURA_PWA.md`)
- `.env.example` (sin credenciales reales)

### ❌ Archivos que NUNCA van a GitHub:
- **Credenciales** (`.env`, `*-adminsdk-*.json`)
- **Reuniones** (`reuniones/`, `*REUNION*.pdf`)
- **Backups** (`RESPALDO/`, `backups/`)
- **Scripts admin** (`reset-*.html`, `cleanup-*.html`)
- **Docs privados** (`OTROS/`, `INTERNO/`)
- **PDFs sensibles** (planes de negocio, contratos)

---

## 📞 CONTACTO EN CASO DE BREACH

Si descubres que se filtró información sensible:

1. **Revocar TODAS las credenciales inmediatamente**
2. **Regenerar nuevas claves**
3. **Cambiar contraseñas de todas las cuentas**
4. **Notificar al equipo**
5. **Revisar logs de acceso sospechoso**

---

**Fecha de creación:** Diciembre 2024  
**Última actualización:** v0.9.1  
**Autor:** Sistema de seguridad Tribu Impulsa

