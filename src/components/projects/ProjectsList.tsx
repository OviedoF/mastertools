"use client";

import { useState } from "react";
import clsx from "clsx";
import { projectFilters, type Project } from "@/content/projects";
import { ProjectCard } from "@/components/home/ProjectsPreview";

export function ProjectsList({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<string>("Todos");
  const list = filter === "Todos" ? projects : projects.filter((p) => p.serviceLabel === filter);
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por servicio">
        {["Todos", ...projectFilters].map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={active}
              className={clsx(
                "rounded-full border px-4 py-2 font-display text-sm font-semibold transition-colors",
                active
                  ? "border-noche bg-noche text-white"
                  : "border-noche/15 bg-white text-noche/80 hover:border-profundo hover:text-profundo",
              )}
            >
              {f}
            </button>
          );
        })}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProjectCard key={p.slug} p={p} />
        ))}
      </div>
      {list.length === 0 && (
        <p className="mt-8 rounded-card bg-niebla p-8 text-center text-noche/70">
          Todavía no publicamos casos de esta línea. Pregúntenos por WhatsApp y le contamos.
        </p>
      )}
    </div>
  );
}
