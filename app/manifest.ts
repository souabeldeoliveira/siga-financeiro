import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Cazabela — Gestão Financeira",
    short_name: "Cazabela",
    description: "Gestão financeira de contratos de administração imobiliária.",
    lang: "pt-BR",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#eee1d4",
    theme_color: "#5b3426",
    categories: ["business", "finance"],
    icons: [
      { src: "/cazabela-app-icon.png", sizes: "1254x1254", type: "image/png", purpose: "any" },
      { src: "/cazabela-app-icon.png", sizes: "1254x1254", type: "image/png", purpose: "maskable" },
    ],
  };
}
