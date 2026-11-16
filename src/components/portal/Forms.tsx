"use client";

import { useActionState } from "react";
import { cambiarClaveAction, crearUsuarioAction, loginAction, reiniciarClaveAction, type FormState } from "@/lib/portal/actions";
import { ROLES } from "@/lib/portal/model";
import { boton, input } from "./ui";

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
