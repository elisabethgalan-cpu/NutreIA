import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { demoMachines } from '@/lib/mockData';
import { calculateLoadProgression } from '@/lib/validation/rules';
import { recordExercisePerformance } from '@/lib/supabase/service';
import {
  Dumbbell,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
  Sliders,
  Sparkles,
  HeartCrack,
} from 'lucide-react';
import { ExercisePerformance, TechniqueStatus } from '@/types/database';

export const TrainingOverviewPage: React.FC = () => {
  const { currentMember, dbStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<'routine' | 'active_session' | 'machines'>('routine');

  // Estado de la sesión activa
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [actualLoad, setActualLoad] = useState<number>(45);
  const [completedSets, setCompletedSets] = useState<number>(3);
  const [rpe, setRpe] = useState<number>(7);
  const [techniqueStatus, setTechniqueStatus] = useState<TechniqueStatus>('correct');
  const [painReported, setPainReported] = useState<boolean>(false);
  const [painNotes, setPainNotes] = useState<string>('');

  const currentPerformance: ExercisePerformance = {
    id: `perf-${Date.now()}`,
    workout_session_id: 'sess-live',
    exercise_id: '30000000-0000-0000-0000-000000000001',
    actual_load: actualLoad,
    load_unit: 'kg',
    target_sets: 3,
    completed_sets: completedSets,
    target_reps: 10,
    reps_per_set: [10, 10, 10],
    rpe,
    technique_status: techniqueStatus,
    pain_reported: painReported,
    pain_notes: painNotes,
  };

  const progressionResult = calculateLoadProgression(currentPerformance, demoMachines[0]);

  const handleSavePerformance = async () => {
    const savedInDb = await recordExercisePerformance(currentMember.id, currentPerformance);
    setSaveMessage(
      savedInDb
        ? '✓ Registro y series guardados con éxito en la base de datos Supabase.'
        : '✓ Registro guardado en la memoria local.'
    );
    setSessionCompleted(true);
    setTimeout(() => setSessionCompleted(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-700 text-sm font-semibold">
            <Dumbbell className="w-4 h-4" />
            <span>Módulo de Gimnasio y Entrenamiento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Rutinas Seguras y Progresión Prudente
          </h1>
          <p className="text-slate-500 text-sm">
            Entrenamiento basado en equipamiento real disponible y sobrecarga progresiva adaptativa.
          </p>
        </div>

        {/* Pestañas */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('routine')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'routine' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Mi Rutina
          </button>
          <button
            onClick={() => setActiveTab('active_session')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'active_session' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Sesión Activa
          </button>
          <button
            onClick={() => setActiveTab('machines')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'machines' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Máquinas Disponibles ({demoMachines.length})
          </button>
        </div>
      </div>

      {/* Pestaña: Mi Rutina */}
      {activeTab === 'routine' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                Objetivo: {currentMember.profile?.training_goal || 'Tonificación y Salud'}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                Sesión 1: Tren Inferior y Espalda (Full Equipment)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Diseñado exclusivamente con las máquinas registradas en tu gimnasio: Prensa Inclinada,
                Jalón al Pecho y Press de Pecho.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('active_session')}
              className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar Esta Sesión</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoMachines.map((m, idx) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <span>Ejercicio #{idx + 1}</span>
                    <span>3 series x 10 reps</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{m.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-sky-700 mt-1 font-medium">
                    <span>Músculo: {m.muscle_groups_primary.join(', ')}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Tipo de carga: {m.machine_type} • Incrementos de {m.load_increment} {m.load_unit}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-700">Carga inicial prudente:</div>
                  <div className="text-slate-500">
                    Comenzar con {m.min_load || 15} {m.load_unit} para calibración y técnica perfecta.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pestaña: Sesión Activa y Progresión en Tiempo Real */}
      {activeTab === 'active_session' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 max-w-2xl mx-auto">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded uppercase">
                Ejercicio 1 de 3
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Prensa Inclinada de Piernas (45º)
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Objetivo: 3 series × 10 reps
            </span>
          </div>

          {/* Formulario interactivo de rendimiento */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Carga Real Utilizada (kg)
                </label>
                <div className="flex items-center mt-1 space-x-2">
                  <input
                    type="number"
                    step="2.5"
                    value={actualLoad}
                    onChange={(e) => setActualLoad(Number(e.target.value))}
                    className="w-full text-base font-bold border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Series Completadas (de 3)
                </label>
                <select
                  value={completedSets}
                  onChange={(e) => setCompletedSets(Number(e.target.value))}
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                >
                  <option value={1}>1 serie</option>
                  <option value={2}>2 series</option>
                  <option value={3}>3 series (Completo)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Esfuerzo Percibido (RPE 1-10)
                </label>
                <div className="flex items-center space-x-3 mt-1">
                  <input
                    type="range"
                    min="5"
                    max="10"
                    step="0.5"
                    value={rpe}
                    onChange={(e) => setRpe(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <span className="text-sm font-bold text-sky-800 w-8">{rpe}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {rpe <= 7 ? 'Moderado/Ligero' : rpe <= 8 ? 'Adecuado' : 'Máximo esfuerzo'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Técnica Ejecutada</label>
                <select
                  value={techniqueStatus}
                  onChange={(e) => setTechniqueStatus(e.target.value as TechniqueStatus)}
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                >
                  <option value="correct">Correcta y controlada</option>
                  <option value="needs_review">Necesita revisión / algo inestable</option>
                  <option value="incomplete">Incompleta / pérdida de rango</option>
                </select>
              </div>
            </div>

            {/* Checkbox de Dolor (Regla Crítica de Seguridad) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={painReported}
                  onChange={(e) => setPainReported(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  ¿Has sentido dolor articular o molestias anormales?
                </span>
              </label>

              {painReported && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={painNotes}
                    onChange={(e) => setPainNotes(e.target.value)}
                    placeholder="Describe dónde y qué molestia sentiste (ej: rodilla izquierda)..."
                    className="w-full text-xs border border-rose-300 rounded-lg p-2 bg-rose-50/50"
                  />
                </div>
              )}
            </div>

            {/* Tarjeta de Recomendación Explicable en Tiempo Real */}
            <div
              className={`p-4 rounded-xl border transition-colors ${
                progressionResult.isMedicalAlert
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : progressionResult.action === 'increase'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-sky-50 border-sky-300 text-sky-900'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider mb-1">
                {progressionResult.isMedicalAlert ? (
                  <>
                    <HeartCrack className="w-4 h-4 text-rose-600" />
                    <span>Protocolo de Seguridad Médica Activo</span>
                  </>
                ) : progressionResult.action === 'increase' ? (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Siguiente Sesión: Subir a {progressionResult.recommendedLoad} kg</span>
                  </>
                ) : (
                  <>
                    <Info className="w-4 h-4 text-sky-600" />
                    <span>Siguiente Sesión: Mantener {progressionResult.recommendedLoad} kg</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed">{progressionResult.reason}</p>
            </div>

            <button
              onClick={handleSavePerformance}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-sm"
            >
              Guardar Serie y Registrar Ejercicio
            </button>

            {sessionCompleted && (
              <div className="p-3 bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-xl text-center">
                {saveMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pestaña: Inventario de Máquinas */}
      {activeTab === 'machines' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoMachines.map((machine) => (
            <div
              key={machine.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-base font-bold text-slate-900">{machine.name}</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                  {machine.status}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Primarios: {machine.muscle_groups_primary.join(', ')}
              </p>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                <span>Rango: {machine.min_load}-{machine.max_load} kg</span>
                <span>Salto: +{machine.load_increment} kg</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
