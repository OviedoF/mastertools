"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { SendHorizontal, X } from "lucide-react";
import { site } from "@/content/site";
import {
  detectEmergency,
  detectHuman,
  detectPrice,
  nodes,
  PRIVACY_NOTICE,
  type Ctx,
  type Mood,
  type Node,
  type Option,
} from "./flows";

type Msg =
  | { id: number; from: "manta"; text: string; notice?: boolean }
  | { id: number; from: "user"; text: string };

const AVATAR: Record<Mood, string> = {
  feliz: "/marca/manta/avatar_feliz_noche_128.png",
  contento: "/marca/manta/avatar_contento_noche_128.png",
  pensativo: "/marca/manta/avatar_pensativo_noche_128.png",
  serio: "/marca/manta/avatar_serio_noche_128.png",
};

let msgId = 0;

function resolve<T>(v: T | ((ctx: Ctx) => T), ctx: Ctx): T {
  return typeof v === "function" ? (v as (c: Ctx) => T)(ctx) : v;
}

function Avatar({ mood, size, className }: { mood: Mood; size: number; className?: string }) {
  return (
    <Image
      src={AVATAR[mood]}
      alt=""
      width={size}
      height={size}
      className={clsx("rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function MantaBubble() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [nodeId, setNodeId] = useState("start");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<Mood>("feliz");
  const [seen, setSeen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<string>("");
  const panelId = useId();

  // Conversación en texto plano, para adjuntarla al registro de la solicitud
  useEffect(() => {
    transcriptRef.current = messages
      .map((m) => `${m.from === "manta" ? "Manta" : "Cliente"}: ${m.text}`)
      .join("\n");
  }, [messages]);

  const ctx: Ctx = { answers, service: answers.service };
  const node: Node = nodes[nodeId] ?? nodes.start;
  const options = resolve<Option[] | undefined>(node.options, ctx) ?? [];

  // Cierra al cambiar de página (estado derivado de la ruta)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Scroll al final con cada mensaje
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Foco en el campo de texto cuando el nodo lo pide
  useEffect(() => {
    if (open && node.input && !typing) inputRef.current?.focus();
  }, [open, node, typing]);

  // Otros botones de la página pueden abrir el chat ("Reportar con Manta")
  useEffect(() => {
    const onOpen = (e: Event) => {
      const flow = (e as CustomEvent<{ flow?: string }>).detail?.flow;
      setOpen(true);
      setSeen(true);
      if (flow === "emergency") {
        setMessages([]);
        setAnswers({});
        goTo("em1", {});
      } else if (messages.length === 0) {
        goTo("start", {});
      }
    };
    document.addEventListener("manta:open", onOpen);
    return () => document.removeEventListener("manta:open", onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  function pushManta(text: string, notice?: boolean) {
    setMessages((m) => [...m, { id: ++msgId, from: "manta", text, notice }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { id: ++msgId, from: "user", text }]);
  }

  function goTo(id: string, nextAnswers: Record<string, string>) {
    const target = nodes[id] ?? nodes.notsure;
    const nextCtx: Ctx = { answers: nextAnswers, service: nextAnswers.service };
    setNodeId(id);
    setTyping(true);
    setMood("pensativo");
    const delay = 450 + Math.min(600, resolve(target.say, nextCtx).length * 6);
    window.setTimeout(() => {
      if (target.privacyNotice && !nextAnswers.__privacy) {
        pushManta(PRIVACY_NOTICE, true);
        nextAnswers.__privacy = "1";
        setAnswers({ ...nextAnswers });
      }
      pushManta(resolve(target.say, nextCtx));
      setMood(target.mood ?? "feliz");
      setTyping(false);
      if (target.submit) {
        // Registra la solicitud: aviso al equipo, confirmación y CRM (ver src/lib/leads.ts)
        const kind = target.submit;
        fetch("/api/leads", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind,
            answers: nextAnswers,
            transcript: transcriptRef.current,
            page: window.location.pathname,
          }),
          keepalive: true,
        })
          .then((r) => {
            if (!r.ok) throw new Error(String(r.status));
          })
          .catch(() => {
            pushManta(
              `No pude registrar su solicitud por un problema de conexión. Por favor llámenos o escríbanos por WhatsApp al ${site.phone.display}.`,
            );
          });
      }
    }, delay);
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setSeen(true);
      if (messages.length === 0) goTo("start", {});
    }
  }

  function choose(opt: Option) {
    if (opt.href) {
      pushUser(opt.label);
      window.open(opt.href, opt.href.startsWith("http") ? "_blank" : "_self");
      return;
    }
    const next = { ...answers };
    if (node.field && opt.value !== undefined && opt.value !== "__otra__") {
      next[node.field] = opt.value;
    }
    pushUser(opt.label);
    if (opt.next) goTo(opt.next, next);
  }

  function submitText() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    pushUser(text);
    const next = { ...answers };
    if (node.field) next[node.field] = text;
    setAnswers(next);
    // Palabras de urgencia activan el modo emergencia en cualquier momento
    if (!nodeId.startsWith("em") && detectEmergency(text)) {
      goTo("em1", next);
      return;
    }
    if (!node.input && detectPrice(text)) {
      goTo("price", next);
      return;
    }
    if (!node.input && detectHuman(text)) {
      goTo("human", next);
      return;
    }
    const nextId = node.next ? resolve(node.next, { answers: next, service: next.service }) : undefined;
    if (nextId) goTo(nextId, next);
    else if (!node.input) goTo("notsure", next);
  }

  function reset() {
    setMessages([]);
    setAnswers({});
    setNodeId("start");
    goTo("start", {});
  }

  const isEmergency = nodeId.startsWith("em");

  return (
    <>
      {/* Botón flotante. En celular queda por encima del botón de emergencia. */}
      <button
        type="button"
        onClick={toggle}
        data-track={open ? "chat_cerrar" : "chat_abrir"}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Cerrar el chat con Manta" : "Abrir el chat con Manta"}
        className={clsx(
          "fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex size-16 items-center justify-center rounded-full bg-noche shadow-[0_12px_32px_-8px_rgb(11_31_77/0.6)] ring-4 ring-white transition-transform duration-300 ease-(--ease-out-expo) hover:scale-105 md:right-6 md:bottom-6",
          !open && "motion-safe:animate-float",
        )}
      >
        {open ? (
          <X className="size-7 text-white" aria-hidden="true" />
        ) : (
          <Avatar mood="feliz" size={64} />
        )}
        {!open && !seen && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex size-4 items-center justify-center rounded-full bg-master ring-2 ring-white">
            <span className="size-2 rounded-full bg-white" />
          </span>
        )}
      </button>

      {/* Panel */}
      <div
        id={panelId}
        role="dialog"
        aria-label="Chat con Manta, asistente técnico de Master Tools"
        aria-hidden={!open}
        inert={!open}
        className={clsx(
          "fixed z-50 flex flex-col overflow-hidden bg-white shadow-[0_24px_64px_-16px_rgb(11_31_77/0.5)] ring-1 ring-noche/10 transition-[opacity,transform] duration-300 ease-(--ease-out-expo)",
          "inset-x-3 top-[88px] bottom-[calc(9.5rem+env(safe-area-inset-bottom))] rounded-3xl md:inset-auto md:right-6 md:bottom-28 md:h-[min(640px,calc(100vh-9rem))] md:w-[380px]",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 bg-noche px-4 py-3 text-white">
          <div key={mood} className="motion-safe:animate-rise">
            <Avatar mood={mood} size={44} className="ring-2 ring-master/60" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base leading-tight font-bold">Manta</p>
            <p className="text-xs text-white/70">Asistente técnico de Master Tools</p>
          </div>
          {isEmergency && <span className="chip chip-alerta">Emergencia</span>}
        </div>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-niebla px-4 py-4">
          {messages.map((m) =>
            m.from === "manta" ? (
              <div key={m.id} className="flex items-end gap-2">
                <Avatar mood={mood} size={28} className="shrink-0" />
                <div
                  className={clsx(
                    "max-w-[85%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[0.9375rem] leading-snug shadow-sm",
                    m.notice ? "bg-claro/70 text-noche/80" : "bg-white text-noche",
                  )}
                >
                  {m.text}
                  {m.notice && (
                    <>
                      {" "}
                      <Link href="/politica-de-tratamiento-de-datos" className="link">
                        Ver política
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-profundo px-3.5 py-2.5 text-[0.9375rem] leading-snug text-white shadow-sm">
                  {m.text}
                </div>
              </div>
            ),
          )}
          {typing && (
            <div className="flex items-end gap-2" aria-live="polite" aria-label="Manta está escribiendo">
              <Avatar mood="pensativo" size={28} className="shrink-0" />
              <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-bounce rounded-full bg-gris"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          {!typing && options.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 pl-9">
              {options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => choose(opt)}
                  className={clsx(
                    "rounded-full border px-3.5 py-2 font-display text-[0.8125rem] font-semibold transition-colors",
                    opt.tone === "emergency"
                      ? "border-alerta bg-alerta text-noche hover:bg-[#f2b600]"
                      : "border-profundo/60 bg-white text-profundo hover:bg-claro/60",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          className="flex items-center gap-2 border-t border-noche/10 bg-white px-3 py-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            submitText();
          }}
        >
          <input
            ref={inputRef}
            type={node.input === "tel" ? "tel" : node.input === "email" ? "email" : "text"}
            inputMode={node.input === "tel" ? "tel" : undefined}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={node.input ? (node.placeholder ?? "Escriba aquí") : "Escriba o elija una opción"}
            className="h-11 min-w-0 flex-1 rounded-xl bg-niebla px-3.5 text-[0.9375rem] text-noche placeholder:text-noche/45 focus:bg-white"
            aria-label="Mensaje para Manta"
            disabled={typing}
          />
          <button
            type="submit"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-profundo text-white hover:bg-[#00589a] disabled:opacity-50"
            aria-label="Enviar"
            disabled={typing || !input.trim()}
          >
            <SendHorizontal className="size-5" aria-hidden="true" />
          </button>
        </form>
        <div className="flex items-center justify-between gap-3 border-t border-noche/10 bg-white px-4 py-2 text-xs text-noche/60">
          <button type="button" className="link" onClick={() => goTo("human", answers)}>
            Hablar con una persona
          </button>
          <button type="button" className="hover:text-noche" onClick={reset}>
            Reiniciar
          </button>
          <span className="hidden sm:inline">
            Emergencias:{" "}
            <a href={`tel:${site.phone.tel}`} className="font-semibold text-noche">
              {site.phone.display}
            </a>
          </span>
        </div>
      </div>
    </>
  );
}
