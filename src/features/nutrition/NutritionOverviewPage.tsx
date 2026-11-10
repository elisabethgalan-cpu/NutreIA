import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { demoRecipes } from '@/lib/mockData';
import { adaptRecipeServing } from '@/lib/nutrition/calculator';
import { checkRecipeAllergenConflicts } from '@/lib/validation/rules';
import {
  Utensils,
  Star,
  ShoppingCart,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';
import { MealType } from '@/types/database';
import { saveMealRating } from '@/lib/supabase/service';

export const NutritionOverviewPage: React.FC = () => {
  const { currentMember, members, dbStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<'menu' | 'recipes' | 'shopping' | 'ranking'>('menu');
  const [selectedDay, setSelectedDay] = useState('Lunes');
  const [ratingSuccess, setRatingSuccess] = useState<string | null>(null);

  // Ratings State (en memoria / localStorage)
  const [ratings, setRatings] = useState<{ [key: string]: number }>({
    'rec-001': 5,
    'rec-002': 4,
  });

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const meals: { type: MealType; title: string; recipeIndex: number; time: string }[] = [
    { type: 'breakfast', title: 'Desayuno', recipeIndex: 1, time: '08:30' },
    { type: 'lunch', title: 'Comida', recipeIndex: 0, time: '14:00' },
    { type: 'dinner', title: 'Cena', recipeIndex: 0, time: '21:00' },
  ];

  const handleRate = async (recipeId: string, stars: number) => {
    setRatings((prev) => ({ ...prev, [recipeId]: stars }));
    const savedInDb = await saveMealRating(recipeId, currentMember.id, stars);
    const destination = savedInDb ? 'guardada en Supabase' : 'guardada localmente';
    setRatingSuccess(`¡Valoración de ${stars} estrellas ${destination} para ${currentMember.display_name}!`);
    setTimeout(() => setRatingSuccess(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-sm font-semibold">
            <Utensils className="w-4 h-4" />
            <span>Módulo de Nutrición y Alimentación</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Planificación Familiar Mediterránea
          </h1>
          <p className="text-slate-500 text-sm">
            Menús semanales equilibrados, raciones adaptadas por miembro y lista de la compra.
          </p>
        </div>

        {/* Pestañas */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'menu' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Menú Semanal
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'recipes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Recetas ({demoRecipes.length})
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'shopping' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Lista de la Compra
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'ranking' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Ranking
          </button>
        </div>
      </div>

      {ratingSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3 rounded-xl flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{ratingSuccess}</span>
        </div>
      )}

      {/* Vista de Menú Semanal */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Selector de Días (Lunes a Domingo) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-emerald-600 text-white shadow-sm scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Comidas del Día Seleccionado (3 comidas obligatorias) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {meals.map((meal) => {
              const recipe = demoRecipes[meal.recipeIndex] || demoRecipes[0];
              // Factor de ración individual configurado (ej: 0.8 para Elena 1500 kcal, 1.2 para Carlos, 1.0 para Mateo)
              const factor =
                currentMember.profile?.energy_target_kcal === 1500
                  ? 0.8
                  : currentMember.profile?.energy_target_kcal === 2200
                  ? 1.2
                  : 1.0;

              const { nutritionalSummary, adaptedIngredients } = adaptRecipeServing(recipe, factor);
              const conflicts = checkRecipeAllergenConflicts(recipe, currentMember.preferences);

              return (
                <div
                  key={meal.type}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <span>{meal.title}</span>
                      <span>{meal.time}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-2">{recipe.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{recipe.description}</p>

                    {/* Alerta de Conflicto de Alergias */}
                    {conflicts.length > 0 && (
                      <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 flex items-start space-x-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Incompatible:</span> Contiene ingredientes
                          excluidos para {currentMember.display_name}. Requiere alternativa segura.
                        </div>
                      </div>
                    )}

                    {/* Desglose Nutricional Adaptado a la ración del miembro */}
                    <div className="mt-4 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                        <span>Ración Individual ({factor}x)</span>
                        <span className="text-sm font-extrabold">{nutritionalSummary.energyKcal} kcal</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 text-center font-medium">
                        <div className="bg-white/80 p-1 rounded">
                          <div className="text-slate-400">Proteína</div>
                          <div className="font-bold text-slate-800">{nutritionalSummary.proteinG}g</div>
                        </div>
                        <div className="bg-white/80 p-1 rounded">
                          <div className="text-slate-400">Carbos</div>
                          <div className="font-bold text-slate-800">{nutritionalSummary.carbsG}g</div>
                        </div>
                        <div className="bg-white/80 p-1 rounded">
                          <div className="text-slate-400">Grasas</div>
                          <div className="font-bold text-slate-800">{nutritionalSummary.fatG}g</div>
                        </div>
                      </div>
                    </div>

                    {/* Ingredientes Adaptados */}
                    <div className="mt-3">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Cantidades ({currentMember.display_name})
                      </span>
                      <ul className="text-xs text-slate-700 mt-1 space-y-1">
                        {adaptedIngredients.slice(0, 3).map((ing, i) => (
                          <li key={i} className="flex justify-between border-b border-slate-50 py-0.5">
                            <span>{ing.name}</span>
                            <span className="font-semibold text-slate-500">
                              {ing.quantity} {ing.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Valoración Individual (1-5 estrellas) */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Tu valoración:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(recipe.id, star)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              (ratings[recipe.id] || 0) >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista de Catálogo de Recetas */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demoRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{recipe.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Prep: {recipe.prep_time_minutes} min</span>
                    <span>• Cocción: {recipe.cook_time_minutes} min</span>
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {recipe.category}
                </span>
              </div>

              <p className="text-xs text-slate-600">{recipe.description}</p>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pasos de preparación:
                </h4>
                <ol className="text-xs text-slate-700 mt-1.5 space-y-1 list-decimal list-inside">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {recipe.tags?.map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista de Lista de la Compra Consolidada */}
      {activeTab === 'shopping' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lista Consolidada Semanal</h2>
              <p className="text-xs text-slate-500">
                Suma total de cantidades requeridas para los {members.length} miembros.
              </p>
            </div>
            <button className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
              Marcar todo comprado
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Pescadería y Carnicería
              </h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span className="font-medium text-slate-800">Salmón fresco en lomos</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">450 g</span>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span className="font-medium text-slate-800">Pechuga de pollo de corral</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">600 g</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Verduras y Frutas
              </h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span className="font-medium text-slate-800">Calabacín</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">500 g</span>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span className="font-medium text-slate-800">Aguacates maduros</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">3 unidades</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Ranking Familiar */}
      {activeTab === 'ranking' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 max-w-3xl">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Ranking Familiar Semanal</h2>
            <p className="text-xs text-slate-500">
              Media de aceptación familiar indicando el tamaño de muestra de votos emitidos.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  #1 Más Valorada (Favorita)
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  Salmón al horno con verduras y patata panadera
                </h4>
                <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1">
                  <span>3 de 3 miembros han valorado</span>
                  <span>• 100% repetiría</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-amber-700 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  4.8
                </div>
                <span className="text-[10px] text-slate-400">Media familiar</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  #2 Aceptación Alta
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  Tostada integral con aguacate y huevo pochado
                </h4>
                <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1">
                  <span>2 de 3 miembros han valorado</span>
                  <span>• 100% repetiría</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-slate-700 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  4.5
                </div>
                <span className="text-[10px] text-slate-400">Media familiar</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
