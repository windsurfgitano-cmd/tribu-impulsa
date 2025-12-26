# 🚀 Migración Completa a Supabase

## ✅ Estado de la Migración

### Completado:
- ✅ Instalación de `@supabase/supabase-js`
- ✅ Actualización de `env.example` con variables de Supabase
- ✅ Creación de `services/supabaseService.ts` (servicio completo)
- ✅ Migración de `services/realUsersData.ts` (auth con Supabase)
- ✅ Migración de `screens/auth/LoginScreen.tsx` (UI de login)
- ✅ Contador en tiempo real con Supabase Realtime

### Pendiente:
- ⏳ Ejecutar SQL en Supabase Dashboard
- ⏳ Configurar Storage en Supabase
- ⏳ Crear archivo `.env` local con credenciales
- ⏳ Configurar variables de entorno en Vercel
- ⏳ Testing completo

---

## 📋 Pasos para Completar la Migración

### 1️⃣ Ejecutar SQL en Supabase

Ve a tu proyecto: https://supabase.com/dashboard/project/ctazrxccukedwifhwaei

1. Click en **SQL Editor** (menú lateral)
2. Click en **New Query**
3. Copia y pega el siguiente SQL:

```sql
-- ============================================
-- TRIBU IMPULSA - SCHEMA COMPLETO SUPABASE
-- ============================================

-- Tabla principal de usuarios
CREATE TABLE users (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  
  -- Información personal
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  
  -- Redes sociales
  instagram TEXT,
  website TEXT,
  linkedin TEXT,
  tiktok TEXT,
  
  -- Categorías (JSONB para soportar arrays)
  category JSONB NOT NULL DEFAULT '[]'::jsonb,
  affinity TEXT,
  sub_category TEXT,
  
  -- Ubicación geográfica
  scope TEXT CHECK (scope IN ('NACIONAL', 'REGIONAL', 'LOCAL')),
  city TEXT,
  comuna TEXT,
  selected_regions JSONB DEFAULT '[]'::jsonb,
  
  -- Perfil de negocio
  bio TEXT,
  business_description TEXT,
  revenue TEXT,
  
  -- Visual
  avatar_url TEXT,
  company_logo_url TEXT,
  cover_url TEXT,
  followers INTEGER DEFAULT 0,
  
  -- Estado y permisos
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended', 'pending')) DEFAULT 'active',
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  profile_complete BOOLEAN DEFAULT false,
  onboarding_complete BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT false,
  survey_completed BOOLEAN DEFAULT false,
  tribe_assigned BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_scope ON users(scope);
CREATE INDEX idx_users_category ON users USING GIN(category);
CREATE INDEX idx_users_auth_uid ON users(auth_uid);

-- Tabla de notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Tabla de asignaciones de tribu
CREATE TABLE tribe_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  assigned_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'completed', 'skipped')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, assigned_user_id)
);

CREATE INDEX idx_tribe_assignments_user_id ON tribe_assignments(user_id);
CREATE INDEX idx_tribe_assignments_month ON tribe_assignments(month);

-- Tabla de interacciones
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('like', 'message', 'view', 'contact', 'share')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_from_user ON interactions(from_user_id);
CREATE INDEX idx_interactions_to_user ON interactions(to_user_id);
CREATE INDEX idx_interactions_type ON interactions(type);

-- Tabla de estadísticas del sistema
CREATE TABLE system_stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  profiles_completed INTEGER DEFAULT 0,
  members_active INTEGER DEFAULT 0,
  profiles_target INTEGER DEFAULT 1000,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar registro inicial
INSERT INTO system_stats (id, profiles_completed, members_active, profiles_target)
VALUES ('global', 0, 0, 1000);

-- Tabla de membresías
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  status TEXT CHECK (status IN ('trial', 'miembro', 'admin', 'inactivo')) DEFAULT 'trial',
  plan TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  payment_method TEXT,
  last_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Todos pueden ver perfiles activos" ON users
  FOR SELECT USING (status = 'active');

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON users
  FOR UPDATE USING (auth.uid() = auth_uid);

CREATE POLICY "Usuarios pueden insertar su propio perfil" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_uid);

-- Políticas para notifications
CREATE POLICY "Usuarios ven solo sus notificaciones" ON notifications
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

CREATE POLICY "Usuarios actualizan solo sus notificaciones" ON notifications
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Políticas para tribe_assignments
CREATE POLICY "Usuarios ven sus asignaciones" ON tribe_assignments
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()) OR 
    assigned_user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid())
  );

-- Políticas para interactions
CREATE POLICY "Usuarios ven sus interacciones" ON interactions
  FOR SELECT USING (
    from_user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()) OR 
    to_user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid())
  );

CREATE POLICY "Usuarios crean interacciones" ON interactions
  FOR INSERT WITH CHECK (from_user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Políticas para memberships
CREATE POLICY "Usuarios ven su membresía" ON memberships
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- system_stats: lectura pública
CREATE POLICY "Todos pueden ver estadísticas" ON system_stats
  FOR SELECT USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para incrementar contador de perfiles
CREATE OR REPLACE FUNCTION increment_profiles_completed()
RETURNS void AS $$
BEGIN
  UPDATE system_stats 
  SET profiles_completed = profiles_completed + 1,
      members_active = members_active + 1,
      last_updated = NOW()
  WHERE id = 'global';
END;
$$ LANGUAGE plpgsql;
```

