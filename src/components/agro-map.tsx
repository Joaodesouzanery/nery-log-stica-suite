import { useEffect, useMemo, useRef } from "react";
import maplibregl, {
  type GeoJSONSource,
  type LngLatBoundsLike,
  type Map as MapLibreMap,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Package, Route, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartoMapTone, MapPoint, MapRoute } from "@/components/carto-map";

type MapStat = {
  label: string;
  value: string | number;
  tone?: CartoMapTone;
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
  primary: "#2563eb",
  success: "#16a34a",
  warning: "#ca8a04",
  danger: "#dc2626",
  info: "#0891b2",
  neutral: "#64748b",
};

const toneClass: Record<CartoMapTone, string> = {
  primary: "border-blue-400/70 bg-blue-500 text-white",
  success: "border-emerald-400/70 bg-emerald-600 text-white",
  warning: "border-amber-300/80 bg-amber-500 text-slate-950",
  danger: "border-red-300/80 bg-red-600 text-white",
  info: "border-cyan-300/80 bg-cyan-600 text-white",
  neutral: "border-slate-300/70 bg-slate-700 text-white",
};

function coordinate(point: { lat?: number; lng?: number }): [number, number] | null {
  if (point.lat === undefined || point.lng === undefined) return null;
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null;
  return [point.lng, point.lat];
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function popupHtml(
  title: string,
  caption?: string,
  meta?: Record<string, string | number | undefined>,
) {
  const rows = Object.entries(meta ?? {}).filter(
    ([, value]) => value !== undefined && value !== "",
  );
  return `
    <div style="min-width:220px;max-width:300px;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:3px">${escapeHtml(title)}</div>
      ${caption ? `<div style="font-size:11px;color:#475569;margin-bottom:8px">${escapeHtml(caption)}</div>` : ""}
      ${
        rows.length
          ? `<div style="display:grid;gap:5px">${rows
              .map(
                ([key, value]) =>
                  `<div style="display:flex;justify-content:space-between;gap:10px;border-top:1px solid #e2e8f0;padding-top:5px">
                    <span style="font-size:10px;text-transform:uppercase;letter-spacing:.02em;color:#64748b">${escapeHtml(key.replace(/_/g, " "))}</span>
                    <strong style="font-size:11px;color:#0f172a;text-align:right">${escapeHtml(value)}</strong>
                  </div>`,
              )
              .join("")}</div>`
          : ""
      }
    </div>
  `;
}

function routeFeature(route: MapRoute) {
  const coordinates = route.points.map(coordinate).filter(Boolean) as [number, number][];
  if (coordinates.length < 2) return null;
  return {
    type: "Feature" as const,
    properties: {
      id: route.id,
      label: route.label ?? "Rota",
      tone: route.tone ?? "primary",
      description: route.description ?? route.status ?? "",
    },
    geometry: {
      type: "LineString" as const,
      coordinates,
    },
  };
}

export function AgroMap({
  points = [],
  routes = [],
  stats = [],
  className,
  center = [-51.9253, -14.235],
  zoom = 3.5,
  title = "Mapa operacional",
  subtitle = "Clique nos marcadores e rotas para ver detalhes.",
}: AgroMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const routeCollection = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: routes
        .map(routeFeature)
        .filter((feature): feature is NonNullable<ReturnType<typeof routeFeature>> => feature !== null),
    }),
    [routes],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      center,
      zoom,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "OpenStreetMap",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const render = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (map.getLayer("route-lines")) map.removeLayer("route-lines");
      if (map.getSource("routes")) map.removeSource("routes");

      if (routeCollection.features.length) {
        map.addSource("routes", { type: "geojson", data: routeCollection });
        map.addLayer({
          id: "route-lines",
          type: "line",
          source: "routes",
          paint: {
            "line-color": [
              "match",
              ["get", "tone"],
              "success",
              toneColor.success,
              "warning",
              toneColor.warning,
              "danger",
              toneColor.danger,
              "info",
              toneColor.info,
              toneColor.primary,
            ],
            "line-width": 4,
            "line-opacity": 0.85,
          },
        });

        map.on("click", "route-lines", (event) => {
          const feature = event.features?.[0];
          if (!feature) return;
          new maplibregl.Popup({ closeButton: true, closeOnClick: true })
            .setLngLat(event.lngLat)
            .setHTML(
              popupHtml(
                String(feature.properties?.label ?? "Rota"),
                String(feature.properties?.description ?? ""),
              ),
            )
            .addTo(map);
        });
      }

      const bounds = new maplibregl.LngLatBounds();
      points.forEach((point) => {
        const coord = coordinate(point);
        if (!coord) return;
        const tone = point.tone ?? "neutral";
        const markerEl = document.createElement("button");
        markerEl.type = "button";
        markerEl.className = `group flex items-center gap-1 rounded border px-1.5 py-1 text-[10px] font-semibold shadow-lg shadow-black/20 ${toneClass[tone]}`;
        const dot = document.createElement("span");
        dot.style.width = "7px";
        dot.style.height = "7px";
        dot.style.borderRadius = "999px";
        dot.style.background = "currentColor";
        dot.style.boxShadow = "0 0 0 2px rgba(255,255,255,.45)";
        const label = document.createElement("span");
        label.textContent = point.label;
        markerEl.append(dot, label);

        const marker = new maplibregl.Marker({ element: markerEl, anchor: "bottom" })
          .setLngLat(coord)
          .setPopup(
            new maplibregl.Popup({ offset: 18 }).setHTML(
              popupHtml(point.label, point.caption ?? point.description, point.meta),
            ),
          )
          .addTo(map);
        markersRef.current.push(marker);
        bounds.extend(coord);
      });

      routeCollection.features.forEach((feature) => {
        feature.geometry.coordinates.forEach((coord) => bounds.extend(coord));
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds as LngLatBoundsLike, {
          padding: { top: 92, right: 56, bottom: 56, left: 56 },
          maxZoom: 9,
          duration: 700,
        });
      }
    };

    if (map.loaded()) render();
    else map.once("load", render);

    return () => {
      const source = map.getSource("routes") as GeoJSONSource | undefined;
      if (source) source.setData({ type: "FeatureCollection", features: [] });
    };
  }, [points, routeCollection]);

  return (
    <div
      className={cn("relative min-h-[420px] overflow-hidden rounded-xl bg-slate-950", className)}
    >
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-slate-950/80 via-slate-950/35 to-transparent p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-md rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-white shadow-xl backdrop-blur">
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-0.5 text-[11px] text-white/70">{subtitle}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {stats.map((stat) => {
              const tone = stat.tone ?? "neutral";
              return (
                <div
                  key={stat.label}
                  className="min-w-[110px] rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-white shadow-xl backdrop-blur"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-white/65">
                    {tone === "success" ? (
                      <Package className="h-3 w-3" />
                    ) : tone === "danger" ? (
                      <Route className="h-3 w-3" />
                    ) : (
                      <Truck className="h-3 w-3" />
                    )}
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
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded bg-slate-950/70 px-2 py-1 text-[10px] text-white/65 backdrop-blur">
        OSM / MapLibre
      </div>
    </div>
  );
}
