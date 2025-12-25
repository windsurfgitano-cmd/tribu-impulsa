#!/bin/bash

# ==================================================
# SCRIPT DE VERIFICACIÓN DE SEGURIDAD
# Tribu Impulsa PWA
# ==================================================
# Verifica que archivos sensibles NO están en Git
# antes de hacer push.
#
# USO:
#   bash verificar-seguridad.sh
#
# O configurar como pre-push hook:
#   cp verificar-seguridad.sh .git/hooks/pre-push
#   chmod +x .git/hooks/pre-push
# ==================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "=========================================="
echo "  VERIFICACIÓN DE SEGURIDAD PRE-PUSH"
echo "  Tribu Impulsa PWA"
echo "=========================================="
echo -e "${NC}"

# ==================================================
# VERIFICACIONES
# ==================================================

total_checks=0
failed_checks=0

echo -e "${YELLOW}Ejecutando verificaciones de seguridad...${NC}"
echo ""

# ==================================================
# CHECK 1: Archivos sensibles en staging
# ==================================================

echo -e "${BLUE}[1/7] Verificando staging area...${NC}"
((total_checks++))

dangerous_files=(
    ".env"
    ".env.local"
    ".env.production"
    "firebase-adminsdk"
    "serviceAccount"
    "api-keys"
    "credentials"
    "secrets"
)

found_sensitive=0
for pattern in "${dangerous_files[@]}"; do
    if git diff --cached --name-only | grep -i "$pattern" > /dev/null 2>&1; then
        echo -e "${RED}  ❌ Archivo sensible en staging: $pattern${NC}"
        ((found_sensitive++))
    fi
done

if [ $found_sensitive -eq 0 ]; then
    echo -e "${GREEN}  ✅ No hay archivos sensibles en staging${NC}"
else
    echo -e "${RED}  ❌ Encontrados $found_sensitive archivos sensibles${NC}"
    ((failed_checks++))
fi
echo ""

# ==================================================
# CHECK 2: Archivos sensibles trackeados
# ==================================================

echo -e "${BLUE}[2/7] Verificando archivos trackeados...${NC}"
((total_checks++))

tracked_sensitive=(
    "tribu-impulsa-firebase-adminsdk"
    ".env"
    "serviceAccount"
    "credentials/"
    "private/"
)

found_tracked=0
for pattern in "${tracked_sensitive[@]}"; do
    if git ls-files | grep -i "$pattern" > /dev/null 2>&1; then
        echo -e "${RED}  ❌ Archivo sensible trackeado: $pattern${NC}"
        git ls-files | grep -i "$pattern"
        ((found_tracked++))
    fi
done

if [ $found_tracked -eq 0 ]; then
    echo -e "${GREEN}  ✅ No hay archivos sensibles trackeados${NC}"
else
    echo -e "${RED}  ❌ Encontrados $found_tracked tipos de archivos sensibles${NC}"
    ((failed_checks++))
fi
echo ""

# ==================================================
# CHECK 3: Carpetas sensibles
# ==================================================

echo -e "${BLUE}[3/7] Verificando carpetas sensibles...${NC}"
((total_checks++))

dangerous_folders=(
    "reuniones"
    "REUNIONES"
    "RESPALDO"
    "backups"
    "OTROS"
    "INTERNO"
    "credentials"
    "private"
)

found_folders=0
for folder in "${dangerous_folders[@]}"; do
    if git ls-files | grep "^${folder}/" > /dev/null 2>&1; then
        echo -e "${RED}  ❌ Carpeta sensible trackeada: $folder/${NC}"
        ((found_folders++))
    fi
done

if [ $found_folders -eq 0 ]; then
    echo -e "${GREEN}  ✅ No hay carpetas sensibles trackeadas${NC}"
else
    echo -e "${RED}  ❌ Encontradas $found_folders carpetas sensibles${NC}"
    ((failed_checks++))
fi
echo ""

# ==================================================
# CHECK 4: .gitignore existe y funciona
# ==================================================

echo -e "${BLUE}[4/7] Verificando .gitignore...${NC}"
((total_checks++))

if [ ! -f ".gitignore" ]; then
    echo -e "${RED}  ❌ .gitignore NO existe${NC}"
    ((failed_checks++))
else
    # Verificar que tiene las entradas esenciales
    essential_entries=(
        "*.env"
        "INTERNO/"
        "*firebase-adminsdk*.json"
        "credentials/"
    )
    
    missing_entries=0
    for entry in "${essential_entries[@]}"; do
        if ! grep -q "$entry" .gitignore; then
            echo -e "${YELLOW}  ⚠️  Falta entrada en .gitignore: $entry${NC}"
            ((missing_entries++))
        fi
    done
    
    if [ $missing_entries -eq 0 ]; then
        echo -e "${GREEN}  ✅ .gitignore configurado correctamente${NC}"
    else
        echo -e "${YELLOW}  ⚠️  .gitignore incompleto ($missing_entries entradas)${NC}"
    fi
fi
echo ""

# ==================================================
# CHECK 5: Credenciales en código
# ==================================================

