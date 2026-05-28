import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  positive = true,
  spark,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  spark?: number[];
}) {
  const data = spark ?? [4, 6, 5, 7, 6, 9, 8, 11];
  const max = Math.max(...data);
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          {label}
        </div>
        <button className="text-muted-foreground hover:text-foreground text-lg leading-none">⋯</button>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
          {delta && (
            <div className="text-xs mt-1 text-muted-foreground">
              <span className={cn("font-medium", positive ? "text-success" : "text-destructive")}>{delta}</span>{" "}
              vs mês anterior
            </div>
          )}
        </div>
        <div className="flex items-end gap-1 h-10">
          {data.map((v, i) => (
            <div
              key={i}
              style={{ height: `${(v / max) * 100}%` }}
              className={cn(
                "w-1.5 rounded-sm",
                i === data.length - 1 ? "bg-primary" : "bg-primary/25",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
