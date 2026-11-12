import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { demoRecipes } from '@/lib/mockData';
import { adaptRecipeServing } from '@/lib/nutrition/calculator';
import { checkRecipeAllergenConflicts } from '@/lib/validation/rules';
import {
  generateRecipeWithAI,
  getStoredGeminiKey,
  setStoredGeminiKey,
} from '@/lib/nutrition/aiRecipeGenerator';
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
  X,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Key,
  Flame,
  CheckCircle2,
  Sparkle,
  SlidersHorizontal,
} from 'lucide-react';
import { MealType, Recipe } from '@/types/database';
import { saveMealRating } from '@/lib/supabase/service';

export interface DynamicMealSlot {
  id: string;
  day: string;
  mealType: MealType;
  title: string;
  time: string;
  recipe: Recipe;
  status: 'proposed' | 'accepted' | 'rejected';
  rejectionReason?: string;
  historyCount: number;
}

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const NutritionOverviewPage: React.FC = () => {
  const { currentMember, members } = useAuth();
  const [activeTab, setActiveTab] = useState<'menu' | 'recipes' | 'shopping' | 'ranking'>('menu');
  const [selectedDay, setSelectedDay] = useState('Lunes');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Estado de carga individual por comida durante la generación con IA
  const [loadingSlotId, setLoadingSlotId] = useState<string | null>(null);

  // Modal para rechazar con motivo personalizado/rápido
  const [rejectingSlot, setRejectingSlot] = useState<DynamicMealSlot | null>(null);
  const [customRejectReason, setCustomRejectReason] = useState('');

  // Modal de configuración de clave Gemini
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => getStoredGeminiKey());
  const [geminiActive, setGeminiActive] = useState(() => Boolean(getStoredGeminiKey()));

  // Ratings State
  const [ratings, setRatings] = useState<{ [key: string]: number }>({
    'rec-001': 5,
    'rec-002': 4,
  });

  // Lista de items de la compra marcados como comprados
  const [purchasedItems, setPurchasedItems] = useState<{ [key: string]: boolean }>({});

  // 1. Estado del Menú Semanal Dinámico (cargado de localStorage o inicializado)
  const [weeklyPlan, setWeeklyPlan] = useState<DynamicMealSlot[]>(() => {
    const saved = localStorage.getItem('nutreia_dynamic_weekly_plan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parseando nutreia_dynamic_weekly_plan', e);
      }
    }
    return initializeDefaultWeeklyPlan();
  });

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    localStorage.setItem('nutreia_dynamic_weekly_plan', JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  // Contador de progreso del menú
  const totalSlots = weeklyPlan.length;
  const acceptedSlots = weeklyPlan.filter((s) => s.status === 'accepted').length;
  const progressPercent = Math.round((acceptedSlots / (totalSlots || 1)) * 100);

  const triggerFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Guardar clave de Gemini
  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGeminiKey(geminiKeyInput);
    setGeminiActive(Boolean(geminiKeyInput.trim()));
    setShowKeyModal(false);
    triggerFeedback(
      geminiKeyInput.trim()
        ? '✓ Clave de Google Gemini API guardada. Las recetas se generarán con Gemini 1.5 Flash.'
        : '✓ Clave eliminada. Se utilizará el motor algorítmico mediterráneo integrado.'
    );
  };

  // =========================================================================
  // ACCIONES DINÁMICAS: ACEPTAR O RECHAZAR RECETA
  // =========================================================================

  // Aceptar la receta actual para ese día y franja horaria
  const handleAcceptRecipe = (slotId: string) => {
    setWeeklyPlan((prev) =>
      prev.map((slot) => {
        if (slot.id === slotId) {
          return { ...slot, status: 'accepted' };
        }
        return slot;
      })
    );
    const slot = weeklyPlan.find((s) => s.id === slotId);
    triggerFeedback(`✓ ¡Receta "${slot?.recipe.name}" aceptada para el ${slot?.day} (${slot?.title})!`);
  };

  // Rechazar y generar una nueva receta con IA
  const handleRejectAndRegenerate = async (slot: DynamicMealSlot, reason?: string) => {
    setLoadingSlotId(slot.id);
    setRejectingSlot(null);
    setCustomRejectReason('');

    try {
      const newRecipe = await generateRecipeWithAI({
        mealType: slot.mealType,
        member: currentMember,
        rejectedRecipeName: slot.recipe.name,
        rejectionReason: reason || undefined,
      });

      setWeeklyPlan((prev) =>
        prev.map((s) => {
          if (s.id === slot.id) {
            return {
              ...s,
              recipe: newRecipe,
              status: 'proposed', // Nueva propuesta lista para aceptar o volver a rechazar
              rejectionReason: reason,
              historyCount: s.historyCount + 1,
            };
          }
          return s;
        })
      );

      triggerFeedback(
        `✨ La IA ha generado una nueva propuesta para ${slot.day} (${slot.title}): "${newRecipe.name}"`
      );
    } catch (err: any) {
      console.error('Error generando receta alternativa:', err);
      triggerFeedback('⚠️ Ocurrió un error al generar la receta alternativa. Inténtalo de nuevo.');
    } finally {
      setLoadingSlotId(null);
    }
  };

  // Regenerar todo el día con IA
  const handleRegenerateDay = async (day: string) => {
    const daySlots = weeklyPlan.filter((s) => s.day === day && s.status !== 'accepted');
    if (daySlots.length === 0) {
      triggerFeedback(`Todas las comidas del ${day} ya están aceptadas.`);
      return;
    }

    triggerFeedback(`✨ Regenerando con IA las comidas pendientes del ${day}...`);
    for (const slot of daySlots) {
      await handleRejectAndRegenerate(slot, 'Regeneración diaria solicitada');
    }
  };

  // Valoración con estrellas
  const handleRate = async (recipeId: string, stars: number) => {
    setRatings((prev) => ({ ...prev, [recipeId]: stars }));
    const savedInDb = await saveMealRating(recipeId, currentMember.id, stars);
    const destination = savedInDb ? 'guardada en Supabase' : 'guardada localmente';
    triggerFeedback(
      `¡Valoración de ${stars} estrellas ${destination} para ${currentMember.display_name}!`
    );
  };

  // Filtrar comidas del día seleccionado
  const currentDaySlots = useMemo(() => {
    return weeklyPlan.filter((s) => s.day === selectedDay);
  }, [weeklyPlan, selectedDay]);

  // Lista consolidada de ingredientes de todas las recetas semanales
  const consolidatedShoppingList = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; unit: string; foodGroup: string }>();

    weeklyPlan.forEach((slot) => {
      (slot.recipe.ingredients || []).forEach((ingDetail) => {
        const name = ingDetail.ingredient?.name || 'Ingrediente';
        const foodGroup = ingDetail.ingredient?.food_group || 'Varios';
        const unit = ingDetail.unit || 'g';
        const key = `${name.toLowerCase()}-${unit.toLowerCase()}`;

        // Multiplicado por el número de miembros de la familia
        const qtyPerMember = ingDetail.quantity || 100;
        const totalFamilyQty = qtyPerMember * (members.length || 1);

        if (map.has(key)) {
          const current = map.get(key)!;
          current.quantity += totalFamilyQty;
        } else {
          map.set(key, {
            name,
            quantity: totalFamilyQty,
            unit,
            foodGroup,
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => a.foodGroup.localeCompare(b.foodGroup));
  }, [weeklyPlan, members.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* =================================================================== */}
      {/* ENCABEZADO Y SELECTOR DE MOTOR IA                                  */}
      {/* =================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-sm font-semibold">
            <Utensils className="w-4 h-4" />
            <span>Módulo de Nutrición y Alimentación Dinámica</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Planificación Familiar con IA
          </h1>
          <p className="text-slate-500 text-sm">
            Recetas dinámicas mediterráneas: acepta tus favoritas o rechaza para que la IA genere una
            nueva alternativa al instante.
          </p>
        </div>

        {/* Botón de configuración de IA y Pestañas */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Indicador y botón de IA */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-sm ${
              geminiActive
                ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
            title="Configurar conexión con Google Gemini API"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{geminiActive ? 'IA: Gemini Flash Conectada' : 'IA: Motor Mediterráneo'}</span>
            <SlidersHorizontal className="w-3 h-3 text-slate-400 ml-1" />
          </button>

          {/* Pestañas principales */}
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
              Catálogo
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'shopping' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Lista Compra ({consolidatedShoppingList.length})
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
      </div>

      {/* Toast de notificación de feedback */}
      {feedbackMessage && (
        <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-white ml-3"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* VISTA 1: MENÚ SEMANAL DINÁMICO (ACEPTAR / RECHAZAR CON IA)          */}
      {/* =================================================================== */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Barra de progreso de aprobación de la semana */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm flex-shrink-0">
                {progressPercent}%
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Progreso de Planificación Semanal
                </h4>
                <p className="text-xs text-slate-600">
                  {acceptedSlots} de {totalSlots} comidas aprobadas por la familia.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <div className="w-36 bg-slate-200 h-2.5 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <button
                onClick={() => handleRegenerateDay(selectedDay)}
                className="text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors shadow-sm flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3 text-emerald-700" />
                <span>Regenerar {selectedDay} con IA</span>
              </button>
            </div>
          </div>

          {/* Selector de Días (Lunes a Domingo) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {DAYS_OF_WEEK.map((day) => {
              const daySlots = weeklyPlan.filter((s) => s.day === day);
              const allAccepted = daySlots.every((s) => s.status === 'accepted');

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    selectedDay === day
                      ? 'bg-slate-900 text-white shadow-md scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{day}</span>
                  {allAccepted && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Comidas del Día Seleccionado (Desayuno, Comida, Cena) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentDaySlots.map((slot) => {
              const recipe = slot.recipe;
              const isAccepted = slot.status === 'accepted';
              const isLoading = loadingSlotId === slot.id;

              // Factor de ración individual configurado para el miembro activo
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
                  key={slot.id}
                  className={`bg-white rounded-3xl p-6 shadow-sm border transition-all relative flex flex-col justify-between space-y-5 ${
                    isAccepted
                      ? 'border-emerald-300 ring-2 ring-emerald-400/20 bg-gradient-to-b from-white to-emerald-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Overlay de Carga durante la Generación con IA */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-900 flex items-center justify-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                          <span>Consultando con la IA NutreIA...</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Diseñando una nueva propuesta mediterránea para {slot.title.toLowerCase()}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cuerpo Superior: Cabecera, Nombre, Alertas y Nutrición */}
                  <div className="space-y-3.5">
                    {/* Título de la Comida, Horario y Badge de Estado */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                          {slot.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">• {slot.time}</span>
                      </div>

                      {/* Estado: Aceptada vs Propuesta */}
                      {isAccepted ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full shadow-xs">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>Aceptada</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Propuesta IA</span>
                        </span>
                      )}
                    </div>

                    {/* Nombre y Descripción */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {recipe.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>

                    {/* Tiempos de preparación */}
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {recipe.prep_time_minutes + recipe.cook_time_minutes} min total
                      </span>
                      {slot.historyCount > 0 && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          Opción #{slot.historyCount + 1}
                        </span>
                      )}
                    </div>

                    {/* Alerta de Conflicto de Alergias */}
                    {conflicts.length > 0 && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Incompatible:</span> Contiene ingredientes
                          excluidos para {currentMember.display_name}. Se recomienda rechazar y
                          pedir una alternativa a la IA.
                        </div>
                      </div>
                    )}

                    {/* Desglose Nutricional Adaptado a la ración del miembro */}
                    <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span>Ración ({currentMember.display_name} - {factor}x)</span>
                        <span className="text-sm font-black text-emerald-700">
                          {nutritionalSummary.energyKcal} kcal
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-600 text-center font-medium">
                        <div className="bg-white/80 p-1 rounded-lg">
                          <div className="text-slate-400">Proteína</div>
                          <div className="font-bold text-slate-800">
                            {nutritionalSummary.proteinG}g
                          </div>
                        </div>
                        <div className="bg-white/80 p-1 rounded-lg">
                          <div className="text-slate-400">Carbos</div>
                          <div className="font-bold text-slate-800">
                            {nutritionalSummary.carbsG}g
                          </div>
                        </div>
                        <div className="bg-white/80 p-1 rounded-lg">
                          <div className="text-slate-400">Grasas</div>
                          <div className="font-bold text-slate-800">{nutritionalSummary.fatG}g</div>
                        </div>
                      </div>
                    </div>

                    {/* Ingredientes Principales */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Ingredientes principales
                      </span>
                      <ul className="text-xs text-slate-700 mt-1.5 space-y-1">
                        {adaptedIngredients.slice(0, 3).map((ing, i) => (
                          <li
                            key={i}
                            className="flex justify-between border-b border-slate-50 py-0.5 text-[11px]"
                          >
                            <span className="truncate pr-2">{ing.name}</span>
                            <span className="font-bold text-slate-500 whitespace-nowrap">
                              {ing.quantity} {ing.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* BOTONES DINÁMICOS: ACEPTAR O RECHAZAR RECETA            */}
                  {/* ======================================================= */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Botón Aceptar */}
                      <button
                        type="button"
                        onClick={() => handleAcceptRecipe(slot.id)}
                        disabled={isLoading}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                          isAccepted
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isAccepted ? 'Aceptada ✓' : 'Aceptar'}</span>
                      </button>

                      {/* Botón Rechazar / Pedir otra con IA */}
                      <button
                        type="button"
                        onClick={() => setRejectingSlot(slot)}
                        disabled={isLoading}
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm bg-rose-50 hover:bg-rose-600 text-rose-800 hover:text-white border border-rose-200"
                        title="Rechazar esta propuesta y pedir otra a la IA"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </button>
                    </div>

                    {/* Valoración Individual */}
                    <div className="pt-2 flex items-center justify-between text-slate-400">
                      <span className="text-[11px]">Valorar:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRate(recipe.id, star)}
                            className="p-0.5 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VISTA 2: CATÁLOGO DE TODAS LAS RECETAS GENERADAS                   */}
      {/* =================================================================== */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {weeklyPlan.map((slot) => {
            const recipe = slot.recipe;
            return (
              <div
                key={slot.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{recipe.name}</h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Prep: {recipe.prep_time_minutes} min</span>
                      <span>• Cocción: {recipe.cook_time_minutes} min</span>
                      <span>• {slot.day} ({slot.title})</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {slot.mealType}
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
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* VISTA 3: LISTA DE LA COMPRA CONSOLIDADA CON LAS RECETAS SEMANALES   */}
      {/* =================================================================== */}
      {activeTab === 'shopping' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6 max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lista Consolidada Semanal</h2>
              <p className="text-xs text-slate-500">
                Suma total calculada automáticamente a partir de los ingredientes de las recetas para
                los {members.length} miembros.
              </p>
            </div>
            <button
              onClick={() => {
                const allMarked: { [k: string]: boolean } = {};
                consolidatedShoppingList.forEach((item) => {
                  allMarked[item.name] = true;
                });
                setPurchasedItems(allMarked);
                triggerFeedback('✓ Todos los ingredientes marcados como comprados.');
              }}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Marcar todo comprado
            </button>
          </div>

          <div className="space-y-3">
            {consolidatedShoppingList.map((item, idx) => {
              const isDone = Boolean(purchasedItems[item.name]);
              return (
                <div
                  key={idx}
                  onClick={() =>
                    setPurchasedItems((prev) => ({ ...prev, [item.name]: !prev[item.name] }))
                  }
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 opacity-60 line-through'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-xs text-slate-800">{item.name}</span>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                        {item.foodGroup}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {Math.round(item.quantity)} {item.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VISTA 4: RANKING FAMILIAR                                          */}
      {/* =================================================================== */}
      {activeTab === 'ranking' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6 max-w-3xl">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Ranking Familiar de Recetas</h2>
            <p className="text-xs text-slate-500">
              Valoraciones de los miembros de la familia para retroalimentar la generación de recetas
              con IA.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center justify-between">
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
                  5.0
                </div>
                <span className="text-[10px] text-slate-400">Media familiar</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  #2 Aceptación Alta
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  Tostada de centeno con aguacate, tomate y semillas de chía
                </h4>
                <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1">
                  <span>2 de 3 miembros han valorado</span>
                  <span>• 100% repetiría</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-slate-700 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  4.8
                </div>
                <span className="text-[10px] text-slate-400">Media familiar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: RECHAZAR RECETA Y PEDIR OTRA CON IA (CON MOTIVO OPCIONAL)   */}
      {/* =================================================================== */}
      {rejectingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-md">
                  Rechazar Propuesta
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  ¿Por qué rechazas esta receta?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receta actual: <span className="font-semibold text-slate-700">"{rejectingSlot.recipe.name}"</span>
                </p>
              </div>
              <button
                onClick={() => setRejectingSlot(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Motivos rápidos para orientar a la IA */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Sugerencia rápida para la IA (Opcional):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Quiero pescado blanco o azul',
                  'Quiero carne de ave (pollo/pavo)',
                  'Prefiero legumbres o vegetariano',
                  'Más rápido (<15 minutos)',
                  'Más ligero y bajo en calorías',
                  'Sorpréndeme',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setCustomRejectReason(chip)}
                    className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                      customRejectReason === chip
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Campo de texto libre */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                O escribe lo que te apetece hoy:
              </label>
              <input
                type="text"
                value={customRejectReason}
                onChange={(e) => setCustomRejectReason(e.target.value)}
                placeholder="Ej: No me apetece salmón hoy, prefiero pollo con verduras"
                className="mt-1 w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Botones de acción */}
            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleRejectAndRegenerate(rejectingSlot, customRejectReason)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Generar nueva receta con IA</span>
              </button>
              <button
                type="button"
                onClick={() => setRejectingSlot(null)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CONFIGURAR CLAVE DE GOOGLE GEMINI API                       */}
      {/* =================================================================== */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
                  <Sparkles className="w-3 h-3" /> Motor de IA
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Configuración de Google Gemini API
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  NutreIA puede usar el modelo oficial **Gemini 1.5 Flash** para crear recetas
                  personalizadas adaptadas en tiempo real.
                </p>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGeminiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Clave de API de Gemini (Google AI Studio)
                </label>
                <div className="relative mt-1">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full text-xs font-mono border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Si dejas este campo vacío, la aplicación utilizará automáticamente el{' '}
                  <span className="font-semibold text-slate-600">
                    Motor Algorítmico Mediterráneo Integrado
                  </span>{' '}
                  (con 100% de recetas equilibradas garantizadas sin coste).
                </p>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Configuración</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ===========================================================================
// FUNCIÓN AUXILIAR: INICIALIZAR MENÚ SEMANAL EQUILIBRADO
// ===========================================================================
function initializeDefaultWeeklyPlan(): DynamicMealSlot[] {
  const plan: DynamicMealSlot[] = [];

  const recipeBreakfast1 = demoRecipes[1]; // Tostada integral
  const recipeLunch1 = demoRecipes[0]; // Salmón al horno
  const recipeDinner1 = {
    ...demoRecipes[0],
    id: 'rec-init-dinner-1',
    name: 'Dorada a la plancha con espárragos trigueros y tomate aliñado',
    description: 'Cena ligera y saciante, ideal para una digestión óptima y descanso reparador.',
    prep_time_minutes: 10,
    cook_time_minutes: 12,
    category: 'cena',
    ingredients: demoRecipes[0].ingredients,
  };

  DAYS_OF_WEEK.forEach((day, index) => {
    plan.push({
      id: `${day}-breakfast`,
      day,
      mealType: 'breakfast',
      title: 'Desayuno',
      time: '08:30',
      recipe: { ...recipeBreakfast1, id: `rec-${day}-b` },
      status: index === 0 ? 'accepted' : 'proposed',
      historyCount: 0,
    });

    plan.push({
      id: `${day}-lunch`,
      day,
      mealType: 'lunch',
      title: 'Comida',
      time: '14:00',
      recipe: { ...recipeLunch1, id: `rec-${day}-l` },
      status: index === 0 ? 'accepted' : 'proposed',
      historyCount: 0,
    });

    plan.push({
      id: `${day}-dinner`,
      day,
      mealType: 'dinner',
      title: 'Cena',
      time: '21:00',
      recipe: { ...recipeDinner1, id: `rec-${day}-d` },
      status: 'proposed',
      historyCount: 0,
    });
  });

  return plan;
}
