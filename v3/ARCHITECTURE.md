# Arquitectura del Proyecto V3 (Modular)

Este proyecto sigue una arquitectura modular estándar en React para asegurar escalabilidad y mantenibilidad.

## Estructura de Directorios

\`\`\`bash
src/
├── components/          # Elementos visuales reutilizables
│   ├── ui/              # Componentes de presentación puros (Botones, Inputs, Cards)
│   └── features/        # Componentes con lógica de negocio específica (TribeCard, ActivityFeed)
├── screens/             # Páginas completas (vistas por ruta)
│   ├── auth/            # Flujos de autenticación (Login, Registro)
│   └── app/             # Flujos principales de la app (Dashboard, Tribu)
├── navigation/          # Configuración de rutas y protección de acceso
├── hooks/               # Lógica de estado y efectos extraída (Custom Hooks)
├── services/            # Comunicación con el mundo exterior (APIs, Firebase)
│   └── api/             # Fachadas limpias por dominio (auth, users, tribes)
├── context/             # Estado global de la aplicación (AuthContext, ThemeContext)
└── utils/               # Funciones puras de ayuda (formatters, validators)
\`\`\`

## Reglas de Oro

1.  **Separación de Responsabilidades:**
    *   Una **Screen** orquesta datos.
    *   Un **Component** solo muestra datos.
    *   Un **Hook** maneja la lógica compleja.

2.  **Servicios Unificados:**
    *   La UI nunca debe importar `firebase` directamente.
    *   Siempre importar desde `@/services/api/nombreDelServicio`.

3.  **Documentación:**
    *   Si creas una carpeta nueva, añade su descripción aquí.
