-- Migración Inicial: Esquema de Tablas para NutreIA
-- Fecha: 2026-11-05
-- Base de Datos: PostgreSQL / Supabase

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. FAMILIA Y USUARIOS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.member_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID NOT NULL UNIQUE REFERENCES public.family_members(id) ON DELETE CASCADE,
    birth_date DATE NOT NULL,
    height_cm NUMERIC(5,2),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'intense', 'very_intense')) DEFAULT 'moderate',
    nutrition_goal TEXT DEFAULT 'salud_general',
    energy_target_kcal INTEGER,
    training_goal TEXT DEFAULT 'salud_general',
    training_level TEXT CHECK (training_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    training_days_per_week INTEGER DEFAULT 3,
    session_duration_minutes INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    weight_kg NUMERIC(5,2) NOT NULL,
    height_cm NUMERIC(5,2),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.food_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    preference_type TEXT NOT NULL CHECK (preference_type IN ('like', 'dislike', 'avoid', 'allergy', 'intolerance')),
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.member_restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    restriction_type TEXT NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 2. ALIMENTACIÓN, INGREDIENTES Y RECETAS
-- ==========================================

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
    saturated_fat_g NUMERIC(6,2),
    fiber_g NUMERIC(6,2),
    sugars_g NUMERIC(6,2),
    salt_g NUMERIC(6,2),
    data_completeness TEXT NOT NULL DEFAULT 'complete'
);

CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(8,2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'g',
    ingredient_state TEXT NOT NULL DEFAULT 'raw',
    optional BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.recipe_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    tag TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.weekly_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
    created_by UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.menu_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_menu_id UUID NOT NULL REFERENCES public.weekly_menus(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE RESTRICT,
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.meal_servings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_meal_id UUID NOT NULL REFERENCES public.menu_meals(id) ON DELETE CASCADE,
    family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    servings_factor NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    portion_notes TEXT,
    UNIQUE (menu_meal_id, family_member_id)
);

CREATE TABLE IF NOT EXISTS public.menu_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_meal_id UUID NOT NULL REFERENCES public.menu_meals(id) ON DELETE CASCADE,
    family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    would_repeat BOOLEAN NOT NULL DEFAULT true,
    rated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (menu_meal_id, family_member_id)
);

CREATE TABLE IF NOT EXISTS public.shopping_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_menu_id UUID NOT NULL REFERENCES public.weekly_menus(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(8,2) NOT NULL,
    unit TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'despensa',
    is_purchased BOOLEAN NOT NULL DEFAULT false,
    notes TEXT
);

-- ==========================================
-- 3. GIMNASIO Y ENTRENAMIENTO
-- ==========================================

CREATE TABLE IF NOT EXISTS public.gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
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
    status TEXT NOT NULL CHECK (status IN ('available', 'maintenance', 'retired')) DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS public.gym_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES public.gym_machines(id) ON DELETE CASCADE,
    availability_status TEXT NOT NULL DEFAULT 'available',
    notes TEXT,
    UNIQUE (gym_id, machine_id)
);

CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    primary_muscle_group TEXT NOT NULL,
    secondary_muscle_groups TEXT[] NOT NULL DEFAULT '{}',
    equipment_type TEXT NOT NULL DEFAULT 'machine',
    machine_id UUID REFERENCES public.gym_machines(id) ON DELETE SET NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    technique_cues JSONB NOT NULL DEFAULT '[]'::jsonb,
    common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
    media_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.member_exercise_restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
    muscle_group TEXT,
    restriction_reason TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    goal TEXT NOT NULL,
    target_muscle_groups TEXT[] NOT NULL DEFAULT '{}',
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.workout_plan_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    target_sets INTEGER NOT NULL DEFAULT 3,
    target_reps_min INTEGER NOT NULL DEFAULT 10,
    target_reps_max INTEGER NOT NULL DEFAULT 12,
    rest_seconds INTEGER NOT NULL DEFAULT 90,
    suggested_load NUMERIC(6,2),
    load_unit TEXT NOT NULL DEFAULT 'kg',
    load_reason TEXT
);

CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    finished_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
    session_notes TEXT
);

CREATE TABLE IF NOT EXISTS public.exercise_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
    machine_id UUID REFERENCES public.gym_machines(id) ON DELETE SET NULL,
    suggested_load NUMERIC(6,2),
    actual_load NUMERIC(6,2) NOT NULL,
    load_unit TEXT NOT NULL DEFAULT 'kg',
    target_sets INTEGER NOT NULL,
    completed_sets INTEGER NOT NULL,
    target_reps INTEGER NOT NULL,
    reps_per_set JSONB NOT NULL DEFAULT '[]'::jsonb,
    rpe NUMERIC(3,1),
    technique_status TEXT NOT NULL CHECK (technique_status IN ('correct', 'needs_review', 'incomplete')) DEFAULT 'correct',
    pain_reported BOOLEAN NOT NULL DEFAULT false,
    pain_notes TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.load_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
    based_on_performance_id UUID REFERENCES public.exercise_performance(id) ON DELETE SET NULL,
    previous_load NUMERIC(6,2) NOT NULL,
    recommended_load NUMERIC(6,2) NOT NULL,
    load_unit TEXT NOT NULL DEFAULT 'kg',
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'modified', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_family_members_family ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_menu_meals_menu ON public.menu_meals(weekly_menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_ratings_meal ON public.menu_ratings(menu_meal_id);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_session ON public.exercise_performance(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_load_recommendations_member ON public.load_recommendations(family_member_id, exercise_id);
