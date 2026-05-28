import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Wallet, Package, HelpCircle, Settings, Moon, Sun, PanelLeft } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useState } from "react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, group: "GERAL" },
  { title: "Financeiro", url: "/financeiro", icon: Wallet, group: "GERAL" },
];

const supportItems = [
  { title: "Central de Ajuda", url: "#", icon: HelpCircle },
  { title: "Configurações", url: "#", icon: Settings },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { theme, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (url: string) => (url === "/" ? path === "/" : path.startsWith(url));

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 shrink-0",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shrink-0">
          <Package className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base tracking-tight text-foreground">Nery</div>
            <div className="text-xs text-muted-foreground -mt-0.5">Logística</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Recolher"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        {!collapsed && (
          <div className="px-2 mb-2 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">GERAL</div>
        )}
        <ul className="space-y-1">
          {items.map((i) => {
            const active = isActive(i.url);
            return (
              <li key={i.title}>
                <Link
                  to={i.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  )}
                >
                  <i.icon className={cn("w-4 h-4 shrink-0", active && "text-primary")} />
                  {!collapsed && <span>{i.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {!collapsed && (
          <div className="px-2 mb-2 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">SUPORTE</div>
        )}
        {supportItems.map((i) => (
          <a
            key={i.title}
            href={i.url}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <i.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{i.title}</span>}
          </a>
        ))}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
        </button>

        <div className="mt-3 flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
            N
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-foreground">Nery Admin</div>
              <div className="text-xs text-muted-foreground truncate">admin@nery.com</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
