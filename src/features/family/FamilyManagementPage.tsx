import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Users, UserPlus, Shield, HeartPulse, Dumbbell, AlertTriangle } from 'lucide-react';
import { calculateAge, isMinor } from '@/lib/validation/rules';
import { ActivityLevel, Role, TrainingLevel } from '@/types/database';

export const FamilyManagementPage: React.FC = () => {
  const { family, members, addMember, isAdmin } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [birthDate, setBirthDate] = useState('1995-01-01');
  const [heightCm, setHeightCm] = useState(170);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [nutritionGoal, setNutritionGoal] = useState('Salud y vitalidad');
  const [energyTarget, setEnergyTarget] = useState<number | undefined>(undefined);
  const [trainingGoal, setTrainingGoal] = useState('Tonificación y salud postural');
  const [trainingLevel, setTrainingLevel] = useState<TrainingLevel>('beginner');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(45);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMember({
      display_name: name,
      role,
      status: 'active',
      profile: {
        id: `prof-${Date.now()}`,
        family_member_id: '',
        birth_date: birthDate,
        height_cm: heightCm,
        activity_level: activityLevel,
        nutrition_goal: nutritionGoal,
        energy_target_kcal: energyTarget,
        training_goal: trainingGoal,
        training_level: trainingLevel,
        training_days_per_week: daysPerWeek,
        session_duration_minutes: durationMinutes,
        updated_at: new Date().toISOString(),
      },
      preferences: [],
    });

    setName('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-slate-500 text-sm">
            <Users className="w-4 h-4" />
            <span>Núcleo Familiar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {family.name}
          </h1>
          <p className="text-slate-500 text-sm">
            Gestiona los miembros, perfiles individuales, alergias y objetivos deportivos.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Añadir Miembro</span>
          </button>
        )}
      </div>

      {/* Grid de Miembros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => {
          const bDate = member.profile?.birth_date || '';
          const age = calculateAge(bDate);
          const minor = isMinor(bDate);

          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{member.display_name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      {member.role === 'admin' ? (
                        <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Administrador
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          Miembro
                        </span>
                      )}

                      {minor && (
                        <span className="text-[11px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Menor ({age} años)
                        </span>
                      )}
                      {!minor && age > 0 && (
                        <span className="text-[11px] text-slate-500">{age} años</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Datos de Nutrición */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold">
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>Objetivo Alimentario</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {member.profile?.nutrition_goal || 'Equilibrio mediterráneo'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Energía:{' '}
                    {minor
                      ? 'Sin restricción calórica (Crecimiento)'
                      : member.profile?.energy_target_kcal
                      ? `${member.profile.energy_target_kcal} kcal/día`
                      : 'Equilibrio mediterráneo'}
                  </p>
                </div>

                {/* Preferencias / Alérgenos */}
                {member.preferences && member.preferences.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Restricciones / Gustos
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {member.preferences.map((p) => (
                        <span
                          key={p.id}
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            p.preference_type === 'allergy'
                              ? 'bg-rose-100 text-rose-800'
                              : p.preference_type === 'dislike'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.preference_type === 'allergy' ? '⚠️ Alergia: ' : ''}
                          {p.item_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Datos de Gimnasio */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs text-sky-700 font-semibold">
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>Objetivo Deportivo</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {member.profile?.training_goal || 'Salud general'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Nivel: {member.profile?.training_level || 'Principiante'}</span>
                    <span>
                      {member.profile?.training_days_per_week || 3} días •{' '}
                      {member.profile?.session_duration_minutes || 45} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para añadir miembro */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900">Añadir Nuevo Miembro Familiar</h2>
            <p className="text-xs text-slate-500 mt-1">
              La arquitectura admite ampliar la familia sin restricciones de base de datos.
            </p>

            <form onSubmit={handleCreateMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Nombre o Alias</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Lucía"
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Rol</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  >
                    <option value="member">Miembro</option>
                    <option value="admin">Administrador Familiar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Objetivo Nutricional
                </label>
                <input
                  type="text"
                  value={nutritionGoal}
                  onChange={(e) => setNutritionGoal(e.target.value)}
                  placeholder="Ej: Dieta equilibrada, ganar energía"
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Kcal Objetivo (Opcional)
                  </label>
                  <input
                    type="number"
                    value={energyTarget || ''}
                    onChange={(e) => setEnergyTarget(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ej: 1500"
                    disabled={isMinor(birthDate)}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  {isMinor(birthDate) && (
                    <span className="text-[10px] text-purple-700 font-medium">
                      Inhabilitado: Menor de edad
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Nivel Gym</label>
                  <select
                    value={trainingLevel}
                    onChange={(e) => setTrainingLevel(e.target.value as TrainingLevel)}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Guardar Miembro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
