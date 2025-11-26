import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";
import { ArrowUpRight, ChevronLeft, ChevronRight, Ribbon } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useLocation, useNavigate } from "react-router";
import Footer from "../components/Footer";

export default function Home() {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  const informations = [
    {
      image: "/home/mind-balance.webp",
      title: "Clareza Mental",
      description:
        "Técnicas validadas para reduzir a ansiedade e manter o foco no que realmente importa.",
    },
    {
      image: "/home/vitality-active.webp",
      title: "Vitalidade e Energia",
      description:
        "Monitoramento de sinais internos para garantir que seu corpo funcione com eficiência máxima.",
    },
    {
      image: "/home/skin-care.webp",
      title: "Proteção da Barreira",
      description:
        "O cuidado com a pele vai além da estética: é a sua primeira linha de defesa contra o mundo externo.",
    },
    {
      image: "/home/stress-relief.webp",
      title: "Gestão Emocional",
      description:
        "Ferramentas para entender e processar emoções, transformando reatividade em resiliência.",
    },
    {
      image: "/home/prevention-check.webp",
      title: "Prevenção Ativa",
      description:
        "Protocolos preventivos que antecipam problemas e garantem longevidade com qualidade.",
    },
    {
      image: "/home/visual-health.webp",
      title: "Sinais Visuais de Saúde",
      description:
        "Como identificar precocemente alterações visuais que refletem o estado geral do seu organismo.",
    },
  ];

  const specialists = [
    {
      name: "Missilene Reginato",
      registry: "CRP 19/1739",
      specialty: "Psicóloga",
      description:
        "Protocolos de apoio para gestão de estresse, ansiedade e saúde emocional.",
      image: "/professionals/missilene.png",
    },
    {
      name: "Wilson Figueiredo",
      registry: "CRM/SE 2419 - RQE 1225",
      image: "/professionals/wilson.png",
      specialty: "Urologista",
      description:
        "Dados validados sobre saúde da próstata, função sexual e sistema urinário.",
    },
    {
      name: "Priscila Soares",
      registry: "CRM/SE 5984 – RQE 5323",
      specialty: "Dermatologia",
      description:
        "Informações sobre cuidados com a pele, prevenção solar e higiene.",
      image: "/professionals/priscila.png",
    },
  ];

  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const elem = document.getElementById(location.hash.substring(1));
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <main className="flex min-h-full flex-col items-center justify-start w-full bg-white">
      <Header />

      <section
        id="inicio"
        className="relative w-full h-[600px] flex items-end justify-center md:justify-end overflow-hidden"
      >
        <img
          src="/hero.png"
          alt="Homem olhando para o notebook, sentado em uma cama, tomando um café."
          className="
            absolute inset-0 
            w-full h-full 
            object-cover 
            object-[20%] 
            md:object-center
          "
        />

        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 max-w-3xl px-4 text-center md:text-right text-white pb-10 md:pb-20 md:pr-20 flex flex-col items-center md:items-end gap-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Sua saúde não precisa <br className="hidden md:block" />
            ser um <span className="text-blue-600">tabu.</span>
          </h1>

          <p className="text-base md:text-xl text-gray-200 leading-relaxed">
            Obtenha respostas confiáveis e apoio para suas preocupações de saúde
            masculina, desde o bem-estar mental até a saúde física.
          </p>

          <button
            onClick={() => {
              navigate("/chat");
            }}
            className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            Iniciar Chat
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <section className="w-full overflow-hidden py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">Informação que funciona</h2>
            <p className="text-lg text-gray-700 max-w-2xl">
              Nossa missão é fornecer informações práticas e acessíveis para
              melhorar sua saúde e bem-estar.
            </p>
          </div>

          <div className="relative group">
            <Swiper
              modules={[Navigation, Autoplay, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              navigation={{
                prevEl: prevEl,
                nextEl: nextEl,
              }}
              pagination={{
                el: ".custom-pagination",
                clickable: true,
              }}
              grabCursor={true}
              loop={true}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 32 },
              }}
              className="pb-4"
            >
              {informations.map((info, index) => (
                <SwiperSlide key={index} className="h-auto">
                  <div className="bg-white px-4 h-full flex flex-col items-start text-left select-none">
                    <img
                      src={info.image}
                      alt={info.title}
                      className={`w-full h-44 mb-4 bg-gray-200 rounded-lg object-cover pointer-events-none ${
                        index === 1 ? "object-top" : "object-center"
                      }`}
                    />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {info.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {info.description}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="custom-pagination mt-4 flex justify-center mx-auto"></div>
            <button
              ref={setPrevEl}
              className="hidden md:flex absolute top-1/2 -left-12 z-10 -translate-y-[calc(50%+20px)] w-10 h-10 items-center justify-center rounded-full bg-white shadow-lg text-gray-700 hover:bg-gray-50 hover:scale-110 transition-all border border-gray-100 cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              ref={setNextEl}
              className="hidden md:flex absolute top-1/2 -right-12 z-10 -translate-y-[calc(50%+20px)] w-10 h-10 items-center justify-center rounded-full bg-white shadow-lg text-gray-700 hover:bg-gray-50 hover:scale-110 transition-all border border-gray-100 cursor-pointer"
              aria-label="Próximo"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <style>{`
  .swiper-pagination-bullet {
    background: #cbd5e1;
    opacity: 1;
  }
  .swiper-pagination-bullet-active {
    background: #3b82f6;
    width: 20px;
    border-radius: 6px;
    transition: width 0.3s;
  }
`}</style>
      </section>

      <section className="w-full bg-zinc-50 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Campanhas Globais</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
            Junte-se a nós em campanhas globais para promover a saúde e o
            bem-estar masculino.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="text-left bg-transparent border border-neutral-300 rounded-2xl p-6 w-full md:w-2/5 flex flex-col items-start gap-4">
              <Ribbon className=" text-yellow-600" size={30} />

              <h3 className="text-2xl font-bold leading-tight">
                Setembro Amarelo
              </h3>
              <p className="text-gray-700">
                Mês de conscientização sobre a prevenção do suicídio e a
                importância da saúde mental.
              </p>

              <button
                onClick={() =>
                  window.open("https://www.setembroamarelo.com/", "_blank")
                }
                className="bg-yellow-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-yellow-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer text-sm"
              >
                Saiba Mais
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="text-left bg-transparent border border-neutral-300 rounded-2xl p-6 w-full md:w-2/5 flex flex-col items-start gap-4">
              <Ribbon className=" text-blue-600" size={30} />
              <h3 className="text-2xl font-bold leading-tight">
                Novembro Azul
              </h3>
              <p className="text-gray-700">
                Conscientização sobre o câncer de próstata. O diagnóstico
                precoce é a cura.
              </p>
              <button
                onClick={() => {
                  window.open(
                    "https://www.gov.br/dnocs/pt-br/assuntos/noticias/novembro-azul-cuidar-da-saude-e-um-ato-de-coragem-1",
                    "_blank"
                  );
                }}
                className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer text-sm"
              >
                Saiba Mais
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
      <div id="especialistas"></div>
      <section className="w-full py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Inteligência Validada por Especialistas
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
            Nossa plataforma é desenvolvida com base em pesquisas científicas e
            validada por profissionais de saúde experientes.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {specialists.map((specialist, index) => (
            <div
              key={index}
              className="relative rounded-2xl shadow-l overflow-hidden"
            >
              <img
                src={specialist.image}
                alt={specialist.name}
                className="w-full h-96 object-cover transform scale-110 object-top"
              />

              <span className="absolute top-4 left-4 bg-white/30 backdrop-blur-md text-white font-semibold px-3 py-1 rounded-full border border-white/50 text-sm">
                {specialist.specialty}
              </span>

              <div className="absolute bottom-14 left-4 z-20 right-4 bg-white rounded-2xl px-6 py-4 border border-gray-200 transform translate-y-1/2">
                <h3 className="text-xl font-bold">{specialist.name}</h3>
                <p className="text-sm text-gray-500">{specialist.registry}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
