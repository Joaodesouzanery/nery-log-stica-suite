import { cn } from "@/lib/utils";

type CartoPoint = {
  label: string;
  x: number;
  y: number;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
};

type CartoMapProps = {
  variant?: "dark" | "voyager" | "positron";
  centerLabel?: string;
  route?: Array<{ x: number; y: number }>;
  points?: CartoPoint[];
  className?: string;
};

const tileConfig = {
  dark: {
    base: "dark_all",
    tiles: [
      [29, 49],
      [30, 49],
      [31, 49],
      [29, 50],
      [30, 50],
      [31, 50],
    ],
  },
  voyager: {
    base: "rastertiles/voyager",
    tiles: [
      [29, 49],
      [30, 49],
      [31, 49],
      [29, 50],
      [30, 50],
      [31, 50],
    ],
  },
  positron: {
    base: "light_all",
    tiles: [
      [29, 49],
      [30, 49],
      [31, 49],
      [29, 50],
      [30, 50],
      [31, 50],
    ],
  },
};

const tones: Record<NonNullable<CartoPoint["tone"]>, string> = {
  primary: "bg-primary ring-primary/25",
  success: "bg-success ring-success/25",
  warning: "bg-warning ring-warning/25",
  danger: "bg-destructive ring-destructive/25",
  info: "bg-chart-4 ring-chart-4/25",
};

export function CartoMap({
  variant = "dark",
  centerLabel = "Operacao Nery",
  route = [],
  points = [],
  className,
}: CartoMapProps) {
  const config = tileConfig[variant];
  const isDark = variant === "dark";
  const polyline = route.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-muted",
        isDark && "border-white/10 bg-black",
        className,
      )}
    >
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 opacity-95">
        {config.tiles.map(([x, y], index) => (
          <img
            key={`${x}-${y}`}
            src={`https://a.basemaps.cartocdn.com/${config.base}/6/${x}/${y}@2x.png`}
            alt=""
            className="h-full w-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.25))]"
            : "bg-white/10",
        )}
      />
      {route.length > 1 && (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polyline
            points={polyline}
            fill="none"
            stroke="rgb(59 130 246)"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      {points.map((point) => (
        <div
          key={point.label}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
        >
          <div
            className={cn(
              "h-3.5 w-3.5 rounded-full ring-4 shadow-lg",
              tones[point.tone ?? "primary"],
            )}
          />
          <div
            className={cn(
              "mt-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium shadow-sm",
              isDark ? "bg-black/70 text-white" : "bg-white/90 text-foreground",
            )}
          >
            {point.label}
          </div>
        </div>
      ))}
      <div
        className={cn(
          "absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-medium shadow-sm",
          isDark ? "bg-black/70 text-white" : "bg-white/90 text-foreground",
        )}
      >
        {centerLabel}
      </div>
      <div
        className={cn(
          "absolute bottom-2 right-2 rounded-md px-2 py-1 text-[10px]",
          isDark ? "bg-white/90 text-black" : "bg-white/90 text-foreground",
        )}
      >
        © CARTO, © OpenStreetMap contributors
      </div>
    </div>
  );
}
