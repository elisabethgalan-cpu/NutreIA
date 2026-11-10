-- ==============================================================================
-- NutreIA - Script Completo de Inicialización para Supabase
-- Proyecto: ggvxdvqrvhwsekzluggy
-- Instrucciones: Pega y ejecuta este script completo en:
-- https://supabase.com/dashboard/project/ggvxdvqrvhwsekzluggy/sql/new
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLAS PRINCIPALES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.family_members (
    id TEXT PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.member_profiles (
    id TEXT PRIMARY KEY,
    family_member_id TEXT NOT NULL UNIQUE REFERENCES public.family_members(id) ON DELETE CASCADE,
    birth_date DATE NOT NULL,
    height_cm NUMERIC(5,2),
    activity_level TEXT DEFAULT 'moderate',
    nutrition_goal TEXT DEFAULT 'salud_general',
    energy_target_kcal INTEGER,
    training_goal TEXT DEFAULT 'salud_general',
    training_level TEXT DEFAULT 'beginner',
    training_days_per_week INTEGER DEFAULT 3,
    session_duration_minutes INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id TEXT NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    weight_kg NUMERIC(5,2) NOT NULL,
    height_cm NUMERIC(5,2),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.food_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id TEXT NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    preference_type TEXT NOT NULL,
    severity TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.allergens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    default_unit TEXT NOT NULL DEFAULT 'g',
    food_group TEXT NOT NULL,
    nutrition_source TEXT NOT NULL DEFAULT 'BEDCA / USDA',
    nutrition_checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.ingredient_allergens (
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    allergen_id UUID NOT NULL REFERENCES public.allergens(id) ON DELETE CASCADE,
    PRIMARY KEY (ingredient_id, allergen_id)
);

CREATE TABLE IF NOT EXISTS public.ingredient_nutrients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id UUID NOT NULL UNIQUE REFERENCES public.ingredients(id) ON DELETE CASCADE,
    basis_quantity NUMERIC(6,2) NOT NULL DEFAULT 100,
    basis_unit TEXT NOT NULL DEFAULT 'g',
    energy_kcal NUMERIC(6,2) NOT NULL,
    protein_g NUMERIC(6,2) NOT NULL DEFAULT 0,
    carbs_g NUMERIC(6,2) NOT NULL DEFAULT 0,
    fat_g NUMERIC(6,2) NOT NULL DEFAULT 0,
    fiber_g NUMERIC(6,2),
    sugars_g NUMERIC(6,2),
    salt_g NUMERIC(6,2),
    data_completeness TEXT NOT NULL DEFAULT 'complete'
);

CREATE TABLE IF NOT EXISTS public.recipes (
    id TEXT PRIMARY KEY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    prep_time_minutes INTEGER NOT NULL DEFAULT 15,
    cook_time_minutes INTEGER NOT NULL DEFAULT 20,
    category TEXT NOT NULL DEFAULT 'plato_principal',
    image_path TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.menu_ratings (
    id TEXT PRIMARY KEY,
    menu_meal_id TEXT NOT NULL,
    family_member_id TEXT NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    would_repeat BOOLEAN NOT NULL DEFAULT true,
    rated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_menu_meal_member UNIQUE (menu_meal_id, family_member_id)
);

CREATE TABLE IF NOT EXISTS public.gym_machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    machine_type TEXT NOT NULL,
    muscle_groups_primary TEXT[] NOT NULL DEFAULT '{}',
    muscle_groups_secondary TEXT[] NOT NULL DEFAULT '{}',
    manufacturer TEXT,
    model TEXT,
    min_load NUMERIC(6,2),
    max_load NUMERIC(6,2),
    load_increment NUMERIC(5,2) NOT NULL DEFAULT 2.5,
    load_unit TEXT NOT NULL DEFAULT 'kg',
    instructions TEXT,
    image_path TEXT,
    status TEXT NOT NULL DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    primary_muscle_group TEXT NOT NULL,
    secondary_muscle_groups TEXT[] NOT NULL DEFAULT '{}',
    equipment_type TEXT NOT NULL DEFAULT 'machine',
    machine_id UUID REFERENCES public.gym_machines(id) ON DELETE SET NULL,
    difficulty TEXT DEFAULT 'beginner',
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    technique_cues JSONB NOT NULL DEFAULT '[]'::jsonb,
    common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id TEXT PRIMARY KEY,
    family_member_id TEXT NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    gym_id UUID,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    finished_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'completed',
    session_notes TEXT
);

CREATE TABLE IF NOT EXISTS public.exercise_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_session_id TEXT NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL,
    machine_id UUID REFERENCES public.gym_machines(id) ON DELETE SET NULL,
    suggested_load NUMERIC(6,2),
    actual_load NUMERIC(6,2) NOT NULL,
    load_unit TEXT NOT NULL DEFAULT 'kg',
    target_sets INTEGER NOT NULL,
    completed_sets INTEGER NOT NULL,
    target_reps INTEGER NOT NULL,
    reps_per_set JSONB NOT NULL DEFAULT '[]'::jsonb,
    rpe NUMERIC(3,1),
    technique_status TEXT NOT NULL DEFAULT 'correct',
    pain_reported BOOLEAN NOT NULL DEFAULT false,
    pain_notes TEXT,
    notes TEXT
);

