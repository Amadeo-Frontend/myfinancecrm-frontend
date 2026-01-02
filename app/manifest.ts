import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyFinanceCRM",
    short_name: "FinanceCRM",
    description: "Controle financeiro pessoal em um painel simples e rápido.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any maskable",
      },
    ],
  };
}
