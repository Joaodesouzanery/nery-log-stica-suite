import { useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type CartoMapTone = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

export type MapPoint = {
  id: string;
  label: string;
  lat?: number;
  lng?: number;
  x?: number;
  y?: number;
  tone?: CartoMapTone;
  caption?: string;
  status?: string;
  description?: string;
  meta?: Record<string, string | number | undefined>;
};

export type MapRoute = {
  id: string;
  label?: string;
  points: Array<{ lat?: number; lng?: number; x?: number; y?: number }>;
  tone?: CartoMapTone;
  status?: string;
  description?: string;
  meta?: Record<string, string | number | undefined>;
};

export type CartoPoint = Omit<MapPoint, "id"> & { id?: string };
export type CartoRoute = Omit<MapRoute, "id"> & { id?: string };

type GridConfig = {
  z: number;
  xMin: number;
  yMin: number;
  cols: number;
  rows: number;
};

type SelectedItem =
  | { type: "point"; item: MapPoint; x: number; y: number }
  | { type: "route"; item: MapRoute; x: number; y: number };

type CartoMapProps = {
  region?: keyof typeof grids;
  variant?: "dark" | "voyager" | "positron";
  centerLabel?: string;
  route?: Array<{ x: number; y: number }>;
  routes?: CartoRoute[] | MapRoute[];
  points?: CartoPoint[] | MapPoint[];
  className?: string;
  interactive?: boolean;
  showLegend?: boolean;
  attribution?: boolean;
  onPointClick?: (point: MapPoint) => void;
  onRouteClick?: (route: MapRoute) => void;
};

const grids: Record<string, GridConfig> = {
  brazil: { z: 4, xMin: 4, yMin: 6, cols: 4, rows: 4 },
  brazilFocus: { z: 5, xMin: 9, yMin: 13, cols: 5, rows: 5 },
  world: { z: 2, xMin: 0, yMin: 0, cols: 4, rows: 3 },
  europe: { z: 6, xMin: 29, yMin: 19, cols: 3, rows: 2 },
  fixed: { z: 6, xMin: 29, yMin: 49, cols: 3, rows: 2 },
};

const variantBase = {
  dark: "dark_all",
  voyager: "rastertiles/voyager",
  positron: "light_all",
};

const tones: Record<CartoMapTone, string> = {
  primary: "bg-primary ring-primary/30",
  success: "bg-success ring-success/30",
  warning: "bg-warning ring-warning/30",
  danger: "bg-destructive ring-destructive/30",
  info: "bg-chart-4 ring-chart-4/30",
  neutral: "bg-muted-foreground ring-muted-foreground/30",
};

const routeTones: Record<CartoMapTone, string> = {
  primary: "rgb(59 130 246)",
  success: "rgb(34 197 94)",
  warning: "rgb(245 158 11)",
  danger: "rgb(239 68 68)",
  info: "rgb(14 165 233)",
  neutral: "rgb(115 115 115)",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function latLngToPercent(lat: number, lng: number, grid: GridConfig) {
  const n = 2 ** grid.z;
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return {
    left: ((x - grid.xMin) / grid.cols) * 100,
    top: ((y - grid.yMin) / grid.rows) * 100,
  };
}

function placement(
  point: { lat?: number; lng?: number; x?: number; y?: number },
  grid: GridConfig,
) {
  if (typeof point.lat === "number" && typeof point.lng === "number") {
    return latLngToPercent(point.lat, point.lng, grid);
  }
  return { left: point.x ?? 50, top: point.y ?? 50 };
}

function metadata(item: MapPoint | MapRoute) {
  return Object.entries(item.meta ?? {}).filter(([, value]) => value !== undefined && value !== "");
}

export function CartoMap({
  region = "fixed",
  variant = "voyager",
  centerLabel = "Operacao Nery",
  route = [],
  routes = [],
  points = [],
  className,
  interactive = true,
  showLegend = false,
  attribution = true,
  onPointClick,
  onRouteClick,
}: CartoMapProps) {
  const grid = grids[region];
  const isDark = variant === "dark";
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);

  const tiles = useMemo(() => {
    const list: Array<{ x: number; y: number }> = [];
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        list.push({ x: grid.xMin + col, y: grid.yMin + row });
      }
    }
    return list;
  }, [grid]);

  const mapRoutes = useMemo<MapRoute[]>(() => {
    if (routes.length) {
      return routes.map((item, index) => ({
        ...item,
        id: item.id ?? `route-${index}`,
      }));
    }
    return route.length
      ? [{ id: "primary-route", label: "Rota cadastrada", points: route, tone: "primary" }]
      : [];
  }, [route, routes]);

  const placedPoints = useMemo(
    () =>
      points.map((point, index) => ({
        ...point,
        id: point.id ?? `point-${index}`,
        ...placement(point, grid),
      })) as Array<MapPoint & { left: number; top: number }>,
    [points, grid],
  );

  const placedRoutes = useMemo(
    () =>
      mapRoutes.map((mapRoute) => ({
        ...mapRoute,
        coords: mapRoute.points.map((point) => placement(point, grid)),
      })),
    [mapRoutes, grid],
  );

  const transform = `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`;

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelected(null);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border touch-none",
        isDark ? "bg-black" : "bg-muted",
        className,
      )}
      onWheel={(event) => {
        if (!interactive) return;
        event.preventDefault();
        setZoom((current) => clamp(current + (event.deltaY < 0 ? 0.12 : -0.12), 0.8, 2.6));
      }}
      onPointerDown={(event) => {
        if (!interactive || event.button !== 0) return;
        dragRef.current = {
          startX: event.clientX,
          startY: event.clientY,
          x: offset.x,
          y: offset.y,
        };
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!interactive || !drag) return;
        setOffset({
          x: clamp(drag.x + event.clientX - drag.startX, -180, 180),
          y: clamp(drag.y + event.clientY - drag.startY, -140, 140),
        });
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
      onPointerLeave={() => {
        dragRef.current = null;
      }}
    >
      <div className="absolute inset-0 origin-center" style={{ transform }}>
        <div
          className="absolute inset-0 grid opacity-95"
          style={{
            gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
          }}
        >
          {tiles.map((tile, index) => (
            <img
              key={`${tile.x}-${tile.y}`}
              src={`https://a.basemaps.cartocdn.com/${variantBase[variant]}/${grid.z}/${tile.x}/${tile.y}@2x.png`}
              alt=""
              className="h-full w-full select-none object-cover"
              loading={index < 4 ? "eager" : "lazy"}
              draggable={false}
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
        {placedRoutes.length > 0 && (
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {placedRoutes.map((mapRoute) => {
              const polyline = mapRoute.coords
                .map((point) => `${clamp(point.left, -20, 120)},${clamp(point.top, -20, 120)}`)
                .join(" ");
              const mid = mapRoute.coords[Math.floor(mapRoute.coords.length / 2)] ?? {
                left: 50,
                top: 50,
              };
              return (
                <polyline
                  key={mapRoute.id}
                  points={polyline}
                  fill="none"
                  stroke={routeTones[mapRoute.tone ?? "primary"]}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.25"
                  vectorEffect="non-scaling-stroke"
                  className="cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelected({ type: "route", item: mapRoute, x: mid.left, y: mid.top });
                    onRouteClick?.(mapRoute);
                  }}
                />
              );
            })}
          </svg>
        )}
        {placedPoints.map((point) => (
          <button
            key={point.id}
            type="button"
            className="absolute -translate-x-1/2 -translate-y-1/2 text-left"
            style={{ left: `${point.left}%`, top: `${point.top}%` }}
            onClick={(event) => {
              event.stopPropagation();
              setSelected({ type: "point", item: point, x: point.left, y: point.top });
              onPointClick?.(point);
            }}
          >
            <span
              className={cn(
                "block h-3.5 w-3.5 rounded-full ring-4 shadow-lg",
                tones[point.tone ?? "primary"],
              )}
            />
            <span
              className={cn(
                "mt-1 block max-w-32 truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium shadow-sm",
                isDark ? "bg-black/75 text-white" : "bg-white/90 text-foreground",
              )}
            >
              {point.label}
            </span>
          </button>
        ))}
      </div>

      <div
        className={cn(
          "absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-medium shadow-sm",
          isDark ? "bg-black/70 text-white" : "bg-white/90 text-foreground",
        )}
      >
        {centerLabel}
      </div>

      {interactive && (
        <div className="absolute right-3 top-3 grid gap-1">
          <button
            type="button"
            onClick={() => setZoom((current) => clamp(current + 0.18, 0.8, 2.6))}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-black shadow-sm"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((current) => clamp(current - 0.18, 0.8, 2.6))}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-black shadow-sm"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-black shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}

      {selected && (
        <div
          className={cn(
            "absolute z-10 w-60 rounded-lg border p-3 text-xs shadow-xl",
            isDark
              ? "border-white/10 bg-black/85 text-white"
              : "border-border bg-popover text-popover-foreground",
          )}
          style={{ left: `${clamp(selected.x, 8, 72)}%`, top: `${clamp(selected.y, 8, 72)}%` }}
        >
          <div className="font-semibold">{selected.item.label ?? "Rota"}</div>
          {(selected.item.caption || selected.item.status) && (
            <div className="mt-1 text-muted-foreground">
              {selected.item.caption || selected.item.status}
            </div>
          )}
          {selected.item.description && (
            <div className="mt-2 leading-relaxed">{selected.item.description}</div>
          )}
          {metadata(selected.item).length > 0 && (
            <dl className="mt-2 grid gap-1">
              {metadata(selected.item).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {showLegend && (
        <div
          className={cn(
            "absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-md px-2 py-1 text-[10px]",
            isDark ? "bg-black/70 text-white" : "bg-white/90 text-foreground",
          )}
        >
          {(["primary", "success", "warning", "danger"] as CartoMapTone[]).map((tone) => (
            <span key={tone} className="inline-flex items-center gap-1">
              <span className={cn("h-2 w-2 rounded-full", tones[tone].split(" ")[0])} />
              {tone}
            </span>
          ))}
        </div>
      )}

      {attribution && (
        <div
          className={cn(
            "absolute bottom-2 right-2 rounded-md px-2 py-1 text-[10px]",
            isDark ? "bg-white/90 text-black" : "bg-white/90 text-foreground",
          )}
        >
          CARTO / OpenStreetMap
        </div>
      )}
    </div>
  );
}