-- 2. POLÍTICAS DE ACCESO ROW LEVEL SECURITY (Permite anon y authenticated)
-- ==============================================================================

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_nutrients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_performance ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo / acceso web
CREATE POLICY "Permitir todo acceso familias" ON public.families FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso miembros" ON public.family_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso perfiles" ON public.member_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso alérgenos" ON public.allergens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso ingredientes" ON public.ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso nutrientes" ON public.ingredient_nutrients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso recetas" ON public.recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso valoraciones" ON public.menu_ratings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso máquinas" ON public.gym_machines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso ejercicios" ON public.exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso sesiones" ON public.workout_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso rendimiento" ON public.exercise_performance FOR ALL USING (true) WITH CHECK (true);

-- 3. DATOS SEMILLA INICIALES
-- ==============================================================================

-- Familia Demo
INSERT INTO public.families (id, name) VALUES
('00000000-0000-0000-0000-000000000001', 'Familia López')
ON CONFLICT (id) DO NOTHING;

-- Alérgenos
INSERT INTO public.allergens (id, code, name) VALUES
('00000000-0000-0000-0000-000000000001', 'gluten', 'Gluten'),
('00000000-0000-0000-0000-000000000002', 'crustaceos', 'Crustáceos'),
('00000000-0000-0000-0000-000000000003', 'huevos', 'Huevos'),
('00000000-0000-0000-0000-000000000004', 'pescado', 'Pescado'),
('00000000-0000-0000-0000-000000000005', 'cacahuetes', 'Cacahuetes'),
('00000000-0000-0000-0000-000000000006', 'soja', 'Soja'),
('00000000-0000-0000-0000-000000000007', 'lacteos', 'Lácteos'),
('00000000-0000-0000-0000-000000000008', 'frutos_cascara', 'Frutos de cáscara')
ON CONFLICT (code) DO NOTHING;

-- Ingredientes
INSERT INTO public.ingredients (id, name, default_unit, food_group) VALUES
('10000000-0000-0000-0000-000000000001', 'Aceite de oliva virgen extra', 'ml', 'grasas'),
('10000000-0000-0000-0000-000000000002', 'Pechuga de pollo', 'g', 'carnes'),
('10000000-0000-0000-0000-000000000003', 'Salmón fresco', 'g', 'pescados'),
('10000000-0000-0000-0000-000000000007', 'Espinacas frescas', 'g', 'verduras'),
('10000000-0000-0000-0000-000000000009', 'Aguacate', 'g', 'frutas_grasas'),
('10000000-0000-0000-0000-000000000013', 'Calabacín', 'g', 'verduras')
ON CONFLICT (name) DO NOTHING;

-- Máquinas de gimnasio
INSERT INTO public.gym_machines (id, name, machine_type, muscle_groups_primary, min_load, max_load, load_increment) VALUES
('20000000-0000-0000-0000-000000000001', 'Prensa Inclinada de Piernas', 'placas', ARRAY['cuadriceps', 'gluteos'], 20, 250, 5.0),
('20000000-0000-0000-0000-000000000005', 'Jalón al Pecho (Lat Pulldown)', 'polea', ARRAY['dorsales'], 10, 100, 2.5),
('20000000-0000-0000-0000-000000000007', 'Press de Pecho en Máquina', 'selectorizada', ARRAY['pecho'], 10, 90, 2.5)
ON CONFLICT (id) DO NOTHING;
