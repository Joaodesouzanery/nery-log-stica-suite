import { InteractiveMap } from "@/components/interactive-map";
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

export function AgroMap({
  points = [],
  routes = [],
  stats = [],
  className,
  title = "Mapa operacional",
  subtitle = "Clique nos marcadores, clusters e rotas para ver detalhes.",
}: AgroMapProps) {
  return (
    <InteractiveMap
      variant="dark"
      points={points}
      routes={routes}
      stats={stats}
      className={className}
      title={title}
      subtitle={subtitle}
      showLegend
      fallbackBounds={{ west: -74, south: -34, east: -34, north: 6 }}
    />
  );
}
