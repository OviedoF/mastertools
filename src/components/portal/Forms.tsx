"use client";

import { useActionState } from "react";
import Link from "next/link";
import { actualizarDestinoAction, borrarDestinoAction, cambiarClaveAction, crearDestinoAction, crearUsuarioAction, guardarAjusteAction, loginAction, probarConexionAction, reiniciarClaveAction, restablecerClaveAction, solicitarRecuperacionAction, type FormState } from "@/lib/portal/actions";
import { ROLES } from "@/lib/portal/model";
import { boton, botonSuave, input } from "./ui";

function Mensaje({ s }: { s: FormState }) {
  if (!s) return null;
  return (
    <div role="status" className={`rounded-lg px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}>
      {s.error ?? s.ok}
      {s.clave && (
        <p className="mt-1">
          Contraseña temporal: <code className="rounded bg-white px-1.5 py-0.5 font-mono text-base select-all">{s.clave}</code>
        </p>
      )}
    </div>
  );
}

export function LoginForm() {
  const [s, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-semibold">
        Correo
        <input name="correo" type="email" autoComplete="username" required className={`${input} mt-1`} />
      </label>
      <label className="block text-sm font-semibold">
        Contraseña
        <input name="clave" type="password" autoComplete="current-password" required className={`${input} mt-1`} />
      </label>
      <Mensaje s={s} />
      <button className={`${boton} w-full`} disabled={pending}>
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
      <p className="text-center text-sm">
        <Link href="/portal/recuperar" className="font-semibold text-profundo underline-offset-2 hover:underline">
          ¿Olvidó su contraseña?
        </Link>
      </p>
    </form>
  );
}

export function RecuperarForm() {
  const [s, action, pending] = useActionState(solicitarRecuperacionAction, undefined);
  if (s?.ok) return <Mensaje s={s} />;
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-semibold">
        Correo de su cuenta
        <input name="correo" type="email" autoComplete="username" required className={`${input} mt-1`} />
      </label>
      <Mensaje s={s} />
      <button className={`${boton} w-full`} disabled={pending}>
        {pending ? "Enviando…" : "Enviarme el enlace"}
      </button>
    </form>
  );
}

export function RestablecerClaveForm({ token }: { token: string }) {
  const [s, action, pending] = useActionState(restablecerClaveAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-semibold">
        Nueva contraseña (mínimo 10 caracteres)
        <input name="nueva" type="password" autoComplete="new-password" minLength={10} required className={`${input} mt-1`} />
      </label>
      <label className="block text-sm font-semibold">
        Repita la contraseña
        <input name="repetir" type="password" autoComplete="new-password" minLength={10} required className={`${input} mt-1`} />
      </label>
      <Mensaje s={s} />
      <button className={`${boton} w-full`} disabled={pending}>
        {pending ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}

export function CambiarClaveForm() {
  const [s, action, pending] = useActionState(cambiarClaveAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-semibold">
        Nueva contraseña (mínimo 10 caracteres)
        <input name="nueva" type="password" autoComplete="new-password" minLength={10} required className={`${input} mt-1`} />
      </label>
      <label className="block text-sm font-semibold">
        Repita la contraseña
        <input name="repetir" type="password" autoComplete="new-password" minLength={10} required className={`${input} mt-1`} />
      </label>
      <Mensaje s={s} />
      <button className={`${boton} w-full`} disabled={pending}>
        Guardar contraseña
      </button>
    </form>
  );
}

export function CrearUsuarioForm() {
  const [s, action, pending] = useActionState(crearUsuarioAction, undefined);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_12rem_auto]">
      <input name="nombre" placeholder="Nombre completo" aria-label="Nombre completo" required className={input} />
      <input name="correo" type="email" placeholder="correo@mastertools.tech" aria-label="Correo" required className={input} />
      <select name="rol" aria-label="Rol" defaultValue="comercial" className={input}>
        {Object.entries(ROLES).map(([k, r]) => (
          <option key={k} value={k}>
            {r.label}
          </option>
        ))}
      </select>
      <button className={boton} disabled={pending}>
        Crear usuario
      </button>
      <div className="sm:col-span-2 lg:col-span-4">
        <Mensaje s={s} />
      </div>
    </form>
  );
}

export function ReiniciarClaveForm({ id }: { id: string }) {
  const [s, action, pending] = useActionState(reiniciarClaveAction, undefined);
  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <input type="hidden" name="id" value={id} />
      <button className="text-sm font-semibold text-profundo underline-offset-2 hover:underline disabled:opacity-60" disabled={pending}>
        Restablecer contraseña
      </button>
      <Mensaje s={s} />
    </form>
  );
}

export function AjusteForm({ clave, secreto, multilinea, valor, placeholder, definido }: {
  clave: string; secreto?: boolean; multilinea?: boolean; valor: string; placeholder?: string; definido: boolean;
}) {
  const [s, action, pending] = useActionState(guardarAjusteAction, undefined);
  const comun = {
    name: "valor", required: true, autoComplete: "off", spellCheck: false, "aria-label": clave,
    placeholder: secreto && definido ? "•••••••• guardado; escriba para reemplazar" : placeholder,
    className: `${input} ${multilinea ? "min-h-28 py-2 font-mono text-xs" : ""}`,
  };
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="clave" value={clave} />
      {multilinea ? <textarea {...comun} /> : <input {...comun} type={secreto ? "password" : "text"} defaultValue={secreto ? "" : valor} />}
      <div className="flex flex-wrap items-center gap-3">
        <button className={boton} disabled={pending}>{pending ? "Guardando…" : "Guardar"}</button>
        <Mensaje s={s} />
      </div>
    </form>
  );
}

export function ProbarForm({ que, etiqueta }: { que: "analytics" | "correo" | "whatsapp" | "recordatorio"; etiqueta: string }) {
  const [s, action, pending] = useActionState(probarConexionAction, undefined);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="que" value={que} />
      <button className={botonSuave} disabled={pending}>{pending ? "Probando…" : etiqueta}</button>
      <Mensaje s={s} />
    </form>
  );
}

/* ----------------------- WhatsApp: números que reciben el aviso ----------------------- */

type DestinoUI = { id: string; nombre: string; numero: string; cuando: "siempre" | "fuera_horario"; activo: boolean };

const legible = (n: string) => (n.startsWith("57") && n.length === 12 ? `+57 ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}` : `+${n}`);

function CamposDestino({ d }: { d?: DestinoUI }) {
  return (
    <>
      <input name="nombre" defaultValue={d?.nombre} placeholder="Nombre o turno" aria-label="Nombre o turno" required maxLength={80} className={input} />
      <input name="numero" defaultValue={d ? legible(d.numero) : ""} placeholder="+57 300 123 4567" aria-label="Número de WhatsApp" required inputMode="tel" className={input} />
      <select name="cuando" defaultValue={d?.cuando ?? "siempre"} aria-label="Cuándo recibe el aviso" className={input}>
        <option value="siempre">Siempre</option>
        <option value="fuera_horario">Solo fuera de horario</option>
      </select>
    </>
  );
}

export function AgregarDestinoForm() {
  const [s, action, pending] = useActionState(crearDestinoAction, undefined);
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_12rem_auto]">
      <CamposDestino />
      <button className={boton} disabled={pending}>{pending ? "Agregando…" : "Agregar"}</button>
      <div className="sm:col-span-2 lg:col-span-4"><Mensaje s={s} /></div>
    </form>
  );
}

export function DestinoFila({ d }: { d: DestinoUI }) {
  const [s, action, pending] = useActionState(actualizarDestinoAction, undefined);
  return (
    <li className={`py-3 ${d.activo ? "" : "opacity-60"}`}>
      <form action={action} className="grid items-center gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_12rem_auto_auto]">
        <input type="hidden" name="id" value={d.id} />
        <CamposDestino d={d} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="activo" defaultChecked={d.activo} className="size-4" />
          Activo
        </label>
        <button className={botonSuave} disabled={pending}>{pending ? "Guardando…" : "Guardar"}</button>
        {s && <div className="sm:col-span-2 lg:col-span-5"><Mensaje s={s} /></div>}
      </form>
      <form action={borrarDestinoAction} className="mt-1">
        <input type="hidden" name="id" value={d.id} />
        <button className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline">Quitar de la lista</button>
      </form>
    </li>
  );
}
