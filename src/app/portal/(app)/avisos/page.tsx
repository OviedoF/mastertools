import Link from "next/link";
import clsx from "clsx";
import { AlertTriangle, Bell, CalendarClock, ClipboardList, UserCheck } from "lucide-react";
import { botonSuave, hace, MantaAvatar, tarjeta } from "@/components/portal/ui";
import { marcarAvisosLeidosAction } from "@/lib/portal/actions";
import { requireUser } from "@/lib/portal/auth";
import { listarAvisos } from "@/lib/portal/avisos";

export const metadata = { title: "Avisos" };

const ICONO: Record<string, typeof Bell> = {
  emergencia: AlertTriangle,
  solicitud: ClipboardList,
  asignacion: UserCheck,
  seguimiento: CalendarClock,
  resumen: Bell,
};

export default async function Avisos() {
  const u = await requireUser();
  const avisos = await listarAvisos(u.id);
  const sinLeer = avisos.filter((a) => !a.leido).length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-noche">Avisos</h1>
          <p className="text-sm text-gris">Solicitudes nuevas, casos que le asignan y seguimientos vencidos.</p>
        </div>
        {sinLeer > 0 && (
          <form action={marcarAvisosLeidosAction}>
            <button className={botonSuave}>Marcar todos como leídos ({sinLeer})</button>
          </form>
        )}
      </div>

      {avisos.length === 0 ? (
        <div className={`${tarjeta} flex flex-col items-center gap-3 py-10 text-center`}>
          <MantaAvatar mood="feliz" size={64} />
          <p className="font-semibold text-noche">No tiene avisos todavía.</p>
          <p className="max-w-sm text-sm text-noche/75">Cuando llegue una solicitud, le asignen un caso o venza un seguimiento, lo verá aquí.</p>
        </div>
      ) : (
        <ul className={`${tarjeta} divide-y divide-noche/10 !p-0`}>
          {avisos.map((a) => {
            const Icono = ICONO[a.tipo] ?? Bell;
            const contenido = (
              <>
                <span className={clsx("mt-0.5 grid size-9 shrink-0 place-items-center rounded-full", a.tipo === "emergencia" ? "bg-alerta text-noche" : "bg-claro text-profundo")}>
                  <Icono className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={clsx("block text-sm", a.leido ? "text-noche/80" : "font-semibold text-noche")}>{a.titulo}</span>
                  {a.detalle && <span className="block truncate text-sm text-noche/65">{a.detalle}</span>}
                  <span className="block text-xs text-gris">{hace(a.creado_en)}</span>
                </span>
                {!a.leido && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-profundo" aria-label="Sin leer" />}
              </>
            );
            return (
              <li key={a.id}>
                {/* prefetch desactivado: la ruta marca el aviso como leído y Next la precargaría al mostrar la lista */}
                <Link href={`/portal/avisos/ir/${a.id}`} prefetch={false} className="flex items-start gap-3 p-4 hover:bg-niebla">
                  {contenido}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
