import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Family, FamilyMember } from '@/types/database';
import { initialFamily, initialMembers } from '@/lib/mockData';
import {
  getFamilyAndMembers,
  saveFamilyMember,
  checkSupabaseHealth,
  DbStatus,
} from '@/lib/supabase/service';
import { isSupabaseConfigured, getSupabaseUrl } from '@/lib/supabase/client';

interface AuthContextType {
  family: Family;
  members: FamilyMember[];
  currentMember: FamilyMember;
  setCurrentMemberId: (id: string) => void;
  addMember: (newMember: Omit<FamilyMember, 'id' | 'family_id' | 'created_at'>) => Promise<void>;
  isAdmin: boolean;
  dbStatus: DbStatus;
  refreshDbStatus: () => Promise<void>;
  saveSupabaseCredentials: (anonKey: string, customUrl?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [family, setFamily] = useState<Family>(initialFamily);
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const [currentMemberId, setCurrentMemberId] = useState<string>('mem-001');
  const [dbStatus, setDbStatus] = useState<DbStatus>({
    connected: isSupabaseConfigured(),
    tablesExist: false,
    message: isSupabaseConfigured()
      ? 'Comprobando conexión con Supabase...'
      : 'Modo Local (Sin Anon Key de Supabase)',
  });

  const loadData = useCallback(async () => {
    const health = await checkSupabaseHealth();
    setDbStatus(health);

    const { family: loadedFamily, members: loadedMembers } = await getFamilyAndMembers();
    setFamily(loadedFamily);
    setMembers(loadedMembers);
    if (loadedMembers.length > 0 && !loadedMembers.some((m) => m.id === currentMemberId)) {
      setCurrentMemberId(loadedMembers[0].id);
    }
  }, [currentMemberId]);

  useEffect(() => {
    loadData();
  }, []);

  const refreshDbStatus = async () => {
    await loadData();
  };

  const saveSupabaseCredentials = async (anonKey: string, customUrl?: string) => {
    if (customUrl) {
      localStorage.setItem('nutreia_supabase_url', customUrl);
    }
    localStorage.setItem('nutreia_supabase_anon_key', anonKey.trim());
    await loadData();
  };

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0] || initialMembers[0];
  const isAdmin = currentMember?.role === 'admin';

  const addMember = async (data: Omit<FamilyMember, 'id' | 'family_id' | 'created_at'>) => {
    const created = await saveFamilyMember(family.id, data);
    setMembers((prev) => {
      const updated = [...prev, created];
      localStorage.setItem('nutreia_members', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        family,
        members,
        currentMember,
        setCurrentMemberId,
        addMember,
        isAdmin,
        dbStatus,
        refreshDbStatus,
        saveSupabaseCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
