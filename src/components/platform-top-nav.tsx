import { useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  Home,
  Leaf,
  Moon,
  QrCode,
  Search,
  Sprout,
  Sun,
  Truck,
  Wallet,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Mapa", url: "/", icon: Home },
  { title: "Torre", url: "/torre-de-controle", icon: AlertTriangle },
  { title: "Logistica", url: "/logistica", icon: Truck },
  { title: "Financeiro", url: "/financeiro", icon: Wallet },
  { title: "Campo", url: "/campo", icon: Sprout },
  { title: "Pecuaria", url: "/pecuaria", icon: QrCode },
  { title: "Sustentabilidade", url: "/sustentabilidade", icon: Leaf },
  { title: "Inteligencia", url: "/inteligencia", icon: BarChart3 },
  { title: "COGS", url: "/otimizacao-cogs", icon: Calculator },
];

export function PlatformTopNav() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { demoMode, setDemoMode } = useDemoMode();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-slate-700 bg-slate-900 text-slate-100 shadow-[0_8px_22px_rgba(2,6,23,0.25)]">
      <div className="flex h-full min-w-0 items-center">
        <a
          href="/"
          className="flex h-full shrink-0 items-center gap-3 border-r border-slate-700 px-4"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/20 text-blue-300">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-semibold">Nery Control Tower</div>
            <div className="text-[10px] text-slate-400">Mapa operacional unico</div>
          </div>
        </a>

        <nav className="flex h-full min-w-0 flex-1 overflow-x-auto">
          {navItems.map((item) => {
            const active =
              item.url === "/" ? path === "/" : path === item.url || path.startsWith(`${item.url}/`);
            return (
              <a
                key={item.url}
                href={item.url}
                className={cn(
                  "flex h-full shrink-0 items-center gap-1.5 border-r border-slate-800 px-3 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white",
                  active && "border-b-2 border-b-blue-400 bg-slate-800 text-white",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.title}
              </a>
            );
          })}
        </nav>

        <div className="hidden h-full items-center gap-2 border-l border-slate-700 px-3 lg:flex">
          <label className="flex h-9 w-56 items-center gap-2 rounded-md border border-slate-700 bg-slate-950/50 px-2 text-xs text-slate-400">
            <Search className="h-3.5 w-3.5" />
            <input
              placeholder="Buscar no mapa..."
              className="min-w-0 flex-1 bg-transparent text-slate-200 outline-none placeholder:text-slate-500"
            />
          </label>
          <div className="flex items-center gap-2 rounded-md border border-slate-700 px-2 py-1.5">
            <span className="text-[10px] text-slate-400">DEMO</span>
            <Switch checked={demoMode} onCheckedChange={setDemoMode} />
          </div>
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
