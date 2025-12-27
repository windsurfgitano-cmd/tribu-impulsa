-- ============================================
-- AGREGAR COLUMNAS DE REDES SOCIALES FALTANTES
-- ============================================
-- Ejecutar este SQL en Supabase Dashboard > SQL Editor

-- Agregar columnas faltantes de redes sociales
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT;

-- Verificar que linkedin ya existe (debería existir según el schema original)
-- Si no existe, descomenta la siguiente línea:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin TEXT;

-- Verificar estructura final de la tabla (opcional)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- AND column_name IN ('instagram', 'tiktok', 'website', 'linkedin', 'facebook', 'twitter')
-- ORDER BY column_name;

