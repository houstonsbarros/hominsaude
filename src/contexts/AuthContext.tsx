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
  const [hasTriedRestore, setHasTriedRestore] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false); // Previne chamadas simultâneas

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
    // Previne múltiplas chamadas simultâneas
    if (isAuthenticating) {
      console.log("Autenticação já em andamento, ignorando chamada duplicada");
      return;
    }

    setIsAuthenticating(true);
    try {
      // Persiste o token
      localStorage.setItem("access_token", token);

      // Verifica se já temos dados recentes do usuário (cache de 5 minutos)
      const cachedUser = localStorage.getItem("user");
      const lastFetch = localStorage.getItem("user_last_fetch");
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutos em ms

      if (cachedUser && lastFetch && (now - parseInt(lastFetch)) < fiveMinutes) {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        console.log("Usando dados em cache do usuário (evitando chamada à API)");
        return;
      }

      // Tenta buscar as informações do usuário
      console.log("Buscando dados do usuário na API...");
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
      localStorage.setItem("user_last_fetch", now.toString());
    } catch (error) {
      console.error("loginWithToken error:", error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_last_fetch");
    setHasTriedRestore(false); // Reset para permitir nova tentativa de restauração
  };

  // Restaura sessão ao carregar a página (apenas uma vez)
  useEffect(() => {
    const restoreSession = async () => {
      // Se já tentou restaurar ou está autenticando, não tenta novamente
      if (hasTriedRestore || isAuthenticating) return;
      
      setHasTriedRestore(true);
      
      try {
        const token = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");
        
        // Se já tem usuário no localStorage e token, não precisa chamar a API novamente
        if (token && storedUser && !user) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log("Sessão restaurada do localStorage sem chamada à API");
          return;
        }
        
        // Só chama a API se tem token mas não tem dados do usuário salvos localmente
        if (token && !storedUser && !user && !isAuthenticating) {
          console.log("Restaurando sessão via API...");
          await loginWithToken(token);
        }
      } catch (err) {
        console.error("Error restoring user from token:", err);
        // Se falhar (token expirado), limpa tudo
        logout();
      }
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTriedRestore, isAuthenticating]);

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
