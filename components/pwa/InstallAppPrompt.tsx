"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIphoneOrIpad() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallAppPrompt() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  useEffect(() => {
    setIsAppleDevice(isIphoneOrIpad());
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (installPrompt) {
    return (
      <button type="button" onClick={install} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--brand)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)]">
        Instalar aplicativo no celular
      </button>
    );
  }

  if (isAppleDevice) {
    return <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">No iPhone ou iPad, toque em Compartilhar e escolha “Adicionar à Tela de Início”.</p>;
  }

  return <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">No celular Android, abra o menu do navegador e escolha “Instalar aplicativo”.</p>;
}
