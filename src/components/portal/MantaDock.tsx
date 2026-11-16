"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import clsx from "clsx";
import { X } from "lucide-react";
import { preguntarMantaAction } from "@/lib/portal/actions";
import type { MantaAviso, MantaMood } from "@/lib/portal/manta";
import type { PreguntaManta, RespuestaManta } from "@/lib/portal/manta-preguntas";
import { MantaAvatar } from "./ui";

type Turno = { pregunta: string; respuesta?: RespuestaManta };

/**
 * Manta dentro del portal: resumen del día y preguntas predefinidas. Sin IA: cada pregunta tiene una respuesta fija
 * o una consulta fija a la base de datos, y el usuario solo puede elegir de la lista.
 */
export function MantaDock({ mood, saludo, resumen, avisos, preguntas }: { mood: MantaMood; saludo: string; resumen: string; avisos: MantaAviso[]; preguntas: PreguntaManta[] }) {
  const [open, setOpen] = useState(false);
  const [vista, setVista] = useState<"resumen" | "preguntas">("resumen");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [pending, start] = useTransition();
  const fin = useRef<HTMLDivElement>(null);
  const pendientes = avisos.length;

  function preguntar(p: PreguntaManta) {
    const i = turnos.length;
    setTurnos((t) => [...t, { pregunta: p.texto }]);
    start(async () => {
      const respuesta = await preguntarMantaAction(p.id);
      setTurnos((t) => t.map((x, k) => (k === i ? { ...x, respuesta } : x)));
      setTimeout(() => fin.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
    });
  }

  const grupo = (g: PreguntaManta["grupo"], titulo: string) => (
    <div>
      <p className="mb-1.5 text-xs font-semibold tracking-wide text-gris uppercase">{titulo}</p>
      <ul className="flex flex-wrap gap-1.5">
        {preguntas.filter((p) => p.grupo === g).map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => preguntar(p)} disabled={pending} className="rounded-full bg-claro px-3 py-1.5 text-left text-xs font-medium text-noche hover:brightness-95 disabled:opacity-60">
              {p.texto}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <section
          aria-label="Manta, asistente de Master Tools"
          className="flex max-h-[min(34rem,calc(100dvh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-card-hover motion-safe:animate-rise"
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

          <div role="tablist" aria-label="Manta" className="flex border-b border-noche/10 text-sm font-semibold">
            {(["resumen", "preguntas"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                type="button"
                aria-selected={vista === v}
                onClick={() => setVista(v)}
                className={clsx("flex-1 px-3 py-2", vista === v ? "border-b-2 border-profundo text-profundo" : "text-noche/60 hover:bg-niebla")}
              >
                {v === "resumen" ? "Mi día" : "Preguntas"}
              </button>
            ))}
          </div>

          <div className="space-y-3 overflow-y-auto p-4 text-sm">
            {vista === "resumen" ? (
              <>
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
                <button type="button" onClick={() => setVista("preguntas")} className="font-semibold text-profundo underline">
                  ¿Tiene una pregunta? Elíjala aquí
                </button>
              </>
            ) : (
              <>
                {turnos.length === 0 && <p className="text-noche/80">Elija una pregunta y le respondo con los datos de hoy.</p>}
                {turnos.map((t, i) => (
                  <div key={i} className="space-y-2">
                    <p className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm bg-claro px-3 py-2">{t.pregunta}</p>
                    {t.respuesta ? (
                      <div className="max-w-[95%] space-y-2 rounded-2xl rounded-bl-sm bg-niebla px-3 py-2">
                        <p className="whitespace-pre-line">{t.respuesta.texto}</p>
                        {t.respuesta.items && (
                          <ul className="space-y-1">
                            {t.respuesta.items.map((it) => (
                              <li key={it.href + it.label}>
                                <Link href={it.href} onClick={() => setOpen(false)} className="block rounded-md bg-white px-2 py-1.5 text-profundo hover:underline">
                                  {it.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                        {t.respuesta.enlace && (
                          <Link href={t.respuesta.enlace.href} onClick={() => setOpen(false)} className="inline-block font-semibold text-profundo underline">
                            {t.respuesta.enlace.label}
                          </Link>
                        )}
                      </div>
                    ) : (
                      <p className="w-fit rounded-2xl rounded-bl-sm bg-niebla px-3 py-2 text-noche/60">Consultando…</p>
                    )}
                  </div>
                ))}
                <div ref={fin} />
                <div className={clsx("space-y-3", turnos.length > 0 && "border-t border-noche/10 pt-3")}>
                  {grupo("datos", "Consultar datos")}
                  {grupo("ayuda", "Cómo se hace")}
                </div>
              </>
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
