import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type AuthState = {
  userId: string;
  tenant: string | null;
};

type AuthContextValue = {
  auth: AuthState | null;
  signIn: (userId: string) => void;
  signOut: () => void;
  setTenant: (tenant: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthState | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      signIn: (userId) => setAuth({ userId, tenant: null }),
      signOut: () => setAuth(null),
      setTenant: (tenant) =>
        setAuth((prev) => (prev ? { ...prev, tenant } : prev)),
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
