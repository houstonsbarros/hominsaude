import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { socialLoginBackend, fetchUserWithToken } from "../services/login";

export type User = {
  uid: string;
  username: string;
  email: string;
  role: "user" | "admin";
  displayName?: string;
  photoURL?: string;
};

type AuthUser = {
  email: string;
  password: string;
  username: string;
  role: "user" | "admin";
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

const ADMIN_USER: AuthUser = {
  email: "homiin.saude@gmail.com",
  username: "Admin",
  password: "hominmais",
  role: "admin" as const,
};

const DEFAULT_USER: AuthUser = {
  email: "arthur@gmail.com",
  username: "Arthur",
  password: "123456",
  role: "user" as const,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [users, setUsers] = useState([ADMIN_USER, DEFAULT_USER]);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();

    if (
      normalizedEmail === ADMIN_USER.email.toLowerCase() &&
      password === ADMIN_USER.password
    ) {
      const userData = {
        uid: "admin-1",
        username: ADMIN_USER.username,
        email: ADMIN_USER.email,
        role: ADMIN_USER.role as "admin",
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    }

    if (
      normalizedEmail === DEFAULT_USER.email.toLowerCase() &&
      password === DEFAULT_USER.password
    ) {
      const userData = {
        uid: "user-1",
        username: DEFAULT_USER.username,
        email: DEFAULT_USER.email,
        role: DEFAULT_USER.role as "user",
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    }

    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const userData = {
        uid: `user-${Date.now()}`,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    if (users.some((u) => u.email === email)) {
      throw new Error("Este email já está em uso");
    }

    if (users.some((u) => u.username === username)) {
      throw new Error("Este nome de usuário já está em uso");
    }

    const newUser = {
      email,
      username,
      password,
      role: "user" as const,
    };

    setUsers((prev) => [...prev, newUser]);

    const userData = {
      uid: `user-${Date.now()}`,
      username,
      email,
      role: "user" as const,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    return true;
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
      // persist token
      localStorage.setItem("access_token", token);

      // try to fetch user info from backend
      const data = await fetchUserWithToken(token);

      // Log raw payload for debugging (helps identify why username may be missing)
      // eslint-disable-next-line no-console
      console.debug("fetchUserWithToken payload:", data);

      // Backend may return either: { user: {...}, claims: {...} } OR a flat user object.
      const payload = (data && (data.user ?? data)) as any;

      // Map defensively so we don't end up with the generic fallback unless really necessary
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
  };

  // On mount, if there's an access token but no user object, try to restore user from /auth/me
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token && !user) {
          await loginWithToken(token);
        }
      } catch (err) {
        // If restoring fails, remove token to avoid repeated failures
        console.error("Error restoring user from token:", err);
        localStorage.removeItem("access_token");
      }
    })();
    // We intentionally run this only once on mount
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
