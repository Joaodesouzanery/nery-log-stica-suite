import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Leaf, ShieldCheck, Sprout, Truck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nery Agro - Gestão para Fazendas" },
      {
        name: "description",
        content:
          "Plataforma para fazendas controlarem campo, financeiro, logística, pecuária, sustentabilidade e inteligência em um só lugar.",
      },
    ],
  }),
  component: LandingPage,
});

const signals = [
  { icon: Sprout, label: "Campo", text: "Talhões, safra e manejo." },
  { icon: Truck, label: "Operação", text: "Logística, expedição e entregas." },
  { icon: ShieldCheck, label: "Conformidade", text: "Certificações e rastreabilidade." },
  { icon: BarChart3, label: "Decisão", text: "Indicadores e alertas." },
];

function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section
        className="relative min-h-[92vh] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/landing-farm-hero.png')" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,24,18,0.86)_0%,rgba(10,24,18,0.64)_42%,rgba(10,24,18,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-[1600px] flex-col px-6 py-5 sm:px-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="leading-tight text-white">
                <div className="text-sm font-semibold tracking-tight">Nery Agro</div>
                <div className="text-xs text-white/70">Gestão para fazendas</div>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              Acessar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          <div className="grid flex-1 items-center py-14 lg:grid-cols-[minmax(0,720px)_1fr]">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                Operação rural integrada
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Controle sua fazenda do campo ao financeiro.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                Uma plataforma operacional para produtores acompanharem safra, custos, entregas,
                pecuária, sustentabilidade e inteligência de decisão sem perder o ritmo da rotina.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/20 transition hover:bg-primary/90"
                >
                  Acessar
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-sm text-white/70">Sem autenticação nesta etapa.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-10 px-6 pb-10 sm:px-8">
        <div className="mx-auto grid max-w-[1600px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {signals.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-card p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
