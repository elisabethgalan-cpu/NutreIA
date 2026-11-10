import { Recipe, RecipeIngredientDetail } from '@/types/database';

export interface NutritionalSummary {
  energyKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  isComplete: boolean;
}

/**
 * Calcula los valores nutricionales totales de una receta base.
 */
export function calculateRecipeNutrition(recipe: Recipe): NutritionalSummary {
  let energyKcal = 0;
  let proteinG = 0;
  let carbsG = 0;
  let fatG = 0;
  let fiberG = 0;
  let isComplete = true;

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return { energyKcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, isComplete: false };
  }

  for (const item of recipe.ingredients) {
    const nutrients = item.ingredient?.nutrients;
    if (!nutrients) {
      isComplete = false;
      continue;
    }

    const factor = item.quantity / (nutrients.basis_quantity || 100);
    energyKcal += nutrients.energy_kcal * factor;
    proteinG += nutrients.protein_g * factor;
    carbsG += nutrients.carbs_g * factor;
    fatG += nutrients.fat_g * factor;
    fiberG += (nutrients.fiber_g || 0) * factor;
  }

  return {
    energyKcal: Math.round(energyKcal),
    proteinG: Math.round(proteinG * 10) / 10,
    carbsG: Math.round(carbsG * 10) / 10,
    fatG: Math.round(fatG * 10) / 10,
    fiberG: Math.round(fiberG * 10) / 10,
    isComplete,
  };
}

/**
 * Adapta los nutrientes y cantidades de una receta para un miembro según su factor de ración individual.
 */
export function adaptRecipeServing(
  recipe: Recipe,
  servingsFactor: number = 1.0
): {
  nutritionalSummary: NutritionalSummary;
  adaptedIngredients: { name: string; quantity: number; unit: string }[];
} {
  const baseNutrition = calculateRecipeNutrition(recipe);

  const nutritionalSummary: NutritionalSummary = {
    energyKcal: Math.round(baseNutrition.energyKcal * servingsFactor),
    proteinG: Math.round(baseNutrition.proteinG * servingsFactor * 10) / 10,
    carbsG: Math.round(baseNutrition.carbsG * servingsFactor * 10) / 10,
    fatG: Math.round(baseNutrition.fatG * servingsFactor * 10) / 10,
    fiberG: Math.round(baseNutrition.fiberG * servingsFactor * 10) / 10,
    isComplete: baseNutrition.isComplete,
  };

  const adaptedIngredients = (recipe.ingredients || []).map((item) => ({
    name: item.ingredient?.name || 'Ingrediente',
    quantity: Math.round(item.quantity * servingsFactor * 10) / 10,
    unit: item.unit,
  }));

  return { nutritionalSummary, adaptedIngredients };
}
