# Arquitectura Técnica: Asistente Familiar NutreIA

## 1. Visión General
Asistente web full-stack, responsive y modular, diseñado para resolver dos áreas funcionales desacopladas pero integradas para el núcleo familiar:
1. **Alimentación familiar:** Planificación semanal mediterránea (7 días x 3 comidas), catálogo de recetas, información nutricional basada en ingredientes contrastados, cálculo y adaptación de raciones individuales, valoraciones por miembro y lista de la compra.
2. **Entrenamiento de gimnasio:** Inventario de máquinas de musculación, catálogo de ejercicios agrupados por musculatura, generador determinista de rutinas según disponibilidad, registro de series en sesión activa, algoritmo conservador de sobrecarga progresiva e histórico de rendimiento.

## 2. Principios de Diseño
- **Seguridad primero:** La IA propone, pero el backend valida de forma determinista (esquemas Zod).
- **Protección a menores:** Prohibición absoluta de dietas de adelgazamiento y metas hipocalóricas a menores de edad; se requiere supervisión pediátrica o dietista-nutricionista.
- **Seguridad en gimnasio:** Prohibición de incrementos de peso si se reporta dolor o fallos técnicos. Progresión vinculada a los saltos reales de la máquina y al RPE.
- **Aislamiento Multi-inquilino (Multi-tenant):** Seguridad a nivel de fila (Row Level Security - RLS) en PostgreSQL/Supabase por `family_id`.
- **Privacidad intra-familiar:** Las métricas corporales (peso, altura) y valoraciones personales no son visibles por defecto a otros miembros sin permiso.

## 3. Pila Tecnológica (Tech Stack)
- **Frontend:** React 18 + TypeScript + Vite.
- **Estilos:** Tailwind CSS con tokens semánticos familiares (verde/oliva para nutrición, azul/acero para entrenamiento).
- **Componentes:** Radix UI / shadcn/ui (accesibles, teclado y lectores de pantalla según WCAG AA).
- **Enrutamiento:** React Router 6.
- **Formularios & Validación:** React Hook Form + Zod.
- **Visualización de Datos:** Recharts.
- **Backend & Persistencia:** Supabase (PostgreSQL 15+, Supabase Auth, Storage para imágenes).
- **Servicios de IA:** Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`), orquestado exclusivamente en endpoints serverless protegidos (Vercel Functions o Supabase Edge Functions).
- **Despliegue:** Vercel (Frontend SPA + API serverless segura).
- **Testing:** Vitest para lógica de dominio, testing library para componentes.

## 4. Estructura de Carpetas

```text
c:\Users\Eli\Desktop\Proyecto NutreIA/
├── .env.example
├── README.md
├── vercel.json
├── docs/
│   ├── especificacion_antigravity_alimentacion_entrenamiento.md
│   ├── architecture.md
│   ├── data-model.md
│   ├── decisions.md
│   └── test-plan.md
├── supabase/
│   ├── migrations/
│   │   ├── 20261105000001_initial_schema.sql
│   │   └── 20261105000002_rls_policies.sql
│   └── seed.sql
├── api/                           # Funciones Serverless de Vercel
│   └── ai/
│       ├── generate-menu.ts
│       └── recommend-workout.ts
└── src/
    ├── app/
    │   ├── layouts/
    │   ├── providers/
    │   └── routes.tsx
    ├── components/
    │   ├── ui/                    # Botones, modales, cards, inputs
    │   ├── shared/                # Navbar, Sidebar, MemberSelector
    │   └── alerts/                # Banners médicos y de seguridad
    ├── features/
    │   ├── auth/                  # Login, registro, recuperación
    │   ├── family/                # Gestión de familia y miembros
    │   ├── dashboard/             # Resumen semanal y accesos rápidos
    │   ├── nutrition/             # Menú semanal, recetas, raciones, valoraciones, lista compra
    │   └── training/              # Gimnasios, máquinas, ejercicios, rutinas, sesión activa
    ├── lib/
    │   ├── supabase/              # Cliente Supabase tipado
    │   ├── nutrition/             # Motor determinista de cálculo nutricional y alérgenos
    │   ├── training/              # Algoritmo de progresión de cargas
    │   └── validation/            # Esquemas Zod compartidos
    ├── hooks/
    ├── types/                     # Tipos TypeScript autogenerados de Supabase
    └── test/                      # Tests unitarios y de integración
```
