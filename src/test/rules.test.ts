import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  isMinor,
  validateEnergyTarget,
  checkRecipeAllergenConflicts,
  calculateLoadProgression,
} from '@/lib/validation/rules';
import { adaptRecipeServing, calculateRecipeNutrition } from '@/lib/nutrition/calculator';
import { Recipe, ExercisePerformance, GymMachine, FoodPreference } from '@/types/database';

describe('Reglas Críticas de Nutrición y Salud', () => {
  it('debe calcular la edad correctamente', () => {
    // Si nació en 2012, hoy (2026) tiene 14 años
    expect(calculateAge('2012-05-10')).toBe(14);
    expect(isMinor('2012-05-10')).toBe(true);

    // Si nació en 1990, tiene 36 años
    expect(calculateAge('1990-01-01')).toBe(36);
    expect(isMinor('1990-01-01')).toBe(false);
  });

  it('debe bloquear dietas hipocalóricas a menores de edad con alerta pediátrica', () => {
    const minorResult = validateEnergyTarget('2012-05-10', 1500);
    expect(minorResult.isValid).toBe(false);
    expect(minorResult.isPediatricAlert).toBe(true);
    expect(minorResult.warning).toContain('Aviso de Seguridad Pediátrica');
  });

  it('debe permitir objetivos energéticos válidos en adultos', () => {
    const adultResult = validateEnergyTarget('1990-01-01', 1500);
    expect(adultResult.isValid).toBe(true);
    expect(adultResult.isPediatricAlert).toBeUndefined();
  });

  it('debe detectar alérgenos activos y bloquear el ingrediente', () => {
    const mockRecipe: Recipe = {
      id: 'rec-1',
      name: 'Salmón con espinacas y avena',
      instructions: ['Cocinar'],
      prep_time_minutes: 10,
      cook_time_minutes: 15,
      category: 'comida',
      is_archived: false,
      ingredients: [
        {
          id: 'ri-1',
          recipe_id: 'rec-1',
          ingredient_id: 'ing-1',
          quantity: 150,
          unit: 'g',
          ingredient_state: 'raw',
          optional: false,
          ingredient: {
            id: 'ing-1',
            name: 'Salmón fresco',
            default_unit: 'g',
            food_group: 'pescados',
            nutrition_source: 'BEDCA',
            allergens: [{ id: 'all-1', code: 'pescado', name: 'Pescado' }],
          },
        },
      ],
    };

    const memberPreferences: FoodPreference[] = [
      {
        id: 'pref-1',
        family_member_id: 'mem-1',
        item_name: 'Pescado',
        preference_type: 'allergy',
      },
    ];

    const conflicts = checkRecipeAllergenConflicts(mockRecipe, memberPreferences);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].ingredientName).toBe('Salmón fresco');
    expect(conflicts[0].preferenceType).toBe('allergy');
  });

  it('debe adaptar raciones individualmente según el servings_factor', () => {
    const mockRecipe: Recipe = {
      id: 'rec-2',
      name: 'Pechuga de pollo a la plancha',
      instructions: ['Cocinar a la plancha'],
      prep_time_minutes: 5,
      cook_time_minutes: 10,
      category: 'comida',
      is_archived: false,
      ingredients: [
        {
          id: 'ri-2',
          recipe_id: 'rec-2',
          ingredient_id: 'ing-2',
          quantity: 200,
          unit: 'g',
          ingredient_state: 'raw',
          optional: false,
          ingredient: {
            id: 'ing-2',
            name: 'Pechuga de pollo',
            default_unit: 'g',
            food_group: 'carnes',
            nutrition_source: 'BEDCA',
            nutrients: {
              id: 'nut-2',
              ingredient_id: 'ing-2',
              basis_quantity: 100,
              basis_unit: 'g',
              energy_kcal: 120, // 200g = 240 kcal
              protein_g: 22.5,  // 200g = 45g
              carbs_g: 0,
              fat_g: 2.6,       // 200g = 5.2g
              data_completeness: 'complete',
            },
          },
        },
      ],
    };

    const base = calculateRecipeNutrition(mockRecipe);
    expect(base.energyKcal).toBe(240);
    expect(base.proteinG).toBe(45);

    // Adaptación a ración de 0.8x
    const adapted = adaptRecipeServing(mockRecipe, 0.8);
    expect(adapted.nutritionalSummary.energyKcal).toBe(192); // 240 * 0.8
    expect(adapted.nutritionalSummary.proteinG).toBe(36);    // 45 * 0.8
    expect(adapted.adaptedIngredients[0].quantity).toBe(160); // 200 * 0.8
  });
});

