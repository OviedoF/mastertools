/** Esqueleto mientras llega la página del caso en una navegación. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando">
      <section className="bg-noche">
        <div className="container-x py-14 md:py-24">
          <div className="h-4 w-40 animate-pulse rounded bg-white/15" />
          <div className="mt-8 h-10 w-2/3 animate-pulse rounded bg-white/15" />
          <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-white/15" />
        </div>
      </section>
      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-8 w-48 animate-pulse rounded bg-noche/10" />
              <div className="mt-4 h-20 animate-pulse rounded-xl bg-niebla" />
            </div>
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-card bg-niebla" />
      </div>
    </div>
  );
}
