"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { MantaAviso, MantaMood } from "@/lib/portal/manta";
import { MantaAvatar } from "./ui";

/** Manta dentro del portal: burbuja con el resumen del día y atajos. Por reglas, sin IA. */
export function MantaDock({ mood, saludo, resumen, avisos }: { mood: MantaMood; saludo: string; resumen: string; avisos: MantaAviso[] }) {
  const [open, setOpen] = useState(false);
  const pendientes = avisos.length;
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <section
          aria-label="Manta, asistente de Master Tools"
          className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white shadow-card-hover motion-safe:animate-rise"
        >
          <header className="flex items-center gap-3 bg-noche px-4 py-3 text-white">
            <MantaAvatar mood={mood} size={40} className="ring-2 ring-master/60" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-base leading-tight font-bold">Manta</p>
              <p className="text-xs text-white/75">Asistente del portal</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar a Manta" className="rounded-md p-1.5 hover:bg-white/10">
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>
          <div className="space-y-3 p-4 text-sm">
            <p className="font-semibold">{saludo}</p>
            <p className="text-noche/80">{resumen}</p>
            {avisos.length > 0 && (
              <ul className="space-y-2">
                {avisos.map((a) => (
                  <li key={a.texto}>
                    {a.href ? (
                      <Link
                        href={a.href}
                        onClick={() => setOpen(false)}
                        className={`block rounded-lg px-3 py-2 font-medium hover:brightness-95 ${a.tono === "alerta" ? "bg-alerta/90 text-noche" : "bg-niebla text-noche"}`}
                      >
                        {a.texto}
                      </Link>
                    ) : (
                      <p className="rounded-lg bg-niebla px-3 py-2 text-noche">{a.texto}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Cerrar a Manta" : `Abrir a Manta${pendientes ? `, ${pendientes} avisos` : ""}`}
        className="relative rounded-full bg-noche p-1 shadow-card-hover transition-transform hover:scale-105"
      >
        <MantaAvatar mood={mood} size={56} />
        {pendientes > 0 && !open && (
          <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-alerta text-xs font-bold text-noche">
            {pendientes}
          </span>
        )}
      </button>
    </div>
  );
}
