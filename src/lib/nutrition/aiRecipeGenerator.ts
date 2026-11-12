import { GoogleGenerativeAI } from '@google/generative-ai';
import { FamilyMember, MealType, Recipe, RecipeIngredientDetail } from '@/types/database';

export interface GenerateRecipeParams {
  mealType: MealType;
  member?: FamilyMember;
  rejectedRecipeName?: string;
  rejectionReason?: string;
  preferredTags?: string[];
}

// Clave API de Gemini (en localStorage o .env)
export function getStoredGeminiKey(): string {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('nutreia_gemini_api_key') || import.meta.env?.VITE_GEMINI_API_KEY || '';
  }
  return import.meta.env?.VITE_GEMINI_API_KEY || '';
}

export function setStoredGeminiKey(key: string): void {
  if (typeof localStorage !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('nutreia_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('nutreia_gemini_api_key');
    }
  }
}

/**
 * Catálogo inteligente de recetas mediterráneas reales para generación algorítmica y fallback dinámico.
 */
const MEDITERRANEAN_RECIPES_CATALOG: Omit<Recipe, 'id'>[] = [
  // --- DESAYUNOS ---
  {
    name: 'Tostada de centeno con aguacate, tomate y semillas de chía',
    description: 'Desayuno mediterráneo antioxidante con grasas saludables y fibra soluble.',
    prep_time_minutes: 8,
    cook_time_minutes: 2,
    category: 'breakfast',
    is_archived: false,
    instructions: [
      'Tostar las rebanadas de pan de centeno hasta que estén crujientes.',
      'Triturar el aguacate con unas gotas de limón, sal yodada y pimienta.',
      'Untar sobre el pan, añadir el tomate en rodajas y espolvorear semillas de chía.',
      'Regar con un hilo fino de aceite de oliva virgen extra (AOVE).',
    ],
    tags: ['mediterráneo', 'antioxidante', 'vegano', 'fibra'],
    ingredients: [
      {
        id: 'ing-1',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000001',
        quantity: 80,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000001',
          name: 'Pan de centeno integral',
          default_unit: 'g',
          food_group: 'cereales',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-1',
            ingredient_id: '10000000-0000-0000-0000-000000000001',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 210,
            protein_g: 8.5,
            carbs_g: 45.0,
            fat_g: 1.5,
            fiber_g: 6.0,
            data_completeness: 'complete',
          },
        },
      },
      {
        id: 'ing-2',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000002',
        quantity: 60,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000002',
          name: 'Aguacate Hass',
          default_unit: 'g',
          food_group: 'frutas',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-2',
            ingredient_id: '10000000-0000-0000-0000-000000000002',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 160,
            protein_g: 2.0,
            carbs_g: 8.5,
            fat_g: 14.7,
            fiber_g: 6.7,
            data_completeness: 'complete',
          },
        },
      },
      {
        id: 'ing-3',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000003',
        quantity: 10,
        unit: 'ml',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000003',
          name: 'Aceite de oliva virgen extra',
          default_unit: 'ml',
          food_group: 'grasas',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-3',
            ingredient_id: '10000000-0000-0000-0000-000000000003',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 884,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 100,
            data_completeness: 'complete',
          },
        },
      },
    ],
  },
  {
    name: 'Yogur griego natural con nueces, miel de romero y arándanos',
    description: 'Aporte de probióticos, calcio y proteínas de lenta absorción para arrancar el día.',
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    category: 'breakfast',
    is_archived: false,
    instructions: [
      'Servir el yogur griego en un bol de cristal.',
      'Trocear las nueces en pedazos medianos para mantener el toque crujiente.',
      'Añadir los arándanos frescos y rociar media cucharada de miel de romero pura.',
    ],
    tags: ['probióticos', 'rápido', 'proteico', 'vegetariano'],
    ingredients: [
      {
        id: 'ing-4',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000004',
        quantity: 150,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000004',
          name: 'Yogur griego natural sin azúcar',
          default_unit: 'g',
          food_group: 'lácteos',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-4',
            ingredient_id: '10000000-0000-0000-0000-000000000004',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 110,
            protein_g: 10.0,
            carbs_g: 3.5,
            fat_g: 5.0,
            data_completeness: 'complete',
          },
        },
      },
      {
        id: 'ing-5',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000005',
        quantity: 25,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000005',
          name: 'Nueces de nogal',
          default_unit: 'g',
          food_group: 'frutos secos',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-5',
            ingredient_id: '10000000-0000-0000-0000-000000000005',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 654,
            protein_g: 15.2,
            carbs_g: 13.7,
            fat_g: 65.2,
            fiber_g: 6.7,
            data_completeness: 'complete',
          },
        },
      },
    ],
  },
  {
    name: 'Porridge de avena templado con plátano, canela de Ceylán y almendras',
    description: 'Energía sostenida y carbohidratos complejos para mañanas activas o días de entrenamiento.',
    prep_time_minutes: 8,
    cook_time_minutes: 5,
    category: 'breakfast',
    is_archived: false,
    instructions: [
      'Calentar leche o bebida vegetal en un cazo con los copos de avena fina.',
      'Remover a fuego medio durante 4 minutos hasta obtener una textura cremosa.',
      'Servir en un bol con rodajas de plátano maduro, canela y almendras laminadas.',
    ],
    tags: ['energía', 'pre-entreno', 'vegano-adaptable', 'saciante'],
    ingredients: [
      {
        id: 'ing-6',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000006',
        quantity: 50,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000006',
          name: 'Copos de avena integral',
          default_unit: 'g',
          food_group: 'cereales',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-6',
            ingredient_id: '10000000-0000-0000-0000-000000000006',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 375,
            protein_g: 13.5,
            carbs_g: 58.7,
            fat_g: 7.0,
            fiber_g: 10.0,
            data_completeness: 'complete',
          },
        },
      },
    ],
  },

  // --- COMIDAS ---
  {
    name: 'Salmón al horno con verduras y patata panadera',
    description: 'Plato mediterráneo completo, rico en Omega-3 y grasas saludables.',
    prep_time_minutes: 15,
    cook_time_minutes: 25,
    category: 'lunch',
    is_archived: false,
    instructions: [
      'Precalentar el horno a 180°C.',
      'Cortar calabacín, cebolla y patatas en rodajas finas con una pizca de AOVE.',
      'Colocar el lomo de salmón encima y hornear durante 20-25 minutos.',
    ],
    tags: ['mediterráneo', 'omega-3', 'alto en proteínas'],
    ingredients: [
      {
        id: 'ing-7',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000007',
        quantity: 150,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000007',
          name: 'Salmón fresco',
          default_unit: 'g',
          food_group: 'pescados',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-7',
            ingredient_id: '10000000-0000-0000-0000-000000000007',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 182,
            protein_g: 18.4,
            carbs_g: 0,
            fat_g: 12.0,
            data_completeness: 'complete',
          },
        },
      },
      {
        id: 'ing-8',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000008',
        quantity: 150,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000008',
          name: 'Patata',
          default_unit: 'g',
          food_group: 'tubérculos',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-8',
            ingredient_id: '10000000-0000-0000-0000-000000000008',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 77,
            protein_g: 2.0,
            carbs_g: 17.0,
            fat_g: 0.1,
            data_completeness: 'complete',
          },
        },
      },
    ],
  },
  {
    name: 'Garbanzos salteados con espinacas frescas y bacalao desalado',
    description: 'Guiso ligero tradicional con legumbre de proximidad, hierro y proteína marina magra.',
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    category: 'lunch',
    is_archived: false,
    instructions: [
      'Dorar ajos laminados en una sartén con dos cucharadas de AOVE.',
      'Añadir las espinacas frescas y tapar 2 minutos para que reduzcan su volumen.',
      'Incorporar los garbanzos cocidos y el bacalao en dados; saltear 5 minutos a fuego vivo.',
      'Espolvorear pimentón dulce de la Vera al retirar del fuego.',
    ],
    tags: ['legumbres', 'tradición', 'hierro', 'alto en fibra'],
    ingredients: [
      {
        id: 'ing-9',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000009',
        quantity: 160,
        unit: 'g',
        ingredient_state: 'cooked',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000009',
          name: 'Garbanzos cocidos',
          default_unit: 'g',
          food_group: 'legumbres',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-9',
            ingredient_id: '10000000-0000-0000-0000-000000000009',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 140,
            protein_g: 8.5,
            carbs_g: 20.0,
            fat_g: 2.6,
            fiber_g: 6.8,
            data_completeness: 'complete',
          },
        },
      },
      {
        id: 'ing-10',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000010',
        quantity: 120,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000010',
          name: 'Bacalao fresco desalado',
          default_unit: 'g',
          food_group: 'pescados',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-10',
            ingredient_id: '10000000-0000-0000-0000-000000000010',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 82,
            protein_g: 18.0,
            carbs_g: 0,
            fat_g: 0.7,
            data_completeness: 'complete',
          },
        },
      },
    ],
  },
  {
    name: 'Pechuga de pavo a la plancha con pisto manchego y arroz integral',
    description: 'Clásico plato equilibrado: proteína limpia, hortalizas asadas en AOVE y grano entero.',
    prep_time_minutes: 15,
    cook_time_minutes: 20,
    category: 'lunch',
    is_archived: false,
    instructions: [
      'Picar calabacín, pimiento rojo y cebolla; cocinar en sartén con tomate triturado y AOVE a fuego lento.',
      'Hacer el arroz integral al vapor o hervido.',
      'Cocinar los filetes de pavo a la plancha con unas gotas de limón y orégano silvestre.',
      'Emplatar una mitad con el pisto, un cuarto de arroz y los filetes dorados.',
    ],
    tags: ['alta proteína', 'definición', 'bajo en grasas saturadas', 'mediterráneo'],
    ingredients: [
      {
        id: 'ing-11',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000011',
        quantity: 150,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000011',
          name: 'Pechuga de pavo',
          default_unit: 'g',
          food_group: 'carnes',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-11',
            ingredient_id: '10000000-0000-0000-0000-000000000011',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 112,
            protein_g: 24.0,
            carbs_g: 0,
            fat_g: 1.5,
            data_completeness: 'complete',
          },
        },
      },
      {
        id: 'ing-12',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000012',
        quantity: 120,
        unit: 'g',
        ingredient_state: 'cooked',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000012',
          name: 'Arroz integral cocido',
          default_unit: 'g',
          food_group: 'cereales',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-12',
            ingredient_id: '10000000-0000-0000-0000-000000000012',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 111,
            protein_g: 2.6,
            carbs_g: 23.0,
            fat_g: 0.9,
            fiber_g: 1.8,
            data_completeness: 'complete',
          },
        },
      },
    ],
  },
  {
    name: 'Lentejas pardinas estofadas con calabaza y zanahoria',
    description: 'Guiso reconfortante 100% vegetal, sin grasas saturadas y con gran densidad de micronutrientes.',
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    category: 'lunch',
    is_archived: false,
    instructions: [
      'Picar cebolla, puerro y calabaza en dados regulares.',
      'Añadir las lentejas lavadas a la olla con agua, laurel y una cucharada de pimentón.',
      'Cocer a fuego medio-bajo durante 25-30 minutos hasta que estén tiernas y melosas.',
    ],
    tags: ['vegano', 'fibra', 'legumbres', 'confort'],
    ingredients: [
      {
        id: 'ing-13',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000013',
        quantity: 160,
        unit: 'g',
        ingredient_state: 'cooked',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000013',
          name: 'Lentejas cocidas',
          default_unit: 'g',
          food_group: 'legumbres',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-13',
            ingredient_id: '10000000-0000-0000-0000-000000000013',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 116,
            protein_g: 9.0,
            carbs_g: 20.1,
            fat_g: 0.4,
            fiber_g: 7.9,
            data_completeness: 'complete',
          },
        },
      },
    ],
  },

  // --- CENAS ---
  {
    name: 'Dorada a la plancha con espárragos trigueros y tomate aliñado',
    description: 'Cena ligera y saciante, ideal para una digestión óptima y descanso reparador.',
    prep_time_minutes: 10,
    cook_time_minutes: 12,
    category: 'dinner',
    is_archived: false,
    instructions: [
      'Marcar los filetes de dorada por la parte de la piel con un toque de sal marina.',
      'Saltear los espárragos trigueros en la misma sartén con unas gotas de AOVE.',
      'Cortar tomates maduros y aliñar con albahaca y orégano fresco.',
    ],
    tags: ['cena ligera', 'digestión', 'pescado blanco', 'bajo en carbohidratos'],
    ingredients: [
      {
        id: 'ing-14',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000014',
        quantity: 160,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000014',
          name: 'Filete de dorada',
          default_unit: 'g',
          food_group: 'pescados',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-14',
            ingredient_id: '10000000-0000-0000-0000-000000000014',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 98,
            protein_g: 19.8,
            carbs_g: 0,
            fat_g: 2.1,
            data_completeness: 'complete',
          },
        },
      },
      {
        id: 'ing-15',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000015',
        quantity: 120,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000015',
          name: 'Espárragos trigueros verdes',
          default_unit: 'g',
          food_group: 'verduras',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-15',
            ingredient_id: '10000000-0000-0000-0000-000000000015',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 23,
            protein_g: 2.2,
            carbs_g: 2.6,
            fat_g: 0.2,
            fiber_g: 2.1,
            data_completeness: 'complete',
          },
        },
      },
    ],
  },
  {
    name: 'Revuelto de huevos de campo con champiñones Portobello y ajetes',
    description: 'Cena rápida en menos de 10 minutos con proteína de alta biodisponibilidad.',
    prep_time_minutes: 5,
    cook_time_minutes: 8,
    category: 'dinner',
    is_archived: false,
    instructions: [
      'Limpiar y laminar los champiñones; dorar en sartén con un diente de ajo picado.',
      'Batir los dos huevos ligeramente con una pizca de sal marina.',
      'Verter sobre los champiñones y cuajar a fuego suave removiendo constantemente.',
    ],
    tags: ['rápido', 'cena', 'huevos', 'keto-friendly'],
    ingredients: [
      {
        id: 'ing-16',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000016',
        quantity: 120,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000016',
          name: 'Huevos de gallina camperos (2 uds)',
          default_unit: 'g',
          food_group: 'huevos',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-16',
            ingredient_id: '10000000-0000-0000-0000-000000000016',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 143,
            protein_g: 12.6,
            carbs_g: 0.7,
            fat_g: 9.5,
            data_completeness: 'complete',
          },
        },
      },
      {
        id: 'ing-17',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000017',
        quantity: 100,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000017',
          name: 'Champiñones Portobello',
          default_unit: 'g',
          food_group: 'verduras',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-17',
            ingredient_id: '10000000-0000-0000-0000-000000000017',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 22,
            protein_g: 3.1,
            carbs_g: 3.3,
            fat_g: 0.3,
            data_completeness: 'complete',
          },
        },
      },
    ],
  },
  {
    name: 'Crema templada de calabacín y puerro con virutas de jamón ibérico',
    description: 'Entrante o cena ligera depurativa con el sabor inconfundible de la dieta mediterránea.',
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    category: 'dinner',
    is_archived: false,
    instructions: [
      'Rehogar el puerro y los calabacines con su piel en AOVE durante 5 minutos.',
      'Cubrir con caldo de verduras y cocer 10 minutos.',
      'Triturar con batidora hasta lograr una emulsión suave y sedosa.',
      'Servir caliente con virutas de jamón ibérico tostadas 1 minuto en la sartén.',
    ],
    tags: ['crema', 'ligero', 'verduras', 'antioxidante'],
    ingredients: [
      {
        id: 'ing-18',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000018',
        quantity: 250,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000018',
          name: 'Calabacín con piel',
          default_unit: 'g',
          food_group: 'verduras',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-18',
            ingredient_id: '10000000-0000-0000-0000-000000000018',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 17,
            protein_g: 1.2,
            carbs_g: 3.1,
            fat_g: 0.3,
            fiber_g: 1.0,
            data_completeness: 'complete',
          },
        },
      },
      {
        id: 'ing-19',
        recipe_id: '',
        ingredient_id: '10000000-0000-0000-0000-000000000019',
        quantity: 30,
        unit: 'g',
        ingredient_state: 'raw',
        optional: false,
        ingredient: {
          id: '10000000-0000-0000-0000-000000000019',
          name: 'Jamón ibérico en virutas',
          default_unit: 'g',
          food_group: 'carnes',
          nutrition_source: 'BEDCA',
          nutrients: {
            id: 'n-19',
            ingredient_id: '10000000-0000-0000-0000-000000000019',
            basis_quantity: 100,
            basis_unit: 'g',
            energy_kcal: 375,
            protein_g: 30.5,
            carbs_g: 0,
            fat_g: 28.0,
            data_completeness: 'complete',
          },
        },
      },
    ],
  },
];

