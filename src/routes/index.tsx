import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Leaf,
  LineChart,
  MapPin,
  QrCode,
  ShieldCheck,
  Sprout,
  Truck,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nery Agro — Gestão integrada da fazenda ao cliente" },
      {
        name: "description",
        content:
          "Plataforma para fazendas controlarem campo, financeiro, logística, pecuária, sustentabilidade e inteligência em um só lugar, com dados em tempo real.",
      },
      { property: "og:title", content: "Nery Agro — Gestão integrada da fazenda ao cliente" },
      {
        property: "og:description",
        content:
          "Campo, Financeiro, Logística, Pecuária, Sustentabilidade e Inteligência conectados em uma única operação.",
      },
    ],
  }),
  component: LandingPage,
});

const signals = [
  { icon: Sprout, label: "Campo", text: "Talhões, safra, manejo e clima." },
  { icon: Truck, label: "Operação", text: "Logística, expedição e entregas." },
  { icon: ShieldCheck, label: "Conformidade", text: "Certificações e rastreabilidade." },
  { icon: BarChart3, label: "Decisão", text: "Indicadores, metas e alertas." },
];

const modules = [
  {
    icon: Sprout,
    title: "Campo",
    text: "Talhões, plantio, insumos, pragas, clima e simulação de safra com mapa interativo e drill-down por área.",
  },
  {
    icon: Wallet,
    title: "Financeiro",
    text: "Fluxo de caixa, DRE simplificado, crédito rural, inadimplência e custos por talhão, em diário, semanal, mensal ou período.",
  },
  {
    icon: Truck,
    title: "Logística e Distribuição",
    text: "Cargas, motoristas, rotas, frota, roteirização urbana, embalagens, cestas (CSA), checklist de expedição e custo de frete.",
  },
  {
    icon: QrCode,
    title: "Pecuária / Animais",
    text: "Ficha individual, vacinação, ciclo reprodutivo, produção diária e rodízio de pastagens com QR no brinco.",
  },
  {
    icon: Leaf,
    title: "Sustentabilidade",
    text: "Pegada de carbono, água, energia, resíduos e indicadores ESG da operação.",
  },
  {
    icon: BarChart3,
    title: "Inteligência",
    text: "Indicadores cruzados, projeções e relatórios exportáveis para apoiar a decisão.",
  },
];

const benefits = [
  {
    icon: Gauge,
    title: "Decisão em tempo real",
    text: "KPIs consolidados por período, sem planilhas paralelas.",
  },
  {
    icon: MapPin,
    title: "Mapa interativo",
    text: "Rastreamento de cargas e drill-down por talhão direto no mapa.",
  },
  {
    icon: ClipboardList,
    title: "CRUD em tudo",
    text: "Adicione, edite e exclua registros em cada aba de cada módulo.",
  },
  {
    icon: LineChart,
    title: "Exportação por aba",
    text: "Exporte CSV de qualquer aba para auditoria ou contabilidade externa.",
  },
  {
    icon: Boxes,
    title: "Operação integrada",
    text: "Campo, financeiro e logística falam a mesma língua e os mesmos dados.",
  },
  {
    icon: ShieldCheck,
    title: "Modo DEMO seguro",
    text: "Demonstre a plataforma sem tocar nos dados reais do produtor.",
  },
];

const audiences = [
  "Produtores e fazendas de pequeno e médio porte",
  "Cooperativas e CSAs com entrega recorrente",
  "Operações de pecuária leiteira, corte, postura e apicultura",
  "Distribuidoras de hortifrúti com rota urbana",
];

function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
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
              preload="intent"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              Acessar plataforma
              <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          <div className="grid flex-1 items-center py-14 lg:grid-cols-[minmax(0,720px)_1fr]">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                Operação rural integrada
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Controle sua fazenda do campo ao cliente final.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                Uma plataforma operacional para o produtor acompanhar safra, custos, entregas,
                pecuária, sustentabilidade e inteligência de decisão sem perder o ritmo da rotina.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/dashboard"
                  preload="intent"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/20 transition hover:bg-primary/90"
                >
                  Entrar no Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-sm text-white/70">Sem autenticação nesta etapa.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNALS */}
      <section className="-mt-10 px-6 pb-10 sm:px-8">
        <div className="mx-auto grid max-w-[1600px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {signals.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
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

      {/* MODULES */}
      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Tudo o que a fazenda precisa em um só lugar
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Seis módulos conectados pelos mesmos dados, com cadastro, edição e exclusão em cada
              aba. Sem retrabalho, sem planilha solta.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div
                key={m.title}
                className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <m.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-muted/30 px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ganhos reais de eficiência
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Tempo recuperado, custo controlado e visão clara da operação para decidir com
              segurança.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto grid max-w-[1600px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Feito para quem opera no campo todos os dias
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              A Nery Agro foi desenhada com produtores, cooperativas e distribuidoras para refletir
              a rotina real da fazenda — não um software genérico de escritório.
            </p>
          </div>
          <ul className="space-y-3">
            {audiences.map((a) => (
              <li
                key={a}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-muted/30 px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Como a plataforma funciona
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Em três passos a fazenda sai do papel e da planilha para uma operação conectada.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Cadastre a operação",
                text: "Talhões, frota, animais, clientes, contratos e custos fixos. Cada aba tem cadastro, edição e exclusão.",
              },
              {
                step: "2",
                title: "Registre o dia a dia",
                text: "Plantio, colheita, vacinas, ordenha, expedição, entregas e recebíveis com poucos cliques, no campo ou no escritório.",
              },
              {
                step: "3",
                title: "Decida com dados",
                text: "Veja indicadores em tempo real por período, exporte relatórios e gere documentos como a ficha em PDF de cada animal.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {s.step}
                </div>
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto grid max-w-[1600px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "6", label: "Módulos integrados" },
            { value: "40+", label: "Abas operacionais" },
            { value: "100%", label: "CRUD em cada aba" },
            { value: "1", label: "Única fonte de dados" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border bg-card p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="text-3xl font-semibold tracking-tight text-primary">{m.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
            Perguntas frequentes
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Preciso instalar algo?",
                a: "Não. A plataforma roda no navegador, no computador ou no celular, com sincronização em tempo real.",
              },
              {
                q: "Posso testar sem cadastrar dados reais?",
                a: "Sim. O modo DEMO mostra exemplos protegidos contra edição, ideal para conhecer cada módulo antes de migrar.",
              },
              {
                q: "Os dados ficam guardados?",
                a: "Tudo é gravado em banco de dados gerenciado, com backup automático e regras de segurança por tabela.",
              },
              {
                q: "Consigo gerar documentos?",
                a: "Sim. Por exemplo, no módulo Pecuária você gera um PDF da ficha individual de cada animal, salvo junto à identificação dele.",
              },
              {
                q: "Funciona offline?",
                a: "A leitura básica continua disponível enquanto há cache local; o envio sincroniza assim que a conexão volta.",
              },
            ].map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <summary className="cursor-pointer list-none text-base font-semibold flex items-center justify-between">
                  {f.q}
                  <span className="text-primary transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 sm:px-8">
        <div className="mx-auto max-w-[1600px] rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Conheça a plataforma agora
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            Acesse o ambiente completo, com modo DEMO ativado, e experimente cada módulo sem
            compromisso.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/dashboard"
              preload="intent"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/10 transition hover:bg-primary/90"
            >
              Entrar no Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