4. Click en **Run** (o presiona `Ctrl+Enter`)
5. Verifica que todo se ejecutó correctamente ✅

---

### 2️⃣ Configurar Storage para Imágenes

En el dashboard de Supabase:

1. Ve a **Storage** en el menú lateral
2. Click en **New bucket**
3. Nombre: `profile-images`
4. **Public bucket**: ✅ Activar
5. Click en **Create bucket**

Luego, configura las políticas de seguridad en **SQL Editor**:

```sql
-- Permitir lectura pública de imágenes
CREATE POLICY "Imágenes públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Permitir subida solo a usuarios autenticados de sus propias imágenes
CREATE POLICY "Usuarios suben sus imágenes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir actualización de sus propias imágenes
CREATE POLICY "Usuarios actualizan sus imágenes" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir eliminación de sus propias imágenes
CREATE POLICY "Usuarios eliminan sus imágenes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

### 3️⃣ Crear archivo `.env` local

Crea un archivo `.env` en la raíz del proyecto con tus credenciales:

```env
VITE_SUPABASE_URL=https://ctazrxccukedwifhwaei.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

⚠️ **IMPORTANTE**: NO commitees este archivo (ya está en `.gitignore`)

---

### 4️⃣ Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel:

1. **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://ctazrxccukedwifhwaei.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Tu anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service role key de Supabase |

3. Aplica a: **Production**, **Preview**, y **Development**
4. Click en **Save**

---

### 5️⃣ Testing Local

```bash
# Instalar dependencias (si no lo hiciste)
npm install

# Ejecutar en desarrollo
npm run dev
```

**Pruebas a realizar:**

1. ✅ Registro de nuevo usuario
2. ✅ Login con usuario existente
3. ✅ Contador en tiempo real (debe actualizarse automáticamente)
4. ✅ Subida de imágenes de perfil
5. ✅ Recuperación de contraseña

---

### 6️⃣ Deploy a Producción

```bash
# Commitear cambios
git add .
git commit -m "feat: Migración completa a Supabase"
git push origin main
```

Vercel desplegará automáticamente con las variables de entorno configuradas.

---

## 🎯 Cambios Principales

### Archivos Creados:
- ✅ `services/supabaseService.ts` - Servicio completo de Supabase

### Archivos Modificados:
- ✅ `env.example` - Agregadas variables de Supabase
- ✅ `services/realUsersData.ts` - Migrado a Supabase Auth
- ✅ `screens/auth/LoginScreen.tsx` - Actualizado para Supabase
- ✅ `package.json` - Agregada dependencia `@supabase/supabase-js`

### Funciones Migradas:
- ✅ `registerNewUser()` - Ahora usa Supabase Auth + PostgreSQL
- ✅ `validateCredentials()` - Ahora usa Supabase Auth
- ✅ `getUserFromFirebaseByEmail()` - Ahora busca en Supabase
- ✅ Contador en tiempo real - Ahora usa Supabase Realtime

---

## 🔥 Beneficios de la Migración

✅ **PostgreSQL**: Base de datos relacional más robusta  
✅ **Costos predecibles**: Pricing más claro que Firebase  
✅ **SQL nativo**: Queries más potentes  
✅ **Realtime incluido**: Sin costo adicional  
✅ **Mejor control**: Acceso directo a la base de datos  
✅ **Open source**: Supabase es código abierto  

---

## 📞 Soporte

Si tienes problemas durante la migración:

1. Verifica que las credenciales en `.env` y Vercel sean correctas
2. Revisa la consola del navegador para errores
3. Verifica que el SQL se ejecutó correctamente en Supabase
4. Asegúrate de que el bucket `profile-images` esté público

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación estará completamente migrada a Supabase y lista para producción. 🚀

