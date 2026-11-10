-- Políticas de Row Level Security (RLS) para NutreIA
-- Fecha: 2026-11-05
-- Base de Datos: PostgreSQL / Supabase

-- Activar RLS en todas las tablas
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_restrictions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_nutrients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_servings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_exercise_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_recommendations ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- FUNCIONES AUXILIARES DE SEGURIDAD (SECURITY DEFINER)
-- ========================================================

-- Comprobar si el usuario autenticado pertenece a una familia
CREATE OR REPLACE FUNCTION public.is_member_of_family(target_family_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.family_members
        WHERE family_id = target_family_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comprobar si el usuario autenticado es administrador de una familia
CREATE OR REPLACE FUNCTION public.is_admin_of_family(target_family_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.family_members
        WHERE family_id = target_family_id
        AND user_id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- POLÍTICAS: FAMILIAS Y MIEMBROS
-- ========================================================

CREATE POLICY "Los usuarios pueden ver su propia familia"
ON public.families FOR SELECT
USING (created_by = auth.uid() OR public.is_member_of_family(id));

CREATE POLICY "Los usuarios autenticados pueden crear una familia"
ON public.families FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Solo los administradores pueden actualizar la familia"
ON public.families FOR UPDATE
USING (public.is_admin_of_family(id));

-- Family Members
CREATE POLICY "Los miembros pueden ver a otros miembros de su familia"
ON public.family_members FOR SELECT
USING (public.is_member_of_family(family_id));

CREATE POLICY "Los administradores pueden gestionar miembros de la familia"
ON public.family_members FOR ALL
USING (public.is_admin_of_family(family_id));

-- Member Profiles
CREATE POLICY "El usuario o admin de la familia puede ver el perfil"
ON public.member_profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.family_members fm
        WHERE fm.id = family_member_id
        AND (fm.user_id = auth.uid() OR public.is_admin_of_family(fm.family_id))
    )
);

CREATE POLICY "El propio usuario o admin puede editar el perfil"
ON public.member_profiles FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.family_members fm
        WHERE fm.id = family_member_id
        AND (fm.user_id = auth.uid() OR public.is_admin_of_family(fm.family_id))
    )
);

-- ========================================================
-- POLÍTICAS: CATÁLOGOS GLOBALES (LECTURA PÚBLICA / AUTENTICADA)
-- ========================================================

CREATE POLICY "Lectura global de alérgenos" ON public.allergens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura global de ingredientes" ON public.ingredients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura global de alérgenos de ingredientes" ON public.ingredient_allergens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura global de nutrientes" ON public.ingredient_nutrients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura de máquinas de gimnasio" ON public.gym_machines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura de catálogo de ejercicios" ON public.exercises FOR SELECT TO authenticated USING (true);

-- ========================================================
-- POLÍTICAS: ALIMENTACIÓN Y MENÚS
-- ========================================================

CREATE POLICY "Ver recetas compartidas o de la familia"
ON public.recipes FOR SELECT
USING (family_id IS NULL OR public.is_member_of_family(family_id));

CREATE POLICY "Miembros pueden crear recetas para su familia"
ON public.recipes FOR INSERT
WITH CHECK (family_id IS NOT NULL AND public.is_member_of_family(family_id));

CREATE POLICY "Ver menús de su familia"
ON public.weekly_menus FOR SELECT
USING (public.is_member_of_family(family_id));

CREATE POLICY "Gestionar menús de su familia"
ON public.weekly_menus FOR ALL
USING (public.is_member_of_family(family_id));

CREATE POLICY "Acceso a comidas del menú familiar"
ON public.menu_meals FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.weekly_menus wm
        WHERE wm.id = weekly_menu_id
        AND public.is_member_of_family(wm.family_id)
    )
);

CREATE POLICY "Acceso a raciones de comida"
ON public.meal_servings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.menu_meals mm
        JOIN public.weekly_menus wm ON wm.id = mm.weekly_menu_id
        WHERE mm.id = menu_meal_id
        AND public.is_member_of_family(wm.family_id)
    )
);

CREATE POLICY "Miembros valoran sus comidas"
ON public.menu_ratings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.family_members fm
        WHERE fm.id = family_member_id
        AND (fm.user_id = auth.uid() OR public.is_admin_of_family(fm.family_id))
    )
);

CREATE POLICY "Lista de compra familiar"
ON public.shopping_list_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.weekly_menus wm
        WHERE wm.id = weekly_menu_id
        AND public.is_member_of_family(wm.family_id)
    )
);

-- ========================================================
-- POLÍTICAS: GIMNASIO Y ENTRENAMIENTOS
-- ========================================================

CREATE POLICY "Acceso a gimnasios de la familia"
ON public.gyms FOR ALL
USING (public.is_member_of_family(family_id));

CREATE POLICY "Acceso a equipamiento del gimnasio"
ON public.gym_equipment FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.gyms g
        WHERE g.id = gym_id
        AND public.is_member_of_family(g.family_id)
    )
);

CREATE POLICY "Acceso a planes de entrenamiento propios o supervisados"
ON public.workout_plans FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.family_members fm
        WHERE fm.id = family_member_id
        AND (fm.user_id = auth.uid() OR public.is_admin_of_family(fm.family_id))
    )
);

CREATE POLICY "Acceso a sesiones de entrenamiento"
ON public.workout_sessions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.family_members fm
        WHERE fm.id = family_member_id
        AND (fm.user_id = auth.uid() OR public.is_admin_of_family(fm.family_id))
    )
);

CREATE POLICY "Acceso a desempeño de ejercicios"
ON public.exercise_performance FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.workout_sessions ws
        JOIN public.family_members fm ON fm.id = ws.family_member_id
        WHERE ws.id = workout_session_id
        AND (fm.user_id = auth.uid() OR public.is_admin_of_family(fm.family_id))
    )
);

CREATE POLICY "Acceso a recomendaciones de carga"
ON public.load_recommendations FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.family_members fm
        WHERE fm.id = family_member_id
        AND (fm.user_id = auth.uid() OR public.is_admin_of_family(fm.family_id))
    )
);
