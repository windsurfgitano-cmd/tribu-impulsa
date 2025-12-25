#!/bin/bash

# ==================================================
# SCRIPT DE REORGANIZACIÓN DE ARCHIVOS SENSIBLES
# Tribu Impulsa PWA
# ==================================================
# Este script mueve archivos sensibles a la carpeta INTERNO/
# para evitar que se suban a GitHub accidentalmente.
#
# USO:
#   bash reorganizar-archivos.sh
#
# O dar permisos de ejecución:
#   chmod +x reorganizar-archivos.sh
#   ./reorganizar-archivos.sh
# ==================================================

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "=========================================="
echo "  REORGANIZACIÓN DE ARCHIVOS SENSIBLES"
echo "  Tribu Impulsa PWA v0.9.1"
echo "=========================================="
echo -e "${NC}"

# ==================================================
# PASO 1: CREAR ESTRUCTURA DE CARPETAS
# ==================================================

echo -e "${YELLOW}[1/6] Creando estructura de carpetas...${NC}"

mkdir -p INTERNO
mkdir -p INTERNO/reuniones
mkdir -p INTERNO/backups
mkdir -p INTERNO/credenciales
mkdir -p INTERNO/scripts-admin
mkdir -p INTERNO/docs-internos
mkdir -p INTERNO/transcripciones
mkdir -p INTERNO/otros-archivos

echo -e "${GREEN}✅ Estructura creada${NC}"

# ==================================================
# PASO 2: MOVER CREDENCIALES CRÍTICAS
# ==================================================

echo -e "${YELLOW}[2/6] Moviendo credenciales críticas...${NC}"

moved_count=0

# Firebase Admin SDK
if [ -f "tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json" ]; then
    mv tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json INTERNO/credenciales/
    echo -e "${GREEN}  ✓ Firebase Admin SDK movido${NC}"
    ((moved_count++))
fi

# Archivos .env (si existen)
if [ -f ".env" ]; then
    cp .env INTERNO/credenciales/.env.backup
    echo -e "${GREEN}  ✓ .env copiado como backup${NC}"
    ((moved_count++))
fi

if [ -f ".env.local" ]; then
    mv .env.local INTERNO/credenciales/
    echo -e "${GREEN}  ✓ .env.local movido${NC}"
    ((moved_count++))
fi

if [ -f ".env.production" ]; then
    mv .env.production INTERNO/credenciales/
    echo -e "${GREEN}  ✓ .env.production movido${NC}"
    ((moved_count++))
fi

echo -e "${GREEN}✅ $moved_count credenciales movidas${NC}"

# ==================================================
# PASO 3: MOVER REUNIONES Y TRANSCRIPCIONES
# ==================================================

echo -e "${YELLOW}[3/6] Moviendo reuniones y transcripciones...${NC}"

moved_count=0

# Carpeta reuniones/
if [ -d "reuniones" ]; then
    mv reuniones INTERNO/reuniones-backup
    echo -e "${GREEN}  ✓ Carpeta reuniones/ movida${NC}"
    ((moved_count++))
fi

# PDFs de reuniones en OTROS/
if [ -f "OTROS/Resumen Ejecutivo Reunion Pre-Entrega.pdf" ]; then
    mv "OTROS/Resumen Ejecutivo Reunion Pre-Entrega.pdf" INTERNO/transcripciones/
    echo -e "${GREEN}  ✓ Resumen ejecutivo movido${NC}"
    ((moved_count++))
fi

if [ -f "OTROS/TRANSCRIPCION REUNION PRE-ENTREGA.pdf" ]; then
    mv "OTROS/TRANSCRIPCION REUNION PRE-ENTREGA.pdf" INTERNO/transcripciones/
    echo -e "${GREEN}  ✓ Transcripción PDF movida${NC}"
    ((moved_count++))
fi

# Carpeta REUNIONES en OTROS/
if [ -d "OTROS/REUNIONES" ]; then
    mv OTROS/REUNIONES INTERNO/reuniones-otros
    echo -e "${GREEN}  ✓ OTROS/REUNIONES movida${NC}"
    ((moved_count++))
fi

echo -e "${GREEN}✅ $moved_count archivos de reuniones movidos${NC}"

# ==================================================
# PASO 4: MOVER BACKUPS
# ==================================================

echo -e "${YELLOW}[4/6] Moviendo backups...${NC}"

moved_count=0

if [ -d "OTROS/RESPALDO" ]; then
    mv OTROS/RESPALDO INTERNO/backups/respaldo-1
    echo -e "${GREEN}  ✓ RESPALDO movido${NC}"
    ((moved_count++))
fi

if [ -d "OTROS/RESPALDO-newUX" ]; then
    mv OTROS/RESPALDO-newUX INTERNO/backups/respaldo-newUX
    echo -e "${GREEN}  ✓ RESPALDO-newUX movido${NC}"
    ((moved_count++))
fi

if [ -d "OTROS/backups" ]; then
    mv OTROS/backups INTERNO/backups/otros-backups
    echo -e "${GREEN}  ✓ OTROS/backups movido${NC}"
    ((moved_count++))
fi

echo -e "${GREEN}✅ $moved_count carpetas de backup movidas${NC}"

# ==================================================
# PASO 5: MOVER SCRIPTS ADMIN
# ==================================================

echo -e "${YELLOW}[5/6] Moviendo scripts de administración...${NC}"

moved_count=0

# Scripts en public/
for script in public/reset-*.html public/cleanup-*.html; do
    if [ -f "$script" ]; then
        mv "$script" INTERNO/scripts-admin/
        echo -e "${GREEN}  ✓ $(basename "$script") movido${NC}"
        ((moved_count++))
    fi
