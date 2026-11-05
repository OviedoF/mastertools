/** Esqueleto mientras llega la página de servicio en una navegación. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando">
      <section className="bg-niebla">
        <div className="container-x grid gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-20">
          <div className="max-w-2xl animate-pulse">
            <div className="h-4 w-48 rounded bg-noche/10" />
            <div className="mt-8 h-10 w-full rounded bg-noche/10" />
            <div className="mt-3 h-10 w-3/4 rounded bg-noche/10" />
            <div className="mt-6 h-5 w-full rounded bg-noche/10" />
            <div className="mt-2 h-5 w-5/6 rounded bg-noche/10" />
            <div className="mt-8 flex gap-3">
              <div className="h-14 w-48 rounded-xl bg-noche/10" />
              <div className="h-14 w-56 rounded-xl bg-noche/10" />
            </div>
          </div>
          <div className="aspect-[4/3] animate-pulse rounded-card bg-noche/10 lg:aspect-[5/4]" />
        </div>
      </section>
      <div className="container-x py-16">
        <div className="h-8 w-56 animate-pulse rounded bg-noche/10" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-niebla" />
          ))}
        </div>
      </div>
    </div>
  );
}
