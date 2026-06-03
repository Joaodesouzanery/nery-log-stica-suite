import { useMemo, useRef, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Home,
  Minus,
  Navigation,
  Package,
  Plus,
  RotateCcw,
  Route,
  Sprout,
  Truck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartoMapTone, MapPoint, MapRoute } from "@/components/carto-map";

type MapStat = {
  label: string;
  value: string | number;
  tone?: CartoMapTone;
};

type ProjectedPoint = MapPoint & { px: number; py: number; kind: PointKind };
type ProjectedRoute = MapRoute & { coords: Array<{ px: number; py: number }> };
type PointKind = "origem" | "cliente" | "base" | "campo" | "rota" | "fornecedor";
type SelectedItem =
  | { type: "point"; item: ProjectedPoint; x: number; y: number }
  | { type: "route"; item: ProjectedRoute; x: number; y: number };
type TileGrid = {
  z: number;
  xMin: number;
  yMin: number;
  cols: number;
  rows: number;
};

type AgroMapProps = {
  points?: MapPoint[];
  routes?: MapRoute[];
  stats?: MapStat[];
  className?: string;
  center?: [number, number];
  zoom?: number;
  title?: string;
  subtitle?: string;
};

const toneColor: Record<CartoMapTone, string> = {
  primary: "#60a5fa",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#fb7185",
  info: "#22d3ee",
  neutral: "#cbd5e1",
};

const markerClass: Record<CartoMapTone, string> = {
  primary: "border-blue-300 bg-blue-500 text-white",
  success: "border-emerald-300 bg-emerald-500 text-slate-950",
  warning: "border-amber-200 bg-amber-400 text-slate-950",
  danger: "border-rose-200 bg-rose-500 text-white",
  info: "border-cyan-200 bg-cyan-500 text-slate-950",
  neutral: "border-slate-200 bg-slate-600 text-white",
};

const cartoGrid: TileGrid = { z: 4, xMin: 4, yMin: 6, cols: 4, rows: 4 };
const cartoTileHosts = ["a", "b", "c", "d"];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function coordinate(point: { lat?: number; lng?: number; x?: number; y?: number }) {
  if (
    typeof point.lat === "number" &&
    typeof point.lng === "number" &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng)
  ) {
    return { lat: point.lat, lng: point.lng };
  }
  if (
    typeof point.x === "number" &&
    typeof point.y === "number" &&
    Number.isFinite(point.x) &&
    Number.isFinite(point.y)
  ) {
    return { x: point.x, y: point.y };
  }
  return null;
}

function pointKind(point: MapPoint): PointKind {
  const raw = String(point.meta?.tipo ?? "").toLowerCase();
  if (point.id.startsWith("origin-")) return "origem";
  if (point.id.startsWith("dest-")) return "cliente";
  if (point.id.startsWith("base-")) return "base";
  if (point.id.startsWith("field-")) return "campo";
  if (raw.includes("fornecedor")) return "fornecedor";
  if (raw.includes("rota")) return "rota";
  return "cliente";
}

function projectPercent(
  point: { lat?: number; lng?: number; x?: number; y?: number },
  grid: TileGrid,
) {
  if (typeof point.x === "number" && typeof point.y === "number") {
    return { px: clamp(point.x, 4, 96), py: clamp(point.y, 10, 94) };
  }

  if (typeof point.lat !== "number" || typeof point.lng !== "number") {
    return { px: 50, py: 50 };
  }

  const n = 2 ** grid.z;
  const tileX = ((point.lng + 180) / 360) * n;
  const latRad = (point.lat * Math.PI) / 180;
  const tileY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return {
    px: clamp(((tileX - grid.xMin) / grid.cols) * 100, 3, 97),
    py: clamp(((tileY - grid.yMin) / grid.rows) * 100, 7, 94),
  };
}

function metadata(item: MapPoint | MapRoute) {
  return Object.entries(item.meta ?? {}).filter(([, value]) => value !== undefined && value !== "");
}

