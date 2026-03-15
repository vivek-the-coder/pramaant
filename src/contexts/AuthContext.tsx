import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface AppUser {
  id: string;
  name: string;
  role: 'clerk' | 'officer' | 'admin';
  department: string;
  ward?: string;
  designation: string;
}

interface AuthContextType {
  user: AppUser | null;
  login: (userId: string, password: string) => AppUser | null;
  logout: () => void;
  isAuthenticated: boolean;
}

// ── User Registry ─────────────────────────────────────────────
const USER_REGISTRY: Record<string, { password: string; user: AppUser }> = {
  manav121: {
    password: 'manavgov',
    user: {
      id: 'manav121',
      name: 'Manav Patel',
      role: 'officer',
      department: 'LAND_RECORDS',
      designation: 'Land Records Officer',
    },
  },
  meet110: {
    password: 'meetgov',
    user: {
      id: 'meet110',
      name: 'Meet Barot',
      role: 'officer',
      department: 'REVENUE',
      designation: 'Revenue Officer',
    },
  },
  vraj138: {
    password: 'vrajgov',
    user: {
      id: 'vraj138',
      name: 'Vraj Padaria',
      role: 'clerk',
      department: 'GENERAL',
      ward: 'Sisodara Ward-1',
      designation: 'Clerk',
    },
  },
  sachin128: {
    password: 'sachingov',
    user: {
      id: 'sachin128',
      name: 'Sachin Singh',
      role: 'clerk',
      department: 'GENERAL',
      ward: 'Tarsali Ward-3',
      designation: 'Clerk',
    },
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => null,
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    const stored = localStorage.getItem('pramaant_user');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('pramaant_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pramaant_user');
    }
  }, [user]);

  const login = (userId: string, password: string): AppUser | null => {
    const entry = USER_REGISTRY[userId.toLowerCase()];
    if (!entry) return null;
    if (entry.password !== password) return null;
    setUser(entry.user);
    return entry.user;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
