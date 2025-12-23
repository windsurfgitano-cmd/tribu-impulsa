# Instrucciones para Generar PDFs Legales

Se han creado dos archivos Markdown con el contenido completo de los documentos legales:

1. `public/terminosycondiciones.md`
2. `public/politicasdeprivacidad.md`

**IMPORTANTE:** Debes convertir estos archivos a PDF para que los enlaces en la aplicación funcionen correctamente.

---

## Método 1: Herramienta Online (Recomendado)

### Opción A: Markdown to PDF (https://www.markdowntopdf.com/)

1. Ir a https://www.markdowntopdf.com/
2. Click en "Choose File" y seleccionar `terminosycondiciones.md`
3. Click en "Convert"
4. Descargar el PDF generado
5. Guardar como `public/terminosycondiciones.pdf`
6. Repetir para `politicasdeprivacidad.md`

### Opción B: Dillinger (https://dillinger.io/)

1. Ir a https://dillinger.io/
2. Copiar y pegar el contenido de `terminosycondiciones.md`
3. Click en "Export as" → "Styled HTML"
4. Abrir el HTML en el navegador
5. Ctrl+P (Imprimir) → "Save as PDF"
6. Guardar como `public/terminosycondiciones.pdf`
7. Repetir para `politicasdeprivacidad.md`

---

## Método 2: Usando Pandoc (Requiere instalación)

### Instalar Pandoc

**Windows:**
```bash
winget install pandoc
```

**Mac:**
```bash
brew install pandoc
```

**Linux:**
```bash
sudo apt-get install pandoc texlive
```

### Convertir a PDF

Desde el directorio del proyecto:

```bash
# Términos y Condiciones
pandoc public/terminosycondiciones.md -o public/terminosycondiciones.pdf --pdf-engine=xelatex

# Política de Privacidad
pandoc public/politicasdeprivacidad.md -o public/politicasdeprivacidad.pdf --pdf-engine=xelatex
```

---

## Método 3: Usando VS Code (Si tienes la extensión)

1. Instalar extensión "Markdown PDF" en VS Code
2. Abrir `terminosycondiciones.md`
3. Presionar `Ctrl+Shift+P` (Cmd+Shift+P en Mac)
4. Escribir "Markdown PDF: Export (pdf)"
5. El PDF se guardará automáticamente en la misma carpeta
6. Repetir para `politicasdeprivacidad.md`

---

## Método 4: Google Docs (Online, gratis)

1. Ir a https://docs.google.com/
2. Click en "+ Nuevo" → "Archivo" → "Subir"
3. Subir `terminosycondiciones.md`
4. Abrir el archivo subido
5. Click en "Archivo" → "Descargar" → "Documento PDF (.pdf)"
6. Guardar como `terminosycondiciones.pdf`
7. Mover el PDF a `public/`
8. Repetir para `politicasdeprivacidad.md`

---

## Verificación

Una vez generados los PDFs, verifica que:

- [ ] `public/terminosycondiciones.pdf` existe y se puede abrir
- [ ] `public/politicasdeprivacidad.pdf` existe y se puede abrir
- [ ] Ambos PDFs están legibles y bien formateados
- [ ] Los títulos y secciones se ven correctamente
- [ ] Los enlaces funcionan en la aplicación:
  - Ir a la landing page
  - Click en "términos y condiciones" → debe abrir el PDF
  - Click en "política de privacidad" → debe abrir el PDF

---

## Notas Importantes

### Campos a Completar Antes de Convertir

Los archivos Markdown contienen marcadores que debes reemplazar con información real:

**En ambos archivos:**
- `[NOMBRE DE LA EMPRESA]` → Nombre legal de la empresa
- `[RUT]` → RUT de la empresa
- `[DIRECCIÓN]` → Dirección física de la empresa
- `[EMAIL DE CONTACTO]` → Email de soporte/contacto
- `[EMAIL DE SOPORTE]` → Email de soporte técnico
- `[NÚMERO DE WHATSAPP]` → Número de WhatsApp con código de país
- `[CIUDAD]` → Ciudad para jurisdicción legal (ej. Santiago)

**Reemplazar ANTES de convertir a PDF para evitar tener que regenerar.**

### Formato Recomendado para PDFs

- **Tamaño de página:** A4
- **Márgenes:** 2cm en todos los lados
- **Fuente:** Arial o Helvetica, tamaño 10-11pt
- **Encabezados:** Tamaño 14-16pt, negrita
- **Interlineado:** 1.15 o 1.5

---

## Alternativa Rápida (Si tienes prisa)

Si necesitas publicar urgentemente y no puedes generar PDFs ahora:

1. Renombrar los .md a .txt temporalmente
2. Los enlaces seguirán funcionando (browsers pueden abrir .txt)
3. Usuarios podrán leer el contenido
4. **Generar PDFs lo antes posible para cumplimiento legal**

---

## Actualización de la Aplicación

Los enlaces en la aplicación ya apuntan a:

- `https://tribu-impulsa.vercel.app/terminosycondiciones.pdf`
- `https://tribu-impulsa.vercel.app/politicasdeprivacidad.pdf`

Una vez que agregues los PDFs al directorio `public/`, estarán disponibles automáticamente en esas URLs después del siguiente deployment.

---

## Soporte

Si tienes problemas generando los PDFs, contacta al desarrollador o usa el Método 1 (herramienta online) que es el más simple.

**Creado:** 23 de Diciembre, 2025

