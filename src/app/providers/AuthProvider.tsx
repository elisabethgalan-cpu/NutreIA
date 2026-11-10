import React, { createContext, useContext, useState, useEffect } from 'react';
import { Family, FamilyMember } from '@/types/database';
import { initialFamily, initialMembers } from '@/lib/mockData';

interface AuthContextType {
  family: Family;
  members: FamilyMember[];
  currentMember: FamilyMember;
  setCurrentMemberId: (id: string) => void;
  addMember: (newMember: Omit<FamilyMember, 'id' | 'family_id' | 'created_at'>) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [family] = useState<Family>(initialFamily);
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('nutreia_members');
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [currentMemberId, setCurrentMemberId] = useState<string>(() => {
    return members[0]?.id || 'mem-001';
  });

  useEffect(() => {
    localStorage.setItem('nutreia_members', JSON.stringify(members));
  }, [members]);

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];
  const isAdmin = currentMember?.role === 'admin';

  const addMember = (data: Omit<FamilyMember, 'id' | 'family_id' | 'created_at'>) => {
    const newMember: FamilyMember = {
      ...data,
      id: `mem-${Date.now()}`,
      family_id: family.id,
      created_at: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, newMember]);
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
