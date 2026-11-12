import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppUser, Family, FamilyMember, Role } from '@/types/database';
import { initialFamily, initialMembers, initialUsers } from '@/lib/mockData';
import {
  getFamilyAndMembers,
  saveFamilyMember,
  checkSupabaseHealth,
  DbStatus,
} from '@/lib/supabase/service';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextType {
  // Autenticación de usuario
  currentUser: AppUser | null;
  users: AppUser[];
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  createUser: (userData: Omit<AppUser, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (userId: string, updates: Partial<AppUser>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  // Gestión de Familia y Miembros
  family: Family;
  members: FamilyMember[];
  currentMember: FamilyMember;
  setCurrentMemberId: (id: string) => void;
  addMember: (newMember: Omit<FamilyMember, 'id' | 'family_id' | 'created_at'>) => Promise<void>;
  updateMember: (memberId: string, updates: Partial<FamilyMember>) => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;

  // Estado de Base de Datos
  dbStatus: DbStatus;
  refreshDbStatus: () => Promise<void>;
  saveSupabaseCredentials: (anonKey: string, customUrl?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Usuarios con contraseña
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('nutreia_app_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('nutreia_current_user');
    return saved ? JSON.parse(saved) : initialUsers[0]; // Usuario admin por defecto
  });

  // 2. Familia y Miembros
  const [family, setFamily] = useState<Family>(initialFamily);
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('nutreia_members');
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [currentMemberId, setCurrentMemberId] = useState<string>(() => {
    return currentUser?.linkedMemberId || members[0]?.id || 'mem-001';
  });

  // 3. Estado de Supabase
  const [dbStatus, setDbStatus] = useState<DbStatus>({
    connected: isSupabaseConfigured(),
    tablesExist: false,
    message: isSupabaseConfigured()
      ? 'Comprobando conexión con Supabase...'
      : 'Modo Local Activo (Base de datos en navegador)',
  });

  // Guardar en localStorage ante cambios
  useEffect(() => {
    localStorage.setItem('nutreia_app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nutreia_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nutreia_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nutreia_members', JSON.stringify(members));
  }, [members]);

  const loadData = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const health = await checkSupabaseHealth();
      setDbStatus(health);

      const { family: loadedFamily, members: loadedMembers } = await getFamilyAndMembers();
      setFamily(loadedFamily);
      setMembers(loadedMembers);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Login con contraseña
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'No existe ningún usuario registrado con ese correo electrónico.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Contraseña incorrecta. Por favor verifícala e inténtalo de nuevo.' };
    }

    setCurrentUser(user);
    if (user.linkedMemberId && members.some((m) => m.id === user.linkedMemberId)) {
      setCurrentMemberId(user.linkedMemberId);
    }
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Ya existe un usuario con este correo electrónico.' };
    }

    const newUser: AppUser = {
      id: `usr-${Date.now()}`,
      name,
      email: cleanEmail,
      password,
      role: 'member', // Nuevos registros son miembros por defecto
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  // Funciones exclusivas de Administrador para gestionar Usuarios con acceso
  const createUser = async (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    if (currentUser?.role !== 'admin') {
      throw new Error('Solo el administrador puede crear usuarios con acceso.');
    }
    const newUser: AppUser = {
      ...userData,
      email: userData.email.trim().toLowerCase(),
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = async (userId: string, updates: Partial<AppUser>) => {
    if (currentUser?.role !== 'admin') {
      throw new Error('Solo el administrador puede modificar usuarios.');
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteUser = async (userId: string) => {
    if (currentUser?.role !== 'admin') {
      throw new Error('Solo el administrador puede eliminar usuarios.');
    }
    if (currentUser.id === userId) {
      throw new Error('No puedes eliminar tu propia cuenta de administrador mientras tienes la sesión activa.');
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Funciones exclusivas de Administrador para gestionar Miembros Familiares
  const addMember = async (data: Omit<FamilyMember, 'id' | 'family_id' | 'created_at'>) => {
    if (currentUser?.role !== 'admin') {
      throw new Error('Solo el administrador puede añadir miembros a la familia.');
    }
    const created = await saveFamilyMember(family.id, data);
    setMembers((prev) => [...prev, created]);
  };

  const updateMember = async (memberId: string, updates: Partial<FamilyMember>) => {
    if (currentUser?.role !== 'admin') {
      throw new Error('Solo el administrador puede editar los miembros de la familia.');
    }
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            ...updates,
            profile: updates.profile ? { ...m.profile, ...updates.profile } : m.profile,
          };
        }
        return m;
      })
    );
  };

  const deleteMember = async (memberId: string) => {
    if (currentUser?.role !== 'admin') {
      throw new Error('Solo el administrador puede eliminar miembros de la familia.');
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

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

  const currentMember =
    members.find((m) => m.id === currentMemberId) ||
    members[0] ||
    initialMembers[0];

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAdmin,
        login,
        logout,
        register,
        createUser,
        updateUser,
        deleteUser,

        family,
        members,
        currentMember,
        setCurrentMemberId,
        addMember,
        updateMember,
        deleteMember,

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
