import type { Metadata } from "next";
import Image from "next/image";

/**
 * Destino del enlace del WhatsApp de asignación (https://mastertools.tech/campo/s/<id>).
 * En un celular con la app instalada, Android/iOS abren la app directamente en el servicio
 * (ver docs/CAMPO.md). Esta página solo se ve si la app no está instalada o se abre en un computador.
 */
export const metadata: Metadata = {
  title: "Servicio asignado",
  robots: { index: false, follow: false },
};

export default function EnlaceServicio() {
  return (
    <main className="grid min-h-dvh place-items-center bg-noche px-5 py-10 text-white">
      <div className="w-full max-w-md text-center">
        <Image src="/marca/logo/logo_master_tools_negativo_sin_SAS.svg" alt="Master Tools" width={180} height={48} className="mx-auto h-12 w-auto" />
        <p className="eyebrow mt-4 text-master">Campo</p>
        <div className="mt-8 rounded-card bg-white p-6 text-left text-noche shadow-card">
          <h1 className="h3">Tiene un servicio asignado</h1>
          <p className="mt-3 text-noche/75">
            Abra este enlace desde su celular, con la app <strong>MT Campo</strong> instalada. La app le pedirá ingresar si no tiene la sesión
            abierta y lo llevará directo al servicio.
          </p>
          <p className="mt-3 text-sm text-noche/60">Si no tiene la app, pídasela al coordinador de operaciones.</p>
        </div>
      </div>
    </main>
  );
}
