import { createClient } from '@supabase/supabase-js';

// URL del proyecto del usuario en Supabase
export const DEFAULT_SUPABASE_URL = 'https://ggvxdvqrvhwsekzluggy.supabase.co';

export const getSupabaseUrl = (): string => {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    localStorage.getItem('nutreia_supabase_url') ||
    DEFAULT_SUPABASE_URL
  );
};

export const getSupabaseAnonKey = (): string => {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem('nutreia_supabase_anon_key') ||
    ''
  );
};

export const isSupabaseConfigured = (): boolean => {
  const key = getSupabaseAnonKey();
  return Boolean(key && key.length > 20 && key !== 'placeholder-anon-key');
};

export const getSupabaseClient = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey() || 'placeholder-key';
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

export const supabase = getSupabaseClient();
