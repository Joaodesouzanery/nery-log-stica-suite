import { createFileRoute } from "@tanstack/react-router";
import { UnifiedMapPage } from "@/components/unified-map-page";

export const Route = createFileRoute("/torre-de-controle")({
  head: () => ({
    meta: [
      { title: "Torre de Controle - Nery Agro" },
      {
        name: "description",
        content:
          "Mapa global, alertas proativos, KPIs OTIF, vendas, capacidade e rede integrada da fazenda.",
      },
    ],
  }),
  component: UnifiedMapPage,
});
