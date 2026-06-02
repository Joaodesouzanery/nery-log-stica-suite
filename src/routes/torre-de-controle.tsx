import { createFileRoute } from "@tanstack/react-router";
import { ControlTowerPage } from "@/components/control-tower-page";

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
  component: ControlTowerPage,
});