/**
 * Genera una receta de forma dinámica.
 * Si hay clave de Gemini API disponible, realiza la llamada a Gemini.
 * Si no hay clave o la llamada falla, recurre al catálogo inteligente mediterráneo con rotación y filtros.
 */
export async function generateRecipeWithAI(params: GenerateRecipeParams): Promise<Recipe> {
  const geminiApiKey = getStoredGeminiKey();

  if (geminiApiKey) {
    try {
      const generated = await callGeminiRecipeGeneration(geminiApiKey, params);
      if (generated) {
        return generated;
      }
    } catch (err) {
      console.warn('Fallo en la llamada a Gemini API, usando motor algorítmico mediterráneo de respaldo:', err);
    }
  }

  // Generador inteligente algorítmico mediterráneo (fallback inmediato garantizado)
  return generateAlgorithmicRecipe(params);
}

/**
 * Invoca el modelo oficial de Gemini de Google para sintetizar una receta estructurada.
 */
async function callGeminiRecipeGeneration(apiKey: string, params: GenerateRecipeParams): Promise<Recipe | null> {
  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const targetCategory = params.mealType;
  const memberGoal = params.member?.profile?.nutrition_goal || 'Equilibrio mediterráneo';
  const memberTargetKcal = params.member?.profile?.energy_target_kcal || 1800;
  const allergenList = (params.member?.preferences || [])
    .filter((p) => p.preference_type === 'allergy' || p.preference_type === 'dislike')
    .map((p) => p.item_name)
    .join(', ');

  const prompt = `
Actúa como un chef y nutricionista experto en Dieta Mediterránea y nutrición deportiva.
Genera UNA receta única, saludable, deliciosa y realista para la siguiente comida:
- Tipo de comida: ${targetCategory} (ej: desayuno, comida o cena)
- Objetivo nutricional: ${memberGoal}
- Calorías aproximadas para esta comida: entre ${Math.round(memberTargetKcal * 0.33)} y ${Math.round(memberTargetKcal * 0.4)} kcal
${params.rejectedRecipeName ? `- RECETA RECHAZADA PREVIAMENTE (NO la repitas ni uses ingredientes casi idénticos): "${params.rejectedRecipeName}"` : ''}
${params.rejectionReason ? `- MOTIVO DEL RECHAZO: "${params.rejectionReason}"` : ''}
${allergenList ? `- ALERGIAS / RESTRICCIONES ESTRICTAS (PROHIBIDO INCLUIR): ${allergenList}` : ''}

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido con este formato exacto:
{
  "name": "Nombre de la receta mediterránea",
  "description": "Breve descripción apetitosa de 1 o 2 frases",
  "prep_time_minutes": 10,
  "cook_time_minutes": 15,
  "category": "${targetCategory}",
  "instructions": [
    "Paso 1...",
    "Paso 2...",
    "Paso 3..."
  ],
  "tags": ["mediterráneo", "saludable"],
  "ingredients": [
    {
      "name": "Nombre ingrediente",
      "quantity": 150,
      "unit": "g",
      "food_group": "pescados",
      "energy_kcal_100g": 120,
      "protein_g_100g": 20,
      "carbs_g_100g": 0,
      "fat_g_100g": 4
    }
  ]
}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Limpiar delimitadores markdown ```json ... ```
  const cleanJson = responseText
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const data = JSON.parse(cleanJson);

  const newRecipeId = `rec-ai-${Date.now()}`;
  const ingredients: RecipeIngredientDetail[] = (data.ingredients || []).map((ing: any, idx: number) => ({
    id: `ri-${newRecipeId}-${idx}`,
    recipe_id: newRecipeId,
    ingredient_id: `ing-ai-${idx}`,
    quantity: ing.quantity || 100,
    unit: ing.unit || 'g',
    ingredient_state: 'raw',
    optional: false,
    ingredient: {
      id: `ing-ai-${idx}`,
      name: ing.name,
      default_unit: ing.unit || 'g',
      food_group: ing.food_group || 'verduras',
      nutrition_source: 'Gemini AI',
      nutrients: {
        id: `n-${newRecipeId}-${idx}`,
        ingredient_id: `ing-ai-${idx}`,
        basis_quantity: 100,
        basis_unit: 'g',
        energy_kcal: Number(ing.energy_kcal_100g) || 100,
        protein_g: Number(ing.protein_g_100g) || 5,
        carbs_g: Number(ing.carbs_g_100g) || 10,
        fat_g: Number(ing.fat_g_100g) || 3,
        data_completeness: 'complete',
      },
    },
  }));

  return {
    id: newRecipeId,
    name: data.name,
    description: data.description,
    prep_time_minutes: data.prep_time_minutes || 10,
    cook_time_minutes: data.cook_time_minutes || 15,
    category: data.category || targetCategory,
    is_archived: false,
    instructions: data.instructions || ['Preparar los ingredientes y cocinar a fuego medio.'],
    tags: Array.isArray(data.tags) ? data.tags : ['IA', 'mediterráneo'],
    ingredients,
  };
}

/**
 * Generador algorítmico inteligente cuando no hay API Key o falla la conexión.
 */
function generateAlgorithmicRecipe(params: GenerateRecipeParams): Recipe {
  // Filtrar recetas del catálogo por categoría
  let candidates = MEDITERRANEAN_RECIPES_CATALOG.filter(
    (r) => r.category === params.mealType
  );

  if (candidates.length === 0) {
    candidates = MEDITERRANEAN_RECIPES_CATALOG;
  }

  // Descartar la receta rechazada
  if (params.rejectedRecipeName) {
    const filtered = candidates.filter(
      (r) => r.name.toLowerCase() !== params.rejectedRecipeName?.toLowerCase()
    );
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  // Filtrar por alergias del miembro
  if (params.member?.preferences) {
    const allergens = params.member.preferences
      .filter((p) => p.preference_type === 'allergy')
      .map((p) => p.item_name.toLowerCase());

    const safeCandidates = candidates.filter((c) => {
      const allText = (c.name + ' ' + (c.ingredients?.map((i) => i.ingredient?.name).join(' ') || '')).toLowerCase();
      return !allergens.some((allergen) => allText.includes(allergen));
    });

    if (safeCandidates.length > 0) {
      candidates = safeCandidates;
    }
  }

  // Selección aleatoria dinámica entre las opciones válidas
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  const newId = `rec-gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    ...picked,
    id: newId,
    ingredients: (picked.ingredients || []).map((ing, i) => ({
      ...ing,
      id: `ri-${newId}-${i}`,
      recipe_id: newId,
    })),
  };
}
