import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

export default function Header({ color }: { color?: "fixed" | "transparent" }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  // Importando o usuário e função de logout do contexto
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldShowSolid = isScrolled || isMobileMenuOpen || color === "fixed";

  const textColorClass = shouldShowSolid ? "text-gray-700" : "text-white";
  const logoSrc = shouldShowSolid ? "/logo-color.svg" : "/logo-white.svg";

  const navigation = [
    { name: "Início", href: "/#inicio" },
    { name: "Sobre", href: "/sobre" },
    { name: "Especialistas", href: "/#especialistas" },
    { name: "Contato", href: "/contato" },
  ];

  // Função auxiliar para lidar com a navegação interna (#) vs externa (/)
  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("/#")) {
      const hash = href.replace("/", "");
      if (pathname === "/") {
        const element = document.querySelector(hash);
        element?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          const element = document.querySelector(hash);
          element?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header
      className={`
        fixed z-50 flex flex-col items-center transition-all duration-500 ease-in-out w-full
        ${
          shouldShowSolid
            ? "top-0 py-2 shadow-sm bg-white"
            : "top-0 py-4 bg-transparent"
        }
      `}
    >
      <div className="relative flex items-center justify-between w-full max-w-6xl px-6 md:px-8 z-50">
        <img
          src={logoSrc}
          alt="Logo"
          className="w-24 md:w-32 h-auto transition-opacity duration-300 cursor-pointer hover:opacity-80"
          onClick={() => navigate("/")}
        />

        <nav className="hidden md:flex items-center gap-8">
          {navigation.map((item, index) => {
            // Lógica simples para "ativo": se a rota atual bate ou se é âncora na home
            const isActive = pathname === item.href;

            return (
              <button
                key={index}
                onClick={() => handleNavClick(item.href)}
                className={`
                  font-medium transition-colors hover:text-blue-600 bg-transparent border-none cursor-pointer
                  ${isActive ? "text-blue-600" : textColorClass}
                `}
              >
                {item.name}
              </button>
            );
          })}

          <button
            onClick={() => navigate("/chat")}
            className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-full hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            Iniciar Chat
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {/* LÓGICA DE LOGIN / PERFIL */}
          {user ? (
            <div className="hidden sm:block">
              <ProfileDropdown user={user} onLogout={logout} />
            </div>
          ) : (
            <Link
              to="/login"
              className={`hidden sm:block font-medium transition-colors hover:text-blue-600 ${textColorClass}`}
            >
              Login
            </Link>
          )}

          <button
            className={`md:hidden p-1 rounded-md transition-colors cursor-pointer ${textColorClass}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* --- MENU MOBILE --- */}
      <div
        className={`
          absolute top-full left-0 w-full px-4 mt-2 md:hidden transition-all duration-300 ease-in-out origin-top
          ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-4 invisible"
          }
        `}
      >
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-gray-100">
          {navigation.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavClick(item.href)}
              className="text-lg font-medium text-gray-700 hover:text-blue-600 py-2 border-b border-gray-100 last:border-0 text-left w-full"
            >
              {item.name}
            </button>
          ))}

          <button
            onClick={() => {
              navigate("/chat");
              setIsMobileMenuOpen(false);
            }}
            className="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            Iniciar Chat
          </button>

          {/* LOGIN / PERFIL NO MOBILE */}
          {user ? (
            <div className="flex justify-center pt-2 border-t border-gray-100">
              <ProfileDropdown user={user} onLogout={logout} />
            </div>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-transparent text-blue-600 font-semibold px-4 py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-600 hover:text-white"
            >
              Login
              <ArrowUpRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