echo -e "${BLUE}[5/7] Buscando credenciales hardcodeadas...${NC}"
((total_checks++))

suspicious_patterns=(
    "AIzaSy"              # Google API Keys
    "sk_live_"            # Stripe secret keys
    "pk_live_"            # Stripe public keys
    "APP_USR"             # MercadoPago
    "firebase.*admin.*sdk" # Firebase Admin
    "password.*=.*['\"]"  # Passwords hardcodeadas
    "api.*key.*=.*['\"]"  # API keys
)

found_hardcoded=0
for pattern in "${suspicious_patterns[@]}"; do
    # Buscar en archivos staged
    if git diff --cached --name-only -z | xargs -0 grep -HnE "$pattern" 2>/dev/null; then
        echo -e "${RED}  ❌ Posible credencial hardcodeada: $pattern${NC}"
        ((found_hardcoded++))
    fi
done

if [ $found_hardcoded -eq 0 ]; then
    echo -e "${GREEN}  ✅ No se encontraron credenciales hardcodeadas${NC}"
else
    echo -e "${RED}  ❌ Encontradas $found_hardcoded posibles credenciales${NC}"
    ((failed_checks++))
fi
echo ""

# ==================================================
# CHECK 6: Scripts peligrosos en public/
# ==================================================

echo -e "${BLUE}[6/7] Verificando scripts admin en public/...${NC}"
((total_checks++))

dangerous_scripts=(
    "public/reset-"
    "public/cleanup-"
    "public/delete-"
    "public/admin-"
)

found_scripts=0
for script in "${dangerous_scripts[@]}"; do
    if git ls-files | grep -i "$script" > /dev/null 2>&1; then
        echo -e "${RED}  ❌ Script peligroso en public/: $script${NC}"
        ((found_scripts++))
    fi
done

if [ $found_scripts -eq 0 ]; then
    echo -e "${GREEN}  ✅ No hay scripts peligrosos en public/${NC}"
else
    echo -e "${RED}  ❌ Encontrados $found_scripts scripts peligrosos${NC}"
    ((failed_checks++))
fi
echo ""

# ==================================================
# CHECK 7: Tamaño de archivos grandes
# ==================================================

echo -e "${BLUE}[7/7] Verificando archivos grandes...${NC}"
((total_checks++))

large_files=0
while IFS= read -r file; do
    size=$(wc -c < "$file" 2>/dev/null || echo 0)
    # Si es mayor a 10MB
    if [ $size -gt 10485760 ]; then
        echo -e "${YELLOW}  ⚠️  Archivo grande ($(($size / 1048576))MB): $file${NC}"
        ((large_files++))
    fi
done < <(git diff --cached --name-only)

if [ $large_files -eq 0 ]; then
    echo -e "${GREEN}  ✅ No hay archivos excesivamente grandes${NC}"
else
    echo -e "${YELLOW}  ⚠️  Encontrados $large_files archivos grandes${NC}"
fi
echo ""

# ==================================================
# RESUMEN
# ==================================================

echo -e "${BLUE}=========================================="
echo "  RESUMEN DE VERIFICACIÓN"
echo "==========================================${NC}"
echo ""
echo "Total de verificaciones: $total_checks"
echo -e "Verificaciones ${GREEN}pasadas${NC}: $((total_checks - failed_checks))"
echo -e "Verificaciones ${RED}fallidas${NC}: $failed_checks"
echo ""

if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}=========================================="
    echo "  ✅ SEGURIDAD VERIFICADA"
    echo "  Es seguro hacer push"
    echo "==========================================${NC}"
    exit 0
else
    echo -e "${RED}=========================================="
    echo "  ❌ PROBLEMAS DE SEGURIDAD DETECTADOS"
    echo "  NO es seguro hacer push"
    echo "==========================================${NC}"
    echo ""
    echo -e "${YELLOW}Acciones recomendadas:${NC}"
    echo ""
    
    if [ $found_sensitive -gt 0 ] || [ $found_tracked -gt 0 ]; then
        echo "1. Remover archivos sensibles del staging:"
        echo -e "   ${GREEN}git reset HEAD archivo-sensible${NC}"
        echo ""
    fi
    
    if [ $found_folders -gt 0 ]; then
        echo "2. Remover carpetas sensibles del tracking:"
        echo -e "   ${GREEN}git rm -r --cached carpeta-sensible/${NC}"
        echo ""
    fi
    
    if [ $found_hardcoded -gt 0 ]; then
        echo "3. Remover credenciales hardcodeadas:"
        echo "   - Usar variables de entorno"
        echo "   - Actualizar archivos y volver a commitear"
        echo ""
    fi
    
    if [ $found_scripts -gt 0 ]; then
        echo "4. Mover scripts admin a INTERNO/:"
        echo -e "   ${GREEN}mv public/reset-*.html INTERNO/scripts-admin/${NC}"
        echo ""
    fi
    
    echo "5. Después de corregir, ejecutar de nuevo:"
    echo -e "   ${GREEN}bash verificar-seguridad.sh${NC}"
    echo ""
    
    exit 1
fi

