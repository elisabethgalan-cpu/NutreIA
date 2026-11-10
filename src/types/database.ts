export type Role = 'admin' | 'member';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'intense' | 'very_intense';
export type PreferenceType = 'like' | 'dislike' | 'avoid' | 'allergy' | 'intolerance';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';
export type TechniqueStatus = 'correct' | 'needs_review' | 'incomplete';

export interface Family {
  id: string;
  name: string;
  created_at: string;
  created_by?: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id?: string;
  display_name: string;
  role: Role;
  status: string;
  created_at: string;
  profile?: MemberProfile;
  preferences?: FoodPreference[];
}

export interface MemberProfile {
  id: string;
  family_member_id: string;
  birth_date: string;
  height_cm?: number;
  activity_level: ActivityLevel;
  nutrition_goal: string;
  energy_target_kcal?: number;
  training_goal: string;
  training_level: TrainingLevel;
  training_days_per_week: number;
  session_duration_minutes: number;
  updated_at: string;
}

export interface BodyMeasurement {
  id: string;
  family_member_id: string;
  measured_at: string;
  weight_kg: number;
  height_cm?: number;
  notes?: string;
}

export interface FoodPreference {
  id: string;
  family_member_id: string;
  item_name: string;
  preference_type: PreferenceType;
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface Allergen {
  id: string;
  code: string;
  name: string;
}

export interface Ingredient {
  id: string;
  name: string;
  default_unit: string;
  food_group: string;
  nutrition_source: string;
  nutrients?: IngredientNutrients;
  allergens?: Allergen[];
}

export interface IngredientNutrients {
  id: string;
  ingredient_id: string;
  basis_quantity: number;
  basis_unit: string;
  energy_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugars_g?: number;
  salt_g?: number;
  data_completeness: string;
}

export interface Recipe {
  id: string;
  family_id?: string;
  name: string;
  description?: string;
  instructions: string[];
  prep_time_minutes: number;
  cook_time_minutes: number;
  category: string;
  image_path?: string;
  is_archived: boolean;
  ingredients?: RecipeIngredientDetail[];
  tags?: string[];
}

export interface RecipeIngredientDetail {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredient_state: 'raw' | 'cooked';
  optional: boolean;
  ingredient?: Ingredient;
}

export interface WeeklyMenu {
  id: string;
  family_id: string;
  week_start_date: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  meals?: MenuMeal[];
}

export interface MenuMeal {
  id: string;
  weekly_menu_id: string;
  service_date: string;
  meal_type: MealType;
  recipe_id: string;
  recipe?: Recipe;
  servings?: MealServing[];
  ratings?: MenuRating[];
}

export interface MealServing {
  id: string;
  menu_meal_id: string;
  family_member_id: string;
  servings_factor: number;
  portion_notes?: string;
}

export interface MenuRating {
  id: string;
  menu_meal_id: string;
  family_member_id: string;
  rating: number;
  comment?: string;
  would_repeat: boolean;
  rated_at: string;
}

export interface GymMachine {
  id: string;
  name: string;
  machine_type: string;
  muscle_groups_primary: string[];
  muscle_groups_secondary: string[];
  manufacturer?: string;
  min_load?: number;
  max_load?: number;
  load_increment: number;
  load_unit: string;
  instructions?: string;
  status: 'available' | 'maintenance' | 'retired';
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  primary_muscle_group: string;
  secondary_muscle_groups: string[];
  equipment_type: string;
  machine_id?: string;
  difficulty: TrainingLevel;
  instructions: string[];
  technique_cues: string[];
  common_mistakes: string[];
}

export interface WorkoutPlan {
  id: string;
  family_member_id: string;
  gym_id: string;
  name: string;
  goal: string;
  target_muscle_groups: string[];
  duration_minutes: number;
  status: string;
}

export interface WorkoutSession {
  id: string;
  family_member_id: string;
  workout_plan_id?: string;
  gym_id: string;
  started_at: string;
  finished_at?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  session_notes?: string;
}

export interface ExercisePerformance {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  machine_id?: string;
  suggested_load?: number;
  actual_load: number;
  load_unit: string;
  target_sets: number;
  completed_sets: number;
  target_reps: number;
  reps_per_set: number[];
  rpe?: number;
  technique_status: TechniqueStatus;
  pain_reported: boolean;
  pain_notes?: string;
  notes?: string;
}

export interface LoadRecommendation {
  id: string;
  family_member_id: string;
  exercise_id: string;
  previous_load: number;
  recommended_load: number;
  load_unit: string;
  reason: string;
  status: 'pending' | 'accepted' | 'modified' | 'rejected';
}