done

# Scripts en dist/
for script in dist/reset-*.html dist/cleanup-*.html; do
    if [ -f "$script" ]; then
        mv "$script" INTERNO/scripts-admin/
        echo -e "${GREEN}  ✓ $(basename "$script") movido (dist)${NC}"
        ((moved_count++))
    fi
done

echo -e "${GREEN}✅ $moved_count scripts admin movidos${NC}"

# ==================================================
# PASO 6: MOVER DOCUMENTACIÓN PRIVADA
# ==================================================

echo -e "${YELLOW}[6/6] Moviendo documentación privada...${NC}"

moved_count=0

# Documentos privados en OTROS/
private_docs=(
    "OTROS/CREDENCIALES_GUIA.md"
    "OTROS/whoiam.md"
    "OTROS/miamorpet.md"
    "OTROS/elevatorpitch.md"
    "OTROS/metadata.json"
)

for doc in "${private_docs[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" INTERNO/docs-internos/
        echo -e "${GREEN}  ✓ $(basename "$doc") movido${NC}"
        ((moved_count++))
    fi
done

# PDFs y Word sensibles
if [ -f "Políticas de Privacidad y Protección de Datos  Tribu Impulsa.docx" ]; then
    mv "Políticas de Privacidad y Protección de Datos  Tribu Impulsa.docx" INTERNO/docs-internos/
    echo -e "${GREEN}  ✓ Políticas (DOCX) movida${NC}"
    ((moved_count++))
fi

if [ -f "Políticas de Privacidad y Protección de Datos  Tribu Impulsa.pdf" ]; then
    mv "Políticas de Privacidad y Protección de Datos  Tribu Impulsa.pdf" INTERNO/docs-internos/
    echo -e "${GREEN}  ✓ Políticas (PDF) movida${NC}"
    ((moved_count++))
fi

# Mover el resto de OTROS/ si existe
if [ -d "OTROS" ]; then
    mv OTROS INTERNO/otros-archivos
    echo -e "${GREEN}  ✓ Carpeta OTROS completa movida${NC}"
    ((moved_count++))
fi

echo -e "${GREEN}✅ $moved_count documentos privados movidos${NC}"

# ==================================================
# VERIFICACIÓN FINAL
# ==================================================

echo ""
echo -e "${BLUE}=========================================="
echo "  VERIFICACIÓN FINAL"
echo "==========================================${NC}"

# Verificar que archivos sensibles NO están en Git
echo -e "${YELLOW}Verificando archivos trackeados en Git...${NC}"

dangerous_patterns=(
    "tribu-impulsa-firebase-adminsdk"
    "reunion"
    "REUNION"
    "RESPALDO"
    "CREDENCIALES"
)

found_dangerous=0
for pattern in "${dangerous_patterns[@]}"; do
    if git ls-files | grep -i "$pattern" > /dev/null 2>&1; then
        echo -e "${RED}  ⚠️  Archivos con '$pattern' aún en Git${NC}"
        ((found_dangerous++))
    fi
done

if [ $found_dangerous -eq 0 ]; then
    echo -e "${GREEN}  ✅ No se encontraron archivos sensibles trackeados${NC}"
else
    echo -e "${RED}  ❌ Se encontraron $found_dangerous tipos de archivos sensibles${NC}"
    echo -e "${YELLOW}  → Ejecuta: git rm --cached ARCHIVO${NC}"
fi

# Mostrar contenido de INTERNO/
echo ""
echo -e "${BLUE}Contenido de INTERNO/:${NC}"
ls -la INTERNO/ 2>/dev/null || echo "  (vacío)"

# ==================================================
# SIGUIENTES PASOS
# ==================================================

echo ""
echo -e "${BLUE}=========================================="
echo "  SIGUIENTES PASOS CRÍTICOS"
echo "==========================================${NC}"

echo ""
echo -e "${YELLOW}1. Limpiar historial de Git:${NC}"
echo -e "   ${GREEN}git filter-repo --path INTERNO --invert-paths${NC}"
echo ""

echo -e "${YELLOW}2. Remover archivos del tracking:${NC}"
echo -e "   ${GREEN}git rm --cached tribu-impulsa-firebase-adminsdk-*.json${NC}"
echo -e "   ${GREEN}git rm -r --cached reuniones/${NC}"
echo ""

echo -e "${YELLOW}3. Commit los cambios:${NC}"
echo -e "   ${GREEN}git add .${NC}"
echo -e "   ${GREEN}git commit -m \"chore: Reorganización de archivos sensibles\"${NC}"
echo ""

echo -e "${YELLOW}4. Regenerar credenciales expuestas:${NC}"
echo -e "   ${GREEN}https://console.firebase.google.com → Cuentas de servicio${NC}"
echo ""

echo -e "${YELLOW}5. Verificar .gitignore actualizado:${NC}"
echo -e "   ${GREEN}cat .gitignore | grep INTERNO${NC}"
echo ""

echo -e "${GREEN}=========================================="
echo "  ✅ REORGANIZACIÓN COMPLETADA"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Documentación creada:${NC}"
echo "  - ARQUITECTURA_PWA.md (100+ páginas)"
echo "  - ARQUITECTURA_VISUAL.md (15 diagramas)"
echo "  - GUIA_DESPLIEGUE.md"
echo "  - GUIA_REORGANIZACION_SEGURIDAD.md"
echo "  - INDICE_DOCUMENTACION.md"
echo "  - CHANGELOG.md"
echo "  - env.example"
echo ""
echo -e "${YELLOW}⚠️  NO OLVIDES: Regenerar credenciales de Firebase${NC}"
echo ""

