import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole, teamId?: string) => void;
  canManageAll: boolean;
  canEditScores: boolean;
  canEditTeam: (teamId: string) => boolean;
  canEditPlayers: (teamId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, { pass: string; user: User }> = {
  admin: {
    pass: 'admin123',
    user: {
      id: 'u-1',
      username: 'admin',
      fullName: 'Glavni Administrator',
      role: 'admin'
    }
  },
  urednik: {
    pass: 'urednik123',
    user: {
      id: 'u-2',
      username: 'urednik',
      fullName: 'Luka Urednik (Rezultati)',
      role: 'editor'
    }
  },
  predstavnik: {
    pass: 'ekipa123',
    user: {
      id: 'u-3',
      username: 'predstavnik',
      fullName: 'Janez Novak (ŠD Meteor)',
      role: 'representative',
      teamId: 't-1-1'
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mrl_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to admin for easier initial evaluation or public
    return DEMO_USERS.admin.user;
  });

  const role: UserRole = currentUser ? currentUser.role : 'public';

  const login = (username: string, pass: string): boolean => {
    const lower = username.toLowerCase().trim();
    const match = DEMO_USERS[lower];
    if (match && match.pass === pass) {
      setCurrentUser(match.user);
      localStorage.setItem('mrl_auth_user', JSON.stringify(match.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mrl_auth_user');
  };

  const switchRole = (newRole: UserRole, teamId?: string) => {
    if (newRole === 'public') {
      logout();
      return;
    }

    if (newRole === 'admin') {
      setCurrentUser(DEMO_USERS.admin.user);
      localStorage.setItem('mrl_auth_user', JSON.stringify(DEMO_USERS.admin.user));
    } else if (newRole === 'editor') {
      setCurrentUser(DEMO_USERS.urednik.user);
      localStorage.setItem('mrl_auth_user', JSON.stringify(DEMO_USERS.urednik.user));
    } else if (newRole === 'representative') {
      const repUser: User = {
        id: 'u-rep',
        username: 'predstavnik',
        fullName: 'Predstavnik Ekipe',
        role: 'representative',
        teamId: teamId || 't-1-1'
      };
      setCurrentUser(repUser);
      localStorage.setItem('mrl_auth_user', JSON.stringify(repUser));
    }
  };

  const canManageAll = role === 'admin';
  const canEditScores = role === 'admin' || role === 'editor';
  
  const canEditTeam = (teamId: string) => {
    if (role === 'admin') return true;
    if (role === 'representative' && currentUser?.teamId === teamId) return true;
    return false;
  };

  const canEditPlayers = (teamId: string) => {
    return canEditTeam(teamId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        login,
        logout,
        switchRole,
        canManageAll,
        canEditScores,
        canEditTeam,
        canEditPlayers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
