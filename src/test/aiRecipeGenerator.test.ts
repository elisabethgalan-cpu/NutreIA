import { describe, it, expect } from 'vitest';
import { generateRecipeWithAI } from '@/lib/nutrition/aiRecipeGenerator';
import { FamilyMember } from '@/types/database';

describe('AI Recipe Generator (Algorithmic & AI Fallback)', () => {
  const mockMember: FamilyMember = {
    id: 'mem-test-1',
    family_id: 'fam-test',
    display_name: 'Elena',
    role: 'admin',
    status: 'active',
    created_at: new Date().toISOString(),
    profile: {
      id: 'prof-test',
      family_member_id: 'mem-test-1',
      birth_date: '1988-06-15',
      height_cm: 165,
      activity_level: 'moderate',
      nutrition_goal: 'Definición y energía',
      energy_target_kcal: 1500,
      training_goal: 'Tonificación',
      training_level: 'intermediate',
      training_days_per_week: 3,
      session_duration_minutes: 45,
      updated_at: new Date().toISOString(),
    },
    preferences: [
      {
        id: 'pref-1',
        family_member_id: 'mem-test-1',
        item_name: 'marisco',
        preference_type: 'allergy',
      },
    ],
  };

  it('generates a valid Mediterranean recipe for breakfast', async () => {
    const recipe = await generateRecipeWithAI({
      mealType: 'breakfast',
      member: mockMember,
    });

    expect(recipe).toBeDefined();
    expect(recipe.id).toBeDefined();
    expect(recipe.name).toBeTruthy();
    expect(recipe.category).toBe('breakfast');
    expect(recipe.ingredients).toBeDefined();
    expect(recipe.ingredients!.length).toBeGreaterThan(0);
    expect(recipe.instructions.length).toBeGreaterThan(0);
  });

  it('generates an alternative recipe when a previous recipe is rejected', async () => {
    const rejectedName = 'Tostada de centeno con aguacate, tomate y semillas de chía';
    const recipe = await generateRecipeWithAI({
      mealType: 'breakfast',
      member: mockMember,
      rejectedRecipeName: rejectedName,
      rejectionReason: 'Quiero algo caliente',
    });

    expect(recipe).toBeDefined();
    expect(recipe.name).not.toBe(rejectedName);
  });

  it('respects member allergies by not including forbidden items', async () => {
    const recipe = await generateRecipeWithAI({
      mealType: 'lunch',
      member: mockMember,
    });

    const ingredientNames = (recipe.ingredients || [])
      .map((i) => i.ingredient?.name.toLowerCase() || '')
      .join(' ');

    expect(ingredientNames.includes('marisco')).toBe(false);
  });
});
