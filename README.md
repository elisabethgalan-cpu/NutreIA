# NutreIA: Asistente Familiar de Alimentación y Entrenamiento

Aplicación web full-stack, modular y responsive, diseñada para gestionar dos áreas fundamentales para el núcleo familiar:
1. **Alimentación Mediterránea:** Planificación semanal (7 días x 3 comidas), catálogo de recetas, información nutricional basada en ingredientes contrastados (BEDCA / USDA), cálculo de raciones adaptadas por miembro, valoraciones individuales (1-5 estrellas) y lista de la compra consolidada.
2. **Entrenamiento de Gimnasio:** Inventario de máquinas disponibles, selección de grupos musculares, catálogo de ejercicios técnicos, registro de sesión activa, algoritmo conservador de sobrecarga progresiva basado en RPE y saltos reales de la máquina.

---

## 🛡️ Reglas Críticas de Seguridad y Salud
- **Protección Pediátrica:** Si un miembro es menor de edad (<18 años), se bloquea cualquier dieta hipocalórica (<1.800 kcal) o prescripción restrictiva de 1.500 kcal. Se muestra el aviso de supervisión pediátrica o por dietista-nutricionista.
- **Bloqueo Estricto de Alérgenos:** Cruce automático de recetas con las alergias o intolerancias activas de cada miembro.
- **Seguridad Deportiva:** Ante cualquier reporte de dolor articular o molestia, se interrumpe de inmediato la recomendación de progresión y se genera alerta médica. La progresión solo se sugiere si la técnica es correcta y el RPE es moderado (≤ 7.0).

---

## 🚀 Pila Tecnológica
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts
- **Validación y Contratos:** Zod
- **Base de Datos y Seguridad:** Supabase (PostgreSQL 15+, Supabase Auth, Row Level Security estricto)
- **Motor de Inteligencia Artificial:** Google Gemini API (`@google/generative-ai`), orquestado en endpoints de backend protegidos
- **Despliegue:** Vercel

---

## 📦 Instalación y Ejecución Local

### 1. Clonar e Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```
Rellena las variables:
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (obtenidas desde tu proyecto en [Supabase](https://supabase.com/)).
- `GEMINI_API_KEY` (obtenida de forma gratuita en [Google AI Studio](https://aistudio.google.com/)).

### 3. Configuración de Base de Datos en Supabase
En el panel de tu proyecto en Supabase (sección **SQL Editor**), ejecuta en orden:
1. `supabase/migrations/20261105000001_initial_schema.sql` (Crea todas las tablas e índices).
2. `supabase/migrations/20261105000002_rls_policies.sql` (Activa el Row Level Security y políticas de aislamiento).
3. `supabase/seed.sql` (Carga alérgenos, ingredientes contrastados, nutrientes, máquinas y ejercicios de demostración).

### 4. Ejecutar Pruebas Automatizadas
```bash
npm run test
```

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación se abrirá en `http://localhost:3000`.

---

## ☁️ Despliegue en Vercel
1. Sube tu código a GitHub.
2. Importa el repositorio en [Vercel](https://vercel.com).
3. Configura las variables de entorno en el panel de Vercel (`GEMINI_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Haz clic en **Deploy**. El archivo `vercel.json` ya incluye los rewrites y las cabeceras de seguridad.
