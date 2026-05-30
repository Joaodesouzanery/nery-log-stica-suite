import { Search, Share2, Bell } from "lucide-react";
import { toast } from "sonner";

export function Topbar() {
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10 flex items-center px-6 gap-4">
      <div className="flex-1 max-w-xl relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Buscar..."
          className="w-full h-10 pl-9 pr-16 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5">
          ⌘ + F
        </kbd>
      </div>
      <button
        onClick={() => toast.info("Nenhuma notificação nova.")}
        className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
      >
        <Bell className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          void navigator.clipboard?.writeText(window.location.href);
          toast.success("Link da página copiado.");
        }}
        className="h-9 px-3 rounded-lg border border-border flex items-center gap-2 text-sm text-foreground hover:bg-muted"
      >
        <Share2 className="w-4 h-4" />
        Compartilhar
      </button>
    </header>
  );
}
