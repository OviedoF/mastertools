"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

/**
 * Actualiza la página sola cada pocos segundos mientras la pestaña está visible,
 * para seguir las conversaciones de Manta en vivo. Se puede pausar.
 */
export function EnVivo({ segundos = 8 }: { segundos?: number }) {
  const router = useRouter();
  const [activo, setActivo] = useState(true);
  const [ultima, setUltima] = useState(() => Date.now());
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    if (!activo) return;
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      setUltima(Date.now());
    };
    const t = window.setInterval(tick, segundos * 1000);
    const onVis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [activo, router, segundos]);

  useEffect(() => {
    const t = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const cambiar = () => {
    const v = !activo;
    setActivo(v);
    if (v) {
      router.refresh();
      setUltima(Date.now());
    }
  };
  const seg = Math.max(0, Math.round((ahora - ultima) / 1000));

  return (
    <button
      type="button"
      onClick={cambiar}
      aria-pressed={activo}
      className={clsx(
        "inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold",
        activo ? "border-emerald-600/30 bg-emerald-50 text-emerald-900" : "border-noche/20 bg-white text-noche hover:bg-niebla",
      )}
      title={activo ? "Pausar la actualización automática" : "Actualizar sola cada pocos segundos"}
    >
      <span className="relative flex size-2.5" aria-hidden="true">
        {activo && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />}
        <span className={clsx("relative inline-flex size-2.5 rounded-full", activo ? "bg-emerald-600" : "bg-gris")} />
      </span>
      {activo ? <>En vivo <span className="font-normal text-emerald-900/70">· actualizado hace {seg} s</span></> : "En vivo pausado"}
    </button>
  );
}
