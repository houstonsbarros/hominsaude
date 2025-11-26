import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Importando loginWithGoogle do contexto
  const { login, register, loginWithGoogle } = useAuth();

  // States
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Form Data
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  // Check for admin/demo params
  useEffect(() => {
    const isAdminLogin = searchParams.get("admin") === "true";
    const roleParam = searchParams.get("role");

    if (isAdminLogin) {
      setFormData((prev) => ({ ...prev, email: "homiin.saude@gmail.com" }));
    } else if (roleParam === "user") {
      setFormData((prev) => ({
        ...prev,
        email: "arthur@gmail.com",
        password: "123456",
      }));
    }
  }, [searchParams]);

  const isAdminLogin = searchParams.get("admin") === "true";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      let success;
      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        if (!formData.username.trim()) {
          throw new Error("Por favor, informe um nome de usuário");
        }
        success = await register(
          formData.email,
          formData.password,
          formData.username
        );
      }

      if (success) {
        navigate("/");
      } else {
        setError("Email ou senha incorretos.");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  // Wrapper para o login social
  const handleSocialLogin = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      // Nota: O loginWithGoogle geralmente redireciona a página,
      // então o setIsLoading(false) pode nem chegar a rodar se o redirect ocorrer.
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      {/* --- Lado Esquerdo (Branding) - Apenas Desktop --- */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-blue-600 to-cyan-500 items-center justify-center relative overflow-hidden p-12">
        {/* Círculos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 text-white max-w-lg">
          <div className="mb-8 flex items-center gap-3">
            <img
              src="/logo-white.svg"
              alt="Logo"
              className="w-32 h-auto brightness-200 grayscale contrast-200"
            />
          </div>

          <h2 className="text-5xl font-bold leading-tight mb-6">
            Cuidar de você <br />
            <span className="text-blue-200">é o nosso plano.</span>
          </h2>

          <p className="text-lg text-blue-100 leading-relaxed mb-8">
            Acesse sua conta para agendar consultas, falar com especialistas e
            monitorar sua saúde com nossa inteligência artificial exclusiva.
          </p>
        </div>
      </div>

      {/* --- Lado Direito (Formulário) --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 animate-fade-in">
        <div className="w-full max-w-md space-y-6">
          {/* Cabeçalho Mobile */}
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <img
                src="/logo-color.svg"
                alt="Logo Colorida"
                className="h-4 w-auto"
              />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              {isLogin
                ? isAdminLogin
                  ? "Painel Admin"
                  : "Bem-vindo de volta"
                : "Crie sua conta"}
            </h2>
            <p className="mt-2 text-slate-600">
              {isLogin
                ? "Entre com suas credenciais para acessar."
                : "Preencha os dados abaixo para começar."}
            </p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-shake">
              <div className="flex items-center">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Nome (Apenas Registro) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Nome de usuário
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required={!isLogin}
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
            )}

            {/* Campo Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {isLogin && (
                <div className="flex justify-end">
                  <a
                    href="#"
                    className="text-xs font-medium text-blue-600 hover:text-blue-500"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
              )}
            </div>

            {/* Botão Submit (Principal) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {isLoading && isLogin ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  {isLogin ? "Entrar" : "Criar Conta"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* --- SEÇÃO DE LOGIN SOCIAL --- */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 text-slate-500">
                  Ou continue com
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSocialLogin}
                type="button"
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                {/* Ícone do Google SVG */}
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </div>
          </div>

          {/* Toggle Login/Register */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center gap-1 text-sm"
            >
              {isLogin ? (
                <>
                  Não tem conta?{" "}
                  <span className="underline">Cadastre-se gratuitamente</span>
                </>
              ) : (
                <>
                  Já tem conta? <span className="underline">Faça login</span>
                </>
              )}
            </button>
          </div>

          {/* Copyright Mobile */}
          <p className="text-center text-xs text-slate-400 mt-8 lg:hidden">
            © {new Date().getFullYear()} HOMIN+. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
