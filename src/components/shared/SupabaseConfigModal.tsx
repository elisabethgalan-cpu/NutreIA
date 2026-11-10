import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Database, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Key } from 'lucide-react';
import { DEFAULT_SUPABASE_URL, getSupabaseAnonKey } from '@/lib/supabase/client';

export const SupabaseConfigModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { dbStatus, saveSupabaseCredentials, refreshDbStatus } = useAuth();
  const [anonKey, setAnonKey] = useState(getSupabaseAnonKey());
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await saveSupabaseCredentials(anonKey, DEFAULT_SUPABASE_URL);
      setMessage('¡Credenciales guardadas y conexión verificada con éxito!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Conexión con Supabase</h2>
              <p className="text-xs text-slate-500">Proyecto: ggvxdvqrvhwsekzluggy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ×
          </button>
        </div>

        {/* Estado actual */}
        <div
          className={`p-3.5 rounded-xl border flex items-start space-x-2.5 text-xs ${
            dbStatus.connected && dbStatus.tablesExist
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {dbStatus.connected && dbStatus.tablesExist ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold">Estado: </span>
            <span>{dbStatus.message}</span>
          </div>
        </div>

        {/* Formulario de credenciales */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">URL del Proyecto</label>
            <input
              type="text"
              readOnly
              value={DEFAULT_SUPABASE_URL}
              className="mt-1 w-full text-xs bg-slate-100 text-slate-600 border border-slate-200 rounded-lg p-2.5 cursor-not-allowed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Clave Pública de Supabase (<span className="text-emerald-700">anon public key</span>)
              </label>
              <a
                href="https://supabase.com/dashboard/project/ggvxdvqrvhwsekzluggy/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
              >
                <span>Copiar en Supabase</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <textarea
              required
              rows={3}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="Pega aquí tu clave anon (empieza por eyJhbGci...)"
              className="mt-1 w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400">
              La encuentras en tu dashboard de Supabase → Project Settings → API → Project API Keys → anon public.
            </span>
          </div>

          {message && (
            <div className="p-2.5 bg-emerald-100 text-emerald-900 text-xs rounded-lg text-center font-semibold">
              {message}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={refreshDbStatus}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Probar Conexión
            </button>
            <button
              type="submit"
              disabled={isSaving || !anonKey.trim()}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Conectar y Guardar'}
            </button>
          </div>
        </form>

        {/* Guía rápida para ejecutar migraciones */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-slate-500" />
            <span>¿Aún no has creado las tablas en PostgreSQL?</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Abre el{' '}
            <a
              href="https://supabase.com/dashboard/project/ggvxdvqrvhwsekzluggy/sql/new"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 font-bold underline"
            >
              SQL Editor de Supabase
            </a>{' '}
            y ejecuta el contenido del archivo{' '}
            <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">
              supabase/setup_complete.sql
            </code>{' '}
            que hemos preparado en el proyecto.
          </p>
        </div>
      </div>
    </div>
  );
};
