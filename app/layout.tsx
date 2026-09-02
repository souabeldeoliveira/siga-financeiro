import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Cazabela — Gestão Financeira", template: "%s | Cazabela" },
  description: "Gestão financeira de contratos de administração imobiliária.",
  icons: {
    icon: [{ url: "/cazabela-app-icon.png", sizes: "1254x1254", type: "image/png" }],
    apple: [{ url: "/cazabela-app-icon.png", sizes: "1254x1254", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8b3156",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body><ServiceWorkerRegistration /><AppShell>{children}</AppShell></body>
    </html>
  );
}
