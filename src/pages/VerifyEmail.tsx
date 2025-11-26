import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router"; // Assumindo react-router-dom
import { verifyEmailToken } from "../services/login";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estados da UI
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Validando seu e-mail...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token de verificação não encontrado.");
      return;
    }

    verifyEmailToken(token)
      .then(() => {
        setStatus("success");
        setMessage("E-mail verificado com sucesso!");
        // Opcional: Redirecionar automaticamente após 3 segundos
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch((error: any) => {
        setStatus("error");
        setMessage(
          error?.response?.data?.message || "O link é inválido ou expirou."
        );
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
        {/* Ícone Animado / Estático dependendo do estado */}
        <div className="flex justify-center mb-6">
          {status === "loading" && (
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <Loader2 size={40} className="text-blue-600 animate-spin" />
            </div>
          )}

          {status === "success" && (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-green-600" />
            </div>
          )}

          {status === "error" && (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={40} className="text-red-600" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {status === "loading" && "Verificando..."}
          {status === "success" && "Tudo pronto!"}
          {status === "error" && "Ops, algo deu errado"}
        </h1>

        <p className="text-slate-500 mb-8 leading-relaxed">{message}</p>

        {/* Botões de Ação */}
        {status === "success" && (
          <button
            onClick={() => navigate("/login")} // Ou abra o modal de login
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md"
          >
            Ir para Login
          </button>
        )}

        {status === "error" && (
          <button
            onClick={() => navigate("/")}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Voltar para Início
          </button>
        )}
      </div>
    </div>
  );
}
