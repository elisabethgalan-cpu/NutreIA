import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Shield, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC<{ onLoginSuccess?: () => void }> = ({ onLoginSuccess }) => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@nutreia.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          setError('Por favor indica tu nombre.');
          setLoading(false);
          return;
        }
        const res = await register(name, email, password);
        if (!res.success) {
          setError(res.error || 'Error al crear la cuenta.');
          setLoading(false);
          return;
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Credenciales no válidas.');
          setLoading(false);
          return;
        }
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl border border-slate-200 space-y-6">
        {/* Logo & Encabezado */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-600 items-center justify-center text-white font-extrabold text-2xl shadow-md">
            N
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bienvenido a NutreIA
          </h1>
          <p className="text-xs text-slate-500">
            Asistente familiar de alimentación mediterránea y entrenamiento
          </p>
        </div>

        {/* Pestañas Iniciar Sesión / Registrarse */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              !isRegisterMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              isRegisterMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700">Tu Nombre</label>
              <div className="relative mt-1">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Elisabeth"
                  className="w-full text-sm border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700">Correo Electrónico</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full text-sm border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Contraseña</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{isRegisterMode ? 'Crear mi Cuenta' : 'Entrar a la Aplicación'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Accesos rápidos de demostración */}
        {!isRegisterMode && (
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
              Cuentas de Acceso Rápido
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@nutreia.com', 'admin')}
                className="p-2.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-amber-900 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-amber-700 font-mono mt-0.5">admin@nutreia.com</div>
                <div className="text-[10px] text-amber-600">clave: admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('carlos@nutreia.com', '123')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>Miembro</span>
                </div>
                <div className="text-[10px] text-slate-600 font-mono mt-0.5">carlos@nutreia.com</div>
                <div className="text-[10px] text-slate-500">clave: 123</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
