import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import {
  Users,
  UserPlus,
  Shield,
  HeartPulse,
  Dumbbell,
  AlertTriangle,
  Lock,
  Edit2,
  Trash2,
  Key,
  Check,
  X,
  UserCheck,
} from 'lucide-react';
import { calculateAge, isMinor } from '@/lib/validation/rules';
import { ActivityLevel, FamilyMember, Role, TrainingLevel, AppUser } from '@/types/database';

export const FamilyManagementPage: React.FC = () => {
  const {
    family,
    members,
    addMember,
    updateMember,
    deleteMember,
    users,
    createUser,
    updateUser,
    deleteUser,
    isAdmin,
    currentUser,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'members' | 'access'>('members');

  // Modales
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Form State: Nuevo Miembro
  const [mName, setMName] = useState('');
  const [mRole, setMRole] = useState<Role>('member');
  const [mBirthDate, setMBirthDate] = useState('1995-01-01');
  const [mNutritionGoal, setMNutritionGoal] = useState('Equilibrio y salud general');
  const [mEnergyTarget, setMEnergyTarget] = useState<number | undefined>(undefined);
  const [mTrainingGoal, setMTrainingGoal] = useState('Tonificación y salud');
  const [mTrainingLevel, setMTrainingLevel] = useState<TrainingLevel>('beginner');

  // Form State: Nueva Cuenta de Usuario
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState<Role>('member');
  const [uLinkedMemberId, setULinkedMemberId] = useState<string>('');

  const triggerFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Guardar Nuevo Miembro
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim()) return;

    await addMember({
      display_name: mName,
      role: mRole,
      status: 'active',
      profile: {
        id: `prof-${Date.now()}`,
        family_member_id: '',
        birth_date: mBirthDate,
        height_cm: 170,
        activity_level: 'moderate',
        nutrition_goal: mNutritionGoal,
        energy_target_kcal: mEnergyTarget,
        training_goal: mTrainingGoal,
        training_level: mTrainingLevel,
        training_days_per_week: 3,
        session_duration_minutes: 45,
        updated_at: new Date().toISOString(),
      },
      preferences: [],
    });

    setMName('');
    setShowAddMemberModal(false);
    triggerFeedback(`✓ Miembro ${mName} añadido a la familia.`);
  };

  // Guardar Edición de Miembro
  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    await updateMember(editingMember.id, {
      display_name: editingMember.display_name,
      role: editingMember.role,
      profile: editingMember.profile,
    });

    setEditingMember(null);
    triggerFeedback(`✓ Miembro ${editingMember.display_name} actualizado con éxito.`);
  };

  // Eliminar Miembro
  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${memberName} de la familia?`)) {
      await deleteMember(memberId);
      triggerFeedback(`✓ ${memberName} ha sido eliminado.`);
    }
  };

  // Crear Cuenta de Acceso con Contraseña
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uEmail.trim() || !uPassword.trim()) return;

    await createUser({
      name: uName || uEmail.split('@')[0],
      email: uEmail,
      password: uPassword,
      role: uRole,
      linkedMemberId: uLinkedMemberId || undefined,
    });

    setUName('');
    setUEmail('');
    setUPassword('');
    setShowAddUserModal(false);
    triggerFeedback(`✓ Cuenta de acceso creada para ${uEmail}.`);
  };

  // Actualizar Contraseña o Rol de Cuenta
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    await updateUser(editingUser.id, {
      name: editingUser.name,
      password: editingUser.password,
      role: editingUser.role,
      linkedMemberId: editingUser.linkedMemberId,
    });

    setEditingUser(null);
    triggerFeedback(`✓ Cuenta de ${editingUser.email} actualizada.`);
  };

  // Eliminar Cuenta de Acceso
  const handleDeleteUser = async (userId: string, email: string) => {
    if (confirm(`¿Eliminar la cuenta de acceso de ${email}? Ya no podrá iniciar sesión.`)) {
      try {
        await deleteUser(userId);
        triggerFeedback(`✓ Cuenta ${email} eliminada.`);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-slate-500 text-sm font-semibold">
            <Users className="w-4 h-4" />
            <span>Gestión Familiar y Permisos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {family.name}
          </h1>
          <p className="text-slate-500 text-sm">
            {isAdmin
              ? 'Panel de Administrador: Tienes permisos para gestionar miembros y usuarios con acceso.'
              : 'Vista de Miembro: Modo de consulta familiar.'}
          </p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'members' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Miembros ({members.length})</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('access')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'access' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>Cuentas y Claves ({users.length})</span>
            </button>
          )}
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* AVISO PARA NO ADMINISTRADORES */}
      {!isAdmin && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start space-x-3">
          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900">
            <span className="font-bold">Acceso de Miembro:</span> Solo los usuarios con rol de
            Administrador pueden editar perfiles, añadir miembros o gestionar contraseñas de acceso.
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PESTAÑA 1: MIEMBROS DE LA FAMILIA                       */}
      {/* ======================================================== */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Perfiles de la Familia</h2>
            {isAdmin && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Añadir Nuevo Miembro</span>
              </button>
            )}
          </div>

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
                            <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Admin Familiar
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              Miembro
                            </span>
                          )}

                          {minor && (
                            <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Menor ({age} años)
                            </span>
                          )}
                          {!minor && age > 0 && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              {age} años
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botones de Administrador para editar/eliminar */}
                      {isAdmin && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setEditingMember(member)}
                            title="Editar Miembro"
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {members.length > 1 && (
                            <button
                              onClick={() => handleDeleteMember(member.id, member.display_name)}
                              title="Eliminar Miembro"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Nutrición */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-bold">
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span>Objetivo Alimentario</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        {member.profile?.nutrition_goal || 'Equilibrio mediterráneo'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Meta calórica:{' '}
                        {minor
                          ? 'Sin restricción (Edad de crecimiento)'
                          : member.profile?.energy_target_kcal
                          ? `${member.profile.energy_target_kcal} kcal/día`
                          : 'A demanda saludable'}
                      </p>
                    </div>

                    {/* Entrenamiento */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-xs text-sky-700 font-bold">
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>Entrenamiento</span>
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
        </div>
      )}

      {/* ======================================================== */}
      {/* PESTAÑA 2: CUENTAS DE ACCESO Y CONTRASEÑAS (ADMIN ONLY) */}
      {/* ======================================================== */}
      {activeTab === 'access' && isAdmin && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Usuarios con Contraseña de Acceso
              </h2>
              <p className="text-xs text-slate-500">
                Como Administrador, puedes crear cuentas, asignar contraseñas y definir qué personas
                entran a la app.
              </p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Cuenta de Usuario</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Correo / Login</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Contraseña Actual</th>
                    <th className="py-3 px-4">Perfil Asociado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u) => {
                    const linked = members.find((m) => m.id === u.linkedMemberId);
                    const isSelf = currentUser?.id === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-extrabold">
                              Tú
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                        <td className="py-3 px-4">
                          {u.role === 'admin' ? (
                            <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
                              <Shield className="w-3 h-3" /> Administrador
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md w-max">
                              Miembro
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {u.password ? '••••••••' : 'Sin clave asignada'}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {linked ? linked.display_name : 'Sin vincular'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editar Contraseña / Rol"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar Cuenta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: AÑADIR NUEVO MIEMBRO                              */}
      {/* ======================================================== */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900">Añadir Miembro a la Familia</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Solo tú como Administrador puedes añadir nuevos miembros.
            </p>

            <form onSubmit={handleCreateMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Nombre o Alias</label>
                <input
                  type="text"
                  required
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  placeholder="Ej: Lucía"
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Rol Familiar</label>
                  <select
                    value={mRole}
                    onChange={(e) => setMRole(e.target.value as Role)}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  >
                    <option value="member">Miembro</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    required
                    value={mBirthDate}
                    onChange={(e) => setMBirthDate(e.target.value)}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Objetivo Nutricional</label>
                <input
                  type="text"
                  value={mNutritionGoal}
                  onChange={(e) => setMNutritionGoal(e.target.value)}
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Kcal Objetivo</label>
                  <input
                    type="number"
                    value={mEnergyTarget || ''}
                    disabled={isMinor(mBirthDate)}
                    onChange={(e) => setMEnergyTarget(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ej: 1500"
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Nivel Gym</label>
                  <select
                    value={mTrainingLevel}
                    onChange={(e) => setMTrainingLevel(e.target.value as TrainingLevel)}
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
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Guardar Miembro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDITAR MIEMBRO EXISTENTE (ADMIN ONLY)             */}
      {/* ======================================================== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900">
              Editar Perfil de {editingMember.display_name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Modifica los datos personales y metas de este miembro.
            </p>

            <form onSubmit={handleUpdateMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Nombre Visible</label>
                <input
                  type="text"
                  required
                  value={editingMember.display_name}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, display_name: e.target.value })
                  }
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Rol Familiar</label>
                  <select
                    value={editingMember.role}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, role: e.target.value as Role })
                    }
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  >
                    <option value="member">Miembro</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    required
                    value={editingMember.profile?.birth_date || ''}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        profile: editingMember.profile
                          ? { ...editingMember.profile, birth_date: e.target.value }
                          : undefined,
                      })
                    }
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Objetivo Nutricional</label>
                <input
                  type="text"
                  value={editingMember.profile?.nutrition_goal || ''}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      profile: editingMember.profile
                        ? { ...editingMember.profile, nutrition_goal: e.target.value }
                        : undefined,
                    })
                  }
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Kcal Objetivo</label>
                  <input
                    type="number"
                    value={editingMember.profile?.energy_target_kcal || ''}
                    disabled={isMinor(editingMember.profile?.birth_date || '')}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        profile: editingMember.profile
                          ? {
                              ...editingMember.profile,
                              energy_target_kcal: e.target.value ? Number(e.target.value) : undefined,
                            }
                          : undefined,
                      })
                    }
                    placeholder="Ej: 1500"
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Nivel Gym</label>
                  <select
                    value={editingMember.profile?.training_level || 'beginner'}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        profile: editingMember.profile
                          ? { ...editingMember.profile, training_level: e.target.value as TrainingLevel }
                          : undefined,
                      })
                    }
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
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREAR NUEVA CUENTA DE USUARIO CON CONTRASEÑA      */}
      {/* ======================================================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Crear Acceso para un Usuario</h2>
            <p className="text-xs text-slate-500">
              Asigna un correo y contraseña para que un familiar pueda iniciar sesión.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">Nombre</label>
                <input
                  type="text"
                  required
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  placeholder="Ej: Carlos"
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Contraseña de Inicio</label>
                <input
                  type="text"
                  required
                  value={uPassword}
                  onChange={(e) => setUPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="mt-1 w-full text-sm font-mono border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Rol en la App</label>
                  <select
                    value={uRole}
                    onChange={(e) => setURole(e.target.value as Role)}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  >
                    <option value="member">Miembro</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Vincular a Perfil</label>
                  <select
                    value={uLinkedMemberId}
                    onChange={(e) => setULinkedMemberId(e.target.value)}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  >
                    <option value="">Sin vincular</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDITAR CONTRASEÑA / ROL DE USUARIO                */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Modificar Cuenta: {editingUser.email}
            </h2>
            <p className="text-xs text-slate-500">
              Cambia la contraseña o el rol de acceso de este usuario.
            </p>

            <form onSubmit={handleUpdateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">Nombre</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Nueva Contraseña</label>
                <input
                  type="text"
                  required
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="mt-1 w-full text-sm font-mono border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Rol</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value as Role })
                    }
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  >
                    <option value="member">Miembro</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Perfil Vinculado</label>
                  <select
                    value={editingUser.linkedMemberId || ''}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, linkedMemberId: e.target.value || undefined })
                    }
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg p-2.5"
                  >
                    <option value="">Sin vincular</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