describe('Reglas de Seguridad y Progresión en Gimnasio', () => {
  const machine: GymMachine = {
    id: 'm-1',
    name: 'Prensa Inclinada',
    machine_type: 'prensa',
    muscle_groups_primary: ['cuadriceps'],
    muscle_groups_secondary: ['gluteos'],
    load_increment: 5.0,
    load_unit: 'kg',
    status: 'available',
  };

  it('debe detener la progresión de inmediato y activar alerta médica si se reporta dolor', () => {
    const performance: ExercisePerformance = {
      id: 'perf-1',
      workout_session_id: 'sess-1',
      exercise_id: 'ex-1',
      actual_load: 60,
      load_unit: 'kg',
      target_sets: 3,
      completed_sets: 3,
      target_reps: 10,
      reps_per_set: [10, 10, 10],
      rpe: 6,
      technique_status: 'correct',
      pain_reported: true,
      pain_notes: 'Molestia punzante en la rodilla izquierda al descender',
    };

    const recommendation = calculateLoadProgression(performance, machine);
    expect(recommendation.action).toBe('stop_medical_alert');
    expect(recommendation.isMedicalAlert).toBe(true);
    expect(recommendation.recommendedLoad).toBe(60);
    expect(recommendation.reason).toContain('dolor o molestias');
  });

  it('debe mantener la carga si la técnica requiere revisión', () => {
    const performance: ExercisePerformance = {
      id: 'perf-2',
      workout_session_id: 'sess-1',
      exercise_id: 'ex-1',
      actual_load: 50,
      load_unit: 'kg',
      target_sets: 3,
      completed_sets: 3,
      target_reps: 10,
      reps_per_set: [10, 10, 10],
      rpe: 7,
      technique_status: 'needs_review',
      pain_reported: false,
    };

    const recommendation = calculateLoadProgression(performance, machine);
    expect(recommendation.action).toBe('maintain');
    expect(recommendation.recommendedLoad).toBe(50);
    expect(recommendation.reason).toContain('técnica requiere revisión');
  });

  it('debe mantener la carga si el esfuerzo percibido fue muy alto (RPE >= 8.5)', () => {
    const performance: ExercisePerformance = {
      id: 'perf-3',
      workout_session_id: 'sess-1',
      exercise_id: 'ex-1',
      actual_load: 70,
      load_unit: 'kg',
      target_sets: 3,
      completed_sets: 3,
      target_reps: 10,
      reps_per_set: [10, 10, 10],
      rpe: 9,
      technique_status: 'correct',
      pain_reported: false,
    };

    const recommendation = calculateLoadProgression(performance, machine);
    expect(recommendation.action).toBe('maintain');
    expect(recommendation.recommendedLoad).toBe(70);
    expect(recommendation.reason).toContain('esfuerzo percibido fue muy alto');
  });

  it('debe sugerir un incremento prudente (+5 kg según salto de máquina) si RPE <= 7 y técnica correcta', () => {
    const performance: ExercisePerformance = {
      id: 'perf-4',
      workout_session_id: 'sess-1',
      exercise_id: 'ex-1',
      actual_load: 50,
      load_unit: 'kg',
      target_sets: 3,
      completed_sets: 3,
      target_reps: 10,
      reps_per_set: [10, 10, 10],
      rpe: 6.5,
      technique_status: 'correct',
      pain_reported: false,
    };

    const recommendation = calculateLoadProgression(performance, machine);
    expect(recommendation.action).toBe('increase');
    expect(recommendation.recommendedLoad).toBe(55); // 50 + 5.0
    expect(recommendation.reason).toContain('Progresión prudente recomendada');
  });
});
