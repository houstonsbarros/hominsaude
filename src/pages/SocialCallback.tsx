import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";

function extractTokenFromLocation(search: string, hash: string) {
  const params = new URLSearchParams(search);
  const possibleKeys = ["access_token", "token", "accessToken", "jwt"];

  for (const key of possibleKeys) {
    const v = params.get(key);
    if (v) return v;
  }

  // Se o token vier no fragmento (comum em alguns providers)
  if (hash && hash.startsWith("#")) {
    const h = new URLSearchParams(hash.replace(/^#/, ""));
    for (const key of possibleKeys) {
      const v = h.get(key);
      if (v) return v;
    }
  }

  return null;
}

export default function SocialCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const processLogin = async () => {
      console.log("SocialCallback: Iniciando processamento...");
      console.log("Search:", location.search);
      console.log("Hash:", location.hash);

      const token = extractTokenFromLocation(location.search, location.hash);

      if (!token) {
        console.error("SocialCallback: Nenhum token encontrado na URL.");
        if (mounted) {
          setStatus("error");
          setErrorMessage("Token de autenticação não encontrado.");
        }
        return;
      }

      console.log(
        "SocialCallback: Token extraído com sucesso. Tentando loginWithToken..."
      );

      try {
        await loginWithToken(token);
        console.log("SocialCallback: Login bem-sucedido!");

        // Limpa a URL para não expor o token
        try {
          const u = new URL(window.location.href);
          u.searchParams.delete("token");
          u.searchParams.delete("access_token");
          if (u.hash) {
            u.hash = u.hash.replace(
              /(?:#|&)?(?:access_token|token)=[^&]*/g,
              ""
            );
          }
          window.history.replaceState(null, "", u.toString());
        } catch (e) {
          console.warn("Falha ao limpar URL:", e);
          window.history.replaceState(null, "", window.location.pathname);
        }

        if (mounted) {
          navigate("/", { replace: true });
        }
      } catch (err: any) {
        console.error("SocialCallback: Erro ao fazer login com token:", err);
        if (mounted) {
          setStatus("error");
          setErrorMessage(err.message || "Falha ao validar suas credenciais.");
        }
      }
    };

    processLogin();

    return () => {
      mounted = false;
    };
  }, [location, loginWithToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {status === "loading" ? (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Autenticando...
            </h2>
            <p className="text-slate-500">
              Estamos finalizando seu acesso seguro.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-shake">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Erro na Autenticação
            </h2>
            <p className="text-slate-500 mb-6">{errorMessage}</p>

            <button
              onClick={() => navigate("/login", { replace: true })}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all"
            >
              Voltar para Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
