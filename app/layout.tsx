import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Cazabela — Gestão Financeira", template: "%s | Cazabela" },
  description: "Gestão financeira de contratos de administração imobiliária.",
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
