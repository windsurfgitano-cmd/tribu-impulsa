# Guía de Migración - App.tsx Modular

## 📂 Nueva Estructura de Archivos

```
src/
├── App.tsx                    # → Reducir a solo routing (~100 líneas)
├── components/
│   ├── common/                # Componentes reutilizables
│   ├── layout/                # Layout, navegación
│   └── profile/               # Componentes de perfil
├── screens/                   # ✅ CREADOS (scaffolds)
│   ├── auth/
│   │   ├── LoginScreen.tsx    # Migrar líneas ~759-1890
│   │   └── RegisterScreen.tsx # Migrar líneas ~1890-2364
│   ├── dashboard/
│   │   └── Dashboard.tsx      # Migrar líneas ~7170-7454
│   ├── tribe/
│   │   └── TribeAssignmentsView.tsx  # Migrar líneas ~3113-4035
│   └── profile/
│       └── MyProfileView.tsx  # Migrar líneas ~4057-5241
├── hooks/                     # ✅ CREADOS
│   ├── useAuth.ts
│   ├── useSurveyGuard.ts
│   ├── useTribe.ts
│   ├── useProfilesProgress.ts
│   └── index.ts
├── services/                  # ✅ CREADOS
│   ├── tribeStorage.ts        # Gestión de asignaciones
│   ├── surveyService.ts       # Gestión de encuestas
│   ├── firebaseService.ts     # (existente)
│   └── databaseService.ts     # (existente)
├── utils/                     # ✅ CREADOS
│   ├── storage.ts             # Session y localStorage
│   ├── validation.ts          # Validación de perfiles
│   └── index.ts
└── constants/                 # (existentes)
```

## 🚀 Pasos de Migración

### Paso 1: Verificar que la app funciona
```bash
npm run dev
```
La app debería funcionar igual que antes, ya que App.tsx no ha sido modificado.

### Paso 2: Migrar un componente a la vez

#### Ejemplo: Migrar Dashboard

1. **Abre** `App.tsx` y busca `const Dashboard = ` (~línea 7170)
2. **Copia** todo el componente hasta su cierre `};`
3. **Pega** en `screens/dashboard/Dashboard.tsx`
4. **Actualiza imports** en el nuevo archivo
5. **En App.tsx**, reemplaza el componente por:
   ```tsx
   import { Dashboard } from './screens/dashboard';
   ```
6. **Elimina** la definición original de Dashboard en App.tsx
7. **Prueba** que todo funcione

### Paso 3: Repetir para cada componente

| Componente | Ubicación en App.tsx | Nuevo archivo |
|------------|---------------------|---------------|
| LoginScreen | ~759-1890 | screens/auth/LoginScreen.tsx |
| RegisterScreen | ~1890-2364 | screens/auth/RegisterScreen.tsx |
| TribeAssignmentsView | ~3113-4035 | screens/tribe/TribeAssignmentsView.tsx |
| MyProfileView | ~4057-5241 | screens/profile/MyProfileView.tsx |
| Dashboard | ~7170-7454 | screens/dashboard/Dashboard.tsx |
| AdminPanelInline | ~8338-9073 | screens/admin/AdminPanelInline.tsx |

### Paso 4: Usar los nuevos hooks

Reemplaza lógica inline por hooks:

```tsx
// ANTES (en App.tsx)
const useSurveyGuard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!hasCompletedSurvey()) {
      navigate('/survey', { replace: true });
    }
  }, [navigate]);
};

// DESPUÉS (importar desde hooks)
import { useSurveyGuard } from './hooks';
```

### Paso 5: Usar los nuevos servicios

```tsx
// ANTES
const getStoredTribeAssignments = (...) => { ... };

// DESPUÉS
import { getStoredTribeAssignments } from './services/tribeStorage';
```

## ✅ Archivos Ya Migrados

### utils/storage.ts
- `getUserStorageKey()`
- `getStoredSession()`
- `setStoredSession()`
- `clearStoredSession()`
- `getAppConfig()`

### utils/validation.ts
- `validateUserProfile()`
- `isProfileComplete()`
- `syncProfileCompletionState()`
- `BASE_PROFILE_REQUIREMENTS`
- `MIN_BIO_LENGTH`
- `MIN_BUSINESS_DESC_LENGTH`

### services/tribeStorage.ts
- `getStoredTribeAssignments()`
- `persistTribeAssignments()`
- `getStoredChecklistState()`
- `persistChecklistState()`
- `getStoredTribeStatus()`
- `persistTribeStatus()`
- `getTribeStatsSnapshot()`
- `getStoredReports()`
- `persistReport()`

### services/surveyService.ts
- `getStoredSurveyResponse()`
- `hasCompletedSurvey()`
- `persistSurveyResponse()`
- `EMPTY_SURVEY_FORM`

### hooks/
- `useAuth` - Gestión de autenticación
- `useSurveyGuard` - Verificación de encuesta
- `useTribe` - Gestión de tribu

## ⚠️ Consideraciones

1. **No romper la app**: Migra de a poco, probando después de cada cambio
2. **Imports circulares**: Cuidado con dependencias entre archivos
3. **Types**: Asegúrate de exportar/importar tipos correctamente
4. **Testing**: Prueba cada flujo después de migrar

## 📊 Progreso

- [x] Estructura de carpetas
- [x] utils/storage.ts
- [x] utils/validation.ts
- [x] services/tribeStorage.ts
- [x] services/surveyService.ts
- [x] hooks/useAuth.ts
- [x] hooks/useSurveyGuard.ts
- [x] hooks/useTribe.ts
- [ ] screens/auth/LoginScreen.tsx (scaffold)
- [ ] screens/auth/RegisterScreen.tsx (scaffold)
- [ ] screens/tribe/TribeAssignmentsView.tsx (scaffold)
- [ ] screens/profile/MyProfileView.tsx (scaffold)
- [ ] screens/dashboard/Dashboard.tsx (scaffold)
- [ ] Actualizar App.tsx para usar nuevos módulos
- [ ] Eliminar código duplicado de App.tsx

