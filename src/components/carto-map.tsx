import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

export type MapPoint = {
  id: string;
  label: string;
  lat?: number;
  lng?: number;
  /** Optional manual placement when lat/lng are unknown (percent 0-100). */
  x?: number;
  y?: number;
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  caption?: string;
};

export type MapRoute = {
  id: string;
  points: { lat?: number; lng?: number; x?: number; y?: number }[];
};

type GridConfig = {
  z: number;
  xMin: number;
  yMin: number;
  cols: number;
  rows: number;
};

const grids: Record<string, GridConfig> = {
  brazil: { z: 4, xMin: 4, yMin: 6, cols: 4, rows: 4 }, // South America
  brazilFocus: { z: 5, xMin: 9, yMin: 13, cols: 5, rows: 5 }, // Brazil tight
  world: { z: 2, xMin: 0, yMin: 0, cols: 4, rows: 3 },
  europe: { z: 6, xMin: 29, yMin: 19, cols: 3, rows: 2 },
};

const tones: Record<NonNullable<MapPoint["tone"]>, string> = {
  primary: "bg-primary ring-primary/30",
  success: "bg-success ring-success/30",
  warning: "bg-warning ring-warning/30",
  danger: "bg-destructive ring-destructive/30",
  info: "bg-chart-4 ring-chart-4/30",
  neutral: "bg-muted-foreground ring-muted-foreground/30",
};

function latLngToPercent(
  lat: number,
  lng: number,
  g: GridConfig,
): { left: number; top: number } {
  const n = 2 ** g.z;
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return {
    left: ((x - g.xMin) / g.cols) * 100,
    top: ((y - g.yMin) / g.rows) * 100,
  };
}

function placement(
  p: { lat?: number; lng?: number; x?: number; y?: number },
  g: GridConfig,
) {
  if (typeof p.lat === "number" && typeof p.lng === "number") {
    return latLngToPercent(p.lat, p.lng, g);
  }
  return { left: p.x ?? 50, top: p.y ?? 50 };
}

export function CartoMap({
  region = "brazil",
  centerLabel,
  points = [],
  routes = [],
  className,
  showLegend = false,
  attribution = true,
}: {
  region?: keyof typeof grids;
  centerLabel?: string;
  points?: MapPoint[];
  routes?: MapRoute[];
  className?: string;
  showLegend?: boolean;
  attribution?: boolean;
}) {
  const { theme } = useTheme();
  const g = grids[region];
  const base = theme === "dark" ? "dark_all" : "rastertiles/voyager";
  const isDark = theme === "dark";

  const tiles = useMemo(() => {
    const list: { x: number; y: number }[] = [];
    for (let r = 0; r < g.rows; r++) {
      for (let c = 0; c < g.cols; c++) {
        list.push({ x: g.xMin + c, y: g.yMin + r });
      }
    }
    return list;
  }, [g]);

  const placedPoints = useMemo(
    () => points.map((p) => ({ ...p, ...placement(p, g) })),
    [points, g],
  );

  const placedRoutes = useMemo(
    () =>
      routes.map((r) => ({
        ...r,
        coords: r.points.map((pt) => placement(pt, g)),
      })),
    [routes, g],
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border",
        isDark ? "bg-black" : "bg-muted",
        className,
      )}
    >
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${g.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${g.rows}, minmax(0, 1fr))`,
        }}
      >
        {tiles.map((t, i) => (
          <img
            key={`${t.x}-${t.y}`}
            src={`https://a.basemaps.cartocdn.com/${base}/${g.z}/${t.x}/${t.y}@2x.png`}
            alt=""
            className="h-full w-full object-cover select-none"
            loading={i < 4 ? "eager" : "lazy"}
            draggable={false}
          />
        ))}
      </div>

      {/* Soft overlay to blend pins */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          isDark
            ? "bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.35))]"
            : "bg-[radial-gradient(circle_at_center,transparent,rgba(255,255,255,0.05))]",
        )}
      />

      {/* Routes */}
      {placedRoutes.length > 0 && (
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {placedRoutes.map((r) => (
            <polyline
              key={r.id}
              points={r.coords.map((c) => `${c.left},${c.top}`).join(" ")}
              fill="none"
              stroke="var(--color-primary)"
              strokeOpacity={0.85}
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1.2 1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      )}

      {/* Points */}
      {placedPoints.map((p) => (
        <div
          key={p.id}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
        >
          <div className="relative">
            <span
              className={cn(
                "block h-3 w-3 rounded-full ring-4 shadow-md",
                tones[p.tone ?? "primary"],
              )}
            />
            <span
              className={cn(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full animate-ping opacity-60",
                tones[p.tone ?? "primary"].split(" ")[0],
              )}
            />
          </div>
          <div
            className={cn(
              "pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10",
              isDark
                ? "bg-black/85 text-white border border-white/10"
                : "bg-white/95 text-foreground border border-border",
            )}
          >
            <div className="font-semibold">{p.label}</div>
            {p.caption && (
              <div className="text-[9px] opacity-75">{p.caption}</div>
            )}
          </div>
        </div>
      ))}

      {centerLabel && (
        <div
          className={cn(
            "absolute left-3 top-3 rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur",
            isDark
              ? "bg-black/70 text-white border border-white/10"
              : "bg-white/90 text-foreground border border-border",
          )}
        >
          {centerLabel}
        </div>
      )}

      {showLegend && (
        <div
          className={cn(
            "absolute right-3 top-3 rounded-md px-3 py-2 text-[10px] shadow-sm backdrop-blur space-y-1",
            isDark
              ? "bg-black/70 text-white border border-white/10"
              : "bg-white/90 text-foreground border border-border",
          )}
        >
          <LegendDot tone="primary" label="Em trânsito" />
          <LegendDot tone="success" label="Entregue" />
          <LegendDot tone="warning" label="Atenção" />
          <LegendDot tone="danger" label="Atrasado" />
          <LegendDot tone="info" label="Base" />
        </div>
      )}

      {attribution && (
        <div
          className={cn(
            "absolute bottom-2 right-2 rounded-md px-2 py-0.5 text-[9px]",
            isDark ? "bg-black/60 text-white/80" : "bg-white/90 text-foreground/80",
          )}
        >
          © CARTO · © OpenStreetMap
        </div>
      )}
    </div>
  );
}

function LegendDot({
  tone,
  label,
}: {
  tone: NonNullable<MapPoint["tone"]>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-2 w-2 rounded-full", tones[tone].split(" ")[0])} />
      <span>{label}</span>
    </div>
  );
}
