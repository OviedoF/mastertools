"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { Paperclip, Send } from "lucide-react";
import { site } from "@/content/site";
import { submitQuote, type QuoteState } from "@/app/contacto/actions";
import { Button } from "@/components/ui/Button";
import { Pending } from "@/components/ui/Pending";

const inputCls =
  "h-12 w-full rounded-xl border border-noche/15 bg-white px-4 text-[0.9375rem] text-noche placeholder:text-noche/40 focus:border-profundo focus:ring-0 aria-[invalid=true]:border-red-500";

function Field({
  label,
  name,
  error,
  children,
  optional,
  hint,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block font-display text-sm font-semibold text-noche">
        {label}
        {optional && <span className="ml-1 font-sans text-xs font-normal text-noche/50">(opcional)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-noche/55">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export type QuoteFormProps = {
  cities: string[];
  services: { slug: string; shortName: string }[];
  responseTime: string;
  responseTimePending: boolean;
};

export function QuoteForm({ cities, services, responseTime, responseTimePending }: QuoteFormProps) {
  const params = useSearchParams();
  const preset = params.get("servicio") ?? "";
  const [state, action, pending] = useActionState<QuoteState, FormData>(submitQuote, {});
  const [servicio, setServicio] = useState(preset);
  const [fileName, setFileName] = useState<string>("");
  const errors = state.errors ?? {};

  return (
    <form action={action} className="card relative p-6 md:p-8" noValidate>
      <h2 className="h2 text-noche">Solicite su cotización</h2>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-noche/75">
        Cuéntenos qué necesita y un ingeniero se comunicará con usted{" "}
        {responseTimePending ? <Pending inline>{responseTime}</Pending> : responseTime}. Si es una
        emergencia, no use este formulario: llame al{" "}
        <a href={`tel:${site.phone.tel}`} className="font-semibold text-noche">
          {site.phone.display}
        </a>
        .
      </p>

      {state.message && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      )}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Nombre y apellido" name="nombre" error={errors.nombre}>
          <input id="nombre" name="nombre" autoComplete="name" required className={inputCls} aria-invalid={!!errors.nombre} />
        </Field>
        <Field label="Empresa" name="empresa" error={errors.empresa} hint="Si es persona natural, escriba “Particular”.">
          <input id="empresa" name="empresa" autoComplete="organization" required className={inputCls} aria-invalid={!!errors.empresa} />
        </Field>
        <Field label="Teléfono o WhatsApp" name="telefono" error={errors.telefono}>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue="+57 "
            required
            className={inputCls}
            aria-invalid={!!errors.telefono}
          />
        </Field>
        <Field label="Correo electrónico" name="correo" error={errors.correo}>
          <input id="correo" name="correo" type="email" autoComplete="email" required className={inputCls} aria-invalid={!!errors.correo} />
        </Field>
        <Field label="Ciudad" name="ciudad" error={errors.ciudad}>
          <select id="ciudad" name="ciudad" required className={inputCls} defaultValue="" aria-invalid={!!errors.ciudad}>
            <option value="" disabled>
              Seleccione una ciudad
            </option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Otra">Otra</option>
          </select>
        </Field>
        <Field label="Servicio" name="servicio" error={errors.servicio}>
          <select
            id="servicio"
            name="servicio"
            required
            className={inputCls}
            value={servicio}
            onChange={(e) => setServicio(e.target.value)}
            aria-invalid={!!errors.servicio}
          >
            <option value="" disabled>
              Seleccione un servicio
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.shortName}
              </option>
            ))}
            <option value="otro">Otro</option>
          </select>
        </Field>
        <Field label="¿Para cuándo lo necesita?" name="plazo" optional>
          <select id="plazo" name="plazo" className={inputCls} defaultValue="">
            <option value="">Sin definir</option>
            <option>Esta semana</option>
            <option>Este mes</option>
            <option>Estoy averiguando</option>
          </select>
        </Field>
        <Field label="Adjuntar archivos" name="adjunto" optional error={errors.adjunto} hint="Fotos, planos o factura de energía. Máximo 10 MB.">
          <label
            htmlFor="adjunto"
            className={clsx(inputCls, "flex cursor-pointer items-center gap-2 text-noche/60 hover:border-profundo")}
          >
            <Paperclip className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{fileName || "Elegir archivo"}</span>
          </label>
          <input
            id="adjunto"
            name="adjunto"
            type="file"
            accept="image/*,.pdf,.dwg,.dxf"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Cuéntenos qué necesita" name="mensaje" optional>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={4}
              placeholder="Ejemplo: Tenemos un transformador de 500 kVA y necesitamos pruebas antes de energizar."
              className={clsx(inputCls, "h-auto py-3")}
            />
          </Field>
        </div>
      </div>

      {/* Trampa para bots: oculto a personas, los robots lo completan */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="sitio_web">Sitio web</label>
        <input id="sitio_web" name="sitio_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-noche/80">
          <input
            type="checkbox"
            name="autorizacion"
            value="si"
            required
            className="mt-1 size-4 shrink-0 accent-profundo"
            aria-invalid={!!errors.autorizacion}
          />
          <span>
            Autorizo a Master Tools & Services S.A.S. a tratar mis datos para
            responder esta solicitud, según su{" "}
            <Link href="/politica-de-tratamiento-de-datos" className="link">
              política de tratamiento de datos
            </Link>
            .
          </span>
        </label>
        {errors.autorizacion && (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            Necesitamos su autorización para contactarlo.
          </p>
        )}
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={pending} data-track="form_enviar">
          <Send className="size-5" aria-hidden="true" />
          {pending ? "Enviando…" : "Enviar solicitud"}
        </Button>
        <p className="text-xs text-noche/55">
          Le enviamos una confirmación a su correo. Sus datos solo se usan para responder esta solicitud.
        </p>
      </div>
    </form>
  );
}
