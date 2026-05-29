import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  Truck,
  Package,
  HelpCircle,
  Settings,
  Moon,
  Sun,
  PanelLeft,
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useDemoMode } from "@/hooks/use-demo-mode";

const generalItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Logística e Distribuição", url: "/logistica", icon: Truck },
  { title: "Financeiro", url: "/financeiro", icon: Wallet },
];

const supportItems = [
  { title: "Central de Ajuda", url: "#", icon: HelpCircle },
  { title: "Configurações", url: "#", icon: Settings },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { theme, toggle } = useTheme();
  const { demoMode, setDemoMode } = useDemoMode();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (url: string) => (url === "/" ? path === "/" : path.startsWith(url));

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 shrink-0",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
          <Package className="w-5 h-5 text-primary-foreground" strokeWidth={2.25} />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0 leading-tight">
            <div className="font-semibold text-[15px] tracking-tight text-foreground">Nery</div>
            <div className="text-[11px] text-muted-foreground">Logística</div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-muted-foreground hover:text-foreground transition"
            aria-label="Recolher"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent/60"
          aria-label="Expandir"
        >
          <PanelLeft className="w-4 h-4 rotate-180" />
        </button>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        {!collapsed && (
          <div className="px-2 mb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80">
            GERAL
          </div>
        )}
        <ul className="space-y-1">
          {generalItems.map((i) => {
            const active = isActive(i.url);
            return (
              <li key={i.title}>
                <Link
                  to={i.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-card text-foreground border border-sidebar-border shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/40",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <i.icon
                    className={cn("w-[18px] h-[18px] shrink-0", active && "text-primary")}
                    strokeWidth={active ? 2.25 : 1.85}
                  />
                  {!collapsed && <span>{i.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <div className="px-2 mt-7 mb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80">
            SUPORTE
          </div>
        )}
        <ul className="space-y-1">
          {supportItems.map((i) => (
            <li key={i.title}>
              <a
                href={i.url}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/40",
                  collapsed && "justify-center px-0",
                )}
              >
                <i.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.85} />
                {!collapsed && <span>{i.title}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
        <div
          className={cn(
            "flex items-center rounded-lg px-3 py-2 text-sm",
            collapsed ? "justify-center" : "justify-between gap-3 bg-sidebar-accent/40",
          )}
        >
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[12px] font-semibold">Modo DEMO</div>
              <div className="text-[10.5px] text-muted-foreground truncate">
                {demoMode ? "Dados demonstrativos" : "Dados reais"}
              </div>
            </div>
          )}
          <Switch
            checked={demoMode}
            onCheckedChange={setDemoMode}
            aria-label="Alternar dados demonstrativos"
          />
        </div>

        <button
          onClick={toggle}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/40",
            collapsed && "justify-center px-0",
          )}
        >
          {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          {!collapsed && <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
        </button>

        <div
          className={cn(
            "mt-1 flex items-center gap-3 px-2 py-2 rounded-lg",
            !collapsed && "hover:bg-sidebar-accent/40",
          )}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
            N
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-foreground">Nery Admin</div>
              <div className="text-[11px] text-muted-foreground truncate">admin@nery.com</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
