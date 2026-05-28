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
    <div className="bg-card border border-border rounded-lg p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
            <Icon className="w-3.5 h-3.5" />
          </div>
          {label}
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
          {delta && (
            <div className="text-xs mt-1 text-muted-foreground">
              <span className={cn("font-medium", positive ? "text-success" : "text-destructive")}>
                {delta}
              </span>{" "}
              vs mes anterior
            </div>
          )}
        </div>
        <div className="flex items-end gap-1 h-8">
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
