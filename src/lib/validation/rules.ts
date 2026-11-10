import { ExercisePerformance, FoodPreference, GymMachine, Recipe } from '@/types/database';

/**
 * Calcula la edad exacta a partir de la fecha de nacimiento (YYYY-MM-DD).
 */
export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Determina si un perfil corresponde a un menor de edad (<18 años).
 */
export function isMinor(birthDateStr: string): boolean {
  return calculateAge(birthDateStr) < 18;
}

export interface NutritionValidationResult {
  isValid: boolean;
  warning?: string;
  isPediatricAlert?: boolean;
}

/**
 * Validación de reglas de seguridad nutricional (Sección 3.2 y 12):
 * - No aplicar dietas hipocalóricas ni límites fijos a menores.
 * - Mostrar advertencia pediátrica si es menor.
 */
export function validateEnergyTarget(
  birthDateStr: string,
  targetKcal?: number
): NutritionValidationResult {
  const minor = isMinor(birthDateStr);

  if (minor) {
    if (targetKcal && targetKcal < 1800) {
      return {
        isValid: false,
        isPediatricAlert: true,
        warning:
          'Aviso de Seguridad Pediátrica: No está permitido asignar dietas hipocalóricas ni restricciones energéticas a menores de edad. Sus necesidades deben ser valoradas por pediatría o un profesional dietista-nutricionista.',
      };
    }
    return {
      isValid: true,
      isPediatricAlert: true,
      warning:
        'Nota informativa: Las necesidades de menores en crecimiento no deben regirse por fórmulas de adultos.',
    };
  }

  if (targetKcal && targetKcal < 1200) {
    return {
      isValid: false,
      warning:
        'Aviso de salud: Un objetivo inferior a 1.200 kcal requiere supervisión médica directa para evitar déficit de micronutrientes.',
    };
  }

  return { isValid: true };
}

export interface AllergenConflict {
  ingredientName: string;
  allergenName?: string;
  preferenceType: string;
}

/**
 * Comprueba si una receta contiene ingredientes incompatibles con las alergias o intolerancias activas del miembro.
 */
export function checkRecipeAllergenConflicts(
  recipe: Recipe,
  preferences: FoodPreference[] = []
): AllergenConflict[] {
  const conflicts: AllergenConflict[] = [];

  const blockedItems = preferences.filter(
    (p) => p.preference_type === 'allergy' || p.preference_type === 'intolerance' || p.preference_type === 'avoid'
  );

  if (!recipe.ingredients || blockedItems.length === 0) {
    return conflicts;
  }

  for (const item of recipe.ingredients) {
    const ing = item.ingredient;
    const ingName = (ing?.name || '').toLowerCase();

    for (const pref of blockedItems) {
      const prefName = pref.item_name.toLowerCase();
      // Verificación directa de nombre de ingrediente
      if (ingName.includes(prefName) || prefName.includes(ingName)) {
        conflicts.push({
          ingredientName: ing?.name || 'Ingrediente',
          preferenceType: pref.preference_type,
        });
      }

      // Verificación de lista de alérgenos asociados
      if (ing?.allergens) {
        for (const allergen of ing.allergens) {
          if (
            allergen.name.toLowerCase().includes(prefName) ||
            allergen.code.toLowerCase().includes(prefName)
          ) {
            conflicts.push({
              ingredientName: ing.name,
              allergenName: allergen.name,
              preferenceType: pref.preference_type,
            });
          }
        }
      }
    }
  }

  return conflicts;
}

export interface ProgressionRecommendationResult {
  action: 'increase' | 'maintain' | 'decrease' | 'stop_medical_alert';
  recommendedLoad: number;
  reason: string;
  isMedicalAlert?: boolean;
}

/**
 * Regla de Progresión Prudente de Cargas (Sección 6.6 y 12):
 * - Si reporta dolor -> detener progresión y recomendar supervisión.
 * - Si técnica no es correcta -> mantener o reducir.
 * - Si no completa repeticiones -> no subir.
 * - Si RPE <= 7 y completó todo en sesiones consistentes -> incremento pequeño basado en la máquina.
 */
export function calculateLoadProgression(
  performance: ExercisePerformance,
  machine?: GymMachine
): ProgressionRecommendationResult {
  const currentLoad = performance.actual_load;
  const increment = machine?.load_increment || 2.5;

  // 1. Alerta médica por dolor
  if (performance.pain_reported) {
    return {
      action: 'stop_medical_alert',
      recommendedLoad: currentLoad,
      isMedicalAlert: true,
      reason:
        'Se ha registrado dolor o molestias durante el ejercicio. Detener recomendación de progresión. Se aconseja no forzar la zona y consultar con un profesional de la salud antes de continuar.',
    };
  }

  // 2. Técnica deficiente o revisión requerida
  if (performance.technique_status === 'needs_review' || performance.technique_status === 'incomplete') {
    return {
      action: 'maintain',
      recommendedLoad: currentLoad,
      reason:
        'Mantener carga: La técnica requiere revisión antes de considerar un aumento de peso para evitar riesgo de lesión.',
    };
  }

  // 3. Series o repeticiones incompletas
  if (performance.completed_sets < performance.target_sets) {
    return {
      action: 'maintain',
      recommendedLoad: currentLoad,
      reason: `Mantener ${currentLoad} ${performance.load_unit}: Se completaron ${performance.completed_sets} de ${performance.target_sets} series previstas.`,
    };
  }

  // 4. Esfuerzo alto (RPE >= 8.5)
  if (performance.rpe && performance.rpe >= 8.5) {
    return {
      action: 'maintain',
      recommendedLoad: currentLoad,
      reason: `Mantener ${currentLoad} ${performance.load_unit}: Completaste las series pero el esfuerzo percibido fue muy alto (RPE ${performance.rpe}). Consolidar antes de subir.`,
    };
  }

  // 5. Criterio de progresión favorable (RPE <= 7 o técnica impecable completada)
  if (performance.rpe && performance.rpe <= 7.0 && performance.completed_sets >= performance.target_sets) {
    const nextLoad = currentLoad + increment;
    return {
      action: 'increase',
      recommendedLoad: nextLoad,
      reason: `Progresión prudente recomendada (+${increment} ${performance.load_unit}): Completaste todas las series con técnica correcta y esfuerzo moderado (RPE ${performance.rpe}).`,
    };
  }

  return {
    action: 'maintain',
    recommendedLoad: currentLoad,
    reason: `Mantener ${currentLoad} ${performance.load_unit}: Rendimiento adecuado y estable.`,
  };
}
