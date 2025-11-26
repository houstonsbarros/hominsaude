import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
// Importe as novas funções de serviço aqui
import {
  socialLoginBackend,
  fetchUserWithToken,
  loginAuth,
  registerAuth,
} from "../services/login";

export type User = {
  uid: string;
  username: string;
  email: string;
  role: "user" | "admin";
  displayName?: string;
  photoURL?: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    username: string
  ) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // --- Login via Backend ---
  const login = async (email: string, password: string) => {
    try {
      // 1. Faz a chamada ao endpoint /account/login
      const response = await loginAuth({ email, password });

      // Assumindo que o backend retorna { access_token: "..." } ou { token: "..." }
      const token = response.access_token || response.token;

      if (!token) {
        throw new Error("Token não retornado pelo servidor.");
      }

      // 2. Usa o token para puxar os dados do usuário e setar o estado
      await loginWithToken(token);

      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      // Aqui você pode tratar erros específicos (401, 500) se desejar lançar exceção
      return false;
    }
  };

  // --- Registro via Backend ---
  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      // Mapeia os dados para o formato esperado pelo backend:
      // /account/register espera { email, name, password }
      const payload = {
        email,
        name: username, // Mapeando username do front para name do back
        password,
      };

      await registerAuth(payload);

      // Opcional: Se o backend já retornar o token no registro, você pode logar direto:
      // await login(email, password);

      return true;
    } catch (error: any) {
      console.error("Erro no registro:", error);
      // Repassa a mensagem de erro do backend para o componente exibir
      throw new Error(
        error.response?.data?.message || "Erro ao registrar usuário."
      );
    }
  };

  const loginWithGoogle = async () => {
    try {
      await socialLoginBackend();
      return;
    } catch (error) {
      console.error("Error during Google login:", error);
      return;
    }
  };

  const loginWithToken = async (token: string) => {
    try {
      // Persiste o token
      localStorage.setItem("access_token", token);

      // Tenta buscar as informações do usuário
      const data = await fetchUserWithToken(token);

      // Log para debug
      // eslint-disable-next-line no-console
      console.debug("fetchUserWithToken payload:", data);

      const payload = (data && (data.user ?? data)) as any;

      const userData: User = {
        uid:
          payload?.uid ?? payload?.id ?? payload?.sub ?? `user-${Date.now()}`,
        username:
          payload?.username ??
          payload?.name ??
          payload?.claims?.name ??
          payload?.claims?.nickname ??
          payload?.email?.split("@")[0] ??
          "Usuário",
        email: payload?.email ?? "",
        photoURL: payload?.photoURL ?? payload?.avatar ?? undefined,
        role: (payload?.role as "user" | "admin") ?? "user",
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("loginWithToken error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
  };

  // Restaura sessão ao carregar a página
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        // Se tem token mas o user state está null, tenta restaurar
        if (token && !user) {
          await loginWithToken(token);
        }
      } catch (err) {
        console.error("Error restoring user from token:", err);
        // Se falhar (token expirado), limpa tudo
        logout();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, register, loginWithGoogle, loginWithToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
