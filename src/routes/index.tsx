import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  Leaf,
  MapPinned,
  ShieldCheck,
  Sprout,
  Tractor,
  Truck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nery Agro - Gestão completa para fazendas" },
      {
        name: "description",
        content:
          "Plataforma para fazendas controlarem campo, financeiro, logística, pecuária, sustentabilidade e inteligência em um só lugar.",
      },
      { property: "og:title", content: "Nery Agro - Gestão completa para fazendas" },
      {
        property: "og:description",
        content:
          "Campo, Financeiro, Logística, Pecuária, Sustentabilidade e Inteligência conectados em uma única operação.",
      },
    ],
  }),
  component: LandingPage,
});

const modules = [
  {
    icon: LayoutDashboard,
    title: "Torre de Controle",
    text: "Mapa global, alertas, OTIF, capacidade, ordens e rede integrada.",
  },
  { icon: MapPinned, title: "Campo", text: "Talhões, plantio, manejo, pragas, solo e safra." },
  { icon: Truck, title: "Logística", text: "Cargas, rotas, expedição, fretes, cestas e entregas." },
  {
    icon: BarChart3,
    title: "Financeiro",
    text: "Fluxo de caixa, custos, DRE, inadimplência e crédito.",
  },
  {
    icon: Tractor,
    title: "Pecuária",
    text: "Animais, vacinação, reprodução, produção e pastagens.",
  },
  {
    icon: ShieldCheck,
    title: "Sustentabilidade",
    text: "Certificações, resíduos, APPs e carbono.",
  },
  {
    icon: ClipboardList,
    title: "Inteligência",
    text: "Relatórios, gráficos, perdas e alertas de preços.",
  },
  {
    icon: Calculator,
    title: "Otimização de COGS",
    text: "Custo por etapa, SKU, rota, cenário, fonte de custo e margem.",
  },
];

const pains = [
  "Dados espalhados em caderno, planilha, WhatsApp e memória da equipe.",
  "Dificuldade para saber o custo real por produto, talhão, animal ou entrega.",
  "Entregas atrasadas, perda de rastreabilidade e pouca visibilidade do que está em rota.",
  "Certificações, APPs, compostagem e registros orgânicos tratados só na hora da auditoria.",
];

const faqs = [
  [
    "Precisa de autenticação agora?",
    "Não nesta etapa. O botão Acessar leva direto para o sistema.",
  ],
  [
    "Funciona com dados reais?",
    "Sim. Com Supabase configurado, os módulos salvam, editam, excluem, importam e exportam dados reais.",
  ],
  ["O modo DEMO altera os dados?", "Não. O DEMO permanece protegido para leitura e apresentação."],
  [
    "Posso importar planilhas?",
    "Sim. As abas operacionais aceitam CSV e XLSX com cabeçalhos por nome visível ou chave técnica.",
  ],
  ["O mapa usa token externo?", "Não. A navegação usa MapLibre com tiles públicos OSM."],
  [
    "Consigo gerar relatórios?",
    "Sim. Há CSV por aba, PDF consolidado na Torre de Controle e fichas em PDF na Pecuária.",
  ],
  [
    "A plataforma atende fazenda pequena?",
    "Sim. O fluxo foi pensado para começar simples e crescer por módulo conforme a operação amadurece.",
  ],
  [
    "CEASA/CNA já integra automaticamente?",
    "Nesta versão, os alertas de preço são configuráveis manualmente e preparados para integração futura.",
  ],
  [
    "O COGS conversa com os outros módulos?",
    "Sim. Ele usa custos do Financeiro, fretes da Logística, insumos do Campo, perdas da Inteligência e registros operacionais para calcular custo e margem.",
  ],
];