function statIcon(tone: CartoMapTone) {
  if (tone === "success") return CheckCircle2;
  if (tone === "danger") return XCircle;
  if (tone === "warning") return Route;
  if (tone === "info") return Package;
  return Truck;
}

function pointIcon(kind: PointKind) {
  if (kind === "base") return Building2;
  if (kind === "campo") return Sprout;
  if (kind === "origem") return Home;
  if (kind === "rota") return Route;
  if (kind === "fornecedor") return Package;
  return Truck;
}

export function AgroMap({
  points = [],
  routes = [],
  stats = [],
  className,
  title = "Mapa operacional",
  subtitle = "Clique nos marcadores e rotas para ver detalhes.",
}: AgroMapProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);

  const cartoTiles = useMemo(() => {
    const list: Array<{ x: number; y: number; host: string }> = [];
    for (let row = 0; row < cartoGrid.rows; row += 1) {
      for (let col = 0; col < cartoGrid.cols; col += 1) {
        list.push({
          x: cartoGrid.xMin + col,
          y: cartoGrid.yMin + row,
          host: cartoTileHosts[(row * cartoGrid.cols + col) % cartoTileHosts.length],
        });
      }
    }
    return list;
  }, []);

  const { projectedPoints, projectedRoutes, hasSpatialData } = useMemo(() => {
    const projected = points
      .map((point) => {
        const coord = coordinate(point);
        if (!coord) return null;
        return { ...point, ...projectPercent(point, cartoGrid), kind: pointKind(point) };
      })
      .filter(Boolean) as ProjectedPoint[];

    const routeProjection = routes
      .map((route) => ({
        ...route,
        coords: route.points
          .filter((point) => coordinate(point))
          .map((point) => projectPercent(point, cartoGrid)),
      }))
      .filter((route) => route.coords.length >= 2) as ProjectedRoute[];

    return {
      projectedPoints: projected,
      projectedRoutes: routeProjection,
      hasSpatialData: projected.length > 0 || routeProjection.length > 0,
    };
  }, [points, routes]);

  const transform = `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`;
  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelected(null);
  };

  return (
    <div
      className={cn(
        "relative min-h-[420px] overflow-hidden rounded-xl border border-slate-800 bg-[#020617]",
        className,
      )}
      onWheel={(event) => {
        event.preventDefault();
        setZoom((current) => clamp(current + (event.deltaY < 0 ? 0.12 : -0.12), 0.75, 2.8));
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        dragRef.current = {
          startX: event.clientX,
          startY: event.clientY,
          x: offset.x,
          y: offset.y,
        };
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag) return;
        setOffset({
          x: clamp(drag.x + event.clientX - drag.startX, -260, 260),
          y: clamp(drag.y + event.clientY - drag.startY, -180, 180),
        });
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
      onPointerLeave={() => {
        dragRef.current = null;
      }}
      onClick={() => setSelected(null)}
    >
      <div className="absolute inset-0 origin-center" style={{ transform }}>
        <div
          className="absolute inset-0 grid opacity-95"
          style={{
            gridTemplateColumns: `repeat(${cartoGrid.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${cartoGrid.rows}, minmax(0, 1fr))`,
          }}
        >
          {cartoTiles.map((tile, index) => (
            <img
              key={`${tile.x}-${tile.y}`}
              src={`https://${tile.host}.basemaps.cartocdn.com/dark_all/${cartoGrid.z}/${tile.x}/${tile.y}@2x.png`}
              alt=""
              className="h-full w-full select-none object-cover"
              draggable={false}
              loading={index < 4 ? "eager" : "lazy"}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,rgba(37,99,235,0.08),transparent_36%),linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.46))]" />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {projectedRoutes.map((route) => {
            const pointsAttr = route.coords.map((point) => `${point.px},${point.py}`).join(" ");
            const mid = route.coords[Math.floor(route.coords.length / 2)] ?? { px: 50, py: 50 };
            return (
              <g key={route.id}>
                <polyline
                  points={pointsAttr}
                  fill="none"
                  stroke={toneColor[route.tone ?? "primary"]}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  opacity="0.92"
                />
                <polyline
                  points={pointsAttr}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="0.32"
                  strokeDasharray="1.3 1.3"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  opacity="0.7"
                />
                <polyline
                  points={pointsAttr}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="5"
                  vectorEffect="non-scaling-stroke"
                  className="cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelected({ type: "route", item: route, x: mid.px, y: mid.py });
                  }}
                />
              </g>
            );
          })}
        </svg>

        {projectedPoints.map((point) => {
          const Icon = pointIcon(point.kind);
          const tone = point.tone ?? "neutral";
          return (
            <button
              key={point.id}
              type="button"
              title={`${point.label}${point.caption ? ` - ${point.caption}` : ""}`}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 transition-transform hover:scale-105"
              style={{ left: `${point.px}%`, top: `${point.py}%` }}
              onClick={(event) => {
                event.stopPropagation();
                setSelected({ type: "point", item: point, x: point.px, y: point.py });
              }}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded border shadow-lg shadow-black/40",
                  markerClass[tone],
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="max-w-[150px] truncate rounded border border-white/15 bg-slate-950/85 px-1.5 py-1 text-[10px] font-semibold text-white shadow-lg shadow-black/30">
                {point.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-slate-950/95 via-slate-950/55 to-transparent p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-md rounded-lg border border-white/15 bg-slate-950/75 px-3 py-2 text-white shadow-xl backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Navigation className="h-3.5 w-3.5 text-blue-300" />
              {title}
            </div>
            <div className="mt-0.5 text-[11px] text-white/70">{subtitle}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:flex">
            {stats.map((stat) => {
              const tone = stat.tone ?? "neutral";
              const Icon = statIcon(tone);
              return (
                <div
                  key={stat.label}
                  className="min-w-[112px] rounded-lg border border-white/15 bg-slate-950/78 px-3 py-2 text-white shadow-xl backdrop-blur"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-white/65">
                    <Icon className="h-3 w-3" />
                    {stat.label}
                  </div>
                  <div className="mt-1 text-lg font-semibold" style={{ color: toneColor[tone] }}>
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute right-3 top-28 z-20 grid gap-1">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setZoom((current) => clamp(current + 0.18, 0.75, 2.8));
          }}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-slate-950/85 text-white shadow-sm"
          aria-label="Aproximar mapa"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setZoom((current) => clamp(current - 0.18, 0.75, 2.8));
          }}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-slate-950/85 text-white shadow-sm"
          aria-label="Afastar mapa"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            reset();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-slate-950/85 text-white shadow-sm"
          aria-label="Centralizar mapa"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {!hasSpatialData && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 rounded-lg border border-white/15 bg-slate-950/85 px-4 py-3 text-xs text-white/75 backdrop-blur">
          Nenhuma coordenada disponível para desenhar pontos ou rotas. Cadastre lat/lng nas cargas,
          bases ou ocorrências para ativar a visualização completa.
        </div>
      )}

      {selected && (
        <div
          className="absolute z-30 w-72 rounded-lg border border-white/15 bg-slate-950/95 p-3 text-xs text-white shadow-2xl backdrop-blur"
          style={{
            left: `${clamp(selected.x, 8, 68)}%`,
            top: `${clamp(selected.y, 14, 72)}%`,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="text-sm font-semibold">{selected.item.label ?? "Rota"}</div>
          {selected.item.description && (
            <div className="mt-1 leading-relaxed text-white/70">{selected.item.description}</div>
          )}
          {selected.type === "point" && selected.item.caption && (
            <div className="mt-1 text-white/70">{selected.item.caption}</div>
          )}
          {metadata(selected.item).length > 0 && (
            <dl className="mt-3 grid gap-1.5">
              {metadata(selected.item).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between gap-3 border-t border-white/10 pt-1.5"
                >
                  <dt className="text-white/50">{key.replace(/_/g, " ")}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded bg-slate-950/75 px-2 py-1 text-[10px] text-white/65 backdrop-blur">
        CARTO / OpenStreetMap
      </div>
    </div>
  );
}
