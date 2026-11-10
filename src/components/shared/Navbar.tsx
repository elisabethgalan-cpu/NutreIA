import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Utensils, Dumbbell, Users, Home, Shield, AlertTriangle, Database } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { isMinor } from '@/lib/validation/rules';
import { SupabaseConfigModal } from './SupabaseConfigModal';

export const Navbar: React.FC = () => {
  const { family, members, currentMember, setCurrentMemberId, dbStatus } = useAuth();
  const [showConfigModal, setShowConfigModal] = useState(false);

  const minor = currentMember.profile?.birth_date
    ? isMinor(currentMember.profile.birth_date)
    : false;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Familia */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                N
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-lg">NutreIA</span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {family.name}
                </span>
              </div>
            </div>

            {/* Menú de navegación principal */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </NavLink>

              <NavLink
                to="/nutrition"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                  }`
                }
              >
                <Utensils className="w-4 h-4" />
                <span>Alimentación</span>
              </NavLink>

              <NavLink
                to="/training"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-sky-700 hover:bg-slate-50'
                  }`
                }
              >
                <Dumbbell className="w-4 h-4" />
                <span>Gimnasio</span>
              </NavLink>

              <NavLink
                to="/family"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Users className="w-4 h-4" />
                <span>Familia ({members.length})</span>
              </NavLink>
            </nav>

            {/* Estado de Supabase & Selector de Miembro */}
            <div className="flex items-center space-x-3">
              {/* Botón estado Supabase */}
              <button
                onClick={() => setShowConfigModal(true)}
                className={`hidden lg:flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                  dbStatus.connected && dbStatus.tablesExist
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>
                  {dbStatus.connected && dbStatus.tablesExist
                    ? 'Supabase Conectado'
                    : 'Configurar Supabase'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    dbStatus.connected && dbStatus.tablesExist ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </button>

              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-500">Viendo como</div>
                <div className="text-xs font-semibold text-slate-800 flex items-center justify-end gap-1">
                  {currentMember.display_name}
                  {currentMember.role === 'admin' ? (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" /> Admin
                    </span>
                  ) : minor ? (
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" /> Menor
                    </span>
                  ) : null}
                </div>
              </div>

              <select
                value={currentMember.id}
                onChange={(e) => setCurrentMemberId(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200 border-0 rounded-lg text-xs font-medium text-slate-800 py-1.5 px-2.5 cursor-pointer focus:ring-2 focus:ring-emerald-500 transition-colors"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.display_name} ({m.role === 'admin' ? 'Admin' : 'Miembro'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navegación móvil inferior */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 bg-white">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] font-medium ${
                isActive ? 'text-slate-900 font-bold' : 'text-slate-500'
              }`
            }
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span>Inicio</span>
          </NavLink>
          <NavLink
            to="/nutrition"
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] font-medium ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
              }`
            }
          >
            <Utensils className="w-4 h-4 mb-0.5" />
            <span>Comidas</span>
          </NavLink>
          <NavLink
            to="/training"
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] font-medium ${
                isActive ? 'text-sky-600 font-bold' : 'text-slate-500'
              }`
            }
          >
            <Dumbbell className="w-4 h-4 mb-0.5" />
            <span>Gym</span>
          </NavLink>
          <NavLink
            to="/family"
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] font-medium ${
                isActive ? 'text-slate-900 font-bold' : 'text-slate-500'
              }`
            }
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>Familia</span>
          </NavLink>
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex flex-col items-center text-[10px] font-medium text-slate-500 hover:text-emerald-700"
          >
            <Database className="w-4 h-4 mb-0.5" />
            <span>BD</span>
          </button>
        </div>
      </header>

      <SupabaseConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />
    </>
  );
};
