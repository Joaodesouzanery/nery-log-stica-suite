import { createFileRoute } from "@tanstack/react-router";
import { UnifiedMapPage } from "@/components/unified-map-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mapa Operacional - Nery Agro" },
      {
        name: "description",
        content:
          "Mapa operacional unico com logistica, financeiro, campo, pecuaria, sustentabilidade, inteligencia e COGS.",
      },
    ],
  }),
  component: UnifiedMapPage,
});
