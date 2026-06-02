import { useEffect, useMemo, useRef, useState } from "react";
import type { LngLatBoundsLike, Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CheckCircle2, Navigation, Package, Route, Truck, XCircle } from "lucide-react";
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
  primary: "#60a5fa",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#fb7185",
  info: "#22d3ee",
  neutral: "#cbd5e1",
};

const markerTone: Record<CartoMapTone, string> = {
  primary: "border-blue-300 bg-blue-500 text-white",
  success: "border-emerald-300 bg-emerald-500 text-slate-950",
  warning: "border-amber-200 bg-amber-400 text-slate-950",
  danger: "border-rose-200 bg-rose-500 text-white",
  info: "border-cyan-200 bg-cyan-500 text-slate-950",
  neutral: "border-slate-200 bg-slate-600 text-white",
};

const iconByType: Record<string, string> = {
  origem:
    "M12 2 3 6v6c0 5 4 8 9 10 5-2 9-5 9-10V6l-9-4Zm0 4 5 2.2V12c0 2.9-2 5-5 6.4C9 17 7 14.9 7 12V8.2L12 6Z",
  cliente:
    "M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z",
  base: "M3 21V8l9-5 9 5v13h-6v-7H9v7H3Zm6-9h6V9H9v3Z",
  campo: "M4 20c8-1 13-6 16-17-9 2-15 7-16 17Zm3-3c2-4 5-7 10-10-2 5-5 8-10 10Z",
  rota: "M5 18a3 3 0 1 0 2.8 2H10c2.8 0 5-2.2 5-5s-2.2-5-5-5H8a3 3 0 1 1 0-2h2c3.9 0 7 3.1 7 7s-3.1 7-7 7H7.8A3 3 0 0 0 5 18Z",
  fornecedor: "M4 4h16v4H4V4Zm1 6h14l-1 10H6L5 10Zm4 3v4h2v-4H9Zm4 0v4h2v-4h-2Z",
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

function pointType(point: MapPoint) {
  const raw = String(point.meta?.tipo ?? "").toLowerCase();
  if (point.id.startsWith("origin-")) return "origem";
  if (point.id.startsWith("dest-")) return "cliente";
  if (point.id.startsWith("base-")) return "base";
  if (point.id.startsWith("field-")) return "campo";
  if (raw.includes("fornecedor")) return "fornecedor";
  if (raw.includes("rota")) return "rota";
  return "cliente";
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
    <div style="min-width:250px;max-width:340px;font-family:Inter,system-ui,sans-serif;color:#e5edf7;background:#0f172a">
      <div style="border-bottom:1px solid rgba(148,163,184,.35);padding:10px 10px 8px">
        <div style="font-size:13px;font-weight:800;color:#f8fafc">${escapeHtml(title)}</div>
        ${caption ? `<div style="font-size:11px;color:#cbd5e1;margin-top:3px">${escapeHtml(caption)}</div>` : ""}
      </div>
      ${
        rows.length
          ? `<div style="display:grid;gap:0;padding:4px 10px 10px">${rows
              .map(
                ([key, value]) =>
                  `<div style="display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(148,163,184,.18);padding:6px 0">
                    <span style="font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8">${escapeHtml(key.replace(/_/g, " "))}</span>
                    <strong style="font-size:11px;color:#f8fafc;text-align:right">${escapeHtml(value)}</strong>
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
    geometry: { type: "LineString" as const, coordinates },
  };
}

function markerHtml(point: MapPoint) {
  const tone = point.tone ?? "neutral";
  const type = pointType(point);
  const path = iconByType[type] ?? iconByType.cliente;
  return `
    <span class="flex h-7 w-7 items-center justify-center rounded border shadow-lg shadow-black/40 ${markerTone[tone]}">
      <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
        <path d="${path}"></path>
      </svg>
    </span>
    <span class="max-w-[150px] truncate rounded border border-white/15 bg-slate-950/85 px-1.5 py-1 text-[10px] font-semibold text-white shadow-lg shadow-black/30">
      ${escapeHtml(point.label)}
    </span>
  `;
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
  const markersRef = useRef<Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const routeCollection = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: routes
        .map(routeFeature)
        .filter(
          (feature): feature is NonNullable<ReturnType<typeof routeFeature>> => feature !== null,
        ),
    }),
    [routes],
  );
  const hasSpatialData =
    points.some((point) => coordinate(point)) || routeCollection.features.length > 0;

  useEffect(() => {
    if (!containerRef.current || mapRef.current || typeof window === "undefined") return;
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    async function initMap() {
      try {
        const maplibregl = await import("maplibre-gl");
        if (cancelled || !containerRef.current) return;
        const map = new maplibregl.Map({
          container: containerRef.current,
          center,
          zoom,
          attributionControl: false,
          style: {
            version: 8,
            sources: {
              dark: {
                type: "raster",
                tiles: [
                  "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                  "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                  "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                ],
                tileSize: 256,
                attribution: "OpenStreetMap / CARTO",
              },
            },
            layers: [{ id: "dark", type: "raster", source: "dark" }],
          },
        });
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
        map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
        map.on("load", () => {
          map.resize();
          setReady(true);
        });
        map.on("error", (event) => {
          if (String(event.error?.message ?? "").includes("Failed to fetch")) {
            setMapError(
              "Alguns tiles do mapa não carregaram. Os marcadores continuam disponíveis.",
            );
          }
        });
        observer = new ResizeObserver(() => map.resize());
        observer.observe(containerRef.current);
        mapRef.current = map;
      } catch (error) {
        setMapError(error instanceof Error ? error.message : "Não foi possível carregar o mapa.");
      }
    }

    void initMap();

    return () => {
      cancelled = true;
      observer?.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let cancelled = false;

    const render = async () => {
      try {
        const maplibregl = await import("maplibre-gl");
        if (cancelled || mapRef.current !== map) return;
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        if (map.getLayer("route-hit")) map.removeLayer("route-hit");
        if (map.getLayer("route-pulse")) map.removeLayer("route-pulse");
        if (map.getLayer("route-lines")) map.removeLayer("route-lines");
        if (map.getSource("routes")) map.removeSource("routes");

        if (routeCollection.features.length) {
          map.addSource("routes", { type: "geojson", data: routeCollection });
          map.addLayer({
            id: "route-lines",
            type: "line",
            source: "routes",
            layout: { "line-cap": "round", "line-join": "round" },
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
              "line-width": 3.5,
              "line-opacity": 0.9,
            },
          });
          map.addLayer({
            id: "route-pulse",
            type: "line",
            source: "routes",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#e2e8f0",
              "line-width": 1.2,
              "line-dasharray": [2, 2],
              "line-opacity": 0.65,
            },
          });
          map.addLayer({
            id: "route-hit",
            type: "line",
            source: "routes",
            paint: { "line-color": "#000", "line-width": 14, "line-opacity": 0 },
          });
          map.on("mouseenter", "route-hit", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "route-hit", () => {
            map.getCanvas().style.cursor = "";
          });
          map.on("click", "route-hit", (event) => {
            const feature = event.features?.[0];
            if (!feature) return;
            new maplibregl.Popup({ closeButton: true, closeOnClick: true, className: "agro-popup" })
              .setLngLat(event.lngLat)
              .setHTML(
                popupHtml(String(feature.properties?.label ?? "Rota"), "Trajeto cadastrado", {
                  descrição: String(feature.properties?.description ?? ""),
                  status: String(feature.properties?.tone ?? "primary"),
                }),
              )
              .addTo(map);
          });
        }

        const bounds = new maplibregl.LngLatBounds();
        points.forEach((point) => {
          const coord = coordinate(point);
          if (!coord) return;
          const markerEl = document.createElement("button");
          markerEl.type = "button";
          markerEl.title = `${point.label}${point.caption ? ` - ${point.caption}` : ""}`;
          markerEl.className =
            "group flex items-center gap-1.5 transition-transform hover:scale-105";
          markerEl.innerHTML = markerHtml(point);

          const marker = new maplibregl.Marker({ element: markerEl, anchor: "bottom" })
            .setLngLat(coord)
            .setPopup(
              new maplibregl.Popup({ offset: 20, className: "agro-popup" }).setHTML(
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
            padding: { top: 118, right: 64, bottom: 58, left: 64 },
            maxZoom: 9,
            duration: 650,
          });
        } else {
          map.flyTo({ center, zoom, duration: 400 });
        }
      } catch (error) {
        console.warn("agro-map render skipped:", error);
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [center, points, ready, routeCollection, zoom]);

  return (
    <div
      className={cn(
        "relative min-h-[420px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950",
        className,
      )}
    >
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(37,99,235,0.13),transparent_36%)]" />
      {(!hasSpatialData || mapError) && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 rounded-lg border border-white/15 bg-slate-950/85 px-4 py-3 text-xs text-white/75 backdrop-blur">
          {mapError ??
            "Nenhuma coordenada disponível para desenhar pontos ou rotas. Cadastre lat/lng nas cargas, bases ou ocorrências para ativar a visualização completa."}
        </div>
      )}
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
              return (
                <div
                  key={stat.label}
                  className="min-w-[112px] rounded-lg border border-white/15 bg-slate-950/78 px-3 py-2 text-white shadow-xl backdrop-blur"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-white/65">
                    {tone === "success" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : tone === "danger" ? (
                      <XCircle className="h-3 w-3" />
                    ) : tone === "warning" ? (
                      <Route className="h-3 w-3" />
                    ) : tone === "info" ? (
                      <Package className="h-3 w-3" />
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
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded bg-slate-950/75 px-2 py-1 text-[10px] text-white/65 backdrop-blur">
        MapLibre / CARTO / OSM
      </div>
    </div>
  );
}
