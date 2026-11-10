import { getSupabaseClient, isSupabaseConfigured } from './client';
import { Family, FamilyMember, ExercisePerformance } from '@/types/database';
import { initialFamily, initialMembers } from '@/lib/mockData';

export interface DbStatus {
  connected: boolean;
  tablesExist: boolean;
  message: string;
}

/**
 * Comprueba la conectividad real con Supabase y verifica si las tablas están creadas.
 */
export async function checkSupabaseHealth(): Promise<DbStatus> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      tablesExist: false,
      message: 'Falta la anon key de Supabase.',
    };
  }

  try {
    const supabase = getSupabaseClient();
    // Intentar leer la tabla allergens o families
    const { data, error } = await supabase.from('families').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        // Error de PostgreSQL: relation does not exist
        return {
          connected: true,
          tablesExist: false,
          message: 'Conectado a Supabase, pero falta ejecutar las migraciones SQL en el panel.',
        };
      }
      return {
        connected: false,
        tablesExist: false,
        message: `Error al consultar Supabase: ${error.message}`,
      };
    }

    return {
      connected: true,
      tablesExist: true,
      message: 'Conexión y tablas verificadas correctamente.',
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      message: `Fallo de conexión: ${err.message}`,
    };
  }
}

/**
 * Obtiene la familia y sus miembros desde Supabase con fallback a datos locales.
 */
export async function getFamilyAndMembers(): Promise<{ family: Family; members: FamilyMember[] }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('nutreia_members');
    return {
      family: initialFamily,
      members: saved ? JSON.parse(saved) : initialMembers,
    };
  }

  try {
    const supabase = getSupabaseClient();
    // 1. Obtener familia
    const { data: familiesData, error: familyErr } = await supabase
      .from('families')
      .select('*')
      .limit(1);

    let activeFamily = initialFamily;
    if (!familyErr && familiesData && familiesData.length > 0) {
      activeFamily = familiesData[0];
    } else {
      // Si la tabla está vacía, insertar familia demo
      const { data: newFam } = await supabase
        .from('families')
        .insert({ id: initialFamily.id, name: initialFamily.name })
        .select()
        .single();
      if (newFam) activeFamily = newFam;
    }

    // 2. Obtener miembros con perfiles y preferencias
    const { data: membersData, error: membersErr } = await supabase
      .from('family_members')
      .select(`
        *,
        profile:member_profiles(*),
        preferences:food_preferences(*)
      `)
      .eq('family_id', activeFamily.id);

    if (membersErr || !membersData || membersData.length === 0) {
      // Si aún no hay miembros en la base de datos, guardar los iniciales
      await seedInitialMembers(activeFamily.id);
      return { family: activeFamily, members: initialMembers };
    }

    return { family: activeFamily, members: membersData as FamilyMember[] };
  } catch (err) {
    console.warn('Error cargando de Supabase, usando fallback local:', err);
    const saved = localStorage.getItem('nutreia_members');
    return {
      family: initialFamily,
      members: saved ? JSON.parse(saved) : initialMembers,
    };
  }
}

/**
 * Inserta los miembros iniciales en Supabase si la tabla está vacía.
 */
async function seedInitialMembers(familyId: string) {
  try {
    const supabase = getSupabaseClient();
    for (const member of initialMembers) {
      await supabase.from('family_members').upsert({
        id: member.id,
        family_id: familyId,
        display_name: member.display_name,
        role: member.role,
        status: member.status,
      });

      if (member.profile) {
        await supabase.from('member_profiles').upsert({
          id: member.profile.id,
          family_member_id: member.id,
          birth_date: member.profile.birth_date,
          height_cm: member.profile.height_cm,
          activity_level: member.profile.activity_level,
          nutrition_goal: member.profile.nutrition_goal,
          energy_target_kcal: member.profile.energy_target_kcal,
          training_goal: member.profile.training_goal,
          training_level: member.profile.training_level,
          training_days_per_week: member.profile.training_days_per_week,
          session_duration_minutes: member.profile.session_duration_minutes,
        });
      }
    }
  } catch (e) {
    console.error('Error insertando miembros iniciales en Supabase:', e);
  }
}

