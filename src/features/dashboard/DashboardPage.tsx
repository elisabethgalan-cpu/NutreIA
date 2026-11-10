import React from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Dumbbell,
  Star,
  Sparkles,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { isMinor, validateEnergyTarget } from '@/lib/validation/rules';
import { demoRecipes } from '@/lib/mockData';

export const DashboardPage: React.FC = () => {
  const { currentMember, family } = useAuth();
  const birthDate = currentMember.profile?.birth_date || '';
  const minor = isMinor(birthDate);
  const targetKcal = currentMember.profile?.energy_target_kcal;
  const validation = validateEnergyTarget(birthDate, targetKcal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Bienvenida y Encabezado de Semana */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Semana en Curso • Lunes a Domingo
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            ¡Hola, {currentMember.display_name}!
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Planificación activa para la {family.name}
          </p>
        </div>

        {/* Accesos Rápidos */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/nutrition"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Utensils className="w-4 h-4" />
            <span>Ver Menú</span>
          </Link>

          <Link
            to="/training"
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Dumbbell className="w-4 h-4" />
            <span>Entrenar Hoy</span>
          </Link>
        </div>
      </div>

      {/* Alerta de Seguridad Pediátrica o Médica si aplica */}
      {minor && (
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-xl flex items-start space-x-3">
          <HeartHandshake className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-purple-900">
            <span className="font-bold">Aviso Pediátrico Activo:</span> Este perfil pertenece a un
            menor de edad en etapa de crecimiento. El sistema no aplicará dietas hipocalóricas ni
            restricciones adultas. Los menús promueven equilibrio mediterráneo y energía saludable.
          </div>
        </div>
      )}

      {/* Alerta de Alérgenos Registrados */}
      {currentMember.preferences && currentMember.preferences.some((p) => p.preference_type === 'allergy') && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900">
            <span className="font-bold">Filtro de Alergias Activo:</span> Se protegen recetas frente a:{' '}
            {currentMember.preferences
              .filter((p) => p.preference_type === 'allergy')
              .map((p) => p.item_name)
              .join(', ')}
            . Los platos que contengan estos ingredientes serán bloqueados automáticamente.
          </div>
        </div>
      )}

      {/* Grid de 2 Columnas: Alimentación y Gimnasio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tarjeta de Alimentación de Hoy */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Utensils className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Menú de Hoy</h2>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Mediterráneo
            </span>
          </div>

          <div className="space-y-3">
            {/* Desayuno */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100/80 transition-colors">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Desayuno
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {demoRecipes[1]?.name || 'Tostada con aguacate y huevo'}
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>10 min • AOVE, Huevo, Centeno</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                ~320 kcal
              </span>
            </div>

            {/* Comida */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100/80 transition-colors">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Comida
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {demoRecipes[0]?.name || 'Salmón con verduras y patata'}
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>25 min • Omega-3, Verdura fresca</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                ~580 kcal
              </span>
            </div>

            {/* Cena */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100/80 transition-colors">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Cena
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  Tortilla francesa con espinacas salteadas y ensalada
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>15 min • Ligera y saciante</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                ~390 kcal
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Objetivo diario estimado: {targetKcal ? `${targetKcal} kcal` : 'A demanda (saludable)'}</span>
            <Link
              to="/nutrition"
              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              Ver semana completa <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Tarjeta de Gimnasio / Sesión Activa */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Entrenamiento Asignado</h2>
            </div>
            <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
              {currentMember.profile?.training_level || 'Principiante'}
            </span>
          </div>

          <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                Rutina: {currentMember.profile?.training_goal || 'Tonificación y Fuerza'}
              </h3>
              <span className="text-xs text-sky-700 font-medium">
                ~{currentMember.profile?.session_duration_minutes || 45} min
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Enfocado en máquinas disponibles de tu gimnasio sin sobrecargar articulaciones:
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              <li>Prensa Inclinada a 45º (3 series x 10-12 reps)</li>
              <li>Jalón al Pecho en polea (3 series x 10 reps)</li>
              <li>Press de Pecho en máquina selectorizada (3 series x 10 reps)</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-slate-600">Última sesión registrada</span>
            </div>
            <span className="text-xs font-semibold text-slate-800">Ayer (RPE 7.0 - Normal)</span>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Sobrecarga prudente regulada</span>
            <Link
              to="/training"
              className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
            >
              Comenzar sesión <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Resumen de Valoraciones Familiares */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500 text-white rounded-xl shadow-sm">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Ranking Familiar Semanal</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Cada miembro puede puntuar de 1 a 5 estrellas los platos probados para mejorar las
              próximas semanas.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-lg font-black text-amber-700">4.8 / 5.0</div>
            <div className="text-[11px] text-amber-800/80">Plato top: Salmón al Horno</div>
          </div>
          <Link
            to="/nutrition"
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
          >
            Valorar
          </Link>
        </div>
      </div>
    </div>
  );
};