function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section
        className="relative min-h-[92vh] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/landing-farm-hero.png')" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,14,0.88)_0%,rgba(7,18,14,0.64)_42%,rgba(7,18,14,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(255,255,255,0.13),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-[1600px] flex-col px-5 py-4 sm:px-8">
          <header className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-white backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-primary">
                <Leaf className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold tracking-tight">NERY AGRO</div>
            </div>
            <nav className="hidden items-center gap-6 text-xs text-white/75 md:flex">
              <a href="#como-funciona" className="hover:text-white">
                Como funciona
              </a>
              <a href="#recursos" className="hover:text-white">
                Recursos
              </a>
              <a href="#eficiencia" className="hover:text-white">
                Eficiência
              </a>
              <a href="#faq" className="hover:text-white">
                FAQ
              </a>
            </nav>
            <Link
              to="/torre-de-controle"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-3 text-xs font-semibold text-slate-950 transition hover:bg-white/90"
            >
              Acessar
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[minmax(0,680px)_1fr]">
            <div>
              <div className="mb-4 inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                Plataforma operacional para fazendas
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                A fazenda inteira em uma visão clara, do talhão ao caixa.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                Controle campo, pecuária, financeiro, logística, sustentabilidade e inteligência em
                um só sistema, com dados que viram decisão antes do problema chegar caro.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/torre-de-controle"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/25 transition hover:bg-primary/90"
                >
                  Acessar
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-sm text-white/70">Sem autenticação por enquanto.</span>
              </div>
            </div>

            <div className="hidden min-h-[420px] lg:block">
              <div className="absolute right-[13%] top-[28%] w-72 rounded-lg border border-white/18 bg-slate-950/60 p-3 text-white shadow-2xl backdrop-blur">
                <div className="text-xs font-semibold">Talhão Norte</div>
                <div className="mt-2 grid gap-2 text-[11px] text-white/70">
                  {["Solo corrigido", "Irrigação ativa", "Colheita em 12 dias"].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <span>{item}</span>
                      <span className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span key={index} className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute right-[5%] top-[54%] w-80 rounded-lg border border-white/18 bg-slate-950/60 p-3 text-white shadow-2xl backdrop-blur">
                <div className="text-xs font-semibold">Carga CSA 042</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <div className="text-white/55">Status</div>
                    <div className="font-semibold text-emerald-300">Em rota</div>
                  </div>
                  <div>
                    <div className="text-white/55">ETA</div>
                    <div className="font-semibold">14:40</div>
                  </div>
                  <div>
                    <div className="text-white/55">Margem</div>
                    <div className="font-semibold">32%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/10 bg-black/10 text-white backdrop-blur md:grid-cols-3">
            {[
              ["01", "Registre a operação no campo, no curral, na expedição e no caixa."],
              ["02", "Acompanhe mapas, alertas, cronogramas e indicadores por módulo."],
              ["03", "Exporte relatórios, fichas, PDFs e planilhas para decidir e auditar."],
            ].map(([number, text]) => (
              <div
                key={number}
                className="flex gap-3 border-white/10 p-4 md:border-r md:last:border-r-0"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                  {number}
                </span>
                <p className="max-w-sm text-xs leading-5 text-white/75">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">Como funciona</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              A plataforma organiza a rotina por módulos. Cada área tem sua Visão Geral, tabelas com
              CRUD, importação de planilhas, exportação e indicadores próprios. A Torre de Controle
              soma tudo.
            </p>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {["Cadastrar", "Acompanhar", "Decidir"].map((title, index) => (
              <div key={title} className="rounded-lg border border-border bg-card p-5">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {index + 1}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {index === 0 &&
                    "Importe planilhas ou cadastre registros de campo, animais, vendas, custos, rotas e certificações."}
                  {index === 1 &&
                    "Use mapas, cronogramas, alertas, réguas de cobrança e KPIs para enxergar a operação viva."}
                  {index === 2 &&
                    "Baixe CSVs, relatórios em PDF, fichas de animais e indicadores para reunião, auditoria e gestão."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="border-y border-border bg-muted/25 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Tudo que a fazenda controla</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Da produção ao transporte, cada módulo foi desenhado para virar uma tela de
                trabalho, não apenas um cadastro solto.
              </p>
            </div>
            <Link
              to="/torre-de-controle"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Acessar sistema
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="eficiencia" className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Dores que a plataforma reduz</h2>
            <div className="mt-6 grid gap-3">
              {pains.map((pain) => (
                <div key={pain} className="flex gap-3 rounded-lg border border-border bg-card p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{pain}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Eficiência gerada</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Menos retrabalho", "Planilhas importadas e dados centralizados por módulo."],
                ["Mais margem", "Custo unitário, DRE simplificada e comparativo por produto."],
                ["Mais rastreio", "Mapa interativo, lotes, QR, cadeia de custódia e histórico."],
                ["Mais controle", "Alertas, cronogramas, inadimplência, vacinação e manutenção."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-md border border-border bg-background/60 p-4">
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/25 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="text-3xl font-semibold tracking-tight">Relatórios e exportações</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              "PDF consolidado da Torre de Controle",
              "Fichas de animais versionadas",
              "CSV por aba operacional",
              "Importação CSV/XLSX por módulo",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-border bg-card p-4 text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="text-3xl font-semibold tracking-tight">Perguntas frequentes</h2>
          <div className="mt-6 grid gap-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="rounded-lg border border-border bg-card p-4">
                <summary className="cursor-pointer text-sm font-semibold">{question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Entre no sistema da fazenda</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse a Torre de Controle e veja a operação consolidada.
            </p>
          </div>
          <Link
            to="/torre-de-controle"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Acessar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