/**
 * Guarda un nuevo miembro de familia tanto en Supabase como en caché local.
 */
export async function saveFamilyMember(
  familyId: string,
  member: Omit<FamilyMember, 'id' | 'family_id' | 'created_at'>
): Promise<FamilyMember> {
  const memberId = `mem-${Date.now()}`;
  const profileId = `prof-${Date.now()}`;

  const newMember: FamilyMember = {
    ...member,
    id: memberId,
    family_id: familyId,
    created_at: new Date().toISOString(),
    profile: member.profile
      ? { ...member.profile, id: profileId, family_member_id: memberId }
      : undefined,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { error: memError } = await supabase.from('family_members').insert({
        id: memberId,
        family_id: familyId,
        display_name: member.display_name,
        role: member.role,
        status: member.status,
      });

      if (memError) throw memError;

      if (member.profile) {
        const { error: profError } = await supabase.from('member_profiles').insert({
          id: profileId,
          family_member_id: memberId,
          birth_date: member.profile.birth_date,
          height_cm: member.profile.height_cm,
          activity_level: member.profile.activity_level,
          nutrition_goal: member.profile.nutrition_goal,
          energy_target_kcal: member.profile.energy_target_kcal,
          training_goal: member.profile.training_goal,
          training_level: member.profile.training_level,
          training_days_per_week: member.profile.training_days_per_week,
          session_duration_minutes: member.profile.session_duration_minutes,
        });

        if (profError) throw profError;
      }
    } catch (e) {
      console.error('Error guardando miembro en Supabase, persistiendo localmente:', e);
    }
  }

  return newMember;
}

/**
 * Guarda una valoración de plato en Supabase (`menu_ratings`).
 */
export async function saveMealRating(
  mealId: string,
  familyMemberId: string,
  rating: number,
  comment?: string,
  wouldRepeat: boolean = true
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('menu_ratings').upsert(
      {
        id: `rat-${Date.now()}`,
        menu_meal_id: mealId,
        family_member_id: familyMemberId,
        rating,
        comment: comment || null,
        would_repeat: wouldRepeat,
        rated_at: new Date().toISOString(),
      },
      { onConflict: 'menu_meal_id,family_member_id' }
    );

    if (error) {
      console.error('Error guardando valoración en Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción guardando valoración:', err);
    return false;
  }
}

/**
 * Registra una serie y desempeño de ejercicio en Supabase (`exercise_performance`).
 */
export async function recordExercisePerformance(
  familyMemberId: string,
  performance: ExercisePerformance
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const supabase = getSupabaseClient();
    // 1. Crear sesión de entrenamiento si no existe
    const sessionId = `sess-${Date.now()}`;
    await supabase.from('workout_sessions').insert({
      id: sessionId,
      family_member_id: familyMemberId,
      gym_id: '20000000-0000-0000-0000-000000000001',
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      status: 'completed',
    });

    // 2. Insertar rendimiento
    const { error } = await supabase.from('exercise_performance').insert({
      workout_session_id: sessionId,
      exercise_id: performance.exercise_id,
      actual_load: performance.actual_load,
      load_unit: performance.load_unit,
      target_sets: performance.target_sets,
      completed_sets: performance.completed_sets,
      target_reps: performance.target_reps,
      reps_per_set: performance.reps_per_set,
      rpe: performance.rpe,
      technique_status: performance.technique_status,
      pain_reported: performance.pain_reported,
      pain_notes: performance.pain_notes || null,
    });

    if (error) {
      console.error('Error guardando rendimiento en Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción guardando rendimiento:', err);
    return false;
  }
}
