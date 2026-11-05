import type { Stat } from "@/content/site";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";

/** Respaldo en cifras (Inicio, bloque 2). */
export function Stats({ stats }: { stats: Stat[] }) {
  return (
    <section className="bg-noche bg-grid-noche text-white">
      <Reveal
        className="container-x grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4 md:py-16"
        stagger={0.1}
      >
        {stats.map((s) => (
          <div key={s.label} className="border-l-2 border-master/60 pl-4">
            <p className="font-display text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl">
              {"value" in s ? (
                <CountUp value={s.value} prefix={s.prefix ?? ""} />
              ) : (
                s.text
              )}
            </p>
            <p className="mt-2 text-sm text-white/75 md:text-[0.9375rem]">{s.label}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
